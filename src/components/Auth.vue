<template>
  <div class="auth-wrapper">
    <div v-if="!isConfigured" class="auth-disabled">
      <span class="disabled-text">云同步未配置</span>
    </div>
    <div v-else-if="loading" class="auth-loading">
      <span class="loading-text">加载中...</span>
    </div>
    <div v-else-if="!user" class="auth-form">
      <div v-if="isLogin" class="form-container">
        <h3 class="form-title">登录同步</h3>
        <div class="form-group">
          <input 
            v-model="email" 
            type="email" 
            placeholder="邮箱" 
            class="form-input"
            @keyup.enter="handleLogin"
          />
        </div>
        <div class="form-group">
          <input 
            v-model="password" 
            type="password" 
            placeholder="密码" 
            class="form-input"
            @keyup.enter="handleLogin"
          />
        </div>
        <button @click="handleLogin" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? '登录中...' : '登录' }}
        </button>
        <p class="form-switch" @click="isLogin = false">没有账号？注册</p>
      </div>
      <div v-else class="form-container">
        <h3 class="form-title">注册账号</h3>
        <div class="form-group">
          <input 
            v-model="email" 
            type="email" 
            placeholder="邮箱" 
            class="form-input"
            @keyup.enter="handleRegister"
          />
        </div>
        <div class="form-group">
          <input 
            v-model="password" 
            type="password" 
            placeholder="密码（至少6位）" 
            class="form-input"
            @keyup.enter="handleRegister"
          />
        </div>
        <button @click="handleRegister" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? '注册中...' : '注册' }}
        </button>
        <p class="form-switch" @click="isLogin = true">已有账号？登录</p>
        <p v-if="error" class="form-error" :class="{ 'is-success': errorType === 'success' }">{{ error }}</p>
      </div>
    </div>
    <div v-else class="auth-user">
      <span class="user-email">{{ user.email }}</span>
      <button @click="handleLogout" class="btn btn-logout">退出</button>
      <span class="sync-status" :class="syncStatus">{{ syncStatusText }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  supabase, 
  signIn, 
  signUp, 
  signOut, 
  getCurrentUser, 
  onAuthStateChange,
  handleAuthCallback,
  isSupabaseConfigured 
} from '../utils/supabase.js'

const emit = defineEmits(['login', 'logout'])

const user = ref(null)
const loading = ref(true)
const submitting = ref(false)
const isLogin = ref(true)
const email = ref('')
const password = ref('')
const error = ref('')
const errorType = ref('error') // 'error' | 'success'
const syncStatus = ref('idle')

const isConfigured = computed(() => isSupabaseConfigured())

function formatAuthError(err, action) {
  errorType.value = 'error'
  const msg = err?.message || ''
  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return `${action}失败：无法连接云服务。请检查网络后重试（项目可能因长期未活动被暂停）`
  }
  if (/invalid login/i.test(msg)) {
    return '邮箱或密码错误'
  }
  if (/already registered|already been registered/i.test(msg)) {
    return '该邮箱已注册，请直接登录'
  }
  if (/email not confirmed/i.test(msg)) {
    return '请先查收验证邮件并完成验证'
  }
  if (/rate limit|too many requests/i.test(msg)) {
    return '操作过于频繁，请稍后再试'
  }
  return `${action}失败：${msg || '请稍后重试'}`
}

const syncStatusText = computed(() => {
  switch (syncStatus.value) {
    case 'syncing': return '同步中'
    case 'synced': return '已同步'
    case 'error': return '同步失败'
    default: return ''
  }
})

onMounted(async () => {
  if (!isConfigured.value) {
    loading.value = false
    return
  }
  
  // 先处理回调（邮箱验证等）
  const callbackResult = await handleAuthCallback()
  if (callbackResult.success) {
    user.value = callbackResult.user
    emit('login', callbackResult.user)
  } else {
    // 没有回调时，获取当前用户
    const currentUser = await getCurrentUser()
    user.value = currentUser
  }
  
  loading.value = false
  
  onAuthStateChange((event, session) => {
    user.value = session?.user || null
    if (event === 'SIGNED_IN') {
      emit('login', session?.user)
    } else if (event === 'SIGNED_OUT') {
      emit('logout')
    }
  })
})

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = '请填写邮箱和密码'
    return
  }
  
  submitting.value = true
  error.value = ''
  
  const { data, error: err } = await signIn(email.value, password.value)

  submitting.value = false

  if (err) {
    error.value = formatAuthError(err, '登录')
    return
  }
  
  user.value = data.user
  emit('login', data.user)
  email.value = ''
  password.value = ''
}

async function handleRegister() {
  if (!email.value || !password.value) {
    error.value = '请填写邮箱和密码'
    return
  }

  if (password.value.length < 6) {
    error.value = '密码至少6位'
    return
  }

  submitting.value = true
  error.value = ''

  const { data, error: err } = await signUp(email.value, password.value)

  submitting.value = false

  if (err) {
    error.value = formatAuthError(err, '注册')
    return
  }

  if (data.user && !data.session) {
    error.value = '注册成功，请查收验证邮件'
    errorType.value = 'success'
    isLogin.value = true
  } else {
    user.value = data.user
    emit('login', data.user)
  }

  email.value = ''
  password.value = ''
}

async function handleLogout() {
  const { error: err } = await signOut()
  if (!err) {
    user.value = null
    emit('logout')
  }
}

function setSyncStatus(status) {
  syncStatus.value = status
}

defineExpose({
  setSyncStatus,
  user
})
</script>

<style scoped>
.auth-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.auth-disabled {
  padding: 6px var(--spacing-sm);
  background: var(--color-surface-sunken);
  border-radius: 999px;
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
}

.auth-loading {
  padding: 6px var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.auth-form {
  position: relative;
}

.form-container {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  z-index: 100;
  min-width: 280px;
}

@media (max-width: 575.98px) {
  .form-container {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    margin-top: 0;
    min-width: auto;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    border: none;
    box-shadow: 0 -8px 32px rgba(16, 24, 40, 0.16);
    padding: var(--spacing-xl) var(--spacing-lg);
    padding-bottom: max(var(--spacing-xl), env(safe-area-inset-bottom));
  }
}

.form-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
  text-align: center;
}

.form-group {
  margin-bottom: var(--spacing-sm);
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: 16px;
  box-sizing: border-box;
  color: var(--color-text);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  min-height: var(--touch-target-min);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}

.btn {
  padding: 10px var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: background-color var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
  min-height: var(--touch-target-min);
}

.btn-primary {
  width: 100%;
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-logout {
  padding: 6px var(--spacing-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.btn-logout:hover {
  background: var(--color-surface-sunken);
  color: var(--color-text);
}

.form-switch {
  margin: var(--spacing-sm) 0 0 0;
  text-align: center;
  color: var(--color-primary);
  cursor: pointer;
  font-size: var(--font-size-sm);
}

.form-switch:hover {
  text-decoration: underline;
}

.form-error {
  margin: var(--spacing-sm) 0 0 0;
  padding: 8px 12px;
  background: var(--color-danger-soft);
  color: var(--color-danger-dark);
  font-size: var(--font-size-xs);
  line-height: 1.5;
  text-align: center;
  border-radius: var(--radius-md);
}

.form-error.is-success {
  background: var(--color-success-soft);
  color: var(--color-success-darker);
}

.auth-user {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.user-email {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 575.98px) {
  .user-email {
    max-width: 100px;
    font-size: var(--font-size-xs);
  }
}

.sync-status {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.sync-status.idle {
  display: none;
}

.sync-status.syncing {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.sync-status.synced {
  background: var(--color-success-soft);
  color: var(--color-success-darker);
}

.sync-status.error {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}
</style>

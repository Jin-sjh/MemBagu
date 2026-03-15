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
        <p v-if="error" class="form-error">{{ error }}</p>
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
        <p v-if="error" class="form-error">{{ error }}</p>
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
const syncStatus = ref('idle')

const isConfigured = computed(() => isSupabaseConfigured())

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
  
  const currentUser = await getCurrentUser()
  user.value = currentUser
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
    error.value = err.message || '登录失败'
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
    error.value = err.message || '注册失败'
    return
  }
  
  if (data.user && !data.session) {
    error.value = '注册成功，请查收验证邮件'
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
  gap: 12px;
}

.auth-disabled {
  padding: 6px 12px;
  background: #f0f0f0;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #999;
}

.auth-loading {
  padding: 6px 12px;
  font-size: 0.8rem;
  color: #666;
}

.auth-form {
  position: relative;
}

.form-container {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 280px;
}

.form-title {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  color: #2c3e50;
  text-align: center;
}

.form-group {
  margin-bottom: 12px;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-primary {
  width: 100%;
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-logout {
  padding: 6px 12px;
  background: #f0f0f0;
  color: #666;
  font-size: 0.8rem;
}

.btn-logout:hover {
  background: #e0e0e0;
}

.form-switch {
  margin: 12px 0 0 0;
  text-align: center;
  color: #3498db;
  cursor: pointer;
  font-size: 0.85rem;
}

.form-switch:hover {
  text-decoration: underline;
}

.form-error {
  margin: 12px 0 0 0;
  color: #e74c3c;
  font-size: 0.85rem;
  text-align: center;
}

.auth-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-email {
  font-size: 0.85rem;
  color: #2c3e50;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sync-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
}

.sync-status.idle {
  display: none;
}

.sync-status.syncing {
  background: #e8f4fd;
  color: #3498db;
}

.sync-status.synced {
  background: #e8f8f0;
  color: #27ae60;
}

.sync-status.error {
  background: #fde8e8;
  color: #e74c3c;
}

@media (max-width: 600px) {
  .user-email {
    max-width: 100px;
  }
  
  .form-container {
    right: -20px;
  }
}
</style>

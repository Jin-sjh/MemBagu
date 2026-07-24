<template>
  <div class="library-manager">
    <div class="manager-header">
      <h2>题库管理</h2>
      <button class="create-btn" @click="showCreateForm = true">+ 新建题库</button>
    </div>

    <div class="library-list">
      <div 
        v-for="lib in libraries" 
        :key="lib.id"
        class="library-card"
      >
        <div class="card-header">
          <span class="library-color" :style="{ backgroundColor: lib.color }"></span>
          <h3 class="library-name">{{ lib.name }}</h3>
          <span class="library-id">{{ lib.id }}</span>
        </div>
        
        <p class="library-desc" v-if="lib.description">{{ lib.description }}</p>
        
        <div class="library-stats">
          <div class="stat-item">
            <span class="stat-value">{{ getQuestionCount(lib.id) }}</span>
            <span class="stat-label">题目</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ getLearnedCount(lib.id) }}</span>
            <span class="stat-label">已学</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ formatDate(lib.createdAt) }}</span>
            <span class="stat-label">创建时间</span>
          </div>
        </div>

        <div class="card-actions">
          <button 
            class="action-btn switch-btn" 
            v-if="lib.id !== activeLibraryId"
            @click="handleSwitch(lib.id)"
          >
            切换
          </button>
          <span class="current-label" v-else>当前库</span>
          <button 
            class="action-btn delete-btn" 
            @click="confirmDelete(lib)"
            :disabled="libraries.length <= 1"
          >
            删除
          </button>
        </div>
      </div>
    </div>

    <div class="create-form-overlay" v-if="showCreateForm" @click.self="closeCreateForm">
      <div class="create-form">
        <h3>新建题库</h3>
        
        <div class="form-group">
          <label>题库名称 *</label>
          <input 
            v-model="newLibrary.name" 
            type="text" 
            placeholder="如：Python八股库"
          />
        </div>

        <div class="form-group">
          <label>库ID *</label>
          <input 
            v-model="newLibrary.id" 
            type="text" 
            placeholder="如：python（用于目录名）"
          />
          <p class="form-hint">将创建 src/data/{{ newLibrary.id || 'xxx' }}/ 目录（需启动后端服务）</p>
        </div>

        <div class="form-group">
          <label>描述</label>
          <textarea 
            v-model="newLibrary.description" 
            placeholder="题库简介（可选）"
            rows="2"
          ></textarea>
        </div>

        <div class="form-group">
          <label>主题色</label>
          <div class="color-picker">
            <div 
              v-for="color in colorOptions" 
              :key="color"
              :class="['color-option', { active: newLibrary.color === color }]"
              :style="{ backgroundColor: color }"
              @click="newLibrary.color = color"
            ></div>
          </div>
        </div>

        <div class="form-actions">
          <button class="cancel-btn" @click="closeCreateForm">取消</button>
          <button class="submit-btn" @click="handleCreate" :disabled="!isFormValid">创建</button>
        </div>
      </div>
    </div>

    <div class="confirm-overlay" v-if="deleteTarget" @click.self="deleteTarget = null">
      <div class="confirm-dialog">
        <h3>确认删除</h3>
        <p>确定要删除「{{ deleteTarget.name }}」吗？</p>
        <p class="warning">此操作将清除该库的所有学习进度，且不可恢复！</p>
        <div class="confirm-actions">
          <button class="cancel-btn" @click="deleteTarget = null">取消</button>
          <button class="delete-btn" @click="handleDelete">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  libraries: {
    type: Array,
    default: () => []
  },
  activeLibraryId: {
    type: String,
    default: 'frontend'
  },
  questionCounts: {
    type: Object,
    default: () => ({})
  },
  learnedCounts: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['create', 'delete', 'switch'])

const showCreateForm = ref(false)
const deleteTarget = ref(null)

const newLibrary = ref({
  name: '',
  id: '',
  description: '',
  color: '#3498db'
})

const colorOptions = [
  '#3498db', '#e74c3c', '#2ecc71', '#f39c12',
  '#9b59b6', '#1abc9c', '#e67e22', '#34495e',
  '#16a085', '#c0392b', '#8e44ad', '#27ae60'
]

const isFormValid = computed(() => {
  return newLibrary.value.name.trim() && 
         newLibrary.value.id.trim() && 
         /^[a-zA-Z0-9_-]+$/.test(newLibrary.value.id)
})

function getQuestionCount(libraryId) {
  return props.questionCounts[libraryId] || 0
}

function getLearnedCount(libraryId) {
  return props.learnedCounts[libraryId] || 0
}

function formatDate(timestamp) {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function closeCreateForm() {
  showCreateForm.value = false
  newLibrary.value = {
    name: '',
    id: '',
    description: '',
    color: '#3498db'
  }
}

function handleCreate() {
  if (!isFormValid.value) return
  
  emit('create', { ...newLibrary.value })
  closeCreateForm()
}

function confirmDelete(lib) {
  deleteTarget.value = lib
}

function handleDelete() {
  if (deleteTarget.value) {
    emit('delete', deleteTarget.value.id)
    deleteTarget.value = null
  }
}

function handleSwitch(id) {
  emit('switch', id)
}
</script>

<style scoped>
.library-manager {
  padding: 0;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.manager-header h2 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.create-btn {
  padding: 8px 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: background-color var(--transition-fast), transform var(--transition-fast);
}

.create-btn:hover {
  background: var(--color-primary-dark);
}

.create-btn:active {
  transform: scale(0.98);
}

.library-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.library-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
}

.library-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.library-color {
  width: 14px;
  height: 14px;
  border-radius: 4px;
}

.library-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  flex: 1;
}

.library-id {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  background: var(--color-surface-sunken);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.library-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 16px 0;
}

.library-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
}

.card-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.action-btn {
  padding: 6px 14px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}

.switch-btn {
  background: var(--color-surface);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.switch-btn:hover {
  background: var(--color-primary-soft);
}

.delete-btn {
  background: var(--color-surface);
  border-color: var(--color-border-strong);
  color: var(--color-text-secondary);
}

.delete-btn:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
  background: var(--color-danger-soft);
}

.action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.action-btn:disabled:hover {
  border-color: var(--color-border-strong);
  color: var(--color-text-secondary);
  background: var(--color-surface);
}

.current-label {
  font-size: var(--font-size-xs);
  color: var(--color-success-darker);
  font-weight: 600;
  background: var(--color-success-soft);
  padding: 4px 10px;
  border-radius: 999px;
}

.create-form-overlay,
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-md);
}

.create-form,
.confirm-dialog {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-lg);
}

.create-form h3,
.confirm-dialog h3 {
  margin: 0 0 20px 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 6px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  box-sizing: border-box;
  color: var(--color-text);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}

.form-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
  margin: 6px 0 0 0;
}

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-option {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform var(--transition-fast);
}

.color-option:hover {
  transform: scale(1.08);
}

.color-option.active {
  border-color: var(--color-surface);
  box-shadow: 0 0 0 2px var(--color-text);
}

.form-actions,
.confirm-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.cancel-btn {
  padding: 10px 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.cancel-btn:hover {
  background: var(--color-surface-sunken);
  color: var(--color-text);
}

.submit-btn {
  padding: 10px 20px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: background-color var(--transition-fast);
}

.submit-btn:hover {
  background: var(--color-primary-dark);
}

.submit-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.confirm-dialog p {
  margin: 0 0 8px 0;
  color: var(--color-text);
}

.confirm-dialog .warning {
  color: var(--color-danger);
  font-size: var(--font-size-sm);
}

.confirm-dialog .delete-btn {
  padding: 10px 20px;
  font-size: var(--font-size-sm);
  background: var(--color-danger);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  cursor: pointer;
  font-weight: 500;
  transition: background-color var(--transition-fast);
}

.confirm-dialog .delete-btn:hover {
  background: var(--color-danger-dark);
}
</style>

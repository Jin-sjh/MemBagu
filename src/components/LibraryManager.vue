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
  margin-bottom: 24px;
}

.manager-header h2 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin: 0;
}

.create-btn {
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.create-btn:hover {
  background: #2980b9;
}

.library-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.library-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e8e8e8;
  transition: all 0.2s;
}

.library-card:hover {
  border-color: #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.library-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.library-name {
  font-size: 1.1rem;
  color: #2c3e50;
  margin: 0;
  flex: 1;
}

.library-id {
  font-size: 0.8rem;
  color: #7f8c8d;
  background: #e8e8e8;
  padding: 2px 8px;
  border-radius: 4px;
}

.library-desc {
  font-size: 0.9rem;
  color: #7f8c8d;
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
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
}

.stat-label {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.card-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.action-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.switch-btn {
  background: #3498db;
  color: white;
}

.switch-btn:hover {
  background: #2980b9;
}

.delete-btn {
  background: #e74c3c;
  color: white;
}

.delete-btn:hover {
  background: #c0392b;
}

.action-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.current-label {
  font-size: 0.85rem;
  color: #27ae60;
  font-weight: 500;
}

.create-form-overlay,
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.create-form,
.confirm-dialog {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
}

.create-form h3,
.confirm-dialog h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  color: #2c3e50;
  margin-bottom: 6px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.form-hint {
  font-size: 0.8rem;
  color: #7f8c8d;
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
  border-radius: 6px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: #2c3e50;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #2c3e50;
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
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.cancel-btn:hover {
  background: #e8e8e8;
}

.submit-btn {
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.submit-btn:hover {
  background: #2980b9;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.confirm-dialog p {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.confirm-dialog .warning {
  color: #e74c3c;
  font-size: 0.9rem;
}

.confirm-dialog .delete-btn {
  padding: 10px 20px;
  font-size: 0.9rem;
}
</style>

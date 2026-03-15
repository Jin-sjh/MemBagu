<template>
  <div class="review-list">
    <div class="review-header">
      <h2>{{ headerTitle }}</h2>
      <span class="count">{{ questions.length }} 题</span>
    </div>
    
    <div class="list" v-if="questions.length > 0">
      <div 
        v-for="question in questions" 
        :key="question.id"
        class="review-item"
        :class="getStatusClass(question.id)"
      >
        <div class="item-header">
          <span class="category">{{ question.category }}</span>
          <span class="status">{{ getStatusText(question.id) }}</span>
        </div>
        <div class="item-question">{{ question.question }}</div>
        <div class="item-actions">
          <button class="btn btn-small" @click="startReview(question)">
            开始复习
          </button>
        </div>
      </div>
    </div>
    
    <div class="empty" v-else>
      <div class="empty-icon">🎉</div>
      <p>太棒了！暂无待复习题目</p>
      <p class="hint">去"学习"页面开始学习新题目吧</p>
    </div>
    
    <div class="review-modal" v-if="currentQuestion">
      <div class="modal-content">
        <button class="close-btn" @click="closeReview">×</button>
        <div class="modal-header">
          <span class="progress-indicator">
            {{ currentIndex + 1 }} / {{ questions.length }}
          </span>
        </div>
        <QuestionCard 
          :question="currentQuestion"
          :progress="getProgress(currentQuestion.id)"
          :showNavigation="false"
          :fullscreen="true"
          @answer="handleAnswer"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import QuestionCard from './QuestionCard.vue'
import { getDueStatus, formatTimeRemaining } from '../composables/useEbbinghaus'

const props = defineProps({
  questions: {
    type: Array,
    default: () => []
  },
  progress: {
    type: Object,
    default: () => ({})
  },
  selectedCategory: {
    type: String,
    default: 'all'
  }
})

const emit = defineEmits(['review'])

const currentQuestion = ref(null)
const currentIndex = ref(0)

const headerTitle = computed(() => {
  if (props.selectedCategory === 'all') {
    return '今日待复习'
  }
  return `${props.selectedCategory} 待复习`
})

function getProgress(questionId) {
  return props.progress[questionId] || null
}

function getStatusClass(questionId) {
  const progress = props.progress[questionId]
  if (!progress) return 'status-new'
  return `status-${getDueStatus(progress.nextReviewTime)}`
}

function getStatusText(questionId) {
  const progress = props.progress[questionId]
  if (!progress) return '新题目'
  return formatTimeRemaining(progress.nextReviewTime)
}

function startReview(question) {
  currentQuestion.value = question
  currentIndex.value = props.questions.findIndex(q => q.id === question.id)
}

function closeReview() {
  currentQuestion.value = null
  currentIndex.value = 0
}

function handleAnswer({ questionId, remembered }) {
  emit('review', { questionId, remembered })
  
  const idx = props.questions.findIndex(q => q.id === questionId)
  if (idx !== -1) {
    setTimeout(() => {
      if (currentQuestion.value && currentQuestion.value.id === questionId) {
        if (idx < props.questions.length - 1) {
          currentQuestion.value = props.questions[idx + 1]
          currentIndex.value = idx + 1
        } else {
          closeReview()
        }
      }
    }, 300)
  }
}
</script>

<style scoped>
.review-list {
  min-height: 300px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.review-header h2 {
  font-size: 1.3rem;
  color: #2c3e50;
}

.count {
  background: #e74c3c;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #3498db;
  transition: all 0.2s;
}

.review-item:hover {
  background: #f0f1f2;
}

.review-item.status-new {
  border-left-color: #27ae60;
}

.review-item.status-overdue {
  border-left-color: #e74c3c;
}

.review-item.status-soon {
  border-left-color: #f39c12;
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.category {
  font-size: 0.85rem;
  color: #3498db;
  font-weight: 500;
}

.status {
  font-size: 0.85rem;
  color: #7f8c8d;
}

.item-question {
  font-size: 1rem;
  color: #2c3e50;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-actions {
  margin-top: 12px;
  text-align: right;
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-small {
  background: #3498db;
  color: white;
  padding: 6px 16px;
}

.btn-small:hover {
  background: #2980b9;
}

.empty {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty p {
  color: #7f8c8d;
  margin-bottom: 8px;
}

.hint {
  font-size: 0.9rem;
  color: #95a5a6 !important;
}

.review-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 0;
}

.modal-content {
  background: white;
  border-radius: 0;
  max-width: 100%;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  position: relative;
  display: flex;
  flex-direction: column;
}

.close-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  font-size: 1.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  z-index: 1001;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.2);
  color: #333;
  transform: scale(1.1);
}

.modal-header {
  padding: 20px 60px 0;
  text-align: center;
}

.progress-indicator {
  display: inline-block;
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.95rem;
  font-weight: 500;
}
</style>

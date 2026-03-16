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
  margin-bottom: var(--spacing-lg);
}

@media (max-width: 575.98px) {
  .review-header {
    margin-bottom: var(--spacing-md);
  }
}

.review-header h2 {
  font-size: clamp(1.1rem, 3vw, 1.3rem);
  color: var(--color-text);
}

.count {
  background: var(--color-danger);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: var(--font-size-sm);
}

.list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.review-item {
  background: var(--color-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  border-left: 4px solid var(--color-primary);
  transition: all 0.2s;
}

@media (max-width: 575.98px) {
  .review-item {
    padding: var(--spacing-sm) var(--spacing-md);
  }
}

.review-item:hover {
  background: #f0f1f2;
}

.review-item.status-new {
  border-left-color: var(--color-success);
}

.review-item.status-overdue {
  border-left-color: var(--color-danger);
}

.review-item.status-soon {
  border-left-color: var(--color-warning);
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.category {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  font-weight: 500;
}

.status {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.item-question {
  font-size: var(--font-size-base);
  color: var(--color-text);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-actions {
  margin-top: var(--spacing-sm);
  text-align: right;
}

.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: all 0.2s;
  min-height: var(--touch-target-min);
}

.btn-small {
  background: var(--color-primary);
  color: white;
  padding: 6px 16px;
}

.btn-small:hover {
  background: var(--color-primary-dark);
}

.empty {
  text-align: center;
  padding: 60px var(--spacing-lg);
}

@media (max-width: 575.98px) {
  .empty {
    padding: 40px var(--spacing-md);
  }
}

.empty-icon {
  font-size: clamp(3rem, 10vw, 4rem);
  margin-bottom: var(--spacing-md);
}

.empty p {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
}

.hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-light) !important;
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

@media (max-width: 767.98px) {
  .review-modal {
    align-items: stretch;
  }
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

@media (min-width: 768px) {
  .modal-content {
    max-width: 90%;
    width: 90%;
    max-height: 90vh;
    height: auto;
    border-radius: var(--radius-lg);
  }
}

@media (min-width: 992px) {
  .modal-content {
    max-width: 80%;
    width: 80%;
  }
}

@media (min-width: 1200px) {
  .modal-content {
    max-width: 70%;
    width: 70%;
  }
}

.close-btn {
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
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
  min-height: var(--touch-target-min);
  min-width: var(--touch-target-min);
}

@media (max-width: 575.98px) {
  .close-btn {
    top: var(--spacing-sm);
    right: var(--spacing-sm);
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.2);
  color: #333;
  transform: scale(1.1);
}

.modal-header {
  padding: var(--spacing-lg) 60px 0;
  text-align: center;
}

@media (max-width: 767.98px) {
  .modal-header {
    padding: var(--spacing-lg) var(--spacing-lg) 0;
  }
}

@media (max-width: 575.98px) {
  .modal-header {
    padding: var(--spacing-md) var(--spacing-md) 0;
  }
}

.progress-indicator {
  display: inline-block;
  background: rgba(52, 152, 219, 0.1);
  color: var(--color-primary);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: 20px;
  font-size: var(--font-size-sm);
  font-weight: 500;
}

@media (max-width: 575.98px) {
  .progress-indicator {
    padding: 6px var(--spacing-md);
    font-size: var(--font-size-xs);
  }
}
</style>

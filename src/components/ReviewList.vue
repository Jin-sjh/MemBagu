<template>
  <div class="review-list">
    <div class="review-header">
      <h2>{{ headerTitle }}</h2>
      <span class="count">{{ questions.length }} 题</span>
    </div>

    <div class="pool-status-bar" v-if="!examReviewMode">
      <div
        v-for="pool in poolBars"
        :key="pool.key"
        class="pool-chip"
        :class="[{ active: pool.key === currentPoolKey }, pool.key]"
      >
        <span class="pool-label">{{ pool.label }}</span>
        <span class="pool-num">{{ pool.count }}</span>
      </div>
    </div>

    <div class="exam-banner" v-if="examReviewMode">
      <span>考前总复习模式 · 仅显示已掌握的题</span>
      <button class="btn-exit" @click="$emit('exitExam')">退出总复习</button>
    </div>
    
    <div class="list" v-if="questions.length > 0">
      <div 
        v-for="question in questions" 
        :key="question.id"
        class="review-item"
        :class="getItemClass(question.id)"
      >
        <div class="item-header">
          <span class="category">{{ question.category }}</span>
          <span class="status">{{ getItemStatus(question.id) }}</span>
        </div>
        <div class="item-question">{{ question.question }}</div>
        <div class="item-actions">
          <button class="btn btn-small" @click="startReview(question)">
            开始复习
          </button>
        </div>
      </div>
    </div>
    
    <div class="empty" v-else-if="!examReviewMode">
      <div class="empty-icon">🎉</div>
      <p>太棒了！暂无待复习题目</p>
      <p class="hint" v-if="poolStats.mastered > 0">已掌握 {{ poolStats.mastered }} 题，可去统计页开启考前总复习</p>
      <p class="hint" v-else>去"学习"页面开始学习新题目吧</p>
    </div>

    <div class="empty" v-else>
      <div class="empty-icon">✅</div>
      <p>还没有已掌握的题</p>
      <p class="hint">先把题目刷到连续答对 2 次再来总复习</p>
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
import { getPool } from '../composables/useEbbinghaus'

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
  },
  poolStats: {
    type: Object,
    default: () => ({ hotWrong: 0, pending: 0, coldWrong: 0, new: 0, mastered: 0 })
  },
  examReviewMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['review', 'exitExam'])

const currentQuestion = ref(null)
const currentIndex = ref(0)

const headerTitle = computed(() => {
  if (props.examReviewMode) return '考前总复习'
  if (props.selectedCategory === 'all') return '今日复习'
  return `${props.selectedCategory} 复习`
})

const poolBars = computed(() => [
  { key: 'hotWrong', label: '热错题', count: props.poolStats.hotWrong },
  { key: 'pending', label: '待确认', count: props.poolStats.pending },
  { key: 'coldWrong', label: '冷错题', count: props.poolStats.coldWrong },
  { key: 'new', label: '新题', count: props.poolStats.new }
])

// 当前正在做的池子：队列里第一道题所属的池
const currentPoolKey = computed(() => {
  if (props.questions.length === 0) return null
  return getPool(props.progress[props.questions[0].id])
})

function getProgress(questionId) {
  return props.progress[questionId] || null
}

function getItemClass(questionId) {
  const pool = getPool(props.progress[questionId])
  return `pool-${pool}`
}

function getItemStatus(questionId) {
  const pool = getPool(props.progress[questionId])
  const map = {
    hotWrong: '热错题',
    pending: '待确认',
    coldWrong: '冷错题',
    new: '新题',
    mastered: '已掌握',
    dormant: '已学'
  }
  return map[pool] || '新题'
}

function startReview(question) {
  currentQuestion.value = question
  currentIndex.value = props.questions.findIndex(q => q.id === question.id)
}

function closeReview() {
  currentQuestion.value = null
  currentIndex.value = 0
}

function handleAnswer({ questionId, grade }) {
  emit('review', { questionId, grade })
  
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
  margin-bottom: var(--spacing-md);
}

.review-header h2 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text);
}

.count {
  background: var(--color-danger-soft);
  color: var(--color-danger-dark);
  padding: 2px 12px;
  border-radius: 999px;
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.pool-status-bar {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.pool-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: var(--font-size-xs);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}

.pool-chip .pool-num {
  font-weight: 700;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

.pool-chip.active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
}

.pool-chip.hotWrong .pool-num { color: var(--color-danger); }
.pool-chip.pending .pool-num { color: var(--color-warning-dark); }
.pool-chip.coldWrong .pool-num { color: var(--color-purple); }
.pool-chip.new .pool-num { color: var(--color-success-dark); }

.exam-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  background: var(--color-primary-soft);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-lg);
  color: var(--color-text);
  font-weight: 500;
  flex-wrap: wrap;
}

.btn-exit {
  padding: 6px 16px;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-primary);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 500;
  min-height: var(--touch-target-min);
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.btn-exit:hover {
  background: var(--color-primary);
  color: white;
}

.list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.review-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
}

@media (max-width: 575.98px) {
  .review-item {
    padding: var(--spacing-sm) var(--spacing-md);
  }
}

.review-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.review-item.pool-hotWrong {
  border-left-color: var(--color-danger);
}

.review-item.pool-pending {
  border-left-color: var(--color-warning);
}

.review-item.pool-coldWrong {
  border-left-color: var(--color-purple);
}

.review-item.pool-new {
  border-left-color: var(--color-success);
}

.review-item.pool-mastered {
  border-left-color: var(--color-primary);
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.category {
  font-size: var(--font-size-xs);
  color: var(--color-primary);
  font-weight: 500;
}

.status {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
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
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
  min-height: var(--touch-target-min);
}

.btn-small {
  background: var(--color-surface);
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  font-weight: 500;
  padding: 6px 16px;
}

.btn-small:hover {
  background: var(--color-primary-soft);
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
  font-size: clamp(2.5rem, 8vw, 3.5rem);
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
  background: rgba(15, 23, 42, 0.45);
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
  background: var(--color-surface);
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
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
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
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 50%;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  z-index: 1001;
  transition: background-color var(--transition-fast), color var(--transition-fast);
  min-height: var(--touch-target-min);
  min-width: var(--touch-target-min);
  box-shadow: var(--shadow-sm);
}

@media (max-width: 575.98px) {
  .close-btn {
    top: var(--spacing-sm);
    right: var(--spacing-sm);
  }
}

.close-btn:hover {
  background: var(--color-surface-sunken);
  color: var(--color-text);
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
  background: var(--color-primary-soft);
  color: var(--color-primary);
  padding: 4px var(--spacing-md);
  border-radius: 999px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 575.98px) {
  .progress-indicator {
    padding: 4px var(--spacing-sm);
  }
}
</style>

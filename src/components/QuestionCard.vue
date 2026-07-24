<template>
  <div class="question-card" :class="{ 'fullscreen-mode': fullscreen }" v-if="question">
    <div class="question-header">
      <span class="category">{{ question.category }}</span>
      <span class="topic">{{ question.topic }}</span>
      <span class="keypoints-badge" v-if="!showAnswer && keyPointsCount > 0">
        共 {{ keyPointsCount }} 个要点
      </span>
      <span class="progress-badge" v-if="progress && progress.streak !== undefined">
        连续答对 {{ progress.streak }} 次
      </span>
    </div>
    
    <div class="content-wrapper">
      <div class="question-content">
        <h3 class="question-title">问题</h3>
        <div class="question-text markdown-body" v-html="renderMarkdown(question.question)"></div>
      </div>
      
      <div class="answer-section" v-if="showAnswer">
        <h3 class="answer-title">答案</h3>
        <div class="answer-text markdown-body" v-html="renderMarkdown(question.answer)"></div>
      </div>
    </div>
    
    <div class="actions">
      <template v-if="!showAnswer">
        <button class="btn btn-primary" @click="showAnswer = true">
          显示答案
        </button>
      </template>
      <template v-else>
        <button class="btn btn-danger" @click="handleAnswer(0)">
          不会
        </button>
        <button class="btn btn-warning" @click="handleAnswer(1)">
          模糊
        </button>
        <button class="btn btn-success" @click="handleAnswer(2)">
          会
        </button>
      </template>
    </div>
    
    <div class="navigation" v-if="showNavigation">
      <button class="btn btn-secondary" @click="$emit('prev')" :disabled="!canPrev">
        上一题
      </button>
      <span class="page-info">{{ currentIndex + 1 }} / {{ total }}</span>
      <button class="btn btn-secondary" @click="$emit('next')" :disabled="!canNext">
        下一题
      </button>
    </div>
  </div>
  
  <div class="empty-state" v-else>
    <p>暂无题目</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { renderMarkdown } from '../utils/markdown'

const props = defineProps({
  question: {
    type: Object,
    default: null
  },
  progress: {
    type: Object,
    default: null
  },
  showNavigation: {
    type: Boolean,
    default: true
  },
  fullscreen: {
    type: Boolean,
    default: false
  },
  currentIndex: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  canPrev: {
    type: Boolean,
    default: true
  },
  canNext: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['answer', 'next', 'prev'])

const showAnswer = ref(false)

const keyPointsCount = computed(() => props.question?.keyPointsCount || 0)

function handleAnswer(grade) {
  emit('answer', {
    questionId: props.question.id,
    grade
  })
  showAnswer.value = false
}
</script>

<style scoped>
.question-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

@media (max-width: 575.98px) {
  .question-card {
    padding: var(--spacing-md);
    border-radius: var(--radius-lg);
  }
}

.question-card.fullscreen-mode {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 40px 60px;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  overflow-y: auto;
  border: none;
  box-shadow: none;
  border-radius: 0;
}

@media (max-width: 767.98px) {
  .question-card.fullscreen-mode {
    padding: var(--spacing-lg);
    max-width: 100%;
  }
}

@media (max-width: 575.98px) {
  .question-card.fullscreen-mode {
    padding: var(--spacing-md);
  }
}

@media (min-width: 1200px) {
  .question-card.fullscreen-mode {
    max-width: 1200px;
    padding: var(--spacing-xl) 80px;
  }
}

.question-header {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.fullscreen-mode .question-header {
  margin-bottom: var(--spacing-xl);
}

@media (max-width: 575.98px) {
  .question-header {
    margin-bottom: var(--spacing-md);
  }
}

.category {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  padding: 3px 12px;
  border-radius: 999px;
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.topic {
  background: var(--color-surface-sunken);
  color: var(--color-text-secondary);
  padding: 3px 12px;
  border-radius: 999px;
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.progress-badge {
  background: var(--color-purple-soft);
  color: var(--color-purple);
  padding: 3px 12px;
  border-radius: 999px;
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.keypoints-badge {
  background: var(--color-warning-soft);
  color: var(--color-warning-dark);
  padding: 3px 12px;
  border-radius: 999px;
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
}

.question-content {
  margin-bottom: var(--spacing-lg);
}

.fullscreen-mode .question-content {
  margin-bottom: var(--spacing-xl);
}

@media (max-width: 575.98px) {
  .question-content {
    margin-bottom: var(--spacing-md);
  }
}

.question-title,
.answer-title {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.fullscreen-mode .question-title,
.fullscreen-mode .answer-title {
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-md);
}

.question-text {
  font-size: clamp(1.05rem, 3vw, 1.15rem);
  font-weight: 500;
  line-height: 1.8;
  color: var(--color-text);
}

.fullscreen-mode .question-text {
  font-size: clamp(1.1rem, 4vw, 1.25rem);
  line-height: 2;
}

.answer-section {
  background: var(--color-surface-sunken);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.fullscreen-mode .answer-section {
  padding: var(--spacing-xl) var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

@media (max-width: 575.98px) {
  .answer-section {
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }

  .fullscreen-mode .answer-section {
    padding: var(--spacing-md);
  }
}

.answer-text {
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  line-height: 1.8;
  color: var(--color-text);
}

.fullscreen-mode .answer-text {
  font-size: clamp(1rem, 3vw, 1.1rem);
  line-height: 2;
}

.actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.fullscreen-mode .actions {
  gap: var(--spacing-md);
  margin-top: auto;
  padding-top: var(--spacing-lg);
}

@media (max-width: 575.98px) {
  .actions {
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
  }

  .fullscreen-mode .actions {
    gap: var(--spacing-sm);
    padding-top: var(--spacing-md);
  }
}

.btn {
  padding: 12px 32px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-base);
  font-weight: 500;
  transition: background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
  min-height: var(--touch-target-min);
}

.btn:active:not(:disabled) {
  transform: scale(0.98);
}

@media (max-width: 575.98px) {
  .btn {
    padding: 10px 24px;
    font-size: var(--font-size-sm);
  }
}

.fullscreen-mode .btn {
  padding: 14px 40px;
  font-size: clamp(1rem, 2.5vw, 1.05rem);
}

@media (max-width: 575.98px) {
  .fullscreen-mode .btn {
    padding: 12px 28px;
    font-size: var(--font-size-sm);
  }
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  padding-left: 48px;
  padding-right: 48px;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-success,
.btn-warning,
.btn-danger {
  flex: 1;
  max-width: 150px;
  color: white;
}

.btn-success {
  background: var(--color-success-dark);
}

.btn-success:hover:not(:disabled) {
  background: var(--color-success-darker);
}

.btn-warning {
  background: var(--color-warning-dark);
}

.btn-warning:hover:not(:disabled) {
  background: var(--color-warning-darker);
}

.btn-danger {
  background: var(--color-danger);
}

.btn-danger:hover:not(:disabled) {
  background: var(--color-danger-dark);
}

.btn-secondary {
  background: var(--color-surface);
  border-color: var(--color-border-strong);
  color: var(--color-text-secondary);
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--color-text-light);
  color: var(--color-text);
}

.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  gap: var(--spacing-md);
}

@media (max-width: 575.98px) {
  .navigation {
    padding-top: var(--spacing-md);
    flex-wrap: wrap;
  }
}

.navigation .btn {
  min-height: 40px;
  padding: 8px 20px;
  font-size: var(--font-size-sm);
}

.page-info {
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
  font-variant-numeric: tabular-nums;
}

.empty-state {
  text-align: center;
  padding: 60px var(--spacing-lg);
  color: var(--color-text-secondary);
}

@media (max-width: 575.98px) {
  .empty-state {
    padding: 40px var(--spacing-md);
  }
}
</style>

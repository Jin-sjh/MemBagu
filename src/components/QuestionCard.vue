<template>
  <div class="question-card" :class="{ 'fullscreen-mode': fullscreen }" v-if="question">
    <div class="question-header">
      <span class="category">{{ question.category }}</span>
      <span class="topic">{{ question.topic }}</span>
      <span class="progress-badge" v-if="progress">
        复习 {{ progress.reviewCount }} 次
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
        <button class="btn btn-danger" @click="handleAnswer(false)">
          没记住
        </button>
        <button class="btn btn-success" @click="handleAnswer(true)">
          记住了
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
import { ref } from 'vue'
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

function handleAnswer(remembered) {
  emit('answer', {
    questionId: props.question.id,
    remembered
  })
  showAnswer.value = false
}
</script>

<style scoped>
.question-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

@media (max-width: 575.98px) {
  .question-card {
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
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
  background: var(--color-primary);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: var(--font-size-sm);
}

.topic {
  background: var(--color-border);
  color: #555;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: var(--font-size-sm);
}

.progress-badge {
  background: #9b59b6;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: var(--font-size-sm);
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
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
  font-weight: 500;
}

.fullscreen-mode .question-title,
.fullscreen-mode .answer-title {
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-md);
}

.question-text {
  font-size: clamp(1rem, 3vw, 1.1rem);
  line-height: 1.8;
  color: var(--color-text);
}

.fullscreen-mode .question-text {
  font-size: clamp(1.1rem, 4vw, 1.25rem);
  line-height: 2;
}

.answer-section {
  background: var(--color-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  border-left: 4px solid var(--color-primary);
}

.fullscreen-mode .answer-section {
  padding: var(--spacing-xl) var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  border-radius: var(--radius-lg);
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
  color: #34495e;
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
  gap: var(--spacing-lg);
  margin-top: auto;
  padding-top: var(--spacing-lg);
}

@media (max-width: 575.98px) {
  .actions {
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
  }
  
  .fullscreen-mode .actions {
    gap: var(--spacing-md);
    padding-top: var(--spacing-md);
  }
}

.btn {
  padding: 12px 32px;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-base);
  transition: all 0.2s;
  min-height: var(--touch-target-min);
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
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-success {
  background: var(--color-success);
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: var(--color-success-dark);
}

.btn-danger {
  background: var(--color-danger);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: var(--color-danger-dark);
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #7f8c8d;
}

.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid #eee;
  gap: var(--spacing-md);
}

@media (max-width: 575.98px) {
  .navigation {
    padding-top: var(--spacing-md);
    flex-wrap: wrap;
  }
}

.page-info {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
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

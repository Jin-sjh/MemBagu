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
  border-radius: 12px;
  padding: 24px;
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

.question-header {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.fullscreen-mode .question-header {
  margin-bottom: 30px;
}

.category {
  background: #3498db;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
}

.topic {
  background: #e8e8e8;
  color: #555;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
}

.progress-badge {
  background: #9b59b6;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
}

.question-content {
  margin-bottom: 24px;
}

.fullscreen-mode .question-content {
  margin-bottom: 32px;
}

.question-title,
.answer-title {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 12px;
  font-weight: 500;
}

.fullscreen-mode .question-title,
.fullscreen-mode .answer-title {
  font-size: 1rem;
  margin-bottom: 16px;
}

.question-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #2c3e50;
}

.fullscreen-mode .question-text {
  font-size: 1.25rem;
  line-height: 2;
}

.answer-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  border-left: 4px solid #3498db;
}

.fullscreen-mode .answer-section {
  padding: 28px 32px;
  margin-bottom: 32px;
  border-radius: 12px;
}

.answer-text {
  font-size: 1rem;
  line-height: 1.8;
  color: #34495e;
}

.fullscreen-mode .answer-text {
  font-size: 1.1rem;
  line-height: 2;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
}

.fullscreen-mode .actions {
  gap: 20px;
  margin-top: auto;
  padding-top: 24px;
}

.btn {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.fullscreen-mode .btn {
  padding: 14px 40px;
  font-size: 1.05rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-success {
  background: #27ae60;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #219a52;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c0392b;
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
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.page-info {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}
</style>

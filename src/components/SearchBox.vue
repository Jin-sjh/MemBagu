<template>
  <div class="search-box">
    <div class="search-input-wrapper">
      <input
        type="text"
        v-model="searchQuery"
        @input="handleSearch"
        placeholder="搜索题目或答案..."
        class="search-input"
      />
      <button v-if="searchQuery" @click="clearSearch" class="clear-btn">×</button>
    </div>
    <div v-if="searchQuery && searchResults.length > 0" class="search-results">
      <div class="results-header">
        找到 {{ searchResults.length }} 个结果
      </div>
      <div 
        v-for="question in searchResults" 
        :key="question.id"
        class="result-item"
        @click="$emit('select', question)"
      >
        <div class="result-category">{{ question.category }} / {{ question.topic }}</div>
        <div class="result-question" v-html="highlightText(question.question, searchQuery)"></div>
        <div class="result-answer-preview" v-if="question.answer">
          {{ getPreview(question.answer) }}
        </div>
      </div>
    </div>
    <div v-if="searchQuery && searchResults.length === 0 && hasSearched" class="no-results">
      未找到相关题目
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  questions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select', 'search'])

const searchQuery = ref('')
const searchResults = ref([])
const hasSearched = ref(false)

function handleSearch() {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    hasSearched.value = false
    emit('search', { query: '', results: [] })
    return
  }

  hasSearched.value = true
  const query = searchQuery.value.toLowerCase().trim()
  
  searchResults.value = props.questions.filter(q => {
    const questionMatch = q.question.toLowerCase().includes(query)
    const answerMatch = q.answer && q.answer.toLowerCase().includes(query)
    const topicMatch = q.topic && q.topic.toLowerCase().includes(query)
    const categoryMatch = q.category && q.category.toLowerCase().includes(query)
    return questionMatch || answerMatch || topicMatch || categoryMatch
  })
  
  emit('search', { query: searchQuery.value, results: searchResults.value })
}

function clearSearch() {
  searchQuery.value = ''
  searchResults.value = []
  hasSearched.value = false
  emit('search', { query: '', results: [] })
}

function highlightText(text, query) {
  if (!query) return text
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getPreview(text) {
  const maxLength = 100
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

watch(() => props.questions, () => {
  if (searchQuery.value) {
    handleSearch()
  }
})
</script>

<style scoped>
.search-box {
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px var(--spacing-md);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  background: var(--color-surface);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  outline: none;
  min-height: var(--touch-target-min);
}

@media (max-width: 575.98px) {
  .search-input {
    padding: 10px 36px 10px var(--spacing-sm);
    font-size: 16px;
  }
}

.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}

.search-input::placeholder {
  color: var(--color-text-light);
}

.clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--color-text-light);
  cursor: pointer;
  padding: 0 var(--spacing-sm);
  line-height: 1;
  min-height: var(--touch-target-min);
  min-width: var(--touch-target-min);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast);
}

.clear-btn:hover {
  color: var(--color-text-secondary);
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  margin-top: var(--spacing-sm);
  max-height: 400px;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  z-index: 90;
}

@media (max-width: 575.98px) {
  .search-results {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    margin-top: 0;
    max-height: 60vh;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    border: none;
    box-shadow: 0 -8px 32px rgba(16, 24, 40, 0.16);
  }
}

.results-header {
  padding: 10px var(--spacing-md);
  background: var(--color-surface-sunken);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.result-item {
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  min-height: var(--touch-target-min);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background: var(--color-surface-sunken);
}

.result-category {
  font-size: var(--font-size-xs);
  color: var(--color-primary);
  font-weight: 500;
  margin-bottom: 4px;
}

.result-question {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  line-height: 1.4;
}

.result-question :deep(mark) {
  background: var(--color-warning-soft);
  color: var(--color-warning-dark);
  padding: 0 2px;
  border-radius: 2px;
}

.result-answer-preview {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
  margin-top: 6px;
  line-height: 1.4;
}

.no-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  margin-top: var(--spacing-sm);
  padding: var(--spacing-lg);
  text-align: center;
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
  box-shadow: var(--shadow-lg);
  z-index: 90;
}

@media (max-width: 575.98px) {
  .no-results {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    margin-top: 0;
    padding: var(--spacing-xl) var(--spacing-lg);
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    border: none;
    box-shadow: 0 -8px 32px rgba(16, 24, 40, 0.16);
  }
}
</style>

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
  padding: 12px 40px 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  outline: none;
}

.search-input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.search-input::placeholder {
  color: #aaa;
}

.clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  padding: 0 8px;
  line-height: 1;
}

.clear-btn:hover {
  color: #666;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-top: 8px;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.results-header {
  padding: 10px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-size: 0.85rem;
  color: #666;
}

.result-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background: #f8f9fa;
}

.result-category {
  font-size: 0.75rem;
  color: #3498db;
  margin-bottom: 4px;
}

.result-question {
  font-size: 0.95rem;
  color: #2c3e50;
  line-height: 1.4;
}

.result-question :deep(mark) {
  background: #fff3cd;
  padding: 0 2px;
  border-radius: 2px;
}

.result-answer-preview {
  font-size: 0.8rem;
  color: #888;
  margin-top: 6px;
  line-height: 1.4;
}

.no-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-top: 8px;
  padding: 20px;
  text-align: center;
  color: #888;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
}
</style>

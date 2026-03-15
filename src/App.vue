<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <div class="title-section">
          <h1>八股记忆</h1>
          <p class="subtitle">艾宾浩斯记忆辅助系统</p>
        </div>
        <LibrarySelector 
          :libraries="libraries"
          :activeLibraryId="activeLibraryId"
          :activeLibrary="activeLibrary"
          @select="handleLibrarySwitch"
          @manage="openLibraryManager"
        />
      </div>
    </header>

    <div class="search-section">
      <SearchBox 
        :questions="allQuestions"
        @select="handleSearchSelect"
        @search="handleSearch"
      />
    </div>

    <nav class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab', { active: currentTab === tab.id }]"
        @click="currentTab = tab.id"
      >
        {{ tab.name }}
        <span v-if="tab.id === 'review' && filteredDueCount > 0" class="badge">{{ filteredDueCount }}</span>
      </button>
    </nav>

    <div class="global-filter" v-show="currentTab !== 'audio' && currentTab !== 'libraries'">
      <CategoryFilter 
        :categories="categories"
        :selected="selectedCategory"
        @select="handleCategorySelect"
      />
    </div>

    <main class="main">
      <div v-if="isSearchMode && searchResults.length > 0" class="search-results-view">
        <div class="search-results-header">
          搜索结果 ({{ searchResults.length }} 题)
        </div>
        <div class="search-results-list">
          <div 
            v-for="question in searchResults" 
            :key="question.id"
            class="search-result-card"
            @click="viewQuestion(question)"
          >
            <div class="result-meta">
              <span class="result-category">{{ question.category }}</span>
              <span class="result-topic">{{ question.topic }}</span>
            </div>
            <div class="result-question">{{ question.question }}</div>
            <div class="result-answer-preview" v-if="question.answer">
              {{ getAnswerPreview(question.answer) }}
            </div>
          </div>
        </div>
      </div>

      <ReviewList 
        v-else-if="currentTab === 'review'"
        :questions="filteredDueQuestions"
        :progress="progressMap"
        :selectedCategory="selectedCategory"
        @review="handleReview"
      />
      
      <div v-else-if="currentTab === 'learn'" class="learn-view">
        <QuestionCard 
          :question="currentQuestion"
          :progress="currentProgress"
          @answer="handleAnswer"
          @next="nextQuestion"
          @prev="prevQuestion"
        />
      </div>

      <Statistics 
        v-else-if="currentTab === 'stats'"
        :questions="filteredQuestions"
        :progress="progressMap"
        :selectedCategory="selectedCategory"
      />
      
      <AudioGenerator 
        v-else-if="currentTab === 'audio'"
      />

      <LibraryManager
        v-else-if="currentTab === 'libraries'"
        :libraries="libraries"
        :activeLibraryId="activeLibraryId"
        :questionCounts="questionCounts"
        :learnedCounts="learnedCounts"
        @create="handleCreateLibrary"
        @delete="handleDeleteLibrary"
        @switch="handleLibrarySwitch"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ReviewList from './components/ReviewList.vue'
import QuestionCard from './components/QuestionCard.vue'
import Statistics from './components/Statistics.vue'
import CategoryFilter from './components/CategoryFilter.vue'
import SearchBox from './components/SearchBox.vue'
import AudioGenerator from './components/AudioGenerator.vue'
import LibrarySelector from './components/LibrarySelector.vue'
import LibraryManager from './components/LibraryManager.vue'
import { useQuestions } from './composables/useQuestions'
import { useProgress } from './composables/useProgress'
import { useLibraries } from './composables/useLibraries'
import { saveUIStateByLibrary, loadUIStateByLibrary } from './utils/storage'

const tabs = [
  { id: 'review', name: '待复习' },
  { id: 'learn', name: '学习' },
  { id: 'audio', name: '音频生成' },
  { id: 'stats', name: '统计' },
  { id: 'libraries', name: '库管理' }
]

const currentTab = ref('review')
const selectedCategory = ref('all')
const currentIndex = ref(0)
const categoryIndexMap = ref({})
const isSearchMode = ref(false)
const searchResults = ref([])

const { allQuestions, categories, loadQuestions } = useQuestions()
const { progressMap, loadProgress, saveProgress, getDueQuestions, updateProgress, clearLibraryProgress, getLearnedCount } = useProgress()
const { 
  libraries, 
  activeLibraryId, 
  activeLibrary, 
  loadLibraries, 
  createLibrary, 
  deleteLibrary, 
  switchLibrary 
} = useLibraries()

const questionCounts = ref({})
const learnedCounts = ref({})

onMounted(async () => {
  loadLibraries()
  await loadLibraryData(activeLibraryId.value)
})

async function loadLibraryData(libraryId) {
  await loadQuestions(libraryId)
  loadProgress(libraryId)
  
  const savedUIState = loadUIStateByLibrary(libraryId)
  if (savedUIState) {
    currentTab.value = savedUIState.currentTab || 'review'
    selectedCategory.value = savedUIState.selectedCategory || 'all'
    currentIndex.value = savedUIState.currentIndex || 0
    categoryIndexMap.value = savedUIState.categoryIndexMap || {}
  } else {
    currentTab.value = 'review'
    selectedCategory.value = 'all'
    currentIndex.value = 0
    categoryIndexMap.value = {}
  }
  
  updateLibraryStats(libraryId)
}

function updateLibraryStats(libraryId) {
  questionCounts.value[libraryId] = allQuestions.value.length
  learnedCounts.value[libraryId] = getLearnedCount()
}

watch([currentTab, selectedCategory, currentIndex, categoryIndexMap], () => {
  if (activeLibraryId.value) {
    saveUIStateByLibrary(activeLibraryId.value, {
      currentTab: currentTab.value,
      selectedCategory: selectedCategory.value,
      currentIndex: currentIndex.value,
      categoryIndexMap: categoryIndexMap.value
    })
  }
}, { deep: true })

const dueQuestions = computed(() => {
  return getDueQuestions(allQuestions.value)
})

const filteredDueQuestions = computed(() => {
  if (selectedCategory.value === 'all') {
    return dueQuestions.value
  }
  return dueQuestions.value.filter(q => q.category === selectedCategory.value)
})

const filteredDueCount = computed(() => filteredDueQuestions.value.length)

const filteredQuestions = computed(() => {
  if (selectedCategory.value === 'all') {
    return allQuestions.value
  }
  return allQuestions.value.filter(q => q.category === selectedCategory.value)
})

function handleCategorySelect(category) {
  categoryIndexMap.value[selectedCategory.value] = currentIndex.value
  selectedCategory.value = category
  currentIndex.value = categoryIndexMap.value[category] || 0
  isSearchMode.value = false
}

function handleSearch({ query, results }) {
  if (query) {
    isSearchMode.value = true
    searchResults.value = results
  } else {
    isSearchMode.value = false
    searchResults.value = []
  }
}

function handleSearchSelect(question) {
  isSearchMode.value = false
  searchResults.value = []
  currentTab.value = 'learn'
  const idx = filteredQuestions.value.findIndex(q => q.id === question.id)
  if (idx !== -1) {
    currentIndex.value = idx
  }
}

function viewQuestion(question) {
  isSearchMode.value = false
  searchResults.value = []
  currentTab.value = 'learn'
  const idx = filteredQuestions.value.findIndex(q => q.id === question.id)
  if (idx !== -1) {
    currentIndex.value = idx
  }
}

function getAnswerPreview(answer) {
  const maxLength = 150
  if (answer.length <= maxLength) return answer
  return answer.substring(0, maxLength) + '...'
}

const currentQuestion = computed(() => {
  if (filteredQuestions.value.length === 0) return null
  const idx = Math.min(currentIndex.value, filteredQuestions.value.length - 1)
  return filteredQuestions.value[idx]
})

const currentProgress = computed(() => {
  if (!currentQuestion.value) return null
  return progressMap.value[currentQuestion.value.id] || null
})

function handleReview({ questionId, remembered }) {
  updateProgress(questionId, remembered)
  saveProgress()
}

function handleAnswer({ questionId, remembered }) {
  updateProgress(questionId, remembered)
  saveProgress()
}

function nextQuestion() {
  if (currentIndex.value < filteredQuestions.value.length - 1) {
    currentIndex.value++
  }
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

async function handleLibrarySwitch(id) {
  const result = switchLibrary(id)
  if (result.success) {
    await loadLibraryData(id)
    isSearchMode.value = false
    searchResults.value = []
  }
}

function openLibraryManager() {
  currentTab.value = 'libraries'
}

function handleCreateLibrary(config) {
  const result = createLibrary(config)
  if (result.success) {
    questionCounts.value[result.library.id] = 0
    learnedCounts.value[result.library.id] = 0
  }
}

async function handleDeleteLibrary(id) {
  const result = deleteLibrary(id)
  if (result.success) {
    clearLibraryProgress(id)
    delete questionCounts.value[id]
    delete learnedCounts.value[id]
    
    if (activeLibraryId.value === id) {
      await loadLibraryData(activeLibraryId.value)
    }
  }
}
</script>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.header {
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.title-section {
  flex: 1;
}

.header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 8px;
}

.subtitle {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.tab {
  padding: 10px 24px;
  border: none;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  position: relative;
}

.tab:hover {
  background: #e8e8e8;
}

.tab.active {
  background: #3498db;
  color: white;
}

.global-filter {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e74c3c;
  color: white;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.main {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  min-height: 400px;
}

.learn-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-section {
  margin-bottom: 20px;
}

.search-results-view {
  padding: 0;
}

.search-results-header {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #3498db;
}

.search-results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-result-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e8e8e8;
}

.search-result-card:hover {
  background: #fff;
  border-color: #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.15);
}

.result-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.result-category {
  background: #3498db;
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.result-topic {
  background: #e8e8e8;
  color: #555;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
}

.result-question {
  font-size: 1rem;
  color: #2c3e50;
  line-height: 1.5;
  font-weight: 500;
}

.result-answer-preview {
  font-size: 0.85rem;
  color: #7f8c8d;
  margin-top: 8px;
  line-height: 1.5;
  padding-top: 8px;
  border-top: 1px dashed #ddd;
}

@media (max-width: 600px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .tabs {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 8px;
  }
  
  .tab {
    padding: 8px 16px;
    font-size: 0.9rem;
    white-space: nowrap;
  }
}
</style>

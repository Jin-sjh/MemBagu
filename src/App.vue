<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <div class="title-section">
          <h1>八股记忆</h1>
          <p class="subtitle">艾宾浩斯记忆辅助系统</p>
        </div>
        <div class="header-right">
          <Auth ref="authRef" @login="handleLogin" @logout="handleLogout" />
          <div class="save-status" :class="saveStatus">
            <span v-if="saveStatus === 'saving'" class="status-icon saving">●</span>
            <span v-else-if="saveStatus === 'saved'" class="status-icon saved">✓</span>
            <span v-else-if="saveStatus === 'error'" class="status-icon error">!</span>
            <span class="status-text">{{ getSaveStatusText() }}</span>
          </div>
          <LibrarySelector 
            :libraries="libraries"
            :activeLibraryId="activeLibraryId"
            :activeLibrary="activeLibrary"
            @select="handleLibrarySwitch"
            @manage="openLibraryManager"
          />
        </div>
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
import Auth from './components/Auth.vue'
import { useQuestions } from './composables/useQuestions'
import { useProgress } from './composables/useProgress'
import { useLibraries } from './composables/useLibraries'
import { useAutoSave } from './composables/useAutoSave'
import { 
  saveUIStateByLibrary, 
  loadUIStateByLibrary,
  syncProgressToCloud,
  loadProgressFromCloud,
  syncUIStateToCloud,
  loadUIStateFromCloud,
  syncLibrariesToCloud,
  loadLibrariesFromCloud
} from './utils/storage'

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
const { 
  lastSaveTime, 
  isSaving, 
  saveStatus, 
  startAutoSave, 
  formatLastSaveTime 
} = useAutoSave()

const questionCounts = ref({})
const learnedCounts = ref({})
const authRef = ref(null)
const isLoggedIn = ref(false)

onMounted(async () => {
  await loadLibraries()
  await loadLibraryData(activeLibraryId.value)
  
  startAutoSave(() => {
    saveProgress()
    saveUIStateByLibrary(activeLibraryId.value, {
      currentTab: currentTab.value,
      selectedCategory: selectedCategory.value,
      currentIndex: currentIndex.value,
      categoryIndexMap: categoryIndexMap.value
    })
    if (isLoggedIn.value) {
      syncToCloud()
    }
  }, 30000)
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

function getSaveStatusText() {
  if (saveStatus.value === 'saving') return '保存中...'
  if (saveStatus.value === 'saved') return '已保存'
  if (saveStatus.value === 'error') return '保存失败'
  return formatLastSaveTime()
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

async function handleLogin(user) {
  isLoggedIn.value = true
  
  const cloudLibraries = await loadLibrariesFromCloud()
  if (cloudLibraries.success && cloudLibraries.data.length > 0) {
    libraries.value = cloudLibraries.data
    saveLibraries(libraries.value)
  }
  
  if (activeLibraryId.value) {
    await syncFromCloud(activeLibraryId.value)
  }
}

function handleLogout() {
  isLoggedIn.value = false
}

async function syncToCloud() {
  if (!isLoggedIn.value || !activeLibraryId.value) return
  
  if (authRef.value) {
    authRef.value.setSyncStatus('syncing')
  }
  
  await syncProgressToCloud(activeLibraryId.value, progressMap.value)
  await syncUIStateToCloud(activeLibraryId.value, {
    currentTab: currentTab.value,
    selectedCategory: selectedCategory.value,
    currentIndex: currentIndex.value,
    categoryIndexMap: categoryIndexMap.value
  })
  await syncLibrariesToCloud(libraries.value)
  
  if (authRef.value) {
    authRef.value.setSyncStatus('synced')
    setTimeout(() => {
      if (authRef.value) {
        authRef.value.setSyncStatus('idle')
      }
    }, 2000)
  }
}

async function syncFromCloud(libraryId) {
  if (!isLoggedIn.value) return
  
  if (authRef.value) {
    authRef.value.setSyncStatus('syncing')
  }
  
  const progressResult = await loadProgressFromCloud(libraryId)
  if (progressResult.success && Object.keys(progressResult.data).length > 0) {
    progressMap.value = progressResult.data
    saveProgress()
  }
  
  const uiResult = await loadUIStateFromCloud(libraryId)
  if (uiResult.success && uiResult.data) {
    currentTab.value = uiResult.data.currentTab || 'review'
    selectedCategory.value = uiResult.data.selectedCategory || 'all'
    currentIndex.value = uiResult.data.currentIndex || 0
    categoryIndexMap.value = uiResult.data.categoryIndexMap || {}
  }
  
  if (authRef.value) {
    authRef.value.setSyncStatus('synced')
    setTimeout(() => {
      if (authRef.value) {
        authRef.value.setSyncStatus('idle')
      }
    }, 2000)
  }
}
</script>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  min-height: 100vh;
}

@media (max-width: 575.98px) {
  .app {
    padding: var(--spacing-md);
  }
}

@media (min-width: 1200px) {
  .app {
    max-width: 1000px;
    padding: var(--spacing-xl);
  }
}

@media (min-width: 1400px) {
  .app {
    max-width: 1200px;
  }
}

.header {
  margin-bottom: var(--spacing-lg);
}

@media (max-width: 575.98px) {
  .header {
    margin-bottom: var(--spacing-md);
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.title-section {
  flex: 1;
  min-width: 200px;
}

.header h1 {
  font-size: clamp(1.5rem, 5vw, 2rem);
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

@media (max-width: 575.98px) {
  .header-right {
    width: 100%;
    justify-content: space-between;
    gap: var(--spacing-sm);
  }
}

.save-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: var(--font-size-xs);
  background: #f0f0f0;
  color: var(--color-text-secondary);
  transition: all 0.3s;
}

.save-status.saving {
  background: #e8f4fd;
  color: var(--color-primary);
}

.save-status.saved {
  background: #e8f8f0;
  color: var(--color-success);
}

.save-status.error {
  background: #fde8e8;
  color: var(--color-danger);
}

.status-icon {
  font-weight: bold;
}

.status-icon.saving {
  animation: pulse 1s infinite;
}

.status-icon.saved {
  color: var(--color-success);
}

.status-icon.error {
  color: var(--color-danger);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  white-space: nowrap;
}

.tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 575.98px) {
  .tabs {
    justify-content: flex-start;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .tabs::-webkit-scrollbar {
    display: none;
  }
}

.tab {
  padding: 10px 24px;
  border: none;
  background: #f5f5f5;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-base);
  transition: all 0.2s;
  position: relative;
  white-space: nowrap;
  flex-shrink: 0;
}

@media (max-width: 575.98px) {
  .tab {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-sm);
  }
}

.tab:hover {
  background: #e8e8e8;
}

.tab.active {
  background: var(--color-primary);
  color: white;
}

.global-filter {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg);
  border-radius: var(--radius-md);
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--color-danger);
  color: white;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.main {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: var(--spacing-lg);
  min-height: 400px;
}

@media (max-width: 575.98px) {
  .main {
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    min-height: 300px;
  }
}

@media (min-width: 1200px) {
  .main {
    padding: var(--spacing-xl);
  }
}

.learn-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.search-section {
  margin-bottom: var(--spacing-lg);
}

@media (max-width: 575.98px) {
  .search-section {
    margin-bottom: var(--spacing-md);
  }
}

.search-results-view {
  padding: 0;
}

.search-results-header {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--color-primary);
}

.search-results-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.search-result-card {
  background: var(--color-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--color-border);
}

.search-result-card:hover {
  background: #fff;
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.15);
}

.result-meta {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  flex-wrap: wrap;
}

.result-category {
  background: var(--color-primary);
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.result-topic {
  background: var(--color-border);
  color: #555;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: var(--font-size-xs);
}

.result-question {
  font-size: var(--font-size-base);
  color: var(--color-text);
  line-height: 1.5;
  font-weight: 500;
}

.result-answer-preview {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-sm);
  line-height: 1.5;
  padding-top: var(--spacing-sm);
  border-top: 1px dashed #ddd;
}
</style>

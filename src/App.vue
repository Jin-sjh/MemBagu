<template>
  <div class="app">
    <header class="topbar">
      <div class="topbar-inner">
        <div class="brand">
          <h1>八股记忆</h1>
        </div>

        <nav class="main-nav">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['nav-item', { active: currentTab === tab.id }]"
            @click="currentTab = tab.id"
          >
            {{ tab.name }}
            <span v-if="tab.id === 'review' && filteredDueCount > 0" class="nav-badge">{{ filteredDueCount }}</span>
          </button>
        </nav>

        <div class="topbar-right">
          <div class="save-status" :class="saveStatus" :title="getSaveStatusText()">
            <span class="status-dot"></span>
            <span class="status-text">{{ getSaveStatusText() }}</span>
          </div>
          <LibrarySelector
            :libraries="libraries"
            :activeLibraryId="activeLibraryId"
            :activeLibrary="activeLibrary"
            @select="handleLibrarySwitch"
            @manage="openLibraryManager"
          />
          <Auth ref="authRef" @login="handleLogin" @logout="handleLogout" />
        </div>
      </div>
    </header>

    <div class="page-body">
      <div class="toolbar">
        <div class="toolbar-search">
          <SearchBox
            :questions="allQuestions"
            @select="handleSearchSelect"
            @search="handleSearch"
          />
        </div>
        <div class="toolbar-filter" v-show="currentTab !== 'audio' && currentTab !== 'libraries'">
          <CategoryFilter
            :categories="categories"
            :selected="selectedCategory"
            @select="handleCategorySelect"
          />
        </div>
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
        :poolStats="poolStats"
        :examReviewMode="examReviewMode"
        @review="handleReview"
        @exitExam="handleExitExam"
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
        @startExam="handleStartExam"
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
const { progressMap, loadProgress, saveProgress, getSprintQueue, getPoolStats, updateProgress, clearLibraryProgress, getLearnedCount, startExamReview, stopExamReview, examReviewMode } = useProgress()
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
  return getSprintQueue(filteredQuestions.value)
})

const filteredDueQuestions = computed(() => {
  if (selectedCategory.value === 'all') {
    return dueQuestions.value
  }
  return dueQuestions.value.filter(q => q.category === selectedCategory.value)
})

const filteredDueCount = computed(() => filteredDueQuestions.value.length)

const poolStats = computed(() => {
  const base = filteredQuestions.value
  return getPoolStats(base)
})

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

function handleReview({ questionId, grade }) {
  updateProgress(questionId, grade)
  saveProgress()
}

function handleAnswer({ questionId, grade }) {
  updateProgress(questionId, grade)
  saveProgress()
}

function handleStartExam() {
  startExamReview()
  currentTab.value = 'review'
}

function handleExitExam() {
  stopExamReview()
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
  min-height: 100vh;
}

/* ========== 顶部导航栏 ========== */
.topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.topbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  min-height: 56px;
}

.brand h1 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex: 1;
  justify-content: center;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.main-nav::-webkit-scrollbar {
  display: none;
}

.nav-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
  min-height: 36px;
  min-width: 0;
  transition: color var(--transition-fast), background-color var(--transition-fast);
}

.nav-item:hover {
  color: var(--color-text);
  background: var(--color-surface-sunken);
}

.nav-item.active {
  color: var(--color-primary);
  background: var(--color-primary-soft);
  font-weight: 600;
}

.nav-badge {
  background: var(--color-danger-soft);
  color: var(--color-danger-dark);
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 999px;
  line-height: 1.5;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

.save-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
  white-space: nowrap;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-border-strong);
  flex-shrink: 0;
}

.save-status.saving {
  color: var(--color-primary);
}

.save-status.saving .status-dot {
  background: var(--color-primary);
  animation: pulse 1s infinite;
}

.save-status.saved {
  color: var(--color-success);
}

.save-status.saved .status-dot {
  background: var(--color-success);
}

.save-status.error {
  color: var(--color-danger);
}

.save-status.error .status-dot {
  background: var(--color-danger);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

@media (max-width: 767.98px) {
  .topbar-inner {
    flex-wrap: wrap;
    gap: var(--spacing-sm) var(--spacing-md);
    padding: var(--spacing-sm) var(--spacing-md) 0;
  }

  .main-nav {
    order: 3;
    flex: 1 1 100%;
    justify-content: flex-start;
    padding-bottom: var(--spacing-sm);
  }

  .topbar-right {
    margin-left: auto;
    gap: var(--spacing-sm);
  }

  .save-status .status-text {
    display: none;
  }
}

/* ========== 页面主体 ========== */
.page-body {
  max-width: 960px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

@media (max-width: 575.98px) {
  .page-body {
    padding: var(--spacing-md);
  }
}

.toolbar {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.toolbar-search {
  flex: 1;
  min-width: 0;
}

.toolbar-filter {
  flex-shrink: 0;
}

@media (max-width: 767.98px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: var(--spacing-md);
  }

  .toolbar-filter {
    width: 100%;
  }
}

.main {
  min-height: 400px;
}

.learn-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* ========== 搜索结果 ========== */
.search-results-header {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

.search-results-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.search-result-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  cursor: pointer;
  border: 1px solid var(--color-border);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
}

.search-result-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.result-meta {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  flex-wrap: wrap;
}

.result-category {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  padding: 2px 10px;
  border-radius: 999px;
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.result-topic {
  background: var(--color-surface-sunken);
  color: var(--color-text-secondary);
  padding: 2px 10px;
  border-radius: 999px;
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
  border-top: 1px dashed var(--color-border);
}
</style>

import { ref, computed } from 'vue'
import { 
  loadProgressByLibrary, 
  saveProgressByLibrary,
  clearProgressByLibrary
} from '../utils/storage'
import { getNextReviewTime, isDue, calculateRetentionRate } from './useEbbinghaus'

const progressMap = ref({})
const currentLibraryId = ref('frontend')

export function useProgress() {
  function loadProgress(libraryId = 'frontend') {
    currentLibraryId.value = libraryId
    progressMap.value = loadProgressByLibrary(libraryId)
  }

  function saveProgress() {
    saveProgressByLibrary(currentLibraryId.value, progressMap.value)
  }

  function updateProgress(questionId, remembered) {
    const now = Date.now()
    const existing = progressMap.value[questionId] || {
      reviewCount: 0,
      history: []
    }

    const newCount = remembered ? existing.reviewCount + 1 : Math.max(0, existing.reviewCount - 1)
    
    progressMap.value[questionId] = {
      questionId,
      reviewCount: newCount,
      lastReviewTime: now,
      nextReviewTime: getNextReviewTime(newCount),
      history: [
        ...existing.history,
        { time: now, remembered }
      ]
    }
  }

  function getProgress(questionId) {
    return progressMap.value[questionId] || null
  }

  function getDueQuestions(questions) {
    return questions.filter(q => {
      const progress = progressMap.value[q.id]
      if (!progress) return true
      return isDue(progress.nextReviewTime)
    }).sort((a, b) => {
      const progressA = progressMap.value[a.id]
      const progressB = progressMap.value[b.id]
      
      if (!progressA && progressB) return -1
      if (progressA && !progressB) return 1
      if (!progressA && !progressB) return 0
      
      return progressA.nextReviewTime - progressB.nextReviewTime
    })
  }

  function getStats(questions) {
    const total = questions.length
    let learned = 0
    let dueToday = 0
    let mastered = 0
    let totalRetention = 0
    let retentionCount = 0

    questions.forEach(q => {
      const progress = progressMap.value[q.id]
      if (progress) {
        learned++
        if (isDue(progress.nextReviewTime)) {
          dueToday++
        }
        if (progress.reviewCount >= 7) {
          mastered++
        }
        const rate = calculateRetentionRate(progress.history)
        if (rate > 0) {
          totalRetention += rate
          retentionCount++
        }
      }
    })

    return {
      total,
      learned,
      dueToday,
      mastered,
      unlearned: total - learned,
      avgRetention: retentionCount > 0 ? Math.round(totalRetention / retentionCount) : 0
    }
  }

  function getCategoryStats(questions) {
    const stats = {}
    
    questions.forEach(q => {
      if (!stats[q.category]) {
        stats[q.category] = { total: 0, learned: 0, mastered: 0 }
      }
      stats[q.category].total++
      
      const progress = progressMap.value[q.id]
      if (progress) {
        stats[q.category].learned++
        if (progress.reviewCount >= 7) {
          stats[q.category].mastered++
        }
      }
    })
    
    return stats
  }

  function resetProgress(questionId) {
    delete progressMap.value[questionId]
    saveProgress()
  }

  function resetAllProgress() {
    progressMap.value = {}
    saveProgress()
  }

  function clearLibraryProgress(libraryId) {
    clearProgressByLibrary(libraryId)
    if (currentLibraryId.value === libraryId) {
      progressMap.value = {}
    }
  }

  function getLearnedCount() {
    return Object.keys(progressMap.value).length
  }

  return {
    progressMap,
    currentLibraryId,
    loadProgress,
    saveProgress,
    updateProgress,
    getProgress,
    getDueQuestions,
    getStats,
    getCategoryStats,
    resetProgress,
    resetAllProgress,
    clearLibraryProgress,
    getLearnedCount
  }
}

import { ref } from 'vue'
import {
  loadProgressByLibrary,
  saveProgressByLibrary,
  clearProgressByLibrary
} from '../utils/storage'
import {
  GRADE,
  MASTER_STREAK,
  COLD_WRONG_INTERVAL,
  isLegacyProgress,
  buildSprintQueue,
  getPoolCounts,
  getPool
} from './useEbbinghaus'

const progressMap = ref({})
const currentLibraryId = ref('frontend')
// 考前总复习模式：true 时队列只含已掌握的题
const examReviewMode = ref(false)

export function useProgress() {
  function loadProgress(libraryId = 'frontend') {
    currentLibraryId.value = libraryId
    const loaded = loadProgressByLibrary(libraryId)
    // 旧格式数据清空重来
    const hasLegacy = Object.values(loaded).some(p => isLegacyProgress(p))
    progressMap.value = hasLegacy ? {} : loaded
    if (hasLegacy) saveProgress()
  }

  function saveProgress() {
    saveProgressByLibrary(currentLibraryId.value, progressMap.value)
  }

  // 三档评分：grade 0=不会 1=模糊 2=会
  function updateProgress(questionId, grade) {
    const now = Date.now()
    const existing = progressMap.value[questionId] || {
      streak: 0,
      mastered: false,
      pendingConfirm: false,
      lastWrongTime: null,
      history: []
    }

    let { streak, mastered, pendingConfirm, lastWrongTime, nextReviewTime, history } = existing

    if (grade === GRADE.GOOD) {
      streak = (streak || 0) + 1
      pendingConfirm = false
      if (streak >= MASTER_STREAK) {
        mastered = true
        pendingConfirm = false
      } else {
        // 答对一次但未达标 → 进待确认池
        pendingConfirm = true
      }
    } else if (grade === GRADE.FUZZY) {
      streak = 0
      mastered = false
      pendingConfirm = true // 模糊 → 待确认池下次再考
      lastWrongTime = existing.lastWrongTime
    } else if (grade === GRADE.AGAIN) {
      streak = 0
      mastered = false
      pendingConfirm = false
      lastWrongTime = now
      nextReviewTime = now + COLD_WRONG_INTERVAL // 冷错题 2 天后回看
    }

    history = [...(history || []), { time: now, grade }]

    progressMap.value[questionId] = {
      streak,
      mastered,
      pendingConfirm,
      lastWrongTime: lastWrongTime || null,
      nextReviewTime: nextReviewTime || null,
      history
    }
  }

  function getProgress(questionId) {
    return progressMap.value[questionId] || null
  }

  // 冲刺队列：考前模式时只返回已掌握的题
  function getSprintQueue(questions) {
    if (examReviewMode.value) {
      return questions.filter(q => getPool(progressMap.value[q.id]) === 'mastered')
    }
    return buildSprintQueue(questions, progressMap.value)
  }

  function getPoolStats(questions) {
    return getPoolCounts(questions, progressMap.value)
  }

  // 冲刺四件套统计
  function getCoverageStats(questions) {
    const total = questions.length
    let covered = 0 // 至少做过一次
    let wrong = 0 // 热错题 + 冷错题（含未到期）
    let pending = 0
    let mastered = 0

    questions.forEach(q => {
      const p = progressMap.value[q.id]
      if (p && p.history && p.history.length > 0) covered++
      const pool = getPool(p)
      if (pool === 'hotWrong' || pool === 'coldWrong' || pool === 'dormant') wrong++
      else if (pool === 'pending') pending++
      else if (pool === 'mastered') mastered++
    })

    return {
      total,
      covered,
      coverage: total > 0 ? Math.round((covered / total) * 100) : 0,
      wrong,
      pending,
      mastered,
      unlearned: total - covered
    }
  }

  function getCategoryCoverage(questions) {
    const stats = {}
    questions.forEach(q => {
      if (!stats[q.category]) stats[q.category] = { total: 0, covered: 0, mastered: 0 }
      stats[q.category].total++
      const p = progressMap.value[q.id]
      if (p && p.history && p.history.length > 0) stats[q.category].covered++
      if (getPool(p) === 'mastered') stats[q.category].mastered++
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
    return Object.values(progressMap.value).filter(p => p.history && p.history.length > 0).length
  }

  function startExamReview() {
    examReviewMode.value = true
  }

  function stopExamReview() {
    examReviewMode.value = false
  }

  return {
    progressMap,
    currentLibraryId,
    examReviewMode,
    loadProgress,
    saveProgress,
    updateProgress,
    getProgress,
    getSprintQueue,
    getPoolStats,
    getCoverageStats,
    getCategoryCoverage,
    resetProgress,
    resetAllProgress,
    clearLibraryProgress,
    getLearnedCount,
    startExamReview,
    stopExamReview
  }
}

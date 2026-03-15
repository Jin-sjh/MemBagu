const REVIEW_INTERVALS = [
  20 * 60 * 1000,
  60 * 60 * 1000,
  9 * 60 * 60 * 1000,
  24 * 60 * 60 * 1000,
  2 * 24 * 60 * 60 * 1000,
  6 * 24 * 60 * 60 * 1000,
  30 * 24 * 60 * 60 * 1000
]

export function getNextReviewTime(reviewCount) {
  const idx = Math.min(reviewCount, REVIEW_INTERVALS.length - 1)
  return Date.now() + REVIEW_INTERVALS[idx]
}

export function isDue(nextReviewTime) {
  return Date.now() >= nextReviewTime
}

export function getDueStatus(nextReviewTime) {
  if (!nextReviewTime) return 'new'
  
  const diff = nextReviewTime - Date.now()
  
  if (diff <= 0) return 'overdue'
  if (diff <= 60 * 60 * 1000) return 'soon'
  return 'later'
}

export function formatTimeRemaining(nextReviewTime) {
  if (!nextReviewTime) return '未学习'
  
  const diff = nextReviewTime - Date.now()
  
  if (diff <= 0) return '待复习'
  
  const minutes = Math.floor(diff / (60 * 1000))
  const hours = Math.floor(diff / (60 * 60 * 1000))
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  
  if (days > 0) return `${days}天后`
  if (hours > 0) return `${hours}小时后`
  if (minutes > 0) return `${minutes}分钟后`
  
  return '即将'
}

export function calculateRetentionRate(history) {
  if (!history || history.length === 0) return 0
  
  const remembered = history.filter(h => h.remembered).length
  return Math.round((remembered / history.length) * 100)
}

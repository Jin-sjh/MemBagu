// 冲刺模式常量
const HOT_WRONG_WINDOW = 2 * 24 * 60 * 60 * 1000 // 48 小时内答错的算热错题
const COLD_WRONG_INTERVAL = 2 * 24 * 60 * 60 * 1000 // 冷错题 2 天后回看
const MASTER_STREAK = 2 // 连续答对 2 次即掌握

export const GRADE = {
  AGAIN: 0, // 不会
  FUZZY: 1, // 模糊
  GOOD: 2 // 会
}

// 判断是否为旧格式数据（需清空）
export function isLegacyProgress(progress) {
  return progress && progress.reviewCount !== undefined && progress.streak === undefined
}

// 判断热错题：最近一次"不会"在 48 小时内
export function isHotWrong(progress) {
  if (!progress || progress.mastered || progress.pendingConfirm) return false
  if (!progress.lastWrongTime) return false
  return Date.now() - progress.lastWrongTime < HOT_WRONG_WINDOW
}

// 判断冷错题且到期：有 lastWrongTime 但超过 48 小时，且到回看时间
export function isColdWrongDue(progress) {
  if (!progress || progress.mastered || progress.pendingConfirm) return false
  if (!progress.lastWrongTime) return false
  if (Date.now() - progress.lastWrongTime < HOT_WRONG_WINDOW) return false
  return progress.nextReviewTime && Date.now() >= progress.nextReviewTime
}

// 判断待确认
export function isPendingConfirm(progress) {
  return !!progress && !!progress.pendingConfirm && !progress.mastered
}

// 判断已掌握
export function isMastered(progress) {
  return !!progress && !!progress.mastered
}

// 判断新题（无 progress）
export function isNew(progress) {
  return !progress
}

// 给一道题打池子标签
export function getPool(progress) {
  if (isMastered(progress)) return 'mastered'
  if (isPendingConfirm(progress)) return 'pending'
  if (isHotWrong(progress)) return 'hotWrong'
  if (isColdWrongDue(progress)) return 'coldWrong'
  if (isNew(progress)) return 'new'
  // 有 progress 但不在任何活跃池（如冷错题未到期、或 streak=1 但未标 pendingConfirm 的边界）→ 不进队列
  return 'dormant'
}

// 生成冲刺队列：按优先级合并四个活跃池
// 1. 热错题(按 lastWrongTime 升序，最久的优先) 2. 待确认 3. 冷错题到期(按 nextReviewTime) 4. 新题(原顺序)
export function buildSprintQueue(questions, progressMap) {
  const hotWrong = []
  const pending = []
  const coldWrong = []
  const fresh = []

  questions.forEach((q, idx) => {
    const p = progressMap[q.id]
    const pool = getPool(p)
    if (pool === 'hotWrong') hotWrong.push({ q, idx, sort: p.lastWrongTime })
    else if (pool === 'pending') pending.push({ q, idx, sort: 0 })
    else if (pool === 'coldWrong') coldWrong.push({ q, idx, sort: p.nextReviewTime })
    else if (pool === 'new') fresh.push({ q, idx, sort: idx })
  })

  hotWrong.sort((a, b) => a.sort - b.sort)
  coldWrong.sort((a, b) => a.sort - b.sort)
  pending.sort((a, b) => a.idx - b.idx)

  return [
    ...hotWrong.map(x => x.q),
    ...pending.map(x => x.q),
    ...coldWrong.map(x => x.q),
    ...fresh.map(x => x.q)
  ]
}

// 统计四个池子的计数
export function getPoolCounts(questions, progressMap) {
  let hotWrong = 0, pending = 0, coldWrong = 0, fresh = 0, mastered = 0
  questions.forEach(q => {
    const pool = getPool(progressMap[q.id])
    if (pool === 'hotWrong') hotWrong++
    else if (pool === 'pending') pending++
    else if (pool === 'coldWrong') coldWrong++
    else if (pool === 'new') fresh++
    else if (pool === 'mastered') mastered++
  })
  return { hotWrong, pending, coldWrong, new: fresh, mastered }
}

export function formatTimeRemaining(nextReviewTime) {
  if (!nextReviewTime) return '未学习'
  const diff = nextReviewTime - Date.now()
  if (diff <= 0) return '待回看'
  const minutes = Math.floor(diff / (60 * 1000))
  const hours = Math.floor(diff / (60 * 60 * 1000))
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  if (days > 0) return `${days}天后`
  if (hours > 0) return `${hours}小时后`
  if (minutes > 0) return `${minutes}分钟后`
  return '即将'
}

export { MASTER_STREAK, COLD_WRONG_INTERVAL }

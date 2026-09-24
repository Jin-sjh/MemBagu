const STORAGE_KEY = 'ebbinghaus_progress'
const UI_STATE_KEY = 'ebbinghaus_ui_state'
const AUDIO_PROGRESS_KEY = 'audio_generator_progress'
const LIBRARIES_KEY = 'ebbinghaus_libraries'
const ACTIVE_LIBRARY_KEY = 'ebbinghaus_active_library'

// 全量备份时打包的 localStorage key 前缀（本应用产生的所有数据）
const BACKUP_KEY_PREFIXES = ['ebbinghaus_', 'audio_generator_progress']
export function saveUIState(state) {
  try {
    localStorage.setItem(UI_STATE_KEY, JSON.stringify(state))
    return true
  } catch (e) {
    console.error('Failed to save UI state:', e)
    return false
  }
}

export function loadUIState() {
  try {
    const data = localStorage.getItem(UI_STATE_KEY)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('Failed to load UI state:', e)
    return null
  }
}

export function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('Failed to save to storage:', e)
    return false
  }
}

export function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch (e) {
    console.error('Failed to load from storage:', e)
    return {}
  }
}

export function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (e) {
    console.error('Failed to clear storage:', e)
    return false
  }
}

export function saveAudioProgress(progress) {
  try {
    localStorage.setItem(AUDIO_PROGRESS_KEY, JSON.stringify(progress))
    return true
  } catch (e) {
    console.error('Failed to save audio progress:', e)
    return false
  }
}

export function loadAudioProgress() {
  try {
    const data = localStorage.getItem(AUDIO_PROGRESS_KEY)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('Failed to load audio progress:', e)
    return null
  }
}

export function clearAudioProgress() {
  try {
    localStorage.removeItem(AUDIO_PROGRESS_KEY)
    return true
  } catch (e) {
    console.error('Failed to clear audio progress:', e)
    return false
  }
}

export function saveLibraries(libraries) {
  try {
    localStorage.setItem(LIBRARIES_KEY, JSON.stringify(libraries))
    touchMeta('libraries')
    schedulePush('libraries')
    return true
  } catch (e) {
    console.error('Failed to save libraries:', e)
    return false
  }
}

export function loadLibraries() {
  try {
    const data = localStorage.getItem(LIBRARIES_KEY)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('Failed to load libraries:', e)
    return null
  }
}

export function getActiveLibraryId() {
  try {
    return localStorage.getItem(ACTIVE_LIBRARY_KEY) || null
  } catch (e) {
    console.error('Failed to get active library id:', e)
    return null
  }
}

export function setActiveLibraryId(id) {
  try {
    localStorage.setItem(ACTIVE_LIBRARY_KEY, id)
    touchMeta('activeLibraryId')
    schedulePush('libraries')
    return true
  } catch (e) {
    console.error('Failed to set active library id:', e)
    return false
  }
}

export function saveProgressByLibrary(libraryId, progress) {
  try {
    const key = `${STORAGE_KEY}_${libraryId}`
    localStorage.setItem(key, JSON.stringify(progress))
    touchMeta('progress', libraryId)
    schedulePush('progress', libraryId)
    return true
  } catch (e) {
    console.error('Failed to save progress by library:', e)
    return false
  }
}

export function loadProgressByLibrary(libraryId) {
  try {
    const key = `${STORAGE_KEY}_${libraryId}`
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : {}
  } catch (e) {
    console.error('Failed to load progress by library:', e)
    return {}
  }
}

export function saveUIStateByLibrary(libraryId, state) {
  try {
    const key = `${UI_STATE_KEY}_${libraryId}`
    localStorage.setItem(key, JSON.stringify(state))
    touchMeta('uiState', libraryId)
    schedulePush('uiState', libraryId)
    return true
  } catch (e) {
    console.error('Failed to save UI state by library:', e)
    return false
  }
}

export function loadUIStateByLibrary(libraryId) {
  try {
    const key = `${UI_STATE_KEY}_${libraryId}`
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('Failed to load UI state by library:', e)
    return null
  }
}

export function clearProgressByLibrary(libraryId) {
  try {
    const key = `${STORAGE_KEY}_${libraryId}`
    localStorage.removeItem(key)
    touchMeta('progress', libraryId)
    schedulePush('progress', libraryId)
    return true
  } catch (e) {
    console.error('Failed to clear progress by library:', e)
    return false
  }
}

export function migrateOldData(libraryId) {
  try {
    const oldProgress = localStorage.getItem(STORAGE_KEY)
    const oldUIState = localStorage.getItem(UI_STATE_KEY)

    if (oldProgress && !localStorage.getItem(`${STORAGE_KEY}_${libraryId}`)) {
      const newKey = `${STORAGE_KEY}_${libraryId}`
      localStorage.setItem(newKey, oldProgress)
      console.log('Migrated progress data to library:', libraryId)
    }

    if (oldUIState && !localStorage.getItem(`${UI_STATE_KEY}_${libraryId}`)) {
      const newKey = `${UI_STATE_KEY}_${libraryId}`
      localStorage.setItem(newKey, oldUIState)
      console.log('Migrated UI state data to library:', libraryId)
    }

    return true
  } catch (e) {
    console.error('Failed to migrate old data:', e)
    return false
  }
}

export function hasOldData() {
  return localStorage.getItem(STORAGE_KEY) !== null ||
         localStorage.getItem(UI_STATE_KEY) !== null
}

// ---------- 本地 SQLite 同步（server/audio-server.js 同机提供 /api/sync） ----------
// localStorage 始终是前端工作副本：每次写入后防抖推送到本地 SQLite；
// 启动时由 App.vue 调 pullSnapshot()，按各数据段的 updated_at 时间戳双向合并
// （同机单用户、时钟一致，"哪边新用哪边"即为正确的冲突策略）。
// 后端不可达时自动降级为纯 localStorage，不影响任何功能。
const META_KEY = 'ebbinghaus_meta'
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
const PUSH_DEBOUNCE_MS = 1500
const SYNC_COOLDOWN_MS = 60000

function readMeta() {
  try {
    return JSON.parse(localStorage.getItem(META_KEY)) || {}
  } catch {
    return {}
  }
}

function writeMeta(meta) {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta))
  } catch {
    // meta 写失败不影响主流程
  }
}

function touchMeta(section, key) {
  const meta = readMeta()
  const now = Date.now()
  if (key === undefined) {
    meta[section] = now
  } else {
    if (!meta[section] || typeof meta[section] !== 'object') meta[section] = {}
    meta[section][key] = now
  }
  writeMeta(meta)
}

export function getMetaTs(section, key) {
  const meta = readMeta()
  const value = key === undefined ? meta[section] : meta[section]?.[key]
  return typeof value === 'number' ? value : 0
}

const pendingPush = {
  libraries: false,
  progress: new Set(),
  uiState: new Set()
}
let pushTimer = null
let syncCooldownUntil = 0

function schedulePush(section, key) {
  if (section === 'libraries') {
    pendingPush.libraries = true
  } else {
    pendingPush[section].add(key)
  }
  if (!pushTimer) {
    pushTimer = setTimeout(() => {
      pushTimer = null
      flushPushNow().catch(() => {})
    }, PUSH_DEBOUNCE_MS)
  }
}

async function probeServer() {
  try {
    const res = await fetch(`${API_BASE}/api/sync/health`, { signal: AbortSignal.timeout(1500) })
    return !!res.ok
  } catch {
    return false
  }
}

async function putJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(5000)
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

async function pushSection(section, key) {
  if (section === 'libraries') {
    let libs = []
    try {
      libs = JSON.parse(localStorage.getItem(LIBRARIES_KEY) || '[]')
    } catch {}
    await putJson('/api/sync/libraries', {
      data: libs,
      activeLibraryId: localStorage.getItem(ACTIVE_LIBRARY_KEY),
      updatedAt: getMetaTs('libraries')
    })
  } else if (section === 'progress') {
    let data = {}
    try {
      data = JSON.parse(localStorage.getItem(`${STORAGE_KEY}_${key}`) || '{}')
    } catch {}
    await putJson(`/api/sync/progress/${encodeURIComponent(key)}`, {
      data,
      updatedAt: getMetaTs('progress', key)
    })
  } else if (section === 'uiState') {
    let data = {}
    try {
      data = JSON.parse(localStorage.getItem(`${UI_STATE_KEY}_${key}`) || '{}')
    } catch {}
    await putJson(`/api/sync/ui-state/${encodeURIComponent(key)}`, {
      data,
      updatedAt: getMetaTs('uiState', key)
    })
  }
}

// 把当前积累的待推送数据刷到本地 SQLite；失败进入冷却期，之后的写入会再次调度重试
async function flushPushNow() {
  if (Date.now() < syncCooldownUntil) return
  if (!(await probeServer())) {
    syncCooldownUntil = Date.now() + SYNC_COOLDOWN_MS
    return
  }

  const jobs = []
  const descs = []
  if (pendingPush.libraries) {
    jobs.push(pushSection('libraries'))
    descs.push({ section: 'libraries' })
  }
  for (const libId of pendingPush.progress) {
    jobs.push(pushSection('progress', libId))
    descs.push({ section: 'progress', key: libId })
  }
  for (const libId of pendingPush.uiState) {
    jobs.push(pushSection('uiState', libId))
    descs.push({ section: 'uiState', key: libId })
  }
  pendingPush.libraries = false
  pendingPush.progress = new Set()
  pendingPush.uiState = new Set()

  const results = await Promise.allSettled(jobs)
  let failed = false
  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      failed = true
      const { section, key } = descs[i]
      if (section === 'libraries') pendingPush.libraries = true
      else pendingPush[section].add(key)
    }
  })
  if (failed) {
    syncCooldownUntil = Date.now() + SYNC_COOLDOWN_MS
  }
}

// 启动时拉取本地 SQLite 快照；返回 null 表示后端不可用
export async function pullSnapshot() {
  try {
    const res = await fetch(`${API_BASE}/api/sync/snapshot`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null
    const json = await res.json()
    return json?.data || null
  } catch {
    return null
  }
}

// ---------- 全量备份：导出/导入 localStorage 中本应用的全部数据 ----------

// 导出所有题库配置、各库复习进度、界面状态，下载为 JSON 文件。
export function exportAllData() {
  try {
    const dump = {
      __app: 'ebbinghaus-memory',
      __exported_at: new Date().toISOString(),
      data: {}
    }
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && BACKUP_KEY_PREFIXES.some(prefix => key.startsWith(prefix))) {
        dump.data[key] = localStorage.getItem(key)
      }
    }

    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ebbinghaus-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    return true
  } catch (e) {
    console.error('Failed to export data:', e)
    return false
  }
}

// 从备份 JSON 恢复：先清掉本应用的旧 key，再写入备份内容，完成后刷新页面。
// 不解析每个字段的具体结构，按原始字符串原样写回，保证向前兼容。
export function importAllData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const dump = JSON.parse(e.target.result)
        const data = dump?.data
        if (!data || typeof data !== 'object' || dump?.__app !== 'ebbinghaus-memory') {
          reject(new Error('不是本应用导出的备份文件'))
          return
        }

        const staleKeys = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && BACKUP_KEY_PREFIXES.some(prefix => key.startsWith(prefix))) {
            staleKeys.push(key)
          }
        }
        staleKeys.forEach(key => localStorage.removeItem(key))

        Object.entries(data).forEach(([key, value]) => {
          if (typeof value === 'string') {
            localStorage.setItem(key, value)
          }
        })

        // 导入内容视为最新：刷新各数据段时间戳，随后推送覆盖本地 SQLite
        touchMeta('libraries')
        touchMeta('activeLibraryId')
        for (const key of Object.keys(data)) {
          if (key.startsWith(`${STORAGE_KEY}_`)) {
            touchMeta('progress', key.slice(STORAGE_KEY.length + 1))
          }
          if (key.startsWith(`${UI_STATE_KEY}_`)) {
            touchMeta('uiState', key.slice(UI_STATE_KEY.length + 1))
          }
        }
        await flushPushNow().catch(() => {})

        window.location.reload()
        resolve(true)
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Invalid backup file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

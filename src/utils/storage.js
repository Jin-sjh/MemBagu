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
    reader.onload = (e) => {
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

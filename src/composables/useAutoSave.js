import { ref, onMounted, onUnmounted } from 'vue'

const AUTO_SAVE_INTERVAL = 30000
const LAST_SAVE_KEY = 'ebbinghaus_last_save_time'

const lastSaveTime = ref(null)
const isSaving = ref(false)
const saveStatus = ref('idle')

let autoSaveTimer = null
let pendingSaveCallback = null

export function useAutoSave() {
  function startAutoSave(saveCallback, interval = AUTO_SAVE_INTERVAL) {
    pendingSaveCallback = saveCallback
    
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer)
    }
    
    autoSaveTimer = setInterval(async () => {
      await performSave()
    }, interval)
    
    loadLastSaveTime()
  }

  function stopAutoSave() {
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer)
      autoSaveTimer = null
    }
  }

  async function performSave() {
    if (!pendingSaveCallback || isSaving.value) return
    
    isSaving.value = true
    saveStatus.value = 'saving'
    
    try {
      await pendingSaveCallback()
      lastSaveTime.value = Date.now()
      saveLastSaveTime()
      saveStatus.value = 'saved'
      
      setTimeout(() => {
        if (saveStatus.value === 'saved') {
          saveStatus.value = 'idle'
        }
      }, 2000)
    } catch (error) {
      console.error('Auto save failed:', error)
      saveStatus.value = 'error'
      
      setTimeout(() => {
        if (saveStatus.value === 'error') {
          saveStatus.value = 'idle'
        }
      }, 3000)
    } finally {
      isSaving.value = false
    }
  }

  function saveLastSaveTime() {
    try {
      localStorage.setItem(LAST_SAVE_KEY, lastSaveTime.value.toString())
    } catch (e) {
      console.error('Failed to save last save time:', e)
    }
  }

  function loadLastSaveTime() {
    try {
      const saved = localStorage.getItem(LAST_SAVE_KEY)
      if (saved) {
        lastSaveTime.value = parseInt(saved, 10)
      }
    } catch (e) {
      console.error('Failed to load last save time:', e)
    }
  }

  function formatLastSaveTime() {
    if (!lastSaveTime.value) return '从未保存'
    
    const now = Date.now()
    const diff = now - lastSaveTime.value
    
    if (diff < 60000) {
      return '刚刚保存'
    } else if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000)
      return `${minutes}分钟前保存`
    } else if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)
      return `${hours}小时前保存`
    } else {
      const days = Math.floor(diff / 86400000)
      return `${days}天前保存`
    }
  }

  onMounted(() => {
    loadLastSaveTime()
    
    window.addEventListener('beforeunload', handleBeforeUnload)
  })

  onUnmounted(() => {
    stopAutoSave()
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })

  function handleBeforeUnload(event) {
    if (isSaving.value) {
      event.preventDefault()
      event.returnValue = '数据正在保存中，确定要离开吗？'
      return event.returnValue
    }
  }

  return {
    lastSaveTime,
    isSaving,
    saveStatus,
    startAutoSave,
    stopAutoSave,
    performSave,
    formatLastSaveTime
  }
}

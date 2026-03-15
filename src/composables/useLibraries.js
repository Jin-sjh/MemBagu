import { ref, computed } from 'vue'
import {
  saveLibraries as saveLibrariesToStorage,
  loadLibraries as loadLibrariesFromStorage,
  getActiveLibraryId,
  setActiveLibraryId,
  migrateOldData
} from '../utils/storage'

const libraries = ref([])
const activeLibraryId = ref(null)

const API_BASE_URL = 'http://localhost:3002'

const defaultLibrary = {
  id: 'frontend',
  name: '前端八股库',
  description: '前端面试题库',
  color: '#3498db',
  createdAt: Date.now()
}

export function useLibraries() {
  const activeLibrary = computed(() => {
    return libraries.value.find(lib => lib.id === activeLibraryId.value) || null
  })

  function loadLibraries() {
    const saved = loadLibrariesFromStorage()
    if (saved && saved.length > 0) {
      libraries.value = saved
    } else {
      libraries.value = [defaultLibrary]
      saveLibrariesToStorage(libraries.value)
    }

    const savedActiveId = getActiveLibraryId()
    if (savedActiveId && libraries.value.find(lib => lib.id === savedActiveId)) {
      activeLibraryId.value = savedActiveId
    } else {
      activeLibraryId.value = libraries.value[0]?.id || 'frontend'
      setActiveLibraryId(activeLibraryId.value)
    }

    migrateOldData(activeLibraryId.value)
  }

  function createLibrary(config) {
    const newLibrary = {
      id: config.id || generateLibraryId(config.name),
      name: config.name,
      description: config.description || '',
      color: config.color || getRandomColor(),
      createdAt: Date.now()
    }

    if (libraries.value.find(lib => lib.id === newLibrary.id)) {
      return { success: false, error: '库ID已存在' }
    }

    // 先调用后端 API 创建文件夹
    createLibraryFolder(newLibrary.id, newLibrary.name)

    libraries.value.push(newLibrary)
    saveLibrariesToStorage(libraries.value)

    return { success: true, library: newLibrary }
  }

  function updateLibrary(id, updates) {
    const index = libraries.value.findIndex(lib => lib.id === id)
    if (index === -1) {
      return { success: false, error: '库不存在' }
    }

    libraries.value[index] = {
      ...libraries.value[index],
      ...updates
    }
    saveLibrariesToStorage(libraries.value)

    return { success: true, library: libraries.value[index] }
  }

  function deleteLibrary(id) {
    if (libraries.value.length <= 1) {
      return { success: false, error: '至少保留一个库' }
    }

    const index = libraries.value.findIndex(lib => lib.id === id)
    if (index === -1) {
      return { success: false, error: '库不存在' }
    }

    libraries.value.splice(index, 1)
    saveLibrariesToStorage(libraries.value)

    if (activeLibraryId.value === id) {
      activeLibraryId.value = libraries.value[0]?.id
      setActiveLibraryId(activeLibraryId.value)
    }

    return { success: true }
  }

  function switchLibrary(id) {
    const library = libraries.value.find(lib => lib.id === id)
    if (!library) {
      return { success: false, error: '库不存在' }
    }

    activeLibraryId.value = id
    setActiveLibraryId(id)

    return { success: true, library }
  }

  function getLibraryById(id) {
    return libraries.value.find(lib => lib.id === id) || null
  }

  async function createLibraryFolder(id, name) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/libraries/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, name })
      })

      if (!response.ok) {
        console.warn(`创建文件夹失败: HTTP ${response.status}`)
        return { success: false, error: `HTTP错误: ${response.status}` }
      }

      const result = await response.json()

      if (!result.success && !result.exists) {
        console.warn(`创建文件夹失败: ${result.error || '未知错误'}`)
      }

      return result
    } catch (error) {
      console.warn('调用后端 API 创建文件夹失败:', error.message)
      return { success: false, error: error.message }
    }
  }

  async function deleteLibraryFolder(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/libraries/${id}/folder`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        console.warn(`删除文件夹失败: HTTP ${response.status}`)
        return { success: false, error: `HTTP错误: ${response.status}` }
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.warn('调用后端 API 删除文件夹失败:', error.message)
      return { success: false, error: error.message }
    }
  }

  return {
    libraries,
    activeLibraryId,
    activeLibrary,
    loadLibraries,
    createLibrary,
    updateLibrary,
    deleteLibrary,
    switchLibrary,
    getLibraryById,
    createLibraryFolder,
    deleteLibraryFolder
  }
}

function generateLibraryId(name) {
  const baseId = name.toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '')
  const timestamp = Date.now().toString(36)
  return `${baseId}-${timestamp}`
}

function getRandomColor() {
  const colors = [
    '#3498db', '#e74c3c', '#2ecc71', '#f39c12',
    '#9b59b6', '#1abc9c', '#e67e22', '#34495e',
    '#16a085', '#c0392b', '#8e44ad', '#27ae60'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

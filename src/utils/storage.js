const STORAGE_KEY = 'ebbinghaus_progress'
const UI_STATE_KEY = 'ebbinghaus_ui_state'
const AUDIO_PROGRESS_KEY = 'audio_generator_progress'
const LIBRARIES_KEY = 'ebbinghaus_libraries'
const ACTIVE_LIBRARY_KEY = 'ebbinghaus_active_library'

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
    console.error('Failed to save to localStorage:', e)
    return false
  }
}

export function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch (e) {
    console.error('Failed to load from localStorage:', e)
    return {}
  }
}

export function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (e) {
    console.error('Failed to clear localStorage:', e)
    return false
  }
}

export function exportData(progressMap) {
  const data = JSON.stringify(progressMap, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ebbinghaus-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
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

export function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        resolve(data)
      } catch (err) {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
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
      console.log('Migrated UI state to library:', libraryId)
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

import { supabase, getCurrentUser, isSupabaseConfigured } from './supabase.js'

export async function syncProgressToCloud(libraryId, progress) {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' }
  
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  
  const records = Object.entries(progress).map(([questionId, data]) => ({
    user_id: user.id,
    library_id: libraryId,
    question_id: questionId,
    status: data.status || 'new',
    next_review: data.nextReview || null,
    review_count: data.reviewCount || 0,
    ease_factor: data.easeFactor || 2.5,
    interval: data.interval || 0
  }))
  
  if (records.length === 0) return { success: true }
  
  const { error } = await supabase
    .from('progress')
    .upsert(records, { onConflict: 'user_id,library_id,question_id' })
  
  if (error) {
    console.error('Failed to sync progress to cloud:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

export async function loadProgressFromCloud(libraryId) {
  if (!isSupabaseConfigured()) return { success: false, data: {} }
  
  const user = await getCurrentUser()
  if (!user) return { success: false, data: {} }
  
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('library_id', libraryId)
  
  if (error) {
    console.error('Failed to load progress from cloud:', error)
    return { success: false, data: {} }
  }
  
  const progress = {}
  if (data) {
    data.forEach(record => {
      progress[record.question_id] = {
        status: record.status,
        nextReview: record.next_review,
        reviewCount: record.review_count,
        easeFactor: record.ease_factor,
        interval: record.interval
      }
    })
  }
  
  return { success: true, data: progress }
}

export async function syncUIStateToCloud(libraryId, state) {
  if (!isSupabaseConfigured()) return { success: false }
  
  const user = await getCurrentUser()
  if (!user) return { success: false }
  
  const { error } = await supabase
    .from('ui_state')
    .upsert({
      user_id: user.id,
      library_id: libraryId,
      state: state,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,library_id' })
  
  return !error
}

export async function loadUIStateFromCloud(libraryId) {
  if (!isSupabaseConfigured()) return { success: false, data: null }
  
  const user = await getCurrentUser()
  if (!user) return { success: false, data: null }
  
  const { data, error } = await supabase
    .from('ui_state')
    .select('state')
    .eq('user_id', user.id)
    .eq('library_id', libraryId)
    .single()
  
  if (error) {
    return { success: false, data: null }
  }
  
  return { success: true, data: data?.state || null }
}

export async function syncLibrariesToCloud(libraries) {
  if (!isSupabaseConfigured()) return { success: false }
  
  const user = await getCurrentUser()
  if (!user) return { success: false }
  
  const records = libraries.map(lib => ({
    user_id: user.id,
    library_id: lib.id,
    name: lib.name,
    config: lib.config || {}
  }))
  
  if (records.length === 0) return { success: true }
  
  const { error } = await supabase
    .from('libraries')
    .upsert(records, { onConflict: 'user_id,library_id' })
  
  return !error
}

export async function loadLibrariesFromCloud() {
  if (!isSupabaseConfigured()) return { success: false, data: [] }
  
  const user = await getCurrentUser()
  if (!user) return { success: false, data: [] }
  
  const { data, error } = await supabase
    .from('libraries')
    .select('*')
    .eq('user_id', user.id)
  
  if (error) {
    return { success: false, data: [] }
  }
  
  const libraries = (data || []).map(record => ({
    id: record.library_id,
    name: record.name,
    config: record.config || {}
  }))
  
  return { success: true, data: libraries }
}

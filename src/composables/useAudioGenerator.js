import { ref, computed, watch, onMounted } from 'vue'
import { saveAudioProgress, loadAudioProgress, clearAudioProgress } from '../utils/storage'

const voices = [
  { id: 'zh-CN-XiaoxiaoNeural', name: '晓晓', gender: '女声', style: '自然流畅' },
  { id: 'zh-CN-YunxiNeural', name: '云希', gender: '男声', style: '亲切' },
  { id: 'zh-CN-YunyangNeural', name: '云扬', gender: '男声', style: '新闻播报' },
  { id: 'zh-CN-XiaoyiNeural', name: '晓伊', gender: '女声', style: '活泼' }
]

export function useAudioGenerator() {
  const categories = ref([])
  const selectedCategories = ref([])
  const selectedVoice = ref('zh-CN-XiaoxiaoNeural')
  const rate = ref(0)
  const mode = ref('collection')
  const generating = ref(false)
  const progress = ref(0)
  const currentStatus = ref('')
  const currentFile = ref('')
  const results = ref([])
  const error = ref(null)

  function restoreProgress() {
    const savedProgress = loadAudioProgress()
    if (savedProgress) {
      progress.value = savedProgress.progress || 0
      currentStatus.value = savedProgress.currentStatus || ''
      currentFile.value = savedProgress.currentFile || ''
      results.value = savedProgress.results || []
    }
  }

  function persistProgress() {
    saveAudioProgress({
      progress: progress.value,
      currentStatus: currentStatus.value,
      currentFile: currentFile.value,
      results: results.value
    })
  }

  watch([progress, currentStatus, currentFile, results], () => {
    if (!generating.value && progress.value > 0) {
      persistProgress()
    }
  }, { deep: true })
  
  const totalQuestions = computed(() => {
    return categories.value.reduce((sum, c) => sum + c.count, 0)
  })
  
  const selectedCount = computed(() => {
    if (selectedCategories.value.length === 0) return totalQuestions.value
    return categories.value
      .filter(c => selectedCategories.value.includes(c.name))
      .reduce((sum, c) => sum + c.count, 0)
  })
  
  async function loadCategories() {
    try {
      const response = await fetch('/api/audio/categories')
      const data = await response.json()
      
      if (data.success) {
        categories.value = data.categories
      } else {
        error.value = data.error
      }
    } catch (e) {
      error.value = '无法加载分类数据，请确保后端服务已启动'
    }
  }
  
  function toggleCategory(name) {
    const index = selectedCategories.value.indexOf(name)
    if (index === -1) {
      selectedCategories.value.push(name)
    } else {
      selectedCategories.value.splice(index, 1)
    }
  }
  
  function selectAll() {
    selectedCategories.value = categories.value.map(c => c.name)
  }
  
  function deselectAll() {
    selectedCategories.value = []
  }
  
  async function generateAudio() {
    if (generating.value) return
    
    generating.value = true
    progress.value = 0
    currentStatus.value = '准备生成...'
    currentFile.value = ''
    results.value = []
    error.value = null
    clearAudioProgress()
    
    const endpoint = mode.value === 'collection' 
      ? '/api/audio/collection' 
      : '/api/audio/generate'
    
    const body = {
      categories: selectedCategories.value.length > 0 ? selectedCategories.value : null,
      options: {
        voice: selectedVoice.value,
        rate: rate.value
      }
    }
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const text = decoder.decode(value)
        const lines = text.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.progress !== undefined) {
                progress.value = data.progress
                persistProgress()
              }
              
              if (data.status) {
                currentStatus.value = getStatusText(data.status)
                persistProgress()
              }
              
              if (data.file) {
                currentFile.value = data.file
                persistProgress()
              }
              
              if (data.done && data.result) {
                if (mode.value === 'collection') {
                  results.value = [{
                    filename: data.result.filename,
                    url: data.result.url,
                    isCollection: true
                  }]
                } else {
                  results.value = data.result.files.map(f => ({
                    filename: f.filename,
                    category: f.category,
                    topic: f.topic
                  }))
                }
                persistProgress()
              }
              
              if (data.error) {
                error.value = data.error
              }
            } catch (e) {}
          }
        }
      }
    } catch (e) {
      error.value = '生成失败：' + e.message
    } finally {
      generating.value = false
      currentStatus.value = '生成完成'
    }
  }
  
  function getStatusText(status) {
    const statusMap = {
      'generating': '正在生成音频...',
      'generating_intro': '正在生成开场白...',
      'generating_outro': '正在生成结束语...',
      'generating_category': '正在生成分类介绍...',
      'merging': '正在合并音频文件...',
      'completed': '生成完成',
      'skipped': '跳过',
      'error': '生成失败'
    }
    return statusMap[status] || status
  }
  
  async function loadExistingFiles() {
    try {
      const response = await fetch('/api/audio/list')
      const data = await response.json()
      
      if (data.success) {
        return data.files
      }
      return []
    } catch (e) {
      return []
    }
  }
  
  const previewLoading = ref(false)
  const previewPlaying = ref(false)
  const previewError = ref(null)
  let audioElement = null
  
  const previewText = '你好，这是一个语音试听测试。欢迎使用八股记忆音频生成功能。'
  
  async function playPreview() {
    if (previewPlaying.value) {
      stopPreview()
      return
    }
    
    previewLoading.value = true
    previewError.value = null
    
    try {
      const response = await fetch('/api/audio/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voice: selectedVoice.value,
          rate: rate.value,
          text: previewText
        })
      })
      
      if (!response.ok) {
        throw new Error('试听生成失败')
      }
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      if (audioElement) {
        audioElement.pause()
        URL.revokeObjectURL(audioElement.src)
      }
      
      audioElement = new Audio(url)
      audioElement.onended = () => {
        previewPlaying.value = false
        URL.revokeObjectURL(url)
      }
      audioElement.onerror = () => {
        previewPlaying.value = false
        previewError.value = '音频播放失败'
        URL.revokeObjectURL(url)
      }
      
      await audioElement.play()
      previewPlaying.value = true
      
    } catch (e) {
      previewError.value = '试听失败：' + e.message
    } finally {
      previewLoading.value = false
    }
  }
  
  function stopPreview() {
    if (audioElement) {
      audioElement.pause()
      audioElement.currentTime = 0
    }
    previewPlaying.value = false
  }
  
  function clearProgress() {
    progress.value = 0
    currentStatus.value = ''
    currentFile.value = ''
    results.value = []
    clearAudioProgress()
  }

  return {
    voices,
    categories,
    selectedCategories,
    selectedVoice,
    rate,
    mode,
    generating,
    progress,
    currentStatus,
    currentFile,
    results,
    error,
    totalQuestions,
    selectedCount,
    previewLoading,
    previewPlaying,
    previewError,
    previewText,
    loadCategories,
    toggleCategory,
    selectAll,
    deselectAll,
    generateAudio,
    loadExistingFiles,
    playPreview,
    stopPreview,
    restoreProgress,
    clearProgress
  }
}

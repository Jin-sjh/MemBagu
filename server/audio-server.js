import express from 'express'
import { createReadStream, existsSync, readdirSync, statSync, mkdirSync, unlinkSync, rmSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const audioDir = join(rootDir, 'audio')
const tempDir = join(audioDir, 'temp')
const dataDir = join(rootDir, 'src', 'data')

if (!existsSync(tempDir)) {
  mkdirSync(tempDir, { recursive: true })
}

const app = express()
app.use(express.json())

// CORS 支持
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

// 验证 ID 合法性：只允许字母、数字、中文和连字符
function isValidId(id) {
  if (!id || typeof id !== 'string') return false
  // 匹配字母、数字、中文字符和连字符
  return /^[\u4e00-\u9fa5a-zA-Z0-9-]+$/.test(id)
}

// 创建题库文件夹
app.post('/api/libraries/create', (req, res) => {
  try {
    const { id, name } = req.body
    
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID is required' })
    }
    
    if (!isValidId(id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'ID can only contain letters, numbers, Chinese characters and hyphens' 
      })
    }
    
    const folderPath = join(dataDir, id)
    
    if (existsSync(folderPath)) {
      return res.json({ success: true, path: `src/data/${id}`, exists: true })
    }
    
    mkdirSync(folderPath, { recursive: true })
    res.json({ success: true, path: `src/data/${id}` })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// 删除空文件夹
app.delete('/api/libraries/:id/folder', (req, res) => {
  try {
    const { id } = req.params
    
    if (!isValidId(id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid ID format' 
      })
    }
    
    const folderPath = join(dataDir, id)
    
    if (!existsSync(folderPath)) {
      return res.status(404).json({ success: false, error: 'Folder not found' })
    }
    
    const files = readdirSync(folderPath)
    if (files.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Folder is not empty' 
      })
    }
    
    rmSync(folderPath, { type: 'dir' })
    res.json({ success: true, message: 'Folder deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// 检查文件夹是否存在
app.get('/api/libraries/:id/exists', (req, res) => {
  try {
    const { id } = req.params
    
    if (!isValidId(id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid ID format' 
      })
    }
    
    const folderPath = join(dataDir, id)
    const exists = existsSync(folderPath)
    
    res.json({ success: true, exists })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/api/audio/categories', async (req, res) => {
  try {
    const { getAvailableCategories, getQuestionCount } = await import('../scripts/audio-generator.js')
    const categories = getAvailableCategories()
    const counts = getQuestionCount()
    
    res.json({
      success: true,
      categories: categories.map(c => ({
        name: c,
        count: counts[c] || 0
      }))
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/audio/generate', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  
  const { categories, options = {} } = req.body
  
  try {
    const { generateSeparateFiles } = await import('../scripts/audio-generator.js')
    
    const result = await generateSeparateFiles(
      { categories, ...options },
      (progress) => {
        res.write(`data: ${JSON.stringify(progress)}\n\n`)
      }
    )
    
    res.write(`data: ${JSON.stringify({ done: true, result })}\n\n`)
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`)
  }
  
  res.end()
})

app.post('/api/audio/collection', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  
  const { categories, options = {} } = req.body
  
  try {
    const { generateCollection } = await import('../scripts/audio-generator.js')
    
    const result = await generateCollection(
      { categories, ...options },
      (progress) => {
        res.write(`data: ${JSON.stringify(progress)}\n\n`)
      }
    )
    
    res.write(`data: ${JSON.stringify({ done: true, result })}\n\n`)
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`)
  }
  
  res.end()
})

app.get('/api/audio/download/:filename', (req, res) => {
  const filename = req.params.filename
  const filePath = join(audioDir, filename)
  
  if (!existsSync(filePath)) {
    if (existsSync(audioDir)) {
      const files = readdirSync(audioDir)
      const matchingFile = files.find(f => f.includes(filename) || filename.includes(f.replace('.mp3', '')))
      
      if (matchingFile) {
        const matchingPath = join(audioDir, matchingFile)
        return sendAudioFile(req, res, matchingPath, matchingFile)
      }
    }
    
    return res.status(404).json({ error: 'File not found' })
  }
  
  return sendAudioFile(req, res, filePath, filename)
})

function sendAudioFile(req, res, filePath, filename) {
  const stat = statSync(filePath)
  const fileSize = stat.size
  const range = req.headers.range
  
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
    const chunksize = (end - start) + 1
    const file = createReadStream(filePath, { start, end })
    
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`
    })
    
    file.pipe(res)
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`
    })
    
    createReadStream(filePath).pipe(res)
  }
}

app.get('/api/audio/list', (req, res) => {
  try {
    if (!existsSync(audioDir)) {
      return res.json({ success: true, files: [] })
    }
    
    const files = readdirSync(audioDir)
      .filter(f => f.endsWith('.mp3'))
      .map(f => {
        const filePath = join(audioDir, f)
        const stat = statSync(filePath)
        return {
          filename: f,
          size: stat.size,
          created: stat.mtime,
          url: `/api/audio/download/${f}`
        }
      })
    
    res.json({ success: true, files })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/audio/preview', async (req, res) => {
  const { voice = 'zh-CN-XiaoxiaoNeural', rate = 0, text } = req.body
  
  if (!text) {
    return res.status(400).json({ success: false, error: 'Text is required' })
  }
  
  try {
    const { toVoice } = await import('edge-tts-nodejs')
    const previewId = `preview_${Date.now()}.mp3`
    const previewPath = join(tempDir, previewId)
    
    await toVoice(text, previewPath, {
      voice,
      rate,
      volume: 0,
      pitch: 0
    })
    
    const stat = statSync(previewPath)
    
    res.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `inline; filename="${previewId}"`
    })
    
    createReadStream(previewPath).pipe(res)
    
    setTimeout(() => {
      try {
        unlinkSync(previewPath)
      } catch (e) {}
    }, 5000)
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

const PORT = process.env.PORT || 3002
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'

app.listen(PORT, HOST, () => {
  console.log(`Audio server running on http://${HOST}:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

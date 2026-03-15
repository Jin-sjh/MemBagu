import { toVoice } from 'edge-tts-nodejs'
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync, statSync } from 'fs'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'
import {
  cleanMarkdown,
  formatQuestionAnswer,
  formatCategoryIntro,
  formatIntro,
  formatOutro,
  truncateText
} from './utils/text-cleaner.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const dataDir = join(rootDir, 'src', 'data')
const outputDir = join(rootDir, 'audio')

function parseMarkdownFile(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const questions = []
  
  let currentQuestion = null
  let currentAnswer = null
  let title = ''
  let inQuestion = false
  let inAnswer = false
  
  for (const line of lines) {
    if (line.startsWith('# ')) {
      title = line.slice(2).trim()
      continue
    }
    
    if (line.match(/^#{1,3}\s*【问题】/) || line.match(/^【问题】/)) {
      if (currentQuestion !== null && currentQuestion.trim()) {
        questions.push({
          question: currentQuestion.trim(),
          answer: currentAnswer ? currentAnswer.trim() : ''
        })
      }
      currentQuestion = ''
      currentAnswer = null
      inQuestion = true
      inAnswer = false
      continue
    }
    
    if (line.match(/^#{1,3}\s*【回答】/) || line.match(/^【回答】/)) {
      currentAnswer = ''
      inQuestion = false
      inAnswer = true
      continue
    }
    
    if (inQuestion) {
      currentQuestion += (currentQuestion ? '\n' : '') + line
    } else if (inAnswer) {
      currentAnswer += (currentAnswer ? '\n' : '') + line
    }
  }
  
  if (currentQuestion !== null && currentQuestion.trim()) {
    questions.push({
      question: currentQuestion.trim(),
      answer: currentAnswer ? currentAnswer.trim() : ''
    })
  }
  
  return { title, questions }
}

function extractCategory(filename) {
  const basename = filename.replace('.md', '')
  const parts = basename.split('_')
  return parts[0] || 'Other'
}

function extractTopic(filename) {
  const basename = filename.replace('.md', '')
  const parts = basename.split('_')
  return parts[1] || basename
}

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*]/g, '_').substring(0, 50)
}

async function generateSingleAudio(text, outputPath, options = {}) {
  const {
    voice = 'zh-CN-XiaoxiaoNeural',
    rate = 0,
    volume = 0,
    pitch = 0
  } = options
  
  try {
    await toVoice(text, outputPath, {
      voice,
      rate,
      volume,
      pitch
    })
    return { success: true, path: outputPath }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function generateSeparateFiles(options = {}, onProgress = () => {}) {
  const {
    categories = null,
    voice = 'zh-CN-XiaoxiaoNeural',
    rate = 0
  } = options
  
  ensureDir(outputDir)
  
  const files = readdirSync(dataDir).filter(f => f.endsWith('.md'))
  const results = []
  let processed = 0
  let total = files.length
  
  for (const file of files) {
    const category = extractCategory(file)
    
    if (categories && !categories.includes(category)) {
      processed++
      continue
    }
    
    const topic = extractTopic(file)
    const filePath = join(dataDir, file)
    const { title, questions } = parseMarkdownFile(filePath)
    
    if (questions.length === 0) {
      processed++
      onProgress({
        progress: Math.round((processed / total) * 100),
        file,
        status: 'skipped',
        reason: 'No questions found'
      })
      continue
    }
    
    const categoryDir = join(outputDir, `${category}_${topic}`)
    ensureDir(categoryDir)
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      const text = formatQuestionAnswer(q.question, q.answer)
      const truncatedText = truncateText(text)
      
      const questionPreview = cleanMarkdown(q.question).substring(0, 20)
      const filename = `${String(i + 1).padStart(2, '0')}_${sanitizeFilename(questionPreview)}.mp3`
      const outputPath = join(categoryDir, filename)
      
      onProgress({
        progress: Math.round((processed / total) * 100),
        file,
        question: i + 1,
        totalQuestions: questions.length,
        status: 'generating'
      })
      
      const result = await generateSingleAudio(truncatedText, outputPath, { voice, rate })
      
      if (result.success) {
        results.push({
          file,
          category,
          topic,
          questionIndex: i + 1,
          outputPath,
          filename
        })
      }
    }
    
    processed++
    onProgress({
      progress: Math.round((processed / total) * 100),
      file,
      status: 'completed'
    })
  }
  
  return {
    success: true,
    files: results,
    outputDir
  }
}

export async function generateCollection(options = {}, onProgress = () => {}) {
  const {
    categories = null,
    voice = 'zh-CN-XiaoxiaoNeural',
    rate = 0
  } = options
  
  ensureDir(outputDir)
  
  const files = readdirSync(dataDir).filter(f => f.endsWith('.md'))
  const categoryData = {}
  
  for (const file of files) {
    const category = extractCategory(file)
    
    if (categories && !categories.includes(category)) {
      continue
    }
    
    const topic = extractTopic(file)
    const filePath = join(dataDir, file)
    const { questions } = parseMarkdownFile(filePath)
    
    if (!categoryData[category]) {
      categoryData[category] = []
    }
    
    categoryData[category].push({
      topic,
      questions
    })
  }
  
  const tempDir = join(outputDir, 'temp')
  ensureDir(tempDir)
  
  const audioSegments = []
  let segmentIndex = 0
  const totalCategories = Object.keys(categoryData).length
  let processedCategories = 0
  
  const introText = formatIntro()
  const introPath = join(tempDir, `segment_${segmentIndex++}.mp3`)
  
  onProgress({
    progress: 0,
    status: 'generating_intro'
  })
  
  await generateSingleAudio(introText, introPath, { voice, rate })
  audioSegments.push(introPath)
  
  for (const [category, topics] of Object.entries(categoryData)) {
    const totalQuestions = topics.reduce((sum, t) => sum + t.questions.length, 0)
    
    const categoryIntro = formatCategoryIntro(category, totalQuestions)
    const categoryIntroPath = join(tempDir, `segment_${segmentIndex++}.mp3`)
    
    onProgress({
      progress: Math.round((processedCategories / totalCategories) * 50),
      status: 'generating_category',
      category
    })
    
    await generateSingleAudio(categoryIntro, categoryIntroPath, { voice, rate })
    audioSegments.push(categoryIntroPath)
    
    for (const { topic, questions } of topics) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        const text = formatQuestionAnswer(q.question, q.answer)
        const truncatedText = truncateText(text)
        const segmentPath = join(tempDir, `segment_${segmentIndex++}.mp3`)
        
        await generateSingleAudio(truncatedText, segmentPath, { voice, rate })
        audioSegments.push(segmentPath)
      }
    }
    
    processedCategories++
  }
  
  const outroText = formatOutro()
  const outroPath = join(tempDir, `segment_${segmentIndex++}.mp3`)
  
  onProgress({
    progress: 80,
    status: 'generating_outro'
  })
  
  await generateSingleAudio(outroText, outroPath, { voice, rate })
  audioSegments.push(outroPath)
  
  onProgress({
    progress: 90,
    status: 'merging'
  })
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19)
  const collectionFilename = `八股记忆合集_${timestamp}.mp3`
  const collectionPath = join(outputDir, collectionFilename)
  
  const { mergeAudioFiles } = await import('./utils/audio-merger.js')
  await mergeAudioFiles(audioSegments, collectionPath)
  
  for (const segment of audioSegments) {
    try {
      unlinkSync(segment)
    } catch (e) {}
  }
  
  try {
    unlinkSync(tempDir)
  } catch (e) {}
  
  onProgress({
    progress: 100,
    status: 'completed'
  })
  
  return {
    success: true,
    filename: collectionFilename,
    path: collectionPath,
    url: `/api/audio/download/${collectionFilename}`
  }
}

export function getAvailableCategories() {
  const files = readdirSync(dataDir).filter(f => f.endsWith('.md'))
  const categories = new Set()
  
  for (const file of files) {
    categories.add(extractCategory(file))
  }
  
  return Array.from(categories).sort()
}

export function getQuestionCount(categories = null) {
  const files = readdirSync(dataDir).filter(f => f.endsWith('.md'))
  const counts = {}
  
  for (const file of files) {
    const category = extractCategory(file)
    
    if (categories && !categories.includes(category)) {
      continue
    }
    
    const filePath = join(dataDir, file)
    const { questions } = parseMarkdownFile(filePath)
    
    if (!counts[category]) {
      counts[category] = 0
    }
    counts[category] += questions.length
  }
  
  return counts
}

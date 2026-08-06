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

// 解析 YAML frontmatter（与前端 src/utils/parser.js 保持一致的轻量实现）
function parseFrontmatter(content) {
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!fmMatch) return { frontmatter: null, body: content }

  const yamlBlock = fmMatch[1]
  const body = content.slice(fmMatch[0].length)
  const frontmatter = {}

  for (const line of yamlBlock.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim()

    if (value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1).trim()
      frontmatter[key] = inner
        ? inner.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''))
        : []
    } else {
      frontmatter[key] = value.replace(/^["']|["']$/g, '')
    }
  }

  return { frontmatter, body }
}

// 是否为 README 文件（任意层级），与前端 parser.js 的排除逻辑一致
function isReadme(filepath) {
  return filepath.split('/').pop().toLowerCase() === 'readme.md'
}

// 读取 md 文件并解析 frontmatter，返回正文（不含 frontmatter）
function readMarkdownFile(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  const { frontmatter, body } = parseFrontmatter(content)
  return { frontmatter, body }
}

// 递归收集 src/data 下所有 md 文件（排除任意层级 README.md），
// 与前端 parser.js 的 import.meta.glob('../data/**/*.md') 行为对齐
function getAllMarkdownFiles(dir = dataDir) {
  const results = []
  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...getAllMarkdownFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.md') && !isReadme(fullPath)) {
      results.push(fullPath)
    }
  }

  return results
}

function parseMarkdownFile(filePath, content) {
  const text = content !== undefined ? content : readFileSync(filePath, 'utf-8')
  const lines = text.split('\n')
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

function extractCategory(filePath, frontmatter) {
  if (frontmatter && frontmatter.category) return frontmatter.category
  const filename = filePath.split('/').pop().replace('.md', '')
  const parts = filename.split('_')
  return parts[0] || 'Other'
}

function extractTopic(filePath, frontmatter) {
  if (frontmatter && frontmatter.topic) return frontmatter.topic
  const filename = filePath.split('/').pop().replace('.md', '')
  const parts = filename.split('_')
  return parts[1] || filename
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
  
  const files = getAllMarkdownFiles()
  const results = []
  let processed = 0
  let total = files.length
  
  for (const filePath of files) {
    const { frontmatter, body } = readMarkdownFile(filePath)
    const category = extractCategory(filePath, frontmatter)
    
    if (categories && !categories.includes(category)) {
      processed++
      continue
    }
    
    const topic = extractTopic(filePath, frontmatter)
    const { questions } = parseMarkdownFile(filePath, body)
    
    if (questions.length === 0) {
      processed++
      onProgress({
        progress: Math.round((processed / total) * 100),
        file: basename(filePath),
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
        file: basename(filePath),
        question: i + 1,
        totalQuestions: questions.length,
        status: 'generating'
      })
      
      const result = await generateSingleAudio(truncatedText, outputPath, { voice, rate })
      
      if (result.success) {
        results.push({
          file: basename(filePath),
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
      file: basename(filePath),
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
  
  const files = getAllMarkdownFiles()
  const categoryData = {}
  
  for (const filePath of files) {
    const { frontmatter, body } = readMarkdownFile(filePath)
    const category = extractCategory(filePath, frontmatter)
    
    if (categories && !categories.includes(category)) {
      continue
    }
    
    const topic = extractTopic(filePath, frontmatter)
    const { questions } = parseMarkdownFile(filePath, body)
    
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
  const files = getAllMarkdownFiles()
  const categories = new Set()
  
  for (const filePath of files) {
    const { frontmatter } = readMarkdownFile(filePath)
    categories.add(extractCategory(filePath, frontmatter))
  }
  
  return Array.from(categories).sort()
}

export function getQuestionCount(categories = null) {
  const files = getAllMarkdownFiles()
  const counts = {}
  
  for (const filePath of files) {
    const { frontmatter, body } = readMarkdownFile(filePath)
    const category = extractCategory(filePath, frontmatter)
    
    if (categories && !categories.includes(category)) {
      continue
    }
    
    const { questions } = parseMarkdownFile(filePath, body)
    
    if (!counts[category]) {
      counts[category] = 0
    }
    counts[category] += questions.length
  }
  
  return counts
}

// 解析 YAML frontmatter（轻量实现，不引入额外依赖）
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

function countBoldTerms(text) {
  if (!text) return 0
  const matches = text.match(/\*\*([^*]+)\*\*/g)
  return matches ? matches.length : 0
}

function parseMarkdown(content, filename) {
  const lines = content.split('\n')
  const questions = []

  let currentQuestion = null
  let currentAnswer = null
  let title = ''
  let inQuestion = false
  let inAnswer = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

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
      // 提取【问题】同行之后的内容作为问题正文（兼容顶格【问题】内容 格式）
      const qContent = line.replace(/^#{1,3}\s*【问题】\s*/, '').replace(/^【问题】\s*/, '').trim()
      currentQuestion = qContent
      currentAnswer = null
      inQuestion = true
      inAnswer = false
      continue
    }

    if (line.match(/^#{1,3}\s*【回答】/) || line.match(/^【回答】/)) {
      // 提取【回答】同行之后的内容作为回答正文
      const aContent = line.replace(/^#{1,3}\s*【回答】\s*/, '').replace(/^【回答】\s*/, '').trim()
      currentAnswer = aContent
      inQuestion = false
      inAnswer = true
      continue
    }

    // 遇到其他 【xxx】 增强块（难点分析/考察点/衍生问题/口诀/代码等）时，
    // 结束当前回答收集，增强块独立存在不计入 answer
    if (inAnswer && (line.match(/^#{1,3}\s*【[^】]+】/) || line.match(/^【[^】]+】/))) {
      if (currentQuestion !== null && currentQuestion.trim()) {
        questions.push({
          question: currentQuestion.trim(),
          answer: currentAnswer ? currentAnswer.trim() : ''
        })
        currentQuestion = null
      }
      inAnswer = false
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

  return {
    title,
    questions,
    filename
  }
}

function extractCategory(filename, frontmatter) {
  if (frontmatter && frontmatter.category) return frontmatter.category
  const basename = filename.split('/').pop().replace('.md', '')
  const parts = basename.split('_')
  return parts[0] || 'Other'
}

function extractTopic(filename, frontmatter) {
  if (frontmatter && frontmatter.topic) return frontmatter.topic
  const basename = filename.split('/').pop().replace('.md', '')
  const parts = basename.split('_')
  return parts[1] || basename
}

function generateId(category, topic, index) {
  const cat = category.toLowerCase().replace(/\s+/g, '-')
  const top = topic.toLowerCase().replace(/\s+/g, '-')
  return `${cat}-${top}-${index + 1}`
}

function extractLibraryId(path) {
  const match = path.match(/\/data\/([^/]+)\//)
  return match ? match[1] : 'frontend'
}

function isReadme(path) {
  return path.split('/').pop().toLowerCase() === 'readme.md'
}

const allMdFiles = import.meta.glob(['../data/**/*.md', '!**/README.md'], {
  query: '?raw',
  import: 'default'
})

// 解析单个文件的统一入口
function parseSingleFile(path, raw, libraryId) {
  const { frontmatter, body } = parseFrontmatter(raw)
  const parsed = parseMarkdown(body, path)
  const category = extractCategory(path, frontmatter)
  const topic = extractTopic(path, frontmatter)

  let questions = parsed.questions

  // explain 型无问答块时，将整篇正文作为一条讲解记录
  if (frontmatter && frontmatter.type === 'explain' && questions.length === 0) {
    const bodyLines = body.split('\n')
    let answerBody = body
    if (bodyLines[0] && bodyLines[0].startsWith('# ')) {
      answerBody = bodyLines.slice(1).join('\n').trim()
    }
    questions = [{
      question: parsed.title || topic,
      answer: answerBody
    }]
  }

  return {
    category,
    items: questions.map((q, idx) => ({
      id: generateId(category, topic, idx),
      category,
      topic,
      question: q.question,
      answer: q.answer,
      keyPointsCount: countBoldTerms(q.answer),
      source: path.split('/').pop(),
      libraryId,
      type: frontmatter ? (frontmatter.type || 'bagu') : 'bagu',
      tags: frontmatter ? (frontmatter.tags || []) : [],
      difficulty: frontmatter ? (frontmatter.difficulty || '') : ''
    }))
  }
}

export async function parseAllFiles(libraryId = 'frontend') {
  const categories = new Set()

  // 筛选并并发加载所有目标文件
  const loadTasks = Object.entries(allMdFiles)
    .filter(([path]) => !isReadme(path) && extractLibraryId(path) === libraryId)
    .map(async ([path, loader]) => {
      try {
        const raw = await loader()
        return parseSingleFile(path, raw, libraryId)
      } catch (e) {
        console.error(`Failed to parse ${path}:`, e)
        return null
      }
    })

  const parsedResults = await Promise.all(loadTasks)

  // 合并结果，保持原有顺序（按 category 再按 topic 排序，避免页面随机跳动）
  const allItems = []
  for (const result of parsedResults) {
    if (!result) continue
    categories.add(result.category)
    allItems.push(...result.items)
  }

  return {
    questions: allItems,
    categories: Array.from(categories).sort()
  }
}

export async function getLibraryFiles(libraryId = 'frontend') {
  const files = []

  for (const path of Object.keys(allMdFiles)) {
    if (isReadme(path)) continue

    const fileLibraryId = extractLibraryId(path)

    if (fileLibraryId === libraryId) {
      const filename = path.split('/').pop()
      files.push({
        path,
        filename,
        category: extractCategory(path, null),
        topic: extractTopic(path, null)
      })
    }
  }

  return files
}

export async function getAvailableLibraries() {
  const libraries = new Set()

  for (const path of Object.keys(allMdFiles)) {
    if (isReadme(path)) continue
    const libraryId = extractLibraryId(path)
    libraries.add(libraryId)
  }

  return Array.from(libraries)
}

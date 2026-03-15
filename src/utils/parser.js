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
  
  return {
    title,
    questions,
    filename
  }
}

function extractCategory(filename) {
  const basename = filename.split('/').pop().replace('.md', '')
  const parts = basename.split('_')
  return parts[0] || 'Other'
}

function extractTopic(filename) {
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

const allMdFiles = import.meta.glob('../data/**/*.md', { 
  query: '?raw', 
  import: 'default' 
})

export async function parseAllFiles(libraryId = 'frontend') {
  const results = []
  const categories = new Set()
  
  for (const [path, loader] of Object.entries(allMdFiles)) {
    const fileLibraryId = extractLibraryId(path)
    
    if (fileLibraryId !== libraryId) {
      continue
    }
    
    try {
      const content = await loader()
      const parsed = parseMarkdown(content, path)
      const category = extractCategory(path)
      const topic = extractTopic(path)
      
      categories.add(category)
      
      parsed.questions.forEach((q, idx) => {
        results.push({
          id: generateId(category, topic, idx),
          category,
          topic,
          question: q.question,
          answer: q.answer,
          source: path.split('/').pop(),
          libraryId
        })
      })
    } catch (e) {
      console.error(`Failed to parse ${path}:`, e)
    }
  }
  
  return {
    questions: results,
    categories: Array.from(categories).sort()
  }
}

export async function getLibraryFiles(libraryId = 'frontend') {
  const files = []
  
  for (const path of Object.keys(allMdFiles)) {
    const fileLibraryId = extractLibraryId(path)
    
    if (fileLibraryId === libraryId) {
      const filename = path.split('/').pop()
      files.push({
        path,
        filename,
        category: extractCategory(path),
        topic: extractTopic(path)
      })
    }
  }
  
  return files
}

export async function getAvailableLibraries() {
  const libraries = new Set()
  
  for (const path of Object.keys(allMdFiles)) {
    const libraryId = extractLibraryId(path)
    libraries.add(libraryId)
  }
  
  return Array.from(libraries)
}

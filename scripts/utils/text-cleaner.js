export function cleanMarkdown(text) {
  if (!text) return ''
  
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*+]\s*/gm, '')
    .replace(/^\d+\.\s*/gm, '')
    .replace(/^#+\s*/gm, '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

export function formatQuestionAnswer(question, answer) {
  const cleanQuestion = cleanMarkdown(question)
  const cleanAnswer = cleanMarkdown(answer)
  
  let text = `问题：${cleanQuestion}。\n`
  text += `回答：${cleanAnswer}。\n`
  
  return text
}

export function formatCategoryIntro(category, count) {
  const categoryNames = {
    'JavaScript': 'JavaScript',
    'HTTP': 'HTTP协议',
    'TCP': 'TCP协议',
    'DNS': 'DNS',
    'Vue': 'Vue框架',
    'CSS': 'CSS样式',
    '加密技术': '加密技术'
  }
  
  const name = categoryNames[category] || category
  return `下面开始${name}相关内容，共${count}道题目。`
}

export function formatIntro() {
  return '欢迎收听八股记忆音频合集。本合集包含前端开发相关的面试题目，涵盖JavaScript、HTTP、Vue等多个分类。让我们开始学习吧。'
}

export function formatOutro() {
  return '八股记忆音频合集播放完毕。祝您学习愉快，再见。'
}

export function truncateText(text, maxLength = 5000) {
  if (text.length <= maxLength) return text
  
  const truncated = text.substring(0, maxLength)
  const lastPeriod = truncated.lastIndexOf('。')
  const lastQuestion = truncated.lastIndexOf('？')
  const lastEnd = Math.max(lastPeriod, lastQuestion)
  
  if (lastEnd > maxLength * 0.8) {
    return truncated.substring(0, lastEnd + 1)
  }
  
  return truncated + '...'
}

import { marked } from 'marked'
import hljs from 'highlight.js'

marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (err) {
        console.error('Highlight error:', err)
      }
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true
})

export function renderMarkdown(text) {
  if (!text) return ''
  
  const html = marked.parse(text)
  
  return html
}

export function stripMarkdownHeaders(text) {
  if (!text) return ''
  
  return text
    .replace(/^#{1,3}\s*【问题】\s*/gm, '')
    .replace(/^#{1,3}\s*【回答】\s*/gm, '')
    .replace(/^【问题】\s*/gm, '')
    .replace(/^【回答】\s*/gm, '')
}

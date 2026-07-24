import { marked } from 'marked'
import hljs from 'highlight.js/lib/core'
// 按需注册常见语言，避免引入 190+ 种语言的高亮规则
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import css from 'highlight.js/lib/languages/css'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import sql from 'highlight.js/lib/languages/sql'
import markdown from 'highlight.js/lib/languages/markdown'
import yaml from 'highlight.js/lib/languages/yaml'
import java from 'highlight.js/lib/languages/java'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('yml', yaml)
hljs.registerLanguage('java', java)
hljs.registerLanguage('go', go)
hljs.registerLanguage('rust', rust)

marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (err) {
        console.error('Highlight error:', err)
      }
    }
    // 未注册的语言降级为不自动检测，直接返回转义后的原文
    return code.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m])
  },
  breaks: true,
  gfm: true
})

const renderer = new marked.Renderer()

renderer.image = function(href, title, text) {
  return `<img src="${href}" alt="${text || ''}" title="${title || ''}" loading="lazy" onerror="this.style.display='none'">`
}

export function renderMarkdown(text) {
  if (!text) return ''
  
  const html = marked.parse(text, { renderer })
  
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

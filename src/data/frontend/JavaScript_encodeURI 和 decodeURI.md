---
category: JavaScript
topic: encodeURI 和 decodeURI
type: bagu
tags: [JavaScript]
difficulty: easy
created: 2026-07-24
---
# encodeURI / decodeURI 与 encodeURIComponent / decodeURIComponent

## 【问题】
`encodeURI()` 和 `encodeURIComponent()` 有什么区别？`decodeURI()` 和 `decodeURIComponent()` 又是什么？

## 【回答】
这两组函数都用于 URL 编码，但编码范围和适用场景不同。

### encodeURI() / decodeURI()
- **作用**：对整个 URL 进行编码，将非 ASCII 字符（如中文）转为 UTF-8 的百分号编码形式。
- **不编码的字符**：`A-Z a-z 0-9 ; , / ? : @ & = + $ - _ . ! ~ * ' ( ) #`——即 URL 的保留字符和特殊符号都不会被转义。
- **适用场景**：编码完整 URL 时使用，保持 URL 结构不被破坏。例如编码一个含中文的完整 URL 路径。

```js
encodeURI('https://example.com/搜索?q=你好')
// → 'https://example.com/%E6%90%9C%E7%B4%A2?q=%E4%BD%A0%E5%A5%BD'
// 冒号、斜杠、问号等保留字符不变
```

### encodeURIComponent() / decodeURIComponent()
- **作用**：对 URL 的组成部分（参数值）进行编码，编码范围更广。
- **不编码的字符**：仅 `A-Z a-z 0-9 - _ . ! ~ * ' ( )`——连 `& = / ?` 等都会被转义。
- **适用场景**：编码 URL 的查询参数值，防止特殊字符破坏 URL 结构。

```js
const q = '你好&foo=bar'
encodeURIComponent(q)
// → '%E4%BD%A0%E5%A5%BD%26foo%3Dbar'
// & 和 = 也被转义，不会干扰 URL 参数的解析
```

### 核心区别对比
| 函数 | 编码范围 | 不编码的字符 | 用途 |
|------|---------|-------------|------|
| `encodeURI` | 窄，仅编码非 ASCII | 保留字符 `:/?&=#` 等 | 编码完整 URL |
| `encodeURIComponent` | 宽，编码更多字符 | 仅 `字母数字 -_.!~*'()` | 编码 URL 参数值 |

**经验法则**：编码完整 URL 用 `encodeURI`，编码 URL 中的参数值用 `encodeURIComponent`。

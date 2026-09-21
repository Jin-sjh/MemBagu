---
category: HTML
topic: HTML5语义化与新特性
type: bagu
tags: [HTML, HTML5, 语义化, 语义标签, 职责分离, 可访问性]
difficulty: easy
created: 2026-09-21
---
# HTML5语义化与新特性

## 【问题】
HTML、CSS、JS 各自的职责边界是什么

## 【回答】
**HTML 描述文档结构和语义，CSS 控制呈现，JavaScript 负责行为**。三者分工明确，结构先表达内容关系和交互语义，再用 CSS 实现视觉，最后由 JS 增加行为。

---

## 【问题】
常用的 HTML5 语义化标签有哪些？为什么要用语义标签

## 【回答】
如 **`header` / `nav` / `main` / `section` / `article` / `aside` / `footer`** 用于表达结构和内容角色，不能只当作带样式的 div。语义影响**可访问性、SEO、阅读器和维护**。

---

## 【问题】
`button` 和 `a` 的使用边界是什么

## 【回答】
**`button` 用于操作，`a` 用于导航**；不要用 div 模拟所有交互，否则会丢失键盘可访问性和语义。`button` 触发动作，`a` 跳转资源，二者语义不同。

---

## 【问题】
HTML5 在哪些方向扩展了平台能力

## 【回答】
在**语义标签、表单、媒体和浏览器 API** 上扩展了平台能力，如 `video` / `audio`、`picture` / `source`、`dialog`、`canvas`、SVG、Web Storage、Worker 等。但是否可用要看安全、兼容和性能。

---

## 【问题】
如何验证 HTML 结构 / 语义化是否正确

## 【回答】
使用 **HTML validator、Accessibility tree、键盘操作、屏幕阅读器和 Lighthouse** 检查结构、语义和可访问性，而不是只看视觉还原。

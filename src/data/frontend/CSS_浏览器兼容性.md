---
category: CSS
topic: 浏览器兼容性
type: bagu
tags: [CSS, 浏览器兼容性, Autoprefixer, PostCSS, supports, 渐进增强]
difficulty: medium
created: 2026-09-21
---
# 浏览器兼容性

## 【问题】
浏览器兼容性差异来自哪里

## 【回答】
来自**规范支持阶段、浏览器引擎 bug、前缀、移动端实现和 polyfill / 构建目标**。同一特性在不同浏览器、不同版本上的支持程度和实现细节可能不同，不能用“我本地能跑”代表全部用户。

---

## 【问题】
Autoprefixer 能解决所有兼容性问题吗？PostCSS 是什么

## 【回答】
**Autoprefixer 根据 browserslist 自动生成需要的 vendor prefix**，但不能弥补语义和布局差异；**PostCSS 是处理管线**，不等于自动兼容所有新特性。前缀只是兼容性的一部分，特性本身的语义差异仍需能力检测与降级处理。

---

## 【问题】
`@supports` 怎么用于能力检测

## 【回答】
**`@supports` 用于 CSS 能力检测**，可在特性不可用时提供降级样式，是“目标浏览器 + 能力检测 + 构建转换 + 降级体验”组合中的一环。新特性应结合 caniuse / MDN 与目标浏览器做能力检测。

---

## 【问题】
渐进增强和优雅降级有什么区别

## 【回答】
**Progressive Enhancement 先提供基础体验再增强**（基础可用，高级能力逐步叠加）；**Graceful Degradation 在高级能力不可用时保留可用降级**。两者都强调不丢基本可用性，只是出发点不同。

---

## 【问题】
兼容性处理为什么不能用 UA 判断代替功能检测

## 【回答】
UA 判断不可靠且易过时；应结合 **caniuse / MDN、目标浏览器和 `@supports` 做能力检测**，并用真实浏览器矩阵和视觉 / E2E 测试验证，而不是用 UA 字符串推断能力。

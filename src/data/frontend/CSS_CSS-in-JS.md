---
category: CSS
topic: CSS-in-JS
type: bagu
tags: [CSS, CSS-in-JS, runtime, zero-runtime, SSR, 样式隔离]
difficulty: hard
created: 2026-09-21
---
# CSS-in-JS

## 【问题】
什么是 CSS-in-JS？runtime 和 zero-runtime 有什么区别

## 【回答】
**CSS-in-JS 在 JavaScript 中描述样式**，可能运行时生成 class / style，也可能通过编译在构建期提取。**Runtime 方案方便根据 props 动态生成**，但有序列化、样式插入、缓存和 SSR 成本；**Zero-runtime 把更多工作移到构建期**，运行时更轻但动态能力和构建约束不同。

---

## 【问题】
CSS-in-JS 有什么代价

## 【回答】
代价是**运行时生成和 SSR 复杂度**：序列化、样式插入、缓存成本，以及 hydration 时的额外工作。Zero-runtime 通过编译降低运行时成本，但动态样式能力受限，需要权衡构建约束。

---

## 【问题】
什么时候适合用 CSS-in-JS，什么时候不必要

## 【回答】
看首屏样式生成、SSR / hydration、调试、主题、包体、缓存、并发和组件库规模。**CSS Modules 或原生 CSS 变量通常能以更低运行时成本覆盖大部分隔离与主题需求**；大型组件库应优先关注稳定 class、主题 token、可缓存产物和无障碍。

---

## 【问题】
选型 CSS-in-JS 时要比较哪些方面

## 【回答】
比较**首屏样式生成、SSR / hydration、调试体验、主题能力、包体、缓存、并发渲染和组件库规模**，而不是只看“样式和组件写在一起”的语法体验。

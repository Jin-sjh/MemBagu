---
category: CSS
topic: 变量与主题切换
type: bagu
tags: [CSS, CSS 变量, 自定义属性, 主题切换, Design Token, 暗色模式]
difficulty: medium
created: 2026-09-21
---
# 变量与主题切换

## 【问题】
什么是 CSS 自定义属性（CSS 变量）？怎么使用

## 【回答】
**CSS Custom Properties 是运行时参与级联的自定义属性**，通常具有继承性，可用 `var(--token, fallback)` 读取并提供默认值。
```css
:root { --color-bg: white; }
body { background: var(--color-bg, white); }
```

---

## 【问题】
CSS 变量和 Sass / Less 变量有什么区别

## 【回答】
**CSS 变量在运行时存在，参与级联和继承**；**Sass 变量在预处理阶段替换，编译后通常不存在**。因此 CSS 变量可被 JS 或 data 属性在运行时修改，Sass 变量只能在构建期确定，无法响应式变化。

---

## 【问题】
如何用 CSS 变量实现主题切换

## 【回答】
因为 CSS 变量在运行时存在，可通过 class / data 属性或 JS 修改并驱动主题切换。
```css
:root { --color-bg: white; }
[data-theme='dark'] { --color-bg: #111; }
body { background: var(--color-bg, white); }
```

---

## 【问题】
Design Token 和 CSS 变量是同一个概念吗

## 【回答】
**不是同义词**。Design Token 是设计语义层（如“背景色”的设计意图），CSS Variable 是一种落地载体。变量只是把 token 落到代码里的手段之一，二者层次不同。

---

## 【问题】
使用 CSS 变量有哪些需要注意的坑

## 【回答】
仍需处理**作用域、fallback（默认值）、循环引用和类型无效值**等问题。例如未提供 fallback 且变量未定义时会取到无效值；变量指向自身会造成循环引用导致解析失败。

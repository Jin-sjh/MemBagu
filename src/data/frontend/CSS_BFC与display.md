---
category: CSS
topic: BFC与display
type: bagu
tags: [CSS, BFC, display, 格式化上下文, 布局, 层叠上下文]
difficulty: medium
created: 2026-09-21
---
# BFC与display

## 【问题】
display:none、visibility:hidden、opacity:0 三者有什么区别？

## 【回答】
三者都能让元素"看不见"，但行为和代价不同：

| 方式 | 是否占位 | 默认事件表现 | 渲染影响 |
|---|---|---|---|
| `display:none` | 否 | 不参与命中测试 | 切换可能触发布局 |
| `visibility:hidden` | 通常是 | 通常不接受指针命中 | 保留布局，影响可见性绘制 |
| `opacity:0` | 是 | 仍可能接受事件 | 仍参与渲染，可能创建层叠上下文 |

**opacity:0 仍占空间、通常仍可交互**，需要不可见且不响应事件时要配合 `pointer-events:none`、`aria-hidden` 或卸载策略。

---

## 【问题】
什么是 BFC（块级格式化上下文）？如何创建？

## 【回答】
BFC 是一个**独立的 block 布局环境**，内部 block 按规则布局，浮动和 margin 的交互被隔离。**它不是一个 CSS 属性**，而是一种格式化上下文。

常见创建方式包括：**`display: flow-root`、浮动（float 非 none）、绝对/固定定位（absolute/fixed）、`overflow` 非 visible、特定 `contain`** 等。现代代码优先用 **`display: flow-root`** 或 Flex/Grid 显式表达意图，避免用 overflow 隐式触发副作用。

---

## 【问题】
BFC 有什么作用和边界？它是不是"万能清除浮动工具"？

## 【回答】
BFC 常用于**包含浮动（解决父元素高度塌陷）、隔离外边距折叠、形成独立布局边界**。但它**不是万能的"清除一切浮动"工具**，只能解决浮动导致的高度塌陷，解决不了绝对定位高度塌陷等问题。BFC 解决的是布局边界问题，应合理使用而非到处套用。

---

## 【问题】
两栏 / 三栏布局如何用 Flex 或 Grid 实现？圣杯双飞翼是什么？

## 【回答】
两栏（左 200px 右自适应）Flex：`.left { flex: 0 0 200px } .right { min-width: 0; flex: 1 }`；Grid：`grid-template-columns: 200px minmax(0, 1fr)`。三栏：`grid-template-columns: 200px minmax(0,1fr) 200px`，或 Flex 左右 `flex:0 0 200px`、中间 `flex:1; min-width:0`。

**Flex 更适合一维布局，Grid 易扩展到二维**；浮动兼容旧代码但需清除浮动。**圣杯和双飞翼是早期 float + 负 margin 方案**，解决"中间主内容优先加载但左右视觉分栏"，新项目通常用 Flex/Grid，但面试仍需理解其负 margin 与定位补偿。

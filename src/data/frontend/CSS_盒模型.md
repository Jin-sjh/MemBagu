---
category: CSS
topic: 盒模型
type: bagu
tags: [CSS, 盒模型, box-sizing, 外边距折叠, 尺寸计算, 布局]
difficulty: medium
created: 2026-09-21
---
# 盒模型

## 【问题】
什么是 CSS 盒模型？content-box 与 border-box 有什么区别？

## 【回答】
CSS 盒模型认为每个元素都是一个矩形盒子，由 **content（内容）、padding（内边距）、border（边框）、margin（外边距）** 四部分构成。

在标准盒模型下（`box-sizing: content-box`，默认值），**width 只描述 content 的宽度**，元素实际占位宽度 = width + 左右 padding + 左右 border + 左右 margin。

而在 `border-box` 模型下，**width 直接包含 content + padding + border**，padding 和 border 不会再撑大元素。公式上：
- border-box 总宽度 = width
- content-box 总宽度 = width + padding-left/right + border-left/right

---

## 【问题】
全局设置 box-sizing: border-box 有什么作用？它不能解决什么？

## 【回答】
全局 `box-sizing: border-box` 常用于让布局尺寸更可预测，**降低 padding/border 撑破容器导致的尺寸计算意外**，是现代项目常见的重置做法。

但它**不能消除内容溢出、`min-width` 约束或 `margin` 的影响**；例如 `width:100%` 在 content-box 下再加上 padding/border 仍可能超出父元素。它只是改变了 width 的计费范围，并非万能的尺寸控制手段。

---

## 【问题】
什么是 margin collapse（外边距折叠）？哪些情况下会发生？

## 【回答】
margin collapse 指垂直相邻 block 的上下外边距会**合并为单一外边距，取两者中的较大者而不是相加**。

常见发生场景：**相邻兄弟元素**的上下 margin、**父元素与首/尾子元素**的 margin（子元素 margin 可能"穿透"父元素）、以及**空的 block 元素**自身上下 margin 直接重叠。在 **Flex/Grid 容器**或建立 **BFC** 等环境下可隔离部分折叠，并非所有 margin 都会折叠。

---

## 【问题】
面试时如何回答"说说 CSS 盒模型"？

## 【回答】
先讲四要素：盒模型由 **content/padding/border/margin** 构成；再区分两种模型，**content-box 的 width 不含内边距和边框，border-box 把 padding 和 border 计入 width**。接着说明全局 border-box 能降低尺寸计算意外，但**不解决内容溢出和 margin 问题**。最后补充 **margin collapse 是特定 block formatting context 下的外边距合并，并不是所有 margin 都折叠**，可用 Flex/Grid 或 BFC 隔离。

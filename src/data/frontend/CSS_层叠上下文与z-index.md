---
category: CSS
topic: 层叠上下文与z-index
type: bagu
tags: [CSS, 层叠上下文, z-index, 定位, 包含块, 渲染]
difficulty: medium
created: 2026-09-21
---
# 层叠上下文与z-index

## 【问题】
什么是层叠上下文（stacking context）？

## 【回答】
Stacking context 是**独立的层叠比较环境**。在同一上下文中，元素按 z-index 等规则比较前后；**父上下文先与其他上下文整体比较，子元素不能用更大的 z-index 突破父上下文的层级**。可以把它理解为一个"层级围墙"，墙内的数字只在墙内比，墙与墙之间由 DOM 层级决定。

---

## 【问题】
哪些情况会创建层叠上下文？

## 【回答】
常见创建条件包括：**根元素、定位且 z-index 非 auto、fixed / sticky、opacity 小于 1、transform、filter、isolation、某些 contain / will-change** 等。注意 **`position` 本身并不总创建层叠上下文**，通常需要配合非 auto 的 z-index；而 fixed/sticky 有额外规则。transform 和 opacity<1 还可能同时建立新的包含块。

---

## 【问题】
为什么 z-index: 9999 还是不生效？

## 【回答】
z-index 不生效常见原因是**元素所在的父 stacking context 整体位于另一个上下文之下**，子元素再大的 z-index 也越不过父级围墙；或**元素没有参与支持 z-index 的定位/布局语义**（如仍是 static 且未建立上下文）。排查时要从元素向上逐层检查上下文边界，而不是无脑加更大的数字。

---

## 【问题】
排查 z-index 失效的正确思路是什么？

## 【回答】
先明确 **z-index 不是全局数字竞赛，而是在同一 stacking context 内比较**。排查步骤：从目标元素**向上检查每一层祖先是否建立了层叠上下文**、其创建原因是什么、整体在 DOM 树中的层级如何。定位到是哪个父级上下文把元素"压"在了下面，再针对性调整层级或结构，而非盲目提高数值。

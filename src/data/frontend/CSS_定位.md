---
category: CSS
topic: 定位
type: bagu
tags: [CSS, 定位, position, 包含块, sticky, 文档流]
difficulty: medium
created: 2026-09-21
---
# 定位

## 【问题】
CSS 有哪些定位方式（position 取值）？各自有什么特点？

## 【回答】
`position` 决定元素如何定位：
- **static**：默认值，参与普通文档流，不定位。
- **relative**：保留原位置占位，再相对自身偏移。
- **absolute**：脱离普通流，相对 containing block（包含块）定位。
- **fixed**：通常相对视口定位，脱离普通流。
- **sticky**：在滚动阈值内表现为相对定位，达到阈值后像固定定位（滚动约束下的混合模式）。

核心先区分**是否脱离普通流**，再确定包含块。

---

## 【问题】
absolute / fixed 的 containing block（包含块）如何确定？

## 【回答】
absolute 的包含块通常由**最近的非 static 定位祖先**建立；此外 **transform、某些 contain** 等也可能改变参照。fixed **不一定永远相对 viewport**，当祖先存在 **transform / filter / perspective** 时会建立新的包含块，使 fixed 相对该祖先定位。排查错位时要沿祖先链检查这些属性。

---

## 【问题】
position: sticky 不生效的常见原因有哪些？

## 【回答】
sticky 失效应优先检查：
- **没有设置 top/bottom 等阈值**，不满足触发条件；
- **容器没有可滚动空间**，无法产生吸顶效果；
- **祖先 overflow 改变了滚动容器**，使滚动不再发生在预期祖先上；
- **元素自身尺寸/布局约束不满足**。

排查 sticky 不要只改 z-index，而要从阈值、滚动容器、祖先 overflow 和高度入手。

---

## 【问题】
"脱离普通流"到底意味着什么？

## 【回答】
脱离普通流意味着元素**不再为兄弟元素占据正常的布局空间**，后续兄弟会按它"不存在"来排布。但它**不代表完全脱离渲染系统**，仍可能参与绘制和合成、影响视觉层叠。absolute/fixed 通常脱离流，relative 保留空间，sticky 是滚动约束下的混合模式。

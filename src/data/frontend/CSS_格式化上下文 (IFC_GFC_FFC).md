---
category: CSS
topic: 格式化上下文 (IFC_GFC_FFC)
type: bagu
tags: [CSS]
difficulty: easy
created: 2026-07-24
---
# CSS 格式化上下文 (IFC/GFC/FFC)

## 【问题】

了解 IFC 吗？GFC 和 FFC 听说过吗？

## 【回答】

1. IFC 名为行级格式化上下文。

如何触发 IFC？
- 块级元素中仅包含内联级别元素。
- 形成条件非常简单，需要注意的是当 IFC 中有块级元素插入时，会产生两个匿名块将父元素分割开来，产生两个 IFC。

2. GFC 名为网格格式上下文。

如何触发 GFC？
- 当为一个元素设置 display 值为 grid 或者 inline-grid 的时候，此元素将会获得一个独立的渲染区域。

3. FFC 名为弹性格式上下文。

如何触发 FFC？
- 当 display 的值为 flex 或 inline-flex 时，将生成弹性容器（Flex Containers），一个弹性容器为其内容建立了一个新的弹性格式化上下文环境（FFC）

---

## 真实业务 / 面试场景（案例补充）

### 场景 1：图片底部莫名其妙多了几像素空隙
**背景**：`<div><img src="..."></div>`，div 高度比图片高几像素。
**为什么**：img 是 inline 元素，处于 IFC（行内格式化上下文），会按基线（baseline）对齐并保留文字的下行空间（descender），于是底部留出空隙。
**解决**：给 img 设 `display: block` 脱离 IFC 即可消除，或 `vertical-align: bottom/middle` 调整对齐。

### 场景 2：flex 容器里 `text-align: center` 不生效
**背景**：父元素 `display: flex` 后，子项水平居中失效。
**为什么**：flex 建立了 FFC（弹性格式化上下文），子项不再是普通块级流，水平居中要用 `justify-content: center`，`text-align` 在 FFC 下对 flex item 不再起作用。面试官常借此考察你是否分清"块级流"和"弹性流"。

### 场景 3：grid 两个格子重叠了
**背景**：`display: grid` 后两个子元素叠在同一格。
**为什么**：grid 建立 GFC，子项位置由 `grid-area` / `grid-template` 分配；若只定义 `grid-template-columns` 没定义行，或 `grid-row`/`grid-column` 都指向同一区域，就会重叠。
**解决**：明确分配 `grid-column: 1 / 2; grid-row: 1 / 2`。

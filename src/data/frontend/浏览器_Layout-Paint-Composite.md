---
category: 浏览器
topic: Layout-Paint-Composite
type: bagu
tags: [浏览器, 渲染管线, Layout, Paint, Composite, 性能优化]
difficulty: medium
created: 2026-09-21
---
# Layout-Paint-Composite

## 【问题】
Layout、Paint、Composite 三个阶段分别负责什么？

## 【回答】
渲染管线在样式计算之后依次是 **Layout 计算几何位置和尺寸**、**Paint 生成绘制记录/位图**、**Composite 把图层按变换、透明度和顺序合成为最终帧**并交给屏幕。

前一阶段的变化可能使后续阶段重新执行，例如布局改变常引发重绘与合成，因此要理解改动会向下游传导，不能孤立看待某个阶段。

---

## 【问题】
改变哪些属性会触发 Layout / Paint / Composite？transform/opacity 是否一定只触发 Composite？

## 【回答】
改变宽高、位置、字体等几何属性**通常可能触发 Layout**；颜色、阴影等**可能主要触发 Paint**；`transform`、`opacity` 在满足条件时**可能只需 Composite**。

但"可能"不能绝对化：**元素是否创建合成层、内容是否需要重新栅格化、浏览器实现和具体属性都会影响结果**，并不能保证只走合成路径而不 Paint。以属性名称直接推断性能是不严谨的。

---

## 【问题】
什么是 Reflow 和 Repaint？为什么动画优先用 transform/opacity？

## 【回答】
**Reflow 通常指布局的重新计算（Layout）**，**Repaint 指绘制更新（Paint）**。动画优先使用 `transform`/`opacity` 是**降低主线程 Layout/Paint 风险的经验，但不是保证零成本**的方案。

仍应批量读写、避免大范围布局、减少阴影和复杂绘制、合理使用 `will-change`，并在 Performance 中观察实际触发的阶段，而非默认认为一定最省。

---

## 【问题】
面试时怎么答渲染三阶段？合成层是不是越多越好？

## 【回答】
先讲三阶段职责：**Layout 决定几何，Paint 生成视觉绘制，Composite 负责图层合成**；Reflow 即布局重算，Repaint 即绘制更新。再强调 `transform`/`opacity` 在条件满足时更容易走合成路径，但**不能保证不 Paint**。

最后点出关键反直觉点：**合成层不是越多越好**——层有纹理内存、上传、管理和合成成本，过多会增加 GPU 内存和调度压力。验证方式是用 Performance 录制对比 `top/left` 与 `transform`，观察 Layout、Paint、Composite、帧时间和 GPU 内存，不以属性名称直接推断性能。

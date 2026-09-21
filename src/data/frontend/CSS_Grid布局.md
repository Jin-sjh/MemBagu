---
category: CSS
topic: Grid布局
type: bagu
tags: [CSS, Grid, 网格布局, 二维布局, fr单位, 自适应]
difficulty: medium
created: 2026-09-21
---
# Grid布局

## 【问题】
Grid 与 Flex 的核心区别是什么？各自适合什么场景？

## 【回答】
**Flex 是一维布局模型**，偏向沿单轴（水平或垂直）的内容流对齐；**Grid 是二维布局模型**，用行和列轨道同时表达区域关系。Grid 更适合页面骨架、卡片矩阵和明确的二维对齐，Flex 更适合工具栏、组件内部的一维对齐。应根据"单轴对齐还是二维区域关系"选择，而不是按"新旧"选择。

---

## 【问题】
Grid 的常用属性有哪些？fr / repeat / minmax 怎么用？

## 【回答】
- **grid-template-columns / grid-template-rows**：定义列/行轨道；
- **fr**：在满足固定尺寸、gap 和最小约束后，**分配剩余空间的比例**；
- **repeat()**：简化重复轨道，如 `repeat(3, 1fr)`；
- **minmax()**：给出轨道尺寸的**上下界**。

示例：`grid-template-columns: 200px minmax(0, 1fr)` 表示首列固定 200px，第二列占剩余空间但最小为 0。

---

## 【问题】
auto-fit 与 auto-fill 有什么区别？

## 【回答】
两者都用于自动填充重复轨道，但对"空轨道"处理不同：**auto-fit 会折叠空轨道，让已有项目扩展填满**；**auto-fill 更倾向保留可填充的空轨道**，在容器剩余空间下表现不同。自适应卡片常用 `repeat(auto-fit, minmax(16rem, 1fr))`：空间足够时多列，空间不足时自动换行并让卡片拉伸。

---

## 【问题】
如何用 Grid 实现自适应卡片布局？Grid area 命名区域有什么用？

## 【回答】
自适应卡片常写作：
```css
.grid { grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); }
```
即可随容器宽度自动增减列数。**Grid area 可用命名区域表达布局意图**（如 `grid-template-areas`），让结构更可读。但动态内容、隐式轨道和最小内容尺寸仍需实测，命名区域并非万能。

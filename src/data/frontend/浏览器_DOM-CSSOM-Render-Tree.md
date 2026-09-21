---
category: 浏览器
topic: DOM-CSSOM-Render-Tree
type: bagu
tags: [浏览器, DOM, CSSOM, 渲染树, 渲染原理, 性能]
difficulty: medium
created: 2026-09-21
---
# DOM-CSSOM-Render-Tree

## 【问题】
DOM、CSSOM 和 Render Tree 分别是什么？它们之间是什么关系？

## 【回答】
DOM 表示 HTML 的文档结构，CSSOM 表示可计算的 CSS 规则和样式，Render Tree 是浏览器把可见节点及其样式组合成的渲染结构。三者的生成链路是 **HTML 解析生成 DOM**、**CSS 解析生成 CSSOM**，再结合 DOM 与 CSSOM 并通过样式计算生成 Render Tree，最后进入 Layout / Paint。

**三者不是同一棵树**：DOM 是结构，CSSOM 是样式规则与计算信息，Render Tree 是真正用于渲染的可见结构。CSSOM 不是简单的 CSS 文本列表，它参与级联、继承、计算值和样式更新；修改 DOM 或样式可能触发样式重算，并进一步触发布局或绘制。

---

## 【问题】
display:none 和 visibility:hidden 对渲染树和布局的影响有什么不同？

## 【回答】
`display:none` 的元素**仍在 DOM 中，但通常不进入 Render Tree**，既不参与布局也不绘制可见内容；`visibility:hidden` 则**通常仍占据布局空间，只是不绘制可见内容**，因此会保留在布局中。

常见误区是把两者等同——前者（display:none）通常仍占据布局空间的说法是错误的，实际是后者（visibility:hidden）才保留布局空间；具体行为要结合布局上下文验证，不能一概而论。

---

## 【问题】
为什么频繁修改 DOM 或样式会影响性能？应如何减少这类成本？

## 【回答】
分层结构让浏览器可以缓存和增量更新，但 **DOM 节点过多、样式选择器复杂或频繁修改都会增加主线程工作**。修改 DOM 或样式可能触发**样式重算（Recalculate Style）**，并进一步触发布局或绘制。

复杂页面应**减少无意义节点、批量更新，并避免在循环中反复读写布局信息**，以降低主线程的样式与布局成本。

---

## 【问题】
面试时怎么区分 DOM、CSSOM、Render Tree 三者？

## 【回答】
面试重点是强调**三者不是同一棵树**。先用一句话界定：**DOM 描述文档结构，CSSOM 描述可计算的样式规则与计算信息，Render Tree 是结合两者得到的可见渲染结构**。

再讲生成链路：HTML 解析成 DOM、CSS 解析成 CSSOM，二者通过样式计算合成 Render Tree 后进入布局绘制。最后点出易错点：`display:none` 仍在 DOM 但通常不进 Render Tree，而 `visibility:hidden` 通常保留布局空间只是不绘制。可以顺带说明 CSSOM 参与级联、继承与计算值，修改样式可能触发样式重算进而引发布局/绘制，复杂页面要避免无意义节点和循环内读写布局。

---
category: JavaScript
topic: DOM事件与WebAPI
type: bagu
tags: [JavaScript, DOM, 事件模型, 事件委托, Fetch, Web API]
difficulty: medium
created: 2026-09-21
---
# DOM事件与WebAPI

## 【问题】
DOM 事件传播的三个阶段是什么

## 【回答】
事件沿**捕获、目标、冒泡**阶段传播：从 `window` 向下到 target（捕获），到达 target（目标），再从 target 向上回到 `window`（冒泡）。
```
window → ... → target（捕获）
target（目标）
target → ... → window（冒泡）
```

---

## 【问题】
什么是事件委托？适合什么场景

## 【回答】
**事件委托把监听放在稳定祖先，通过 target / currentTarget 和匹配规则处理动态子节点**。适合大量或动态子项（如列表），但要注意 target 嵌套和边界处理，避免误命中。

---

## 【问题】
`preventDefault` 和 `stopPropagation` 有什么区别

## 【回答】
**`preventDefault` 阻止默认行为**；**`stopPropagation` 阻止继续传播**，二者不能混为一谈。阻止默认行为不能用 stopPropagation，反之亦然。

---

## 【问题】
事件监听器清理要注意什么

## 【回答】
**监听器清理必须使用同一函数引用和匹配选项**（如 capture 标志一致），否则移除不生效，造成内存泄漏或重复绑定。匿名函数或选项不一致都会导致 `removeEventListener` 失败。

---

## 【问题】
Fetch 和 AbortController 怎么用？还有哪些常用 Web API

## 【回答】
**Fetch 是 Promise API，AbortController 负责取消信号**；此外 `IntersectionObserver`、`ResizeObserver`、`File API`、`Clipboard`、`Worker` 等都应按生命周期管理，避免泄漏。

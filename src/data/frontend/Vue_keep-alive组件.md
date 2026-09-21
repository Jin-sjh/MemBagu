---
category: Vue
topic: keep-alive组件
type: bagu
tags: [Vue, keep-alive, 组件缓存, 生命周期, 性能优化, LRU]
difficulty: easy
created: 2026-07-24
---
# Vue keep-alive 组件

## 【问题】
请说明 `<keep-alive>` 组件的作用。

## 【回答】
当 `<keep-alive>` 包裹动态组件时，会缓存不活动的组件实例，而不是销毁它们。`<keep-alive>` 是一个抽象组件，它自身不会渲染一个 DOM 元素，也不会出现在父组件链中。

当在 `<keep-alive>` 内切换组件时，它的 `activated` 和 `deactivated` 这两个生命周期钩子函数将会执行。

```vue
<keep-alive>
  <component :is="view"></component>
</keep-alive>
```

---

## 【问题】
KeepAlive 的缓存机制是怎样的？它如何标识一个缓存实例？

## 【回答】
KeepAlive 以**组件类型和 key 等信息作为缓存身份**，把实例存入缓存并维护**访问顺序**；切换时并不是简单销毁，而是从 DOM 树移出但不卸载，从而保留组件状态。

切出时执行 **`deactivated`**，切入时执行 **`activated`**。缓存的是**实例及其响应式状态/子树**，因此会**增加内存占用**，不是简单的 `display:none`。

---

## 【问题】
include / exclude / max 有什么作用？缓存满了怎么淘汰？

## 【回答】
- **`include` / `exclude`**：按组件名过滤，控制哪些组件被缓存。
- **`max`**：限制缓存规模；当缓存数量超过 `max` 时触发**淘汰旧实例**（基于维护的访问顺序，类似 LRU）。

注意被缓存组件仍可能持有订阅、定时器和大数据，需要在 `activated` / `deactivated` 中妥善管理资源。

---

## 【问题】
KeepAlive 适合哪些场景？有什么边界和代价？

## 【回答】
**适合**：列表筛选、路由页面、表单草稿等切换后希望保留状态的场景。
**不适合**：高度动态、数据必须每次重置、内存敏感、或副作用不能暂停的组件。

代价是**内存增加**和**生命周期复杂度上升**。被缓存组件仍持有订阅/定时器/大数据，需在 `activated`/`deactivated` 中清理，否则造成内存泄漏或数据过期。

---

## 【问题】
KeepAlive 和 display:none 有什么区别？

## 【回答】
核心区别在于管理对象不同：**KeepAlive 管理的是组件实例和激活生命周期**（activated/deactivated），切换时停用而非销毁；而 `display:none` 只是 CSS 隐藏 DOM，组件实例该卸载还是卸载，生命周期不会保留。

KeepAlive 缓存实例及其响应式状态，因此能保留状态并减少重建成本，但代价是内存和生命周期复杂度。

---

## 【问题】
面试时怎么答 KeepAlive？

## 【回答】
KeepAlive 通过**缓存组件实例**，切换时**停用而不是销毁**，因而保留状态并减少重建成本；代价是**内存和生命周期复杂度**。`include`/`exclude` 控制缓存范围，`max` 可淘汰旧实例。

它与 `display:none` 的区别在于管理的是**组件实例和激活生命周期**。适合列表筛选、路由页面、表单草稿；不适合高度动态、内存敏感或副作用不能暂停的组件，被缓存组件仍需在 `activated`/`deactivated` 中管理资源。

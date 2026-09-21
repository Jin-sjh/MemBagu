---
category: Vue
topic: nextTick与调度
type: bagu
tags: [Vue, nextTick, 调度队列, 批量更新, 微任务, 响应式]
difficulty: medium
created: 2026-09-21
---
# nextTick与调度

## 【问题】
什么是 Vue 的 nextTick？它的作用是什么？

## 【回答】
Vue 把响应式触发的组件更新放入 **job queue（更新队列）**，并**合并同一轮的重复任务**。`nextTick` 等待当前更新 **flush 的 Promise 时机**，让回调代码在 DOM 更新之后继续执行，但**不保证浏览器已经 Paint（绘制）**。

需要读取刚更新的 DOM 尺寸或内容时，使用 `await nextTick()` 即可拿到更新后的结果；如果只是为了取派生计算值，不应滥用 nextTick。它通常基于 **Promise 微任务**实现，其意义是等待 Vue 自己的更新队列，而不是等待浏览器下一帧。

---

## 【问题】
Vue 为什么修改响应式数据后不立即更新 DOM？调度队列是怎么工作的？

## 【回答】
为了**批量合并与去重**组件更新 job，避免一次同步代码中的多次修改反复 patch（重复渲染）。流程如下：

```text
修改响应式状态
  ↓
组件更新 job 入队并去重
  ↓ Promise 微任务触发 flush
pre watcher → component update → post watcher
  ↓
nextTick 回调
```

Scheduler 在**微任务**中 flush 队列，按 `pre watcher → 组件更新 → post watcher` 顺序执行，因此通常能在 nextTick 里读到更新后的 DOM。

---

## 【问题】
nextTick 和 requestAnimationFrame（rAF）/ 浏览器下一帧有什么区别？

## 【回答】
`nextTick` 通常基于 **Promise 微任务**，其意义是**等待 Vue 更新队列 flush 完成**，不等于等待浏览器下一帧。`rAF` 才对应浏览器的绘制时机。

两者层级不同：nextTick 解决的是“Vue 的 DOM 更新好了没有”，rAF 解决的是“浏览器绘制了这一帧没有”。遇到**视觉时机要求**（如动画、滚动定位依赖绘制结果）时，还要结合 `requestAnimationFrame`，不能只靠 nextTick。

---

## 【问题】
watcher 的 flush 选项 pre / post / sync 分别代表什么？

## 【回答】
- **`flush: 'pre'`**：在组件更新前执行（默认队列行为）。
- **`flush: 'post'`**：在组件更新、DOM 挂载/打补丁之后执行，适合访问更新后的 DOM。
- **`flush: 'sync'`**：**绕过批量调度**，修改即同步触发，适合极少数严格同步场景，但可能**放大重复更新**。

`pre`、`post` 的准确相对时机要结合组件类型和 watcher 类型判断。

---

## 【问题】
什么时候该用 nextTick？怎么验证更新顺序？

## 【回答】
**该用**：需要读取刚更新后的 DOM 尺寸或内容时，用 `await nextTick()`。
**不该用**：只为计算派生值、与 DOM 无关的逻辑不应滥用，避免无谓的微任务等待。

验证顺序可用：**DOM 断点**观察更新时机、**Performance 面板**看微任务与渲染帧、**不同 flush 选项**（pre/post/sync）对比回调执行先后，确认 batch 合并与去重是否生效。

---

created: 2026-09-21

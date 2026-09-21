---
category: React
topic: Fiber与Hooks
type: bagu
tags: [React, Fiber, Hooks, 渲染机制, 性能优化, stale closure]
difficulty: hard
created: 2026-09-21
---
# Fiber与Hooks

## 【问题】
什么是 Fiber？为什么需要 Fiber？

## 【回答】
Fiber 是 React 对**可中断渲染工作的可恢复表示**。旧式递归协调一旦开始就可能长时间占用主线程，输入和动画无法插队。Fiber 把工作拆成可保存的单元，记录 type、key、child/sibling/return、state、flags 等信息，允许调度器**暂停、恢复、丢弃或按优先级处理** Render 工作。

---

## 【问题】
Fiber 的 Render 阶段与 Commit 阶段有什么区别？

## 【回答】
Render 阶段遍历 Fiber，计算下一棵 UI（next tree），**可中断**；Commit 阶段把确定结果同步提交到宿主环境（应用 DOM、ref、effect），**需保持一致**。Render 必须尽量纯，因为可能执行多次；Commit 处理已确定的副作用。

---

## 【问题】
Hooks 为什么必须按固定顺序调用？

## 【回答】
Hooks 依赖调用顺序对应链表/槽位：**条件分支或循环调用会错位**。因此不能把 Hook 放在 if/for 里。每次 render 是状态快照，Hooks 按固定调用顺序把状态和副作用挂到函数组件的 Fiber 上。

---

## 【问题】
`useEffect`、`useLayoutEffect`、`useMemo`/`useCallback`、`memo` 有什么区别与成本？

## 【回答】
`useEffect` 在 commit 后处理外部副作用；`useLayoutEffect` 更早、会影响绘制，可能阻塞显示；`useMemo/useCallback` 缓存值/函数但也有比较和内存成本；`memo` 只跳过满足 props 比较条件的组件，**不保证一定收益**。Context value 变化会让消费者重新评估，需拆分 context 或稳定 value。

---

## 【问题】
什么是 stale closure（陈旧闭包）？如何修复？

## 【回答】
每次 render 是状态快照，异步回调可能**捕获旧值**。修复取决于语义：函数式更新、正确依赖、ref 或重建 effect，不能用 memo 掩盖问题。

---

## 【问题】
面试时怎么答 Fiber 与 Hooks？

## 【回答】
Fiber 把渲染工作拆成可调度单元，使 Render 可中断和按优先级恢复；Commit 是对宿主环境的最终提交，必须保持一致。Hooks 按固定调用顺序把状态关联到 Fiber，`useEffect` 用于提交后的副作用。memo/useMemo/useCallback 都有比较和内存成本，只有在稳定引用和昂贵计算确实存在时才有收益。

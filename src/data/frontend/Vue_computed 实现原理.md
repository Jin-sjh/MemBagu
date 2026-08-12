---
category: Vue
topic: computed 实现原理
type: bagu
tags: [Vue]
difficulty: medium
created: 2026-07-24
---
# Vue computed 实现原理

## 1. computed 是实时响应的吗？

## 【问题】
computed 是实时响应的吗？

## 【回答】
**是实时响应的。**

computed 会自动监听它内部用到的响应式数据（ref / reactive），只要依赖数据一变，计算属性就会自动重新计算并更新，页面也会同步刷新，并且自带缓存，依赖不变时不会重复执行。

---

## 2. computed 底层怎么实现的？

## 【问题】
computed 底层怎么实现的？

## 【回答】
**底层实现原理：**

- 响应式数据通过 **Proxy** 拦截 get（读取）和 set（修改）。

- 执行 computed 回调时，触发数据 get，Vue 进行**依赖收集**，记录该计算属性依赖哪些数据。

- 数据修改时触发 set，Vue **派发更新**，将对应 computed 标记为"脏（dirty）"。

- 下次读取 computed 时，若为脏数据则**重新计算并缓存结果**，否则直接返回缓存值。

- **本质：computed 是一个懒执行、带缓存的 watcher。**

---

## 真实业务 / 面试场景（案例补充）

### 场景 1：列表搜索过滤，用 computed 还是 method
**背景**：一个 1000 条的用户列表，按关键词过滤。
**解决**：用 `computed filteredList()`——它带缓存，只有 `list` 或 `keyword` 变了才重算；若用 method，每次渲染（甚至无关数据变化）都会重跑过滤，白白消耗。

### 场景 2：computed 依赖没变，为什么返回旧值
**为什么**：computed 在依赖未变时直接返回上一次缓存结果（dirty 标记 false），不执行回调——这正是它"带缓存、懒执行"的体现，性能好。

### 场景 3：面试——computed、watch、method 怎么选
**要点**：computed 用于"依赖变化派生出新值"且有缓存；watch 用于"数据变化后要执行副作用"（如发请求、改 DOM）；method 每次调用都执行、无缓存。三者适用场景不同，不要混用。

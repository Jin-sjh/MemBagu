---
category: Vue
topic: 响应式系统原理
type: bagu
tags: [Vue, 响应式, Proxy, defineProperty, 源码]
difficulty: hard
created: 2026-09-06
---
# 响应式系统原理（源码级）

## 【问题】
Vue 3 响应式系统在源码层面是怎么实现的？依赖收集（track）和触发更新（trigger）的完整闭环是怎样的？

## 【回答】
**What：** Vue 3 响应式系统（`packages/reactivity`）基于 **ES6 Proxy** 实现对象拦截，配合 **effect + dep + targetMap** 完成依赖收集与派发。核心 API：`reactive()`、`ref()`、`computed()`、`watchEffect()`、`effect()`。

**Why：** Vue 2 用 `Object.defineProperty` 只能劫持**已有属性**的 getter/setter，无法监听新增/删除属性（需 `$set`），也无法监听数组下标/长度变化（需重写数组方法）。Proxy 能拦截对象的**所有操作**（增、删、查、改、`in`、`for-in`），从源头解决了这些问题。

**How —— 依赖收集 → 触发更新：**

```text
读取 target[key] (get)                修改 target[key] (set)
        │                                     │
targetMap                            找到 dest Map
  WeakMap: target → Map:             → Set of effect fns
    key → Set(activeEffect: Dep)     → 逐个执行 (trigger)
记录当前正在执行的 effect
```

1. **track（收集）**：当 `activeEffect`（当前正在运行的副作用，即正在执行的 render 渲染副作用 / `watchEffect` 回调 / `computed` getter）**读取**了某个响应式对象的属性时，把该 activeEffect 记入 `targetMap[target][key]` 对应的**依赖集合（Dep）**。
2. **trigger（触发）**：当某个响应式对象的属性被**写入**时，从 Dep 取出所有依赖该属性的 effect，重新执行（调度器可控制批量刷新，如渲染副作用并入下一个 microtask，这就是性能优化点）。
3. **副作用何时是 effect**：组件 mount 时，render 被包在 effect 里执行，render 里访问的所有响应式属性都被收集；某个属性变化 → 触发该 effect → 重新执行 render → 对比 VNode 后 patch DOM。

## 【难点分析】
理解"依赖收集/触发更新"的**闭环**：读操作（get）里 track 记录谁在用我，写操作（set）里 trigger 通知所有用我的人重新执行。抽象度极高，需要把 `targetMap（WeakMap）→ Map（key）→ Set（Dep）` 三层结构与 activeEffect 的运行时切换联系起来。

## 【考察点】
- Proxy 相比 `Object.defineProperty` 的优势（新增/删除属性、数组下标）
- targetMap 三层结构（WeakMap → Map → Set）各层存什么
- activeEffect 是什么、何时被设置
- 渲染副作用为何并入 microtask（批量刷新性能优化）

## 【衍生问题】
- ref 和 reactive 的区别？（原资料此处被截断，待补充）

## 【问题】
Vue 2 的 `Object.defineProperty` 与 Vue 3 的 `Proxy` 在响应式实现上有哪些区别？（必背对比表）

## 【回答】
**必背表格：**

| 维度 | Vue 2 (defineProperty) | Vue 3 (Proxy) |
| --- | --- | --- |
| 拦截范围 | 仅已有属性 get/set | **所有属性操作**（增删查改 / `in` / `for-in` / `keys`） |
| 新增/删除属性 | 需要 `$set` / `$delete` | **天然支持** |
| 数组 | 需重写 `push` 等方法 | **原生支持** |
| 深层 | 递归一次性定义所有属性（开销大） | **惰性代理**，get 到对象时才递归 |
| 性能 | 初始化递归 defineProperty 慢 | 惰性 + 无需重写数组方法 |

**核心结论：** Vue 2 的 `defineProperty` 只能劫持**初始化时已存在的属性**，因此新增/删除属性和数组下标修改都监听不到，需要 `$set`、重写数组方法等补丁；Vue 3 的 `Proxy` 代理的是**整个对象**，能拦截全部 13 种基本操作，且采用**惰性代理**（访问到内层对象时才递归转换），初始化开销更小。

## 【口诀】
增删数组 Proxy 行，惰性递归性能赢；defineProperty 只管已有属性，$set 重写方法来救场。

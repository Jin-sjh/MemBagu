---
category: 手写
topic: Proxy 实现 reactive 与 effect
type: bagu
tags: [手写代码, Proxy, 响应式, reactive, effect, 依赖收集, 原生JS]
difficulty: medium
created: 2026-09-07
---

# Proxy 实现 reactive 与 effect

## 【问题】
面试要求「用原生 JS 手写一个极简响应式系统（reactive + effect），40 行左右」，整体思路是什么？

## 【回答】
只需要三个角色：**`reactive`（用 Proxy 拦截对象的读和写）**、**`effect`（注册副作用函数）**、**`targetMap`（依赖容器）**。

闭环一句话：**effect 首次执行 → 读属性 → `get` 拦截 → `track` 把当前 effect 存进该属性的依赖集合；之后改属性 → `set` 拦截 → `trigger` 取出该属性的所有 effect 重新执行。**

完整实现（约 40 行）：

```javascript
// 保存当前正在执行的 effect
let activeEffect = null
// 依赖映射：target -> key -> Set<effect>
const targetMap = new WeakMap()

// 收集依赖
function track(target, key) {
  if (!activeEffect) return
  let depsMap = targetMap.get(target)
  if (!depsMap) targetMap.set(target, (depsMap = new Map()))
  let deps = depsMap.get(key)
  if (!deps) depsMap.set(key, (deps = new Set()))
  deps.add(activeEffect)
}

// 触发更新
function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const deps = depsMap.get(key)
  deps && deps.forEach(fn => fn())
}

// 响应式代理
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      track(target, key)
      return Reflect.get(target, key)
    },
    set(target, key, val) {
      const res = Reflect.set(target, key, val)
      trigger(target, key)
      return res
    }
  })
}

// 副作用注册
function effect(fn) {
  activeEffect = fn
  fn() // 首次执行，触发get收集依赖
  activeEffect = null
}
```

## 【问题】
`reactive` 的 Proxy 里 `get` / `set` 分别要做什么？为什么用 `Reflect`？

## 【回答】
- **`get`：先 `track(target, key)` 收集依赖，再用 `Reflect.get(target, key)` 返回原值**。收集必须在返回之前，否则这一次读取不会被记成依赖。
- **`set`：先 `Reflect.set(target, key, val)` 写入，再 `trigger(target, key)` 派发**。**顺序不能反** —— 先写后触发，effect 重新执行时才能读到新值。
- **用 `Reflect` 而不是 `target[key]`**：`Reflect` 的方法与 Proxy 的陷阱**一一对应**，语义更清晰；且 `Reflect.set` 返回布尔值，正好作为 `set` 陷阱要求的返回值（**返回 false 在严格模式下会抛 `TypeError`**）。
- **注意本例没有传 `receiver`**：`Reflect.get(target, key)` 只有两个参数，所以对象自身的 getter 里 `this` 仍指向原始对象而非代理对象。更完整的实现会传第三个参数 `receiver`（进阶追问点，本资料未展开）。
- **注意没有递归代理**：`get` 返回嵌套对象时不会再包一层 `reactive`，所以**深层对象不是响应式的**，这是最小实现的取舍。

## 【问题】
`effect(fn)` 为什么注册时要立即执行一次？依赖是怎么「自动」收集到的？

## 【回答】
**`effect(fn)` 先把 `fn` 赋给全局的 `activeEffect`，然后立刻执行 `fn()`**。`fn` 内部访问 `state.count` 会被 Proxy 的 `get` 拦截，此时 `track` 看到 `activeEffect` 非空，就把这个 `fn` 记进 `targetMap[target]['count']` 对应的集合里；**执行完再把 `activeEffect` 置回 `null`**。

所以「自动收集」的本质是：**用一次真实的函数执行，把函数究竟读过哪些属性「跑」出来**。之后每次 `set` 触发 `trigger`，effect 就会重新执行。

**边界：只有在 effect 内部读写的属性才会被收集**；不在 effect 内部读写属性，既不会收集依赖，修改时也不会触发重跑。

验证 Demo 与运行输出：

```javascript
const state = reactive({ count: 0 })

effect(() => {
  // effect内部读取 count，会被 track 收集依赖
  console.log('effect执行，count =', state.count)
})

console.log('--- 修改count=10 ---')
state.count = 10 // set触发trigger，effect重新运行
console.log('--- 修改count=20 ---')
state.count = 20
```

```
effect执行，count = 0
--- 修改count=10 ---
effect执行，count = 10
--- 修改count=20 ---
effect执行，count = 20
```

## 【问题】
依赖容器 `targetMap` 为什么设计成 `WeakMap → Map → Set` 三层？

## 【回答】
- **第一层 `WeakMap`（target → depsMap）**：key 是**被代理的原始对象**。用 WeakMap 是**弱引用**，原始对象被回收时整条依赖记录自动释放，**避免内存泄漏**。
- **第二层 `Map`（key → deps）**：key 是**属性名**，一个对象的每个属性各自维护一份依赖集合。
- **第三层 `Set`（deps）**：存**依赖该属性的 effect 函数集合**。用 Set 天然**去重** —— 同一个 effect 里多次读同一属性只记一次，触发时不会重复执行。

## 【问题】
这个最小实现有哪些局限？面试会怎么追问？

## 【回答】
本实现明确未处理的部分：

- **无嵌套 effect**：`activeEffect` 只是单个变量，内层 effect 会覆盖外层，且内层执行完把它置为 `null`，**外层后续的属性读取就收集不到依赖**（真实实现用栈/链表保存当前 effect）。
- **无调度器（scheduler）**：`trigger` 只能同步逐个执行 effect，**没有批量刷新、去重、异步合并**的能力（如把多次修改合并成一次更新）。
- **无清理依赖**：effect 里按条件读属性（`flag ? a : b`）时，**旧依赖不会被移除**，条件切换后仍会被多余触发，需要依赖清理与 `dep ↔ effect` 双向记录。
- **只支持对象**：**不处理数组**（下标、`length` 等需要额外拦截），**不处理 `ref`**（基本类型无法被 Proxy 代理）。
- **无深层代理**：嵌套对象不会被递归转换成响应式。

## 【考察点】
- 能否把「**get 收集 / set 触发**」的闭环讲清楚，而不是背代码。
- `targetMap` 三层结构各层存什么、**为什么用 WeakMap 和 Set**。
- `activeEffect` 是什么、何时被设置与清空。
- `set` 里**先写后触发**的顺序，以及 `Reflect` 的返回值作用。
- 能否主动说出局限（**嵌套 effect、调度器、依赖清理、数组与 ref**），这是区分度最高的追问点。

## 【衍生问题】
- 如何支持嵌套 effect？（用栈保存 activeEffect，待补充）
- 如何实现 scheduler，把多次修改合并成一次执行？（待补充）
- 为什么数组需要特殊处理？（待补充）
- `ref` 为什么要包一层 `.value`？（待补充）
- 深层对象如何做惰性递归代理？（待补充）
- `Reflect.get` 传 `receiver` 解决了什么问题？（待补充）

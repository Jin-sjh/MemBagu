---
category: Vue
topic: Composition_API
type: bagu
tags: [Vue, Composition API, 组合式API, 选项式API, Mixin, Composables, 生命周期钩子, setup]
difficulty: medium
created: 2026-07-24
---
# Vue Composition API

## 【问题】
Vue3 Composition API 如何解决逻辑复用？对比 Mixins 和 React Hooks？

## 【回答】
可以从逻辑复用、命名冲突、代码组织、类型推导四个方面回答：

### 1. Composition API 怎么解决逻辑复用？

Composition API 核心是通过自定义组合函数（Composables）实现逻辑复用。它把独立功能封装成一个以 use 开头的函数，在组件里导入调用，显式返回状态和方法。这样逻辑可以跨组件复用，而且来源清晰、可维护、可扩展。

### 2. 对比 Mixins（重点！面试必问）

Mixins 的缺点非常明显：

1. **命名冲突**：多个 Mixins 同名属性会静默覆盖，没有提示，极难排查。
2. **来源不清晰**：变量和方法是隐式注入的，属于黑盒逻辑，不知道来自哪里。
3. **代码碎片化**：按选项（data/methods）组织，一个功能拆得很散。
4. **类型推导差**：对 TS 非常不友好。

Composition API 完全解决了这些问题：

- 显式导入导出，不会命名冲突
- 逻辑来源一目了然
- 按业务功能聚合代码，结构更清晰
- TS 类型推导非常完美

### 3. 对比 React Hooks

两者思想类似，都是函数式逻辑复用，但 Composition API 更友好：

1. Vue 没有 Hooks 规则限制，不用保证调用顺序。
2. 没有闭包陷阱，不用维护依赖数组。
3. 响应式系统更稳定，心智负担更低。

### 4. 一句话总结（结尾加分）

Composition API 用"显式的组合函数"替代了 Mixins 的隐式合并，从根源解决了命名冲突、代码混乱、来源不清晰、类型推导差的问题，是 Vue 现阶段最优雅、最规范的逻辑复用方案。

### 超精简版（30 秒回答）

Composition API 通过自定义组合函数实现逻辑复用，相比 Mixins：显式导入不冲突、来源清晰、代码聚合、TS 友好；相比 React Hooks：无规则限制、无闭包陷阱、响应式更稳定。

## 【问题】
Vue 3 组合式 API 与 Tree-shaking 的关系？

## 【回答】
Vue 3 的组合式 API（setup）是 ESM 友好的，能被 Tree-shaking 优化：

- **选项式 API（Options API）**：`this` 是动态对象，无法被静态分析，无法 Tree-shaking；
- **组合式 API（Composition API）**：`import { ref, computed } from 'vue'` 是静态导入，未使用的 API 会被 Tree-shaking 移除，打包体积更小。

## 【问题】
组合式 API 与选项式 API 的区别与联系？

## 【回答】
- **选项式 API**：以"组件实例 `this`"为中心，把响应性细节抽掉，**对初学者友好**；
- **组合式 API**：直接在**函数作用域**定义响应式状态并从多个函数组合，**更自由，但对响应式系统的理解要求更高**。
- **联系**：两者底层是**同一套响应式系统**，**选项式底层基于组合式实现**。

## 【问题】
为什么 `onMounted`、`onUpdated` 这类生命周期钩子必须在 `setup()` 的**同步执行过程**中调用？写在 `setTimeout`、`Promise.then`、`await` 之后为什么会失效？

## 【回答】
**核心结论：生命周期钩子靠「当前激活组件实例」这个全局上下文完成注册，而这个上下文只在 setup 同步执行期间存在。**

### 1. Vue 注册一个钩子的三步

1. **执行 setup 前**：Vue 把当前正在初始化的组件实例赋值给内部的全局「当前实例」变量（打上标记：现在处理的是这个组件）。
2. **同步执行 setup**：调用 `onMounted(cb)` 时，函数内部读取这个全局变量，把 `cb` 注册到**该组件对应的生命周期队列**里。
3. **setup 执行完毕**：Vue 立刻清空该全局变量（擦掉标记），继续后续渲染流程。

### 2. 为什么异步写法会失效

`setTimeout`、网络请求、`await` 之后的回调**不会在 setup 执行期间立刻运行**，而是等到 setup 结束、甚至组件渲染完之后才执行。等回调真正跑到 `onMounted()` 时：

- setup 早已结束；
- 全局「当前实例」已被清空；
- Vue 无法判断这个钩子属于哪个组件，**注册失败**，生命周期真正触发时回调不会执行（开发环境下 Vue 会打印 `Lifecycle injection APIs can only be used during execution of setup()` 警告）。

### 3. 代码示例

```js
// ✅ 正确：同步执行，此时「当前实例」仍在，能绑定到当前组件
setup() {
  onMounted(() => { console.log('mounted') })
}

// ❌ 错误：异步回调执行时 setup 已结束，实例上下文已清空，注册失败
setup() {
  setTimeout(() => {
    onMounted(() => { /* 永远不会执行 */ })
  }, 0)
}
```

### 4. 边界：不必写在 setup 最顶层，只要在同步调用栈里

```js
function useMyHook() {
  onMounted(() => { /* ✅ 合法：被 setup 同步调用，仍在同步栈内 */ })
}
setup() {
  useMyHook()
}
```

这正是 composable（组合式函数）能够封装生命周期逻辑的原因——**Vue 不做源码位置检查，只检查调用时刻有没有激活实例**。

### 5. 特例：`<script setup>` 顶层 await 之后仍然有效

Vue 对异步 setup 有专门的兜底：编译器会把 `<script setup>` 的顶层 `await` 包进 `withAsyncContext`，在 await 前后**保存并恢复**当前实例，因此顶层 `await` 之后调用 `onMounted` 仍能正确注册（代价是组件变成异步组件，需要配合 `Suspense`）。

注意区分：这是编译器 + 运行时的**显式处理**；普通的 `setTimeout` / `.then` 回调没有这层机制，依然会失效。

### 6. 与 React Hooks 规则的异同（面试常追问）

- **相同点**：都依赖**确定的执行时机与上下文**来完成逻辑与组件实例的绑定。
- **差异点**：React Hooks 依赖的是**调用顺序**（所以禁止在条件/循环里调用）；Vue 依赖的是**当前实例上下文**而非调用顺序，因此 Vue **允许**在 `if` / `for` 中调用 `onMounted`，只要仍处于 setup 的同步执行栈里。

### 一句话总结

**钩子注册的不是"位置"，是"时刻"——只要调用时全局当前实例还在（setup 同步执行栈内），注册就成立；异步回调里实例已卸载，绑定无从谈起。**

## 【衍生问题】
- 多个 `onMounted` 的执行顺序由什么决定？（注册顺序 vs 调用顺序）—— 待补充
- `onUnmounted` 在异步回调中注册失败，会导致哪些内存泄漏场景？—— 待补充
- `effectScope` / `onScopeDispose` 与组件实例上下文的关系？—— 待补充

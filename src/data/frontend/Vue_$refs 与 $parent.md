---
category: Vue
topic: $refs 与 $parent
type: bagu
tags: [Vue, refs, $parent, defineExpose, 组件通信, 响应式]
difficulty: medium
created: 2026-09-06
---
# $refs 与 $parent

## 【问题】
Vue3 中为什么说通过 $refs / $parent 获取组件实例「不等同于响应式」？Vue2 与 Vue3 有何变化？

## 【回答】
**核心结论**：`$refs`、`$parent` 是直接获取**组件实例**的"逃生舱"，最大的陷阱就是**不等同于响应式**——它适合命令式调用方法，但不适合作为数据驱动更新视图的手段。

- **Vue2**：组件实例上的 `data` / `computed` 会被自动代理，通过 `$parent` 或 `this.$refs` 修改数据**会触发子组件更新**，但跨组件改数据维护极其困难。
- **Vue3（关键变化）**：
  1. 在 `<script setup>` 语法糖中，组件默认是**关闭的（Closed Component）**。父组件通过 `$refs` 获取到的实例，**默认只能访问到 `defineExpose` 暴露出来的属性**。
  2. **响应性断裂**：通过 `$parent` 修改父组件的 `ref` 对象，值虽然变了，但如果子组件只是把值拷贝下来或未按响应式方式接入（如未用 `toRefs` 解构正确绑定），**不会自动触发子组件的视图更新**——极易造成数据流混乱。

## 【问题】
在 `<script setup>` 中，父组件通过 $refs 调用子组件方法有哪些前提？如何安全调用？

## 【回答】
`$refs` 只触发行为、不依赖响应式，这是**安全**的使用方式，但有两个前提：

1. 子组件必须用 **`defineExpose({ ... })` 显式暴露**方法，否则在 `<script setup>` 默认关闭的组件上，父组件**拿不到任何方法**。
2. 父组件侧的 ref 初始值为 `null`（组件挂载后才被赋值），调用时用**可选链**兜底。

```vue
<!-- 子组件 Child.vue -->
<script setup>
import { ref } from 'vue'
const count = ref(0)
const reset = () => { count.value = 0 }

// 必须暴露给父组件，否则父组件拿不到 reset
defineExpose({ reset })
</script>
```

```vue
<!-- 父组件 -->
<template>
  <Child ref="childRef" />
  <button @click="handleReset">重置</button>
</template>

<script setup>
import { ref } from 'vue'
const childRef = ref(null) // 注意：初始值为 null
const handleReset = () => {
  childRef.value?.reset() // 安全调用
}
</script>
```

## 【问题】
通过 $parent 修改父组件数据为什么是"非响应式陷阱"（高危操作）？底层有什么坑？

## 【回答】
在 `<script setup>` 中父组件**默认不会暴露任何东西给 `$parent`**，必须先 `defineExpose`；子组件侧则用 `getCurrentInstance()` 替代 Vue2 的 `this.$parent`：

```vue
<!-- 父组件 -->
<script setup>
import { ref } from 'vue'
const msg = ref('Hello')
// 注意：在 <script setup> 中，父组件默认不会暴露任何东西给 $parent
// 除非使用 defineExpose({ msg })
defineExpose({ msg })
</script>
```

```vue
<!-- 子组件 -->
<script setup>
import { getCurrentInstance } from 'vue'
const instance = getCurrentInstance() // 替代 this.$parent

const changeParent = () => {
  // 危险操作：直接修改父组件数据
  instance.parent?.exposed?.msg.value = 'World'
}
</script>
```

**为什么说"不等同于响应式"？**
- 直接改 `exposed.msg` 的值，父组件模板里 `{{ msg }}` 或许会更新（改的确实是同一个 ref）；
- 但若子组件把父组件的 `msg` 拿去渲染，而取值方式**没有接入响应式依赖收集**，子组件的视图**不会跟着更新**，出现"值变了视图不动"的**灵异事件**。

**结论**：`$parent` 跨层改数据**违反了单向数据流**，数据来源与修改路径不可控。遇到这种问题，第一检查是否忘记 `defineExpose`，第二直接**重构为 `v-model`**。永远不要用 `$parent` 改数据。

## 【问题】
Vue3 官方推荐用哪些方式替代 $refs / $parent 的跨组件数据操作？$refs 何时可以放心使用？

## 【回答】
数据层面的通信应交给官方响应式方案，而不是实例逃生舱：

| 方式 | 适用场景 | 响应式保证 |
| :--- | :--- | :--- |
| **`defineProps` / `defineEmits`** | 父子组件标准通信 | **完全响应式**（推荐） |
| **`provide` / `inject`** | 深层级祖先与后代通信 | **完全响应式**（需传入 `ref`） |
| **`v-model`（多个绑定）** | 父子组件双向绑定数据 | **完全响应式**（官方推荐） |

**替代 `$parent` 的最佳实践（`v-model` 改造）**：

```vue
<!-- 父组件 -->
<template>
  <Child v-model:msg="msg" />
</template>

<script setup>
import { ref } from 'vue'
import Child from './Child.vue'
const msg = ref('Hello')
</script>
```

```vue
<!-- 子组件 -->
<script setup>
defineProps(['msg'])
defineEmits(['update:msg'])
</script>
```

**`$refs` 可放心使用的场景**：只有**不需要追踪数据变化**、仅需**命令式操作 DOM 或调用方法**时：
- 聚焦输入框：`inputRef.value.focus()`
- 调用子组件表单校验：`formRef.value.validate()`
- 初始化第三方图表库：`chartRef.value.init()`

## 【口诀】
> **调用方法用 refs，修改数据用 emit；想看父级用 parent，调试可以，生产别碰。**

## 【衍生问题】
- Options API 组件默认会把实例上的 data/methods 全部暴露给父组件，与 `<script setup>` 默认关闭的差别具体是如何实现的？（待补充）
- `getCurrentInstance()` 必须在 setup 执行期间同步调用，在异步回调里使用会拿到什么？（待补充）
- `defineExpose` 暴露出去的是 ref 本身，父组件拿到后若配合 `toRefs` / 计算属性使用，能否恢复响应式？边界在哪？（待补充）

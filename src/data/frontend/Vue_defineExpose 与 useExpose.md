---
category: Vue
topic: defineExpose 与 useExpose
type: bagu
tags: [Vue, 组合式API, script setup, defineExpose, useExpose, VueUse, 组件通信]
difficulty: medium
created: 2026-09-06
---
# defineExpose 与 useExpose

## 【问题】
`<script setup>` 下父组件通过 ref 为什么拿不到子组件内部的方法/变量？如何显式暴露？

## 【回答】
`<script setup>` 语法糖下，**默认所有变量、方法都是组件私有的，不会对外暴露**；父组件通过 `ref` 获取子组件实例后，访问不到子组件内部定义的业务函数/变量，必须手动暴露。

`defineExpose` 是 **仅 `<script setup>` 可用的编译器宏，无需导入**，用于显式暴露成员给父组件：

```vue
<!-- Child.vue -->
<script setup>
const open = () => { console.log('打开') }
const msg = 'hello'

// 显式暴露给父组件访问
defineExpose({
  open,
  msg
})
</script>
```

父组件通过 ref 调用子组件暴露的方法：

```vue
<template>
  <Child ref="childRef" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
const childRef = ref(null)

onMounted(() => {
  childRef.value.open() // 访问子组件暴露的方法
  console.log(childRef.value.msg)
})
</script>
```

**注意点**：
1. 没写 `defineExpose` 时，`childRef.value` 拿到的只有 **原生 DOM 属性 + Vue 内置实例属性**，拿不到业务定义的方法/变量；
2. `defineExpose` 暴露的对象只对 **父组件模板 ref** 可见，**不是全局**。

## 【问题】
defineExpose 和 VueUse 的 useExpose 有什么区别？什么时候用哪个？

## 【回答】
两者目的相同：把子组件内部成员暴露给父组件模板 ref。区别在于：

| | defineExpose | useExpose |
| :--- | :--- | :--- |
| 出身 | **Vue 内置编译器宏** | **VueUse 工具库**的函数式封装，非 Vue 内置 API |
| 使用前提 | 仅 `<script setup>`，无需导入 | 需 `import { useExpose } from '@vueuse/core'` |
| 写法 | 声明式宏 | 命令式函数调用 |
| 定位 | **首选** | 适合需要 **动态计算暴露对象** 的场景 |

```js
import { useExpose } from '@vueuse/core'

const close = () => {}
useExpose({ close })
```

**小结**：`defineExpose` 是 Vue 官方编译器宏，绝大多数场景首选；`useExpose` 等价于 `defineExpose` 的函数式写法，同样只在 `<script setup>` 环境生效，需要动态拼装暴露对象时才更有优势。

## 【衍生问题】
- `<script setup>` 为什么设计成默认关闭（不自动暴露内部成员）？（待补充）
- Options API 组件默认把实例上的 data/methods 全部暴露给父组件，与 `<script setup>` 默认关闭的差异底层如何实现？（待补充）
- 组件通信方案全景（props/emits、provide-inject、Pinia、事件总线等）与各自的选型顺序，参见 `Vue_组件通信方案.md`。（待补充）

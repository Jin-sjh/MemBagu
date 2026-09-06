---
category: Vue
topic: Pinia 与 provide-inject
type: bagu
tags: [Vue, Pinia, provide, inject, 状态管理, 全局状态, 组件通信]
difficulty: medium
created: 2026-09-06
---
# Pinia 与 provide-inject

## 【问题】
Vue3 全局共享状态有哪些方案？Pinia 和「根组件 provide + inject」各自怎么写？

## 【回答】
全局状态管理两条路线：**Pinia（官方推荐状态管理）** 与 **provide-inject 的全局形态（根组件 provide）**。

### Pinia：独立状态仓库

跨组件任意访问，支持 devtools、模块拆分、持久化、TS 友好。

```ts
// stores/counter.ts
import { defineStore } from 'pinia'
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    inc() { this.count++ }
  }
})
```

任意组件直接使用：

```ts
import { useCounterStore } from '@/stores/counter'
const counter = useCounterStore()
counter.inc()
```

**特点**：
- ✅ **全局单例**，任何组件导入即可用；
- ✅ 修改状态有明确 action，**可追踪**；
- ✅ 适合业务全局状态：用户信息、配置、业务数据。

### provide-inject：根组件 provide 的近似全局

`provide/inject` 默认是**树形层级传递**；想做到近似全局，就在**根组件 `App.vue`** 做 provide：

```vue
<!-- App.vue 根组件，全局provide -->
<script setup>
import { provide, ref } from 'vue'
const globalConfig = ref({ theme: 'dark' })
provide('globalConfig', globalConfig)
</script>
```

任意后代组件 inject 获取：

```js
import { inject } from 'vue'
const config = inject('globalConfig')
```

## 【问题】
根组件 provide-inject 能算真正的全局状态吗？有什么短板？如何和 Pinia 选型？

## 【回答】
⚠️ **provide-inject 的"全局"不是真正全局**，短板明显：

1. **受组件树限制**：只能在 App 组件的**后代组件**生效；脱离该组件树（如 teleport、动态挂载的弹窗组件）拿不到；
2. **默认无保护**：建议搭配 **Symbol key** 防止命名冲突；
3. **没有状态修改约束**：谁拿到都可以直接改，也没有 devtools 追踪变更；
4. 适合：**简单全局配置、主题、工具实例**，不适合复杂业务状态。

### provide-inject 与 Pinia 选型速览

| 方案 | 适用场景 | 缺点 |
| :--- | :--- | :--- |
| **Pinia** | 业务全局状态，多组件读写、修改逻辑复杂 | 需要额外 store 文件 |
| **provide-inject（根 provide）** | 轻量全局配置、工具实例 | 无修改管控，仅限组件树内 |

**一句话总结**：全局状态，复杂业务用 **Pinia**；简单配置可以根组件 **provide + inject**；provide-inject 受组件树限制，**不等于真正的全局**。

## 【衍生问题】
- provide 的值传普通对象和传 `ref`，对后代响应式的影响有何不同？（待补充）

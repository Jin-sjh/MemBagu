---
category: Vue
topic: v-model 原理
type: bagu
tags: [Vue, v-model, 双向绑定, 语法糖, 组件通信, props, emit]
difficulty: medium
created: 2026-09-06
---
# v-model 原理

## 【问题】
v-model 的本质是什么？不使用 v-model，原生输入框如何手动实现双向绑定？

## 【回答】
`v-model` 本质是**语法糖**，等价于 `:value` 绑定值 + `@input` 监听输入事件，核心分两步：

1. **`:value`**：单向把**数据源**渲染到视图；
2. **`@input`**：监听视图变化，通过 `e.target.value` 获取最新内容，手动把新值写回数据源。

原生 input 手动实现（Vue3）：

```vue
<template>
  <div>
    <!-- :value 传值，@input 更新变量，替代 v-model -->
    <input
      type="text"
      :value="msg"
      @input="handleInput"
      placeholder="请输入内容"
    />
    <p>当前值：{{ msg }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const msg = ref('初始文本')

// e.target.value 获取输入框最新内容，手动赋值
const handleInput = (e) => {
  msg.value = e.target.value
}
</script>
```

## 【问题】
封装自定义子组件时，v-model 如何在父子组件间同步？子组件要如何配合实现？

## 【回答】
子组件需要满足 v-model 协议：接收 **`modelValue` prop**，并在输入时触发 **`update:modelValue` 事件**把新值传给父组件。

**子组件 MyInput.vue：**

```vue
<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
</script>
```

**父组件不写 v-model、完全展开调用：**

```vue
<template>
  <MyInput
    :model-value="text"
    @update:model-value="text = $event"
  />
  <div>父层数据：{{ text }}</div>
</template>

<script setup>
import { ref } from 'vue'
import MyInput from './MyInput.vue'

const text = ref('')
</script>
```

## 【问题】
Vue3 中 v-model 的完整展开式是什么？与 Vue2 有何差异？

## 【回答】
- **Vue3**：`v-model="xxx"` 完整展开就是 **`:model-value="xxx"` + `@update:model-value="xxx = $event"`**。
- **Vue2**：子组件协议是 **`value` prop + `input` 事件**，而非 Vue3 的 `modelValue` / `update:modelValue`。

## 【问题】
手写一个 Counter 组件：不用 v-model，只用 prop + emit 模拟双向绑定（父传 `initialValue`）？

## 【回答】
核心原则：**子组件绝不直接修改 props**，只在交互时 `emit` 新值，由**父组件自己修改数据源**——这正是 `v-model` 的本质。

**子组件 Counter.vue（prop 名 `initialValue`，事件名 `update`）：**

```vue
<template>
  <div class="counter">
    <button @click="$emit('update', initialValue - 1)">-</button>
    <span>{{ initialValue }}</span>
    <button @click="$emit('update', initialValue + 1)">+</button>
  </div>
</template>

<script setup>
defineProps({
  initialValue: { type: Number, default: 0 }
})
defineEmits(['update'])
</script>
```

**父组件持有数据源并监听事件：**

```vue
<template>
  <div>
    <p>父数据：{{ num }}</p>
    <Counter :initial-value="num" @update="newVal => num = newVal" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Counter from './Counter.vue'

const num = ref(10) // 父传入初始值
</script>
```

要点：
- **父组件是数据源的持有者**，子组件只负责展示和抛事件；
- 回调可简写为 `@update="num = $event"`，**`$event` 是模板内置变量**，拿到的就是 emit 传出的第二个参数；
- 驼峰 prop 在模板中必须写成 kebab-case：`initialValue` → `:initial-value`；
- 对比标准写法：若子组件改用 `modelValue` + `emit('update:modelValue', ...)`，父组件即可直接 `<Counter v-model="count" />`。

## 【问题】
v-model / 父子通信写法里，哪些是 Vue 固定语法（不能改名），哪些是业务自定义（可以改名）？

## 【回答】
一句话：**API 函数名是死的；prop 名、事件字符串是活的；只有用内置 `v-model` 语法糖时，prop 与事件名被锁死。**

| 代码片段 | 性质 | 能否改名 |
| --- | --- | --- |
| `defineProps()` | Vue 固定 API | **不能改** |
| `defineEmits()` | Vue 固定 API | **不能改** |
| `$emit()` / `emit()` | Vue 内置方法 | **不能改** |
| `$event` | 模板内置变量 | **不能改** |
| `modelValue` + `update:modelValue` | v-model 固定约定 | **使用 v-model 时不能改** |
| prop 字段名 `initialValue` | 业务自定义 | **可以改**（`count` / `startNum` 均可） |
| emit 事件字符串 `'update'` | 业务自定义 | **可以改**（`change` / `change-count` 均可） |
| ref 变量名 `num` | 业务自定义 | **可以改** |
| 加减业务逻辑与按钮 UI | 业务自定义 | **可以改** |

补充说明：
- `defineProps` 对象里的 **key 就是 prop 名**（可自定义），`defineEmits` 数组里的**事件名字符串**也可自定义，但**两个 API 名本身是固定的**；
- 不使用 v-model、手动写 `:xxx="a" @update:xxx="a = $event"` 时，prop 名与事件名**完全由业务决定**；
- `const emit = defineEmits([...])` 里的变量名习惯叫 `emit`，技术上可改，但不推荐。

## 【问题】
手动模拟双向绑定（自定义 prop / 事件名）有哪些容易踩的坑？

## 【回答】
1. **想用 `v-model` 语法糖就必须严格遵守 `modelValue` / `update:modelValue`**：写成 `:initial-value` + `@update` 时 `v-model` 识别不到，只能手动绑定 prop 与事件。
2. **prop 名大小写**：JS 里是驼峰 `initialValue`，模板里必须写短横线 `:initial-value="xxx"`，这是 **Vue 强制规则**。
3. **子组件不能改 props**：在子组件里直接 `initialValue++` 会触发警告且父子数据不一致，必须 `emit` 交给父组件更新。
4. **事件名与监听名必须成对**：子组件把 `'update'` 改成 `'change'` 后，父侧监听要同步改为 `@change="num = $event"`。
5. 多个值需要双向绑定时用**具名 v-model**：`v-model:title` ↔ prop `title` + 事件 `update:title`。

## 【衍生问题】
- Vue3.4+ 的 `defineModel` 宏如何简化自定义组件 v-model 的实现？（待补充）
- input 类型为 checkbox / radio / select 时，v-model 实际绑定的是 `checked` / `selected` 而非 `value`，内部如何区分处理？（待补充）

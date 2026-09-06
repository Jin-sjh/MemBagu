---
category: Vue
topic: 组件通信方案
type: bagu
tags: [Vue, 组件通信, props, emit, v-model, provide-inject, Pinia, 事件总线, defineExpose, script setup]
difficulty: medium
created: 2026-09-06
---
# 组件通信方案

## 【问题】
说出 4 种以上的组件通信方案，并说明各自的适用场景与限制。

## 【回答】
Vue 里组件通信可以按「组件关系」选方案，**优先用父子 props/emits，其次跨层 provide-inject，全局/无层级用 Pinia，命令式调用才用 ref + expose，事件总线是最后手段**。

### 速览表

| 方案 | 关系 | 适用场景 | 主要限制 |
| :--- | :--- | :--- | :--- |
| **props / emits** | 父子 | **默认首选**，单向数据流 | 只能一层；多层需逐层转发（prop drilling） |
| **v-model / defineModel** | 父子 | 表单类双向绑定 | 双向让数据流追踪变难，不利于调试 |
| **ref + defineExpose** | 父→子 | 父调子方法（弹窗 open、表单 validate/submit） | 破坏封装、父子强耦合；需等 mounted |
| **provide / inject** | 祖孙/跨层 | 组件库（Form/FormItem）、主题配置 | 数据来源不透明，调试困难；**不是真正全局** |
| **Pinia / Vuex** | 任意/全局 | 多组件共享、跨路由、需持久化/时间旅行 | 小项目引入有成本，别什么都塞进 store |
| **事件总线 mitt** | 任意 | 无层级兄弟组件、跨树通知 | 事件满天飞不可追踪；**必须 off 解绑**否则内存泄漏 |
| **$attrs 透传** | 父→后代 | 二次封装三方组件（包装 el-input） | 只向下传，容易透传脏属性 |
| **插槽 / 作用域插槽** | 父子 | 结构下发 + 子数据回传（表格列、列表项） | 仅父子，过度使用模板割裂 |
| **外部媒介（URL / storage / postMessage）** | 任意/跨页 | 跨路由传参、跨标签页、iframe | 天然非响应式，需手动监听 |

### 1. props + emits（父子，首选）

```vue
<script setup>
const props = defineProps({ modelValue: String })
const emit = defineEmits(['update:modelValue', 'submit'])
</script>
```

- **props 只读**：子组件不能直接改引用（改对象内部属性虽不报错，但违反单向数据流）；
- 多层嵌套需要逐层转发，产生 prop drilling。

### 2. v-model（父子双向）

Vue 3.4+ 用 `defineModel()` 一行搞定，支持 `v-model:title` 多绑定。

```vue
<script setup>
const title = defineModel('title') // 直接读写，自动同步父级
</script>
```

限制：**双向绑定让「谁改了数据」变模糊**，深层嵌套慎用。

### 3. ref + defineExpose（父调子）

```vue
<Child ref="childRef" />
<!-- 需子组件 defineExpose({ open }) 后：childRef.value.open() -->
```

- 耦合最紧的一种，父子无法独立复用；
- **Vue3 已移除 `$children`**；
- 异步组件 / `v-if` 下 ref 可能为 null，要在 `onMounted` 之后访问。

### 4. provide / inject（跨层级）

```js
// 祖先
provide(ThemeKey, readonly(theme))   // Symbol key + readonly
provide('setTheme', setTheme)         // 同时提供修改方法
// 后代
const theme = inject(ThemeKey, defaultVal)
```

- **不是真正全局**：只在 provide 组件的子树内生效，脱离该组件树（如部分 Teleport / 动态挂载场景）拿不到；
- 数据源不透明，调试要回溯多个文件；
- 工程实践：**Symbol key 防重名 + `readonly` 防后代乱改 + 提供修改方法**。

### 5. Pinia（全局状态）

适用：用户信息、权限、购物车、跨路由数据。限制：小项目引入是过度设计；**store 与组件本地状态要有明确边界**——只有被多处读写的数据才进 store。

### 6. 事件总线 mitt

Vue3 移除了实例上的 `$on/$off/$emit`，需用第三方：

```js
mitt.emit('refresh', payload)
mitt.on('refresh', handler)  // onUnmounted 里务必 mitt.off('refresh', handler)
```

限制：无法在 devtools 追踪，**优先用 Pinia 替代**，只在无明显归属的一次性通知使用。

### 7. $attrs 透传

封装 `el-input` 时，`inheritAttrs: false` + `v-bind="$attrs"`，把未声明的属性和事件原样下传。**Vue3 中 `$attrs` 已包含 `class/style` 和事件监听器**。

### 8. 插槽 / 作用域插槽

父传结构给子，子通过 `<slot :row="row">` 把数据回传给父模板，适合「布局在父、数据在子」的场景。

### 9. 外部媒介

`route.query`、`localStorage`（配合 `storage` 事件）、`BroadcastChannel`（跨标签页）、`postMessage`（iframe/跨窗口）。限制：非响应式，需手动同步。

### 选型顺序（加分点）

**父子 props/emits → 跨层 provide/inject 或提升到共同父级 → 兄弟/无层级 Pinia → 命令式调用子组件用 ref + expose → 事件总线兜底。**

## 【问题】
`<script setup>` 中子组件默认对父组件暴露什么？如何主动暴露？

## 【回答】
**默认：内部绑定一律不暴露。** `<script setup>` 里所有顶层变量、函数、`import` 都被编译进 setup 的闭包，**不会挂到组件实例上**；父组件通过模板 ref 拿到的是一个「受限的公开实例代理」，只能访问 Vue 内置的 `$` 系列属性和透传进来的 attrs/事件：

```
$el  $props  $attrs  $slots  $emit  $refs  $parent  $root  $options  $forceUpdate  $nextTick  $watch
```

业务方法 `open()`、变量 `msg` 一律 `undefined`。

对比：**Options API 组件默认全暴露**，`data/methods/computed` 都能被父组件 ref 直接访问——这正是 Vue3 在 `<script setup>` 中「默认关闭」的原因：把组件内部当黑盒，避免父组件依赖实现细节。

两个易踩点：
1. 调用 `defineExpose` 后，`$refs.xxx` 拿到的是 **exposed 对象而非组件实例**，此时 `$refs.xxx.$el` 也不再可用，除非手动把 DOM 一起暴露；
2. devtools 里仍能看到 setupState，那是**调试通道**，代码里取不到。

### 主动暴露的 4 种方式

```vue
<!-- ① 首选：defineExpose 编译器宏，无需 import，仅 script setup 可用 -->
<script setup>
const open = () => {}
defineExpose({ open, formRef })   // 建议暴露方法而非整个表单 state
</script>
```

```js
// ② 普通 setup() 函数的第二个参数 expose
setup(props, { expose }) { expose({ open }) }

// ③ Options API 的 expose 选项（Vue 3 新增）
export default { expose: ['open'], methods: { open() {} } }

// ④ VueUse 的 useExpose：函数式，适合动态拼装暴露对象
import { useExpose } from '@vueuse/core'
useExpose({ open })
```

**注意**：`defineExpose` 只对**父组件模板 ref** 可见，不是全局共享；暴露的 ref 在父组件访问时会自动解包。建议只暴露**最小必要的方法**（`open/close/validate/submit`），而不是把整个 state 抛出，否则又回到「父组件直接改子状态」的老问题。

## 【衍生问题】
- 兄弟组件通信有几种实现？为什么优先提升到共同父级而不是用事件总线？（待补充）
- `provide` 传入普通对象与传入 `ref` 对后代响应式的影响？（待补充，参见 `Vue_Pinia 与 provide-inject.md`）
- Vue3 为什么要移除实例上的 `$on/$off/$emit`（EventBus）？（待补充）

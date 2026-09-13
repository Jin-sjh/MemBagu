---
category: Vue
topic: 事件缓存
type: bagu
tags: [Vue, Vue3, 编译优化, 事件缓存, cacheHandlers, patchFlag]
difficulty: medium
created: 2026-09-11
---

# 事件缓存

## 【问题】
什么是事件缓存（Cache Handlers）？为什么需要它？

## 【回答】
**事件缓存是 Vue3 编译优化机制之一**：编译器在编译阶段分析事件绑定，把**稳定的内联事件处理函数**保存到缓存数组中，避免每次 render 重新创建函数，从而减少 VNode 属性变化检测和不必要的更新。

它要解决的核心问题是：

> **函数本身没有变化，但每次渲染都会生成新的函数对象。**

```js
const a = () => console.log('hello')
const b = () => console.log('hello')

console.log(a === b) // false
```

原因是函数比较的是**内存地址**，不是**代码内容**，所以即使逻辑完全一样，也会出现 `oldFn !== newFn`。

## 【问题】
为什么函数地址变化会影响 Vue 的更新？

## 【回答】
因为 **Vue diff 主要基于 VNode 属性引用比较**，事件属于 VNode props：

```js
{
  onClick: fn
}
```

只要：

```js
oldProps.onClick !== newProps.onClick
```

Vue 就会认为**需要更新 DOM 事件绑定**，从而进入 patch 流程。

## 【问题】
事件缓存的编译结果长什么样？`_cache` 是什么？

## 【回答】
模板：

```vue
<button @click="count++">
  {{msg}}
</button>
```

Vue compiler 大致生成：

```js
function render(_ctx, _cache) {
  return createVNode(
    "button",
    {
      onClick:
        _cache[0] ||
        (_cache[0] = $event => (_ctx.count++))
    },
    _ctx.msg
  )
}
```

重点是 `_cache[0]` —— 它是 **render context 提供的缓存空间**：

- 第一次 render：`_cache[0]` 不存在 → **创建函数并保存**；
- 之后 render：**直接返回 `_cache[0]`**，引用保持稳定。

如果没有缓存，每次 render 都会生成 `{ onClick: () => count++ }`，`render1` 的 `function A` 与 `render2` 的 `function B` 必然 `A !== B`。

需要区分两种写法：

- `@click="handleClick"`，且 `handleClick` 来自 setup（`const handleClick = () => {}`）——**它本身天然稳定**，不需要缓存；
- `@click="count++"` —— 编译器需要生成 `$event => count++`，**这才是事件缓存主要优化的场景**。

## 【问题】
事件缓存的完整执行链路是怎样的？

## 【回答】
**Template → Compiler 分析发现事件函数稳定 → 生成 cache 表达式 `_cache[0] || fn` → 第一次 render 创建函数并保存 → 第二次 render 直接读取缓存 → VNode props 保持稳定。**

## 【问题】
事件缓存优化的是哪部分性能？是为了让点击更快吗？

## 【回答】
**不是让点击更快。** 点击执行阶段（handler 调用）没有明显变化，事件缓存优化的是 **render → diff → patch** 阶段。

没有事件缓存：

```
state 变化 → render 执行 → 创建新 event handler
→ VNode: { onClick: function(){} }
→ diff 发现 props 变化 → patch
```

有事件缓存：

```
state 变化 → render 执行 → 读取旧 handler
→ VNode: { onClick: oldFunction }
→ diff 发现引用相同 → 跳过
```

所以本质是：**渲染阶段减少对象创建和 diff 比较。** 收益大小取决于**组件数量、更新频率、浏览器环境**等因素。

## 【问题】
哪些事件会被缓存？为什么 Vue 不把所有事件都缓存？

## 【回答】
因为**缓存需要保证语义正确**。如果 handler 依赖的运行时状态会变化，缓存旧函数会导致**闭包捕获旧值**：

```vue
@click="() => foo(id)"
```

其中 `id` 变化后，被缓存下来的旧函数仍然指向旧的 `id`。

所以并非所有事件都会缓存，例如动态事件 `@click="handlers[type]"` 依赖运行时状态，**无法安全缓存**。

## 【问题】
大量列表使用内联事件时，事件缓存的收益如何？

## 【回答】
```vue
<div v-for="item in list">
  <button @click="select(item)">{{ item.name }}</button>
</div>
```

每个节点都需要 `onClick: item => select(item)`，10000 条列表就是 **10000 个函数对象**，且每次更新都要重新创建。

事件缓存可以减少稳定 handler 的产生，但要注意：这个例子里的 handler **依赖 `item`、不是完全静态的**，所以**优化空间有限**。

## 【问题】
事件缓存和「手动缓存 handler」是什么关系？

## 【回答】
开发者手写：

```js
const clickHandler = () => {
  console.log('click')
}
```

配合 `@click="clickHandler"`，这个 handler **天然稳定**，不需要 Vue 额外处理。

因此事件缓存主要针对的是**模板内联表达式**（如 `@click="count++"`）自动生成的函数，让开发者不必像 React 那样处处手动稳定引用。

## 【问题】
事件缓存和 patchFlag、静态提升、Block Tree 是什么关系？

## 【回答】
它们**都是编译期优化**，但解决的是不同环节的问题：

| 优化 | 解决的问题 |
| - | - |
| patchFlag | 减少动态节点比较范围（少比较） |
| 静态提升 | 减少 VNode 创建（少创建） |
| 事件缓存 | 减少 handler 创建和引用变化（少创建函数） |
| Block Tree | 减少遍历节点（少遍历） |

## 【问题】
事件缓存和 React 的 `useCallback` 有什么异同？

## 【回答】
React：

```jsx
<button onClick={() => setCount(count + 1)}>
```

每次 render 都是新函数，通常需要 `useCallback()` **手动**稳定引用。

Vue：由 **template compiler 自动分析 → 自动缓存**，开发者通常无需手动优化。

由此可以推导出 Vue3 的一个优势：**把一部分运行时优化提前到了编译阶段**。

```
React 偏运行时优化：memo / useCallback / useMemo
Vue   偏编译期分析：patchFlag / hoist / cacheHandlers
```

## 【问题】
事件缓存的优缺点与设计权衡是什么？

## 【回答】
优点：

- **减少函数创建**
- **减少 VNode props 变化**
- **降低 patch 成本**
- **开发者无需手动优化**

缺点 / 限制在于：**编译器必须先能分析模板。**

- 模板 `@click="foo"` 可以被优化；
- 但手写 render 函数：

```js
h(Button, {
  onClick() {}
})
```

**编译器无法提前分析**，这类写法享受不到事件缓存带来的收益。

## 【问题】
关于事件缓存有哪些常见误区？

## 【回答】
**误区1：事件缓存是为了让点击更快。** 错误。点击时 handler 调用没有明显变化，真正优化的是 **render → diff → patch** 阶段。

**误区2：所有事件都会被缓存。** 错误。例如动态事件 `@click="handlers[type]"` 依赖运行时状态，**无法安全缓存**。

## 【考察点】
- **费曼解释题**：不用术语解释，为什么 Vue 要把 `@click="count++"` 这种写法生成的函数保存起来？
- **反例题**：`<button @click="() => count++">` 为什么不能简单缓存？如果缓存以后可能出现什么问题？
- **迁移题**：React 中 `<button onClick={() => setCount(count + 1)}>` 为什么经常需要 `useCallback()`？它和 Vue 事件缓存有什么相似点？

## 【衍生问题】
- **patchFlag 静态标记优化** —— 见 `Vue_patchFlag.md`（其中位运算与枚举取值仍待补充）
- **Block Tree**（`openBlock` / `createBlock` / `dynamicChildren` 收集过程）—— 待补充
- **Vue 编译器源码**（`@vue/compiler-core`）阅读路径 —— 待补充
- **React Compiler / 自动 memo 化**思想与 Vue 编译优化的对比 —— 待补充

---
category: Vue
topic: patchFlag
type: bagu
tags: [Vue, Vue3, 编译优化, patchFlag, 靶向更新, 面试]
difficulty: medium
created: 2026-09-11
---

# patchFlag

## 【问题】
什么是 patchFlag？它解决了什么问题？

## 【回答】
**patchFlag 是 Vue3 编译器给「动态节点」打上的静态标记**，用来记录**这个节点身上到底哪一部分会变化**（文本、class、style、props 等）。

它解决的是**运行时比较范围过大**的问题：

- 没有 patchFlag：更新时只能**逐个比较 VNode 的全部属性**；
- 有 patchFlag：Vue **已经知道变化类型**，patch 阶段只检查对应字段，做**靶向更新**。

所以 patchFlag 的定位是**「少比较」**——节点仍然会被创建，但不需要全量比对。

## 【问题】
patchFlag 的编译产物长什么样？

## 【回答】
模板：

```html
<div>
  {{ name }}
</div>
```

编译阶段 Vue 就知道**只有文本会变**，于是生成：

```js
createVNode(
  "div",
  null,
  name,
  PatchFlags.TEXT   // 1
)
```

第四个参数就是 patchFlag。运行时 patch **只检查 TEXT**，不再遍历整个 props，从而把「全量递归 diff」变成**精准更新**。

## 【问题】
patchFlag 和静态提升、事件缓存、Block Tree 分别解决什么？为什么要组合使用？

## 【回答】
四者都是**编译期优化**，但各管一环：

| 优化 | 解决的问题 | 一句话 |
| --- | --- | --- |
| patchFlag | 少比较 | 动态节点只比较发生变化的字段 |
| 静态提升 | 少创建 | 静态节点不再重复创建 VNode |
| 事件缓存 | 少创建函数 | 内联 handler 引用保持稳定 |
| Block Tree | 少遍历 | 只遍历收集到的动态子节点 |

**结论：** 「**创建 → 比较 → 遍历**」三个环节各有对应优化，必须**组合使用**才构成 Vue3 完整的编译优化闭环；单靠 patchFlag 并不足以解释 Vue3 的性能提升。

## 【考察点】
- **费曼解释题**：不用术语解释，为什么 Vue 要在编译阶段提前「记下」节点哪部分会变，而不是运行时自己比较？
- **反例题**：如果编译器判断错了 patchFlag，把一个动态文本节点标成静态，运行时会出什么后果？
- **迁移题**：React 运行时靠哪些手段缩小比较范围（memo / useMemo / React Compiler），为什么它没有 Vue 这样的编译期标记？

## 【衍生问题】
- **Block Tree** 的具体实现（`openBlock` / `createBlock` / `dynamicChildren` 的收集过程）—— 待补充
- **patchFlag 的位运算与枚举取值**（TEXT / CLASS / STYLE / PROPS / NEED_PATCH 等具体数字）—— 待补充
- **ShapeFlag** 的作用（与 patchFlag 的区分）—— 待补充
- **`@vue/compiler-core` 源码**中 `transformElement` → `patchFlag` 的写入路径 —— 待补充

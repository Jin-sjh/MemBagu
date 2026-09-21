---
category: 工程化
topic: ESM与CommonJS
type: bagu
tags: [ESM, CommonJS, 模块化, 静态结构, Live Binding, 循环依赖]
difficulty: medium
created: 2026-09-21
---
# ESM与CommonJS

## 【问题】
ESM 与 CommonJS 的核心差异是什么？

## 【回答】
两者核心差异如下：

| 维度 | CommonJS | ESM |
|---|---|---|
| 加载 | 运行时、可条件 require | 静态结构、链接后执行 |
| 导出 | module.exports 对象 | export binding |
| 绑定 | 导出对象属性快照/引用语义 | Live Binding |
| 分析 | 动态 require 难分析 | 依赖结构明确 |
| 环境 | Node 历史主流 | 浏览器/Node/构建工具 |

**CommonJS 以运行时 require/module.exports 为核心**，**ESM 以静态 import/export 为核心**。ESM 更利于**静态分析、Tree Shaking 和浏览器原生加载**；两者在加载时机、绑定语义和循环依赖上有差异，但可互操作。

---

## 【问题】
什么是 ESM 的 Live Binding？

## 【回答】
ESM 的 **Live Binding 是对导出绑定的引用**：当导出模块更新了某个导出值，导入侧会**实时看到更新**，而不是拿到一份快照。
但注意：导入侧**不能直接重新赋值导入绑定**（例如 `import { a } from './m'` 后不能写 `a = 1`）。这与 CommonJS 常见围绕 `module.exports` 对象、导出属性快照/引用语义的写法不同，也是 ESM 能被静态分析和 Tree Shaking 的基础之一。

---

## 【问题】
ESM 与 CommonJS 在循环依赖上表现如何？

## 【回答】
在循环依赖中，两者**都可能得到部分初始化结果**，因此都必须避免在初始化完成前读取尚未准备好的导出。
ESM 借助 **Live Binding**，导入侧在模块最终初始化后能拿到更新后的值，相对更容易在运行时“补齐”；CommonJS 在循环加载时拿到的是**当时已执行到的 exports 对象快照**，若依赖尚未执行到对应赋值，就会得到 `undefined`。无论如何，**应避免在初始化前读取未准备好的导出**是共同原则。

---

## 【问题】
ESM 与 CommonJS 的选型与互操作要注意什么？

## 【回答】
新项目**优先按运行环境和生态选择 ESM**；Node 老包互操作需明确 **default/named export、package.json 的 type 字段和条件导出**。
互操作关键点：① 明确包的默认导出与命名导出，避免 `require` 与 `import` 混用带来的 `{ default: ... }` 包裹问题；② 注意 `package.json` 的 `type: module` 与 `.cjs/.mjs` 扩展名；③ 用最小循环依赖、动态加载和导出变更实验，结合 Node/浏览器实际版本验证，**不凭语法表面推断**。

---

## 【问题】
面试时怎么答 ESM 与 CommonJS 的区别？

## 【回答】
**ESM 依赖静态 import/export，便于链接、静态分析和 Tree Shaking**；**CommonJS 运行时 require 更灵活但动态依赖难分析**。ESM 使用 **Live Binding**，导入侧实时看到导出更新，但不能直接重新赋值导入绑定；CommonJS 常围绕导出对象工作，拿到的是属性快照/引用语义。
两者都可互操作，但**加载时机、绑定语义、循环依赖处理需要按运行环境验证**：ESM 是 ECMAScript 官方模块标准，CommonJS 是 Node.js 生态形成的规范，选型和边界判断要结合 Node 版本与包配置。

---
category: TypeScript
topic: interface与type
type: bagu
tags: [TypeScript, interface, type, 声明合并, 类型建模]
difficulty: medium
created: 2026-09-21
---
# interface与type

## 【问题】
`interface` 和 `type` 有什么区别？

## 【回答】
`interface` 和 `type` 都能描述对象形状，但 `interface` 更偏向**可扩展的对象契约**，`type` 是可以指向任意类型表达式的**别名**。主要区别：

- interface 可 `extends` 接口和类，天然表达对象契约；
- type 可表示**联合、交叉、元组、条件类型、字面量**等任意类型组合；
- 同名 interface 可以**声明合并**，同名 type alias 不可重复定义；
- 交叉类型遇到冲突成员可能产生 `never`，interface extends 通常在声明阶段报更直接的错误。

---

## 【问题】
什么是 Declaration Merging（声明合并）？

## 【回答】
同名 `interface` 可以声明合并：

```ts
interface Window { appVersion: string; }
interface Window { featureFlag: boolean; }
// 合并为同时拥有两个属性的 Window
```

它适合为第三方库补充类型、进行模块 augmentation，但也可能让类型来源分散、难以追踪。接口成员冲突必须兼容；同名方法可能形成重载。`type` 没有这种合并能力。

---

## 【问题】
什么时候该用 `interface`，什么时候该用 `type`？

## 【回答】
- 公共对象 API、可被实现/扩展的契约：优先 `interface`。
- 联合、交叉、工具类型、条件类型或函数组合：优先 `type`。
- 团队已有统一规范时保持一致比争论绝对标准更重要。

“interface 一定比 type 性能好/更现代”都不是普遍结论；**类型复杂度和具体写法才是需要测量的因素**。

---

## 【问题】
关于 `interface` 和 `type` 有哪些常见误区？

## 【回答】
- 误区：interface 只能描述对象。——也可描述函数、索引和调用签名。
- 误区：type 不能扩展。——可以通过交叉类型组合，但机制不是 extends。
- 误区：声明合并总是好事。——公共库可用，业务代码中滥用会降低可追踪性。

验证可用 TypeScript Playground 或 `tsc` 编译实验：同名接口合并、同名 type 报错、extends 冲突、交叉冲突，并观察诊断位置。

---

## 【问题】
面试时怎么答 `interface` 与 `type` 的区别？

## 【回答】
两者都能描述结构，主要区别是 interface 支持**声明合并和 `extends`**，更适合对象契约；type 可以表达联合、元组、条件类型等更广泛的类型组合。interface extends 与交叉类型都能组合结构，但冲突处理和错误提示不同。工程上根据是否需要开放扩展、是否需要类型运算来选，不把它们当成完全互斥方案。

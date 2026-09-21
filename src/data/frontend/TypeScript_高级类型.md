---
category: TypeScript
topic: 高级类型
type: bagu
tags: [TypeScript, 高级类型, 映射类型, 条件类型, keyof, infer]
difficulty: hard
created: 2026-09-21
---
# 高级类型

## 【问题】
什么是高级类型？常用的类型运算符有哪些？

## 【回答】
高级类型是利用类型运算符在编译期变换已有类型：`keyof` 取键、类型级 `typeof` 取值的类型、索引访问取成员、映射类型遍历键、条件类型做分支，`infer` 在匹配中提取类型。

```ts
type User = { id: string; name: string };
type Keys = keyof User;          // 'id' | 'name'
const user = { id: '1', name: 'A' };
type UserValue = typeof user;    // 取值的静态类型
type Id = User['id'];            // string
```

类型中的 `typeof` 与运行时代码中的 `typeof` 不同：前者取得变量的静态类型，后者产生运行时字符串。

---

## 【问题】
映射类型是什么？`Partial`/`Required`/`Pick`/`Record`/`Omit` 如何理解？

## 【回答】
映射类型遍历 `keyof` 得到的键并生成新属性：

```ts
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};
```

`Partial`、`Required`、`Pick`、`Record` 都可用类似机制理解；`Omit` 通常通过排除键后再 Pick 实现。映射类型还可通过 `readonly`、`?` 修饰符改变属性修饰状态。

---

## 【问题】
条件类型与 `infer` 是什么？什么是联合分发？

## 【回答】
条件类型类似类型层面的 if：

```ts
type ElementOf<T> = T extends (infer U)[] ? U : T;
type A = ElementOf<string[]>; // string
```

`infer U` 允许在匹配某种结构时声明一个待推断类型变量，只能出现在条件类型的模式位置。对裸类型参数使用条件类型时，联合类型可能发生分发：`type ToArray<T> = T extends unknown ? T[] : never;` 得到 `string[] | number[]`。若不希望分发，可把参数包在元组中：`[T] extends [unknown]`。

---

## 【问题】
高级类型的价值与成本是什么？如何选型？

## 【回答】
- 价值：减少重复类型声明，保持类型与源结构同步，构造精确公共 API。
- 成本：错误信息复杂、编译成本上升、可读性下降，类型计算不能替代运行时逻辑。
- 选型：简单对象优先显式类型；重复模式稳定后抽象为工具类型；只为炫技而使用多层条件类型通常得不偿失。

---

## 【问题】
关于高级类型有哪些常见误区？

## 【回答】
- 把类型 `typeof` 与运行时 `typeof` 混淆。
- 认为 `Omit` 会运行时删除字段（它只改变类型，不删运行时字段）。
- 认为类型计算能改变 JavaScript 行为（类型计算只发生在编译期）。

---

## 【问题】
面试时怎么答高级类型？

## 【回答】
`keyof` 把对象类型转换成键的联合，索引访问类型按键取成员，映射类型遍历键并生成新类型，条件类型根据可赋值关系选择分支，`infer` 用于在条件匹配中提取类型。`Partial` 等工具类型就是这些机制的组合。高级类型只发生在编译期，输入数据仍需运行时校验；工程上要关注可读性、诊断质量和编译时间。

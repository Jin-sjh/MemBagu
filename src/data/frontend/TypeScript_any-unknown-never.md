---
category: TypeScript
topic: any-unknown-never
type: bagu
tags: [TypeScript, any, unknown, never, void, 类型安全]
difficulty: medium
created: 2026-09-21
---
# any-unknown-never

## 【问题】
`any` 和 `unknown` 有什么区别？

## 【回答】
`any` 表示**放弃静态检查**，`unknown` 表示“值存在但使用前必须证明类型”。`any` 会关闭大量检查并污染上下游推断；`unknown` 可以接收任意值，但不能直接读取属性、调用或赋给更具体类型，必须通过 `typeof`、`in`、`instanceof` 或自定义类型守卫收窄。

```ts
let a: any = getExternalValue();
a.notExist(); // 编译器放行，可能运行时报错
let u: unknown = getExternalValue();
if (typeof u === 'string') { u.toUpperCase(); } // 收窄后安全
```

---

## 【问题】
`never` 类型表示什么？有什么实际用途？

## 【回答】
`never` 表示**不存在正常返回值**的状态：永不结束的函数、总是抛错的函数、已经被穷尽的联合分支。常用于联合类型的穷尽检查：

```ts
function assertNever(x: never): never { throw new Error(`Unhandled: ${x}`); }
type Shape = { kind: 'circle' } | { kind: 'square' };
function area(s: Shape) {
  switch (s.kind) {
    case 'circle': return 1;
    case 'square': return 1;
    default: return assertNever(s);
  }
}
```

新增联合成员时，编译器会暴露遗漏分支。

---

## 【问题】
`void`、`null`、`undefined` 怎么理解？`strictNullChecks` 有什么用？

## 【回答】
`void` 通常表示调用者**不依赖返回值**，不等于“函数绝不返回任何值”。`strictNullChecks` 开启时，`null` 和 `undefined` 是**独立类型**，使用前需要处理可能为空的分支；关闭后会把空值更宽松地混入其他类型，降低安全性。

---

## 【问题】
处理边界数据、临时迁移、不可能分支时分别该用哪种类型？

## 【回答】
- 边界数据：优先 `unknown` + 运行时校验。
- 临时迁移：可局部使用 `any`，但应记录原因并限制扩散。
- 不可能分支：用 `never` 做穷尽检查。
- 无返回关注：用 `void`，但不要将其当作运行时禁止返回值。

---

## 【问题】
常见误区：`unknown` 会自动验证外部数据吗？

## 【回答】
误区：`unknown` 自动验证外部数据。——它只要求你验证，不能替代运行时校验。验证时应打开 `strictNullChecks`，分别测试属性访问、赋值、类型守卫和新增联合分支。

---

## 【问题】
面试时怎么答 `any`/`unknown`/`never`/`void` 的区别？

## 【回答】
`unknown` 比 `any` 安全，因为它允许接收任意值但要求使用前先收窄；`any` 会跳过检查。`never` 表示不可能产生的值，常用于抛错函数和联合类型穷尽检查；`void` 主要描述调用结果不被使用。处理边界数据用 `unknown` + 运行时校验，临时迁移可局部 `any`，不可能分支用 `never` 穷尽检查，无返回关注用 `void`。

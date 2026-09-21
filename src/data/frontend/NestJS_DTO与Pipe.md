---
category: NestJS
topic: DTO与Pipe
type: bagu
tags: [NestJS, DTO, Pipe, ValidationPipe, class-validator, 输入校验]
difficulty: medium
created: 2026-09-21
---
# DTO与Pipe

## 【问题】
为什么 TypeScript 类型不能替代 ValidationPipe？

## 【回答】
**TypeScript 类型只在编译阶段检查代码，HTTP 请求在程序运行后才进入服务器**，客户端可以发送任意 JSON。因此即使 Controller 写成 `create(@Body() dto: CreateUserDto)`，客户端发送 `{ "age": "abc" }` 时也不会因为 `age: number` 标注被拦截——请求体进入服务器时只是运行时的 JavaScript 值，编译器无法提前检查它。**Pipe 在 Controller 执行前对真实输入做运行时校验和转换**：`ValidationPipe` 根据 DTO 的验证元数据拒绝非法 Body，`ParseIntPipe` 把 URL 字符串转为整数。一句话：**TypeScript 类型保护你写的代码，Pipe 保护运行时进入服务器的外部输入**。

## 【问题】
DTO 为什么常用 class 而不是 interface？

## 【回答】
**interface 只存在于编译期，生成 JavaScript 后会被擦除**，运行时没有可供 Reflection、ValidationPipe 和 class-validator 读取的构造函数；而 **class 编译后仍然存在，可以作为运行时 metatype，并结合装饰器验证元数据参与转换和校验**。这正是 DI 中 interface 不能直接作为 Token 的同一底层原因：interface 只有静态类型能力，class 能在运行时携带元数据和行为。所以 class-based ValidationPipe 依赖运行时存在的 DTO 类型；但这不代表 schema-first 方案必须用 class，Zod 等 Standard Schema 也可走 schema-first。

## 【问题】
`ValidationPipe` 的 `whitelist` / `forbidNonWhitelisted` / `transform` 分别做什么？

## 【回答】
- **`whitelist: true`：没有验证装饰器声明的额外属性会被静默剔除**，业务层收不到未声明字段（如 `isAdmin`）。
- **`forbidNonWhitelisted: true`：不再静默删除，而是直接拒绝带未允许字段的请求，返回 400**，对创建用户、改角色、支付等敏感接口更严格。
- **`transform: true`：校验同时根据元数据和配置做类型转换，并把转换后的值交给 Controller**；但对关键参数，显式 `ParseIntPipe` 往往更清晰地表达“这里必须是整数”。

## 【问题】
Pipe 的核心职责是什么？它只做校验吗？

## 【回答】
**Pipe 是在 Controller Handler 执行前，对方法参数进行校验或转换的处理器**。它有两个核心作用：**Validation 检查输入是否符合约束**，**Transformation 把输入转换成 Controller 需要的类型或结构**。例如 URL/Query 参数以字符串进入，`ParseIntPipe` 可把 `"123"` 转成 `123`，无法转换时抛出 `BadRequestException` 阻止 Handler 执行；其他内置 Pipe 还有 `ParseBoolPipe`、`ParseUUIDPipe`、`DefaultValuePipe`。Pipe 不应承担主要业务逻辑，它负责的是输入边界。

## 【问题】
DTO 与 Entity 有什么区别？结构校验和业务校验如何分工？

## 【回答】
**DTO 是外部接口的数据契约，Entity / Model 是内部数据模型**，不能直接把数据库 Entity 当创建 DTO，否则客户端可能直接控制 `id`、`role`、`balance` 等敏感字段（Mass Assignment 风险）。校验职责上：**DTO / Pipe 做结构校验**——是否为 string/integer、email 格式、长度、UUID、是否必填，只看数据本身即可判断；**Service / Domain 做业务校验**——邮箱是否注册、库存是否足够、用户能否退款，依赖查询系统状态。可记成：**Pipe 保证“数据长得对”，Service 保证“事情做得对”**。

## 【问题】
面试时怎么答 DTO 与 Pipe？

## 【回答】
DTO 是外部输入契约，Pipe 是 Controller 前的边界处理器。**TypeScript 只能保护开发者写的代码，不能验证运行中的网络输入**，所以需要 `ValidationPipe` 做结构校验、`ParseIntPipe` 等做参数转换。**class-based DTO 依赖运行时存在的 class、decorator 元数据与 class-transformer**；但若项目采用 Zod 等 Standard Schema，也可走 schema-first 方案。DTO/Pipe 负责数据结构，Service 负责需要业务状态才能判断的规则；且 **DTO 不应直接等同于数据库 Entity**，以避免暴露内部字段和 Mass Assignment 风险。真正不变的结论是：外部输入必须经过运行时验证，不能只依赖 TypeScript 静态类型。

## 【问题】
关于 DTO 与 Pipe 有哪些常见误区？

## 【回答】
- **误区：`age: number` 会拦截客户端字符串**——这是编译期类型，不验证运行时 JSON。
- **误区：DTO 只是一组 TypeScript 字段**——class-based 工作流中 DTO 还承担运行时身份与验证元数据载体。
- **误区：Pipe 只负责 Validation**——Pipe 同时负责 Transformation，如 `'123'` 转 `123`。
- **误区：所有校验都写进 ValidationPipe**——库存、余额、重复注册等依赖业务状态的判断应放 Service / Domain。
- **误区：DTO 可直接复用数据库 Entity**——输入边界与内部数据模型不同，直接复用会暴露或允许修改敏感字段。

## 【衍生问题】
- `whitelist` 与 `forbidNonWhitelisted` 如何选择？（敏感接口偏严格 forbid，兼容演进可先 whitelist）
- 嵌套 DTO 为什么常需要 `@ValidateNested()` 和 `@Type()`？
- DTO 如何安全映射成 Entity，避免 Mass Assignment？

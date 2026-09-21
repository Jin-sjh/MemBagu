---
category: NestJS
topic: 高频面试题15题
type: bagu
tags: [NestJS, 依赖注入, Module, Provider, 生命周期, 面试复盘]
difficulty: medium
created: 2026-09-21
---
# 高频面试题15题

## 【问题】
NestJS 是什么，和 Express 什么关系？

## 【回答】
**来源题号：Q1**

**NestJS 是应用框架，Express / Fastify 是底层 HTTP 适配器**。NestJS 在它们之上提供 Module、IoC/DI、Provider、Guard、Pipe、Interceptor 和 Exception Filter 等结构化能力。

30 秒基础回答：NestJS 是基于 Node.js、通常使用 TypeScript 的服务端应用框架，它在 Express 或 Fastify 之上提供结构化能力；Module 划分功能和依赖边界，Provider 由容器按 Token 管理，请求沿 Middleware、Guard、Interceptor、Pipe、Controller、Service 链路执行。因此它比 Express 约束更多，但更适合中大型项目。

---

## 【问题】
Module 是什么？

## 【回答】
**来源题号：Q2**

**Module 是功能边界，也是 DI 封装边界**。它组织相关的 Controller、Provider、Service，并决定哪些依赖可以被外部消费。Provider 默认封装在 Module 内，消费方必须导入暴露它的 Module，这正是「Service export 后还要 import Module」的原因。

---

## 【问题】
Provider 是什么？

## 【回答】
**来源题号：Q3**

**Provider 是由 IoC Container 管理的可注入依赖，Service 只是其中一种**。Factory、Repository、配置对象等也都可以是 Provider。常见误区是「Provider 就等于 Service」——实际上 Service 只是 Provider 的一种典型形态。

---

## 【问题】
IoC 和 DI 是什么？

## 【回答】
**来源题号：Q4**

**IoC（控制反转）是原则，DI（依赖注入）是一种实现方式**。IoC 解决「依赖由谁创建」的问题，把创建权交给容器；DI 则是把依赖注入到需要它的对象中。两者不是同一概念：IoC 是更上层的设计原则，DI 是具体的技术手段。

---

## 【问题】
NestJS 如何知道要注入 UserService？

## 【回答】
**来源题号：Q5**

**Metadata 提供依赖信息，Container 按 Token 解析**。装饰器（如 `@Injectable()`）把构造函数参数的类型信息写入元数据，框架启动时扫描 Module、建立依赖图，运行时根据 Provider Token 查找并注入对应实例。

---

## 【问题】
Provider Token 是什么？

## 【回答】
**来源题号：Q6**

**Provider Token 是 Container 查找 Provider Definition 的运行时 key**。默认情况下 class 本身即作为 Token；自定义 Provider 也可以显式指定字符串或 Symbol 作为 Token，从而在注入时精准定位到对应的 Provider 定义。

---

## 【问题】
四种 custom provider 有什么区别？

## 【回答】
**来源题号：Q7**

- **`useClass`**：通过新的 Provider Definition 创建/替换类的实例。
- **`useValue`**：直接提供一个已存在的现值（如配置对象、常量）。
- **`useFactory`**：通过工厂函数动态创建（可依赖其他 Provider）。
- **`useExisting`**：别名复用，指向已有 Token 并复用其同一实例。

注意 `useExisting` 与 `useClass` 的差异：前者是别名并复用已有实例，后者按新的 Provider Definition 解析。

---

## 【问题】
Provider Scope 有哪些？

## 【回答】
**来源题号：Q8**

- **DEFAULT**：默认共享单例，跨请求复用同一实例。
- **REQUEST**：每个请求创建一个实例，适合需要请求级状态的场景。
- **TRANSIENT**：按 Consumer 隔离，每个依赖它的 Consumer 各持一份实例。

默认 Singleton 的无状态 Service 共享实例可降低创建与 GC 成本，但不能保存请求可变状态（跨请求会互相覆盖）。

---

## 【问题】
Controller 和 Service 如何分工？

## 【回答】
**来源题号：Q9**

**Controller 处理协议边界（HTTP 入口），Service 承担业务规则**。Controller 负责路由、请求/响应格式与状态码；Service 负责业务逻辑、事务编排，不应直接依赖 Request 对象。把 `userId`/`tenantId` 提取后显式传参，更易测试与复用。

---

## 【问题】
DTO 为什么常用 class 而不是 interface？

## 【回答】
**来源题号：Q10**

**class 有运行时身份，可配合 Metadata、Pipe 进行校验与转换**。TypeScript 的 interface 在编译后被擦除，没有运行时表示，无法被 `class-validator` / `ValidationPipe` 利用；而 class 实例在运行时可被反射和校验。因此 DTO 常用 class 而非 interface。

---

## 【问题】
Pipe 做什么？

## 【回答】
**来源题号：Q11**

**Pipe 在 Handler 前进行输入的 Validation 与 Transformation**。它负责把原始请求数据校验为合法结构，并把字符串等原始输入转换为目标类型（如 `ParseIntPipe`）。注意：TypeScript 类型主要约束编译期，而网络输入发生在运行时，因此类型不能替代 `ValidationPipe`。

---

## 【问题】
Guard 和 Middleware 的区别是什么？

## 【回答】
**来源题号：Q12**

**Guard 决定能否进入 Handler，并能感知 Controller/Handler 上下文**；Middleware 只做通用 HTTP 预处理，缺少 Controller/Handler 上下文。

关键差异不只是执行顺序，而是上下文与访问决策能力——Guard 能读取路由 Metadata 并基于 `request.user` 做放行决策，因此 **RBAC 不适合放在 Middleware，而更适合放在 Guard**。

---

## 【问题】
Interceptor 是什么？

## 【回答】
**来源题号：Q13**

**Interceptor 包裹 Handler，处理前置逻辑、返回值和横切能力**。它不仅能做日志，还可以处理返回值、缓存、Tracing 等横切逻辑。Interceptor 可以观察异常，但最终错误响应通常由 Exception Filter 负责。

---

## 【问题】
Middleware / Guard / Pipe / Interceptor / Filter 五类组件如何区分？

## 【回答】
**来源题号：Q14**

- **Middleware**：通用 HTTP 预处理。
- **Guard**：决定放行，做认证/授权。
- **Pipe**：输入校验与转换。
- **Interceptor**：包裹 Handler，做前后增强。
- **Filter**：处理异常响应。

一句话记忆：Interceptor 管正常执行流的增强，Exception Filter 管异常最终怎么返回。

---

## 【问题】
为什么 NestJS 适合中大型项目？

## 【回答】
**来源题号：Q15**

**模块边界、DI 和生命周期切点提供了架构约束与复用能力**。Module 划分功能与依赖边界，DI 把依赖创建从业务代码分离，Middleware/Guard/Pipe/Interceptor/Filter 把不同横切问题落到明确切点，使复杂应用可持续组织与维护。

但这并非绝对结论——若项目很小或需要极高自由度，Express 等轻量方案可能更合适；NestJS 提供机制和边界，不会自动替你设计好模块、事务和权限模型。

---
category: NestJS
topic: Provider-Scope
type: bagu
tags: [NestJS, Provider, Scope, Singleton, RequestScope, 依赖注入]
difficulty: medium
created: 2026-09-21
---
# Provider-Scope

## 【问题】
NestJS 有哪三种 Provider Scope？各自的语义是什么？

## 【回答】
NestJS 支持三种常见 Scope：**DEFAULT（Singleton）按整个应用 / 容器上下文共享一个实例**；**REQUEST 按单个 HTTP 请求创建一个实例**；**TRANSIENT 按每个注入它的 Consumer 创建一个独立实例**。默认是 Singleton，适合大多数无状态 Service、Repository 和数据库 Client。REQUEST 适合保存当前请求独有的 `requestId`、`tenantId`、用户与权限上下文等请求绑定状态。TRANSIENT 适合需要独立配置或独立内部状态的轻量 Helper、Logger、Strategy 对象，但会增加实例数量。

## 【问题】
Request Scope 的代价是什么？为什么它有传染性（冒泡）？

## 【回答】
**Request Scope 每收到一次请求至少创建一个实例**，而 Singleton 在 10000 次请求中可能只创建 1 次。因此它显著增加 **CPU 与实例构造、内存分配、GC 压力、依赖解析和请求延迟**。更关键的是存在**依赖链向上传播（冒泡）**：若 `UserService` 依赖了 REQUEST 的 `RequestContext`，为保证每个请求拿到正确的请求级实例，`UserService` 自身必须变成 REQUEST，进而 `UserController` 也必须变成 REQUEST。NestJS 文档将这种现象称为 request scope 的冒泡，其原因是依赖生命周期必须满足被注入对象的隔离要求。

## 【问题】
Singleton 有哪些陷阱？为什么 Node.js 单线程仍然不安全？

## 【回答】
**Singleton 的危险不在于共享本身，而在于实例字段保存跨请求可变状态**。例如 `UserService` 有 `currentUserId` 字段，请求 A 写入 1 后 `await` 让出事件循环，请求 B 写入 2，A 恢复时可能读到 2，造成跨请求污染。**单线程事件循环不等于共享可变状态安全**：`await` 期间其他请求可运行并修改同一对象。安全写法是把请求独有数据通过方法参数传入，实例可共享但每次调用的局部参数和局部变量仍然独立。

## 【问题】
TRANSIENT 和 REQUEST 有什么区别？

## 【回答】
**TRANSIENT 的边界是 Consumer，不是 HTTP Request**。同一个 Provider 注入到 `AService` 和 `BService`，会得到 `Logger #1`、`Logger #2` 两个实例；而 Singleton 下两者共享同一个。REQUEST 则是按请求划分，同一请求内共享、不同请求实例不同。两者解决不同维度：**REQUEST 解决请求上下文隔离，TRANSIENT 解决 Consumer 之间的实例隔离**，不能把 Transient 理解为“每个请求一个”。

## 【问题】
数据库 Client 为什么通常用 Singleton？Singleton 只有一条连接吗？

## 【回答】
**Provider 实例的 Scope 与底层连接池的连接数量是两个不同层次**。Singleton 的 `DatabaseService` 通常持有 Client 或连接池，连接池内部可管理多条连接，多个请求复用连接。若每个请求都新建数据库连接，1000 请求/秒会产生大量连接建立与销毁，推高连接数、延迟和资源压力。因此应区分“Provider 实例 Scope”和“底层资源池连接数量”，无状态 DB Client 优先 Singleton。

## 【问题】
面试时怎么答 Provider Scope？

## 【回答】
Scope 决定 Provider 实例的共享边界。默认 **Singleton 按应用复用，初始化成本最低**，但不能在实例字段保存请求独有可变状态，否则并发请求可能互相污染。**Request Scope 为每个请求建立实例**，适合 `requestId`、`tenantId`、用户上下文等，但会增加实例创建、GC 和依赖解析成本，而且会沿依赖链向上传播（冒泡）。**Transient 按 Consumer 创建独立实例**，适合独立 Logger 或 Helper。实际选型应先判断状态能否通过参数传递；能则优先 Singleton，只有确实需要请求绑定或 Consumer 独立实例时才使用其他 Scope。工程原则：无状态 Service 默认 Singleton，不要因为“更隔离”就全用 Request Scope。

## 【问题】
关于 Provider Scope 有哪些常见误区？

## 【回答】
- **误区：Singleton 一定不安全**——无状态 Singleton 通常是最佳默认方案，危险的是在其中保存跨请求可变状态。
- **误区：Request 一定更安全，所以全部用 Request**——Request 只解决实例隔离，同时增加创建、内存、GC 和依赖链传播成本。
- **误区：Node.js 单线程所以不会有状态竞争**——异步 `await` 期间其他请求仍可运行并修改共享对象。
- **误区：Transient 就是每个请求一个**——其边界是 Consumer 而非 HTTP Request。
- **误区：Singleton DatabaseService 只有一条连接**——Provider 实例与底层连接池是不同层次，Singleton Client 可管理多条连接。

## 【衍生问题】
- 如何用实验验证一个 Provider 是否真的只创建一次？（在 constructor 打印调用次数，发多次请求对比 Singleton 与 Request Scope）
- 请求级状态除了 Request Scope 还有哪些实现方式？（如 AsyncLocalStorage、请求级 Context 对象）
- Scope 与异步 Factory、动态模块的关系是什么？

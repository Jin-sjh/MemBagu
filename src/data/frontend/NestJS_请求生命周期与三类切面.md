---
category: NestJS
topic: 请求生命周期与三类切面
type: bagu
tags: [NestJS, Middleware, Guard, Interceptor, 请求生命周期, AOP]
difficulty: medium
created: 2026-09-21
---
# 请求生命周期与三类切面

## 【问题】
Middleware 是什么？`next()` 的语义是什么？

## 【回答】
**Middleware 更接近底层 HTTP**，直接面对 `req` / `res` / `next`，典型任务有请求日志、生成 `requestId` / `traceId`、读取 Cookie、设置通用 Header、处理 IP/User-Agent、接入底层 Express/Fastify Middleware。它通常不关心最终进入哪个 Controller。**`next()` 表示当前 Middleware 处理完，把请求交给后续链路**；若既没结束响应也没调用 `next()`，请求会停在这里。Middleware 也可直接结束请求（如 `res.status(403).send('blocked')`），此时后续 Guard 和 Controller 都不执行。

## 【问题】
Middleware 与 Guard 有什么区别？

## 【回答】
**Middleware 偏底层 HTTP Request，Guard 偏 Nest Handler ExecutionContext**。Middleware 能看到 URL、Method、Header、Cookie、IP 等，但通常不知道最终执行哪个 Handler，也不天然围绕 Handler Metadata 工作；Guard 通过 `ExecutionContext` 知道当前 Controller、Handler、Request 以及 Handler/Controller 上的 Metadata。选择规则：**这个逻辑需要知道最终执行哪个 Handler 吗？** 不需要（requestId、HTTP 日志、Cookie）→ Middleware；需要（是否 `@Public`、要求 ADMIN、有什么权限 Metadata）→ Guard。

## 【问题】
Middleware 与 Interceptor 有什么区别？统一返回值为什么适合 Interceptor？

## 【回答】
**Middleware 更偏请求进入 Nest 路由前的通用处理；Interceptor 能包住具体 Handler 的执行前后，可获取返回结果**。统一把 `return { id: 1 }` 包装成 `{ code: 0, data: {...} }`，Middleware 位于 Handler 之前，不是 Nest Handler 返回值模型的最佳切点；**Interceptor 能在 Handler 返回后取得结果并转换它**。耗时统计同理：Middleware 能记录进入时间，但 `next()` 不等价于等待 Nest Controller 完整执行返回，而 Interceptor 能表达“记录开始 → 执行 Handler → 拿结果/异常 → 记耗时/转换”。

## 【问题】
Middleware、Guard、Interceptor、Pipe、Filter 五类切面的职责与完整请求生命周期顺序是怎样的？

## 【回答】
完整生命周期顺序：**Middleware（通用 HTTP 预处理）→ Guard（访问资格判断）→ Interceptor（前置）→ Pipe（参数校验/转换）→ Controller / Service → Interceptor（后置）→ Response**，异常由 Exception Filter 统一转成错误响应。职责边界如下：

```text
通用 HTTP 前置   → Middleware
访问控制         → Guard
输入边界         → Pipe
业务入口         → Controller
业务执行         → Service
执行前后增强     → Interceptor
异常处理         → Filter
```

**Pipe 放在 Controller 前，让 Controller 收到已完成边界处理的参数，避免在每个 Handler 内重复写 `if` 校验。**

## 【问题】
同类多实例的执行顺序是怎样的？（Middleware 与 Guard）

## 【回答】
**多个 Middleware 顺序**：Global Middleware 先于 Module-bound Middleware，Middleware 按绑定顺序执行，之后进入 Guard 阶段。多个 Middleware 通过 `next()` 串联：A `next()` → B `next()` → Guard。

**Guard 执行范围顺序**：Global Guard → Controller Guard → Route Guard，同一范围内通常按绑定顺序执行。例如全局 `AuthGuard` 先验证 JWT 写入 `request.user`，Controller 级 / Route 级 `RolesGuard` 才能读到身份做角色判断——顺序错会导致 `request.user` 不存在。Class Middleware 在 Module `configure()` 中用 `MiddlewareConsumer` 的 `apply().forRoutes()` / `.exclude()` 注册。

## 【问题】
面试时怎么答三类切面（Middleware / Guard / Interceptor）的分工？

## 【回答】
NestJS 把请求处理拆成多个生命周期切点。**Middleware 处理与具体 Handler 无关的底层 HTTP 预处理**，通过 `next()` 继续链路；**Guard 通过 ExecutionContext 感知目标 Handler 和 Metadata，负责认证和粗粒度授权**；**Pipe 处理输入校验和转换**；**Interceptor 包裹 Handler 前后，负责耗时、响应转换和缓存**。选择组件时不能只看“都能拦请求”，而要看逻辑需要哪种上下文、是否需要 Handler 结果，以及它属于通用请求、访问控制还是执行增强。经验法则：“所有请求统一……”优先 Middleware；“某接口需要权限……”优先 Guard；“Controller 前后……”优先 Interceptor。

## 【问题】
关于三类切面有哪些常见误区？

## 【回答】
- **误区：Guard 比 Middleware 更高级**——两者服务不同层次，通用 HTTP 预处理不需要 Guard 的 Handler 上下文。
- **误区：JWT 只能写 Guard**——Middleware 也能验证 JWT，只是与路由 Metadata、`@Public()`、RBAC 结合时 Guard 更自然。
- **误区：Middleware 可方便统一包装 Controller 返回值**——Middleware 位于 Handler 前，Interceptor 才是处理 Nest Handler 返回值的更合适切点。
- **误区：所有拦截逻辑都放一个组件**——日志、访问控制、输入校验、结果转换的上下文与时机不同，强行集中会产生高耦合。

## 【衍生问题】
- 全局 Middleware、Module Middleware、Global Guard 的执行顺序是什么？（Global Middleware → Module Middleware → Global Guard → Controller Guard → Route Guard）
- Middleware 和 Interceptor 的耗时统计差异？（Middleware 用 `next()` 不代表等 Controller 返回；Interceptor 围绕 Handler 记时更准）
- Express 与 Fastify 下 Middleware 行为是否一致？

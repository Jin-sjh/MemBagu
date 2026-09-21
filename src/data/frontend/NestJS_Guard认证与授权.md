---
category: NestJS
topic: Guard认证与授权
type: bagu
tags: [NestJS, Guard, 认证, 授权, RBAC, JWT]
difficulty: medium
created: 2026-09-21
---
# Guard认证与授权

## 【问题】
NestJS Guard 是什么？`CanActivate` 与 `ExecutionContext` 的作用是什么？

## 【回答】
**Guard 实现 `CanActivate`，在请求进入 Route Handler 前决定是否放行**。其 `canActivate(context: ExecutionContext)` 返回 `true` 放行、`false` 或抛异常则拒绝；真实 Guard 也可返回 `Promise` 或 `Observable`。`ExecutionContext` 描述“当前准备执行谁”，让 Guard 获取当前传输协议、Controller、Handler、Request 以及 Handler/Controller 上的 Metadata。**HTTP 场景下通过 `context.switchToHttp().getRequest()` 切换到 HTTP 视角并拿到 Request**。这使 Guard 比一般 Middleware 更容易实现“针对某个 Handler 的访问规则”。绑定方式有 `@UseGuards(AuthGuard)`（Route/Controller）和全局 `APP_GUARD`。

## 【问题】
为什么鉴权逻辑不该散落在每个 Controller 里？

## 【回答】
把 JWT 校验直接写进每个 Handler，接口增多时认证逻辑会复制到大量 Controller 中。**认证和粗粒度授权属于横切关注点，不是用户、订单或支付业务本身**。Guard 将它们从 Handler 中抽离、统一放在访问边界处理，收益包括：**减少认证代码复制、默认保护大量接口、根据 Route Metadata 实现声明式授权、让 Controller 保持业务入口职责**。这也体现了“什么时候执行、看到什么、负责什么”的清晰边界。

## 【问题】
JWT `AuthGuard` 如何建立身份？它和 `RolesGuard` 怎么配合？

## 【回答】
**`AuthGuard` 解决“你是谁”**：读取 `Authorization` 头、提取 Bearer Token、用 `jwtService.verifyAsync` 验证签名/过期/声明，得到 payload 后写入 `request.user` 并放行。**`RolesGuard` 解决“你能不能做”**：读取 `@Roles()` 声明的角色元数据，拿 `request.user.roles` 与接口要求比较。执行链是 AuthGuard 先验证 JWT 建立身份，RolesGuard 再检查角色。**顺序很重要**：若 RolesGuard 先执行，`request.user` 可能还不存在，无法判断当前用户是谁。这是 Authentication 先于依赖身份的 Authorization 的体现。

## 【问题】
如何用 `@SetMetadata` + `Reflector` 实现 RBAC？

## 【回答】
核心模式是 **Decorator 声明规则 → Metadata 保存规则 → Reflector 读取规则 → Guard 执行规则**。先定义 `@Roles(...roles)` 装饰器，内部调用 `SetMetadata(ROLES_KEY, roles)` 在 Handler 上记录角色；`RolesGuard` 通过 `this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()])` 读取目标 Handler 与 Controller 上的角色要求，若未声明则放行，否则用 `requiredRoles.some(role => user.roles?.includes(role))` 判断。这样权限规则声明在 Handler 上、判断集中在 Guard，不在 Handler 内写权限分支。

## 【问题】
Guard 与 Middleware 有什么区别？

## 【回答】
两者不是“谁更高级”，而是关注点不同：

| 维度 | Middleware | Guard |
|---|---|---|
| 位置 | 请求较早阶段 | Middleware 之后、Handler 之前 |
| 上下文 | Request / Response / next | ExecutionContext |
| 是否知道目标 Handler | 通常不知道 | 可以知道 |
| 典型用途 | 日志、Request ID、Cookie | 认证、RBAC、路由访问控制 |
| 依赖路由 Metadata | 通常不依赖 | 经常依赖 |

**判断标准：若逻辑依赖具体 Controller、Handler 或其 Metadata，Guard 更合适；只是通用请求预处理，Middleware 就足够**。

## 【问题】
401 和 403 分别是什么？认证和授权如何区分？

## 【回答】
**401 是身份认证失败**：没有 Token、Token 非法或过期；**403 是身份已确认但没有执行该操作的权限**（如 USER 访问要求 ADMIN 的接口）。权限层级可抽象为：**Authentication（你是谁）→ 粗粒度 Authorization（你是什么角色）→ 细粒度 Business Authorization（你能否操作这个具体资源）**。JWT 主要承载或证明身份，**不等于完整的权限控制**；资源级规则（如“只能删自己的文章”）往往需要业务层处理。

## 【问题】
面试时怎么答 Guard？

## 【回答】
Guard 位于 Middleware 之后、Interceptor 和 Pipe 之前，是请求进入 Controller 前的访问边界。它通过 **`ExecutionContext` 获取目标 Handler，并结合 `Reflector` 读取 `@Roles()` 或 `@Public()` 等 Metadata，实现声明式认证和授权**。**JWT AuthGuard 建立身份，RolesGuard 做粗粒度角色判断**；若权限判断依赖具体资源状态、所有权或事务，就应下沉到 Service、Policy 或 Domain，而不是让 Guard 变万能业务层。相比把 JWT 校验散落在 Controller，Guard 的价值是把横切访问控制抽离，同时保留对路由上下文的感知。常见执行顺序：Global Guard → Controller Guard → Route Guard，同范围按绑定顺序。

## 【问题】
关于 Guard 有哪些常见误区？

## 【回答】
- **误区：JWT 就等于权限控制**——JWT 主要承载或证明身份，权限还要按角色、资源和业务规则判断。
- **误区：Guard 就是 Middleware**——两者都参与请求处理，但 Guard 拥有 `ExecutionContext`，能感知目标 Handler 和路由 Metadata。
- **误区：所有权限都放 Guard**——资源所有权、订单状态、库存和事务规则通常由 Service / Policy / Domain 处理。
- **误区：401 和 403 一样**——401 是身份认证失败，403 是身份已确认但权限不足。

## 【衍生问题】
- 全局 AuthGuard 如何安全处理公开路由？（用 `@Public()` + `SetMetadata` 标记，`reflector.getAllAndOverride` 读取后直接放行）
- 资源级权限为什么通常不适合只用 RolesGuard？（需查资源状态/所有权/事务）
- Passport Strategy 与自定义 Guard 是什么关系？

---
category: NestJS
topic: 深挖面试题16-35
type: bagu
tags: [NestJS, 循环依赖, DynamicModule, JWT, 缓存, 事务]
difficulty: hard
created: 2026-09-21
---
# 深挖面试题16-35

## 【问题】
循环依赖如何处理？

## 【回答】
**来源题号：Q16**

**`forwardRef()` 可延迟解析引用，但频繁使用通常说明职责边界有问题**。它只是延迟了依赖的解析，并没有消除 A 与 B 的强耦合。

优先方案是抽取协调服务 `A → C ← B`、反转依赖或使用领域事件。`forwardRef()` 能处理部分循环依赖，但更应检查模块职责是否需要重新设计。

---

## 【问题】
Dynamic Module 是什么？

## 【回答】
**来源题号：Q17**

**Dynamic Module 根据运行时 options 动态生成 Module metadata 与 providers**。适合数据库、Redis、JWT、第三方 SDK 等「配置不同但能力相同」的可复用模块。

收益是封装初始化与 options；代价是 Provider 生成链更隐式，调试成本更高。本质是 Module 参数 → 动态 Provider/Options → 可复用模块实例。

---

## 【问题】
`forRoot` 与 `forRootAsync` 有什么区别？

## 【回答】
**来源题号：Q18**

**`forRoot` 直接给配置，`forRootAsync` 通过 Factory + DI 动态解析配置**。`forRootAsync` 适合依赖 `ConfigService`、Secrets 或异步初始化的配置。

常见误区：`forRootAsync` 不代表一定异步——核心是通过 DI 动态生成配置，而不是返回 Promise。

---

## 【问题】
Global Module 适合什么场景？有什么风险？

## 【回答】
**来源题号：Q19**

**Global Module 适合 Config、Logger 等基础设施能力**。`@Global()` 后无需重复 import 即可注入。

但滥用会隐藏依赖、破坏边界——基础设施之外应保持显式 imports。「更方便所以应该全局化」是错误的；显式依赖更利于可读与可维护。

---

## 【问题】
Custom Decorator 有什么用？

## 【回答】
**来源题号：Q20**

**Custom Decorator 把框架级语义封装成声明式 API**，可写 Metadata 或定义参数提取。典型模式是 Decorator 声明规则 → Metadata 保存规则 → Guard/Interceptor 用 Reflector 读取 → 运行时执行规则。

例如 `export const Public = () => SetMetadata('public', true);` 把一个路由标记为无需认证。

---

## 【问题】
Reflector 是什么？

## 【回答】
**来源题号：Q21**

**Reflector 用于读取 Decorator 写入的 Metadata，供 Guard / Interceptor 使用**。`@Roles()` 本质是 Metadata，Guard 通过 `Reflector` 读取后做授权决策。它是连接「声明式装饰器」与「运行时逻辑」的桥梁。

---

## 【问题】
JWT 与 Session 有什么区别？

## 【回答】
**来源题号：Q22**

**JWT 偏自包含、无状态（服务端不保存会话）；Session 偏服务端保存状态**。二者不是互斥，可以组合使用。

JWT 本身不等于权限系统，也不等于完整的无状态登录方案——生产系统通常仍需要 Refresh Token 的状态、轮换、撤销和设备维度会话管理。

---

## 【问题】
Access Token 与 Refresh Token 如何配合？

## 【回答】
**来源题号：Q23**

**Access Token 是短期访问凭证，降低泄露窗口；Refresh Token 是长期刷新凭证，需轮换、撤销和设备管理**。短期凭证泄露影响小，长期凭证用于换取新的访问凭证。

设计上 Refresh Token 应有轮换与撤销机制，不能把密码、敏感隐私或大量业务数据放进 JWT 的 Payload（通常只放 `sub`、`roles` 等）。

---

## 【问题】
RBAC 与 Permission 模型如何设计？

## 【回答】
**来源题号：Q24**

**角色（Role）是权限（Permission）的集合**；复杂系统通常直接声明 Permission 或 Policy，而不是只靠角色。

AuthGuard 负责建立身份（认证），RolesGuard / PermissionGuard 负责粗粒度授权。资源所有权、订单状态等复杂权限通常需要 Service / Policy / Domain 处理。401 是认证失败，403 是已识别但权限不足。

---

## 【问题】
事务边界通常放在哪一层？

## 【回答】
**来源题号：Q25**

**事务边界通常放在 Service，围绕完整的业务操作，而不是 Controller 或单个 SQL**。事务应覆盖同一业务操作的关键写入（如 A 扣款 + B 入账，全部成功或全部回滚），而不是无差别包住所有逻辑。NestJS 只负责调用和组织，脏读、不可重复读、幻读和隔离级别由数据库能力决定。

---

## 【问题】
数据库与 Redis 的一致性如何保证？

## 【回答】
**来源题号：Q26**

**数据库事务不能天然覆盖 Redis，应采用删除、重试、Outbox 或最终一致性方案**。Redis 与 PostgreSQL 属于不同系统，不能用普通数据库事务保证二者同时成功。

常见更新策略：更新 DB → 删除 Cache → 下一次读取时回源并重建；删除失败需重试或补偿。

---

## 【问题】
Prisma 与 TypeORM 如何取舍？

## 【回答】
**来源题号：Q27**

**Prisma 是 Schema-first + 生成 Client，TypeORM 是 Entity + Decorator + Repository 风格**，二者是取舍而非绝对优劣。

Prisma 的 TypeScript 类型体验更直接；TypeORM 的 Repository 风格更传统。选型取决于 ORM 习惯、类型体验、查询复杂度和团队约束，不要把「NestJS 自带数据库层」当成绝对结论。

---

## 【问题】
Repository 层是否必须存在？

## 【回答】
**来源题号：Q28**

**Repository 在复杂查询、隔离 ORM、测试替换时有价值；简单转发层可能是空抽象**。简单 CRUD 不必机械增加一层（直接 Service → Prisma 即可），复杂领域才需要 Service → Repository → ORM → Database。Repository 是复杂性工具，不是必须仪式。

---

## 【问题】
NestJS 中缓存应该怎么实现？

## 【回答】
**来源题号：Q29**

**Service 层 Cache Aside 适合复杂业务，Interceptor（CacheInterceptor）适合接口级横切缓存**。`CacheInterceptor` 不是所有缓存问题的答案——复杂 Key、权限、失效和预热通常需要业务层控制。

Cache Aside 读取：hit 直接返回，miss 查 DB → 写 Cache → 返回。更新：更新 DB → 删除 Cache → 失败时重试/补偿。

---

## 【问题】
缓存三大问题（穿透 / 击穿 / 雪崩）是什么？

## 【回答】
**来源题号：Q30**

- **穿透**：请求不存在的数据，缓存与数据库都没有，打到 DB。
- **击穿**：单个热点 Key 过期，瞬间大量请求穿透到 DB。
- **雪崩**：大量 Key 同时失效或 Redis 整体故障，DB 被压垮。

核心难点不在 `get/set`，而在缓存一致性、过期、击穿、雪崩、穿透和 Key 设计。

---

## 【问题】
如何做统一异常处理？

## 【回答】
**来源题号：Q31**

**统一异常应走 Domain Error → Exception Mapping → 对外错误（HTTP/RPC/MQ）**，避免业务层直接绑定 HTTP。

`HttpException` 与普通 `Error` 处理不同；业务异常、数据库异常和 HTTP 错误响应要有清晰映射。Exception Filter 负责把未捕获异常转换为对外错误响应。

---

## 【问题】
为什么 Service 不应直接依赖 Request？

## 【回答】
**来源题号：Q32**

**提取 userId / tenantId 后显式传参，更易测试、复用，也避免不必要的 Request Scope**。直接依赖 Request 会让 Service 绑定 HTTP 上下文，难以在 Unit 测试中隔离，也会迫使 Provider 使用 REQUEST Scope，增加实例化成本。

---

## 【问题】
默认 Singleton Scope 有什么注意事项？

## 【回答】
**来源题号：Q33**

**无状态 Service 共享实例可降低创建与 GC 成本，但不能保存请求可变状态**。默认 DEFAULT 是单例、跨请求共享，若 Singleton Service 保存当前用户，实例会被不同请求互相覆盖。需要请求级状态时再用 REQUEST Scope。

---

## 【问题】
NestJS 的测试策略是什么？

## 【回答】
**来源题号：Q34**

- **Unit（单元测试）**：Mock Provider，隔离单个 Service / Controller。
- **E2E（端到端）**：真正启动 App，验证完整请求链。

DI 让 `useValue` Mock 能自然替换真实 Provider，使单元测试无需依赖真实数据库或外部服务。

---

## 【问题】
NestJS 项目应如何分层？

## 【回答】
**来源题号：Q35**

**按业务能力垂直拆 Module，调用链为 Controller → Application/Service → Repository/Infrastructure**。每个 Module 承载一个业务能力，对外通过 exports 暴露所需 Provider。

核心是 Module / DI → Dynamic Module 与 Metadata → Guard 建立身份与权限 → Service 组织事务和业务边界 → Repository/ORM 访问数据库 → Redis 提供缓存与协调 → Unit/E2E 验证行为。每个机制都有代价，应按业务约束选型而非机械套模板。

---
category: NestJS
topic: Interceptor
type: bagu
tags: [NestJS, Interceptor, RxJS, AOP, 统一响应, 洋葱模型]
difficulty: hard
created: 2026-09-21
---
# Interceptor

## 【问题】
NestJS Interceptor 是什么？`ExecutionContext` 与 `CallHandler` 的作用？

## 【回答】
**Interceptor 把 Controller / Route Handler 的执行过程整体包起来，既能在执行前做事，也能在返回结果或异常时继续处理**，适合围绕 Handler 前后统一增强。最小结构实现 `NestInterceptor.intercept(context, next)`。两个关键对象：**`ExecutionContext` 知道当前 Controller、Handler、Request 等执行上下文**；**`CallHandler` 通过 `handle()` 继续调用后续 Handler，并返回 Observable**。它属于 AOP 风格的横切关注点：日志、监控、Tracing、缓存、响应包装不属于具体业务，却横向影响很多 Handler。

## 【问题】
`next.handle()` 是什么？不调用它会怎样？

## 【回答】
**`next.handle()` 表示继续执行后面的 Route Handler，并把后续结果交给当前 Interceptor 的 Observable 链处理**。其返回的是后续 Handler 执行产生的一条结果流。生命周期上：Interceptor Before → `next.handle()` → Pipe → Controller → Service → Result → 回到 Interceptor After。

**如果 Interceptor 不调用 `next.handle()`，Route Handler 就不会执行**。这使它能用于缓存命中、短路或特殊条件直接返回结果——例如缓存命中时 `return of(cached)` 直接返回，不进入 Controller。

## 【问题】
Interceptor 中 RxJS 的 `map` / `catchError` / `tap` / `timeout` 各有什么用途？

## 【回答】
`CallHandler.handle()` 返回 Observable，可用 RxJS 操作符组合执行过程：

- **`tap()`：观察并执行副作用，不改变结果**，适合日志、耗时、埋点、Tracing。
- **`map()`：转换返回值**，如把 `{ id: 1 }` 包成 `{ code: 0, data: {...} }`。
- **`catchError()`：捕获或转换异常**，可观察/记录后 `throw error` 继续交给 Filter。
- **`timeout()`：超时控制**，给 Handler 执行设定时限。

注意 `tap()` 主要做副作用并保留原值；要改返回结果通常用 `map()`，不能用 `tap()` 修改返回值。

## 【问题】
如何用 Interceptor 实现统一响应格式、耗时统计与缓存短路？

## 【回答】
- **统一响应格式**：`next.handle().pipe(map(data => ({ code: 0, message: 'success', data })))`，Controller 无需知道包装规范；但文件下载、流式、SSE 等特殊响应不一定适合统一包装。
- **耗时统计**：`intercept` 里记 `start = Date.now()`，`tap(() => console.log(Date.now()-start))`，可比 Middleware 更贴近 Handler 级监控（如 `UserController.findOne: 18ms`）。
- **缓存短路**：先 `cache.get(key)`，命中则 `return of(cached)` 直接返回（不调 `handle()`），未命中则 `next.handle().pipe(tap(r => cache.set(key, r)))` 写回。

## 【问题】
多个 Interceptor 的执行顺序是怎样的？什么是洋葱模型？

## 【回答】
绑定顺序通常为 Global → Controller → Route，进入时按 `Global Before → Controller Before → Route Before → Handler` 执行，返回时反向 `Handler → Route After → Controller After → Global After`，即 first-in-last-out / 洋葱模型：

```text
A(
  B(
    C(
      Handler
    )
  )
)
```

这类似栈式嵌套。Exception Filter 负责最终错误响应，Interceptor 可用 `catchError` 观察或转换异常但不应把所有错误格式化堆进去。简单原则：**执行增强、日志、重试、超时、结果加工 → Interceptor；异常最终映射成 HTTP Response → Exception Filter**。

## 【问题】
面试时怎么答 Interceptor？

## 【回答】
Interceptor 是横切处理组件，通过 **`ExecutionContext` 获取当前执行上下文，通过 `CallHandler.handle()` 包裹 Route Handler**。进入时先执行前置逻辑，再调用 `next.handle()` 让 Pipe、Controller、Service 继续执行；结果返回时通过 **`tap`、`map` 或 `catchError` 做日志、转换或异常观察**，缓存命中时甚至不调用 `handle()` 直接返回。它体现 AOP 的横切关注点思想。Middleware 主要处理底层 HTTP，Guard 负责访问资格，Pipe 负责输入边界，Exception Filter 负责最终错误响应——**不能因为 Interceptor 能做很多事就把所有逻辑集中进去**，组件边界的价值在于可测试、可复用、可观测。

## 【问题】
关于 Interceptor 有哪些常见误区？

## 【回答】
- **误区：Interceptor 只是另一个 Middleware**——它有 `ExecutionContext` 和 `CallHandler`，能围绕具体 Handler 的结果流执行前后逻辑。
- **误区：不调用 `next.handle()` 只是漏写代码**——它会直接阻止 Handler 执行，可用于缓存命中等短路。
- **误区：`tap()` 可以修改返回值**——`tap()` 主要做副作用保留原值，改结果要用 `map()`。
- **误区：Interceptor 负责所有异常响应**——它能观察/转换异常，但最终统一错误响应更适合 Exception Filter。
- **误区：Interceptor 的耗时就是完整请求耗时**——它通常围绕 Handler 统计，是否含 Middleware、序列化和网络发送取决于测量切点。

## 【衍生问题】
- 为什么 `next.handle()` 返回 Observable？（Handler 执行是异步结果流，便于用 RxJS 组合）
- 全局响应包装如何避免误伤文件/流式/SSE 响应？
- Cache Interceptor 如何处理并发缓存击穿？

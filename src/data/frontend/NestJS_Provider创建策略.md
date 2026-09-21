---
category: NestJS
topic: Provider创建策略
type: bagu
tags: [NestJS, Provider, useClass, useValue, useFactory, useExisting]
difficulty: hard
created: 2026-09-21
---
# Provider创建策略

## 【问题】
NestJS 有哪四种自定义 Provider 创建策略？它们的本质分别是什么？

## 【回答】
Token 只回答「我要找哪个依赖」，Provider 创建策略继续回答「这个依赖到底怎么产生」。四种策略是四类依赖提供规则，不是四个孤立 API：

```text
useClass      → new 一个 class
useValue      → 直接使用现成值
useFactory    → 调函数动态创建
useExisting   → 复用已有 Provider
```

| 类型 | 本质 | 实例/值由谁产生 | 典型场景 |
|---|---|---|---|
| `useClass` | 使用 class 创建 | Nest + class | Service、Adapter、Strategy |
| `useValue` | 直接提供现成值 | 业务代码或测试准备 | 配置、常量、Mock、第三方实例 |
| `useFactory` | 工厂函数动态创建 | Factory 函数 | 配置驱动、异步初始化、条件选择 |
| `useExisting` | 复用已有 Provider | 已注册 Provider | 别名、统一访问入口 |

记忆方式：**Class / Value / Factory / Alias**——四种策略覆盖的是真实依赖的不同来源。

## 【问题】
`useClass` 是什么？什么场景用它？

## 【回答】
`useClass` 让容器根据 class 创建实例：

```ts
{ provide: UserService, useClass: UserService }
```

若 `UserService` 构造器依赖 `DatabaseService`，容器会先解析 DatabaseService，再 `new UserService(database)`。它的真正价值在于 **Token 和实现可以不同**：

```ts
{ provide: 'CACHE', useClass: RedisCacheService }
// 之后可改为
{ provide: 'CACHE', useClass: MemoryCacheService }
```

调用方 `@Inject('CACHE') cache: CacheService` 始终不变，从而支持实现替换。适用场景：Service、Repository、Adapter、Strategy、第三方 SDK 包装类等任何可由 class 标准实例化的能力。`providers: [UserService]` 正是 `useClass` 的简写。

## 【问题】
`useValue` 是什么？和 `useClass` 有什么区别？

## 【回答】
`useValue` 直接注册现成值，容器不会调用 `new`：

```ts
{ provide: 'APP_NAME', useValue: 'my-app' }
{ provide: 'CONFIG', useValue: { host: 'localhost', port: 3000 } }
```

值可以是字符串、对象，也可以是已创建好的第三方实例：

```ts
const redis = new Redis();
{ provide: 'REDIS', useValue: redis }
```

**`useClass` 告诉 Nest「请你根据 class 创建」；`useValue` 告诉 Nest「值已经准备好了，直接使用」**。测试中典型用法是把真实 Service 换成 Mock：`{ provide: UserService, useValue: { findAll: jest.fn().mockReturnValue([]) } }`，Controller 仍请求 `UserService` Token，但拿到 Mock，无需连真实数据库。

## 【问题】
`useFactory` 与 `inject` 是什么？为什么需要它？异步初始化怎么写？

## 【回答】
有些依赖不能简单 `new` 得到，需要读配置、按环境选择、建立连接或异步初始化，此时用 `useFactory`：

```ts
{
  provide: 'DATABASE',
  useFactory: (configService: ConfigService) => {
    return createDatabaseConnection({ host: configService.get('DB_HOST') });
  },
  inject: [ConfigService],
}
```

**`inject` 声明工厂函数的参数依赖**——容器先解析 `ConfigService`，再调用 `factory(configService)`，把返回值绑定到 `DATABASE`。异步初始化也可直接返回 Promise：

```ts
{ provide: 'REDIS', useFactory: async (config: ConfigService) => {
    const client = new Redis(config.get('REDIS_URL'));
    await client.connect();
    return client;
  }, inject: [ConfigService] }
```

容器会处理工厂返回的 Promise，并在应用初始化链路中等待其结果。`useFactory` 比 `useClass` 更适合包含运行时配置、条件选择、异步连接或复杂组合的情况。

## 【问题】
`useExisting` 是什么？它和 `useClass` 为什么不是一回事？

## 【回答】
`useExisting` 让一个 Token 复用已注册的 Provider，指向**同一个实例**：

```ts
@Injectable() class LoggerService {}
{ provide: 'APP_LOGGER', useExisting: LoggerService }
```

关系是 `LoggerService Token` 与 `APP_LOGGER Token` 共享同一个实例。关键区别于 `useClass`：

```ts
// useClass：可能再次创建新的 LoggerService 实例
{ provide: 'LOGGER', useClass: LoggerService }
// useExisting：复用已有 LoggerService Provider 的别名，共享同一实例
{ provide: 'LOGGER', useExisting: LoggerService }
```

Map 类比：`useClass` 相当于 `container.set('LOGGER', new LoggerService())`（新建），`useExisting` 相当于 `container.set('LOGGER', container.get(LoggerService))`（复用）。`useExisting` 要求被复用的 Provider 已经注册且在当前模块上下文可见。

## 【问题】
四种策略如何做工程选型？

## 【回答】
按「依赖如何产生」判断：

```text
能否直接由 class + 构造依赖创建？
├── 是 → useClass
└── 否
    ├── 值已由外部创建 → useValue
    ├── 需要动态/异步/条件创建 → useFactory
    └── 只是给已有 Provider 增加入口 → useExisting
```

- **`useClass` vs `useFactory`**：能标准实例化且依赖可由 Nest 解析优先 `useClass`；依赖运行时配置、异步初始化或条件逻辑选 `useFactory`。
- **`useValue` vs `useFactory`**：值已创建且不需容器参与用 `useValue`；每次启动需根据依赖/配置生成用 `useFactory`。
- **`useClass` vs `useExisting`**：需创建独立实现实例用 `useClass`；需多个 Token 指向同一实例用 `useExisting`。

代价：Provider 配置越灵活，运行时调试和依赖追踪越依赖容器配置，而非类名直观推断。

## 【问题】
关于 Provider 创建策略有哪些常见误区？

## 【回答】
- **误区 1：Provider 就是一个对象**。Provider 更准确是一个依赖提供规则，最终可能解析为实例、常量、工厂返回值或别名。
- **误区 2：`useFactory` 只是 `new` 的函数版**。它还能注入其他 Provider、读取配置、做条件选择、异步初始化并返回第三方对象。
- **误区 3：`useExisting` 和 `useClass` 一样**。`useClass` 关注创建实现（可能产生新实例），`useExisting` 关注复用已有 Provider（共享同一实例）。
- **误区 4：`useValue` 只适合字符串**。它同样可提供对象、函数、Mock、第三方客户端和配置快照。

面试答法：**四种自定义 Provider 本质是在定义 Token 对应的创建规则**——`useClass` 让容器按 class 创建，`useValue` 直接注册已有值，`useFactory` 动态/异步生成（可 `inject` 声明依赖），`useExisting` 让一个 Token 复用已有 Provider，分别覆盖类实例、现成值、动态创建和别名复用四类场景。

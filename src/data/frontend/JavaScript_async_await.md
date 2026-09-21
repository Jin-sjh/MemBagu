---
category: JavaScript
topic: async_await
type: bagu
tags: [JavaScript, async/await, Promise, 异步编程, 微任务, 错误处理]
difficulty: medium
created: 2026-09-21
---
# async_await

## 【问题】
async/await 是什么？它和 Promise 是什么关系？

## 【回答】
`async/await` 是建立在 Promise 之上的**语法糖**，让异步流程看起来像顺序代码，但它并不会把 JavaScript 变成同步阻塞，也不会自动并行或取消任务。

**核心语义：**

- **async 函数无论返回什么，调用结果都是 Promise**：返回普通值会被 `fulfilled`，抛出异常会被 `rejected`。
- **`await x` 会把 `x` 转成 Promise 语义**：如果尚未完成，就暂停当前 async 函数，把后续代码注册为恢复反应。
- **它只暂停当前函数，不阻塞主线程和其他任务**，结果确定后通过微任务恢复。

```js
async function getValue() { return 1; }
getValue() instanceof Promise; // true
```

所以 async/await 本质还是 Promise：`await` 是在等待一个 Promise 的结果，并改写当前函数的控制流，而不是改变 JavaScript 的执行模型。

## 【问题】
await 会阻塞主线程吗？它的暂停和恢复机制是怎样的？

## 【回答】
**await 不会阻塞主线程**，它只暂停「当前 async 函数」的执行，主线程和其他任务照常运行。

机制是：遇到一个未完成的 Promise 时，`await` 会**暂停当前 async 函数，把剩余逻辑交给 Promise 的反应队列**；当 Promise 进入 `fulfilled` 时，其值与 `rejected` 时的异常会在**恢复点（微任务）**继续——`fulfilled` 值作为表达式结果，`rejected` 则在恢复点抛出。

```js
async function f() {
  console.log('start');
  const v = await Promise.resolve(1); // 这里暂停，让出主线程
  console.log(v); // 微任务中恢复
}
```

**关键结论：** await 改写的只是「当前 async 函数的控制流」，不是整个 JavaScript 执行器；阻塞的错觉来自串行写法，而非 await 本身。

## 【问题】
多个 await 到底是串行还是并行？面试时怎么答？

## 【回答】
**并发关系由「启动位置」决定，不是由 await 关键字决定。** 这是面试高频考点。

下面两个 `await` 会把独立任务**串行化**，因为第二个任务的启动被放在第一个结果之后：

```js
const a = await fetch('/a');
const b = await fetch('/b'); // 等 a 回来才启动
```

如果任务互不依赖，应先启动再聚合：

```js
const aPromise = fetch('/a');
const bPromise = fetch('/b');
const [a, b] = await Promise.all([aPromise, bPromise]); // 并行
```

**答题要点：**

- **独立任务 → 先创建 Promise，再用 `Promise.all` 聚合**，才能并行；
- **有严格前置依赖 → 串行**才是正确语义，强行 `Promise.all` 反而改变业务含义；
- **误区**：「多个 await 会自动并行」是错的，启动位置才决定并发。

## 【问题】
async/await 中如何正确地处理错误？

## 【回答】
`await` 遇到 `rejected` 的 Promise 时，会在**恢复点抛出异常**，可由附近的 `try/catch` 捕获：

```js
try {
  const data = await request();
  return parse(data);
} catch (error) {
  throw new Error('加载失败', { cause: error });
}
```

**关键结论：**

- `try/catch` 只能捕获**同步代码和 await 的异步错误**，无法捕获 `setTimeout`、`.then()` 等异步回调里抛出的异常；
- **不要用空 `catch` 吞掉错误**，应区分用户可恢复错误、取消、网络失败和程序 bug；
- 批量异步任务里一个 `Promise.all` 失败会整体 `rejected`，可用 `Promise.allSettled`（ES2020）拿到每个结果再自行过滤；
- 未被消费的 reject 会产生 **unhandled rejection**，链路越长越难定位，建议分层处理并保留 `cause`。

## 【问题】
async/await 有哪些常见误区？

## 【回答】
面试常挖的误区有以下几个，需准确反驳：

- **误区：await 会阻塞主线程。** 正解：只暂停当前 async 函数，不阻塞主线程和其他任务。
- **误区：async 函数返回普通值。** 正解：async 函数**始终返回 Promise 包装结果**，普通值也会被 `fulfilled`。
- **误区：多个 await 会自动并行。** 正解：启动位置决定并发关系，连续 await 是串行，独立任务需先启动再 `Promise.all`。
- **误区：async 让代码变成同步。** 正解：它只让异步控制流「看起来像」同步写法，返回值仍是 Promise，时序仍受事件循环和微任务调度控制。

还有一类延伸坑：`try/catch` 捕获不到异步回调内部（如 `setTimeout`）抛出的错误，需要在回调内单独处理。

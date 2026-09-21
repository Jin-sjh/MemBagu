---
category: JavaScript
topic: Promise
type: bagu
tags: [JavaScript, Promise, 异步编程, 微任务, 并发控制, 错误处理]
difficulty: hard
created: 2026-07-24
---
# Promise

## 【问题】
Promise 有哪些特点？

## 【回答】
EMAScript 6 原生提供了 Promise 对象，它是用来处理异步操作的。它代表了某个未来才会知道结果的事件（通常是一个异步操作），并且这个事件提供统一的 API，可供进一步处理。

Promise 对象有以下两个特点。

（1）对象的状态不受外界影响。Promise 对象代表一个异步操作，有 3 种状态，即 Pending（进行中）、Resolved（已完成，之前版本称为 Fulfilled）和 Rejected（已失败）。只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。这也是 Promise 这个名字的由来，它的英文解释是承诺、允诺，表示其他手段无法改变。

（2）一旦状态改变，就不会再改变，任何时候都可以得到这个结果。Promise 对象的状态改变，只有两种可能，从 Pending 变为 Resolved 和从 Pending 变为 Rejected。只要这两种情况发生，状态就凝固了，会一直保持这个结果，不会再变了。即使对 Promise 对象添加回调函数，也会立即得到这个结果。这与事件（Event）完全不同，事件的特点是，如果你错过了它，再去监听，也无法得到结果。

有了 Promise 对象，就可以将异步操作以同步操作的流程表达出来，避免了层层嵌套的回调函数。此外，Promise 对象提供统一的接口，使得控制异步操作更加容易。

Promise 也有一些缺点。首先，无法取消 Promise，一旦新建，它就会立即执行，无法中途取消。其次，如果不设置回调函数，Promise 内部抛出的错误不会反映到外部。最后，当处于 Pending 状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。

## 【问题】
Promise 是什么？

## 【回答】
Promise 是一个处理异步操作的状态机，状态只会从 pending 变成 fulfilled 或 rejected，并且不可逆。它提供了 then/catch/finally 等方法用于链式调用，同时回调会进入微任务队列，保证更稳定的执行顺序。

## 【问题】
Promise 和 async/await 的关系？

## 【回答】
async/await 是基于 Promise 的语法糖，await 实际上是等待 Promise 的结果，并暂停 async 函数内部执行流程，但不会阻塞主线程。

## 【问题】
解释 Promise 的概念及其常用方法

## 【回答】
**Promise** 是异步编程的解决方案，表示一个异步操作的最终完成或失败。

**状态：**
- `pending`：初始状态
- `fulfilled`：操作成功完成
- `rejected`：操作失败

**方法：**
1. `Promise.resolve()` - 返回一个 resolved 状态的 Promise
2. `Promise.reject()` - 返回一个 rejected 状态的 Promise
3. `Promise.all()` - 所有 Promise 都成功时返回结果数组
4. `Promise.race()` - 第一个完成的 Promise 的结果
5. `Promise.allSettled()` - 所有 Promise 完成后返回结果
6. `Promise.prototype.then()` - 添加成功回调
7. `Promise.prototype.catch()` - 添加失败回调
8. `Promise.prototype.finally()` - 无论成功失败都执行

## 【问题】
Promise 状态为什么不可逆？

## 【回答】
1. Promise 仅有 pending、fulfilled、rejected 三种状态，只能从 pending 切换为 fulfilled 或 rejected，切换后状态永久锁定，不可再次变更或逆转。

2. 异步操作本身具有一次性，只会成功或失败一次，状态不可逆贴合这一客观规律。

3. 确保 resolve/reject 仅触发一次，避免 then/catch 回调多次执行，防止逻辑混乱与数据污染。

4. 锁定异步结果，保证多次调用 then/catch 都能获取一致、可预测的结果，保障代码可靠性。

## 【问题】
Promise 为什么比回调地狱优雅？

## 【回答】
回调地狱（Callback Hell）是多层嵌套的回调函数，而 Promise 从根本上解决了这个问题，核心优势如下：

1. **链式调用，扁平化代码**：Promise 通过 `.then()` 链式调用，将嵌套的回调改为线性的代码结构，可读性、可维护性大幅提升；

2. **统一的错误处理机制**：Promise 通过 `.catch()` 统一捕获链式调用中所有的错误，避免了回调中层层嵌套的错误处理；

3. **状态不可逆，结果可缓存**：Promise 的状态（pending/fulfilled/rejected）一旦确定就不会改变，多次调用 `.then()` 会复用同一个结果，避免了回调的重复执行问题；

4. **组合异步任务更便捷**：提供了 `Promise.all` / `Promise.race` / `Promise.allSettled` 等静态方法，轻松实现多异步任务的并行、竞速等场景；

5. **为 async/await 铺路**：Promise 是 async/await 的语法糖基础，让异步代码可以像同步代码一样编写，彻底告别回调。

**面试加分点：**
- 回调地狱的本质：**异步流程的嵌套化，导致代码可读性、可维护性、错误处理能力急剧下降**；
- Promise 的核心设计：**状态机 + 回调队列**，解决了异步流程的控制问题；
- 对比：回调是「嵌套的、不可控的」，Promise 是「线性的、可管理的」。

## 【问题】
async/await 在错误处理上的坑？

## 【回答】
async/await 是 Promise 的语法糖，在错误处理上有几个高频坑，面试必问：

**(1) 坑 1：未捕获的 Promise reject 会直接抛出错误，阻塞后续代码**
await 后面的 Promise 如果 reject，会直接抛出异常，如果没有 try/catch 包裹，会直接终止整个 async 函数的执行，后续代码不会运行。

```javascript
// 错误示例：如果 request1 reject, request2 永远不会执行
async function fn() {
  const res1 = await request1(); // reject，直接抛出错误
  const res2 = await request2(); // 永远不会执行
}
```

**解决方案：** 用 try/catch 包裹，或给每个 await 加.catch()。

**(2) 坑 2:try/catch 无法捕获异步回调中的错误**
try/catch 只能捕获同步代码和 await 的异步错误，无法捕获 setTimeout、Promise.then() 等异步回调中的错误。

```javascript
async function fn() {
  try {
    setTimeout(() => {
      throw new Error('error'); // 无法被 try/catch 捕获
    }, 0);
  } catch (e) {
    console.log(e); // 不会执行
  }
}
```

**解决方案：** 在异步回调内部单独处理错误，或用 Promise 包装。

**(3) 坑 3: Promise.all 中一个 reject，会直接导致整体 reject**
await Promise.all([p1, p2, p3]) 中，只要有一个 Promise reject，整个 Promise.all 就会 reject，其他成功的结果也拿不到。

**解决方案：** 用 Promise.allSettled() (ES2020)，会返回所有 Promise 的结果（无论成功失败），再自行过滤。

**(4) 坑 4: async 函数的错误不会被外层的 try/catch 捕获（非 await 场景）**
如果 async 函数没有被 await，其内部的错误会变成未捕获的 Promise reject，不会被外层的 try/catch 捕获。

```javascript
try {
  fn(); // 没有 await，fn 内部的错误无法被捕获
} catch (e) {
  console.log(e); // 不会执行
}
```

**解决方案：** 必须用 await 调用 async 函数，或给 async 函数加.catch()。

**(5) 坑 5：错误堆栈信息丢失（老版本 JS 引擎）**
早期 JS 引擎中，async/await 的错误堆栈会丢失异步调用的上下文，难以定位问题，现代引擎（V8）已优化，但面试仍会提及。

**面试加分点**
- async/await 的本质：语法糖，底层还是 Promise，所以所有 Promise 的错误处理规则都适用于 async/await；
- 最佳实践：用 try/catch 包裹 await，或用.catch() 处理单个 await 的错误，用 Promise.allSettled 处理批量异步任务；
- 对比：async/await 的错误处理比 Promise 链式调用更直观，但需要注意同步/异步的捕获边界。

**补充：面试答题技巧**
1. 先给结论，再讲原理，最后给方案：比如 this 丢失题，先讲本质，再讲场景，最后给 4 种方案；
2. 结合代码示例：面试时可以手写简单的代码示例，比如闭包的代码，this 丢失的代码，让回答更有说服力；
3. 延伸相关知识点：比如讲 Promise 时，延伸到 async/await、事件循环，体现知识的系统性。

## 【问题】
Promise.then 属于什么任务？

## 【回答】
属于微任务（microtask）。

## 【问题】
Promise.all 和 Promise.race 的区别？

## 【回答】
all 需要全部成功才成功，有一个失败就失败。
race 是谁先返回用谁。

## 【问题】
async/await 的本质是什么？

## 【回答】
async/await 是 Promise + 生成器（Generator）的语法糖，本质基于 Promise 和事件循环。

**关键执行规则：**

- `async` 函数执行后，返回的是一个 Promise 对象
- `await` 后面的代码，会被包装成微任务，加入微任务队列
- `await` 会暂停当前函数的执行，让出主线程，直到 Promise 状态改变

## 【问题】
如何实现异步编程？

## 【回答】
具体方法如下。

**方法1，通过回调函数。** 优点是简单、容易理解和部署；缺点是不利于代码的阅读和维护，各个部分之间高度耦合（Coupling），流程混乱，而且每个任务只能指定一个回调函数。

**方法2，通过事件监听。** 可以绑定多个事件，每个事件可以指定多个回调函数，而且可以"去耦合"（Decoupling），有利于实现模块化；缺点是整个程序都要变成事件驱动型，运行流程会变得很不清晰。

**方法3，采用发布/订阅方式。** 性质与"事件监听"类似，但是明显优于后者。

**方法4，通过 Promise 对象实现。** Promise 对象是 CommonJS 工作组提出的一种规范，旨在为异步编程提供统一接口。它的思想是，每一个异步任务返回一个 Promise 对象，该对象有一个 then 方法，允许指定回调函数。

---

## 【问题】
Promise 的构造函数执行器是同步还是异步？then 回调呢？

## 【回答】
**构造函数里的执行器是同步调用的**，而 `then/catch/finally` 的回调是异步进入微任务队列的，这两个层次必须分开。

```js
const p = new Promise((resolve) => {
  console.log('同步');     // 立即打印
  resolve(1);
});
console.log('继续同步');    // 立即打印
p.then(v => console.log(v)); // 回调异步进入微任务
// 输出顺序：同步 → 继续同步 → 1
```

**关键结论：**

- **执行器（executor）同步执行**：`new Promise(fn)` 会立刻运行 `fn`；
- **反应（reaction）异步调度**：`then` 回调被排入微任务，等当前调用栈清空后执行；
- 因此「Promise 回调通常是微任务，但构造函数执行器本身是同步的」是面试常考的区分点。

## 【问题】
then 返回的新 Promise 结果由什么决定？什么是值穿透和错误穿透？

## 【回答】
`then(onFulfilled, onRejected)` **返回一个新的 Promise**，新 Promise 的结果由回调的返回值或抛出的异常决定：

| 回调行为 | 新 Promise |
|---|---|
| 返回普通值 | fulfilled，值为该返回值 |
| 返回 Promise/thenable | 采用其最终状态 |
| 抛出异常 | rejected，reason 为异常 |
| 对应回调缺省 | 结果透传 |

```js
Promise.resolve(1)
  .then(x => x + 1)
  .then(x => { throw new Error('bad'); })
  .catch(err => 'recovered')
  .then(console.log); // recovered
```

**关键结论：**

- **值穿透**：没有成功处理器时，成功值继续向下传；
- **错误穿透**：没有失败处理器时，拒绝原因继续向下传；
- `catch(fn)` 本质近似 `then(undefined, fn)`，`finally(fn)` 无论成败都执行并默认保留原结果，除非它抛错或返回 rejected Promise。

## 【问题】
Promise.all / race / allSettled / any 各自语义是什么？all 失败后其他请求会停吗？

## 【回答】
四种组合方法聚合语义不同：

- **`Promise.all`**：全部 fulfilled 才成功；任一 rejected 就尽快 rejected，但**不会自动取消其他底层操作**。
- **`Promise.allSettled`**：等待全部结束，返回每项的状态和值/原因。
- **`Promise.race`**：第一个 settled（无论成败）的结果决定整体。
- **`Promise.any`**：第一个 fulfilled 成功；全部 rejected 时返回 `AggregateError`。

```js
const results = await Promise.all(urls.map(fetch));
```

**关键结论：**

- **`Promise.all` 不等于并发限制**：它只组合结果，不控制启动数量，一次性传数千个任务会造成连接/内存/服务端压力；
- **`all` 失败后其他请求不会自动停**：底层操作需通过 `AbortController` 等单独取消。

## 【问题】
Promise 能取消吗？为什么需要 AbortController？

## 【回答】
**Promise 对象本身没有通用的取消协议**——它只能表示「未来结果」，cancel 不是内建能力。取消要分两层：

1. **取消消费者等待或忽略结果**：上层不再关心，但底层工作可能仍在跑；
2. **用底层 API 真正停止工作**：例如 `fetch` 配合 `AbortController` 发送取消信号。

```js
const controller = new AbortController();
fetch(url, { signal: controller.signal });
controller.abort(); // 真正关闭请求
```

**关键结论：**

- Promise 只提供**组合基础**，不替你决定取消、重试、并发限制等业务策略；
- 并发池核心是限制「同时运行数」，重试要区分可重试错误、退避、最大次数和幂等性；
- 只停 UI 不够，必须把取消信号连到服务端/底层资源，否则任务仍在消耗资源。

## 【问题】
关于 Promise 有哪些常见误区？

## 【回答】
高频误区需准确反驳：

- **误区：用了 Promise 就没有回调地狱。** 正解：链式逻辑仍可能复杂，Promise 只是改善了表达模型，复杂分支、取消、重试、并发限制仍需额外设计。
- **误区：`Promise.all` 控制并发。** 正解：它聚合结果，不限制启动数量。
- **误区：`setTimeout(fn, 0)` 一定晚于所有 Promise。** 正解：常见浏览器场景通常如此，但跨宿主、不同任务源和具体调度应以规范/实验为准，不能绝对化。
- **反证条件**：若任务需要取消、背压、暂停或多次值推送，Promise 的「单值模型」可能不够，应考虑流（Observable）或任务抽象。

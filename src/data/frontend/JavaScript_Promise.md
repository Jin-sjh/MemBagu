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
如何实现异步编程？

## 【回答】
具体方法如下。

**方法1，通过回调函数。** 优点是简单、容易理解和部署；缺点是不利于代码的阅读和维护，各个部分之间高度耦合（Coupling），流程混乱，而且每个任务只能指定一个回调函数。

**方法2，通过事件监听。** 可以绑定多个事件，每个事件可以指定多个回调函数，而且可以"去耦合"（Decoupling），有利于实现模块化；缺点是整个程序都要变成事件驱动型，运行流程会变得很不清晰。

**方法3，采用发布/订阅方式。** 性质与"事件监听"类似，但是明显优于后者。

**方法4，通过 Promise 对象实现。** Promise 对象是 CommonJS 工作组提出的一种规范，旨在为异步编程提供统一接口。它的思想是，每一个异步任务返回一个 Promise 对象，该对象有一个 then 方法，允许指定回调函数。

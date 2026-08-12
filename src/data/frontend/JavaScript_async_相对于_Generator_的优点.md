---
category: JavaScript
topic: async_相对于_Generator_的优点
type: bagu
tags: [JavaScript]
difficulty: easy
created: 2026-07-24
---
# async 相对于 Generator 的优点是什么？

## 【问题】
async 相对于 Generator 的优点是什么？

## 【回答】
优点如下：

（1）Generator 函数需要调用 next 指令来运行异步的语句，async 不需要调用 next，像运行正常的函数那样直接运行就可以。

（2）相较于 Generator 的*和 yield，async 和 await 的语义化更明确。

（3）await 后面可以跟 promise 或者任意类型的值，yield 命令后面只能跟 Thunk 函数或者 Promise 对象。

（4）async 返回一个 Promise 对象，可以调用 then 和 cache。

---

## 真实业务 / 面试场景（案例补充）

### 场景 1：真实项目里 async/await 替代 Generator
**背景**：以前用 Generator + co 库才能让异步"看起来同步"，要手动 `yield` 和 `co(fn()).then()`。
**解决**：现在直接 `async function f(){ const a = await fetchA(); const b = await fetchB(a); }`，不用调用 next、不用引入 co，语义清晰。

### 场景 2：错误用 try/catch 一把抓
**背景**：Generator 里错误要在迭代器上 `.throw()` 处理，很别扭。
**解决**：async 函数内 `try { await x() } catch(e){ ... }` 即可捕获异步错误；因为 async 返回的是 Promise，未捕获会走 reject，也能用 `.catch`。

### 场景 3：面试——async 相比 Generator 的好处
**要点**：① 不用手动 next；② async/await 语义比 * / yield 更明确；③ await 后面能跟任意值（不只是 Promise/Thunk）；④ 返回 Promise，可 `.then`、可 `Promise.all` 组合，利于并发。

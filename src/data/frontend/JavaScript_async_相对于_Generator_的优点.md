# async 相对于 Generator 的优点是什么？

【问题】
async 相对于 Generator 的优点是什么？

【回答】
优点如下：

（1）Generator 函数需要调用 next 指令来运行异步的语句，async 不需要调用 next，像运行正常的函数那样直接运行就可以。

（2）相较于 Generator 的*和 yield，async 和 await 的语义化更明确。

（3）await 后面可以跟 promise 或者任意类型的值，yield 命令后面只能跟 Thunk 函数或者 Promise 对象。

（4）async 返回一个 Promise 对象，可以调用 then 和 cache。

【问题】
Web Workers 通信原理

【回答】
- Web Workers 是浏览器中的线程，用于执行并行任务，避免阻塞主线程。

- 通信：
  - **postMessage**：主线程和 Worker 线程之间通过 `postMessage` 方法传递消息。
  - **onmessage**：监听消息，处理数据。

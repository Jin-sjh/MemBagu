【问题】
请你说一下 Web Worker 和 WebSocket 的作用。

【回答】
**Web Worker 的作用如下：**

（1）通过 `worker = new Worker(url)` 加载一个 JavaScript 文件，创建一个 Worker，同时返回一个 Worker 实例。

（2）用 `worker.postMessage(data)` 向 Worker 发送数据。

（3）绑定 `worker.onmessage` 接收 Worker 发送过来的数据。

（4）可以使用 `worker.terminate()` 终止一个 Worker 的执行。

**WebSocket 的作用如下：**

它是 Web 应用程序的传输协议，提供了双向的、按序到达的数据流。它是 HTML5 新增的协议，WebSocket 的连接是持久的，它在客户端和服务器之间保持双工连接，服务器的更新可以及时推送到客户端，而不需要客户端以一定的时间间隔去轮询。

---

【问题】
Web Workers 通信原理

【回答】
Web Worker 是 HTML5 提供的后台线程技术，让 JavaScript 可以在主线程之外执行脚本，避免耗时任务阻塞 UI 导致页面卡顿。

它通过创建独立线程，使用 postMessage 和 onmessage 与主线程进行数据通信，由于内存隔离不能直接操作 DOM，适合处理大量数据计算、文件解析、复杂逻辑等耗时任务，从而保证页面交互流畅。

通信机制：
- **postMessage**：主线程和 Worker 线程之间通过 `postMessage` 方法传递消息。
- **onmessage**：监听消息，处理数据。

【问题】
Web Worker 与 Service Worker 的区别是什么？

【回答】
**Web Worker** 是 HTML5 提供的前端多线程技术，它允许我们在主线程之外创建一个独立后台线程，把大量计算、数据处理或耗时逻辑移到 worker 中执行，从而避免阻塞主线程，保证页面流畅交互。线程之间通过 postMessage 和 onmessage 进行通信，但因为内存隔离，不能直接操作 DOM。

而 **Service Worker** 与它完全不同，是 PWA 的核心，本质是浏览器与网络之间的中间代理。它能拦截请求、缓存资源、实现离线可用，并且生命周期独立于页面，由浏览器长期管理，用于提升访问速度与离线体验。

**简单总结**：Web Worker 解决主线程卡顿问题，负责复杂计算；Service Worker 解决网络与缓存问题，负责离线与性能优化。

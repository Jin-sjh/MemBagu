---
category: JavaScript
topic: localStorage 和 cookie 的区别
type: bagu
tags: [JavaScript]
difficulty: easy
created: 2026-07-24
---
# localStorage 和 cookie 的区别

## 【问题】

localStorage 和 cookie 的区别是什么？

## 【回答】

localStorage 的概念和 cookie 相似，区别是 localStorage 是为了更大容量的存储设计的。cookie 的大小是受限的，并且每次请求一个新页面时，cookie 都会被发送过去，这样无形中浪费了带宽。另外，cookie 还需要指定作用域，不可以跨域调用。

除此之外，localStorage 拥有 setItem、getItem、removeItem、clear 等方法，cookie 则需要前端开发者自己封装 setCookie 和 getCookie。但 cookie 也是不可或缺的，因为 cookie 的作用是与服务器进行交互，并且还是 HTTP 规范的一部分，而 localStorage 仅因为是为了在本地"存储"数据而已，无法跨浏览器使用。

---

## 真实业务 / 面试场景（案例补充）

### 场景 1：登录状态存哪
**背景**：小体积的身份标识（sessionId/token）适合放 cookie（自动随请求带、可设 HttpOnly 防 XSS）；大体积的本地缓存数据（如主题、草稿）放 localStorage。
**为什么**：cookie 每次请求都带，体积必须小；localStorage 容量大但不自动发送、且 JS 可读易遭 XSS。

### 场景 2：关闭浏览器后数据还在吗
**区别**：localStorage 关浏览器甚至关机都还在，需手动清；cookie 不设过期时间则关闭浏览器即失效，设了 Expires 才会持久。

### 场景 3：面试——为什么不用 cookie 存大体积数据
**要点**：cookie 单条约 4KB、每域约 20 条，且每次 HTTP 请求都自动携带，塞大体积会显著增大每个请求头部开销、拖慢网络。

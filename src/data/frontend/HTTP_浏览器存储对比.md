# 浏览器存储对比

## 【问题】
如果我把数据存储到 localStorage，和 Cookie 有什么区别？

## 【回答】
localStorage 和 Cookie 的区别主要体现在以下四个方面：

### 1. 存储容量
- **localStorage**：容量较大，一般为 5MB 左右（不同浏览器可能略有差异）
- **Cookie**：容量很小，每个 Cookie 一般不超过 4KB，每个域名下最多只能存储约 20 个 Cookie

### 2. 数据发送
- **localStorage**：数据仅在客户端存储，不会自动随 HTTP 请求发送到服务器
- **Cookie**：数据会自动附加到同域名的每个 HTTP 请求头中发送到服务器，会增加网络开销

### 3. 生命周期
- **localStorage**：持久化存储，数据会一直保留在浏览器中，除非用户手动清除或代码主动删除，否则不会过期
- **Cookie**：可以设置过期时间（Expires/Max-age），默认情况下是会话级别的，关闭浏览器后就会被删除

### 4. 安全性
- **localStorage**：
  - 容易受到 XSS（跨站脚本攻击）的威胁，因为 JavaScript 可以直接访问
  - 不能设置 HttpOnly 属性，无法防止客户端脚本访问
- **Cookie**：
  - 可以设置 `HttpOnly` 属性，防止 JavaScript 访问，降低 XSS 攻击风险
  - 可以设置 `Secure` 属性，只允许在 HTTPS 连接中传输
  - 可以设置 `SameSite` 属性，防止 CSRF（跨站请求伪造）攻击

## 【问题】
什么数据应该存到 cookie，什么数据存放到 Localstorage？

## 【回答】
Cookie 适合用于在客户端和服务器之间传递数据、跨域访问和设置过期时间，而 LocalStorage 适合用于在同一域名下的不同页面之间共享数据、存储大量数据和永久存储数据。

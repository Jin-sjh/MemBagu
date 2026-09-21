---
category: HTTP
topic: 浏览器存储对比
type: bagu
tags: [HTTP, 存储, Cookie, IndexedDB, WebStorage]
difficulty: medium
created: 2026-07-24
---
# 浏览器存储对比

## 【问题】
cookie / localStorage / sessionStorage 有什么区别？

## 【回答】

### 详细对比表格

| 特性 | cookie | localStorage | sessionStorage |
|------|--------|--------------|----------------|
| **存储大小** | 一般 4KB 左右 | 5-10MB | 5-10MB |
| **生命周期** | 可设置过期时间，默认关闭浏览器就失效 | 永久存储，除非手动删除 / 清空 | 仅当前会话，关闭标签页 / 浏览器即清除 |
| **是否随请求发送** | 是，每次 HTTP 请求都会携带 | 否，仅客户端存储 | 否，仅客户端存储 |
| **作用域** | 受域名和路径限制，支持子域名共享 | 同源（协议 + 域名 + 端口）内共享 | 同源内，但不同标签页不共享 |
| **API** | 原生 API 不友好，需手动解析 document.cookie | 简单的键值对 API（getItem/setItem） | 与 localStorage 相同 API |
| **常见用途** | 身份认证（sessionId、token）、用户偏好 | 本地持久化数据（如主题设置、缓存数据） | 临时会话数据（如表单草稿） |

### 安全性对比

- **cookie** 可以通过 `HttpOnly` 属性禁止 JS 读取，防范 XSS 偷取
- **localStorage/sessionStorage** 只能被同源页面的 JS 读取，容易被 XSS 攻击偷取，敏感数据不建议存这里

---

## 【问题】
请描述一下 sessionStorage 和 localStorage 的区别。

## 【回答】
sessionStorage 用于在本地存储一个会话中的数据，这些数据只有同一个会话中的页面才能访问，当会话结束后，数据也随之销毁。因此 sessionStorage 不是一种持久化的本地存储，仅仅是会话级别的存储。

而 localStorage 用于持久化本地存储，除非主动删除数据，否则数据是永远不会过期的。

---

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

---

## 【问题】
什么数据应该存到 cookie，什么数据存放到 Localstorage？

## 【回答】
Cookie 适合用于在客户端和服务器之间传递数据、跨域访问和设置过期时间，而 LocalStorage 适合用于在同一域名下的不同页面之间共享数据、存储大量数据和永久存储数据。

---

## 【问题】
浏览器多个标签之间如何通信？

## 【回答】
浏览器多个标签页之间通信主要有以下几种方式：可以使用 localStorage 或 sessionStorage，通过监听 storage 事件实现跨标签页同步；利用 BroadcastChannel 专门用于同源标签页之间广播消息；还可以通过 SharedWorker 共享线程实现数据互通；另外也能借助 Cookie 配合定时器轮询、打开新窗口时使用 window.postMessage 传递消息，或使用 IndexedDB 间接实现数据共享，其中同源限制是大部分方式的前提条件。

---

## 真实业务 / 面试场景（案例补充）

### 场景 1：登录 token 存 localStorage 被 XSS 偷走
**背景**：页面有 XSS 漏洞，攻击者 `localStorage.getItem('token')` 直接拿走，且 localStorage 关浏览器也不消失。
**解决**：敏感 token 放 `HttpOnly + Secure + SameSite` Cookie（JS 读不到），或只存内存 + 短时效 refresh token。

### 场景 2：多标签页同步表单草稿
**背景**：用户在 A 标签页填了一半，切到 B 标签页想接着看。
**解决**：用 `localStorage` + `storage` 事件，一个标签页写入、其他同源标签页监听到变化实时同步；sessionStorage 因标签页隔离做不到。

### 场景 3：cookie 太大拖慢请求
**为什么**：cookie 每次 HTTP 请求都自动带上，体积过大（如塞了多余字段）会白白增加每个请求的头部开销。
**解决**：只把必要的身份标识放 cookie，大体积数据放 localStorage 或不随请求发送的存储。

---

## 【问题】
IndexedDB 与 Cookie / localStorage / sessionStorage 有什么区别？什么时候用？

## 【回答】
四类存储的选择取决于**是否需要自动随请求发送、容量、生命周期和数据结构**。IndexedDB 与另外三者最大的区别是它提供**异步事务型结构化存储**，持久、支持事务和结构化数据，适合大量离线数据/缓存；而 Cookie/localStorage/sessionStorage 都是**同步字符串存储**，容量小、不适合大量结构化数据。

**Cookie 随请求自动携带，有网络成本**；localStorage 持久到清除；sessionStorage 是页面会话级（按 tab 隔离，特征需实测）；IndexedDB 适合离线缓存、草稿和大数据，但事务、版本升级和调试复杂度更高。Web Storage 同步读写大字符串可能阻塞主线程，Cookie 不适合存大数据因为会增加请求头体积。

---

## 【问题】
Cookie 的 HttpOnly / Secure / SameSite 属性分别有什么作用？

## 【回答】
`HttpOnly` **限制脚本读取，但不能阻止 XSS 本身**；`Secure` **要求通过 HTTPS 发送**；`SameSite` **控制跨站请求是否携带**，常见取值 Strict、Lax、None，其中 None 通常要求 Secure。

Cookie 仍会随符合条件的请求发送，因此还要考虑 CSRF、防护策略、域/路径和过期时间。敏感登录态通常优先评估 HttpOnly、Secure、合适 SameSite 的 Cookie；Token 放 localStorage 会暴露给能执行脚本的 XSS。没有脱离上下文的"绝对安全存储位置"。

---

## 【问题】
面试时怎么比较四类浏览器存储？

## 【回答】
不要只背容量数字，要从四个维度比较：**自动携带、同步/异步、容量、生命周期和安全风险**。

Cookie 随请求自动携带、同步、容量小、适合会话标识；localStorage 不同步携带、持久、适合非敏感偏好；sessionStorage 会话级、按 tab 隔离；IndexedDB 异步、结构化、适合大量离线数据。安全上 Cookie 可用 HttpOnly/Secure/SameSite 降低风险，而 Web Storage 易被 XSS 读取，敏感 Token 不应放 localStorage。验证用 Application 面板看作用域/过期/SameSite，Network 看 Cookie 是否随请求发送。

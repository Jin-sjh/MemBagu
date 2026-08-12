---
category: HTTP
topic: Token 认证机制详解
type: bagu
tags: [HTTP]
difficulty: medium
created: 2026-07-24
---
# HTTP_Token 认证机制详解

## 1. Token 的作用

## 【问题】
Token 的作用是什么？

## 【回答】
Token 是服务端生成的一串加密字符串，主要用于**用户身份认证和接口权限校验**。用户登录成功后，后端会生成并返回 Token，前端后续每次请求都带上它，后端验证通过后就知道是哪个用户在操作，不用每次都输账号密码，同时也能控制接口访问权限。

---

## 2. Token 的生成方

## 【问题】
Token 是前端生成还是后端生成？

## 【回答】
**Token 由后端生成**。前端只负责接收、存储和请求时携带，生成、签名、加密、过期校验这些逻辑都在后端处理，保证安全性。

---

## 3. Token 与 Cookie 的配合使用

## 【问题】
Token 要和 Cookie 配合使用吗？

## 【回答】
**不是必须配合**。传统是 Cookie+Session，现在常用 JWT 存在 localStorage 里，通过请求头传递，不依赖 Cookie。当然也可以把 Token 存在 HttpOnly Cookie 里，进一步提高安全性。

---

## 4. Token 解决的安全问题

## 【问题】
Token 主要解决什么安全问题？

## 【回答】
核心解决**CSRF 跨站请求伪造**。因为 CSRF 是利用浏览器自动带 Cookie 的特性伪造请求，而 Token 不会被自动携带，必须前端主动带上，非法网站拿不到 Token，就无法伪造请求，从而防御 CSRF。

---

## 真实业务 / 面试场景（案例补充）

### 场景 1：token 存 localStorage 被 XSS 偷走
**背景**：页面有 XSS 漏洞，攻击者脚本 `localStorage.getItem('token')` 直接拿走。
**解决**：敏感 token 放 `HttpOnly + Secure + SameSite` Cookie（JS 读不到），或存内存 + 短时效 refresh token。

### 场景 2：用户退出登录，JWT 却还能用
**为什么**：JWT 无状态、服务端不存，过期前一直有效，无法主动吊销。
**解决**：引入 refresh token + 服务端黑名单（Redis），或改用 Session+Cookie 以便随时吊销。

### 场景 3：分布式系统用 Session 怎么共享
**为什么**：多台应用服务器各存各的 session，负载均衡一换机器就掉登录。
**解决**：session 集中存 Redis，或干脆用无状态 JWT（但需接受"无法即时吊销"的代价）。

### 场景 4：Token 为什么能防 CSRF
**要点**：CSRF 借的是浏览器"自动带 Cookie"；而 Token 靠前端主动放进请求头，跨站请求拿不到也带不上，自然防住伪造。

---

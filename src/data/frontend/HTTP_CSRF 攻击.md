---
category: HTTP
topic: CSRF 攻击
type: bagu
tags: [HTTP]
difficulty: hard
created: 2026-07-24
---
# CSRF 攻击

## 6.2 CSRF 攻击与防御

### 6.2.1 攻击原理

## 【问题】CSRF 攻击是什么？

## 【回答】
**定义**：跨站请求伪造（Cross-Site Request Forgery），利用用户已认证的身份执行非预期操作

**攻击流程**：
a. 用户登录 A 网站，获取 Cookie
b. 在未登出 A 网站的情况下，访问恶意网站 B
c. B 网站向 A 网站发送请求，利用用户的 Cookie 身份

## 【问题】CSRF 跨站点请求伪造？

## 【回答】
CSRF：跨站点请求伪造，其原理是攻击者构造网站后台某个功能接口的请求地址，有道用户去点击或者用特殊方法让该请求地址自动加载。用户在登录状态下这个请求被服务端接收后会被误以为是用户的合法的操作。对于 GET 形式的接口地址可轻易被攻击，对于 POST 形式的接口地址也不是百分百安全，攻击者可以诱导用户进入待 FORM 表单可有的 POST 方式提交参数的页面。

### 6.2.2 防御措施

## 【问题】CSRF 的攻击原理是什么？

## 【回答】
CSRF（跨站请求伪造）的攻击原理：

- **诱导用户**：诱导用户在已登录的网站上访问恶意网站
- **利用登录状态**：利用用户已登录的状态（浏览器自动携带 Cookie）
- **发送伪造请求**：向目标网站发送伪造请求（如转账、改密码等敏感操作）

**核心机制**：利用浏览器自动携带 Cookie 的特性，冒充用户身份发起请求。

---

## 【问题】解决 CSRF 攻击的方法有哪些？

## 【回答】

### 1. CSRF Token（最常用）
- 服务器生成一个随机 Token，存在用户 session 中，同时下发给前端（如表单隐藏字段、请求头）
- 每次请求敏感操作时，前端必须携带该 Token，服务器校验 Token 是否与 session 中的一致，不一致则拒绝请求

```javascript
// 前端请求携带 token
fetch('/api/action', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
  },
  body: JSON.stringify(data)
});
```

### 2. SameSite Cookie 属性
- 设置 `SameSite=Strict` 或 `SameSite=Lax`，限制 Cookie 跨站发送，让恶意网站无法携带用户 Cookie 发起请求
- 现代浏览器都支持，是 CSRF 防御的重要手段

```
Set-Cookie: sessionid=abc123; SameSite=Strict; Secure; HttpOnly
```

### 3. Referer/Origin 校验
- 服务器校验请求头的 `Referer` 或 `Origin` 是否为受信任的域名
- **缺点**：部分浏览器可伪造 Referer，或用户隐私设置会导致 Referer 为空，有一定局限性

```javascript
// 服务器端验证
if (req.headers.referer && req.headers.referer.startsWith('https://example.com')) {
  // 处理请求
} else {
  // 拒绝请求
}
```

### 4. 敏感操作增加二次验证
- 比如转账、改密码时，要求用户输入验证码、短信验证
- 即使请求被伪造，也无法通过二次验证

## 【问题】如何防范 CSRF 攻击？

## 【回答】
要完成一次 CSRF 攻击，受害者必须依次完成两个步骤：

（1）登录受信任网站 A，并在本地生成 cookie。

（2）在不登出 A 的情况下，访问危险网站 B。

防范服务器端的 CSRF 攻击有很多种方法，但总的思想都是一致的，就是在客户端页面中增加伪随机数。

## 【问题】你所了解的 Web 攻击技术有哪些？

## 【回答】
（1）**XSS 攻击**：通过存在安全漏洞的 Web 网站，注册到用户的浏览器内，渲染非法的 HTML 标签或者运行非法的 JavaScript 进行攻击的一种行为。

（2）**SQL 注入攻击**：通过把 SQL 命令插入 Web 表单、输入域名或页面请求的查询字符串中，最终达到欺骗服务器执行恶意的 SQL 命令。

（3）**CSRF 攻击**：攻击者通过设置陷阱，强制对已完成的认证用户进行非预期的个人信息或设定信息等状态的更新。

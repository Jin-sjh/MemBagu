---
category: HTTP
topic: CSRF 攻击
type: bagu
tags: [HTTP, CSRF, 跨站请求伪造, 前端安全, SameSite]
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

---

## 【问题】
一次 CSRF 攻击成立需要满足哪些条件？

## 【回答】
CSRF 成立通常需要同时满足：1. **用户已登录**目标站点；2. **凭证会自动携带**（浏览器自动带上 Cookie）；3. **攻击者能诱导用户发起请求**（如诱导点击、自动加载图片/form）；4. **服务端仅凭该凭证就执行有副作用的操作，且缺少来源校验**。只要切断任意一环就能防御——这也是 Token、SameSite、Origin 校验各自的作用点。

---

## 【问题】
JWT 能天然防御 CSRF 吗？

## 【回答】
**JWT 并不天然防 CSRF**，要看它存在哪里：
- 若 JWT 放在 **Cookie** 里，浏览器同样会**自动携带**，普通跨站请求依旧能带上凭证，CSRF 风险仍在。
- 若 JWT 放在 **Authorization Header** 里，普通跨站表单/图片不会自动附带它，因此这种用法下 CSRF 风险较低；但一旦存在 **XSS 或 Token 泄漏**，攻击者可自行读取并附带 Token，风险转移而非消失。
结论：CSRF 防护不能依赖"用了 JWT"，仍需 SameSite/Token/来源校验。

---

## 【问题】
CSRF 和 CORS 有什么区别？

## 【回答】
两者关注点完全不同：
- **CSRF（跨站请求伪造）**：关注**利用用户凭证执行有副作用的请求**（写操作），问题在"请求被伪造执行"。
- **CORS（跨源资源共享）**：关注**脚本能否读取跨源响应**（读操作），是浏览器对跨域读响应的权限控制。
一个控制"能不能发/执行"，一个控制"能不能读回结果"，不能互相替代。防御 CSRF 靠 Cookie SameSite、CSRF Token、Origin 校验和正确权限设计。

---

## 【问题】
面试时怎么答 CSRF 的攻击与防御？

## 【回答】
我会先讲攻击原理：CSRF 利用浏览器**自动携带 Cookie** 的特性，诱导已登录用户向目标站点发起其不知情的有副作用请求。再讲防御组合：**CSRF Token**（把随机值绑定会话，服务端校验）、**SameSite Cookie**（限制跨站携带）、**Origin/Referer 校验**（来源信号）、敏感操作加**二次验证**。最后补充：CSRF 与 CORS 不同（前者防副作用执行、后者控跨源读取），JWT 放 Cookie 时同样不防 CSRF，要用跨站表单/fetch 和不同 Cookie 属性做集成测试验证。

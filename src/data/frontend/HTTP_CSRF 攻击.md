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

## 【问题】解决 CSRF 攻击的方法有哪些？

## 【回答】

**1. Token 验证：**

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

**2. SameSite Cookie：**

```
Set-Cookie: sessionid=abc123; SameSite=Strict; Secure; HttpOnly
```

**3. Referer 验证：**

```javascript
// 服务器端验证
if (req.headers.referer && req.headers.referer.startsWith('https://example.com')) {
  // 处理请求
} else {
  // 拒绝请求
}
```

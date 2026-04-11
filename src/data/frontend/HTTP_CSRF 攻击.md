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

# Cookie 的属性和含义

## 【问题】
Cookie 有哪些属性？各属性的含义是什么？

## 【回答】
属性分别有**Name**、**Value**、**Domain**、**Path**、**Expires/Max-age**、**Size**、**HttpOnly**、**Secure**、**SameSite**。

- **name、value**：就是键值对

- **Domain**：决定 cookie 在哪个域是有效的。Domain 设置是对子域有效，设置这个可以让非同源的共享 cookie

- **Path**：有效路径，也对子路径生效

- **Expires/Max-age**：
  - Expires 和 Max-age 均为 Cookie 的有效期
  - **Expires** 是该 Cookie 被删除时的时间戳，格式为 GMT。若设置为以前的时间，则该 Cookie 立刻被删除，并且该时间戳是服务器时间，不是本地时间！若不设置则默认页面关闭时删除该 Cookie
  - **Max-age** 也是 Cookie 的有效期，但它的单位为秒，即多少秒之后失效。若 Max-age 设置为 0，则立刻失效；设置为负数，则在页面关闭时失效。Max-age 默认为 -1

- **Size**：是此 cookie 的大小。任何 cookie 大小超过限制都被忽略，且永远不会被设置

- **HttpOnly**：值为 true 或 false。若设置为 true，则不允许通过脚本 document.cookie 去更改这个值，同样这个值在 document.cookie 中也不可见，但在发送请求时依旧会携带此 Cookie

- **SameSite**：用来限制第三方 cookie。在 Cookie 中设置 SameSite 属性可以限制 Cookie 的发送范围以此来防止 CSRF 攻击，有三个属性：
  - **Strict**：任何情况都不发送
  - **Lax**：大多数情况也是不发送第三方 Cookie，但是导航到目标网址的 Get 请求除外
  - **None**：关闭

> 对于浏览器而言，"导航到目标网址的 GET 请求"意味着在浏览器中通过输入目标网址或通过编程方式，向目标网址发送一个 HTTP GET 请求，以获取该网址的内容并显示在浏览器窗口中。

## 【问题】
简述 Cookie + Session 的工作流程、特点及存在的问题

## 【回答】
**流程：**
a. 用户登录时，后端校验用户名/密码。
b. 校验成功后，服务端生成 Session 并存储在内存或 Redis 中，同时在 Cookie 中写入 Session ID。
c. 每次请求带上 Cookie，后端通过 Session ID 查找用户信息。

**特点：** 适用于传统多页面应用，安全性依赖 Cookie 配置（HttpOnly、Secure、SameSite）。

**问题：** 分布式环境下需要共享 Session（如 Redis 集群）。

---

## 【问题】
简述 Token (JWT) 的工作流程、特点及存在的问题

## 【回答】
**流程：**
a. 用户登录后，后端签发 JWT（包含用户 ID、角色等信息）。
b. 前端将 JWT 存储在 LocalStorage 或 Cookie 中，并在请求头 `Authorization: Bearer <token>` 传递。
c. 后端验证签名和过期时间，确认身份。

**特点：** 前后端分离常用方式，服务端无状态，易扩展。

**问题：** JWT 体积大，过期前不可撤销，需要配合 **黑名单机制** 或 **短有效期 + Refresh Token**。

---

## 【问题】
如何避免 cookie 信息被盗取？

## 【回答】
首先，避免直接在 cookie 中泄露用户隐私，例如 E-mail、密码等。

其次，使 cookie 和系统 ip 绑定，降低 cookie 泄露后的危险。这样攻击者得到的 cookie 没有实际价值，不可能拿来重放。如果网站不需要在浏览器端对 cookie 进行操作，可以在 Set-Cookie 末尾加上 HttpOnly 防止 JavaScript 代码直接获取 cookie。

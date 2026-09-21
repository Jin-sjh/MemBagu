---
category: HTTP
topic: Cookie 和 Session 的区别
type: bagu
tags: [HTTP, Cookie, Session, JWT, 鉴权, 安全]
difficulty: medium
created: 2026-07-24
---
# Cookie 和 Session 的区别

## 【问题】
cookie 和 session 有什么区别？

## 【回答】
Cookie 和 Session 都是 Web 开发中用于跟踪用户状态的技术，但它们在存储位置、数据容量、安全性以及生命周期等方面存在显著差异：

- **存储位置：**Cookie 的数据存储在客户端（通常是浏览器）。当浏览器向服务器发送请求时，会自动附带 Cookie 中的数据。Session 的数据存储在服务器端。服务器为每个用户分配一个唯一的 Session ID，这个 ID 通常通过 Cookie 或 URL 重写的方式发送给客户端，客户端后续的请求会带上这个 Session ID，服务器根据 ID 查找对应的 Session 数据。

- **数据容量：**单个 Cookie 的大小限制通常在 4KB 左右，而且大多数浏览器对每个域名的总 Cookie 数量也有限制。由于 Session 存储在服务器上，理论上不受数据大小的限制，主要受限于服务器的内存大小。

- **安全性：**Cookie 相对不安全，因为数据存储在客户端，容易受到 XSS（跨站脚本攻击）的威胁。不过，可以通过设置 HttpOnly 属性来防止 JavaScript 访问，减少 XSS 攻击的风险，但仍然可能受到 CSRF（跨站请求伪造）的攻击。Session 通常认为比 Cookie 更安全，因为敏感数据存储在服务器端。但仍然需要防范 Session 劫持（通过获取他人的 Session ID）和会话固定攻击。

- **生命周期：**Cookie 可以设置过期时间，过期后自动删除。也可以设置为会话 Cookie，即浏览器关闭时自动删除。Session 在默认情况下，当用户关闭浏览器时，Session 结束。但服务器也可以设置 Session 的超时时间，超过这个时间未活动，Session 也会失效。

- **性能：**使用 Cookie 时，因为数据随每个请求发送到服务器，可能会影响网络传输效率，尤其是在 Cookie 数据较大时。使用 Session 时，因为数据存储在服务器端，每次请求都需要查询服务器上的 Session 数据，这可能会增加服务器的负载，特别是在高并发场景下。

## 【问题】
如果客户端禁用了 cookie，session 还能用吗？

## 【回答】
默认情况下禁用 Cookie 后，Session 是无法正常使用的，因为大多数 Web 服务器都是依赖于 Cookie 来传递 Session 的会话 ID 的。

客户端浏览器禁用 Cookie 时，服务器将无法把会话 ID 发送给客户端，客户端也无法在后续请求中携带会话 ID 返回给服务器，从而导致服务器无法识别用户会话。

但是，有几种方法可以绕过这个问题，尽管它们可能会引入额外的复杂性和/或降低用户体验：

1. **URL 重写：**每当服务器响应需要保持状态的请求时，将 Session ID 附加到 URL 中作为参数。例如，原本的链接 http://example.com/page 变为 http://example.com/page;jsessionid=XXXXXX，服务器端需要相应地解析 URL 来获取 Session ID，并维护用户的会话状态。这种方式的缺点是 URL 变得不那么整洁，且如果用户通过电子邮件或其他方式分享了这样的链接，可能导致 Session ID 的意外泄露。

2. **隐藏表单字段：**在每个需要 Session 信息的 HTML 表单中包含一个隐藏字段，用来存储 Session ID。当表单提交时，Session ID 随表单数据一起发送回服务器，服务器通过解析表单数据中的 Session ID 来获取用户的会话状态。这种方法仅适用于通过表单提交的交互模式，不适合链接点击或 Ajax 请求。

## 【问题】
cookie 和 session 的区别是什么？

## 【回答】
区别如下。

（1）cookie 数据存放在客户的浏览器上，session 数据存放在服务器上。

（2）cookie 不是很安全，别人可以分析存放在本地的 cookie 并进行 cookie 欺骗。考虑到安全问题应当使用 session。

（3）session 会在一定时间内保存在服务器上。当访问增多时，会占用较多服务器的资源。为了减轻服务器的负担，应当使用 cookie。

（4）单个 cookie 保存的数据不能超过 4KB，很多浏览器都限制一个站点最多保存 20 个 cookie。

所以个人建议可以将登录信息等重要信息存放在 session 中，其他信息（如果需要保留）可以存放在 cookie 中。

---

## 【问题】
Cookie、Session、JWT 三者是什么关系，为什么说它们不是互斥技术？

## 【回答】
**Cookie 是浏览器携带的小型状态载体**，**Session 是服务端保存会话状态的方案**，**JWT 是自包含的签名令牌格式**；三者不是同一层面的互斥技术。典型关系：登录后服务端创建 Session 或签发 JWT，Session ID/JWT 通过 Cookie 或 Authorization 传递，服务端验证并决定身份/权限。Cookie 只是传输载体；Session ID 放 Cookie 中时服务端用 ID 查状态；JWT 由 header/payload/signature 组成，签名可验证完整性，但 **payload 默认不是加密内容**。

---

## 【问题】
Session + Cookie 和 JWT 该怎么选型？

## 【回答】
**Session + HttpOnly Cookie 优点是可撤销、敏感凭证不暴露给 JS**，缺点服务端需存状态/共享存储；**JWT 优点是服务端验证自包含、跨服务方便**，缺点是撤销困难、令牌泄漏影响大、体积大；Access + Refresh Token 短 access 降低暴露窗口，但刷新、轮换、撤销和并发复杂。**JWT 并不"完全无状态"**：签发、密钥、撤销、刷新和权限数据仍需服务端管理。

---

## 【问题】
退出登录时只删除客户端 JWT 够吗？

## 【回答】
不够：**已签发的 JWT 在过期前可能仍有效**，需要短过期、撤销列表、版本号或刷新令牌轮换等策略。JWT 的 **payload 默认不是加密内容，不能放敏感秘密**。

---

## 【问题】
HttpOnly Cookie 能防住 XSS 和 CSRF 吗？

## 【回答】
**HttpOnly Cookie 能降低脚本直接读取凭证的风险，但不能消除 XSS，也不能自动防 CSRF**；SameSite、CSRF Token、Origin 校验和正确授权仍需配合。选择时看撤销需求、跨服务、客户端类型、XSS/CSRF 风险和运维复杂度，而不是只说 JWT 更先进。

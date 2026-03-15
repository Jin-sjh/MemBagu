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

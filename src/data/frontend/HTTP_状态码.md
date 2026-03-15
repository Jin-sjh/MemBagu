# HTTP 状态码

## 5. HTTP 状态码

### 【问题】
HTTP 状态码有哪些类别，分别代表什么意思

### 【回答】

**1xx（信息性状态码）：** 表示请求已被接收，继续处理。
- 例如：100 Continue

**2xx（成功状态码）：** 表示请求已成功处理。
- 例如：200 OK、201 Created

**3xx（重定向状态码）：** 表示请求需要进一步的操作（如跳转）。
- 例如：301 Moved Permanently、302 Found

**4xx（客户端错误状态码）：** 表示请求有错误，由客户端引起。
- 例如：400 Bad Request、404 Not Found、403 Forbidden

**5xx（服务器错误状态码）：** 表示服务器在处理请求时发生错误。
- 例如：500 Internal Server Error、502 Bad Gateway

---

## 详细状态码列表

### 【问题】
常见的 HTTP 状态码具体有哪些，各自的含义是什么

### 【回答】

**1xx 信息类**
- 100 Continue：可以继续发送

**2xx 成功**
- 200 OK：请求成功
- 201 Created：创建成功（POST/PUT）
- 204 No Content：成功但无返回体

**3xx 重定向**
- 301 永久重定向
- 302 临时重定向
- 304 Not Modified：使用缓存（协商缓存）

**4xx 客户端错误**
- 400 Bad Request：参数错误
- 401 Unauthorized：未登录 / 认证失败
- 403 Forbidden：权限不足
- 404 Not Found：资源不存在
- 405 Method Not Allowed：请求方法不对
- 429 Too Many Requests：请求太频繁

**5xx 服务器错误**
- 500 Internal Server Error：服务器报错
- 502 Bad Gateway：网关错误
- 503 Service Unavailable：服务不可用 / 过载
- 504 Gateway Timeout：网关超时

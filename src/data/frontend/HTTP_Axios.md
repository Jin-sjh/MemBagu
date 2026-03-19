# Axios 详解

## 1. Axios 是什么？解决了什么问题？

### 【问题】
Axios 是什么？解决了什么问题？

### 【回答】
Axios 是一个基于 Promise 的 HTTP 客户端，支持浏览器和 Node.js，对原生 XHR / http 模块进行了封装，提供了统一的请求 API、拦截器机制、自动转换数据、请求取消、并发控制等能力，适合在工程化前端项目中使用。

### 【隐含加分点】
- 浏览器端：基于 XMLHttpRequest
- Node 端：基于 http / https 模块
- 核心目标：统一请求层、可扩展、可维护

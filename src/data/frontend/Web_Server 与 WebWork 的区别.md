---
category: Web
topic: Server 与 WebWork 的区别
type: bagu
tags: [Web]
difficulty: easy
created: 2026-07-24
---
## 【问题】
Web Server 与 WebWork 的区别是什么？

## 【回答】
## Web Server 与 WebWork 区别（精简总结）

### 1. Web Server

- 属于**服务器软件 / 基础设施**
- 负责处理 HTTP 请求、返回静态资源、转发请求
- 代表：Nginx、Apache、Tomcat

### 2. WebWork

- 属于**Java Web MVC 开发框架**
- 负责业务逻辑、URL 路由、Action 处理、页面渲染
- 运行在 Web 服务器 / 容器之上

### 3. 核心关系

- Web Server 是**运行环境**
- WebWork 是**运行在环境里的应用框架**
- 一个管网络通信，一个管业务代码

---

## 真实业务 / 面试场景（案例补充）

### 场景 1：部署架构里谁在前谁在后
**背景**：一个 Java Web 应用上线。
**解决**：前面是 Nginx（Web Server，处理 HTTP、静态资源、反向代理、负载均衡），后面跑 WebWork（Java Web MVC 框架，写业务逻辑、URL 路由、页面渲染）。一个管"通信和入口"，一个管"业务代码"。

### 场景 2：面试——容易把 Nginx 和 Web 框架搞混
**要点**：Web Server（Nginx/Apache/Tomcat）是"服务器软件/运行环境"，负责接请求、转发、静态资源；WebWork 是"跑在容器里的应用框架"，负责业务。两者是"环境和应用"的关系。

### 场景 3：注意别和前端的 Web Worker 混淆
**提示**：这里的 WebWork 是 Java 服务端 MVC 框架；前端的 Web Worker 是浏览器多线程技术，二者名字像但完全不是一回事，面试/文档里要区分清楚。

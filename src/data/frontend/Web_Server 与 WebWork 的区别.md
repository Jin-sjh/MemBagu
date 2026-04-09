【问题】
Web Server 与 WebWork 的区别是什么？

【回答】
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

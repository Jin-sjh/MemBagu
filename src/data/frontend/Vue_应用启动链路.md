---
category: Vue
topic: 应用启动链路
type: bagu
tags: [Vue, 启动链路, Vite, SFC, createApp, 挂载, 前端工程化]
difficulty: medium
created: 2026-09-21
---
# 应用启动链路

## 【问题】
Vue 应用从浏览器打开到运行的整体启动链路是什么？

## 【回答】
整体链路：

```text
浏览器请求
  ↓
根目录 index.html（type="module"）
  ↓
src/main.ts
  ↓ createApp(App)
App.vue
  ↓
组件树 / Router / Store
  ↓
Vue 运行时渲染到 #app
```

浏览器先加载 Vite 入口 `index.html`，通过 ES Module 请求 `main.ts`；Vite 把 TS 和 `.vue` 转成浏览器可执行的 JS/CSS，`main.ts` 创建应用并把根组件 `App.vue` 挂载到 `#app`。

注意：**浏览器原生不认识 `.vue` 文件**，它只执行 HTML/CSS/JS，`.vue` 需由 Vite 和 SFC 编译器处理。

---

## 【问题】
.vue 单文件组件是如何变成可执行代码的？

## 【回答】
开发环境中浏览器请求 `main.ts`，继续请求依赖的 `App.vue`。Vite 调用 `@vitejs/plugin-vue` 与 `@vue/compiler-sfc` 解析 SFC：

```text
App.vue
  ↓ @vitejs/plugin-vue + compiler-sfc
  ├─ <script setup> → JavaScript 模块
  ├─ <template> → render 函数
  └─ <style> → CSS 模块
  ↓
浏览器执行 JS + CSS，Vue 创建组件实例并渲染 DOM
```

模板会被编译成 **render 函数**，不是由浏览器直接理解插值语法。生产构建还会压缩、代码分割、资源指纹和兼容处理。

---

## 【问题】
main.ts 和 App.vue 分别负责什么？

## 【回答】
- **main.ts**：应用装配入口，负责**创建应用、注册插件（Router/Pinia 等）、挂载**到 `#app`，适合启动装配，不适合放页面接口或表单逻辑。
- **App.vue**：组件树根节点，常见职责是应用壳、全局布局和 `<RouterView />`。

`createApp(App)` 不会立即渲染所有页面；路由懒加载、条件渲染和异步组件会影响后续请求。`mount('#app')` 要求 HTML 中存在匹配容器，否则无法正确挂载。

---

## 【问题】
为什么 index.html 放在根目录而不是 src？

## 【回答】
Vite 默认把**项目根目录的 `index.html`** 当作应用入口，提供挂载容器 `#app`，并通过 `type="module"` 把加载链路交给 `main.ts`。

`src/` 主要承载应用源码模块，不是 Vite 默认的 HTML 入口目录。`index.html` 在 Vite 中是可参与处理的应用入口，并非普通 `public` 文件。

---

## 【问题】
Vite 在这条链路里做什么？server.proxy 能解决线上跨域吗？

## 【回答】
Vite 位于链路旁：**开发时**按需解析和转换模块（TS、`.vue`、资源）；**生产时**构建优化后的静态资源（压缩、分割、指纹）。

`server.proxy` 只是**开发服务器转发能力，不等于生产环境的跨域方案**；线上跨域需要网关、Nginx 或服务端配置。

---

## 【问题】
面试时怎么答 Vue 应用启动链路？

## 【回答】
Vue 应用从根目录 `index.html` 开始，HTML 通过 `type="module"` 引入 `main.ts`。`main.ts` 创建 Vue 应用、注册 Router/Pinia 等插件，并把 `App.vue` 挂载到 `#app`。

**浏览器本身不认识 `.vue`**，开发时由 Vite 和 Vue 插件把 SFC 转成 JS/CSS，生产环境再构建成静态资源。`main.ts` 是装配入口，`App.vue` 是组件树根节点；`server.proxy` 只属开发服务器，线上需网关/Nginx。

---

---
category: Vue
topic: Router_导航守卫
type: bagu
tags: [Vue, 路由, 前端路由, SPA, Hash模式, History模式]
difficulty: easy
created: 2026-07-24
---
# Vue Router 导航守卫

## 【问题】

vue-router 有哪些导航守卫？分别属于哪一类？

## 【回答】

导航守卫分为三类：

- **全局守卫**：`beforeEach`、`beforeResolve`、`afterEach`

- **路由独享守卫**：`beforeEnter`

- **组件内守卫**：`beforeRouteEnter`、`beforeRouteUpdate`、`beforeRouteLeave`

## 【问题】

完整的路由跳转时，守卫的执行顺序是？

## 【回答】

1. 触发路由跳转
2. 全局 `beforeEach`
3. 组件内 `beforeRouteEnter`
4. 路由独享 `beforeEnter`
5. 解析异步路由组件
6. 全局 `beforeResolve`
7. 导航确认完成
8. 全局 `afterEach`
9. 组件生命周期（`created`/`mounted` 等）

---

## 真实业务 / 面试场景（案例补充）

### 场景 1：全局 beforeEach 做登录鉴权
**背景**：未登录访问 `/order` 应跳登录页。
**怎么用**：在 `router.beforeEach((to, from, next) => { if (to.meta.requiresAuth && !store.token) next('/login'); else next(); })` 里拦截。**注意一定要调 `next()`，否则路由会卡死（转圈）**。

### 场景 2：beforeRouteLeave 防误触丢数据
**背景**：表单页用户填了一半点关闭 / 跳转。
**怎么用**：组件内 `beforeRouteLeave(to, from, next) { if (this.isDirty && !confirm('确定离开？未保存内容会丢失')) next(false); else next(); }`，用浏览器确认框拦住误触。

### 场景 3：beforeRouteEnter 里拿不到 this
**为什么**：进入路由时组件实例还没创建，`this` 是 `undefined`。要用 `next(vm => { vm.xxx })` 回调，组件创建后才会执行，通过 `vm` 拿到实例。

---

## 【问题】
Vue Router 的 Hash 模式和 History 模式有什么区别？

## 【回答】
- **Hash 模式**：依赖 `#`，通常不向服务器发送 hash，兼容、fallback 简单。
- **History 模式**：使用 `pushState`/`replaceState` 和 `popstate`，URL 更自然，但**服务器必须把未知路径 fallback 到入口**，否则刷新可能 404。

两者都在 SPA 中通过地址改变切换视图，避免整页刷新。

---

## 【问题】
pushState 和 popstate 有什么区别？

## 【回答】
- **`pushState`**：只修改历史和地址，**不触发整页导航**。
- **`popstate`**：响应浏览器前进/后退，但**不是每次 `pushState` 都自动触发**。

即调用 `pushState` 改 URL 时，不会自动派发 `popstate`；只有用户的前进后退或 `history.back/forward` 才会触发。

---

## 【问题】
History 模式下刷新页面为什么可能 404？怎么解决？

## 【回答】
History 模式 URL 没有 `#`，刷新时浏览器会向服务器请求该真实路径；若服务器没有把**未知路径 fallback 到入口 HTML**，就返回 404。

解决：服务器（Nginx / 网关 / 静态托管）配置 **history fallback**，把所有非资源路径都重写到 `index.html`。

---

## 【问题】
路由懒加载是什么？和 fallback 有什么关系？

## 【回答】
动态路由、嵌套路由、路由守卫和**懒加载**用于大应用拆分。懒加载通过**动态 `import`** 延迟路由代码，改善首屏，但要处理**加载失败和 chunk 缓存**。

懒加载影响的是代码分割与首屏体积，与 History 的服务器 fallback 是两条独立关注点，但生产环境两者都要配置正确。

---

## 【问题】
面试时怎么答 Vue Router？

## 【回答】
Vue Router 根据当前 URL **匹配路由记录**，执行守卫并渲染对应组件。**Hash 兼容性好但 URL 带锚点**；**History URL 自然但需要服务器 fallback**。

`pushState` 不刷新页面，`popstate` 处理历史导航；懒加载通过动态 `import` 延迟路由代码，改善首屏但要处理加载失败和 chunk 缓存。守卫应处理认证和跳转，不要把所有业务请求塞入全局守卫造成导航阻塞。

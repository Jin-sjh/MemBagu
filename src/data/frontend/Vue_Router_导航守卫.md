---
category: Vue
topic: Router_导航守卫
type: bagu
tags: [Vue]
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

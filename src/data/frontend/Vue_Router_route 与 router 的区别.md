---
category: Vue
topic: Router_route 与 router 的区别
type: bagu
tags: [Vue]
difficulty: easy
created: 2026-07-24
---
# Vue Router 中 route 与 router 的区别

## 【问题】

Vue Router 中 route 与 router 有什么区别？

## 【回答】

### 1. 本质不同

- route 是当前路由信息对象，只读；
- router 是 Vue Router 的全局路由实例对象。

### 2. 作用不同

- route 用来获取路由信息，如 path、query、params、meta 等；
- router 用来执行路由操作，如 push、replace、go、back 等跳转方法。

---

## 真实业务 / 面试场景（案例补充）

### 场景 1：组件内取参数 vs 做跳转
**背景**：在商品详情页，要拿到 URL 上的 `?id=123`，又要点击"去下单"跳到订单页。
**解决**：用 `this.$route.query.id`（`route` 只读对象，拿当前路由信息）；用 `this.$router.push('/order')`（`router` 实例，执行跳转）。一个读、一个写，职责分明。

### 场景 2：在导航守卫里为什么用 router 而不是 route
**背景**：全局 `beforeEach` 里要拦截未登录用户。
**解决**：守卫回调接收的是 `to`/`from`（都是 route 对象，表示"目标/来源路由信息"），但真正做跳转要用 `router` 实例（`next('/login')` 或 `router.push`）。

### 场景 3：面试——route 和 router 一句话区分
**要点**：`route` 是当前路由的"信息快照"（path/query/params/meta，只读）；`router` 是全局路由"控制实例"（push/replace/go，可读写操作）。

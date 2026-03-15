# Vue Router 导航守卫

## 1. 问：vue-router 有哪些导航守卫？分别属于哪一类？

### 答：

导航守卫分为三类：

- **全局守卫**：`beforeEach`、`beforeResolve`、`afterEach`

- **路由独享守卫**：`beforeEnter`

- **组件内守卫**：`beforeRouteEnter`、`beforeRouteUpdate`、`beforeRouteLeave`

## 2. 问：完整的路由跳转时，守卫的执行顺序是？

### 答：

1. 触发路由跳转
2. 全局 `beforeEach`
3. 组件内 `beforeRouteEnter`
4. 路由独享 `beforeEnter`
5. 解析异步路由组件
6. 全局 `beforeResolve`
7. 导航确认完成
8. 全局 `afterEach`
9. 组件生命周期（`created`/`mounted` 等）

---
category: Webpack
topic: 热更新原理
type: bagu
tags: [Webpack]
difficulty: easy
created: 2026-07-24
---
# Webpack 热更新原理

## 【问题】
Webpack 热更新原理是什么？

## 【回答】
**热模块替换（HMR）** 允许在不刷新页面的情况下更新模块。

**原理：**

i. Webpack 监控文件的变化。

ii. 当发生变化时，Webpack 会将更新的模块发送到客户端。

iii. 客户端接收更新并通过 HMR API 替换更新的模块。

---

## 真实业务 / 面试场景（案例补充）

### 场景 1：改 CSS 秒更、改 JS 却整页刷新
**背景**：开发时改样式实时生效，但改某个 JS 模块整个页面刷新、状态丢失。
**为什么**：HMR 默认对 CSS 支持好（样式热替换无状态）；JS 模块要"热替换"需在模块边界写 `module.hot.accept`，否则 Webpack 找不到可复用的热更新边界，只能回退到整页 live reload。

### 场景 2：热更新"失效"排查
**为什么 / 怎么做**：常见三种——① 没开 `hot: true`；② Babel 把 `import` 编译成 `require` 破坏了 ES Module 的 HMR 边界；③ 模块有副作用且没写 `accept` 回调保留状态。排查先看终端 HMR 日志，再看是否命中 `accept`。

### 场景 3：面试——HMR 和 live reload 区别
**回答要点**：live reload 是文件一变就整体刷新页面、丢状态；HMR 是只替换变更的模块、保留应用状态（如表单输入不丢），体验更好，依赖 Webpack 的模块热替换 API + 客户端 HMR runtime。

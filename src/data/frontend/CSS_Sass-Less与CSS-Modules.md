---
category: CSS
topic: Sass-Less与CSS-Modules
type: bagu
tags: [CSS, Sass, Less, PostCSS, CSS Modules, Scoped CSS, 样式隔离]
difficulty: medium
created: 2026-09-21
---
# Sass-Less与CSS-Modules

## 【问题】
Sass / Less 预处理器解决了什么问题

## 【回答】
**Sass / Less 提供变量、嵌套、mixin 等预处理能力**，解决原生 CSS 缺少编程结构和复用手段的问题，提升样式的组织和可维护性。它们在构建阶段被编译成普通 CSS。

---

## 【问题】
PostCSS 和 Autoprefixer 分别是什么

## 【回答】
**PostCSS 以插件处理 CSS AST**，是一条处理管线；**Autoprefixer 可根据 browserslist 添加厂商前缀**。注意 PostCSS 不等于自动兼容所有新特性，它只处理被插件覆盖的部分。

---

## 【问题】
CSS Modules 和 Scoped CSS 是怎么实现样式隔离的

## 【回答】
**CSS Modules 在构建时为 class 生成局部名称**；**Scoped CSS 通常通过属性选择器改写规则**（如 Vue `scoped` 给元素和选择器加标记，属于编译策略）。二者都解决命名隔离，并不依赖浏览器原生隔离。

---

## 【问题】
`:deep()` 有什么作用？使用要注意什么

## 【回答】
**:deep() 允许 scoped 样式穿透到子组件**，但会扩大作用范围，应谨慎使用，避免再次引入全局污染。仅在确实需要影响子组件内部样式时使用，并尽量收窄匹配范围。

---

## 【问题】
Reset 和 Normalize 有什么区别？怎么选

## 【回答】
**Reset 统一清理浏览器默认差异**；**Normalize 尽量保留有用默认语义并做兼容修正**。二者都应按项目选择，目标是统一基线再叠加自己的样式。

---

## 【问题】
如何避免全局样式污染

## 【回答】
限制全局选择器、控制 specificity、使用 Modules / Scoped / @layer、统一 token 并清理无用样式。**BEM（如 `.card__title--disabled`）用 Block / Element / Modifier 表达组件边界**，减少深层嵌套和覆盖冲突。

---
category: Webpack
topic: tree-shaking 前提条件
type: bagu
tags: [Webpack]
difficulty: medium
created: 2026-07-24
---
# 3. tree-shaking 的前提条件是什么？

## 【问题】
tree-shaking 的前提条件是什么？

## 【回答】

### 核心一句话总结
Tree-shaking 是打包工具移除未使用代码（死代码）的优化手段，核心前提是模块必须是 ESM 静态结构，同时满足一系列语法和工程化条件。

### 详细前提（面试分点答）

1. **必须使用 ES Module (ESM)**：这是最核心的前提。只有 ESM 的静态结构能被打包工具静态分析，CommonJS 是动态加载，无法做 Tree-shaking。

2. **使用 ES6+ 静态导入导出语法**：必须用 `import`/`export` 声明，不能用 CommonJS 的 `require()`/`module.exports`，也不能用动态 `import()`（动态导入的代码无法被静态分析）。

3. **不能有副作用代码**：打包工具默认会保留有副作用的代码（如 `console.log()`、修改全局变量、IIFE 等），需要通过 `package.json` 的 `sideEffects` 字段标记无副作用的文件，让工具安全删除未使用代码。
   - 示例：`"sideEffects": false`（所有文件无副作用）或 `"sideEffects": ["*.css", "src/polyfill.js"]`（仅指定文件有副作用）。

4. **不能使用会破坏静态分析的语法**：
   - 禁止动态导入路径（如 `import(./${file}.js)`）；
   - 禁止对导出对象做修改（如 `export const obj = {}; obj.a = 1`，工具无法确定 `a` 是否被使用）；
   - 禁止使用 `eval()`、`with()` 等动态执行语法；
   - 避免使用 `export *` 全量导出（会导致工具无法精准分析未使用导出）。

5. **打包工具开启 Tree-shaking 配置**：
   - Webpack：生产模式（`mode: production`）默认开启，需配置 `optimization.usedExports: true`；
   - Rollup：原生支持 Tree-shaking，无需额外配置（Rollup 是 Tree-shaking 的发明者）；
   - Vite：基于 Rollup，生产环境默认开启。

6. **第三方库支持 ESM**：如果依赖的第三方库（如 Lodash）只提供 CommonJS 版本，无法被 Tree-shaking；需使用 ESM 版本（如 `lodash-es` 替代 `lodash`）。

### 补充：Tree-shaking 的本质
Tree-shaking 不是"删除代码"，而是标记未使用的导出，让压缩工具（Terser）在最终打包时删除这些死代码。因此，Tree-shaking 必须配合代码压缩才能生效。

---

## 追问题问

### 1. 追问：CommonJS 能做 Tree-shaking 吗？

## 【问题】
CommonJS 能做 Tree-shaking 吗？

## 【回答】
**不能**。CommonJS 是运行时动态加载，`require()` 的路径可以是变量、条件判断，打包工具在编译阶段无法确定哪些代码会被使用，因此无法做 Tree-shaking。只有 ESM 的静态结构才能支持 Tree-shaking。

---

### 2. 追问：为什么 ESM 要设计成静态结构？

## 【问题】
为什么 ESM 要设计成静态结构？

## 【回答】
核心是为了**性能优化**。静态结构让打包工具可以在编译阶段做 Tree-shaking、作用域提升、代码分割等优化，减小打包体积，提升运行性能；同时，静态结构也让模块依赖更清晰，便于工具做类型检查、代码提示等开发体验优化。

---

### 3. 追问：Tree-shaking 真的能 100% 移除未使用代码吗？

## 【问题】
Tree-shaking 真的能 100% 移除未使用代码吗？

## 【回答】
**不能**。Tree-shaking 只能移除**未被使用的 ESM 导出**，对于有副作用的代码、动态执行的代码、引用类型的修改等，工具无法确定是否被使用，会保留。因此需要配合 `sideEffects` 字段、代码规范来最大化优化效果。

---

### 4. 追问：Vue 2 为什么 Tree-shaking 效果差？

## 【问题】
Vue 2 为什么 Tree-shaking 效果差？

## 【回答】
Vue 2 基于 Options API，`this` 是动态对象，所有选项（如 `methods`、`computed`）都挂载在 `this` 上，打包工具无法静态分析哪些方法被使用，因此无法做 Tree-shaking；Vue 3 用 Composition API，基于静态 `import`，天然支持 Tree-shaking，打包体积更小。

---

## 【问题】
Tree Shaking 的核心工作流程是怎样的？

## 【回答】
Tree Shaking 是基于模块静态结构和使用关系移除未使用代码的死代码消除策略，流程为：
```
解析 ESM 依赖图
  ↓ 标记被使用的 export
  ↓ 判断模块副作用
  ↓ 删除不可达且无副作用代码
  ↓ 压缩器进一步消除死代码
```
**ESM 的静态 import/export 让分析更可靠**；它先标记被使用的导出，再结合 `sideEffects` 等副作用信息裁剪，最后由压缩器进一步消除死代码。Tree Shaking 强调**模块级依赖裁剪**，与一般 Dead Code Elimination 有重叠但不完全相同。

---

## 【问题】
sideEffects 配置有什么作用？错误声明会导致什么问题？

## 【回答】
`sideEffects: false` 是给打包器的声明，表示**模块可安全整体裁剪**（无副作用）。但风险在于：**若模块导入 CSS、注册 polyfill 或执行初始化却错误声明 `sideEffects: false`，这些必要副作用可能被错误删除**，导致样式丢失或运行异常。
因此只有真正无副作用的文件才能标记；有副作用的模块（如 `.css`、polyfill 入口）必须排除在 `false` 之外，或显式列入保留名单。

---

## 【问题】
Tree Shaking 和普通死代码消除（DCE）有什么区别？

## 【回答】
两者都移除未使用代码，但**Tree Shaking 强调模块级依赖裁剪**，依赖 ESM 的静态结构识别“哪些 export 未被使用”并整体移除；**普通 DCE 更偏向函数/语句级别**，由压缩器（如 Terser）在生成产物后消除不可达分支和未引用变量。
Tree Shaking 必须在**模块静态可分析、正确 sideEffects 配置、配合代码压缩**的前提下才生效；CommonJS 动态 require、运行时反射和副作用不明确都会降低其效果。

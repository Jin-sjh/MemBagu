---
category: Vite
topic: vite-env.d.ts 的作用
type: bagu
tags: [Vite]
difficulty: easy
created: 2026-07-24
---
## 【问题】Vite 项目中 vite-env.d.ts 是什么？有什么用？

## 【回答】
vite-env.d.ts 是 Vite + TS 项目的类型声明文件，核心作用是通过三斜线指令 `/// <reference types="vite/client" />` 引入 Vite 客户端的全局类型，解决 `import.meta.env`、`import.meta.glob` 等 Vite 专属语法的 TS 类型报错问题。

实际开发中，我们还会在这个文件中扩展 `ImportMetaEnv` 接口，给自定义的环境变量（以 `VITE_` 开头）添加类型约束，实现代码补全和类型检查，提升开发效率和代码健壮性。

---

## 真实业务 / 面试场景（案例补充）

### 场景 1：`import.meta.env.VITE_API_BASE` 报"类型上不存在"
**为什么**：TS 不知道你自定义的环境变量，只在 `vite/client` 提供的默认类型里找，所以报错。
**解决**：在 `vite-env.d.ts` 里扩展接口：
```ts
/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_BASE: string
}
interface ImportMeta { readonly env: ImportMetaEnv }
```
报错立刻消失，且后续有补全。

### 场景 2：自定义 env 没有代码提示
**应用**：把项目里所有 `VITE_*` 变量都声明进 `ImportMetaEnv`，团队成员写代码时就有类型提示和拼写检查，避免手敲错变量名。

### 场景 3：这个 .d.ts 文件会被打包进产物吗
**要点**：`.d.ts` 是纯类型声明文件，编译后不产出任何 JS，只在开发期/编译期生效，不影响运行时。

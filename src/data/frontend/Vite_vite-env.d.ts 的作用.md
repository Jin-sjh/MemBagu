【问题】Vite 项目中 vite-env.d.ts 是什么？有什么用？

【回答】
vite-env.d.ts 是 Vite + TS 项目的类型声明文件，核心作用是通过三斜线指令 `/// <reference types="vite/client" />` 引入 Vite 客户端的全局类型，解决 `import.meta.env`、`import.meta.glob` 等 Vite 专属语法的 TS 类型报错问题。

实际开发中，我们还会在这个文件中扩展 `ImportMetaEnv` 接口，给自定义的环境变量（以 `VITE_` 开头）添加类型约束，实现代码补全和类型检查，提升开发效率和代码健壮性。

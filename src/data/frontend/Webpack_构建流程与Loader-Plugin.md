---
category: Webpack
topic: 构建流程与Loader-Plugin
type: bagu
tags: [Webpack, 构建流程, Loader, Plugin, Compiler, Chunk]
difficulty: medium
created: 2026-09-21
---
# 构建流程与Loader-Plugin

## 【问题】
Webpack 是什么？核心构建流程是怎样的？

## 【回答】
Webpack 是**静态模块打包器**：从 **entry 出发构建依赖图**，经过 **Loader/Plugin 处理**后输出一个或多个可部署的 **bundle/chunk**。
核心流程可概括为：
```
Entry
  ↓ 解析模块
Dependency Graph
  ↓ Loader 转换、Plugin 参与生命周期
模块优化/拆包/运行时代码
  ↓
Bundle / Chunk / Assets
```
它把 `import`、`export`、`require`、动态 `import()` 等依赖组织成模块图，再优化、拆分并生成最终资源。

---

## 【问题】
Webpack 的完整构建流程有哪些阶段？

## 【回答】
完整流程如下：
```
读取配置 → 创建 Compiler → Compiler.run()
  → 创建本次 Compilation → 从 Entry 解析模块
  → Loader 转换 + Parser 解析依赖 → 递归构建 Module Graph
  → 根据入口和动态 import 组织 Chunk
  → 优化、生成 Chunk 内容和 Asset → emit / afterEmit → 写入 output.path
```
关键阶段：① **初始化配置**（解析 entry、output、module.rules、resolve、optimization、plugins，插件在初始化执行 `apply(compiler)`）；② **创建 Compiler/Compilation**（Compiler 管理全局生命周期，Compilation 表示一轮具体构建）；③ **从 Entry 构建模块图**（重复引用的模块复用节点）；④ **Loader 处理资源**；⑤ **组织 Chunk、生成 Asset**（随后执行 Tree Shaking、Scope Hoisting、splitChunks、压缩、Hash）。

---

## 【问题】
Webpack 中 Compiler 和 Compilation 有什么区别？

## 【回答】
- **Compiler**：表示一次构建器的**全局控制对象**，管理文件系统、配置、插件和构建生命周期；调用 `webpack()` 创建，通常整个生命周期复用同一个 Compiler。
- **Compilation**：表示**某一轮具体构建**产生的模块、依赖、Chunk、Asset 和错误信息；监听模式下可能产生多轮 Compilation。

不要把 Compiler 理解成单个文件编译器，也不要把 Compilation 当成最终输出目录——**Compiler 管“整个构建生命周期”，Compilation 管“一次具体构建的内容”**。

---

## 【问题】
Webpack 中 Loader 和 Plugin 有什么区别？

## 【回答】
- **Loader**：主要**转换模块内容**，接收模块内容并返回转换后的内容或模块描述（如 TypeScript、Vue、SCSS、图片、CSS 通过 Loader 接入模块图）；它聚焦“如何读取和转换某类模块”。
- **Plugin**：通过 **compiler/compilation hooks（Tapable）** 参与**整个构建生命周期**，可以影响多个阶段。

一个 Plugin 可影响多个阶段，一个 Loader 通常只聚焦匹配到的模块内容。Loader 链通常从右到左/从后到前执行，**具体顺序以配置和 Loader 规则为准，不要只背顺序口诀**。

---

## 【问题】
Webpack 中 Module、Chunk、Bundle、Asset 有什么区别？

## 【回答】
- **Module**：源模块，即被 import 的单个源文件。
- **Chunk**：构建中一组模块及**运行时边界**；入口、动态 `import()`、runtime、splitChunks 共同影响 Chunk 组织（Entry Chunk / Async Chunk / Runtime / Asset）。
- **Bundle**：输出文件概念。
- **Asset**：最终输出的 JS、CSS、图片、字体、manifest 等**磁盘文件**。

**Chunk 是构建中间结构，Asset 才是写入磁盘或部署的输出资源**；动态 `import()` 会形成异步边界，通常影响 Chunk、运行时加载和请求瀑布。四者不能混为一谈。

---

## 【问题】
Webpack 构建慢如何排查？

## 【回答】
Webpack 提供统一资源处理和成熟生态，但**全量依赖图、Loader、Plugin、优化和 source map 会带来 CPU、内存、磁盘 IO 和构建等待**。排查步骤：
1. **先看 profile/stats**：用 `webpack --profile --json` 或项目对应统计能力生成构建数据；
2. **用 Bundle Analyzer** 查看模块来源和 Chunk 组成；
3. **定位具体瓶颈**：依赖图规模、Loader、Plugin、压缩、source map 和缓存命中；
4. **利用缓存**：开启构建缓存，避免每次全量重算。
不要只增加机器配置，应从依赖图、Loader、Plugin、缓存、并行和源码规模定位。

---

## 【问题】
面试时怎么答 Webpack 构建流程？

## 【回答】
**30 秒基础回答**：Webpack 读取配置并创建 Compiler，运行构建后生成本次 Compilation，从 Entry 出发解析模块，Loader 转换资源并收集依赖，形成 Module Graph；再根据入口和动态 import 组织 Chunk，经过优化后生成 JS/CSS 等 Asset，最后写入 output 目录。

可补充的高频点：
- **Compiler vs Compilation**：前者管整体生命周期，后者表示一次具体构建。
- **Loader vs Plugin**：Loader 转换模块内容，Plugin 通过 Tapable 参与全局构建。
- **Module/Chunk/Bundle/Asset**：源模块、构建集合、输出文件概念、最终资源文件。
- **动态 import**：形成异步边界，影响 Chunk 与请求瀑布。
- **构建慢**：先看 profile/stats，再定位依赖、Loader、Plugin、压缩、source map、缓存。

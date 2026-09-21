---
category: frontend
topic: npm 与 pnpm 区别
type: bagu
tags: [前端, npm, pnpm, 依赖管理, 锁文件, 质量门禁]
difficulty: easy
created: 2026-07-24
---
## 【问题】npm 与 pnpm 区别（面试精简版）

## 【回答】
1. 磁盘占用
- npm：每个项目独立安装依赖，多项目重复存储，占用空间大。
- pnpm：使用全局仓库，同一版本包只存一份，通过硬链接复用，极省空间。

2. 安装速度
- npm：安装时全量复制文件，速度慢。
- pnpm：链接复用文件，IO 更少，安装速度显著更快。

3. node_modules 结构
- npm：依赖扁平化，易出现幽灵依赖、依赖冗余。
- pnpm：非扁平、严格树形结构，通过软链接构建依赖树，结构清晰规范。

4. 幽灵依赖
- npm：存在，可引用未在 package.json 声明的包，存在隐患。
- pnpm：天然杜绝，只能引用显式声明依赖，更安全稳定。

5. Monorepo 支持
- npm：支持较弱。
- pnpm：原生支持 workspace，适合多包管理项目。

6. 总结一句话
pnpm 相比 npm，更快、更省磁盘、无幽灵依赖、依赖管理更严格规范，是现代前端工程更优选择。

---

## 【问题】
什么是 lockfile？它和 package.json 的关系是什么？

## 【回答】
**package.json 声明版本范围，lockfile 固定解析结果**，记录每个依赖的确切版本、依赖树与下载地址，保证不同环境安装可重复。**lockfile 是安装可重复性的关键**。升级依赖要评估 breaking change、peerDependencies、bundle 变化与漏洞影响，**不要无理由提交 lockfile 大范围变化，也不要只凭 audit 结果决定升级**。

---

## 【问题】
ESLint、Prettier、Husky、lint-staged 各自负责什么？

## 【回答】
四者解决不同层次的问题：

| 工具 | 主要职责 | 不负责什么 |
|---|---|---|
| ESLint | 代码质量、潜在错误、框架规则 | 不以统一排版为主要目标 |
| Prettier | 自动格式化和排版 | 不替代类型检查或业务正确性检查 |
| Husky | 管理 Git Hooks，触发提交前脚本 | 不负责具体的代码检查规则 |
| lint-staged | 只对暂存区文件执行任务 | 不等同于全量 CI 检查 |

**Husky 本身不检查代码，只负责安装和触发 Hook**。

---

## 【问题】
为什么 lint-staged 比全量 lint 快？只检查暂存文件的意义是什么？

## 【回答】
**lint-staged 只处理暂存区文件，减少无关扫描**，开发者提交时只校验本次变更，等待更短。**但它不能代替 CI 全量校验**，未被本次提交触及的历史问题仍可能影响构建、测试或发布。本地 Hook 是体验层和快速反馈，**不能作为唯一安全边界**——开发者可跳过 Hook，CI 仍应强制执行关键检查。

---

## 【问题】
为什么本地通过了 CI 却失败？

## 【回答】
常见原因：**Node / 依赖版本不一致、本地只跑了局部而 CI 是全量范围、环境变量差异、或本地 Hook 与 CI 脚本不一致**。避免方式是**固定 Node、包管理器与 lockfile，在干净环境执行同一脚本**。不同 Husky 主版本的初始化命令和钩子写法可能不同，应以项目当前版本文档为准。

---

## 【问题】
面试时怎么答 npm/pnpm 与依赖质量门禁？

## 【回答】
稳定工程依赖 **package manifest + lockfile + 固定运行时 + CI 门禁**。ESLint 管质量、Prettier 管格式、Husky 触发 Hook、lint-staged 处理暂存文件，把低级问题前置拦截；但 **CI 仍要执行全量类型、测试和构建**，避免本地 Hook 被跳过或环境不一致。依赖升级要评估兼容、包体、许可证和安全，**不盲目追新**。

## 【考察点】
lockfile 与可重复安装、ESLint/Prettier/Husky/lint-staged 分工、质量门禁层次、依赖升级评估。

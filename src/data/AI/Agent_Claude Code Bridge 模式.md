---
category: Agent
topic: Claude Code Bridge 模式
type: bagu
tags: [Agent, Claude Code, Bridge, 远程通道, Feature Flag]
difficulty: medium
created: 2026-09-15
---

# Claude Code Bridge 模式

## 【问题】
Claude Code 源码里的 Bridge 模式（`src/bridge/`、`src/commands/bridge/`）是在解决什么问题？它和普通的工具调用有什么区别？

## 【回答】
Bridge 解决的是 **本地 CLI / REPL 与远程控制端之间的受控通道**问题：

- **位置**：`src/bridge/`（协议、会话、JWT、`replBridge` 等）以及 `src/commands/bridge/`。
- **语义**：在本地 CLI/REPL 与**远程控制端**（移动端、Web、CCR 等）之间建立受控通道，承载**鉴权、消息 inbound、附件、能力唤醒**等。
- **与工具调用的区别**：它不是把远端当成一个工具去调用，而是把"跨端控制"抽象成一条需要**鉴权 + 消息协议 + 能力矩阵**的通信通道；跨端消息的差异（如粘贴/执行策略）由 `src/types/textInputTypes.ts` 中的 `bridgeOrigin` 等字段区分。

## 【问题】
Bridge 为什么要用 Feature Flag（`BRIDGE_MODE`）在 `commands.ts` 里条件挂载？这和"最小暴露面"有什么关系？

## 【回答】
这是**构建期裁剪 + 最小暴露面**的经典做法：

- 只有当 `BRIDGE_MODE` 为真时，`commands.ts` 才 `require('./commands/bridge/index.js')`，否则这段命令与协议代码**根本不进构建产物**。
- 好处有两点：**减少无关构建体积**，以及**缩小攻击面**（不暴露远端控制能力时就不编译进来）。
- 这正是 Claude Code「权限模型 + 功能开关 + 最小暴露面 三者一致」工程哲学的体现：同一套源码树通过 `import { feature } from 'bun:bundle'` 在编译/构建期开关，支撑内部版、桥接版、语音版等多种产品形态。

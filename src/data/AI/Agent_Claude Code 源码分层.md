---
category: Agent
topic: Claude Code 源码分层
type: bagu
tags: [Agent, Claude Code, 架构分层, query.ts, 源码]
difficulty: medium
created: 2026-09-15
---

# Claude Code 源码分层

## 【问题】
Claude Code 的 TypeScript 源码（claude-code-main）整体是怎么分层的？tools / commands / services / query 四层各自负责什么？

## 【回答】
按职责可划成四层，互相之间通过明确边界协作：

- **工具层 `src/tools/`**：每个业务工具（Bash、文件读写、Grep、MCP、子 Agent 等）以目录/模块组织，内含 Tool 实现、Prompt 片段、权限相关 UI、常量。统一实现 `src/Tool.ts` 的接口，由上层按名称调度。
- **命令层 `src/commands/`**（聚合入口 `src/commands.ts`）：斜杠命令（`/compact`、`/mcp`、`/plan` 等）的解析、注册、分发，面向会话控制、配置、运维型操作。
- **服务层 `src/services/`**：可复用的业务与横切能力——API 客户端（`services/api/` 含 `withRetry`）、会话记忆（`SessionMemory`）、压缩（`compact`）、遥测、自动摘要、语音、插件、远程托管设置等。
- **主循环 `src/query.ts`**：多轮对话、流式事件、compact、工具结果摘要的编排核心。

核心结论：**主循环瘦、服务胖**——主循环只负责编排，复杂策略下沉到 service 模块，单测友好。

## 【问题】
查询主循环 `src/query.ts`（QueryEngine）是如何完成「tool_use → 执行 → tool_result」闭环的？它和 `Tool.ts` / `findToolByName` 怎么联动？

## 【回答】
闭环是这样跑起来的：

- 模型在 `query.ts` 里产出 `tool_use`，`query.ts` 通过 `findToolByName` 把工具名映射到 `src/Tool.ts` 中注册的**具体实现**（工具发现）。
- 工具在单一类型体系中实现统一接口，由 Query 循环**按名称调度**执行（工具注册/发现/执行三位一体）。
- 执行路径与**权限回调**（`CanUseToolFn`、`hooks/useCanUseTool`）强绑定，形成「先策略、再执行」的工业级顺序。
- 执行结果回灌为 `tool_result`，继续进入下一轮模型推理，直到满足停止条件。

值得强调的是：工具层只做**单职责动作**，多步编排、重试、上下文合并都放在 Query/Coordinator，二者边界写死。

## 【问题】
命令层（`src/commands` + `src/commands.ts`）和主循环（`query.ts` / QueryEngine）为什么要解耦？它们分别面向什么？

## 【回答】
因为两者**关注点不同**：

- 命令层多面向**会话控制、配置、运维型操作**（如 `/compact`、`/mcp`、`/plan`），属于人对会话的管理动作。
- 多轮对话与工具循环发生在 `query.ts` / QueryEngine 一侧，属于任务执行主路径。

解耦的好处是：命令层可独立按 **Feature Flag 条件挂载可选命令**（如 `bridge`、`voice`、`workflows`），而不污染主循环；主循环保持瘦，复杂逻辑下沉服务层。这也呼应了"扩展点显式化"——用 Feature Flag / Hook / Plugin 而不是无限 `if-else`。

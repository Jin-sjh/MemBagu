---
category: Agent
topic: Agent日志该记什么
type: bagu
tags: [Agent, 日志, 可观测, 审计]
difficulty: medium
created: 2026-09-15
---
# Agent日志该记什么

## 【问题】

Agent 的日志应该记录哪些内容？

## 【回答】

为复盘与合规审计，至少记录：

- **用户输入（脱敏）**；
- **模型原始输出**；
- **解析后的工具调用**；
- **工具返回摘要**；
- **耗时与 Token**；
- **版本号（模型与 Prompt）**；
- **追踪 ID**。

还要记录**轨迹**（每步 Thought / Action / Observation）与**引用**，便于可回放与可观测。版本管理上 Prompt / 工具 / schema 应版本化，配合影子模式（只记录建议不执行）、金丝雀用户群、关键指标对比、一键回滚。

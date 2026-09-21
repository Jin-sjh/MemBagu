---
category: 大模型
topic: ReAct 与 Plan-and-Execute
type: bagu
tags: [Agent, ReAct, Plan-and-Execute]
difficulty: hard
created: 2026-09-15
---
# ReAct 与 Plan-and-Execute

## 【问题】
Agent 里 ReAct 和 Plan-and-Execute 怎么选？

## 【回答】
- **ReAct（Reasoning + Acting）**：交替输出 Thought / Action / Observation，边推理边调工具，**适合环境动态、需频繁反馈、路径不固定的任务**。
- **Plan-and-Execute**：先规划出有序步骤（plan），再逐步执行 / 可 replan，**适合步骤清晰、可一次规划、任务较稳定的场景**。
- 复杂系统常**混合**：先 Plan 定大局，执行中遇变再用 ReAct 式反思 / 重试。

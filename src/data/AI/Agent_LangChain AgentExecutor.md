---
category: Agent
topic: LangChain AgentExecutor
type: bagu
tags: [Agent, LangChain, AgentExecutor, 循环, 工具调用]
difficulty: medium
created: 2026-09-15
---
# LangChain AgentExecutor

## 【问题】

LangChain 里 AgentExecutor 解决的核心问题是什么？它的循环本质是什么？

## 【回答】

把「**模型决策 → 工具执行 → 结果回填 → 再决策**」的**控制流标准化**，统一处理**迭代限制、错误处理、中间消息结构**，让开发者专注工具与提示。

循环本质：`inputs → AgentExecutor.loop`：调用 `agent.plan(messages/tools)` 得到下一步 message / tool_calls；若 final answer 则返回，否则 `run tools → append tool messages`，可选裁剪记忆 / 处理解析错误，直到停止。核心抽象：Tools（name / description / args schema / 执行函数）、LLM（生成决策）、Agent（推理策略，如 ReAct / OpenAI tools）、AgentExecutor（驱动循环）。

## 【问题】

为什么 AgentExecutor 要限制 max_iterations？它和自写 ReAct 差别在哪？

## 【回答】

限制 **max_iterations** 是为了防止**工具循环、解析失败导致的无限循环**，并**控制成本与延迟**（每步一次 LLM 调用 + 工具调用，费用随步数上升）；通常配合 `handle_parsing_errors` 兜底。

与自写 ReAct 差别：LangChain 提供**工程封装与生态整合**，底层仍是「提示 + 解析 + 循环」。面试理解 Executor 循环与 tool calling 模式即可，不必背每个 API 名；版本迁移时强调控制流本质而非具体 import 路径。

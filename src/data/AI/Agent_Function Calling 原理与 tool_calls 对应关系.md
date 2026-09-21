---
category: Agent
topic: Function Calling 原理与 tool_calls 对应关系
type: bagu
tags: [Agent, Function Calling, Tool Calling]
difficulty: medium
created: 2026-09-15
---

# Function Calling 原理与 tool_calls 对应关系

## 【问题】
什么是 Function Calling？它和普通让模型续写文本有什么区别？

## 【回答】
Function Calling 是厂商提供的**结构化工具调用通道**：模型不直接输出自然语言，而是输出「调用哪个函数 + 参数 JSON」，由应用在本地执行再把结果回传模型。本质是模型在「续写」空间里，工具描述把某些 token 序列（函数名、JSON 参数）的输出概率抬高。

与纯续写相比，它**字段名、类型与对话轮次绑定**，更利于多轮 `tool` 消息对齐和并行调用 ID 对齐，解析也更稳定。

## 【问题】
OpenAI 兼容接口里，assistant 的 tool_calls 和 role=tool 消息是怎么一一对应的？

## 【回答】
每条 `assistant.tool_calls[]` 有**唯一 id**；工具执行后，每条结果作为一条 `role=tool` 消息，且**必须带相同的 tool_call_id**，保证多个并行调用时不错配。

实践中把 tool 结果消息 `append` 回 `messages`（如 `msg.model_dump()`），模型据此继续推理；`tool_call_id` 的作用正是把工具结果与某次 `tool_calls` 条目一一对应，从而支持并行多个调用。

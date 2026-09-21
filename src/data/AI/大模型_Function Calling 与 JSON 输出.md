---
category: 大模型
topic: Function Calling 与 JSON 输出
type: bagu
tags: [Prompt, Function Calling, JSON]
difficulty: medium
created: 2026-09-15
---
# Function Calling 与 JSON 输出

## 【问题】
Function Calling 和「输出 JSON」怎么选？

## 【回答】
- **Function Calling**：模型以 tool_calls 形式输出结构化动作，宿主按 Schema 校验后执行，**动作空间清晰、不易掺废话**，适合 Agent / 工具调用。
- **纯 JSON 输出**：让模型直接吐 JSON，再用 Pydantic / `json.loads` 解析，**适合简单结构化、无工具场景**。
- 取舍：**看生态与框架，可混用**；关键路径用 Function Calling + 强校验更稳，简单提取用 JSON 即可。

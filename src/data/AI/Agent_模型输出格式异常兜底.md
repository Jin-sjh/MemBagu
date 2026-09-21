---
category: Agent
topic: 模型输出格式异常兜底
type: bagu
tags: [Agent, 格式解析, 兜底, JSON, ReAct]
difficulty: medium
created: 2026-09-15
---

# 模型输出格式异常兜底

## 【问题】
LLM 有时不按格式输出（该 JSON 却纯文本、ReAct 解析失败），怎么兜底？

## 【回答】
多层解析 + 预防（以下为该文档工程实践口径）：
- **四层解析**：严格正则 → 宽松正则（忽略大小写/空格）→ LLM 修复（轻量模型把非标输出修成标准格式）→ 降级（整段当 Final Answer 直接返回）。
- **预防**：Prompt 强调格式并给示例；OpenAI 用 `response_format`(JSON mode) 强约束；Claude 用 `tool_use` 拿结构化输出。
- **监控**：记录每次解析失败原因，格式遵循率 < 90% 告警查 Prompt。
- 要点：**解析失败不要直接报错给用户，先宽松再 LLM 修最后降级**；**能强约束格式（JSON mode/tool_use）就别靠纯文本正则**。

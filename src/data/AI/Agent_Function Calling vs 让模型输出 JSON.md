---
category: Agent
topic: Function Calling vs 让模型输出 JSON
type: bagu
tags: [Agent, Function Calling, JSON]
difficulty: medium
created: 2026-09-15
---

# Function Calling vs 让模型输出 JSON

## 【问题】
Function Calling 和「让模型输出 JSON」有什么本质区别？

## 【回答】
Function Calling 是**厂商提供的结构化工具调用通道**（字段名、类型、与对话轮次绑定）；纯 JSON 输出依赖 prompt 约束，**解析脆弱、易混入闲聊文本**，且并行调用时难以对齐。

Function Calling 更利于多轮 `tool` 消息与并行调用 ID 对齐。实践中也可结合：**FC 负责调度，JSON 负责业务负载**。

## 【问题】
如果模型不支持 Function Calling 怎么办？

## 【回答】
可用 **JSON mode / 约束解码 / 后处理抽取**把自然语言转成结构化动作；或用**小模型做「动作分类」**先选出工具，再让大模型填参。这是没有原生 FC 通道时的兜底方案。

---
category: Agent
topic: 多模型适配与统一抽象层
type: bagu
tags: [Agent, 模型路由, 适配器, 多模型]
difficulty: medium
created: 2026-09-15
---

# 多模型适配与统一抽象层

## 【问题】
系统要支持多家模型（OpenAI / Claude / 通义千问 / 本地 vLLM），怎么做统一适配，让业务代码不感知厂商差异？

## 【回答】
核心是**定义统一的 LLMProvider 抽象接口，用适配器模式屏蔽厂商差异**：
- **统一接口**：抽象 `chat / stream_chat / count_tokens / get_model_info` 等方法，**业务代码只依赖抽象，不感知具体厂商**。
- **适配器实现**：OpenAIProvider、AnthropicProvider、QwenProvider、LocalProvider 各自实现接口，**新增模型平均约 1 天（实现 Provider + 测试）**。
- **差异化在 Provider 层收敛**：
  - Function Calling 格式差异（OpenAI `tools` vs Claude `tool_use`）在适配器内统一；
  - Token 计算：各模型 tokenizer 不同，**每个 Provider 自己实现 count_tokens**；
  - 流式 SSE 格式差异在 Provider 层统一处理。
- 配置切换：**改一行配置即可换模型，零业务代码改动**；多租户可各自指定模型。
- 工程价值：**模型选型可灰度、可回退，不被单一厂商锁定**。

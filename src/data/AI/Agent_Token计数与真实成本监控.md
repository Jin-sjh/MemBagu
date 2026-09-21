---
category: Agent
topic: Token计数与真实成本监控
type: bagu
tags: [Agent, 工程化, Token, 成本监控, tiktoken]
difficulty: medium
created: 2026-09-15
---

# Token计数与真实成本监控

## 【问题】
为什么说本地 tiktoken 计数只能「估算」？

## 【回答】
实际计费依赖**服务商的分词器版本、特殊 token、多模态输入**等，不同模型与版本可能不一致。本地计数用于**预算控制与截断**，最终应以 **API 返回的 usage 与账单对账**。

实践：在网关层记录 `prompt_tokens`、`completion_tokens`，与 API 返回值对账以校准估算误差。Prompt 精简技巧：删除冗余示例、合并系统提示、结构化输出（JSON）、长文档摘要或 RAG 取 Top-K、消息裁剪（保留 system + 最近 N 轮 + 关键摘要）。

## 【问题】
如何监控一次 Agent 任务的「真实成本」？

## 【回答】
- 汇总每步 **prompt + completion tokens × 单价**；
- 加上**检索与向量库费用**；
- 分摊**基础设施**；
- 按**租户与功能**维度出报表与预算告警。

成本监控维度：日均 Token、单次 P95 成本、异常飙升、某 Prompt 模板成本占比；告警用环比、阈值、预算封顶（硬限制返回友好错误）。小模型做分类/路由/摘要、大模型做最终生成，结合 Batch API 与合并请求也能降本。

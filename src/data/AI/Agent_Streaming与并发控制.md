---
category: Agent
topic: Streaming与并发控制
type: bagu
tags: [Agent, 工程化, Streaming, 并发控制, Semaphore]
difficulty: medium
created: 2026-09-15
---

# Streaming与并发控制

## 【问题】
Streaming（流式输出）会影响计费或日志吗？

## 【回答】
- **计费仍以 Token 为准**；
- **日志**需聚合完整响应再记一条，或记增量 chunk 并关联 trace_id；注意流式中途断开时的**部分结果处理**。

流式（SSE 边生成边返回）能降低首字时间 TTFB、提升体验，但要注意中间状态与最终答案的一致性展示。

## 【问题】
并发控制 Semaphore 设多大合适？并行工具调用怎么保证顺序？

## 【回答】
结合**供应商 RPM / TPM、本机 CPU、下游工具容量**；**压测得到饱和点**，略低于饱和并留余量；**按租户分桶**避免噪声邻居。

Semaphore 的作用：限制同时 LLM 调用数，防止把自家或供应商打满触发 429。

并行工具调用若需顺序：按依赖图拓扑执行；无关则并行，合并结果时带 step_id。

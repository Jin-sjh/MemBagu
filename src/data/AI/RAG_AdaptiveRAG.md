---
category: RAG
topic: AdaptiveRAG
type: bagu
tags: [RAG, AdaptiveRAG, 路由, 分类]
difficulty: hard
created: 2026-09-15
---
# AdaptiveRAG

## 【问题】
什么是 Adaptive RAG？和 Agentic RAG 有什么区别？

## 【回答】
Adaptive RAG 按**问题类型路由**到不同链路：有的只需单跳向量检索，有的需多跳或工具，避免**过度检索浪费成本**。常见实现：用**轻量分类器或小模型**判断"需不需要检索 / 需要 SQL 还是文档 / 是否需要多跳"，再分发到不同子管道。
- 与 Agentic RAG 边界：Adaptive 强调**路由策略**，Agentic 强调**循环决策与工具调用**。

## 【问题】
Adaptive RAG 如何避免路由误判？

## 【回答】
- **混合路由**：并行短路与完整链路，避免一刀切。
- **置信度阈值 + 默认安全策略**：不确定则走**更强检索**。
- **持续用线上反馈**迭代分类器，降低误判率。

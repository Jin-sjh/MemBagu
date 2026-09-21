---
category: RAG
topic: SelfRAG
type: bagu
tags: [RAG, Self-RAG, 反思, 自我评估]
difficulty: hard
created: 2026-09-15
---
# SelfRAG

## 【问题】
Self-RAG 的核心思想是什么？

## 【回答】
Self-RAG 在生成过程中插入**反思 token**：是否需要检索、检索内容是否有用、生成是否支持等，形成**自我批评与修正循环**，让模型自己判断"该不该检索、证据够不够"，而不是无条件检索。

## 【问题】
Self-RAG 和 Agentic RAG 有什么共同点？区别在哪？

## 【回答】
- **共同点**：都引入**多步决策与反思**。
- **区别**：Agentic 常外显为**工具调用与规划**；Self-RAG 用**反思 token/标签**把"要不要检索、证据是否支持"**内嵌在生成格式**中，更偏**训练与解码策略**。

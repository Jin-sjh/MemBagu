---
category: RAG
topic: AgenticRAG
type: bagu
tags: [RAG, AgenticRAG, Agent, 多步检索]
difficulty: hard
created: 2026-09-15
---
# AgenticRAG

## 【问题】
什么是 Agentic RAG？和一次性（Naive）RAG 有什么差异？

## 【回答】
Agentic RAG 由 **Agent 决定何时检索、检索什么、是否再检索**，并可调用**多工具**（搜索、数据库、代码执行），把 RAG 从"一次检索"变为**多步决策循环**，适合复杂任务。
相比一次性 RAG：Agentic 更**灵活**（动态再检索、工具调用），但**成本更高**（多步 LLM 与工具调用）。

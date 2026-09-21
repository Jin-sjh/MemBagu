---
category: Agent
topic: MemGPT 与简单 RAG 的本质区别
type: bagu
tags: [Agent, Memory, MemGPT, RAG]
difficulty: medium
created: 2026-09-15
---

# MemGPT 与简单 RAG 的本质区别

## 【问题】
MemGPT 和简单 RAG 的本质区别是什么？

## 【回答】
RAG 多是**被动检索**（每次用户提问做一次相似度检索）；MemGPT 强调**主动内存管理**——把 LLM 上下文当作「有限 RAM」、外部存储当作「磁盘」，由控制逻辑（可外挂函数/工具调用）决定何时把外部记忆换入上下文、何时写出、如何分页（FIFO / 重要性 / 摘要）。更像 OS 管理 RAM，能缓解长对话的 lost-in-the-middle 与成本问题。

- **MemOS**：多指「记忆操作系统」式架构，把记忆拆成多层（瞬时上下文、会话工作区、用户级长期存储、共享知识），由调度器决定读写路径与配额；
- **Mem0**：偏工程化记忆中间件，把「抽取 → 更新 → 检索」做成可集成组件，常与向量检索、图结构、用户画像组合——与 MemGPT 的「OS 分页」互补（前者管写入与存储管线，后者管上下文与外存搬运）。

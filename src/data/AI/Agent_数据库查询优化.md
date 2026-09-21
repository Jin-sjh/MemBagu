---
category: Agent
topic: 数据库查询优化
type: bagu
tags: [Agent, 数据库, 查询优化, Milvus, PostgreSQL, Redis]
difficulty: medium
created: 2026-09-15
---

# 数据库查询优化

## 【问题】
数据量增长后数据库查询变慢，Agent 工具调用涉及的向量库 / 关系库 / Redis 怎么优化？

## 【回答】
分引擎优化（以下为该文档工程实践口径）：
- **向量库（Milvus）**：<100 万用 HNSW（低延迟），>100 万用 IVF_SQ8（省内存）；HNSW 调 M=16, efConstruction=200, ef=128；**按租户分 Collection 避免跨租户扫**。
- **关系库（PostgreSQL）**：高频查询加组合索引、EXPLAIN ANALYZE 查慢 SQL、对话表按月分区、连接池 min=5/max=20。
- **Redis**：缓存用 String、会话状态用 Hash、排行用 Sorted Set；key 规范 `{service}:{tenant}:{type}:{id}`；热 key 探测打散。
- **查询模式**：避免 N+1（批量替循环）、用预编译语句、只查需要的字段（不 SELECT *）。
- 要点：**先定位慢查询来源（向量/SQL/缓存），再针对性调索引与连接池**。

---
category: RAG
topic: CorrectiveRAG
type: bagu
tags: [RAG, CorrectiveRAG, 纠错, 触发条件]
difficulty: hard
created: 2026-09-15
---
# CorrectiveRAG

## 【问题】
什么是 Corrective RAG（纠正性 RAG）？什么条件下会触发纠正？

## 【回答】
Corrective RAG 当**检索质量不达标**时，触发**额外检索**（如网页搜索）或**改写查询**，纠正证据不足。
典型触发信号：
- **检索置信度低**（Top1 与 Top2 差距小）；
- 检索结果与**问题实体不一致**；
- **重排后仍低分**；
- 生成与引用**冲突**（可做一致性检测）。
触发后执行：查询改写、换索引源、或联网搜索。

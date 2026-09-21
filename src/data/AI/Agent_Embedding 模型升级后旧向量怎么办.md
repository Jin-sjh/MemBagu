---
category: Agent
topic: Embedding 模型升级后旧向量怎么办
type: bagu
tags: [Agent, Memory, Embedding, 重嵌入]
difficulty: medium
created: 2026-09-15
---

# Embedding 模型升级后旧向量怎么办

## 【问题】
Embedding 模型升级后，旧的向量怎么办？

## 【回答】
旧向量与新型**不在同一空间，不可混比**（相似度失真）。做法：

- **双写期**：新旧模型并行写，过渡期内两套向量共存；
- 离线**全量重嵌入**旧数据；
- 检索时标明 `embedding_model_version`，且查询向量与库向量版本一致。

这与持久化迁移一样需要备份、索引重建、回放重建的预案，避免升级后召回质量断崖。

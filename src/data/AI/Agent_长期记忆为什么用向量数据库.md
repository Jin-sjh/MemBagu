---
category: Agent
topic: 长期记忆为什么用向量数据库
type: bagu
tags: [Agent, Memory, 长期记忆, 向量数据库, RAG]
difficulty: medium
created: 2026-09-15
---

# 长期记忆为什么用向量数据库

## 【问题】
长期记忆为什么常用向量数据库？有什么局限？

## 【回答】
常用是因为**语义检索能处理「换说法」的匹配**：记忆文本 → embedding 模型 → 向量，同时存 `user_id`、`timestamp`、`type`、`source` 等元数据；查询时 embedding → Top-K 相似向量 → 过滤（用户隔离、时间范围、类型）→ 注入 prompt。

局限：

- **相似 ≠ 正确**（会召回到表面相近的噪声）；
- **难精确匹配**（账号、订单号更适合关键字/关系库）；
- 更新一致性需业务层保障（纯向量库若无主键管理，需要业务层 ID）。

缓解：**混合检索（BM25 + 向量）与重排（可选 cross-encoder）**。

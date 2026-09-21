---
category: Agent
topic: Embedding批量计算优化
type: bagu
tags: [Agent, Embedding, 批量计算, 推理优化]
difficulty: medium
created: 2026-09-15
---

# Embedding批量计算优化

## 【问题】
知识库初始化要给海量 chunk 算 embedding，怎么优化 embedding 计算吞吐？

## 【回答】
从批量、增量、并行、降维四方面（以下为该文档工程实践口径）：
- **批量计算**：batch_size 调大（如 256）最大化 GPU 利用率，用 DataLoader 预取避免 GPU 等 CPU。
- **增量更新**：对比 MD5 只对变更文档重算，新增文档实时入库不重建全量。
- **多 GPU 并行**：如 4×T4 DataParallel，吞吐约提升 3.6×。
- **维度压缩（可选）**：存储/检索敏感场景用 PCA 把 1024 维降到 512，**召回率仅降约 1.2%、存储减半**。
- 效果口径：**800 万 chunk 全量 embedding 从 48h 降到 12h，增量 1000 条 < 30s**。工程要点：**embedding 是典型批处理负载，吞吐瓶颈在 GPU 利用率而非单条延迟**。

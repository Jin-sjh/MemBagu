---
category: Agent
topic: 长文档与超长上下文处理
type: bagu
tags: [Agent, 长文档, 超长上下文, Map-Reduce, Refine]
difficulty: medium
created: 2026-09-15
---

# 长文档与超长上下文处理

## 【问题】
企业文档动辄几万到几十万字，远超模型 context window，怎么处理长文档 / 超长上下文？

## 【回答】
分「入库分块」和「超长上下文推理」两层（分块策略详见 RAG_分块策略，以下为该文档工程实践口径）：
- **Map-Reduce（超长文档总结）**：Map 阶段对每个 chunk 独立摘要，Reduce 阶段综合成总摘要，**适合"总结这份百页报告"**。
- **Refine（需要细节 / 全量扫描）**：逐 chunk 处理，把上一步结果与当前 chunk 一起喂入，**适合"找出文档中所有风险点"**。
- **实时问答的智能截断**：RAG 检索后只取最相关 top-5 chunk 进 context，reranker 精排保证最相关在前。
- 选型原则：**优先 RAG 只取最相关片段；长文档分析用 Map-Reduce；多轮对话用滑动窗口 + 摘要压缩**；关键结论**放 context 开头/结尾（首因/近因偏差）**。
- 要点：**超长上下文不要硬塞，用检索 + 摘要 + Map-Reduce 把"长"转成"相关短片段"**。

---
category: RAG
topic: 重排序
type: bagu
tags: [RAG, 重排序, Cross-Encoder, Bi-Encoder, Rerank]
difficulty: medium
created: 2026-09-15
---
# 重排序

## 【问题】
为什么 RAG 检索之后还需要重排序（Reranking）？Cross-Encoder 和 Bi-Encoder 有什么区别？

## 【回答】
向量检索用 **Bi-Encoder**（query 与 doc 独立编码，点积/余弦），为速度牺牲了 query-doc 交互信息，精度有限；**Cross-Encoder** 把 query 与 doc 拼在一起深度交互打分，**精度更高但慢**，故放在 Top-K 之后做小范围精排。

| 类型 | 机制 | 优点 | 缺点 |
|------|------|------|------|
| Bi-Encoder | 两路编码，点积/余弦 | 快，可 ANN | 精度低于 CE |
| Cross-Encoder | 拼接后深度交互 | 精度高 | 慢，只能小批量 |

## 【问题】
Cross-Encoder 重排序一般放在检索后哪一步？为什么不能替代向量索引？

## 【回答】
- **位置**：一般在**召回 Top-K（几十到几百） → Cross-Encoder 精排取 Top-N（3–10） → 再生成**，平衡延迟与效果。
- **不能替代向量索引**：Cross-Encoder 需对**每个 doc 与 query 运行一次**，复杂度高，**无法对百万级全库实时扫描**；向量索引（ANN）负责先快速缩小候选集，Cross-Encoder 只做小范围精排。常用模型如 Cohere Rerank、BGE Reranker（bge-reranker-large，开源可本地部署）。

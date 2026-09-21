---
category: RAG
topic: Embedding
type: bagu
tags: [RAG, Embedding, 向量化, 归一化]
difficulty: medium
created: 2026-09-15
---
# Embedding

## 【问题】
什么是文本 Embedding？在 RAG 里起什么作用？

## 【回答】
Embedding 把离散文本映射为**固定维度的稠密向量**，语义相近的文本在向量空间中**距离更近**（常用余弦相似度或内积）。训练目标多为**对比学习**：同义句拉近、无关句推远。RAG 离线用它对文档块向量化建索引，在线对 Query 向量化做近邻检索，实现"语义检索"。

## 【问题】
常用的 Embedding 模型有哪些？怎么选型？

## 【回答】
代表模型：OpenAI `text-embedding-3-small/large`（生态成熟、需 API 费用）；BAAI **BGE**（如 bge-large-zh-v1.5，中文开源常用、可本地部署）；Moka **M3E**（中文句向量、轻量）；Jina `jina-embeddings`（长文本、多语言场景有优势）。
选型标准：1）**语言与领域**（中文优先中文强化模型，医疗/法律看领域微调版）；2）**序列长度**（长文档需更长上下文 embedding 或先分段再聚合）；3）**许可证与部署**（云端 API vs 私有化）；4）与重排/生成模型一致性（同一厂商链路更省心，非必须）。

## 【问题】
Embedding 要不要做归一化？中英文混合文档要注意什么？

## 【回答】
- **建议归一化**：若用内积/余弦且框架假设归一化向量，应归一化以**稳定相似度**；归一化后**余弦 = 点积**，计算更快更省（如 FAISS `IndexFlatIP` 配 `normalize_embeddings=True`）。
- **中英文混合**：选**多语言模型**或分别建索引；单语模型可能导致**跨语言语义空间不一致**。混合检索（BM25）可补关键词匹配。

---
category: RAG
topic: MMR多样性
type: bagu
tags: [RAG, MMR, 多样性, 去冗余]
difficulty: medium
created: 2026-09-15
---
# MMR多样性

## 【问题】
什么是 MMR（最大边际相关性）？lambda 参数什么含义？

## 【回答】
MMR 在**相关性**与**多样性**之间权衡，避免 Top-K 几乎重复的段落：迭代选择与 query 相关、但与已选集合冗余度低的文档。
公式：

`MMR = argmax_d [ λ · sim(q,d) − (1−λ) · max_{s∈S} sim(d,s) ]`

- **λ 大** → 偏**相关**；
- **λ 小** → 偏**多样**（去冗余）。

实践中常与滑动窗口分块、混合检索配合，抑制重复片段主导答案。

---
category: Agent
topic: 混合记忆检索的去重与限长
type: bagu
tags: [Agent, Memory, 混合检索, 重排]
difficulty: medium
created: 2026-09-15
---

# 混合记忆检索的去重与限长

## 【问题】
混合检索怎么去重与限长？

## 【回答】
典型 pipeline：三路召回（时间 / 向量 / 关键词）→ **去重** → **重排** → Token 截断注入。

- **去重**：同事实不同表述用语义去重（相似度阈值）或 canonical key（实体对齐）；
- **限长**：按最终 rerank_score 排序后做 Token 装箱，或分层注入「摘要优先、细节按需」。

去重误删相似但不同约束时，用**阈值 + 冲突检测**（矛盾触发人工或二次 LLM 仲裁），而非纯相似度合并。融合用 RRF（倒数排名融合）或统一打分后线性加权 / Learning to Rank，线上 AB 调参。

参考 Generative Agents 思路：打分综合相关性（relevance）、近期性（recency）、重要性（importance），各自归一化后加权。

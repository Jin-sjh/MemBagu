---
category: 大模型
topic: Prefill 与 Decode 阶段
type: bagu
tags: [推理, Prefill, Decode, KV Cache]
difficulty: medium
created: 2026-09-15
---
# Prefill 与 Decode 阶段

## 【问题】
自回归推理的 Prefill 和 Decode 阶段各有什么特点？哪个更吃算力、哪个更吃带宽？

## 【回答】
- **Prefill（预填充）**：一次性并行计算 prompt 所有 token 的表示，得到首个生成位置的 logits；计算形态像"整段并行注意力"，**计算密集、算力受限**。
- **Decode（解码）**：每步只新增 1 个 token，用历史 **KV Cache** 避免重算过去 K/V；**每步批量小、常内存带宽受限**（要读大权重与 KV Cache）。
- 结论：**Prefill 更吃算力，Decode 更吃显存带宽**；实际还与 batch、实现有关。Decode 阶段是多数 serving 系统的瓶颈（memory-bound）。

---
category: 大模型
topic: Flash Attention 核心思想
type: bagu
tags: [Attention, 推理加速, GPU]
difficulty: hard
created: 2026-09-15
---
# Flash Attention 核心思想

## 【问题】
Flash Attention 为什么能又快又省显存？核心思想是什么？

## 【回答】
- 标准实现要物化完整 `n × n` 注意力矩阵（`QK^T`、softmax 结果），显存占用大、HBM 读写多。
- **核心思想：IO-aware 分块（tiling）**——利用 GPU **SRAM 快、HBM 慢**的层次，把 Q/K/V 分块，在片上（SRAM）融合"矩阵乘 → softmax → 对 V 加权"一步完成，**避免把大注意力矩阵写回 HBM**。
- **配合 recomputation**：反向时重算部分中间量以省显存；分块 softmax 保证数值稳定。
- 效果：**显著降低注意力显存峰值、减少 HBM 读写、提高吞吐**；FlashAttention-2 进一步优化并行与工作划分。

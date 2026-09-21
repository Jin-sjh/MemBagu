---
category: 大模型
topic: Pre-Norm 与 Post-Norm
type: bagu
tags: [Transformer, Norm, 训练稳定性]
difficulty: medium
created: 2026-09-15
---
# Pre-Norm 与 Post-Norm

## 【问题】
Pre-Norm 和 Post-Norm 有什么区别？为什么现代大模型多用 Pre-Norm？

## 【回答】
- **Post-Norm（原始 Transformer）**：先做子层、再加残差并 Norm，即 `x ← LayerNorm(x + Sublayer(x))`；Norm 在残差"外面"。
- **Pre-Norm（现代 LLM 常见）**：先 Norm 再进子层，即 `x ← x + Sublayer(LayerNorm(x))`；Norm 在残差"里面"。
- **Pre-Norm 通常更稳定**：子层输入分布更稳，梯度在残差路径上更平滑，深层网络更易训练、不易崩。
- Post-Norm 在理论上与残差更"经典"，但深层时更难训，故 LLaMA 等大模型普遍采用 **Pre-Norm**。

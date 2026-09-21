---
category: 大模型
topic: Beam Search 与采样
type: bagu
tags: [解码, Beam Search, 采样]
difficulty: medium
created: 2026-09-15
---
# Beam Search 与采样

## 【问题】
对话生成（开放域）为什么很少用 Beam Search，而多用采样？

## 【回答】
- **Greedy / Beam Search 易局部最优、重复、不自然**：Beam Search 维护 top-b 条假设，适合机器翻译 / 摘要等可度量任务，但开放域对话常显得重复刻板。
- **采样（temperature / top-k / top-p）更自然多样**：对话场景重视流畅与变化，采样类方法更合适。
- 取舍：**可度量、有标准答案的任务用 Beam；开放生成用采样**；需确定性 / 可复现时再降温度或 Greedy。

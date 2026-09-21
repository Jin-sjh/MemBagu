---
category: 大模型
topic: DPO 与 GRPO KTO
type: bagu
tags: [对齐, DPO, GRPO, KTO, RLHF]
difficulty: hard
created: 2026-09-15
---
# DPO 与 GRPO KTO

## 【问题】
DPO 相比 RLHF 最大的简化是什么？

## 【回答】
- **RLHF 三阶段**：SFT → 训练奖励模型 RM → 用 PPO 强化学习（带 KL 惩罚）。
- **DPO（Direct Preference Optimization）去掉显式 RM 与 RL 采样循环**：从偏好对 `(y_w, y_l)` 推导出一个只依赖"策略模型 vs 参考模型"的分类式损失，直接在静态偏好数据上优化策略。
- 工程优势：**pipeline 更简单、无需单独训 RM、数据质量要求高**；相对 RLHF 更稳定易维护。

## 【问题】
GRPO 和 KTO 你了解到什么程度？

## 【回答】
- **GRPO（Group Relative Policy Optimization）**：对同一 prompt 的一组输出做"组内相对奖励归一化"，省掉 critic，适合特定 RL 基础设施（DeepSeek 等强调）；本质是组级别相对优势优化。
- **KTO（Kahneman-Tversky Optimization）**：从二元反馈（好 / 坏）出发，用前景理论风格损失做对齐，**不必成对偏好**，数据收集更灵活。
- 二者都用于改进 / 简化 RLHF 的复杂管线；细节以论文与最新报告为准。

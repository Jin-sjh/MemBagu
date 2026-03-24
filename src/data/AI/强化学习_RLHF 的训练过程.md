# 强化学习 RLHF 的训练过程

## 【问题】
请详细描述 RLHF（Reinforcement Learning from Human Feedback）的训练过程，包括各个阶段的具体操作和关键要点。

## 【回答】
RLHF 的训练过程包含以下四个阶段：

### 1. 采样阶段（Rollout/Generation）
Actor Model 根据当前策略生成完整的响应序列。

**注意**：此时 Actor Model 会完整地生成一个响应序列（也就是一系列的 token）。

### 2. 评估阶段
将生成的序列提交给奖励模型获得奖励；Critic Model 预测序列中各状态的价值。

将 Actor Model 生成的**完整响应序列**输入到预先训练好的奖励模型中。奖励模型会为这个完整的序列输出一个**单一的标量奖励分数**。这个分数代表了人类对该响应的偏好程度。

### 3. 计算阶段
基于奖励和价值预测，计算用于更新 Actor 和 Critic 的回报、优势函数等。

Critic Model 会对生成序列中的每个状态（S_t，即到当前 token 为止的序列）预测一个价值 V(S_t)，这代表了从该状态开始的预期未来累积奖励。

### 4. 更新阶段
使用计算出的损失，同时更新 Actor Model 和 Critic Model 的参数。

- **Critic Model 的损失 (Value Loss)**：使用 Critic Model 预测的 V(S_t) 与计算出的目标回报（例如 R_final）之间的均方误差来更新 Critic Model。

- **Actor Model 的损失 (Policy Loss)**：使用 Critic Model 计算出的优势函数 A_t 来更新 Actor Model。优势函数指导 Actor 调整其策略，使其在给定状态下更有可能选择能带来更高预期回报的动作。PPO 还会引入一个 KL 散度项，以防止策略与原始的预训练模型偏离太远。

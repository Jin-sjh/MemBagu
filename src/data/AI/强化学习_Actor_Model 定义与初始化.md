---
category: 强化学习
topic: Actor Model 定义与初始化
type: bagu
tags: [强化学习, RLHF, PPO]
difficulty: medium
created: 2026-07-24
---
# 强化学习 Actor Model 定义与初始化

## 【问题】
什么是 Actor Model？在 RLHF 中如何定义和初始化 Actor Model？

## 【回答】

### 1. Actor Model 的定义
在 RLHF（基于人类反馈的强化学习）流程中，**Actor Model** 就是我们要训练的**目标语言模型**——最终产出的对话模型。

在 PPO 算法框架下，一共有四个模型参与训练：
- **Actor Model**（策略模型）：被训练的目标模型，负责生成回答。
- **Reference Model**（参考模型）：SFT 模型的冻结副本，用于计算 KL 散度惩罚，防止 Actor 偏离太远。
- **Critic Model**（价值模型）：预测每个 token 的预期回报值（V_t），指导 Actor 的更新方向。
- **Reward Model**（奖励模型）：对生成的回答给出奖励分数（R_t），是强化信号的来源。

### 2. Actor Model 的初始化
Actor Model 通常用 **SFT（Supervised Fine-Tuning）阶段产出的模型**进行初始化。

具体流程：
- **第一阶段（SFT）**：用高质量的人工标注对话数据对基座模型进行监督微调，让它学会基本的对话格式和回答风格。
- **第二阶段（RLHF）**：将 SFT 模型作为 Actor 和 Reference 的初始权重。Actor 可训练，Reference 冻结不变。

### 3. 为什么用 SFT 模型初始化？
- SFT 模型已经具备基本的对话能力，直接在这个基础上用强化学习微调，比从零开始训更稳定、更快收敛。
- 如果不做 SFT 直接从基座模型开始 RL，模型生成的回答质量太差，Reward Model 无法给出有效信号，训练难以收敛。
- 同时 Reference Model 也是同一个 SFT 模型，这样 KL 惩罚的起点就是"当前策略与 SFT 策略的偏差"，合理约束 Actor 不要变得过于极端。

### 4. Actor 与 Reference 的关系
- Actor 在训练中不断更新参数，试图最大化 Reward Model 给出的奖励。
- Reference 保持冻结，通过 KL 散度约束 Actor，防止它通过生成毫无意义的文本（如乱码、重复短语）来"欺骗" Reward Model（即 Reward Hacking）。
- PPO 的目标函数中包含 KL 惩罚项：`Reward - β * KL(Actor || Reference)`，确保 Actor 的生成分布不会偏离 SFT 策略太远。

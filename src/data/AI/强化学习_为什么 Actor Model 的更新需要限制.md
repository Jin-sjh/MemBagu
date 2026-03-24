# 为什么 Actor Model 的更新需要限制？

【问题】
为什么 Actor Model 的更新需要限制？

【回答】
Actor Model 的更新有两项需要限制：

1. **PPO 自身的约束**：限制 P(A_t|S_t)（新 Actor 模型）和 P_{old}(A_t|S_t)（旧 Actor 模型）之间的更新步伐。

2. **RLHF 中额外的约束**：限制 P(A_t|S_t)（新 Actor 模型）和 P_{ref}(A_t|S_t)（Reference 模型）之间的更新步伐。

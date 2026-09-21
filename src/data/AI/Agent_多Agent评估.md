---
category: Agent
topic: 多Agent评估
type: bagu
tags: [Agent, 多智能体, 评估, LLM-as-judge]
difficulty: medium
created: 2026-09-15
---

# 多Agent评估

## 【问题】
多 Agent 系统怎么评估？LLM-as-judge 要注意什么？

## 【回答】
**分层评估**：
- **单元**：单 Agent 的 I/O；
- **集成**：两两交互；
- **端到端**：任务成功率。

辅以 **LLM-as-judge 需防偏**（可能偏好冗长、格式讨好，且与裁判模型强相关），最好配**黄金集与人审**。

补充评测维度：准确性（任务是否完成）、鲁棒性（噪声/对抗/边界输入的成功率方差）、效率（步数/延迟/费用，如平均工具调用次数、Token）。评估集要**防数据泄漏**、与 CI 集成做回归。

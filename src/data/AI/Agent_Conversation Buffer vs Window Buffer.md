---
category: Agent
topic: Conversation Buffer vs Window Buffer
type: bagu
tags: [Agent, Memory, 短期记忆, Window Buffer]
difficulty: medium
created: 2026-09-15
---

# Conversation Buffer vs Window Buffer

## 【问题】
Conversation Buffer 和 Window Buffer 有什么区别？怎么取舍？

## 【回答】
- **Conversation Buffer**：把多轮 user/assistant 消息按时间顺序拼接，强调**完整保留**（直到触顶），信息保真度高，但对话越长越贵、越慢、越易注意力分散。
- **Window Buffer**：只保留**最近 k 轮或最近 n 个 token**，成本可控，但可能丢失早期关键约束（例如「不要用 Python」写在很前面）。

取舍：若任务强依赖「很久以前的一条约束」，纯 Window 会丢信息，需要配合**摘要或长期记忆检索**。可「关键句提取 + Window」：先抽取硬约束进 profile，再对对话做窗口截断。

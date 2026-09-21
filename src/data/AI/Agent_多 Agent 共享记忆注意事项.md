---
category: Agent
topic: 多 Agent 共享记忆注意事项
type: bagu
tags: [Agent, Memory, 多 Agent, 共享记忆]
difficulty: medium
created: 2026-09-15
---

# 多 Agent 共享记忆注意事项

## 【问题】
多 Agent 共享记忆要注意什么？

## 【回答】
- 区分**共享语义知识（可读多 Agent）与私有工作记忆（单 Agent）**；
- 写权限要审计；
- 避免一个 Agent 写入污染全局记忆——可用**命名空间、审批流、置信度门槛**；
- 检索的 `user_id` / `tenant_id` 过滤必须贯穿写入与检索，防止串数据。

记忆一致性问题（摘要与向量库条目冲突、重复记忆、旧偏好未删除）靠主键、版本号、合并策略、定期对账任务（reconciliation）解决。

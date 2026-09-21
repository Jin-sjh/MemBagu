---
category: Agent
topic: 多Agent一致性与契约测试
type: bagu
tags: [Agent, 多智能体, 一致性, 契约测试, OpenAPI]
difficulty: medium
created: 2026-09-15
---

# 多Agent一致性与契约测试

## 【问题】
多 Agent 会不会降低「一致性」（比如同一产品前后端接口对不上）？怎么防？

## 【回答】
**会**，所以需要：
- **单一契约源**（OpenAPI / JSON Schema）；
- **契约测试 Agent** 或静态检查；
- **状态机门禁**，不通过则卡住。

本质是让「接口契约」成为所有 Agent 共享的 Source of Truth，而不是各 Agent 各自脑补格式，从而避免前后端产出对不上、子 Agent 之间信息隔离导致的格式错位。

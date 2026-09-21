---
category: Agent
topic: 版本管理与技术债务
type: bagu
tags: [Agent, 版本管理, 技术债务, 分支策略]
difficulty: medium
created: 2026-09-15
---

# 版本管理与技术债务

## 【问题】
多组件 Agent 系统怎么管版本？快速迭代产生的技术债务怎么还？

## 【回答】
语义化版本 + 分支策略 + 债务分级偿还（以下为该文档工程实践口径）：
- **版本规范**：MAJOR 不兼容 / MINOR 新功能 / PATCH 修复；分支 main(可发)/develop/feature/*/hotfix/*。
- **多组件协调**：develop 冻结→release 分支→集成测→合 main→打 tag→部署；changelog 从 commit 自动生成。
- **技术债务识别**：Code Review 标 `TODO: tech-debt`、Sprint 回顾收集、静态分析检坏味道。
- **分级偿还**：P0 影响稳定/安全下个 Sprint 必解；P1 一月内；P2 机会主义；每 Sprint 预留 20% 工时还债，"童子军规则"随手修。
- 要点：**债务要可观测、可量化、有预算，否则会滚雪球**。

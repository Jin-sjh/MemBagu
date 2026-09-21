---
category: 大模型
topic: Prompt 版本管理
type: bagu
tags: [Prompt, 版本管理, 工程]
difficulty: medium
created: 2026-09-15
---
# Prompt 版本管理

## 【问题】
Prompt 怎么做版本管理？为什么 Prompt 像"软代码"？

## 【回答】
- **Prompt 是 Agent 的软代码**：行为策略（何时推理、调什么工具、什么格式）大量编码在 System / User Prompt 与模板里，变更需版本管理与评审。
- **版本管理做法**：用 Git 管理 Prompt 模板；与模型名、temperature 等参数一起记录元数据；线上灰度 + 回滚策略；配合评测集做回归。
- 原则：分层（核心规则短而硬、细节走检索），变更可回退、可 A/B。

---
category: Agent
topic: 敏感操作两阶段提交式工具设计
type: bagu
tags: [Agent, Function Calling, 敏感操作, HITL]
difficulty: medium
created: 2026-09-15
---

# 敏感操作两阶段提交式工具设计

## 【问题】
删除、转账、对外发邮件这类敏感操作，推荐怎么设计工具？

## 【回答】
推荐**两阶段提交**式工具设计：第一阶段生成草稿/待确认对象（如 `create_draft`），第二阶段在用户确认后再真正执行（如 `send`）。配合**人在回路（HITL）**或二次令牌，降低模型误触发损失。

也可把工具直接设计成「创建草稿」而非「直接发送」——即默认不直接产生副作用，确认后才落地。对条件触发（如仅当 `risk_score > 0.8` 才调用 `human_review`）可用规则引擎或小模型分类控制。

---
category: Agent
topic: LangGraph状态机
type: bagu
tags: [Agent, LangGraph, 状态机, 条件边, 图编排]
difficulty: medium
created: 2026-09-15
---
# LangGraph状态机

## 【问题】

LangGraph 是什么？和 LangChain AgentExecutor 怎么选？

## 【回答】

把 Agent 工作流画成**图**：节点是处理步骤（调模型、调工具、审核），边是流转关系，复杂业务需要分支、循环、人工确认时用图更直观。

选 LangGraph 而非 AgentExecutor 当流程不是「单一工具循环」，而是需要**多阶段流水线、条件路由、回环修复、人工审核节点、并行任务**时，图编排更清晰可维护。对比：控制流（偏固定循环 vs 显式图、分支/循环更自然）、可观测性（日志 vs 结构化节点轨迹）、人机协同（需额外封装 vs 易加 human 节点）。

## 【问题】

LangGraph 的条件边（Conditional Edge）解决什么业务问题？状态更新为什么要谨慎设计？

## 【回答】

条件边根据 **state 决定下一步去哪个节点**，例如失败重试、需要人工审核、不同客户等级走不同流程（`if needs_human_review: goto human; elif tool_error: goto repair; else: goto continue`）。

状态更新要谨慎因为**多节点写入同一字段可能冲突**，需要：**schema 约束**（TypedDict / dataclass）、**归约策略（append vs replace）**、明确每个节点的写入职责；多节点增量合并更新（reducer）避免全局覆盖。调试靠节点级日志、导出每步 state、可视化执行路径；图变复杂时用子图 / 模块化节点分层。

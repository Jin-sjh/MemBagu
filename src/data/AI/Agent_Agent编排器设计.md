---
category: Agent
topic: Agent编排器设计
type: bagu
tags: [Agent, 编排器, 状态机, 事件驱动, DAG]
difficulty: medium
created: 2026-09-15
---

# Agent 编排器设计

## 【问题】
企业级 Agent 系统里，编排器（Orchestrator）一般怎么设计？为什么引入状态机和事件驱动，而不是纯 LLM 链式调用？

## 【回答】
一种可落地的做法是**状态机 + 事件驱动 + 子任务 DAG**（以下为该文档的工程实践口径，可据项目裁剪）：
- **核心状态用状态机枚举**：如 INIT→INTENT_PARSED→PLANNED→EXECUTING→TOOL_CALLED→SYNTHESIZING→COMPLETED，**所有合法状态转换可枚举，便于 debug 与异常兜底**，比纯 LLM 链式调用更可控。
- **事件驱动解耦组件**：意图识别、检索、生成、工具调用等通过事件触发，**支持异步执行与并行工具调用，提升吞吐量**。
- **复杂任务拆成 DAG**：用 TaskPlanner 把任务拆成有向无环图，**支持并行子任务（如同时查库和调 API），减少总执行时间**。
- **可扩展**：新增工具只需实现 BaseTool 接口并注册到 ToolRegistry；新增流程通过配置管理，**不修改核心代码**。
- 关键权衡：**确定性关键路径用状态机/工作流，非关键路径交给 LLM 自主决策**，兼顾可控与灵活。

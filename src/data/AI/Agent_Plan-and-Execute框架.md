---
category: Agent
topic: Plan-and-Execute框架
type: bagu
tags: [Agent, 框架, Plan-and-Execute, 重规划]
difficulty: medium
created: 2026-09-15
---
# Plan-and-Execute框架

## 【问题】

Plan-and-Execute 框架是什么？和 ReAct 有什么区别？

## 【回答】

两阶段：**先制定计划（Planner），再逐步执行（Executor）**，像先列行程单再按天玩；执行中发现「景点关门」再改行程（Re-planning）。与 ReAct 的核心区别：

- **ReAct** 走一步看一步（**隐式、逐步规划**）；
- **Plan-and-Execute** 先有全局蓝图再落地（**显式、先全局后局部**）。

对比维度：规划（隐式 vs 显式）、灵活性（高 vs 中，依赖重规划）、成本（步数多时很高 vs 规划一次省盲目性）、风险（短视 vs 计划错误波及全局）。

## 【问题】

什么时候 Plan-and-Execute 比 ReAct 更占优？Re-planning 的「计划抖动」如何缓解？最大风险是什么？

## 【回答】

**何时占优**：任务**步骤多、结构清晰、需要全局分解**（多文件代码改动、数据分析流水线、复杂调研提纲）时，Planner 先给路线图减少「短视」；ReAct 更擅长动态工具交互、逐步探索。选型看任务是否强流程、是否需要可审计计划书、是否允许前期规划成本。

**缓解计划抖动**：**限制重规划次数**、**局部重规划优先**（只替换失败步骤之后的子计划）、在 state 中**保留已验证事实**、对计划变更加**一致性检查**（新旧差异说明）。

**最大风险**：**错误计划污染全局**——缓解靠可验证子步骤、重规划、强 Planner 约束输出（JSON schema）与执行期监控。Planner 输出不可靠时加结构化输出、自检清单、必要时用更强模型只做规划。Plan-and-Execute 常作上层模式，Executor 内部可再接 ReAct 或子 Agent。

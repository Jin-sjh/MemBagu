---
category: Agent
topic: Boss-Worker与Pipeline的本质差异
type: bagu
tags: [Agent, 多智能体, 协作模式, Boss-Worker, Pipeline]
difficulty: medium
created: 2026-09-15
---

# Boss-Worker与Pipeline的本质差异

## 【问题】
Boss-Worker 和 Pipeline 有什么本质差异？能混合吗？

## 【回答】
- **Pipeline 强调固定的阶段顺序与数据形态**：Agent A→B→C，上游输出作为下游输入（可加质检环）。适合文档/数据处理、固定 SOP，易测试每段 I/O；风险是错误逐级传递，难以处理需要「回到第一步重想」的大改动（需显式反馈边）。
- **Boss-Worker 强调动态任务图**：一个 Planner / Manager 负责任务分解、分配与汇总，Boss 可**按需增删子任务、并行派发**。更像项目经理排期；风险是 Boss 成为瓶颈与单点，规划错误会放大到全局。

两者**非常常见地混合**：例如 Boss 定阶段、阶段内 Pipeline、阶段间讨论。

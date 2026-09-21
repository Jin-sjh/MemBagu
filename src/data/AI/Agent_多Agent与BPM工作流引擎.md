---
category: Agent
topic: 多Agent与BPM工作流引擎
type: bagu
tags: [Agent, 多智能体, BPM, 工作流引擎]
difficulty: medium
created: 2026-09-15
---

# 多Agent与BPM工作流引擎

## 【问题】
企业里多 Agent 与「传统工作流引擎（BPM）」是什么关系？谁主谁辅？

## 【回答】
- **BPM** 管**确定性流程与人工节点**；
- **多 Agent** 管**需要语言推理与开放工具调用的步骤**。

常见架构：BPM 编排确定性 + LLM Agent 作为某一人工/自动活动；或 Agent 产出结构化决策，由 BPM 落账。

谁主谁辅？**强合规流程 BPM 主**；**强探索任务 Agent 主**，但要有护栏。企业落地形态（代码开发/数据分析/客服升级/文档审核）普遍是职责分离 + 合规 + 可审计 + SLA。

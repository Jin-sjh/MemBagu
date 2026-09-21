---
category: Agent
topic: 动态任务分配vs固定Pipeline
type: bagu
tags: [Agent, 多智能体, 任务分配, Pipeline, 动态分配]
difficulty: medium
created: 2026-09-15
---

# 动态任务分配vs固定Pipeline

## 【问题】
动态任务分配和固定 Pipeline 各适合什么场景？动态会不会不可控？

## 【回答】
- **固定 Pipeline** 适合 **SOP 稳定、输入输出契约清晰**（如审核流水线）；
- **动态分配** 适合**探索性任务**（研究、故障排查），中间可能发现新子问题（如发现需要法律审查则插入新 Agent）。

工程上常**混合**：主干 Pipeline + 动态插入节点。

动态会不会不可控？需要**预算、最大深度、允许的工具白名单**与**人类在环**。

补充常见分配策略：按能力（skill-based 为 Agent 声明能力标签做匹配度打分）、按负载（看队列深度/进行中任务数/最近失败率选最空闲且健康）、竞拍（Contract Net，任务广播招标，Boss 按成本/ETA/置信度选标，适合异构资源）。

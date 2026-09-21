---
category: Agent
topic: Agent与Chain与ChatBot区别
type: bagu
tags: [Agent, Chain, ChatBot, 控制流]
difficulty: medium
created: 2026-09-15
---
# Agent与Chain与ChatBot区别

## 【问题】

Agent、Prompt Chain 和 ChatBot 这三者的本质区别是什么？

## 【回答】

关键在**控制流由谁掌握**：

- **ChatBot（聊天机器人）**：以对话为主，核心是「接话与回复」，通常没有多步任务闭环和工具编排，控制流多为线性对话。
- **Prompt Chain（链）**：开发者**预先写死步骤顺序**（DAG / 序列），路径相对固定，工具只能嵌在固定节点；**控制流在代码里**。
- **Agent（智能体）**：模型在运行时于**动作空间中自主选择下一步**、依赖环境返回的 Observation 更新信念，可分支、可重试、可换工具；**控制流在模型决策 + 环境反馈里**（代码只设边界）。

一句话总结：**Chain 的控制流在代码，Agent 的控制流在模型决策加环境反馈**。ChatBot 加了插件不一定是 Agent——若插件由固定规则触发只是「带工具的 Bot」，只有模型在多步推理中自主选工具并形成反馈闭环才贴近 Agent。

## 【问题】

RAG + Chat 算不算 Agent？固定三步 RAG 流水线是 Chain 还是 Agent？

## 【回答】

- 单次检索再回答偏「**增强型 Chat**」；若具备**多轮检索策略**（查不到换查询、分解子问题、交叉验证）则具备 Agent 特征。
- 固定三步 RAG 流水线（query 改写 → 检索 → 生成）若**没有基于观察的再决策循环**，更像 **Chain**；加入**多轮检索策略与失败分支**才接近 Agent。
- **名称不重要，讲清架构即可**——重点说清是否存在「行动—观察」循环。

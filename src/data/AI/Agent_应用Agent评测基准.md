---
category: Agent
topic: 应用Agent评测基准
type: bagu
tags: [Agent, 评测, WebAgent, SWE, 科学Agent, 对话Agent, Generalist]
difficulty: medium
created: 2026-08-01
---

# 应用Agent评测基准

## 【问题】
Web Agent 有哪些代表性评测基准？各有什么特点？

## 【回答】
- **WebShop**：早期简化模拟，提供模拟电商环境，从搜索到结账，强化学习背景但启发 agent 评测。
- **Mind2Web**：首个跨域真实网站数据集，提供离线环境，支持**富交互与中间目标评估**，对比预测动作与 gold 动作（但离线、静态）。
- **WebArena**：含多个功能站点的**动态环境**，配辅助工具与功能正确性测试，是大多数 web agent 评测的基础。
- **Online-Mind2Web**：更严格的在线替代方案。
- **WebVoyager**：多模态、真实在线评测，受到关注；但近期研究指出其**性能估计过于乐观**，Online-Mind2Web 更严格。

## 【问题】
软件工程（SWE）Agent 的评测基准有哪些？各自定位？

## 【回答】
- **SWE-bench**：基于**真实 GitHub issue**的端到端框架，含仓库上下文、可执行环境与验证测试，是奠基性工作。
- **SWE-bench Verified**：500 条人工过滤的高质量子集，容器化、标准化，已成为**事实标准**。
- **SWE-Lancer**：收集 1400 个 Upwork 自由职业任务、总报酬超 **$1M**，含技术修复（SWE）与管理决策（Spec），模型 **Pass@1 仍低于 25%**。
- **SWE-bench Pro**：1865 条人工验证任务、跨 41 个仓库、常需多文件编辑。
- **Terminal-Bench**：聚焦 agent 在交互式终端中的命令熟练度。

## 【问题】
科学（Scientific）Agent 的评测覆盖哪些环节？代表基准？

## 【回答】
覆盖完整科研流水线：(1) **科研构思（Ideation）**，如 AAAR-1.0 评估新颖的专家级想法；(2) **实验设计**，如 AAAR-1.0 评估系统性实验规划；(3) **代码生成**，如 **SciCode、ScienceAgentBench、CORE-Bench、PaperBench** 测试可执行的科研代码；(4) **同行评审**，评估生成高质量评审的能力。整体趋势是覆盖完整研究周期、评估创新性的科学发现能力。

## 【问题】
对话（Conversational）Agent 的评测基准有哪些？

## 【回答】
基于任务导向对话系统（TODS）扩展：
- **τ-Bench**（Sierra）：评估 agent 用 API 工具与模拟用户交互、遵守领域策略（零售 / 航空客服），但规模有限、忽略策略违规。
- **τ2-Bench**：引入 Telecom 域、共享动态环境与可组合任务生成器，更易扩展。
- **IntellAgent**：从数据库 schema 与策略文档**自动合成**测试场景，与 τ-Bench 人类标注高相关。
- **ALMITA**：从用户意图 + LLM 生成图、再人工过滤，生成多样客服场景。

## 【问题】
通用 Agent（Generalist）评测基准有哪些？为何需要"通用"基准？

## 【回答】
通用 agent 需综合能力而非单一技能，代表基准：
- **GAIA**：由需复杂工具使用的真实问题组成（人类易、agent 难）。
- **OSWorld**（UI 交互）、**AppWorld**（代码 / API 调用）、**TheAgentCompany**、**AgentBench**（跨 OS / 数据库 / 游戏 / 家务的交互环境）。
- **HAL（Holistic Agent Leaderboard）**：跨域统一平台。

近期 **Harbor、Exgentic** 提供统一协议，做跨环境的标准化 agent 评估；**Gaia2** 作为移动环境版本。

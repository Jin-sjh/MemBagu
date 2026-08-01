---
category: Agent
topic: 核心能力评测基准
type: bagu
tags: [Agent, 评测, 规划, 工具调用, 自我反思, 记忆, Benchmark]
difficulty: medium
created: 2026-08-01
---

# 核心能力评测基准

## 【问题】
规划与多步推理（Planning & Multi-Step Reasoning）能力如何评估？代表基准有哪些？

## 【回答】
规划使 agent 能把问题**拆解为更小的子任务**并制定战略执行路径。评估演进如下：

- 早期推理基准如 **HotpotQA** 用于评估 ReAct 类 agent 方法。
- 更专门的 **PlanBench** 改造经典规划任务，揭示 LLM 在**长程规划（long-term planning）**上的短板。
- **FlowBench** 评估 agent 遵循结构化工作流的能力；**NaturalPlan** 聚焦用自然语言描述的现实规划任务，强调带可验证约束的长程规划。
- 结论：**即便 SOTA 模型也在长程规划上挣扎**（struggle with long-horizon planning）。

## 【问题】
函数调用与工具使用（Function Calling & Tool Use）如何评估？代表基准？

## 【回答】
该能力包含若干协同子任务：意图识别、函数选择、参数值对映射。评估演进：

- 早期 **ToolAlpaca、ToolBench、BFCL v1（Berkeley Function Calling Leaderboard）** 依赖合成数据与规则匹配，测通过率与结构准确率，且多为一步交互。
- **BFCL v2 / v3** 引入**多轮交互、组织化工具、多步逻辑与持续状态管理**。
- **NESTFUL** 引入调用相互依赖的场景；**ComplexFuncBench** 要求隐式参数推断、遵守用户自定义约束、并高效处理长上下文。
- 前沿基准 **Scale 的 MCP Atlas、Tool-Decathlon** 从**真实 MCP server**取材，推动 MCP 工具调用评估。尽管模型进步显著，这些基准**仍具挑战性**。

## 【问题】
自我反思（Self-Reflection）能力如何评估？目前缺口在哪？

## 【回答】
自我反思让 agent 基于反馈**动态调整推理或动作**以自我纠正。在 agentic 设定中：

- **LLM-Evolve** 复用历史反馈作为 in-context 样例，评估自我反思能力。
- **LLF-Bench** 利用反馈评估多样环境中的决策能力。

论文明确指出：**缺乏标准化的自反思评估基准或方法论，仍是一个关键缺口（critical gap）**。

## 【问题】
记忆（Memory）能力如何评估？记忆分哪几类？

## 【回答】
记忆使 agent 能在长程交互中**管理与推理信息**，分为三类：

- **情节记忆（episodic）**：过往交互。
- **语义记忆（semantic）**：事实性知识。
- **程序记忆（procedural）**：操作信息。

评估演进：早期用长上下文基准（如 LongBench 类）评估；近期出现专用 agentic 记忆基准——情节记忆评估 agent 如何利用先验交互与反馈支持持续改进（如 **StreamBench、MemBench**）；语义记忆评估检索有效性与长程理解，揭示当前方法在**维持长程一致性与处理动态记忆上仍有限**；另有 **MemoryAgentBench**。

---
category: Agent
topic: 评估定义与拆解
type: bagu
tags: [Agent, 评测, Eval, 评分器, 非确定性]
difficulty: medium
created: 2026-07-29
---

# 评估定义与拆解

## 【问题】
为什么评估 AI Agent 比评估普通大模型更难？没有评估会带来什么问题？

## 【回答】
Agent 具备**多轮操作能力**——会调用工具、修改环境状态、基于中间结果调整策略。正是这些让 Agent 有用的特性（**自主性、智能、灵活性**）让它变得难以评估。

没有评估的团队容易陷入**被动反应循环**：只能在**生产环境**里发现问题，而且**修一个故障往往会引发其他故障**。优秀的评估能帮助团队更自信地发布，从「盲飞」变成「有明确成功定义、能自动回归测试」。

## 【问题】
一个 Agent 评估（eval）的基本结构包含哪些核心概念？

## 【回答】
评估是对 AI 系统的测试：给定输入，应用评分逻辑衡量成功与否。核心概念：

- **任务（Task / Test case）**：有**明确输入和成功标准**的单个测试。
- **试验（Trial）**：对任务的**一次尝试**；因模型输出有差异，需多次运行才能得一致结果。
- **评分器（Grader）**：对代理性能某方面**打分的逻辑**；一个任务可有多个评分器，每个含多个断言（checks）。
- **转录文本（Transcript / Trace / Trajectory）**：试验的**完整记录**（输出、工具调用、推理、中间结果）；在 Anthropic API 中即 eval 运行结束时的完整 messages 数组。
- **结果（Outcome）**：试验结束时**环境中的最终状态**（如航班是否真实存在于数据库，而非文本说「已预订」）。
- **评估工具链（Evaluation harness）**：端到端运行评估的基础设施（提供指令/工具、并发运行、记录步骤、评分、汇总）。
- **代理工具链（Agent harness / Scaffold）**：使模型充当代理的系统；评估「代理」即评估 **harness 与 model 的结合**，同一模型 harness 不同成绩可差几十个点。
- **评估套件（Evaluation suite）**：为衡量特定能力/行为收集的任务集合（如客服套件测退款、取消）。

## 【问题】
评分器（Grader）有哪几种类型？各自的优劣势是什么？

## 【回答】
分三大类，按「确定性程度」从强到弱排列：

- **基于代码的评分器（Code-based）**：字符串匹配、二元测试、静态分析、结果验证、工具调用验证、转录分析。**优势**：快、便宜、客观、可复现；**劣势**：对有效变体脆弱、缺乏细微判断。
- **基于模型的评分器（Model-based）**：rubric 评分、自然语言断言、成对比较、基于参考评估、多法官共识。**优势**：灵活、可扩展、捕捉细微差别；**劣势**：**非确定性**、较贵、需人工校准。
- **人工评分器（Human）**：SME 审查、众包、抽查、A/B、标注者间一致性。**优势**：**黄金标准**；**劣势**：贵、慢。

评分可加权、二元或混合。

## 【问题】
能力评估（Capability evals）和回归评估（Regression evals）有什么区别？两者如何转化？

## 【回答】
- **能力/质量评估**：回答「代理能做好什么？」起始**通过率低**，提供改进空间。
- **回归评估**：回答「是否仍处理旧任务？」应当**通过率近 100%，防止倒退**。

**高通过率的能力评估可以「毕业」成回归套件**——即一个能力任务稳定通过后，纳入回归集长期守住，防回退。

## 【问题】
编码类 Agent 和对话类 Agent 分别怎么设计评分器？有没有统一的配置格式？

## 【回答】
两类都可用**结构化 YAML**描述任务与评分器。

**编码 Agent**：依赖明确任务、稳定测试环境、彻底测试，确定性评分器自然适用（如 **SWE-bench Verified、Terminal-Bench**）。除结果外也评估转录文本（代码质量启发式、LLM rubric 评估工具调用）。示例（修复认证绕过漏洞）：

```yaml
task:
  id: "fix-auth-bypass_1"
  desc: "Fix authentication bypass when password field is empty and ..."
  graders:
    - type: deterministic_tests
      required: [test_empty_pw_rejected.py, test_null_pw_rejected.py]
    - type: llm_rubric
      rubric: prompts/code_quality.md
    - type: static_analysis
      commands: [ruff, mypy, bandit]
    - type: state_check
      expect:
        security_logs: {event_type: "auth_blocked"}
    - type: tool_calls
      required:
        - {tool: read_file, params: {path: "src/auth/*"}}
        - {tool: edit_file}
        - {tool: run_tests}
```

**对话 Agent**：常需**第二个 LLM 模拟用户**（如 **τ-Bench、τ2-Bench**）。成功多维——工单解决（状态检查）、<10 轮（转录约束）、语气恰当（LLM rubric）。示例（处理不满客户退款）：

```yaml
graders:
  - type: llm_rubric
    rubric: prompts/support_quality.md
    assertions:
      - "Agent showed empathy for customer's frustration"
      - "Resolution was clearly explained"
      - "Agent's response grounded in fetch_policy tool results"
  - type: state_check
    expect:
      tickets: {status: resolved}
      refunds: {status: processed}
  - type: tool_calls
    required:
      - {tool: verify_identity}
      - {tool: process_refund, params: {amount: "<=100"}}
      - {tool: send_confirmation}
  - type: transcript
    max_turns: 10
```

两类都会 `tracked_metrics` 跟踪 token 数、轮数、延迟等成本类指标。

## 【问题】
研究类 Agent、计算机使用类 Agent 分别怎么评估？

## 【回答】
- **研究类 Agent（Research agents）**：收集、综合、分析信息，质量较主观（如 **BrowseComp**）。策略：groundedness（有据可依）检查、coverage（覆盖）检查、source quality（来源质量）检查；客观答案用精确匹配；LLM 标记无支持的声明；需频繁人工校准。
- **计算机使用类 Agent（Computer use agents）**：通过 GUI（截图、鼠标等）交互。需在**真实或沙箱环境**验证结果（**WebArena、OSWorld**）；要平衡 token 效率与延迟（DOM 与截图的选择）。

## 【问题】
为什么 Agent 评估要关注非确定性？pass@k 和 pass^k 有什么区别？

## 【回答】
因模型输出有随机性，单次试验结果几乎无统计意义，需用多次试验汇总。

- **pass@k**：k 次尝试中**至少一次成功**的概率（k=1 即 pass@1）。适合「**一次成功即可**」的工具型场景。
- **pass^k**：k 次尝试**全部成功**的概率。适合**需要一致性**的客户面代理（每次都得稳）。

k=1 时两者相等；k=10 时 pass@k 接近 100%，而 pass^k 接近 0%——所选指标直接反映产品对「稳定性」的要求。

## 【问题】
从零搭建一套高质量 Agent 评估，有哪些关键步骤（路线图）？

## 【回答】
分四阶段共八步：

**收集任务（Step 0–3）**
- **Step 0 尽早开始**：20–50 个简单任务即可，源自真实故障。
- **Step 1 从手动测试起步**：把 bug 跟踪器 / 支持队列转化为测试用例。
- **Step 2 写明确任务与参考解**：两专家独立判同；建参考解证明可解且评分器正确；**0% pass@100 多为任务损坏信号**。
- **Step 3 建平衡问题集**：同时测「应做」与「不应做」，避免类别不平衡。

**设计工具链与评分器（Step 4–5）**
- **Step 4 稳健 harness + 稳定环境**：每次试验**干净隔离**，防共享状态导致相关失败或虚高。
- **Step 5 精心设计评分器**：**优先确定性，必要用 LLM，谨慎用人**；避免 rigid 步骤检查（惩罚创造性），用 partial credit；LLM-judge 需人工校准、给「Unknown」出口、结构化 rubric；防作弊；警惕评分 bug（Opus 4.5 在 CORE-Bench 从 42%→95% 的评分器 bug 案例）。

**长期维护（Step 6–8）**
- **Step 6 查转录**：读 transcript 验证评分公平性与代理真实错误。
- **Step 7 监控饱和**：100% 无改进信号（如 SWE-Bench Verified 趋饱和）；不盲目信分数。
- **Step 8 开放贡献与维护**：专属团队管基础设施，领域专家贡献任务；实践「评估驱动开发」。

## 【问题】
评估应和其他方法怎么结合？自动评估之外还需要什么？

## 【回答】
类比「瑞士奶酪模型」，多层互补：

- **自动评估**：快、可复现、无用户影响；需前期投入、可能虚假自信。
- **生产监控**：抓合成漏掉的真实问题；被动、噪声。
- **A/B 测试**：实测用户结果；慢、需流量。
- **用户反馈**：捕捉未预见问题；稀疏、偏严重。
- **人工转录审查**：建直觉、抓细微；不规模、定性。
- **系统人工研究**：黄金标准；贵慢。

## 【问题】
有哪些常用的 Agent 评估框架（Eval frameworks）？

## 【回答】
- **Harbor**：容器化运行代理，规模化试验，标准任务/grader 格式；Terminal-Bench 2.0 通过其注册表。
- **Braintrust**：离线评估 + 生产可观测 + 实验跟踪；autoevals 库预建评分器。
- **LangSmith**：追踪、离/在线评估、数据集管理，深度集成 LangChain。
- **Langfuse**：自托管开源替代。
- **Arize Phoenix**：开源追踪/调试/评估，AX 为 SaaS 扩展。

核心提醒：**框架只加速，真正的价值在高质量测试用例与评分器的持续迭代**。

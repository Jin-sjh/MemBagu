---
category: Agent
topic: Claude Code Dynamic Workflows
type: bagu
tags: [Agent, Claude Code, Dynamic Workflows, Workflow, Subagent, Harness Engineering, Orchestration, 编排, 可执行实验设计, 审计]
difficulty: medium
created: 2026-08-12
---

# Claude Code Dynamic Workflows

## 【问题】
什么是 Claude Code 的 Dynamic Workflows？它是什么时候发布的？

## 【回答】
Dynamic Workflows 是 Anthropic 在 **2026 年 5 月 28 日**随 Claude Code 推出的 **research preview** 功能。表面看像「多派几个 subagent」，但真正的重点是：**编排逻辑开始被写成一段可执行的脚本**。

官方定义很直接：workflow 是 **Claude 写出来的一段 JavaScript script**，由 **runtime 在后台执行**，脚本里用 **`agent()`、`parallel()`、`pipeline()`** 这些原语去编排 subagents。作者把它称为「Harness 的 Skill 时刻」——因为 Harness 很难有通用解法，需要按仓库配置、团队习惯、需求场景**动态组织流程**，而 Dynamic Workflow 正是让复杂任务能够动态编排的关键。

## 【问题】
Dynamic Workflow 的 workflow script 有什么关键边界？它自己不做什么？

## 【回答】
最关键的一条边界：**workflow script 自己不直接读文件、不直接跑 shell、不直接改代码**。真正做工程动作的是被 `agent()` 拉起来的 subagent。script 更像一个**小型调度程序**，只负责**循环、分支、并发、汇总、重试和末端 reducer**。

这也是它和普通 subagent 最大的差异：普通 subagent 的结果会回到 Claude 主上下文，Claude 读完再决定下一步；而 workflow 的结果先进**脚本变量**，脚本可以继续 filter、map、reduce、cross-check，**只把压缩过的答案交回来**。

## 【问题】
Dynamic Workflow 的运行时架构可以拆成哪几层？

## 【回答】
从工程实现看可以拆成六层，核心好处是**控制流交给确定性脚本，语义判断交给模型 worker**，模型不需要一直把所有中间结果塞进主对话上下文：

- **父 Agent**：负责把任务转成 workflow script。
- **审批层**：展示 raw script、phase、风险提示和 token 消耗预期，由用户批准。
- **运行时**：解析脚本、限制 capability、执行控制流。
- **subagent factory**：为每个 `agent()` 创建独立 session。
- **结构化输出**：让 worker 用 schema 返回机器可读结果。
- **run store**：保存 `wf_*.json`、agent transcript、progress、tokens、tool calls。

## 【问题】
本地落盘能看到什么？run store 为什么让 progress 变成可审计产物？

## 【回答】
本机 Claude Code 的 workflow 目录在 `/Users/<user>/.claude/projects/<repo>/<id>/workflows`，里面有 `wf_*.json` 和 `scripts/*.js`；subagent transcript 另存到 `subagents/workflows/{runId}/agent-*.jsonl`。

一条成功的 workflow，`wf_*.json` 会记录这些字段：`runId`、`taskId`、`scriptPath`、`agentCount`、`durationMs`、`workflowName`、`status`、`phases`、`defaultModel`、`workflowProgress`、`totalTokens`、`totalToolCalls`。其中一次 run 只有 **2 个 agents**，却用了 **169,437 tokens** 和 **39 次 tool calls**（`run-harness` 用 `claude-sonnet-4-6` 跑测试和读产物，`judge-report` 用 `claude-opus-4-8[1m]` 做多模态质量评审）。

更重要的是一个**失败 run**：先并行启动 product-flow、risk-based、visual-regression 三个 lens agent，synthesis agent 连续 stalled，retry 多次后失败；但前面完成的 worker transcript 和 result preview 都留下来了。这说明 **progress 已经是可审计产物，不只是临时 UI 状态**——workflow 失败了，证据不丢。

## 【问题】
一个典型的 workflow 脚本长什么样？核心机制是什么？

## 【回答】
本地典型的 `xxx-wf_*.js` 脚本结构：第 1–9 行是 `export const meta`，定义 workflow name、description 和 Run/Judge/Summarize 三个 phase；第 11–36 行定义 `RUN_SCHEMA`，要求第一个 agent 返回 `runDirectory`、`reportPath`、`summaryPath`、`scorecardPath`、`baselineMode`、`failedSuites`、`highlights` 等结构化字段；随后进入 Run 阶段启动 `run-harness` agent，Judge 阶段把 `JSON.stringify(run)` 传给 `judge-report` agent，最后只返回 `{ run, judge }`。

这几行代码已经把机制讲透：**script 自己不跑 Playwright，它只调度一个测试 worker，拿到结构化结果，再调度一个评审 worker**。中间的 `run` 就是 workflow 的价值所在——它**不用先挤进主上下文**。fan-out/fan-in 模式则是 `parallel(lenses.map(l => () => agent(...)))`，传函数给 runtime 调度，再把所有 proposals 交给 synthesis agent 做去重、评分和仲裁。

## 【问题】
开源复现（Pi、OpenHands）揭示了什么共同设计原则？运行时如何收窄 capability？

## 【回答】
两个复现（Michael Livs 的 `pi-dynamic-workflows`、OpenHands 的 PR #3426）共同指向同一个设计：**生成代码可以做编排，但运行时必须收窄 capability，否则 workflow 会变成一段模型写的任意代码**。

- **Pi（TypeScript）**：`runWorkflow()` 把并发上限压到 **16**；Node **`vm` context 只暴露 `agent`、`parallel`、`pipeline`、`log`、`phase`、`args`、`cwd`、`budget`、JSON 和基础对象**，再把脚本包成 async IIFE 在 sandbox 里执行。schema 起作用的方式是给 subagent 注入 `structured_output` tool，每次 `agent()` 创建 fresh in-memory session，输出契约写进 prompt——必须调用 `structured_output`，不要再输出散文式答案。
- **OpenHands（Python）**：用 `asyncio.gather` 并发跑多个 item，失败后聚合成 `ExceptionGroup`；安全层做 **AST validation**，拒绝 import、dunder、私有 `wf` 访问、`wf.close()`、`open`、`exec`、`eval`、`__import__`，再 compile/exec 并加**一小时 timeout**。

## 【问题】
什么场景值得用 Dynamic Workflows？什么场景不值得？

## 【回答】
它**会烧 token**（2 个 agents 就能轻松超过十几万 tokens），所以只适合**高决策价值任务**：

- **大规模迁移**：框架升级、API deprecation、语言迁移。
- **代码库级审计**：安全扫描、测试覆盖审计、dead code cleanup。
- **多源研究**：搜索、抓取、claim extraction、cross-check、带引用报告。
- **高风险方案评审**：多个 planner 独立出方案，再交给 reviewer 找反例。
- **UI 或质量验收**：先跑 harness，再让 judge 读取 report、scorecard、screenshot、diff。

**不值得用**的：单文件小修、低信息增益穷举。特别是为了补齐实验表格、让 ablation 看起来完整而跑一堆分支，会把 workflow 最贵的部分用在最没价值的地方。

## 【问题】
怎么把 Dynamic Workflow 当成「可执行实验设计」来用？每个 branch 该怎么设计？

## 【回答】
把它当成**「可执行实验设计」**来用：每个 branch 都要回答一个**会改变决策的问题**，比如「能不能验收这次基线」「哪种迁移策略风险最低」「这个 finding 是否可复现」。**如果答案不会影响下一步，那个 branch 就不该存在。**

这把编排从「并发数量 / 角色拆分 / 上下文隔离」的层面，提升到了「编排本身可以被生成、保存、复跑、审计」的层面。大任务不只怕慢，更怕中间证据散掉、判断口径乱掉、结论来路说不清——Dynamic Workflows 补的正是这块。

## 【问题】
Dynamic Workflow 对 Agent 工程化的意义是什么？它能替代 Harness 吗？

## 【回答】
它让 Agent 产品往更工程化的方向走：之前讨论 subagent，焦点常是并发数量、角色拆分、上下文隔离；现在多了一层更实在的东西——**编排本身可以被生成、保存、复跑、审计**。它没法当万能按钮，更像一个「会写调度脚本的 Claude」，把复杂任务拆成一棵可执行的工作树：**worker 负责拿证据，reviewer 负责找问题，reducer 负责收束结论，runtime 负责状态和边界**。

它**不替代 Harness**——Harness 提供执行平面（系统提示、工具权限、沙箱、hooks 等），Dynamic Workflow 是站在 Harness 之上接管「流程怎么持续往前走」的一层编排能力。价值在于用在需要验证和决策的地方，让复杂任务的证据可沉淀、口径可统一、结论可溯源。

## 【衍生问题】
- Claude Code Workflows 的 `parallel()` 与 `pipeline()` 在并发模型、错误传播（如 OpenHands 的 `ExceptionGroup`）上具体有何差异？（待补充）
- run store 落盘的 `wf_*.json` 字段中 `phases` 与 `workflowProgress` 的完整状态机是什么？（待补充）
- Dynamic Workflows 与 Anthropic 官方文档（code.claude.com/docs/en/workflows）描述的能力边界、限流和 token 预算（`budget` 原语）如何配置？（待补充）

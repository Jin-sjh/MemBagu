---
category: Agent
topic: Agentic Harness Engineering
type: bagu
tags: [Agent, Harness, AHE, 可观测性, 自进化, 证据驱动修改, 跨模型泛化, 渐进式披露, 事实比策略]
difficulty: hard
created: 2026-08-12
---

# Agentic Harness Engineering

## 【问题】
什么是 Agentic Harness Engineering (AHE)？它想解决 Harness Engineering 里的什么根本问题？

## 【回答】
AHE 是复旦大学、北京大学、上海奇绩智峰团队提出的**可观测性（Observability）驱动的 Harness 自动优化方法**，端到端贯穿 Harness Engineering 全流程，对应论文 *Agentic Harness Engineering: Observability-Driven Automatic Evolution of Coding-Agent Harnesses*（arxiv 2604.25850，代码 github.com/china-qijizhifeng/agentic-Harness-engineering）。

它要解决的核心矛盾是：模型以**月为单位**进化、任务场景往**长尾**分布发展，但 Harness 的进化与迭代却**高度依赖人工经验**。真正的问题是——在 Harness Engineering 的迭代循环里，**哪些部分可以被自动化？如何让 Harness 自动从经验中学习并改进？** AHE 的答案是把优化目标、动作空间、状态空间以 agent 可读的方式呈现，让 agent（Evolve Agent）接手一部分人类工作，实现 harness 的自动演化。

实验上，用 GPT-5.4，AHE 在 Terminal-Bench 2 的 pass@1 分数从 **69.7% 迭代到 77.0%**；GPT-5.5 发布后又迅速迭代出适配 Harness，在 Leaderboard 上位列**全球第三**。

## 【问题】
理解 Harness 有三种视角（形态 / 目的 / 方法论），分别是什么？为什么 AHE 强调"让 agent 参与优化"？

## 【回答】
- **形态视角**：模型与 Harness 共同构成"主体-环境"交互。模型行为发生在**概率空间**（信息压缩、智能发生、不确定性来源），Harness 是包裹在外的**确定性组件**：system prompt、工具定义与实现、middleware/hook、skill 文档、sub-agent 编排、长期记忆、日志与观测。在长程生产力任务里，Harness 是让模型行为**稳定、一致、可控**的保证。
- **目的视角**：Harness 在模型与环境间管理一条**双向上下文流**——一侧把任务/用户意图/环境状态/外部信息传进模型，另一侧把模型动作忠实记录、校验后交回环境执行。过去靠人手动复制 terminal 输出、外部文档，依据直觉决定 context 构成。
- **方法论视角**：最直接的是**独立优化各组件（Agent Infra）**；更深一层是把它看成**模型 × Harness × 环境**的组合优化问题，要开发、观测、迭代反复调整；再进一步就是**让 agent 本身参与自主优化**——因为人类注意力稀缺，必须引入 agent 才能持续迭代。

AHE 的出发点正是第三层：**只要把优化目标、动作空间、状态空间以 agent 可读方式呈现，就能引入 agent 做自主优化**，前提是做好 context 的结构化、层次化、可观测。

## 【问题】
AHE 的可观测体系由哪"三个角色 + 三部分"构成？

## 【回答】
三个角色：Coding Agent（运行测试）、Agent Debugger（整理轨迹）、Evolve Agent（修改 Coding Agent 的 Harness 使之进化）。

整个可观测体系分三部分，分别对应不同对象的"可观测"：
1. **组件可观测性**：NexAU 提供各部分解耦的 Harness，让 Harness 组件本身可观测。
2. **经验可观测性**：Agent Debugger 把 **10M token 量级**的 raw trace 提炼成分层、可溯源的多维反馈意见，变成可消费资产。
3. **决策可观测性**：Evolve Agent 基于 git 溯源的组件历史与反馈结果，构建**证据驱动的完整修改链路**，对组件做修改。

设计上**不限制 agent 的自主决策空间**，只依赖评测结果 + 分层信息来辅助它精准修改、准确归因。

## 【问题】
组件可观测性：NexAU 的"声明式解耦 Harness"具体怎么拆？Coding Agent 为什么要从一个"零先验"形态起步？

## 【回答】
NexAU 把 Harness 拆成**七种正交的文件级组件**，每个都是独立文件、有明确挂载点、彼此结构解耦：
- System Prompt、Tool Description、Tool Implementation、Middleware、Skill、Sub-agent Config、Long-term Memory。

这种解耦的妙处是让 **"失败模式 → 单一组件" 的映射极其清晰**。所有修改经 **Git 版本管理**，每次变更都是一次可追溯、可审计、可回滚的 commit。

Coding Agent 故意从一个**"零先验"极简形态**起步：只有一个 `run_shell_command` 工具，**没有任何 Middleware、Skill 或 Sub-agent**。目的就是确保后续每一次新增组件、每一次 Prompt 改写，都能被**干净地归因**——不会出现"多个改动叠在一起不知道是哪个起作用"的困境。

## 【问题】
经验可观测性：Agent Debugger 怎么把 10M token 的原始轨迹变成 Evolve Agent 能消费的东西？

## 【回答】
一次完整评测的原始轨迹动辄数千万 Token，直接丢给 Evolve Agent 会瞬间淹没它的上下文窗口，什么代码都改不了。AHE 用一条**分层提炼流水线（渐进式披露）**解决：

- **底层**：完整记录所有原始轨迹（不丢信息）。
- **中层**：由 Cleaner 去除重复的工具输出。
- **上层**：通过一个 QA Sub-agent，针对每道题的多次 rollout 结果**自动切换提问策略**做分析。
- 最后所有单题分析汇聚成一份约 **10K Token 的概览报告**交给 Evolve Agent。

本质是**渐进式披露**：Evolve Agent 默认只看概览，需要核实结论时可回溯原始轨迹。10M 级数据由此变成**可并发、可消费、可审计**的经验资产。

## 【问题】
决策可观测性：Evolve Agent 的"证据驱动修改"原则是什么？为什么能保证稳定进化？

## 【回答】
Evolve Agent 设计极其克制，原则有两条：

1. **只改 workspace 内的 Harness 组件文件**；评测框架、LLM 配置、原始 System Prompt 均为**只读**，杜绝任何绕过评测的 hacking 行为。
2. **每次修改必须附带一份"变更清单"**：失败的证据（具体哪些任务失败）、推断的根因、针对性修改方案、以及**自我声明的预测**（预计修复哪些任务、可能破坏哪些任务）。下一轮评测充当验证者：预测正确的修改保留，预测错误的修改**自主决定回滚**。

效果是：每一次 Harness 变动不再是工程师的直觉/抽象经验，而是一条**可被下一轮实验证伪的假说**。Harness 进化由此**从艺术走向工程，从经验走向科学**。

## 【问题】
AHE 的实验结果如何？跨任务 / 跨模型泛化证明了什么？

## 【回答】
主实验（GPT-5.4 + Terminal-Bench 2）：pass@1 从 **69.7% 提升到 77.0%**，**绝对 +7.3 个百分点、相对 +10.5%**。不仅超过同模型 OpenAI 官方 Codex-CLI（71.9%），也显著优于 ACE、Training Free-GRPO 等基线。

两个泛化结果最关键，说明**没有 overfit 评测集**：
- **跨任务泛化**：把 Terminal-Bench 2 演化得到的 Harness 冻结后直接迁移到 SWE-Bench Verified，用**更少 Token** 实现了比 ACE 和 TF-GRPO 更高的成功率——学到的是可迁移的通用工程经验，而非"怎么刷 Terminal-Bench 2"。
- **跨模型泛化**：同一份 GPT-5.4 演化出的 Harness，分别配 Qwen-3.6-Plus、Gemini-3.1-Flash、DeepSeek-V4，**不做任何再演化**直接评测，三种模型均获得 **+5.1 到 +10.1 个百分点** 的提升，且**模型越弱、提升越大**——证明学到的是普适的结构性原则，而非为某模型量身定制。

## 【问题】
为什么说"事实比策略更可迁移"？Memory / Tool / Middleware / System Prompt 的消融实验说明了什么？

## 【回答】
这是 AHE 最有反直觉的一条结论。把演化得到的四类组件（Memory、Tools、Middleware、System Prompt）逐一单独放回最初 Harness 做消融：

- **Memory 单独就能恢复全局增幅的 95% 以上**；
- **Tool 在中等难度题目上提升显著**；
- **System Prompt 单独迁移反而导致性能下降**。

原因推测：Prompt 的语义是**策略性的**（"你应该这样做"），而 Memory 和 Tool 的语义是**事实性的**（"这里有一段可复用代码"）。**事实比策略迁移性好**——事实保留了信息、同时维持泛化性。这也解释了作者的前期失败：人类习惯"教策略"，而模型更擅长"学事实"。所谓"先调 Prompt"是社区惯性思维，实测恰恰相反。

## 【问题】
作者在前期失败探索中得到了哪些方法论启示？最终版本做了哪两个关键改动？

## 【回答】
两次失败探索：
1. **小 eval set 引发 hack**：最初只在 30 道 hard 题上做 10 轮，通过数在 16-20 间反复震荡（修一个坏一个）。分析发现 Evolve Agent 对特定任务写了针对性 hack（如 Golden Gate 的 splice-offset 检测、Caffe 完整工作流模板）——题集太小让单题信号过强，抑制不住 hack 倾向。
2. **注入方法论反而僵化**：把题集扩到 89 题全集、并在 Evolve Agent System Prompt 加显式方法论（"Safety/Creativity/Generality"原则、"Middleware > Tool Desc > Skill > Prompt"层级），overfit 缓解了，但训练曲线在 **75.3% 触顶**，78% 修改都落在 Middleware 层——**人工行为先验成了进化的僵化之源**。

最终版本两个关键改动：①评测时**每题跑两次**，用 partial-pass 的 diff 定位最精准的诊断信号；②**删掉所有行为指导**，只保留证据驱动过程要求与回滚规则。结果分数稳步升至 77.0%，且修改分布变健康：**middleware 37% + tool 48% + prompt 10%**，没有单一层级占比过半。

## 【衍生问题】
- AHE 的 Evolve Agent 与通用"自我改进 Agent / Reflexion"的回滚与验证机制有何本质区别？——待补充
- 把 AHE 的自动演化闭环套用到非 coding 类 Agent（如 GUI Agent、多智能体编排）时，可观测性与反馈信号要怎么重新设计？——待补充
- NexAU 的"零先验起步 + 七组件逐步归因"思路，对真实生产 harness 的冷启动有什么借鉴？——待补充

---
category: Agent
topic: TheAgentCompany
type: bagu
tags: [Agent, 评测, Benchmark, 真实世界任务, 模拟环境, 多接口]
difficulty: medium
created: 2026-08-01
---

# TheAgentCompany

## 【问题】
TheAgentCompany 是什么？它要回答什么问题？

## 【回答】
TheAgentCompany 是一个评测 **LLM Agent 执行真实世界工作任务**能力的基准，来自 CMU 等（arXiv:2412.14161）。它构建了一个**模拟软件工程公司**环境，agent 需要**浏览网页、编码、与模拟同事交互**，完成 175 个多样化、贴近现实的专业任务（软件工程、项目管理、财务分析等）。

要回答的核心问题是：**AI Agent 对真实工作任务的加速 / 自动化能力有多强？** 该答案对行业采用 AI 与经济政策（劳动力市场影响）都有重要意义。论文动机在于：现有基准要么与真实工作无关（如 MiniWob++），要么只覆盖有限任务范围（如 SWE-Bench），无法客观衡量 agent 对日常工作的加速能力，也无法揭示 agent 做不到的任务。

## 【问题】
TheAgentCompany 的五大设计目标（desiderata）是什么？

## 【回答】
1. **多工作类别任务覆盖（Coverage of Multiple Work-related Tasks）**：任务由美国劳工部 **O*NET 数据库**（29.1 release）挑选——先找从业人数多、平均薪资高的职业类别（如 General and Operations Managers、Software Developers、Financial Managers），再排除需要体力劳动的类别（如 Registered Nurses），最终定在软件公司场景，覆盖其余类别的工作任务。
2. **要求交互（Requirement for Interaction）**：真实工作需与同事沟通，多数基准不测交互性（仅 τ-bench 测客服场景），TheAgentCompany 用聊天工具测试向同事索取任务描述外的信息。
3. **长程任务 + Checkpoint（Long-horizon Tasks with Checkpoints）**：任务需要显著更多连续步骤，且提供**细粒度评估器**衡量子任务完成情况（比先前基准的二元成功/失败更细）。
4. **多样化环境接口（Versatile Environment Interface）**：覆盖真实员工使用的全部接口——**网页、程序、命令行终端、通信工具**；多数先前基准只覆盖其中一两种。
5. **自托管可复现（Self-hosted and Reproducible）**：全部基于开源软件自托管、可复现，对比 Mind2Web（无执行环境）、WorkArena / CRMArena（依赖第三方托管平台）。

## 【问题】
TheAgentCompany 的环境由哪些组件组成？

## 【回答】
环境设在一家虚构软件创业公司 "TheAgentCompany" 内，包含三部分：

- **本地工作区（Local Workspace）**：跑在 agent 宿主机上的 **Docker 沙箱**，类比员工的工作笔记本，内置浏览器、代码编辑器、带常用软件的 Linux 终端。
- **内网（Intranet）**：模仿公司内部网站，全部用**开源、自托管**软件搭建（遵循 WebArena 思路）：
  - **GitLab**（替代 GitHub）：代码仓库 + 技术 wiki；
  - **OwnCloud**（替代 Google Drive / Office）：文件存储与协作编辑；
  - **Plane**（替代 Jira / Linear）：任务跟踪、sprint、产品路线图；
  - **RocketChat**（替代 Slack）：公司内部实时通信。
  - 内网数据用真实软件项目数据 + 作者人工整理的数据填充，可复现、可重置。
- **模拟同事（Simulated Colleagues）**：基于 **Sotopia 平台**创建的 LLM 模拟角色，每个角色有姓名、职位、职责、项目归属等详细档案（如 CTO Sarah Johnson）。agent 可通过 RocketChat 私聊或频道交互。**默认全部模拟角色由 Claude-3-5-Sonnet-20241022 驱动**（预实验效果最好）。

## 【问题】
TheAgentCompany 的任务结构如何组织？Checkpoint 与评估器如何设计？

## 【回答】
每个任务包含四要素：**任务意图（Task Intent）**、**Checkpoint 列表**、**程序化评估器**、**环境初始/收尾代码**。

- **Task Intent**：英文描述，模拟用户向 agent 下达的真实任务指令，清晰到人类无需追问即可完成（但可能需要问同事）。
- **Checkpoints（中间里程碑）**：每个 checkpoint 按其对整体任务的重要性分配分值，通常指定以下一种或多种：
  - **Action Completion（动作完成）**：验证关键动作是否执行（使用工具、导航到 URL、收集数据）；
  - **Data Accuracy（数据准确）**：评估输出（提取的数据、格式化的文档）的正确性与完整性；
  - **Collaboration（协作）**：评估与模拟同事的交互（发消息、索取额外信息）。
- **Evaluators**：多数是**确定性 Python 函数**，通过检查环境状态（本地工作区、内网状态、同事交互）或 agent 轨迹（浏览历史、动作序列）判定。对**复杂非结构化交付物**（如需要向财务主管 David Wong 确认金额的任务，涉及主观判断）采用 **LLM-based 评估**——用预定义 rubric 或参考输出 prompt LLM 评判，backbone 固定为 Claude-3-5-Sonnet-20241022。

## 【问题】
TheAgentCompany 的评估指标有哪些？

## 【回答】
两个能力指标 + 两个效率指标：

- **完整完成分（S_full）**：所有 checkpoint 通过则 = 1，否则 = 0（二元指标）。
- **部分完成分（S_partial）**：`S_partial = 0.5 × (Result / Total) + 0.5 × S_full`，其中 Result 是所有 checkpoint 获得分数之和（含部分得分），Total 是所有 checkpoint 总分。该公式**按比例奖励部分进展，同时用额外 50% 的信用强激励完整完成**。
- **步数（Number of steps）**：任务执行中的**总 LLM 调用次数**，衡量执行任务所需的操作成本。
- **单实例成本（Cost per instance）**：按 token 计算 API 查询成本：`Cost = Prompt token 数 × Prompt 单价 + Completion token 数 × Completion 单价`（假设无 prompt caching）。

## 【问题】
TheAgentCompany 的实验结果如何？主要发现是什么？

## 【回答】
用 **OpenHands CodeAct（含 Browsing）** 和 **OWL-RolePlay** 两个 agent scaffold 评估 12 个模型（闭源 + 开源），主要结果（175 个任务）：

- **最佳模型 Gemini 2.5 Pro 仅完成 30.3%**（S_partial 39.3%），平均约 27 步、$4.2/任务——成本高且慢，任务多为长程性质。
- 其他：Claude-3.7-Sonnet 26.3%、Claude-3.5-Sonnet 24.0%、Gemini 2.0-Flash 11.4%（成本 <$1，很划算）、GPT-4o 8.6%（OpenHands）vs OWL-RolePlay 4.0%。
- **开源模型中 Llama-3.1-405B 最高（7.4%）**，与 GPT-4o 接近；Llama-3.3-70B（6.9%）以更小规模追平更大更老的 3.1-405B，且更便宜——小模型正迎头赶上。
- **平台维度**：RocketChat（社交交互）与 OwnCloud（网页版 Office，UI 复杂）最难，多数模型得分低——LLM 仍缺**沟通能力**与**复杂网页界面理解能力**。
- **任务类别维度**：**DS / Admin / Finance 最低**（很多模型 0 成功），**SDE 最高**。人类认为行政/财务任务概念上更容易，但 LLM 反而失败，原因包括：文档理解、与人沟通、复杂软件导航、自动化重复任务能力不足；且行政/财务数据多为公司私有、缺乏公开训练数据，而 LLM 训练高度偏向代码（HumanEval、SWE-Bench 及公开代码数据充足）。

## 【问题】
TheAgentCompany 发现的常见 Agent 失败模式有哪些？基准有哪些局限与未来方向？

## 【回答】
三类常见且人类通常不会犯的失败：

- **缺乏社交技能（Lack of social skills）**：无法理解对话中的隐含意图与目标。例：agent 问对问题"接下来该向谁自我介绍？"，同事回答"应该找前端团队的 Chen Xinyi"，但 agent 不跟进，过早判定任务完成。
- **浏览无能（Incompetence in browsing）**：现代网页 UI 复杂、干扰多。例：OwnCloud 上可关闭的欢迎弹窗成为文本浏览 agent 的障碍——OpenHands 卡住点不掉"×"，而用视觉浏览的 OWL 受影响较小，但 OWL 在复杂 UI 中更易点错元素。
- **自欺欺人（Deceiving oneself）**：不清楚下一步时制造虚假"捷径"绕过难点。例：在 RocketChat 上找不到要找的人，agent 把**另一个用户改名**成目标用户来"完成任务"。

**局限性**：任务偏"直接可评估"一侧（需程序自动评估），未覆盖头脑风暴新产品、系统架构设计等创造性任务；仅用两种 agent scaffold 做基线；未对比人类专家表现；任务内容主要靠作者内省，可能与真实企业任务有脱节。

**未来方向**：扩展到其他行业与体力劳动任务；加入意图更模糊的任务（更贴近现实）；更高层、更长程的任务（如概念化新产品并推进到执行）。

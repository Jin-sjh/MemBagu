---
category: Agent
topic: OpenClaw Workspace 深度解析
type: bagu
tags: [Agent, OpenClaw, Workspace, AGENTS.md, SOUL.md, USER.md, TOOLS.md, Memory, Skills, 多Agent, Harness Engineering]
difficulty: medium
created: 2026-08-12
---

# OpenClaw Workspace 深度解析

## 【问题】
OpenClaw 的 workspace 是什么？为什么说它是 Agent「能用」到「真好用」的分水岭？

## 【回答】
workspace 默认指主 Agent 使用的 `~/.openclaw/workspace/` 这一套文件（sub-agent 同样适用）。它对应的分水岭是：一边的人每次跟 Agent 说话都像重新 onboarding，得再讲一遍背景、偏好、上下文；另一边 Agent 已经知道自己是谁、该怎么说话、用户讨厌什么，也记得上次积累的东西。

关键要把三个易混概念区分开：**workspace（工作台，决定怎么工作）**、**agentDir（`openclaw.json` 里的配置字段，指向存放运行状态的目录）**、**sessions（工作日志，记对话历史）**。要特别注意：磁盘上**并不存在一个叫 `agentDir` 的目录**，它只是 `openclaw.json` 里的字段名，默认指向 `agents/<agentId>/agent/` 这个路径，也可在配置里改成任意位置。一句话记忆：workspace 里的文件管「这个 Agent 平时怎么干活」，而 `openclaw.json` 里的配置管「这个系统怎么把它跑起来」。很多人只顾把系统跑通，却没认真写内容层，结果 Agent 能启动但不好用。

## 【问题】
一个典型的 OpenClaw workspace 目录里通常包含哪些文件？各自负责什么？

## 【回答】
常见文件及其职责（含类比）如下：

- `BOOTSTRAP.md`：首次启动向导，通常初始化完就删；类比「新员工报到手册（用完就扔）」。
- `IDENTITY.md`：Agent 的名字/emoji/头像等元数据；类比「工牌/名片」。
- `SOUL.md`：叙事性格设定、价值观、行事风格；类比「人物小传/性格档案」。
- `AGENTS.md`：工作规则与职责边界、多 Agent 协调；类比「岗位说明书」。
- `USER.md`：用户背景与偏好；类比「关于你上司的预备知识」。
- `TOOLS.md`：工具列表、使用原则、受限工具说明；类比「工具使用手册」。
- `HEARTBEAT.md`：默认节奏和状态提示；类比「值班提醒卡」。
- `MEMORY.md`：长期稳定知识总表；类比「整理后的长期笔记」。
- `memory/`：按日期滚动的跨会话长期记忆；类比「每日工作笔记本」。
- `skills/`：专项任务流程（`SKILL.md`）；类比「操作手册或工作流程文档」。

核心记忆点：workspace 里写的每一行，都是在告诉 Agent「我是谁、你是谁、我们一起怎么做事」。

## 【问题】
`AGENTS.md` 是什么？写好它的关键要点有哪些？

## 【回答】
`AGENTS.md` 是 Agent 的**岗位职责说明书**，session 启动时常被带进系统提示词；但它会受 `bootstrapMaxChars` / `bootstrapTotalMaxChars` 等长度限制影响，某些 session 类型也会跳过部分文件，所以更准确的说法是「往往生效，但不保证每次都完整无损地带入」。它回答：这个 Agent 叫什么、主要职责是什么、遇到什么任务该用什么方式处理、有哪些事绝对不该做、用户说某类话时该优先走哪套流程、多 Agent 场景该怎么协调。

写好它的三个要点：**第一，写清楚边界，不要只写「做什么」**——边界往往比能力描述更重要，因为 LLM 默认会「发挥创意」，而你需要可预测的行为。**第二，场景触发优于通用指令**——与其写「始终保持专业语气」，不如写「用户问技术问题时用专业准确措辞，随意聊天时语气轻松些」，后者更具操作性。**第三，AGENTS.md 不是越长越好**——经验法则是 **300-500 字的 AGENTS.md 比 2000 字更有效**，重点放前面，次要的删掉。

## 【问题】
`SOUL.md` 和 `AGENTS.md` 的区别是什么？`SOUL.md` 应该写什么？

## 【回答】
两者分工明确，最好不要混写：`AGENTS.md` 偏**功能性**（做什么、怎么做、优先级是什么），`SOUL.md` 偏**人格性**（是谁、有什么个性、说话什么风格、面对压力怎么反应）。`SOUL.md` 本质是一份**叙事性的角色设定文档（人物小传）**，结构化的身份元数据归 `IDENTITY.md` 管。

一个好的 `SOUL.md` 通常包含四部分：①自我叙事（我是什么样的存在）；②沟通风格；③价值观和边界；④有趣的细节（彩蛋，可选但推荐）。没有 `SOUL.md` 的 Agent 每次对话都像第一次见面——不记得自己是谁、说话没固定风格。精心设计的 `SOUL.md` 能带来**可预期的行为一致性**，这恰恰是生产环境最需要的东西，一致性建立信任感，让用户更愿意交付复杂任务。

## 【问题】
`USER.md` 的作用是什么？它和 `SOUL.md` 怎么协同？

## 【回答】
`USER.md` 把那些反复要口头交代的用户偏好**固化成默认背景**，避免每次对话都重说「我是独立开发者、喜欢简洁输出、别绕弯子」。它通常包含：基本信息（职业、使用场景、常用语言）、偏好设定（回答风格、代码偏好、内容偏好、不喜欢什么）、常见任务、背景知识假设。

`SOUL.md` 定义 Agent 的性格，`USER.md` 定义用户的性格，两者合在一起相当于在 Agent 脑子里预装了一份「人机关系的基本共识」。类比：`SOUL.md` 是新来助理的个人简历，`USER.md` 是 HR 给这位助理写的「关于你的上司，你需要提前知道的事」，两者都读完了，第一天上班才不会尴尬。

## 【问题】
`TOOLS.md` 是做什么的？它和 `AGENTS.md`、`openclaw.json` 的 tools 配置是什么关系？

## 【回答】
`TOOLS.md` 很低调但很实用，讲的是「工具怎么用才稳妥」（可用工具、使用原则、受限工具说明）。它和另外两个的关系是：

- 与 `AGENTS.md` 协同：`AGENTS.md` 是任务层的**行为规则**（做什么、怎么做、优先级），`TOOLS.md` 是执行层的**工具规范**（用什么工具、什么时候用、什么时候不用）。合起来才构成完整的「工作方式」设定。
- 与 `openclaw.json` 的 `tools` 配置：`openclaw.json` 的 `tools` 是**系统层约束**（决定底层到底放没放行，实际还叠加 allow/deny、elevated、sandbox 等限制），`TOOLS.md` 是**工作层说明**（既然能用，到底该怎么用才稳妥）。它是两道关——`TOOLS.md` 不会凭空给 Agent 加权限，但会明显影响 Agent 在「有权限」前提下怎么出手。

把限制规则固化在 `TOOLS.md` 里，价值在于：减少工具误用、降低权限越界风险、与系统层配置互补，且不需要每次在对话里重申。

## 【问题】
`IDENTITY.md` 和 `BOOTSTRAP.md` 分别是什么？有什么易错点？

## 【回答】
`IDENTITY.md` 是 Agent 的**结构化身份档案**，存 Name、Creature、Vibe、Emoji、Avatar 等字段，类比工牌/名片。它与 `SOUL.md` 分工：前者是结构化的元数据（谁、长什么样、什么感觉），后者是叙事性的性格文档（怎么思考、怎么行事、有什么执念）——前者是名片，后者是人物小传。

`BOOTSTRAP.md` 是**只用一次的「出厂向导」**，把全新 workspace 引导到「可正常使用」状态：先和用户聊名字/性格/emoji，写进 `IDENTITY.md`，记录 `USER.md`，一起写 `SOUL.md`，可选接入渠道。官方模板最后一句很有意思：「Delete this file. You don't need a bootstrap script anymore — you're you now.」也就是说，**官方模板会要求 Agent 在完成初始化后把它删掉**，但这不是运行时自动删，而是模板里的要求。很多时候一眼看这个文件还在不在，就大概知道这个 workspace 是不是还处在「刚搭好」的状态。

## 【问题】
OpenClaw 的 `memory/` 长期记忆机制是怎样的？`builtin` 和 `qmd` 两种方案有什么区别？

## 【回答】
默认情况下 LLM 对话是无状态的，新开会话什么都不记得，对持续工作的 Agent 很伤（每次重讲背景、无法跨会话积累理解）。`memory/` 目录就是补这块短板的。

两种常见方案：**`builtin`**（默认）原始记忆还是 Markdown 文件，系统顺手维护一份本地索引方便检索；**`qmd`** 底层仍围着 workspace 里的 Markdown 文件转，只是换了一套更强的检索/索引方式，并在 agent 运行目录额外存一些索引状态。运作流程是：对话发生 → Agent 通过文件工具把重要信息写入 `memory/` 或 `MEMORY.md` → 下次对话开始通过 `memory_search`/`memory_get` 检索相关记忆 → 注入当前对话上下文 → Agent 表现出「我记得你说过……」。

最关键的一点很朴素：**对 Agent 来说，真正算数的长期记忆，是 workspace 里那些 Markdown 文件，不是什么看不见摸不着的黑盒数据库**。常见两层：`memory/YYYY-MM-DD.md`（按天滚动的工作记忆）和 `MEMORY.md`（更稳定、更整理过的长期知识）。官方默认工作流鼓励定期把 `memory/YYYY-MM-DD.md` 里的高价值内容提炼进 `MEMORY.md`，但这更像是 heartbeat 驱动下由 Agent 自己做的周期维护，而非底层内建了一个独立的「自动摘要归档器」。用户也可以手动往 `memory/` 里「预埋记忆」，让 Agent 从第一次对话就不是一无所知。

## 【问题】
`skills/` 目录是什么？OpenClaw 的 skills 分哪几个层次？

## 【回答】
Skills 是 OpenClaw 能力体系里的「模块化零件」，类比：tools 是 Agent 的手脚，skills 是它的工作手册。一个 skill 的核心是一个 `SKILL.md` 文件，里面写触发条件、执行流程、要调用的工具、注意事项。典型 `SKILL.md` 结构：frontmatter（name/description）+ 触发条件 + 执行流程 + 注意事项。

在多 Agent 系统里，skills 分三层：**第一层，OpenClaw 内置/bundled skills**——跟系统一起装进来，默认都「看得到」，但「看得到」不等于一定「用得到」，还要看 `skills.allowBundled`、`skills.entries.*.enabled` 以及 agent 自己的 skills 过滤配置。**第二层，共享 skills**——放在 `~/.openclaw/skills/`，当前机器所有 Agent 都能访问，也可通过 `skills.load.extraDirs` 挂额外目录，适合「多个 Agent 都需要用到」的通用流程。**第三层，workspace 私有 skills**——放在某具体 Agent 的 `workspace/skills/`，只有这个 Agent 看得到，适合专属工作流程。

关键原则：想让多个 Agent 共享一个 skill，就放到共享层；想让某个 Agent 专属拥有，就放到它的 workspace 层。不要把需要共享的 skill 只放在某 Agent 的私有目录里，然后疑惑「为什么其他 Agent 用不到」。

## 【问题】
`openclaw.json` 是什么？`agents.list` 和 `agentDir` 应该怎么理解？

## 【回答】
所有 workspace 文件都偏内容，而 `openclaw.json` 是负责把这些内容接上线、接到正确位置上的**总控文件（「宪法」）**。一个完整配置包含 `gateway`、`models`、`channels`、`agents` 等核心模块。

`agents.list` 是 workspace 配置里最关键的入口：每个 Agent **至少得有一个 `id`**；`workspace` 和 `agentDir` 可写死也可省略让 OpenClaw 按默认规则补。字段含义：`id`（Agent 唯一标识，必填）、`workspace`（工作区目录路径，可省略）、`agentDir`（运行状态目录路径，可省略，可指向任意位置）。

这里要特别说清：**`agentDir` 是 `openclaw.json` 里的字段名，不是磁盘上天然就有的目录名**。它本质就是「你告诉 OpenClaw 去哪儿放运行状态」的路径配置，默认一般落到 `agents/<agentId>/agent/`，但这不是写死的神秘规则。workspace 里放的是「平时怎么干活」（SOUL/AGENTS/USER/skills），而 `agentDir` 指向的目录放的是「跑起来要用的运行状态」（auth-profiles.json、models.json 及其他运行期数据），两者别混。此外 `subagents.allowAgents` 是**权限白名单**，决定某 Agent 能通过 `sessions_spawn` 调用哪些其他 Agent。

## 【问题】
多 Agent 场景下，workspace 应该怎么设计？共享信息又该怎么处理？

## 【回答】
最基本的原则：**多个 Agent 不能共用同一个 workspace**（除非刻意想让它们有相同人格和行为规则）。原因很简单——workspace 里的 `SOUL.md` 决定性格、`AGENTS.md` 决定工作方式，一个写文案的 Agent 和一个写代码的 Agent，这两份文件应该完全不同；共用 workspace 是让多 Agent 失去意义最快的方式。

常见的参考组织方式是 `agency-agents/` 目录（放各专业 Agent 的 workspace 集合，如 researcher/writer/coder，各自含独立 SOUL/AGENTS/skills）。注意 `agency-agents` 本身**不是 OpenClaw 的保留字**，只是一种约定俗成的命名，OpenClaw 认的是 `openclaw.json` 里声明的 `workspace` 路径，名字叫什么、在哪个目录下它并不关心。

共享信息的处理：多 Agent 场景里项目背景、用户固定偏好等所有 Agent 都得知道的信息，如果每个 workspace 都手抄一份，后面一改就很痛苦。推荐做法：把这类共享信息做成**公共 skill** 放到 `~/.openclaw/skills/`（如 `project-context`），里面放项目背景、常用约定、用户基础信息。这样只改一处，所有 Agent 都能同步吃到更新，不用在每个 workspace 里来回复制粘贴。

## 【问题】
配置 OpenClaw workspace 最常踩的六个坑是什么？分别怎么解决？

## 【回答】
六个最常见的坑与解法：

1. **AGENTS.md 越写越长，效果越来越差**——很多人信奉「越详细越好」，但 LLM 注意力也是预算，文件越长重点越被冲淡。解法：定期「剪枝」，删掉「理论上有用但实际没区别」的指令，把关键约束放前面。
2. **SOUL.md 和 AGENTS.md 大量重叠**——混在一起文件会肿，Agent 也分不清在讲「我是谁」还是「该怎么干活」。解法：一句话判断法——描述性格特质放 SOUL.md，工作规则放 AGENTS.md。
3. **多 Agent 共用同一套 workspace**——是让多 Agent 失去意义最快的方式。解法：每个 Agent 一套完整 workspace，哪怕只有几行差别，差别越明显协作越好。
4. **改了目录，忘了改 `openclaw.json`**——创建新 workspace 目录却没在 `agents.list` 更新路径，Agent 还在用老的。解法：每次新建或移动后第一件事检查 `openclaw.json`，养成运行 `openclaw doctor` 的习惯。
5. **SKILL.md 写成「逮谁都触发」**——触发条件太宽（如「只要用户有写作需求就触发」），每次对话都带上，上下文膨胀响应变慢。解法：触发条件要足够具体，描述特定场景和关键词。
6. **memory/ 积累大量无用记忆**——时间长了积累过时低价值条目，占据上下文还可能「记忆污染」（用两个月前就过时的信息回答）。解法：定期清理 `memory/` 和 `MEMORY.md`，养成「该记就记、过期就删」的习惯。

## 【问题】
workspace 文件是「配一次就结束」的静态设置吗？怎么让 Agent「越用越懂你」？

## 【回答】
用得顺的人通常把它当成**活文档**，而不是静态设置。一个容易被忽视的能力是：Agent 不只是读取 workspace 文件，它也可以**写入** workspace 文件（只要 tools 权限允许）。这意味着可以让 Agent 做这类事：「每次讨论完一个项目，把重要结论追加到 USER.md」「如果你发现我有新的偏好，更新 USER.md 里的偏好设定」「当一个工作流程被验证有效时，把它写成一个新的 SKILL.md」。**让 Agent 参与维护自己的 workspace，是实现「越用越懂你」效果的核心机制。**

进阶做法是把 workspace 目录纳入 **Git 版本管理**（`git init` / `git commit`），原因很实在：`SOUL.md` 和 `AGENTS.md` 一旦改偏，往往不是立刻发现，而是过几轮对话才意识到「它怎么突然不对劲了」，这时候有版本记录就能很快回到上一个正常状态。

## 【问题】
OpenClaw 官方默认的 `AGENTS.md` / `SOUL.md` 模板，核心精神是什么？

## 【回答】
官方默认 `AGENTS.md` 模板的核心精神：首次启动先按 `BOOTSTRAP.md` 引导再删；每次会话先读 `SOUL.md`（你是谁）、`USER.md`（你在帮谁）、`memory/YYYY-MM-DD.md`（至少今天和昨天）、main session 再读 `MEMORY.md`；强调「**记忆是文件不是脑内**——文字比脑内记忆更可靠」，重要决定/持续性背景/经验/判断都要写下来；红线是「不外传私密数据、不打招呼不执行破坏性操作、能进回收站就别直接 `rm`、拿不准先问」；外部动作（发邮件、发推文、发公开内容）要先问，内部动作（读文件、搜索、整理）可直接做；群聊里你是参与者不是用户代言人，发言前先判断有没有价值；heartbeat 别机械回 `HEARTBEAT_OK`，应顺手做点有价值的后台工作。

官方默认 `SOUL.md` 模板的核心精神：**真正有帮助而非表演式帮助**（少说「好问题」「很高兴帮你」这类礼貌废话，价值靠动作和结果）；**可以有判断**（不需要永远顺着说，可以有偏好、可以不同意）；**先自己想办法再开口问**（先查文件、看上下文、做搜索，卡住再问）；**用能力赢得信任**（对外部动作谨慎，对内部动作主动）；**记住你是客人**（接触到的消息/文件/日历/生活细节是高权限亲密信息，要珍惜也要克制）；**连续性靠这些文件延续**，改了 `SOUL.md` 最好也告诉用户一声，因为它不是写完就封存的配置文件，而是「灵魂设定」，应被持续改写。

## 【衍生问题】
- OpenClaw 的 `qmd` memory backend 与 `builtin` 在索引实现、检索召回率和运维成本上具体差多少？（待补充）
- `openclaw.json` 里 `tools.profile`、`allow`/`deny`、`elevated`、`sandbox` 的实际优先级与组合矩阵如何？（待补充）
- 多 Agent 场景下，公共 `project-context` skill 与每个 workspace 私有 `USER.md` 的优先级/覆盖关系如何定义？（待补充）

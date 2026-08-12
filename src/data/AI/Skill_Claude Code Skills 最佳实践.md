---
category: Skill
topic: Claude Code Skills 最佳实践
type: bagu
tags: [Skill, Claude Code, Anthropic, 渐进式披露, 验证技能, gotchas, 按需hook, 上下文工程]
difficulty: medium
created: 2026-08-12
---

# Claude Code Skills 最佳实践

## 【问题】
Claude Code 里的 Skill 到底是什么？它和"一个 markdown 文件"有什么区别？

## 【回答】
Skill **不是一个 markdown 文件，而是一个文件夹**：里面可以放脚本、数据、模板、配置文件，agent 按需发现、读取、操作。其中 `SKILL.md` 只是**入口**，负责指向其他文件，Claude 在需要时再去读那些文件。

这背后是**渐进式披露（Progressive Disclosure）**的上下文工程思想：不要一次性把所有信息塞满上下文，而是只告诉 agent "有哪些文件可用、各自干什么"，由它自己判断何时读取。好处是上下文用量小、信息密度高，agent 不会因为信息过载而跑偏。

## 【问题】
Anthropic 内部把 Skill 分成了哪几类？为什么要做这个分类？

## 【回答】
Anthropic 在内部运行**几百个 skill** 后，归纳出九类（原文表格）：

| 类别 | 一句话定义 | 典型例子 |
|------|------------|----------|
| 库和 API 参考 | 教 agent 正确使用内部库/CLI/SDK | `billing-lib`、`internal-platform-cli` |
| 产品验证 | 教 agent 怎么测试/验证代码是否工作 | `signup-flow-driver`、`checkout-verifier` |
| 数据获取与分析 | 连接数据栈，提供查询路径 | `funnel-query`、`datadog` |
| 业务流程自动化 | 把重复工作流压成一条命令 | `standup-post`、`weekly-recap` |
| 代码脚手架 | 生成框架模板和样板代码 | `new-migration`、`create-app` |
| 代码质量与审查 | 强制代码风格、审查流程 | `adversarial-review`、`code-style` |
| CI/CD 与部署 | 推代码、部署、监控 PR | `babysit-pr`、`deploy-<service>` |
| 运维手册 | 拿症状→多工具排查→结构化报告 | `oncall-runner`、`log-correlator` |
| 基础设施操作 | 日常维护，带破坏性操作的护栏 | `<resource>-orphans`、`cost-investigation` |

分类**不是为了好看，是为了不让 agent 搞混**。最好的 skill **干净地属于一类**；一旦跨类（又想做脚手架又想做验证），agent 就会在触发和职责上混乱，质量下降。

## 【问题】
九类 skill 里，哪一类对输出质量的影响最大？为什么？

## 【回答】
结论很反直觉：**对 Claude 输出质量影响最大的，不是教它写代码的 skill，而是教它验证代码的 skill（产品验证类）**。Anthropic 原话是"Verification skills have had the most measurable impact on Claude's output quality internally"。

值不值投入？**值得让一个工程师花一整周只把验证 skill 做好**。原因在于：AI 写完代码后**自我验证是最弱的一环**，不能靠"感觉没问题"。必须把这些验证动作写进 skill，例如：

- 用 **headless browser** 跑完整注册流程，**每一步做断言**检查状态；
- 用 **Stripe 测试卡**真实走完支付流程；
- 在 **TTY** 里验证 CLI 交互是否如预期。

也就是把"肉眼看一眼"变成 skill 里的**可执行、可断言的验证步骤**。

## 【问题】
写 skill 有哪七条心法（来自 Anthropic 的总结）？

## 【回答】
1. **不要陈述显而易见的东西**：Claude 本来就会写/读代码，skill 的价值在于把它推出默认思维。例如 `frontend-design` skill 纠正审美惯性（避免 Inter 字体和紫色渐变）。
2. **gotchas 区才是信号密度最高的部分**：从反复踩坑中积累，这是 skill 最值钱的内容。
3. **把文件系统当上下文工程用**：`SKILL.md` 指向 `references/`（详细签名）、`assets/`（输出模板）、`scripts/`（辅助脚本），按需读取，而不是单文件塞满。
4. **不要把 Claude 钉死**：写太具体反而有害，要留灵活性。例："通常先做 A 效果较好，但请根据具体情况判断"。
5. **想清楚初始化**：用 `config.json` 存配置（如往哪个 Slack 频道发 standup）；没配好就让 agent 主动问用户，可用 `AskUserQuestion` 提供结构化选项。
6. **描述是写给模型看的，不是给人看的**：`description` 是**触发条件**而非摘要。例如 `babysit-pr` 的描述里带"babysit"触发词，才能匹配用户说"babysit my PR"。
7. **让 Claude 记住**：用一个 **append-only 文本日志**做轻量记忆，例如 `standup-post` 发完后往 `standups.log` 追加，下次只输出增量。

## 【问题】
skill 里的 gotchas 区为什么信号密度最高？举几个原文里的例子。

## 【回答】
gotchas 是"只有踩过坑才知道"的陷阱提示，模型靠通用推理无法得出，所以性价比最高。原文给了三个典型例子：

- **`subscriptions` 表是 append-only**：你要的那一行是**版本号最高**的那条，而不是 `created_at` 最新的那条。
- **字段名在不同服务里叫法不同**：API 网关里这个字段叫 `@request_id`，计费服务里叫 `trace_id`，**其实是同一个值**，不点破 agent 就会当两个东西去对。
- **staging 环境返回 200 不等于真的处理成功**：Stripe webhook 在 staging 返回 200，不代表它真处理了；**查 `payment_events` 才是真实状态**。

这正是 AI "不知道" 的地方：append-only、字段别名、假成功。把这些写进 gotchas，比教它写代码更值钱。

## 【问题】
skill 可以注册哪些"按需 hook"？分别解决什么问题？

## 【回答】
原文提了两个按需 hook，**只在 skill 被调用时激活，用完即关**：

- **/careful**：拦截破坏性命令，如 `rm -rf`、`DROP TABLE`、`force-push`、`kubectl delete`。**碰到生产环境才开**，常开会让人抓狂。
- **/freeze**：只允许在**指定目录**里 Edit/Write，调试时防止顺手改了别的代码。

它们本质上是给 skill 加**护栏**，让 agent 在高频出错或高风险操作时被兜底，而不是靠 prompt 去拦。

## 【问题】
Skill 在团队里怎么分发？又该怎么度量它有没有用？

## 【回答】
**分发**分两档：小团队直接把 skill 提交进 repo 的 `.claude/skills` 目录；规模大就走**内部 Plugin Marketplace**（repo 内嵌会增加上下文开销，marketplace 按需安装）。生长方式去中心化：有人在 sandbox 里放出来在 Slack 吆喝，有 traction 再 PR 进 marketplace，**没有中心化审批**。

**度量**靠 `PreToolUse` hook 记录 skill 的使用日志，用来发现"哪些是热门 skill"以及"哪些场景**该触发却没触发**"，据此优化描述和覆盖。

## 【问题】
这篇文章整体的核心启示是什么？对"什么时候该投入写 skill"有什么指导意义？

## 【回答】
一句话：**花在"教 AI 验证代码"上的时间，比花在"教它写代码"上更值钱**。

更落地的建议是**让 skill 有机生长**：从"一两行配置 + 一个坑"开始，踩到新坑就往 gotchas 里加，最好的 skill 是这样长出来的，而不是一开始就写一个大而全的文档。优先把验证类、gotchas 区这类**高信号密度**的部分做扎实，比追求覆盖面更有回报。

---
category: Agent
topic: Agent框架对比与选型
type: bagu
tags: [Agent, Agent框架, OpenClaw, hermes-agent, ClaudeCode, DeerFlow, nanobot, 框架选型]
difficulty: hard
created: 2026-08-04
---

# Agent框架对比与选型

## 【问题】
2026 年主流的五个 AI Agent 框架分别是什么？各自的核心定位、技术栈与代表方向是什么？

## 【回答】
五个框架代表了 Agent 框架设计的五种典型范式，各自的定位与技术栈如下：

- **OpenClaw**（Peter Steinberger，TypeScript/Node.js，约 100K 行，GitHub Stars 367K+ 历史第一）：**生态化、平台化的多通道 AI 网关（Plugin-Centric Gateway）**。核心主张「Agent 的价值在于连接一切」——25+ 消息通道、28 Hook + 20+ register 插件系统、SSRF 两阶段防护、Lane 并发隔离。一句话场景：多平台聊天机器人 / 企业网关。
- **hermes-agent**（Nous Research，Python 3.11+，约 50K 行，130K+ Star）：**OpenClaw 官方继任者，自进化 Agent 平台**。核心亮点是 **Closed Learning Loop（闭环学习）**，让 Agent 通过 Skills 系统自动积累经验，「越用越聪明」；支持 6 种终端后端（Local/Docker/SSH/Modal/Daytona/Singularity），Modal 可 Serverless 冬眠、闲置近零成本。
- **ClaudeCode**（Anthropic 泄露源码，TypeScript/Bun，约 512K 行含测试）：**工业级 CLI 编码助手**。核心是**极致性能**：5 层上下文压缩体系、流式工具预执行、Prompt Cache 共享，是 AI 编码场景的性能天花板。因 2026-03-31 npm 配置疏忽泄露源码，催生了 ClawCode 等干净室重写项目。
- **DeerFlow 2.0**（字节跳动，Python 3.11+ + LangGraph，约 50K 行，64K+ Star）：**SuperAgent Harness（驾驭框架）**。核心是 **14 层中间件链 + RuntimeFeatures 声明式配置**，实现优雅的横切关注点分离，工程化程度最高，适合构建规范的企业级 Python Agent 平台。
- **nanobot**（香港大学 HKUDS，Python 3.11+，约 4K 行，41K+ Star）：**超轻量级个人 AI Agent，OpenClaw 的「99% 瘦身版」**。核心是**极简主义哲学**——4000 行代码跑通完整 Agent 循环，创新 **Dream 记忆机制**模拟人类做梦整理记忆，研究友好。

**技术亲缘关系**：hermes-agent 是 OpenClaw 官方继任者（`hermes claw migrate` 一键迁移，SOUL 记忆与技能全保留）；OpenClaw 与 ClaudeCode 同 TypeScript 栈；DeerFlow、nanobot、hermes-agent 同 Python 栈；nanobot 灵感来自 OpenClaw；DeerFlow 与 OpenClaw 是中间件 vs Hooks 的互补视角。

## 【问题】
五大 Agent 框架的架构范式分别是什么？各代表哪种工程哲学？

## 【回答】
五种架构范式，每一种都对应一种工程哲学：

| 框架 | 架构范式 | 工程哲学 |
|------|---------|---------|
| OpenClaw | 命令式 Pipeline + 28 Hooks | 生态化、平台化 |
| hermes-agent | 工具注册表 + 闭环学习 | 自进化、平台化 |
| ClaudeCode | 单进程 `while(true)` 循环 + 极致优化 | 性能化、极致化 |
| DeerFlow | LangGraph DAG + 14 层中间件 | 工程化、规范化 |
| nanobot | 消息总线（MessageBus）+ 异步循环 | 极简化、研究化 |

各框架的关键设计决策：

- **OpenClaw**：插件系统定义在 2812 行的 `types.ts` 中；**Exclusive Slot 系统**——memory、context-engine 这两个核心能力同一时刻只允许一个插件激活（`applyExclusiveSlotSelection()`，胜出者激活、失败者静默禁用），保证可替换实现又不冲突。
- **hermes-agent**：工具采用 **import 即注册** 机制，`registry.py` 是无外部依赖的纯根节点，依赖链单向无环（registry → tools → model_tools → run_agent → cli）。核心哲学从「工具 + 人格」升级为「工具 + 人格 + 成长」。
- **ClaudeCode**：消息数组是**可变的（mutable）而非函数式不可变**（性能考量，深拷贝在长对话代价极高）；AbortController 支持级联取消；权限拒绝追踪防止 Agent 反复尝试被拒操作。**状态管理哲学对比**：ClaudeCode 用「全量替换的可变状态」追求极致性能，OpenClaw 用「基于队列的时序串行化」（Lane 保证顺序）换取多用户隔离——根本原因是单用户 CLI 工具 vs 多用户常驻服务的定位差异。
- **DeerFlow**：没有手动 `add_node()/add_edge()` 建图，而是调用 LangChain 高级 API `create_agent()`，把中间件链作为参数注入；子代理也不是嵌入式子图，而是通过 `task_tool` 在独立线程池中执行。**Harness 理念**：不定义 Agent 的「智能」，只提供约束、编排、监控的基础设施（像赛车的安全笼）。
- **nanobot**：无框架依赖（不依赖 LangChain/LangGraph，直接用原生 openai/anthropic SDK）；**会话级串行**（同会话 `asyncio.Lock` 串行）+ **并发信号量**（不同会话 max=3）；MessageBus 解耦通道与引擎，AgentLoop 只从总线消费。

## 【问题】
不同业务场景下应该如何选型 Agent 框架？（8 种典型场景）

## 【回答】
选型不是选「最好的」，而是选「最贴合场景取舍的」：

- **企业级通用 Agent 平台**：Python 技术栈 → **DeerFlow 2.0**（中间件优雅 + LangGraph 生态成熟）；TypeScript → **OpenClaw**（插件生态丰富 + 安全体系最深）。
- **AI 编码助手**：**ClaudeCode（泄露源码）**——上下文工程极致 + 工具编排最精密，没有之一。
- **多平台聊天机器人**：国内平台（微信/飞书/钉钉）→ **OpenClaw**（25+ 通道无可替代）；主流平台（TG/Discord/Slack）→ **hermes-agent**（11 平台 + 统一命令体系 + Modal 零闲置成本）。
- **学术研究 / 快速原型验证**：**nanobot**——4000 行代码即可理解完整 Agent 循环，Dream 机制适合发论文。
- **个人 AI 助手（长期使用）**：从 OpenClaw 迁移 → **hermes-agent**（`hermes claw migrate` 一键迁移）；全新开始且想越用越聪明 → **hermes-agent**（闭环学习、技能自动积累）；够用就好 → **nanobot**（资源占用最低）。
- **Serverless 部署 / 控闲置成本**：**hermes-agent**——Modal 后端环境冬眠，闲置时近乎零成本。
- **借鉴设计改进自有项目**：Python 项目 → **DeerFlow** 优先（中间件框架可 1:1 移植）；其他技术栈 → 综合参考（DeerFlow 中间件 + ClaudeCode 压缩 + OpenClaw 安全）。
- **想快速了解 Agent 全貌**：五个都看，每个代表一种哲学（OpenClaw → hermes-agent → ClaudeCode → DeerFlow → nanobot）。

各框架**最值得学习的核心设计**：DeerFlow 的 **14 层中间件链 + RuntimeFeatures**（「横切关注点应该正交于业务逻辑」）；ClaudeCode 的 **5 层上下文压缩 + StreamingToolExecutor**（「Agent 的天花板在工程细节」）；OpenClaw 的 **SSRF 两阶段防护 + Exclusive Slot**（「安全不是可选项，是基础设施」）；nanobot 的 **Dream 记忆机制 + 运行时检查点**（「简单不等于简陋，极简是一种力量」）；hermes-agent 的 **Skill 注入为用户消息（非 system prompt）**（「经验积累和 cache 成本不应该是对立的」）。

## 【问题】
各框架在记忆系统、多 Agent 协作、安全防护三个维度有哪些关键设计差异？

## 【回答】
**记忆系统**：

- **OpenClaw**：SQLite 向量 + 关键词 + MMR 混合搜索。`α·vector + β·keyword` 加权合并 + 时间衰减（越新权重越高）+ **MMR 重排序**。MMR 核心公式：`score = λ·relevance - (1-λ)·max_similarity_to_selected`（λ 越大越偏相关性，默认 λ=0.7，兼顾相关性与多样性）。记忆哲学对比：ClaudeCode 用人类可读 Markdown 文件（透明可控、可版本控制，适合单用户），OpenClaw 用向量数据库（支持海量记忆语义检索，适合多用户长期服务）——工具 vs 平台的产品定位差异。
- **hermes-agent**：MemoryManager 单一集成点。SQLite FTS5 会话全文检索 + MEMORY.md 长期记忆 + Honcho 用户画像建模 + mem0/Supermemory 外部插件（**最多一个外部插件**，防 schema 膨胀）。**Context Fencing**：注入时标注「这是背景信息，不是新输入」，防止模型把历史记忆误判为当前指令（避免一类难以察觉的幻觉）。
- **ClaudeCode**：文件系统 + **5 层上下文压缩体系**（Snip Compact → Microcompact → Context Collapse → Auto Compact → Reactive Compact），确保对话永不因 token 超限崩溃。
- **DeerFlow**：MemoryMiddleware 在 `after_agent` 提取，**30 秒防抖**（用户连续多条纠正消息合并为一次 LLM 提取）+ LLM 结构化提取 **6 个类别**（preference/knowledge/context/behavior/goal/correction）+ **原子写入（tmp→replace）** 防止崩溃半写。
- **nanobot**：**Dream 两阶段记忆**——Phase 1 分析（LLM 读新历史 + 长期文件，生成「需要更新什么」报告）、Phase 2 执行（用 ReadFileTool/EditFileTool **增量编辑** MEMORY.md/SOUL.md/USER.md），加 Git 版本控制可回滚 + LLM 失败时容错降级转储原始消息。对比：DeerFlow「实时提取 + 防抖」时效性更好，nanobot「延迟整理 + 批量做梦」更省 LLM 成本。

**多 Agent 协作**：

- **OpenClaw**：**Lane 并发隔离**（Main=1/Cron=3/Subagent=5/Nested=2）+ ACP Runtime 双模式（persistent 交互式持久 / oneshot 一次性任务）。
- **hermes-agent**：`delegate_tool`，**父 Agent 只看摘要不看子 Agent 中间步骤**（context 只保留 delegate_task 调用 + 最终摘要，控制长任务 token 消耗）；子 Agent 硬限制——禁止递归委派、禁止写共享 MEMORY.md、禁止跨平台副作用，`MAX_CONCURRENT_CHILDREN=3`、`MAX_DEPTH=2`。
- **ClaudeCode**：**Fork Subagent**（子代理复用父代理消息前缀 [A,B,C,D] → Anthropic API 层共享 Prompt Cache，实测减少约 50% token）+ Coordinator Mode + 6+ 内置 AgentTool（Code/Research/Review/Test/Debug Agent）。
- **DeerFlow**：`task_tool` + **双线程池**（调度池 3 workers 接收请求/初始化、执行池 3 workers 跑 LLM 循环），后端轮询模型每 5 秒检查状态 + SSE 推送进度，`threading.Event` 协作式取消 + `Future.result(timeout)` 超时控制。
- **nanobot**：SubagentManager + 异步消息总线；关键安全决策——**子代理的工具注册表不含 MessageTool 和 SpawnTool**，防止子代理直接向用户发消息或无限嵌套生成子代理。

**安全防护**：

- **OpenClaw**：**SSRF 两阶段防护**（阶段 1 DNS 前检查 hostname 黑名单 + 内网段格式；阶段 2 DNS 解析后检查解析 IP + **DNS Pinning 锁定首次解析 IP**，阻断 DNS Rebinding 攻击）+ **ExecSecurity 三级执行安全**（deny 完全禁止 / allowlist 白名单 / full 全部允许，配合 ExecAsk：off/on-miss/always）+ SecretRef。
- **hermes-agent**：上下文文件注入防御（prompt_builder 内置威胁模式正则：`ignore previous instructions`/`system prompt override`/curl 外泄 KEY/`cat .env`，加**零宽字符不可见 Unicode 检测**，命中替换为 `[BLOCKED: ...]`）+ MCP 生态安全（OAuth 2.1 PKCE + OSV 数据库扫描已知漏洞）+ **多 Profile 隔离**（每个 Profile 独立 HERMES_HOME，启动最早期隔离）。
- **ClaudeCode**：**YOLO Classifier 两阶段分类**（1496 行）——阶段 1 快速分类（XML 模板匹配，**无 LLM 调用**，明确安全/危险直接判定）；阶段 2 深度分类（带 thinking 的 LLM 判别，注入对话 transcript + CLAUDE.md + deny 指引）。另含 **AI 行为约束**：禁止虚假声明、设置「偷懒借口黑名单」、用「≤25 词」等量化指标替代「请简洁」模糊指令——生产级 Agent 还要约束 AI 自身的不可靠行为。
- **DeerFlow**：**GuardrailMiddleware Fail-closed（默认拒绝）**（AllowlistProvider，未通过返回 GuardrailBlockedResult）+ **LoopDetection**（MD5(tool_calls) 滑动窗口查重，3 次注入警告、≥5 次硬停止剥离 tool_calls）+ ClarificationMiddleware（人机确认，`Command(goto=END)` 中断执行，始终位于链最末尾）。
- **nanobot**：bubblewrap 沙箱 + 工作区限制（移除 SSRF/ExecSecurity 等高级特性，保留核心）。

## 【衍生问题】
- hermes-agent 为什么把 Skill 内容注入**用户消息**而不是 system prompt？（答：注入 system prompt 会改变前缀 → Anthropic cache 失效 → 每次重新计算 → 成本飙升；注入用户消息则 system prompt 不变、cache 持续有效，长对话成本可控。该决策写进 AGENTS.md 作为强制架构约束。）
- 2026 年 AI Agent 框架的六大趋势？（答：连接一切、上下文工程、安全纵深、极致性能、极简主义、自进化能力。）
- 两种工程文化「精打细算派 vs 稳健服务派」如何分野？（答：精打细算派代表 ClaudeCode/nanobot，追求成本最小化、体验极致化、可变状态、Prompt Cache 精细保护、快速失败；稳健服务派代表 OpenClaw/DeerFlow/hermes-agent，追求可观测性、资源有界、系统可靠、不可变消息、孤儿恢复 + 持久化。两派在互相学习。）
- DeerFlow 的 RuntimeFeatures 为什么对 summarization 和 guardrail **不提供内置默认**？（答：设为 True 会被忽略，迫使开发者显式提供摘要和安全策略，而非依赖可能不适合场景的默认实现。）
- nanobot 的运行时检查点如何实现容错恢复？（答：开始工具执行前把当前 Assistant 消息、已完成工具结果、待处理工具调用保存到 Session metadata；崩溃后下次启动 `_restore_runtime_checkpoint()` 把未完成工具调用标记为 error，恢复上下文继续对话。）

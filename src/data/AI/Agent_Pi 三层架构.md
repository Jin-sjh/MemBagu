---
category: Agent
topic: Pi 三层架构
type: bagu
tags: [Agent, Pi, 三层架构, 分层架构, Monorepo, 依赖方向, 类型扩展, Pi包]
difficulty: medium
created: 2026-08-05
---

# Pi 三层架构

## 【问题】
Pi-Agent 项目的代码库按什么分「三层」？五个包各管什么？

## 【回答】
Pi 是 **Monorepo**（npm workspaces，根 `package.json` 声明 `"workspaces": ["packages/*"]`），共有五个包，其中四个构成「核心三件套 + UI」、一个是实验性外围编排层：

| 包 | 层 | 职责 |
|---|---|---|
| **pi-ai**（@earendil-works/pi-ai） | 底层 | 管「调模型」：统一消息类型（`UserMessage`/`AssistantMessage`/`ToolResultMessage`）、统一流式调用 `streamSimple()`、适配 **30+ 提供商**（OpenAI/Claude/Gemini/DeepSeek/Groq/小米等）。没有 agent、没有 tool、没有 loop——**只管把 LLM API 的差异抹平** |
| **pi-agent-core** | 中间层 | 管「跑循环」：维护对话状态（`AgentState`）、跑「调用 LLM → 执行工具 → 再调用 LLM」的循环（`agentLoop`）、发事件（`AgentEvent`）、会话管理与上下文压缩（`compact`）。**不关心具体做什么事**，不知道自己在做编程 Agent 还是客服 Agent |
| **pi-coding-agent** | 顶层 | 管「具体业务」：7 个编程工具（read/bash/edit/write/grep/find/ls）、扩展系统加载运行、会话持久化、CLI 参数解析、认证存储。**这一层最「厚」**，上百个源文件，比前两层加起来还多 |
| **pi-tui** | 独立 UI 包 | 只管显示：终端渲染 Markdown、代码高亮、差分显示。运行时仅依赖 `marked` + `get-east-asian-width`，**没有任何 AI 相关依赖** |
| **pi-orchestrator** | 实验性编排层 | 多 Agent 协同：`supervisor.ts`（监控生命周期）、`rpc-process.ts`（RPC 进程通信）、`radius.ts`（编排边界）。依赖 pi-coding-agent，本身不实现内核逻辑，v0.80.x 新增，API 可能调整 |

直觉分层：**底层调模型，中间跑循环，顶层做业务。**

## 【问题】
分层架构的「真正规则」是什么？为什么顶层 coding-agent 可以直接依赖底层 pi-ai？

## 【回答】
**分层的真正规则不是限制引用层级，而是控制依赖方向必须单向向上。** 底层永远不知道上层的存在——pi-ai 的代码里没有任何一个 import 指向 pi-agent-core 或 pi-coding-agent；所有箭头都朝上。

为什么 coding-agent 会**直接依赖** pi-ai（而不是「隔一层调一层」）？答案藏在类型系统里：`Message`、`Model`、`ImageContent`、`Tool` 等是**整个系统的「原子概念」**——像化学元素一样，不管在哪一层都需要用，所以跨层直接引用是合理的。

各包依赖关系：pi-ai 只依赖厂商 SDK（anthropic/openai/google-genai 等），不依赖任何 pi-xxx 包；pi-agent-core 只向上依赖 pi-ai；pi-coding-agent 只向上依赖 pi-ai / pi-agent-core / pi-tui；pi-tui 独立、无 pi-xxx 依赖，不存在循环依赖。

> **关键结论：分层不是教条，依赖方向控制才是。**

## 【问题】
类型如何在层间流转？Tool → AgentTool → ToolDefinition 分别代表什么？

## 【回答】
**化学类比：pi-ai 定义「原子」（最基础类型），pi-agent-core 把原子组合成「分子」（Agent 专用类型），pi-coding-agent 把分子组合成「材料」（业务专用类型）。**

- **第一层 pi-ai 定义原子**：`Message`（UserMessage | AssistantMessage | ToolResultMessage）、`Model<TApi>`（id/name/api/contextWindow）、`Tool<TSchema>`（name/description/parameters）。Tool 只知道工具「长什么样」。
- **第二层 pi-agent-core 组合成分子**：`AgentTool extends Tool` 继承扩展，新增 `label`（显示名）、`execute`（怎么执行）、`executionMode`（`"sequential" | "parallel"`）；`AgentMessage` 是 `Message` 的**超集**——用**联合类型 `|` 扩展，而非修改原类型**。
- **第三层 pi-coding-agent 组合成材料**：`ToolDefinition` 在 TypeScript 层面是**独立 interface 重新声明**（与 AgentTool 结构兼容，非 extends 继承），叠加 `renderShell`、`promptSnippet`、渲染器等业务属性；另有 `Extension` 运行时聚合体（handlers/tools/commands/flags/shortcuts 等 Map 结构）。

层级职责：**LLM 关心「长什么样」（Tool），Agent 关心「怎么执行」（AgentTool），coding-agent 关心「怎么显示」（ToolDefinition）**。关键设计思想：**每层只加自己关心的事，底层类型从不修改**——底层可独立发布复用，是分层架构的核心承诺。

## 【问题】
写 Agent 一定需要三层吗？「三层不是教条，依赖方向控制才是」怎么理解？

## 【回答】
三场景对比：

- **场景 A：不分层**——所有代码放一个文件，循环逻辑和模型 API 耦合：想换 Claude 就得改 Agent 循环里的调用代码。
- **场景 B：只分两层（pi-ai + pi-agent-core）**——**完全可行**。agent-core 不知道什么是 read/bash 工具，只定义接口规范（`AgentTool`），具体注册什么工具由你决定。coding-agent 层不是必须的。
- **场景 C：只用一层（pi-ai）**——也可以，但得**自己写循环、自己管消息状态、自己处理工具调用**——这正是 pi-agent-core 存在的意义。

**核心结论：三层不是必须的，层数取决于你的复杂度；但依赖方向控制是必须的。** 不可违反的规则：**底层的代码里不能出现任何对上层的引用**（pi-ai 不能 import agent-core 的任何东西；agent-core 不能 import coding-agent 的任何东西）——这条规则确保可以把任何一层换成自己的实现而不影响其他层。

## 【考察点】
- 分层架构思想：底层调模型、中间跑循环、顶层做业务
- **依赖方向单向向上** vs 严格限制引用层级（关键区分点）
- 类型递进扩展：联合类型 `|` 超集 + `extends` 继承 + 独立 interface 结构兼容三种方式的区别
- 底层「可独立使用」验证：去掉上层这一层还能不能跑

## 【衍生问题】
- 「依赖漏斗」分层法、「类型递进扩展」模式、「可独立使用」测试三个方法论如何落地到自己的项目？（待补充）
- agentLoop「调用 LLM → 执行工具 → 再调用 LLM」循环的具体实现长什么样？（下一章内容，待补充）
- pi-orchestrator 的多 Agent 编排（Supervisor / RPC / radius 边界控制）如何工作？（待补充）

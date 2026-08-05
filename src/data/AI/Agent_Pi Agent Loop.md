---
category: Agent
topic: Pi Agent Loop
type: bagu
tags: [Agent, Pi, Agent Loop, Trace, Turn, stopReason, 循环设计, 流式处理, prompt cache]
difficulty: medium
created: 2026-08-05
---

# Pi Agent Loop

## 【问题】
什么是 Trace？什么是 Turn？两者是什么关系？

## 【回答】
这两个概念经常被混用，在 Pi 的代码里每个都有精确含义（对应 Pi Agent Book 第3章，源码 v0.80.2）：

- **Trace（一次完整运行）**：从用户按下回车、到 Agent 彻底停下来、发出 `agent_end` 事件的**整个过程**，一个 Trace 包含多个 Turn。以 `agent_start` 事件开始，以 `agent_end` 事件结束。
- **Turn（一个轮次）**：**一次模型调用 + 这次调用触发的所有工具执行**。每个 Turn 由一对 `turn_start` 和 `turn_end` 事件包裹。

**关键点：一个 Turn 只有一次模型调用。** 模型返回 toolUse → 执行那批工具 → 发送 turn_end → 这个 Turn 就结束了。把工具结果喂回去再调模型，那是**下一个 Turn**。

如果模型在一个 Turn 中一口气要求了 3 个工具（如 read + grep + find），这 3 个工具都在**同一个 Turn** 里执行——因为它们都是同一次模型调用的产物。

```
一个 Trace（一次 agent_start 到 agent_end）
│
├── Turn 1：调模型 → 模型返回 toolUse（要读文件）→ 执行 read 工具
├── Turn 2：带着工具结果再调模型 → 模型返回 toolUse（还要改文件）→ 执行 edit 工具
└── Turn 3：带着工具结果再调模型 → 模型返回 stop（没有工具调用）→ agent_end
```

## 【问题】
使用大模型的三种模式（直接调用 / Workflow / Agent Loop）有什么区别？

## 【回答】
| 维度 | 直接调用 | Workflow | Agent Loop |
|---|---|---|---|
| **决策者** | 用户 | 你的代码 | 模型 |
| **模型调用次数** | 1 次 | N 次（由代码控制） | 不确定（由模型控制） |
| **核心工作** | 写提示词 | 设计流程 | 定义工具和循环 |
| **模型角色** | 执行者 | 流水线环节 | 自主决策者 |
| **典型场景** | 翻译、摘要 | 文档流水线、RAG | 编程助手、自动化任务 |

**关键区别：Agent 模式中步骤之间的流转不再由你写死，而是由模型的输出内容来驱动。** 你的代码只做两件事：① 把用户的输入和工具执行结果喂给模型；② 如果模型输出里包含工具调用请求就执行它，没有就认为任务完成。

**「什么时候该停」是**人类定义的规则**：当模型的一次输出中不再包含工具调用时，就认为循环可以结束——这不是模型的「智能决策」，而是工程约定。

## 【问题】
stopReason 有哪五种取值？它们分别来自哪里？

## 【回答】
`stopReason` 是驱动整个循环的「信号灯」，但它实际上有两种来源：

**模型 API 真正返回的三种**：

| stopReason | 含义 |
|---|---|
| `"toolUse"` | 模型输出了工具调用 JSON，API 检测到后返回 |
| `"stop"` | 生成自然终止（遇到了结束标记），没有工具调用 |
| `"length"` | token 数达到 maxTokens 上限，被截断 |

**框架的流式层注入的两种**（模型 API 本身不会返回）：

| stopReason | 含义 | 谁注入的 |
|---|---|---|
| `"error"` | 调用过程异常（网络断了、API 报错等） | 流式层的 catch 块：`output.stopReason = "error"` |
| `"aborted"` | 用户主动中止（AbortSignal 触发） | 流式层的 catch 块：`output.stopReason = "aborted"` |

> 关键认知：**模型不会说「我要停了」**。模型只是 token 预测器——给定上下文猜下一个 token。`error`/`aborted` 不是模型说的，是框架替它「兜底」的。

## 【问题】
Agent Loop 循环到底由什么驱动？「什么时候停」是谁决定的？

## 【回答】
**循环只看一件事：模型输出里有没有工具调用。** 这背后是一条人类定义的工程约定：*如果模型一次输出中没有工具调用，就认为本轮不需要更多操作，循环可以停了。*

代码里最精炼的判断（`agent-loop.ts:202-216`）：

```typescript
const toolCalls = message.content.filter(c => c.type === "toolCall");
hasMoreToolCalls = false;
if (toolCalls.length > 0) {
  const executedToolBatch = await executeToolCalls(...);
  hasMoreToolCalls = !executedToolBatch.terminate;  // 任何一个工具 terminate 则停止
}
```

**实际驱动循环的不是 `stopReason === "toolUse"`，而是 `toolCalls 数组长度 > 0 && !terminate`**。这意味着：

- 即使 `stopReason === "length"`（被截断），只要 content 里有 toolCall 块，循环仍会执行工具；
- 反之，即使 `stopReason === "toolUse"`，如果所有工具结果都设置 `terminate: true`，循环也会停。

**为什么不让代码更智能地判断「任务完成没」？** 因为 Agent 模式下你不知道模型要读几个文件、改几处代码——唯一能稳定依赖的信号就是**输出里有没有工具调用**。这是 Agent 架构的核心设计原则：把决策外包给模型输出模式，代码只做最简单的信号判断。换个说法：**不是模型在说「我完成了」，而是我们在说「你没要工具，那就当你完成了」。**

## 【问题】
Agent Loop 有哪些退出路径？各自的触发条件是什么？

## 【回答】
五种 stopReason 分三路处理（toolUse 让循环继续转；stop/length 准备正常停仍检查 followUp；error/aborted 硬停止不检查 followUp）：

| 退出路径 | 触发条件 | 原因 |
|---|---|---|
| **正常退出** | `stop` / `length` + 无 followUp + 无 pendingMessages | 最常见。模型没要工具，也没追加任务 |
| **硬停止** | `error` / `aborted` | 模型调用本身出了问题，继续跑没意义，不检查 followUp——**fail fast 策略** |
| **外部钩子停** | `shouldStopAfterTurn()` 返回 true | 上下文快满了、达到最大 Turn 数等产品层「安全阀」 |
| **工具终止** | 一批工具的执行结果**全部** `terminate: true` | 所有工具都同意停止（是 `every` 不是 `some`） |

`error`/`aborted` 硬停止时：立即发 `turn_end` + `agent_end` 直接 return，连工具都不执行、连 followUp 都不检查。

## 【问题】
最简 Agent Loop 内核长什么样？Pi 的 coding-agent 在此基础上叠加了什么？

## 【回答】
**最简 Loop 是所有 Agent 的最小公约数**，十几行代码就能实现：

```typescript
async function simpleLoop(messages, model, tools) {
    while (true) {
        // ① 调模型
        const response = await callModel(model, messages, tools);
        messages.push(response);

        // ② 没有工具调用 → 结束
        if (response.stopReason !== "toolUse") {
            return messages;
        }

        // ③ 有工具调用 → 执行，把结果喂回去
        for (const toolCall of response.toolCalls) {
            const result = await executeTool(toolCall);
            messages.push(result);
        }
    }
}
```

Pi 的 coding-agent 是**交互式编程助手**，在此基础上按真实需求叠加了四层设计：

| 真实需求 | 叠加的设计 | 检查时机 |
|---|---|---|
| 用户在 Agent 工作期间又输入新指令 | **steering 消息注入**：紧急消息在 Turn 之间插队 | 内层循环开头 + 每圈结尾 |
| 系统在 Agent 完成后想追加任务（如「顺便跑个测试」） | **外层 followUp 循环**：内层停了外层可重启内层 | 内层循环全部结束后 |
| 不同复杂度任务用不同档次的模型 | **prepareNextTurn 钩子**：每个 Turn 结束时可切换模型/上下文/thinkingLevel | turn_end 之后 |
| 上下文窗口快满需触发压缩 | **shouldStopAfterTurn 钩子**：外部判断是否该停 | prepareNextTurn 之后 |

**关键认知：内核是所有 Agent 的通用法则，叠加是产品功能的按需选择。** 做简单 Agent 时，外层循环、这些钩子全是多余的——先搭内核，再按场景加叠加。判断「内核是否被污染」的试金石：剥掉任何一层叠加，里层仍能跑。

## 【问题】
steering 和 followUp 都是「插队」消息，它们有什么区别？

## 【回答】
| 维度 | steering（叠加1） | followUp（叠加2） |
|---|---|---|
| **检查时机** | runLoop 开始前 + 内层循环**每圈**结尾 | 内层循环**全部结束**后 |
| **语义** | 「紧急插队」——在工具执行间隙中插入 | 「排队等叫号」——等当前任务全部完成 |
| **典型场景** | 用户在 Agent 工作时输入了新指令 | 系统在 Agent 完成后追加「顺便跑个测试」 |

生活类比：steering 是你正在开会，有人敲门递了张纸条——「紧急，先看这个」；followUp 是开完会翻了翻信箱——「不急，但需要处理」。

机制细节：followUp 消息会被塞进 `pendingMessages`，`continue` 回到外层循环顶部，内层循环检测到 `pendingMessages` 不为空，**在同一个 Trace 内**继续跑——比重新启动一个新的 `runAgentLoop()` 好就好在**连续性**：同一个 `newMessages` 数组、同一个事件序列，不需要额外合并。首次 steering 检查必须在进入循环**之前**做（`agent-loop.ts:167`），因为用户在等待 LLM 首次响应时可能又输入了内容，如果不提前取出来这批消息就漏掉了。

## 【问题】
Pi 如何调度一批工具的执行？「一票否决」和并行三阶段分别是什么？

## 【回答】
先过滤出 `type === "toolCall"` 的块，然后决定这批工具**并行还是串行**执行：

```typescript
if (config.toolExecution === "sequential" || hasSequentialToolCall) {
    return executeToolCallsSequential(...);   // 串行
}
return executeToolCallsParallel(...);         // 并行
```

**「一票否决」策略**：只要这批工具中有**任何一个**声明了 `executionMode: "sequential"`，整批都串行。为什么这么保守？因为判断「哪些工具会冲突」很难——两个 edit 操作不同文件就安全吗？万一它们编辑的文件有依赖关系呢？所以 Pi 选择「宁可多等，不可出错」。edit 工具内部还有第二道防线（`withFileMutationQueue`，对同一文件的编辑串行化）。

**并行模式三阶段设计**：

```
阶段1 - 准备（顺序）：  A 准备 → B 准备 → C 准备
    ↑ prepareToolCall 含验证和 beforeHook，必须顺序执行
阶段2 - 执行（并行）：  A、B、C 同时执行（Promise.all）
    ↑ 只有 tool.execute 并行，省时间
阶段3 - 事件（有序）：  end 按完成顺序发；result 按调用顺序发
    ↑ result 消息保持和 ToolCall 一致的顺序，LLM 收到的上下文才是正确的
```

精妙点：**准备阶段始终顺序**（因为验证和权限检查不能并行——万一 B 被拦截了，C 就不应该执行），**只有实际执行并行**。

**terminate 机制**：工具可以在返回结果中设置 `terminate: true` 表示「我觉得不该继续了」。但 Loop 用的是 `every` 而非 `some`：**必须这批工具的全部结果都设置 terminate 才真正退出**——只要有一个工具还在正常工作，Loop 就不中断。

## 【问题】
streamAssistantResponse 调 LLM 分为哪几个阶段？「流式原地替换」是为了什么？

## 【回答】
`streamAssistantResponse()` 分为四个阶段：

**阶段 A：上下文预处理（可选）**：`config.transformContext(messages, signal)` 可对上下文做压缩等预处理。

**阶段 B：AgentMessage → Message 转换（两层消息的边界）**：Agent 内部有自己的「内部语言」（如 `CompactionSummaryMessage`、`BashExecutionMessage`），LLM 只认三种标准消息 `UserMessage` / `AssistantMessage` / `ToolResultMessage`。`convertToLlm` 是站在边界上的**翻译官**，默认实现就是一个 `.filter()` 过滤掉非标准消息。

**阶段 C：构建 Context 并调用模型**：`llmContext` 是**全新对象**，每圈内层循环都重建一次。注意 `tools`/`systemPrompt` 是**引用赋值**，只有 `messages` 真的在长。重建 wrapper 是为了防止 `prepareNextTurn` 换模型/改 systemPrompt/动态注册工具后出现共享引用的状态污染。

**阶段 D：流式处理——「空壳 push + 原地替换」**：

```typescript
for await (const event of response) {
    switch (event.type) {
        case "start":
            partialMessage = event.partial;           // 拿到"空壳"消息
            context.messages.push(partialMessage);    // 直接 push 到 context
            break;
        case "text_delta":
        case "toolcall_delta":
        case "thinking_delta":
            partialMessage = event.partial;
            context.messages[last] = partialMessage;  // ★ 原地替换！
            break;
        case "done":
        case "error":
            finalMessage = await response.result();
            context.messages[last] = finalMessage;    // ★ 用最终完整消息替换
            return finalMessage;
    }
}
```

**「原地替换」的意思是——不 push 新条目，而是用新内容覆盖最后一条**（`context.messages[last] = partialMessage`）。这样 context 的消息数量不变，但最后一条消息的内容在「长大」。

**目的是为了 UI 能实时展示**：如果等全部响应完成才 push，用户在 LLM 思考的几秒里盯着空白屏幕。通过「先放空壳、逐 token 替换」，UI 通过 `message_update` 事件拿到最新部分消息，能逐字渲染。

## 【衍生问题】
- prompt cache 与循环：Pi 在 Anthropic 的三个位置打 `cache_control: { type: "ephemeral" }` 标记——system prompt 末尾、**最后一个 tool**、**最后一条 user message**（rolling cache，cache breakpoint 跟着最新消息走，旧前缀继续命中、新追加内容被写入）；tools 是独立顶层字段（在 messages 之前）而非塞进消息末尾，prefix 越长越省。OpenAI 体系走 `prompt_cache_key: sessionId` 按 session 匹配前缀。（待补充完整问答）
- 工具执行的五步管道（prepareArguments → Schema 验证 → beforeToolCall → execute → afterToolCall）具体如何工作？（第5章内容，待补充）
- 两层消息系统（AgentMessage 内部语言 vs LLM 标准三种消息）的完整设计？（第6章内容，待补充）

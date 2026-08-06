---
category: Agent
topic: Pi 工具系统
type: bagu
tags: [Agent, Pi, 工具系统, ToolCall, ToolDefinition, 错误处理, Operations, TypeBox]
difficulty: medium
created: 2026-08-06
---

# Pi 工具系统

## 【问题】
为什么工具不是简单函数调用？模型输出 ToolCall 后到结果回传中间要经过哪五步管道？

## 【回答】
工具调用是一条**受控管道**而不是简单函数调用——模型输出 `{ type: "toolCall", id: "call_abc123", name: "read", arguments: { path: "src/main.ts" } }` 后，要经过**五步管道**：

```
LLM 输出 ToolCall
  │
  ▼
① prepareArguments（参数预处理）     —— 处理 LLM 参数怪癖（如字符串化数组还原）
  │
② validateToolArguments（Schema 验证）—— TypeBox 运行时类型检查（如 path 必须是 string）
  │
③ beforeToolCall（前置钩子）         —— 产品层权限拦截，可阻止执行
  │
④ tool.execute（实际执行）           —— 调用 execute 函数，支持 onUpdate 流式进度回调
  │
⑤ afterToolCall（后置钩子）          —— 产品层结果后处理，可修改返回值
  │
  ▼
ToolResultMessage（追加到对话历史，下一轮发给模型）
```

**核心设计：任何一步出错都不会抛异常打断循环，所有失败都汇聚成一条 `isError: true` 的消息**。参数验证挡垃圾数据，钩子拦截危险操作，Operations 抽象让同一份代码本地/远程都能跑。

## 【问题】
Pi 用三层类型定义工具（Tool / AgentTool / ToolDefinition）？各层职责是什么？为什么必须分三层？

## 【回答】
三层类型各管一段生命周期，**职责递进：能描述自己 → 能被执行 → 能展示和扩展**：

| 层级 | 接口 | 职责 | 关键字段 |
|---|---|---|---|
| **第一层** | `Tool`（纯模型适配层） | **能描述自己**：把工具信息告诉模型 | `name`、`description`、`parameters` |
| **第二层** | `AgentTool`（运行时层） | **能被执行**：Agent Loop 能执行工具 | 继承 Tool + `label`、`prepareArguments`、`execute`、`executionMode` |
| **第三层** | `ToolDefinition`（产品层） | **能展示和扩展**：访问会话上下文 | 比 AgentTool 的 execute 多了 `ctx: ExtensionContext` 参数，另有 `promptSnippet`、`renderCall`、`renderResult` |

```typescript
// 第一层：Tool（packages/ai/src/types.ts:433-437）
export interface Tool<TParameters extends TSchema = TSchema> {
    name: string;
    description: string;
    parameters: TParameters;
}

// 第二层：AgentTool（packages/agent/src/types.ts:371-394）
export interface AgentTool<TParameters, TDetails> extends Tool<TParameters> {
    label: string;
    prepareArguments?: (args: unknown) => Static<TParameters>;
    execute: (
        toolCallId: string,
        params: Static<TParameters>,
        signal?: AbortSignal,
        onUpdate?: AgentToolUpdateCallback<TDetails>,
    ) => Promise<AgentToolResult<TDetails>>;
    executionMode?: "sequential" | "parallel";
}
```

**为什么分三层：每层有独立依赖范围**——`pi-ai` 纯模型适配层不应依赖终端 UI 渲染库；产品层才需要会话上下文做展示与扩展。

## 【问题】
Agent Loop 为什么感知不到 ExtensionContext？wrapToolDefinition 桥接器怎么工作？

## 【回答】
**桥接机制：`wrapToolDefinition` 包装器（十几行代码）通过闭包注入 `ctxFactory`，把 ToolDefinition 变为 AgentTool**，让 `pi-ai`/`pi-agent` 层永远不知道 `ExtensionContext` 的存在（呼应三层依赖隔离）：

```typescript
// packages/coding-agent/src/core/tools/tool-definition-wrapper.ts
export function wrapToolDefinition(definition, ctxFactory?) {
    return {
        name: definition.name,
        label: definition.label,
        description: definition.description,
        parameters: definition.parameters,
        prepareArguments: definition.prepareArguments,
        executionMode: definition.executionMode,
        // 关键：重写 execute，通过闭包注入 ExtensionContext
        execute: (toolCallId, params, signal, onUpdate) =>
            definition.execute(toolCallId, params, signal, onUpdate, ctxFactory?.()),
    };
}
```

`ctx` 不是 `AgentTool.execute` 签名的一部分，而是**包装器在调用时用闭包补上的第五个参数**——产品层工具声明时多写一个 `ctx` 就能访问会话上下文，而 Agent Loop 侧完全无感。

## 【问题】
Pi 的并行 / 串行调度怎么决策？"一票否决"和三阶段设计是什么？

## 【回答】
**一票否决策略：只要批次里有一个工具声明 `executionMode: "sequential"`，整个批次就串行执行**——宁可多等，不可出错。Agent Loop 运行时只判断是否 `"sequential"`，未声明一律按并行处理（`agent-loop.ts:382`）：

```typescript
const hasSequentialToolCall = toolCalls.some(
    (tc) => tools?.find((t) => t.name === tc.name)?.executionMode === "sequential",
);
if (config.toolExecution === "sequential" || hasSequentialToolCall) {
    return executeToolCallsSequential(...);
}
return executeToolCallsParallel(...);
```

**并行执行的三阶段设计**：
1. **准备阶段（顺序）**：emit_start → prepareArguments → validate → beforeToolCall（因为 beforeToolCall 可能有副作用）
2. **执行阶段（并行）**：只有 `tool.execute()` 用 `Promise.all` 并行
3. **事件发送（有序）**：`tool_execution_end` 按完成顺序发，但 ToolResultMessage 按调用顺序发

**细节（v0.80.2）**：7 个内置工具（read/write/edit/bash/grep/find/ls）均未显式声明 executionMode，默认全部 `"parallel"`。Edit 工具的文件安全由内部的 `withFileMutationQueue`（file-mutation-queue.ts）保证，确保对**同一文件**的编辑串行化。

## 【问题】
Pi 工具系统的错误处理哲学是什么？"6 种错误，1 种产物"具体指什么？

## 【回答】
核心哲学：**"错误信息是给模型的反馈，不是给框架的终止信号"**——让模型自己决定下一步（重试、换路径、向用户解释），框架不知道上下文，无法替模型决策。**异常与消息的区别不在内容而在接收者：异常接收者是调用栈（打断循环），消息接收者是模型（消化错误继续）**。

**6 种错误，1 种产物**——所有错误最终都变成 `ToolResultMessage { isError: true }`：

| 出错环节 | 处理方式 |
|---|---|
| 工具未找到 | 直接返回错误结果 |
| prepareArguments 抛异常 | try-catch 捕获 |
| Schema 验证失败 | try-catch 捕获 |
| beforeToolCall 阻止 | 返回阻止结果 |
| tool.execute 抛异常 | executePreparedToolCall 的 try-catch 捕获 |
| afterToolCall 抛异常 | finalizeExecutedToolCall 的 try-catch 捕获 |

`executePreparedToolCall`（agent-loop.ts:628-669）是**双重防护**：成功路径返回 `{ result, isError: false }`，catch 块把 `error.message` 原样透传成错误 ToolResultMessage（`createErrorToolResult`，3 行），同时用 `acceptingUpdates` 标志位防止 execute settle 后的孤儿 onUpdate 回调污染已结束的工具调用。

## 【问题】
两层错误处理怎么分工？Bash 工具的主动错误识别为什么是"教科书级"？

## 【回答】
**第一层（工具内部·主动）**：识别已知错误类型，包装成**具体可读的描述**（Bash 工具是典范）；**第二层（框架兜底·被动）**：`executePreparedToolCall` 的 catch 把 `error.message` 原样透传，**不创造新描述**。

**错误描述越具体，模型纠错能力越强**——"Offset 200 is beyond end of file (100 lines total)" 远好于 "Read failed"；能识别的错误一定要包装，识别不了的**不要硬编码描述**，直接 `throw err` 让框架兜底，而不是写 `throw new Error("操作失败")` 这种笼统描述。

```typescript
// Bash 工具（packages/coding-agent/src/core/tools/bash.ts:390-407）
} catch (err) {
    const snapshot = await finishOutput();
    const { text } = formatOutput(snapshot, "");
    if (err instanceof Error && err.message === "aborted") {
        throw new Error(appendStatus(text, "Command aborted"));
    }
    if (err instanceof Error && err.message.startsWith("timeout:")) {
        const timeoutSecs = err.message.split(":")[1];
        throw new Error(appendStatus(text, `Command timed out after ${timeoutSecs} seconds`));
    }
    if (exitCode !== 0 && exitCode !== null) {
        throw new Error(appendStatus(outputText, `Command exited with code ${exitCode}`));
    }
    throw err;    // 识别不了的异常，原样抛出，交给框架兜底
}
```

## 【问题】
Operations 抽象是什么？为什么工具不直接调用 fs、child_process？

## 【回答】
工具不直接调用 `fs`、`child_process` 等系统 API，而是定义**最小化接口**，通过 `ops` 对象调用。**不同环境注入不同实现，工具代码一行不改**：
- **本地默认**：`defaultReadOperations`
- **单元测试**：Mock 注入（无需创建真实文件）
- **远程执行**：SSH 注入

每个工具只定义自己需要的最小接口：Read 只需 `readFile`/`access`，Bash 只需 `exec`，Grep 最精简（`isDirectory`/`readFile`）：

```typescript
export interface ReadOperations {
    readFile: (absolutePath: string) => Promise<Buffer>;
    access: (absolutePath: string) => Promise<void>;
    detectImageMimeType?: (absolutePath: string) => Promise<string | null>;
}

// Mock 注入
const tool = createReadToolDefinition(cwd, {
    operations: {
        readFile: () => Buffer.from("mock file content"),
        access: () => {},
    }
});
```

各工具 Operations 接口清单：Read（readFile/access/detectImageMimeType）、Write（writeFile/mkdir）、Edit（readFile/writeFile/access）、Bash（exec）、Grep（isDirectory/readFile）、Find（exists/glob）、Ls（exists/stat/readdir）。

## 【问题】
自定义工具的错误处理最佳实践是什么？onUpdate 为什么使工具执行"可观察"？

## 【回答】
自定义工具错误处理**两步模板**：先识别已知错误包装成具体描述，识别不了的异常原样抛出让框架兜底：

```typescript
execute: async (id, params, signal, onUpdate) => {
    try {
        // ... 业务逻辑
        return { content: [...], details: {...} };
    } catch (err) {
        // 第 1 步：识别已知错误类型，重新包装成具体描述
        if (err instanceof MyKnownErrorA) {
            throw new Error(`具体的描述A：${err.message}。建议的修复方法...`);
        }
        if (err instanceof MyKnownErrorB) {
            throw new Error(`具体的描述B：${err.message}。可能的原因...`);
        }
        // 第 2 步：实在识别不了的异常，原样抛出，让框架兜底
        throw err;
    }
}
```

`onUpdate` 使工具执行**"可观察"**——解决长任务进度感知问题（Bash 工具以 ~100ms 间隔推送终端输出）。`acceptingUpdates` 标志位是防孤儿回调的关键：execute settle 后立即置 false，丢弃迟到/并发的进度回调，避免污染已结束的工具调用。

## 【问题】
第5章沉淀的 4 个可复用设计模式是什么？工具系统与第4章模型调用如何衔接？

## 【回答】
四个可复用设计模式：
1. **分层接口递进法**：基础层描述（Tool）→ 运行时层执行（AgentTool）→ 产品层展示（ToolDefinition），用包装器桥接。
2. **管道+钩子模式**：核心管道（prepare → validate → execute）+ 前后钩子（before/after），错误统一编码为正常消息。
3. **错误即消息原则**：所有错误编码为 `isError: true` 的 ToolResultMessage，绝不让原始异常穿透打断 Agent Loop。
4. **Operations 抽象法**：通过最小接口间接调用系统 API，测试可 Mock，远程可 SSH。

**与第4章的衔接**：第4章「模型调用」讲的是模型回复里 `toolcall_start → toolcall_delta → toolcall_end` 事件如何被翻译器逐字吐出（12 种统一事件），而第5章「工具系统」讲的是这条 ToolCall 被 Agent Loop 接住后如何安全执行——`toolcall_end` 携带的 `partial: AssistantMessage` 里包含 `toolCalls[]`，Agent Loop 据此进入第5章的五步管道，执行完把 `ToolResultMessage` 追加回上下文再进入下一轮循环。

## 【问题】
afterToolCall 后置钩子有什么用？"字段级覆盖"的合并语义是什么？

## 【回答】
`afterToolCall` 是产品层的**后置钩子**，在工具执行完成后可**修改结果**，四种典型用途：

| 场景 | 做什么 | 怎么做 |
|---|---|---|
| **脱敏** | 替换工具返回的敏感信息 | 返回 `{ content: [{type:"text", text:"[已脱敏]"}] }` |
| **审计** | 记录工具调用详情 | 读 result，写日志，返回 `undefined` |
| **修错** | 把错误结果修正为正常结果 | 返回 `{ isError: false, content: [...] }` |
| **早停** | 让 Agent 在当前批次后停止 | 返回 `{ terminate: true }` |

合并语义为**字段级覆盖**——提供了就替换，没提供就保留原值。返回 `undefined` 表示不改动；返回部分字段则只覆盖对应字段。

## 【问题】
工具调用的终点 ToolResultMessage 结构是什么？进度事件流如何流向 UI？

## 【回答】
管道终点统一产出一条 `ToolResultMessage`，**追加到对话历史后，在下一轮循环里作为上下文发给模型**：

```typescript
{
    role: "toolResult",
    toolCallId: "call_abc123",      // 关联到原始 ToolCall
    toolName: "read",
    content: [{ type: "text", text: "1│ import { Agent }..." }],
    details: { language: "typescript" },  // 给 UI 的元数据
    isError: false,
    timestamp: 1700000000000,
}
```

长任务执行中工具通过 `onUpdate` **持续 yield 进度事件**，事件流为 `tool_execution_start → tool_execution_update（若干） → tool_execution_end`，最终流向 UI。**这些事件最终去向（谁在监听、Agent 内核如何不需要知道 UI 存在）是下一章「消息系统」的核心议题。**

## 【衍生问题】
- Pi 三层工具定义与第4章 `StreamFunction` 的关系：翻译器只负责把 ToolCall 以事件形式送出来，工具的执行/验证/安全完全由 AgentTool 层负责，职责如何划界？（可参照 `Agent_Pi 模型调用` 条目）
- 产品层 `ToolDefinition` 的 `promptSnippet`/`renderCall`/`renderResult` 如何被 Coding Agent 用于提示词拼装与终端渲染？（extension 扩展体系内容，待补充）

## 【源码索引】
| 位置 | 作用 |
|---|---|
| `packages/ai/src/types.ts:433-437` | `Tool` 接口（第一层·纯模型适配） |
| `packages/agent/src/types.ts:371-394` | `AgentTool` 接口（第二层·运行时执行） |
| `packages/agent/src/types.ts:41` | `ToolExecutionMode` 类型（sequential/parallel） |
| `packages/coding-agent/src/core/extensions/types.ts:435-482` | `ToolDefinition` 接口（第三层·产品层） |
| `packages/coding-agent/src/core/tools/tool-definition-wrapper.ts:5-18` | `wrapToolDefinition` 桥接器 |
| `packages/agent/src/agent-loop.ts:562-626` | `prepareToolCall`（五步管道前 3 步） |
| `packages/agent/src/agent-loop.ts:628-669` | `executePreparedToolCall`（第 4 步 + 框架兜底 catch） |
| `packages/agent/src/agent-loop.ts:671-714` | `finalizeExecutedToolCall`（第 5 步） |
| `packages/agent/src/agent-loop.ts:716-721` | `createErrorToolResult`（3 行） |
| `packages/agent/src/agent-loop.ts:382` | 串行/并行判断（只判断 sequential） |
| `packages/coding-agent/src/core/tools/file-mutation-queue.ts:32-61` | `withFileMutationQueue`（同文件编辑串行化） |
| `packages/coding-agent/src/core/tools/bash.ts:390-407` | Bash 主动错误识别典范 |
| `packages/coding-agent/src/core/tools/read.ts:275` | Read 越界附文件总行数 |
| `packages/coding-agent/src/core/tools/edit.ts:330` | Edit 附文件路径 |
| `packages/coding-agent/src/core/tools/read.ts:43-50` | ReadOperations |
| `packages/coding-agent/src/core/tools/bash.ts:40-58` | BashOperations |
| `packages/coding-agent/src/core/tools/grep.ts:51-56` | GrepOperations |
| `packages/coding-agent/src/core/tools/find.ts:41-46` | FindOperations |
| `packages/coding-agent/src/core/tools/ls.ts:32-39` | LsOperations |

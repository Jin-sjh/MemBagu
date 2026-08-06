---
category: Agent
topic: Pi 模型调用
type: bagu
tags: [Agent, Pi, 模型调用, Model Call, 翻译器, 事件协议, ThinkingLevel, 缓存控制, SSE]
difficulty: medium
created: 2026-08-05
---

# Pi 模型调用

## 【问题】
为什么 Agent 框架不能为每个模型供应商单独写调用逻辑？不同 Provider 的 API 差异体现在哪些维度？

## 【回答】
Pi 内部用统一格式存储消息（`{ role: "user", content: "帮我读一下 main.ts", timestamp: 1748697600000 }`），但发往不同 Provider 时必须转换为各自的格式——**Agent Loop 只有一行 `streamSimple(model, context)`，不可能为每个 Provider 单独写逻辑**。差异体现在**四个维度**：

| 维度 | 差异点 | 示例 |
|---|---|---|
| **消息格式** | 字段名和结构不同 | Anthropic 用 `content[]`（每项带 `type` 字段），Google Gemini 用 `parts[]`，Bedrock 的 text 没有 `type` 字段 |
| **流式传输** | 逐字返回机制不同 | Anthropic 返回原始 SSE 需自解析；OpenAI SDK 直接返回结构化 chunk |
| **思考模式** | 深度思考的参数不同 | Anthropic 用 `thinking.budget_tokens`，OpenAI 用 `reasoning_effort` |
| **缓存控制** | 标记不变内容的方式不同 | Anthropic 打 `cache_control`，Bedrock 插 `cachePoint` |

各家消息格式示例：

```typescript
// Anthropic（Claude）：内容必须是数组，每项带 type
{ role: "user", content: [{ type: "text", text: "帮我读一下 main.ts" }] }
// OpenAI（GPT）：工具结果消息必须用单独的 { role: "tool" }
{ role: "user", content: "帮我读一下 main.ts" }
// Google（Gemini）：字段名从 content 变成 parts
{ role: "user", parts: [{ text: "帮我读一下 main.ts" }] }
// Bedrock（AWS）：text 没有 type 字段
{ role: "user", content: [{ text: "帮我读一下 main.ts" }] }
```

## 【问题】
Pi 用什么三层架构抽象模型调用？各层职责是什么？

## 【回答】
类比国际翻译公司：**前台（第一层）+ 标准报告模板（第二层）+ 翻译员（第三层）**：

**第一层 · 统一入口——「接收请求，查出该找谁处理」**：`stream()` 只做「查表，派活」，`model.api` 字段就是 key，拿 key 查注册表找到翻译器：

```typescript
// compat.ts
export function stream(model, context, options?) {
  const provider = resolveApiProvider(model.api);  // 查表
  return provider.stream(model, context, options);  // 派活
}

const BUILTIN_APIS = [
  ["anthropic-messages",       anthropicMessagesApi()],      // Claude
  ["openai-completions",       openAICompletionsApi()],      // GPT
  ["google-generative-ai",     googleGenerativeAIApi()],     // Gemini
  ["bedrock-converse-stream",   bedrockConverseStreamApi()], // Bedrock
  // ... 还有 5 个
];
```

**第二层 · 事件协议——「约定输出格式」**：所有翻译器必须输出统一的 `AssistantMessageEventStream`，包含 **12 种事件**。设计模式：**模型回复内容分三类（文字、思考、工具调用），每类都有「开始 → 逐字增量 → 结束」三步，加上流开始和流结束信号**；每个事件都携带 `partial: AssistantMessage`——当前消息的完整快照，用于「原地替换」。

**第三层 · 翻译器——「每个翻译器精通一种 Provider 的方言」**：所有翻译器按 **5 步工作流程**执行——① 创建客户端 → ② 构建请求参数（统一格式 → Provider 私有格式，**核心工作量**）→ ③ 发送请求 → ④ 处理响应流（Provider 私有响应 → 12 种统一事件，**核心工作量**）→ ⑤ 发送终止事件（done / error）。

以 Anthropic 为例的第 4 步映射：`content_block_start (type: "text")` → `text_start`，`content_block_delta (text_delta)` → `text_delta`，`content_block_start (type: "tool_use")` → `toolcall_start`，`content_block_delta (input_json)` → `toolcall_delta`，`message_delta (stop_reason)` → `done`（终止原因映射：`end_turn` → `"stop"`，`tool_use` → `"toolUse"`）。

## 【问题】
12 种统一事件 AssistantMessageEvent 长什么样？「开始 → 增量 → 结束」三步模式解决什么问题？

## 【回答】
`AssistantMessageEvent`（12 种）：

```
AssistantMessageEvent（12 种）
│
├── start                              ← 流开始了
│
├── text_start → text_delta → ... → text_end       ← 模型输出文字
├── thinking_start → thinking_delta → ... → thinking_end  ← 模型在思考
├── toolcall_start → toolcall_delta → ... → toolcall_end  ← 模型要调工具
│
├── done   (reason: stop / length / toolUse)   ← 正常结束
└── error  (reason: error / aborted)           ← 出错
```

**三类内容各走「开始 → 逐字增量 → 结束」**，加上 `start`（流开始）和 `done`/`error`（流结束信号），共 12 种。每个事件携带 `partial: AssistantMessage`（当前消息的完整快照），上层拿到 `partial` 后**原地替换**最后一条消息即可实现逐字渲染，不必等全部响应完成才 push 到上下文（呼应第3章「流式原地替换」——UI 靠 `message_update` 事件拿到最新部分消息逐字显示）。

## 【问题】
StreamFunction 是什么？它定义的「翻译器入职要求」三条规则是什么？

## 【回答】
`StreamFunction` 是整个抽象层的**「宪法」**——统一规定翻译器的输入输出签名：

```typescript
export type StreamFunction<TApi extends Api, TOptions> = (
  model: Model<TApi>,       // 用哪个模型
  context: Context,         // 对话上下文（系统提示 + 消息 + 工具）
  options?: TOptions,       // 可选配置（思考级别、缓存等）
) => AssistantMessageEventStream;  // ← 必须返回统一事件流
```

三条规则：**① 输入相同**（接受同样三个参数 model、context、options）；**② 输出相同**（必须返回 `AssistantMessageEventStream`）；**③ 错误不抛异常**——失败时发 `{ type: "error" }` 事件，而不是 `throw`。规则 3 呼应第3章的**「永不抛出」原则**：`stopReason: "error"` 和 `"aborted"` 是翻译器 catch 块注入的，模型 API 本身不会返回这两种值。

## 【问题】
如何接入一个新模型？三步流程是什么？

## 【回答】
**第 1 步：写一个翻译器**（符合 `StreamFunction` 签名）：统一消息格式 → 模型 API 格式；模型流式响应 → Pi 的 12 种统一事件；异常不抛 throw，而是 push `error` 事件。

**第 2 步：注册翻译器**：

```typescript
registerApiProvider({
  api: "your-model-api",           // 翻译器名字
  stream: yourStreamFunction,       // 你写的翻译器
  streamSimple: yourSimpleFunction, // 便捷版本
});
```

**第 3 步：配置模型信息**：

```typescript
const yourModel: Model = {
  id: "your-model-id",
  api: "your-model-api",     // ← 指向第 2 步注册的名字
  provider: "your-provider",
  baseUrl: "https://api.your-model.com",
  // ... 其他元数据（上下文窗口大小、是否支持思考等）
};
```

**完成后 Agent Loop 一行都不用改**。调用侧两个入口的分工：`stream()` 是最底层入口，只做查表+派活，不管思考级别翻译；`streamSimple()` 是便捷封装，自动处理思考级别翻译、自动调整 token 上限，是实际开发常用入口（`streamSimple(model, context, { reasoning: "high" })`）。

## 【问题】
Pi 如何统一不同供应商的「思考模式」参数？ThinkingLevel 五级刻度和 clampThinkingLevel 回退是什么？

## 【回答】
各家思考模式的「方言」完全不同——**Anthropic 用 token 预算**（`params.thinking = { type: "enabled", budget_tokens: 16384 }`）、**OpenAI 用努力程度**（`params.reasoning_effort = "high"`）、**Google 用 thinkingConfig**（`config.thinkingConfig = { includeThoughts: true, thinkingLevel: "high" }`）。

Pi 的统一方案是 **ThinkingLevel 统一枚举 + 每个 Model 自带 `thinkingLevelMap` 翻译表**（比取 Provider 交集灵活，比暴露原生参数简洁）：

```
  off    minimal    low    medium    high    xhigh
  │        │         │       │        │        │
 不思考  1024 tk   2048 tk  8192 tk  16384 tk  模型最大值
```

上层只写 `reasoning: "high"`，由 Model 对象自带的翻译表映射成各家的具体参数；若请求级别不被某模型支持，`clampThinkingLevel()` 做回退——**先向上找，再向下找**。思考级别翻译发生在 `streamSimple()` 内部（查表 → clamp → 调整 maxTokens）。

## 【问题】
Pi 如何统一各家缓存控制？CacheRetention 三档语义与四家实现差异是什么？

## 【回答】
Pi 把缓存控制抽象成三个语义级别：`type CacheRetention = "none" | "short" | "long"`，**「语义统一，实现分散」**——上层只表达意图，具体打点方式由翻译器负责：

| Provider | `none` | `short` | `long` | 打点位置 |
|---|---|---|---|---|
| **Anthropic** | 不打标记 | `cache_control: { type: "ephemeral" }`（默认 5 分钟 TTL） | 加 `ttl: "1h"`（仅新模型） | system 末尾 + 最后一个 tool + 最后一条 user message（rolling） |
| **Bedrock** | 不插节点 | 插独立对象 `{ cachePoint: { type: DEFAULT } }` | 加 `ttl: ONE_HOUR` | system 块后面 + 最后一条消息后面 |
| **OpenAI Responses** | 不发 cache key | 发送 `prompt_cache_key: sessionId` | 加 `prompt_cache_retention: "24h"` | 按 session key 自动匹配前缀 |
| **OpenAI 兼容**（DeepSeek/Qwen） | 不打标记 | 按 Anthropic 风格打 `cache_control` | 加 `ttl: "1h"` | 复用 Anthropic 三处策略 |

三种协议设计哲学：**Anthropic 像「贴便签」**——在内容块上附加 `cache_control` 字段；**Bedrock 像「插路标」**——插入独立不含业务数据的 `cachePoint` 对象；**OpenAI 原生像「按会员卡号查记录」**——带 `prompt_cache_key`，后端自动识别前缀。

**经济价值：缓存命中的 token 按缓存读取价计费，通常为正常输入价的 1/10。200K token 对话历史缓存后能省约 90% 输入成本。**

## 【问题】
Pi 的错误处理为什么「编码到流里，不打断循环」？isContextOverflow 上下文溢出检测怎么做？

## 【回答】
**错误不抛出，而是编码到流中**——翻译器 catch 块把 `stopReason` 改成 `"error"` 或 `"aborted"`（`options?.signal?.aborted` 决定），再把错误消息塞进输出对象，push `{ type: "error" }` 事件。这是 `stopReason: "error"` 和 `"aborted"` 的真正注入点（呼应第3章「永不抛出」）：

```typescript
try {
  // 正常流程
  stream.push({ type: "done", reason: output.stopReason, message: output });
} catch (error) {
  // 错误不抛出，而是编码到流中
  output.stopReason = options?.signal?.aborted ? "aborted" : "error";
  output.errorMessage = error.message;
  stream.push({ type: "error", reason: output.stopReason, error: output });
}
```

**上下文溢出检测**：`isContextOverflow()` 做**三重检测**（错误消息模式匹配、token 数对比、输出为零 + length 停止），统一捕获不同 Provider 各自的溢出表现（源码：`packages/ai/src/utils/overflow.ts:126-155`）。

## 【问题】
Pi 为什么没有设计 BaseProvider 抽象类，而是选择「协议 > 实现」？模型调用层的三大设计精华是什么？

## 【回答】
Pi **没有设计 `BaseProvider` 抽象类**，而是定义了一套**事件协议（12 种事件）+ 函数签名（`StreamFunction`）**。原因：**翻译器之间几乎没有共同点，协议只约定「输入什么、输出什么」，不管中间怎么处理**。

模型调用层的三大设计精华：

1. **协议 > 实现**：不抽象共同行为（翻译器们几乎没有共同点），只约定输入输出契约——`StreamFunction` 签名（输入 model/context/options，输出 `AssistantMessageEventStream`）+ 12 种统一事件，中间实现完全自由。
2. **统一枚举 + 映射表**：`ThinkingLevel` 是统一枚举，每个 Model 自带 `thinkingLevelMap` 翻译表。**比取 Provider 交集灵活，比暴露原生参数简洁**。
3. **语义统一，实现分散**：`cacheRetention`（none/short/long）是语义接口——上层只说「我要长期缓存」，底层自行决定打标记（`cache_control`）还是插节点（`cachePoint`）。

## 【问题】
Pi 如何处理不同供应商的流式传输差异？SSE 解析的两种链路分别怎么实现？

## 【回答】
各家流式返回机制不同，Pi 的策略是**「有 SDK 就用，没 SDK 就自己解析」**，但最终都翻译成统一 12 种事件：

| Provider | 流式链路 | 处理方式 |
|---|---|---|
| **OpenAI** | 结构化 chunk 流 | SDK 直接返回 `choices[0].delta`，拿来就能用 |
| **Google** | SDK 封装 | 有 SDK 就用 |
| **Anthropic** | 原始 SSE 文本流 | 需自行**逐行读取 `event:` / `data:` 字段并做 JSON 解析（含容错）** |

Anthropic 自解析链路对应翻译器 `packages/ai/src/api/anthropic-messages.ts`：第 4 步把私有 SSE 事件映射成 12 种统一事件（`content_block_start (type: "text")` → `text_start`、`content_block_delta (text_delta)` → `text_delta` 等）；OpenAI 链路对应 `packages/ai/src/api/openai-completions.ts`。两条链路输出同一套事件流，Agent Loop 感知不到 Provider 差异。

## 【衍生问题】
- Pi 模型调用层与第3章 Agent Loop 的衔接：`streamSimple` 返回的 12 种事件如何驱动 `hasMoreToolCalls` 与循环退出？（可参照 `Agent_Pi Agent Loop` 条目，待补充完整问答）
- 工具系统：模型返回 `ToolCall` 后谁来执行？如何保证参数正确和安全？（已沉淀于 `Agent_Pi 工具系统` 条目，五步管道 + 三层类型 + 错误即消息）

## 【源码索引】
| 位置 | 作用 |
|---|---|
| `packages/ai/src/compat.ts:237-247` | `stream()` 入口（第一层·底层） |
| `packages/ai/src/compat.ts:258-268` | `streamSimple()` 入口（第一层·便捷封装） |
| `packages/ai/src/compat.ts:172-206` | Provider 注册（"通讯录"） |
| `packages/ai/src/types.ts:304-308` | `StreamFunction` 签名（"宪法"） |
| `packages/ai/src/types.ts:453-465` | 12 种 `AssistantMessageEvent`（第二层·事件协议） |
| `packages/ai/src/api/anthropic-messages.ts` | Anthropic 翻译器（第三层·5 步骨架） |
| `packages/ai/src/api/openai-completions.ts` | OpenAI 翻译器 |
| `packages/ai/src/types.ts:74-76` | `ThinkingLevel` / `ThinkingLevelMap` |
| `packages/ai/src/models.ts:410-429` | `clampThinkingLevel` 回退策略 |
| `packages/ai/src/utils/overflow.ts:126-155` | `isContextOverflow` 三重检测 |

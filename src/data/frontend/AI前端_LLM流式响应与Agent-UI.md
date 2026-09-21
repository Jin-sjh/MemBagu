---
category: AI前端
topic: LLM流式响应与Agent-UI
type: bagu
tags: [AI前端, LLM, 流式响应, SSE, Agent-UI, 状态机]
difficulty: hard
created: 2026-09-21
---
# LLM流式响应与Agent-UI

## 【问题】
LLM 流式场景下，SSE 与 WebSocket 如何选型？

## 【回答】
**LLM 单向输出通常 SSE 或 fetch streaming 就足够**，实现简单、基于 HTTP、天然适配文本流。

**需要高频双向控制、协同工具状态、客户端持续上行和复杂多路事件时，才评估 WebSocket**。WebSocket 适合复杂双向实时通信，但连接管理与重连成本更高。

一句话：**SSE 适合单向文本流，WebSocket 适合复杂双向实时通信**。选型的判断依据是通信方向（单向输出 vs 持续上行）和事件复杂度，而不是「流式就一定要用 WebSocket」。

---

## 【问题】
如何用 fetch + ReadableStream 读取流式响应？

## 【回答】
服务端连续产生增量事件，前端用 `fetch` 拿到 `response.body`（一个 `ReadableStream`），通过 `getReader()` 逐 chunk 读取，并用 `TextDecoder` 做 UTF-8 增量解码。

```js
const res = await fetch('/chat', { method: 'POST', body });
const reader = res.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const text = decoder.decode(value, { stream: true });
  // 累积到 buffer，再做增量解析
}
```

关键是把 chunk 累积到 buffer 中，而不是直接对单个 chunk 做 `JSON.parse`，因为网络分片可能截断内容。

---

## 【问题】
网络分片导致 UTF-8 半个字符或 JSON 被截断（粘包）如何处理？

## 【回答】
**网络 chunk 可能截断 UTF-8 字符或 JSON，必须保留 buffer，不能每次 chunk 直接 `JSON.parse`**。

做法：用 `TextDecoder` 的 `stream: true` 模式让解码器自身缓冲不完整的多字节字符；同时把所有文本累积到一个应用层 buffer，按协议边界（如按行、按 SSE 的 `data:` 事件、按 JSON 的起止）切分后再解析。只有当 buffer 中存在完整的一条事件/JSON 时再解析，剩余的半条继续累积，等待下一个 chunk 补齐。

---

## 【问题】
Markdown 增量渲染与未闭合代码块如何处理？

## 【回答】
**Markdown 逐 token 完整重解析会产生 CPU 和渲染压力**，每收到一个 token 就从头解析整篇文档显然不可取。

优化方式：**按帧批处理、增量缓存**，用 `requestAnimationFrame` 或时间窗口把多次更新合并为一次渲染；也可以在流未结束时做轻量增量渲染，**在完成后做完整解析**以修正未闭合代码块、未闭合表格等不完整结构（这是「完成后完整解析」作为降级/修正手段的作用）。目标是降低主线程耗时与渲染批次，而不是每个 token 都全量重排。

---

## 【问题】
消息状态机与重连/幂等如何处理？

## 【回答】
流式 UI 需要一个明确的**状态机**：`queued / running / tool_call / awaiting_input / done / error / cancelled`。先处理 UTF-8 和半 JSON，再校验会话/顺序，最后批量更新渲染。

**重连需要事件 id、幂等和服务端补发语义**，不能只重新发起请求导致重复内容——否则会重复生成。Abort 只表示客户端停止读取，**后端是否停止模型推理要依赖断开检测和显式取消协议**，二者需协同。

---

## 【问题】
Agent UI 的工具调用可视化与中断（Human-in-the-loop）如何处理？

## 【回答】
**Human-in-the-loop 要把等待用户确认建模为显式状态**（如 `awaiting_input`），展示工具调用、权限、输入要求和失败恢复，而不是只显示「思考中」。

UI 应可视化工具调用的执行过程（调用了什么工具、参数、结果、是否成功），并在需要用户授权或补充输入时进入显式等待状态；失败时给出恢复路径。中断生成则需要客户端 Abort、服务端取消与模型任务终止三者协同，而不是仅靠前端停止读取。

---

## 【问题】
Streaming 前端的性能优化与常见误区有哪些？

## 【回答】
**性能优化**：用 `rAF`/时间窗口批量更新 UI，避免每 chunk 全量重解析；增量缓存 Markdown；用 requestId/sessionId 隔离多会话。

**常见误区**：
- 认为 `Abort` 就等于后端停止推理——其实只停止了客户端读取。
- 每次 chunk 直接 `JSON.parse`——会因子串截断报错。
- 忽略多会话竞态——旧请求迟到会写入新会话状态，应丢弃迟到请求。

验证指标包括**首 token 延迟、完成延迟、渲染批次、主线程耗时、丢失/重复事件率**；需测试半字符、半 JSON、乱序、重复、断线、重连、取消、慢消费者、多会话并发和 tool call 确认。

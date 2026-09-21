---
category: Agent
topic: Token 预算分配与截断策略
type: bagu
tags: [Agent, Memory, Token 预算, 上下文]
difficulty: medium
created: 2026-09-15
---

# Token 预算分配与截断策略

## 【问题】
怎么做 Token 预算分配才不容易翻车？

## 【回答】
建议优先级顺序：**system 指令 > 安全/策略 > 工具定义（若必须）> 高优先级记忆（用户偏好/任务状态）> 近期对话 > 其他**，并预留 **10%～20%** 给模型输出与格式冗余。

要点：

- 精确计数用分词器（如 tiktoken）；
- 对长工具返回要压缩、引用 ID、存外部而非全文塞入；
- 工具 schema 特别长时：工具分层（核心工具常驻 + 动态加载）、摘要版 schema、或工具路由先选子集再展开。

过长上下文还会带来「中间遗忘现象」（模型对长上下文中间部分关注变弱），因此超限处理用截断、摘要、检索增强三者配合。

## 【问题】
Claude Code 源码里上下文压缩与 Token 预算具体是怎么落地的？和通用的截断策略有什么不同？

## 【回答】
Claude Code 把"压缩/折叠"作为**构建期可裁剪策略**内置进主循环：

- **Token 预算**：`src/query/tokenBudget.ts` 与 `src/services/compact/` 与上下文长度控制强相关，工作记忆由"当前会话消息列表 + token 预算"共同约束。
- **压缩策略**：自动 compact、微压缩边界消息（见 `query.ts` 消息构造与 `services/compact/`）。
- **按构建裁剪不同压缩**：`query.ts` 头部通过 `feature('REACTIVE_COMPACT')`、`feature('CONTEXT_COLLAPSE')` 等开关，选择不同的压缩/折叠实现；`src/query/` 子目录（`deps.ts`、`config.ts`、`stopHooks.ts`）还把"query 横切配置"与"query 主循环"分离。

和通用截断策略的不同：通用做法是**超限就截/摘要/检索**三选一；Claude Code 更进一步把压缩策略本身做成**可开关、可组合**的源码级能力，且把复杂逻辑下沉到 `services/compact` 而非堆在主循环里。

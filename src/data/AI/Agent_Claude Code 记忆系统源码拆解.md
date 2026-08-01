---
category: Agent
topic: Claude Code 记忆系统源码拆解
type: bagu
tags: [Agent Memory, Claude Code, 系统提示构建, CLAUDE.md, Token Budget, Prompt Caching, 上下文工程]
difficulty: medium
created: 2026-07-29
---

# Claude Code 记忆系统源码拆解

## 【问题】
Claude Code 的记忆系统整体设计思路是什么？它如何用文件系统、Token 预算和分层提示来组织"记忆"？

## 【回答】
文章把 Claude Code 的记忆系统设计归纳为三条核心思路：

- **用文件系统路径编码相关性**：相关性不靠向量相似度计算，而是靠文件路径（`findGitRoot` 定位仓库根，分层加载全局/项目/目录三级 `CLAUDE.md`）。
- **用 Token 预算驱动行为调节**：`TokenBudgetManager` 不直接截断上下文，而是把用量翻译成自然语言指令（如 "Avoid reading large files"），让 Agent 主动调整行为。
- **用分层提示构建实现缓存优化**：系统提示拆成固定层（身份、通用规则）与条件层（Git Status 等），固定层放最前以命中 Anthropic API 的 Prompt Caching，命中后仅需付约 **10%** 输入费用。

一句话：**路径即相关性、预算即指令、顺序即成本**。

## 【问题】
为什么系统提示要做「固定层在前、条件层在后」的分层？这和 Prompt Caching 有什么关系？

## 【回答】
Anthropic API 的 **Prompt Caching** 按前缀缓存：相同前缀只需第一次付全价，后续命中缓存的请求**只需付约 10% 的输入费用**。因此把**固定不变的内容（身份、通用规则）放在系统提示最前面**，把**随任务变动的内容（Git Status、当前工具结果）放在后面**，就能让前面的固定前缀稳定命中缓存、降低每次调用的成本。

关键设计：**`parts.push()` 的顺序有意义**——顺序即成本。固定层在前、变动层在后，是保证缓存命中率的前提。

## 【问题】
CLAUDE.md 是如何分层加载的？findGitRoot() 的作用是什么？多个 CLAUDE.md 冲突时谁优先？

## 【回答】
加载分三级，相关性完全由**文件路径**决定（零向量库、零相似度计算）：

- **global**（全局用户级）
- **project**（仓库根，由 `findGitRoot()` 定位项目作用域边界）
- **directory**（当前工作目录，越靠近执行目录优先级越高）

`findGitRoot()` 决定了 CLAUDE.md 的**作用域边界**：从当前目录向上找 `.git`，从而知道项目范围、能加载哪些项目级规则。

冲突裁决遵循：**越靠近目录优先级越高**（`directory > project > global`），用于覆盖/解决不同层级规则的冲突。

## 【问题】
什么是 Token 预算感知（TokenBudgetManager）？为什么它不直接截断上下文？

## 【回答】
Token 预算管理的核心哲学是：**约束不是直接截断，而是变成指令**。`BudgetManager` 不直接砍掉上下文，而是通过 `formatForInjection()` 把系统状态（Token 用量、限流、内存等）翻译成模型能读懂的**自然语言指令**，让 Agent 自己调整行为。

例如设定三级阈值：
- **70%** → "Consider finishing current tasks before starting new ones."
- **85%** → 更严格的约束要求。

这背后的技巧叫**"自然语言即 API"**：把工程状态翻译成模型能理解的指令，是可推广的上下文工程方法——不直接删内容，而是让模型知道"现在很挤，别读大文件、先把任务收尾"。

## 【问题】
简易的 Token 估算怎么做？中英文有什么区别？

## 【回答】
不需要精确，只需要**方向性**计数。文章给出的估算规则：

- **英文**：约 **4 字符 / token**
- **中文（CJK）**：约 **1.5 字符 / token**

实现上区分 CJK 字符单独计数，接口形如 `count(text: string): number`。目的是给出预算预警的**方向**，而非精确账单。

## 【问题】
Claude Code 自带的情景记忆（episodic memory）是怎么做的？文章说它"不做的事"是什么？

## 【回答】
文章指出一个关键取舍：**Claude Code 本身不做情景记忆压缩**——它依赖上下文窗口承载近期对话，不主动把旧消息压缩为长期摘要。这是它面向"局部连续性强"的编程任务的设计选择。

但文章给出自建扩展方向：用轻量 LLM（如 `claude-haiku-4-5`）把旧消息压缩为摘要，消息裁剪策略是**从最新往旧丢弃**（保留近期、压缩/丢弃远期），在对话轮次触发时调用 LLM 生成 `MemoryStore` 摘要。

## 【问题】
文章提到的三个记忆系统扩展方向是什么？

## 【回答】
在核心拆解之上，文章给出三条可扩展路线：

- **扩展一：用 LLM 做记忆压缩**（`compactWithLLM`）：把旧消息摘要化，减少上下文占用。
- **扩展二：给记忆加重要性评分**（`assessImportance`）：为每条消息打重要性分，优先保留高价值记忆。
- **扩展三：接入向量存储做语义检索**（`SemanticMemoryStore`）：用语义检索替代纯路径匹配，支持跨目录的相关性回忆。

## 【代码】
文章手写的核心模块（节选，示意性）：

```typescript
// TokenCounter：英文 4 字符/token，中文 1.5 字符/token
class TokenCounter {
  count(text: string): number { /* 区分 CJK 字符 */ }
}

// BudgetManager：阈值到自然语言指令
class BudgetManager {
  // 70% → "Consider finishing current tasks before starting new ones."
  // 85% → 更严格约束
}

// PromptBuilder：固定层在前 + XML 标签包裹 + Skills 只注入索引 + 预算注入最后
build(config: SystemPromptConfig): string { /* parts.push 顺序即成本 */ }

// MemoryStore：LLM 压缩触发（对话轮次 → 摘要）
class MemoryStore { /* 从最新消息保留，往旧丢弃 */ }
```

## 【衍生问题】
- Claude Code 的 Skills 懒加载机制具体如何实现？（文章只提"只注入索引"，细节待补充）
- 真实 Claude Code 源码里 TokenBudgetManager 的精确阈值与回退逻辑？（待补充）
- 与 Mem0 / Zep / Letta 等记忆框架相比，Claude Code 文件指针方案的边界与局限？（可参考 `Agent Memory 为什么难`）

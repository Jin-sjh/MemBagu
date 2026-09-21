---
category: Agent
topic: 架构模式总结
type: bagu
tags: [Agent, 架构模式, 分层, 契约优先, 扩展点, 企业级落地]
difficulty: medium
created: 2026-09-15
---

# 架构模式总结

## 【问题】
从 Claude Code 等工业级 Agent 源码可以提炼出哪些通用架构模式？

## 【回答】
至少三条可迁移的通用模式：

- **分层**：接入（CLI/API）→ 编排（Query/Coordinator）→ 工具与外部系统 → 持久化与观测。Claude Code 的映射是 `main/cli` → `query.ts`/`query/` crate → `tools/` → `services/` + DB/文件。
- **契约优先**：工具入参 schema、权限结果、消息类型在类型系统中集中定义（TS 在 `types/`，Rust 在 `spec/12_constants_types.md`），降低"写代码时发现模块切错"的返工。
- **扩展点显式化**：用 Feature Flag、Hook、Plugin / MCP 暴露扩展点，避免无限 `if-else`；新客户端 / 新工具提供方只需实现协议，不 fork 核心循环。

## 【问题】
工业级 Agent 在工具系统、记忆管理、错误处理上分别有哪些可复用模式？

## 【回答】
- **工具系统设计**：统一基类 + 按工具分包（`Tool.ts` + `tools/<Name>Tool/`）；**权限外置**（`CanUseToolFn`、审批 UI 与执行解耦）；横向能力复用（如 Bash 的路径/只读/沙箱校验拆成多个模块文件，而非堆在单一 `execute()`）。
- **记忆管理**：工作记忆 = 当前会话消息列表 + token 预算（`tokenBudget.ts`、`compact`）；长期记忆 = `SessionMemory`、团队记忆同步；压缩策略 = 自动 compact、微压缩边界消息。
- **错误处理**：API 层用 `FallbackTriggeredError`、`withRetry`；用户可见日志与调试日志（`logError`、`logForDebugging`）分流；可恢复错误走重试、降级模型、跳过非关键工具（需定义 SLA）。
- **可扩展性**：Bridge（新客户端只实现协议）、MCP（新工具提供方独立进程降低核心崩溃面）、命令插件化（`commands.ts` 聚合注册 + Feature Flag 控制可选命令集）。

## 【问题】
自研 Agent 时，从这批工业级项目能借鉴哪些具体架构决策？企业级落地又有哪些通用挑战？

## 【回答】
可借鉴的架构决策：

- **先写"架构地图"再写模块**：用唯一索引导航（如 `claude-code-rust/spec/INDEX.md`），避免新人从任意文件切入造成误解。
- **Query 与 Tool 边界写死**：工具只做单职责动作，多步编排/重试/合并上下文放在 Query/Coordinator。
- **权限与审计一等公民**：不仅"能不能调 API"，还要记录"谁在何时批准了什么"。
- **可观测性前置**：Analytics、日志、TraceId 缺一不可，企业交付常因缺观测被拒收。
- **多语言并存时维护 parity 对照表**（如 `parity_audit.py`），避免语义漂移。

企业级落地的通用挑战与解法：规则与模型冲突 → **规则引擎优先**、模型输出仅作候选必经校验；多系统异构 → 统一 BFF/API 网关 + 工具层抽象（类似 MCP）；合规审计 → 全链路日志 + 敏感字段脱敏 + 操作可归因；峰值稳定 → 异步任务/队列 + 降级为"仅查询不下单"；体验一致 → 同一套意图 taxonomy 驱动前端引导与后端路由。

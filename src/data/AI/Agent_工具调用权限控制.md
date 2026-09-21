---
category: Agent
topic: 工具调用权限控制
type: bagu
tags: [Agent, Function Calling, 权限控制, 安全]
difficulty: medium
created: 2026-09-15
---

# 工具调用权限控制

## 【问题】
怎么做工具调用的权限控制？

## 【回答】
模型本身没有用户身份，必须在服务端把**当前会话用户**与角色/权限绑定，执行工具前检查：是否可读该表、是否可操作该租户。规则：

- 禁止把服务账号密钥交给模型侧推理环境；
- 用**用户 OAuth token 或后端代持且按最小权限**；
- 防 Prompt 注入诱导工具执行越权参数；
- 防 SQL 注入、路径穿越（`../../etc/passwd`），对所有进入工具的字符串做白名单、参数化查询、chroot/沙箱；
- 敏感操作 HITL，不把长期密钥暴露给模型上下文。

## 【问题】
Claude Code 的权限回调（CanUseToolFn / useCanUseTool）和 Feature Flag 是怎么配合实现「先策略、再执行」与多产品形态的？

## 【回答】
Claude Code 把"能不能执行"和"执行什么"彻底分开，靠两套机制协作：

- **权限回调**：工具执行路径与 `CanUseToolFn`、`hooks/useCanUseTool` 强绑定，形成「**先策略、再执行**」的工业级顺序——模型产出 `tool_use` 后，先经权限回调裁决，通过才真正执行，而非边执行边校验。
- **Feature Flag 构建期裁剪**：大量使用 `import { feature } from 'bun:bundle'`（如 `commands.ts`、`query.ts`、`services/analytics/metadata.ts`），在编译/构建期开关不同能力，让**同一套源码树支撑多产品形态**（内部版、桥接版、语音版等）。
- **最小暴露面**：如 `BRIDGE_MODE` 为真才 `require('./commands/bridge/index.js')`，不相关代码不进构建、不暴露攻击面。

核心结论：工业级 CLI 不是"一个 `if` 打天下"，而是**权限模型 + 功能开关 + 最小暴露面 三者一致**。

---
category: Agent
topic: CICD与部署流程
type: bagu
tags: [Agent, CI/CD, 部署, 灰度, 回滚]
difficulty: medium
created: 2026-09-15
---

# CICD与部署流程

## 【问题】
Agent 系统频繁发版，CI/CD 和部署流程怎么设计才稳？

## 【回答】
CI 卡质量门禁 + CD 灰度可回滚（以下为该文档工程实践口径）：
- **CI 流水线**：lint+类型检查 → 单测 → 集成测 → AI 评估测（RAGAS 等，防回归）→ 安全扫描 → 构建镜像，全过才合主干，目标 < 15min。
- **CD 灰度**：K8s 金丝雀，10%→50%→100% 每阶段观察 30min（发布指标详见 Agent_金丝雀与蓝绿发布）。
- **回滚**：保留最近 5 个镜像，`kubectl rollout undo` 一键回滚，灰度异常自动回。
- **环境**：Dev→Staging→Prod，Helm Chart 管部署，ConfigMap/Secret 管配置。
- 要点：**AI 评估测试必须进 CI 防回归；发版靠灰度+快速回滚而非"一次发对"**。

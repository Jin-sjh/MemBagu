---
category: Agent
topic: 部署扩缩容与HPA
type: bagu
tags: [Agent, 工程化, 部署, K8s, HPA, 并发]
difficulty: medium
created: 2026-09-15
---

# 部署扩缩容与HPA

## 【问题】
K8s 部署 Agent 服务时，HPA 可以按什么指标扩容？

## 【回答】
- **CPU / 内存**；
- **自定义指标**：请求队列长度、P95 延迟、429 比例（需 Prometheus Adapter）；
- 注意**冷启动**与 **LLM 长尾延迟**。

配套实践：Deployment 副本数 + 滚动更新、Service / Ingress 暴露与 TLS、ConfigMap / Secret 配置与密钥分离、CI 漏洞扫描、CD 灰度 + 自动回滚（健康检查失败）。模型/Prompt/工具清单版本一并记录到 Trace，不可变发布（如 `v20260401` 标签）。

## 【问题】
异步一定能提高 Agent 吞吐吗？

## 【回答】
对 **I/O 密集**（HTTP、DB）通常能；若受 **GPU 或单线程推理**限制，需配合**批处理、多副本、队列**；还要防止**无界并发**压垮下游。用 asyncio 或消息队列让 I/O 等待不阻塞线程，多工具无依赖时可并行。

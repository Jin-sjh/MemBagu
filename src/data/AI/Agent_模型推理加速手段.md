---
category: Agent
topic: 模型推理加速手段
type: bagu
tags: [Agent, 推理加速, 量化, 批处理, ONNX]
difficulty: medium
created: 2026-09-15
---

# 模型推理加速手段

## 【问题】
本地部署的 embedding / reranker 等小模型推理慢，有哪些通用的推理加速手段？

## 【回答】
本地小模型推理加速的通用手段（以下为该文档工程实践口径）：
- **量化**：如 BGE-M3 用 INT8 量化，**精度损失 < 0.5%、推理提速约 40%**。
- **推理引擎**：ONNX Runtime 替代原生 PyTorch（约 +30%），启用 CUDA / TensorRT。
- **批处理**：embedding batch（如 64）、reranker 一次性对 40 个候选打分；用**动态批处理把短时间窗口请求合并**。
- **模型预加载**：启动即载入 GPU 显存，避免首请求冷启动。
- 效果口径：**embedding 单条 15ms → 批量 1000 条约 3s（均摊 3ms/条）；GPU 利用率 30%→75%**。要点：**本地小模型优先吃满批与量化，云端大模型靠路由与缓存**。

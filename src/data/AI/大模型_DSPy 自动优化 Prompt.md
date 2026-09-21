---
category: 大模型
topic: DSPy 自动优化 Prompt
type: bagu
tags: [Prompt, DSPy, 自动优化]
difficulty: hard
created: 2026-09-15
---
# DSPy 自动优化 Prompt

## 【问题】
DSPy 优化 Prompt 的前提是什么？它把"写 Prompt"变成了什么？

## 【回答】
- **DSPy 把 Prompt 当作可优化参数**：定义 Signature（输入输出字段）+ Metric（度量）+ Teleprompter（优化器），在带标签数据上搜索更好的指令与 Few-shot 组合。
- **前提**：必须有**可自动执行的度量（metric）与验证集**，否则搜索无方向、易过拟合验证集。
- 适用：有标注集、需反复试指令的团队；上线前仍要在留出测试集验证泛化。本质 = "定义任务签名 + 度量 + 优化器"替代手搓 Prompt。

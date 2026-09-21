---
category: Agent
topic: 记忆系统怎么评测
type: bagu
tags: [Agent, Memory, 评测]
difficulty: medium
created: 2026-09-15
---

# 记忆系统怎么评测

## 【问题】
如何评测记忆系统好坏？

## 【回答】
- **离线**：召回率 / 精确率（给定标注 relevant memories）、摘要一致性、冲突率；
- **在线**：任务成功率、用户纠正次数、成本与延迟。

补充**人工抽检**与 bad case 归因（区分检索错 vs 摘要错 vs 写入错）。长期看「用户纠正次数」是核心体验指标——纠正越少，说明记忆越准、越省解释成本。

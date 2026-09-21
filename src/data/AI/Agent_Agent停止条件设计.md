---
category: Agent
topic: Agent停止条件设计
type: bagu
tags: [Agent, 停止条件, 最大步数, 死循环]
difficulty: medium
created: 2026-09-15
---
# Agent停止条件设计

## 【问题】

你会如何设计 Agent 的停止条件？

## 【回答】

要**组合多种信号**，且生产环境必须有硬上限防止死循环：

- 模型**声明 finish**（给出 Final Answer）；
- **任务清单全部完成**；
- 达到**步数 / 预算上限**（max_steps、token 预算）；
- **超时**；
- **连续无进展检测**（轨迹重复、无新信息）；
- 外部**成功信号**（如测试通过）。

对 ReAct 类循环，停止条件具体表现为：出现 Final Answer、达到步数上限、或检测到重复无效循环。

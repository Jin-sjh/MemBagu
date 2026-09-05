---
category: Skill
topic: 优化Skill描述
type: bagu
tags: [Skill, Agent, description, 渐进披露, 触发率]
difficulty: medium
created: 2026-08-19
---

# 优化 Skill 描述

## 【问题】
为什么 Agent Skill 的 description（描述）如此关键，甚至能决定触发的成败？

## 【回答】
因为 Agent 采用**渐进披露（progressive disclosure）**机制：启动时**只加载**每个 skill 的 `name` 和 `description`，据其判断相关性，**匹配时才读取完整的 `SKILL.md`**。

因此 `description` **背负着触发的全部重任**：
- 描述**不足** → 该触发时不触发（漏触发）；
- 描述**过宽** → 不该触发时误触发（误触发）。

还需注意一个前提：Agent 通常**只在任务需要超出自身基础能力的相关知识时**才咨询 skill（例如陌生 API、领域工作流、罕见格式）。简单任务（如「读这个 PDF」）即使描述匹配也可能不触发。

---

## 【问题】
撰写高质量的 skill description 应遵循哪些核心原则？

## 【回答】
四个原则：
1. **命令式措辞（Imperative phrasing）**：写「Use this skill when…」而非「This skill does…」，直接告诉代理何时行动。
2. **聚焦用户意图，而非实现细节**：描述用户想达成的目标，代理会用用户请求与描述匹配。
3. **偏「强势（pushy）」**：明确列出适用上下文，包括用户**未直接点名**领域的情形（例如「even if they don't explicitly mention 'CSV' or 'analysis'」）。
4. **保持简洁**：几句话到一小段为宜，规范硬性限制为 **1024 字符**以内。

---

## 【问题】
如何设计评估查询（eval queries）来测试 description 的触发效果？

## 【回答】
需准备约 **20 条**真实用户提示，标注 `should_trigger: true/false`（**各 8–10 条**），存入 `eval_queries.json`。

**应触发查询（正例）**要多维变化，最有价值的是「技能能帮上忙但查询本身不明显」的案例：
- **措辞**：正式 / 随意 / 错别字；
- **明确性**：直接点名领域 vs 描述需求但不提领域词；
- **细节**：简短 vs 带路径 / 列名等背景；
- **复杂度**：单步 vs 多步工作流。

**不应触发查询（负例）**重点用**近似但不同（hard negatives）**：
- **弱负例**（如「写斐波那契函数」）无测试价值；
- **强负例**：共享关键词但任务不同（如「更新 Excel 预算表公式」vs CSV 分析；「写 Python 脚本读 CSV 传 Postgres」是 ETL 而非分析）。

**真实感技巧**：加入文件路径（`~/Downloads/report_final_v2.xlsx`）、个人语境（「老板让我…」）、具体数据、口语化与拼写错误。

---

## 【问题】
如何实际测试 description 是否触发？为什么要多次运行？

## 【回答】
基本方法：将 skill 安装到 agent，逐条运行查询，观察 agent 是否加载 `SKILL.md`（借助客户端日志 / 工具调用记录）。

由于 agent 调用**具有非确定性**，每条查询应**跑 3 次**，计算**触发率 = 调用次数 / 总运行数**，通过阈值建议 **0.5**。若客户端支持，一旦明确 skill 是否被咨询即可**提前终止**运行以节省成本（注意：批量测试脚本会多次调用 agent 接口，存在 API 费用与时间消耗，需取得授权后再执行）。

---

## 【问题】
如何避免 description 优化过程中的过拟合？

## 【回答】
采用**训练 / 验证集拆分**：
- 将查询集拆为**训练集（约 60%）**用于改进描述；
- **验证集（约 40%）**仅用于检验泛化能力。
- 两组都需含正例与负例、随机打乱且**固定拆分**。

这样能防止针对训练集具体查询「背答案」式的过拟合，验证集才能反映真实泛化效果。

---

## 【问题】
优化 description 的迭代循环（Optimization Loop）具体怎么做？

## 【回答】
1. **评估**：在训练集与验证集上评当前描述；训练集引导修改，验证集看泛化。
2. **识别失败**（仅用训练集）：正例未触发 → 描述**太窄**；负例误触发 → 描述**太宽**。
3. **修订描述**：
   - 太窄 → 拓宽范围 / 增加适用情境；
   - 太宽 → 增加「不做什么」的特异性，澄清边界；
   - **避免**直接把失败查询的具体关键词塞进描述（过拟合），应提炼**通用类别**；
   - 几轮无进展时尝试**结构性不同写法**而非小修小补；
   - 时刻检查 **≤1024 字符**。
4. **重复**至训练集全过或无明显提升（通常 **5 轮**足够）。
5. **选最优**：以**验证集通过率**为准，可能早期迭代优于后期过拟合版本。

（可借助 `skill-creator` 技能端到端自动化此循环并生成 HTML 报告。）

---

## 【问题】
优化前后的 skill description 有什么具体差异？给出示例。

## 【回答】
优化要点：更具体地说明「做什么」（统计、衍生列、图表、清洗），更宽泛地说明「何时用」（CSV/TSV/Excel，即使用户不提关键词），并采用命令式措辞。

优化前：
```yaml
description: Process CSV files.
```

优化后：
```yaml
description: >
  Analyze CSV and tabular data files — compute summary statistics,
  add derived columns, generate charts, and clean messy data. Use this
  skill when the user has a CSV, TSV, or Excel file and wants to
  explore, transform, or visualize the data, even if they don't
  explicitly mention "CSV" or "analysis."
```

---

## 【问题】
写 description 时要特别注意模型的什么心理？为什么「技能写好了却没被触发」很常见？

## 【回答】
要特别注意大模型的「**偷懒心理**」：它天生偏向「少用甚至不用技能」，专业叫法是「**工具调用惰性**」。

因此写 description 的核心原则为「**精简、精准，不冗余**」，并且可以使用**反向触发词避免技能「抢活儿」**（误触发到别人的场景）。

更关键的是：**技能写得再好，智能体没在正确时机选中它，一切白搭**，所以 **description 要反复测试**——触发不准是技能本身的固有局限之一，只能靠持续测 description 来收敛。（来源：《图解Skill：AI提效实战指南》宝玉，2.4 节）

---
category: Skill
topic: 技能上下文与引用规范
type: bagu
tags: [Skill, 上下文工程, 按需加载, 引用路径, 词元预算]
difficulty: easy
created: 2026-09-05
source: 《图解Skill：AI提效实战指南》宝玉（2.3）
---

# 技能上下文与引用规范

## 【问题】
技能里引用关联文件（references/、scripts/）有什么规范？

## 【回答】
- 使用**从技能根目录出发的相对路径**（如 `references/reference.md`、`scripts/extract.py`）；
- 并且**只引用一层**，不要出现 A 引用 B、B 又引用 C 的嵌套链——**层级越深，智能体越容易迷路，阅读开销也越不可控**。

一句话：**引用路径要浅，不要嵌套。**

## 【问题】
SKILL.md 的正文长度有什么明确建议？

## 【回答】
官方明确建议：将 SKILL.md 的正文长度控制在 **5000 个词元**以内（换算成中文，大约不超过 **3800 字**），行数不超过 **500 行**。

超出部分应拆到 `references/` 等目录按需加载，而不是全量塞进主文件。

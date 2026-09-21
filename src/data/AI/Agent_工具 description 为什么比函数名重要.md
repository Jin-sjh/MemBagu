---
category: Agent
topic: 工具 description 为什么比函数名重要
type: bagu
tags: [Agent, Function Calling, Tool Description]
difficulty: medium
created: 2026-09-15
---

# 工具 description 为什么比函数名重要

## 【问题】
为什么工具 description 比函数名更重要？

## 【回答】
模型主要依据**自然语言描述来区分相似工具**；函数名更多是给程序路由用的。description 应写清：功能一句话、**何时用、何时不要用**、参数含义与格式、返回值语义（若影响后续推理）。两个工具重叠时要加「优先用 A 当…，否则 B」。

## 【问题】
LangChain Tool 的 docstring 为什么要写「何时不要用」？

## 【回答】
目的是减少**误触发（false positive）**，尤其在工具功能重叠时——这是线上质量关键。描述太长时分层：核心描述保持短，细节放 `parameter.description`，超大工具集用路由先筛选候选。

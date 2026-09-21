---
category: 大模型
topic: 多语言混合 Prompt
type: bagu
tags: [Prompt, 多语言]
difficulty: medium
created: 2026-09-15
---
# 多语言混合 Prompt

## 【问题】
多语言混合 Prompt 要注意什么？

## 【回答】
- **明确默认输出语言**：避免模型在语种间漂移；指令与示例语种一致。
- **示例与指令语言对齐**：Few-shot 的示例输出风格（尤其 JSON 键名 / 大小写）要与生产一致。
- **专有名词表可固定**：人名、产品名、术语用统一写法，减少歧义与幻觉。

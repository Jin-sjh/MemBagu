---
category: Agent
topic: 计算器为什么不能用 eval
type: bagu
tags: [Agent, Function Calling, 计算器, 安全]
difficulty: medium
created: 2026-09-15
---

# 计算器为什么不能用 eval

## 【问题】
计算器工具为什么禁止用 eval？

## 【回答】
`eval` 可执行任意 Python 代码，等同于**远程代码执行（RCE）**，攻击者可用它做任何事。应使用 **AST 白名单解析**或 `numexpr` 等安全数学库：只允许 `+ - * / **` 等有限算子，遇到不支持的表达式抛错，绝不执行任意字符串。

示例中用 `ast` 模块遍历表达式树，仅放行白名单算子（`ast.Add / Sub / Mult / Div / Pow / USub`），其余一律 `raise ValueError("unsupported expression")`。

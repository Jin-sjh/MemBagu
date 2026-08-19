---
category: Skill
topic: 解析 SKILL.md 文件
type: bagu
tags: [Skill, Agent Skills, SKILL.md, YAML, frontmatter, 渐进式披露, 技能发现]
difficulty: medium
created: 2026-08-19
---

# 解析 SKILL.md 文件

> 来源：[Agent Skills：How to add skills support to your agent](https://agentskills.io/client-implementation/adding-skills-support#step-2-parse-skill-md-files) 的“Step 2: Parse SKILL.md files”。

## 【问题】
如何解析一个 SKILL.md 文件？

## 【回答】
`SKILL.md` 由两部分组成：由 `---` 分隔符包裹的 YAML frontmatter，以及结束分隔符之后的 Markdown 正文。解析时应按以下顺序处理：

1. 要求文件开头存在开启的 `---`，并查找其后的结束 `---`。
2. 解析两个分隔符之间的 YAML 区块，提取必需的 `name`、`description`，同时保留可选字段。
3. 将结束 `---` 之后的全部内容去除首尾空白，作为技能的 `body`。

解析出的 `name` 和 `description` 用于构建技能目录，技能激活时再加载 `body`。

## 【问题】
解析 SKILL.md 的 YAML frontmatter 时，如何处理格式不规范的 YAML？

## 【回答】
其他客户端产生的 `SKILL.md` 可能包含技术上无效、但原客户端恰好能够接受的 YAML。常见问题是未加引号的值中包含冒号：

```yaml
# Technically invalid YAML — the colon breaks parsing
description: Use this skill when: the user asks about PDFs
```

解析器可以增加低成本的回退机制：解析失败后，将这类值包裹在引号中，或转换为 YAML block scalar 后重试。这样能提升不同客户端之间的兼容性。

## 【问题】
解析 SKILL.md 时应该采用严格验证还是宽松验证？

## 【回答】
建议采用**宽松验证**：发现问题时记录诊断并发出警告，只要仍然可以安全解析，就继续加载技能；只有影响技能披露或无法理解文件的错误才跳过。

- `name` 与父目录名不匹配：警告，但仍加载。
- `name` 超过 64 个字符：警告，但仍加载。
- `description` 缺失或为空：跳过技能并记录错误，因为 description 是技能披露和触发判断的必要信息。
- YAML 完全无法解析：跳过技能并记录错误。

诊断信息应能够通过调试命令、日志文件或 UI 暴露。不要因为仅属于外观或非关键约束的问题阻止技能加载。

## 【问题】
技能发现阶段至少要保存哪些字段？body 应该何时读取？

## 【回答】
每条技能记录至少保存三个字段：

```text
SkillRecord {
  name: string
  description: string
  location: absolute path to SKILL.md
}
```

应建立以 `name` 为键的内存映射，例如 `skillsByName: Map<name, SkillRecord>`，以便激活时快速查找。`location` 必须是 `SKILL.md` 的**绝对路径**。

`body` 有两种读取策略：在发现阶段直接保存 body，可以提升激活速度；在激活阶段再从 `location` 读取 body，可以降低总体内存占用，并能获取两次激活之间发生的文件变更。两者按客户端的性能和热更新需求取舍。

## 【问题】
为什么要保留 SKILL.md 的绝对路径，并如何确定 Skill 的基础目录？

## 【回答】
`location` 不只是用于读取文件，还为后续处理提供路径上下文。Skill 的 **base directory** 就是 `location` 的父目录，可在需要时由绝对路径推导出来，用于：

- 解析 `SKILL.md` 中引用的相对路径；
- 枚举技能附带的脚本、参考资料和其他资源。

因此，技能记录至少应保存 `name`、`description` 和绝对 `location`，而不是只保存文件名或相对路径。

## 【考察点】

- `SKILL.md` 的 frontmatter 与 Markdown body 如何分界和提取。
- `name`、`description`、`location` 三个最小技能元数据字段的职责。
- 为什么 `description` 缺失时必须跳过，而名称不规范时只警告。
- 如何通过 YAML 回退解析提升跨客户端兼容性。
- 发现阶段保存 body 与激活阶段读取 body 的性能、内存和热更新权衡。
- 为什么需要通过 `location` 推导 Skill 的 base directory。

## 【衍生问题】

- `SKILL.md` frontmatter 的完整字段约束和 `name` 字符集规则是什么？（待补充）
- 多个 Skill 使用相同 `name` 时，内存映射应如何处理冲突？（待补充）

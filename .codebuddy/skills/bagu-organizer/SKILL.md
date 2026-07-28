---
name: bagu-organizer
description: This skill should be used when the user has discussed a 八股 (technical interview or coding-knowledge) question in chat and wants it organized into the MemBagu project's required Markdown format and saved to the correct category location under src/data. Trigger when the user says things like 整理一下我们刚讨论的八股, 把这个八股存到项目里, 把讨论的问题保存成条目, 把刚才聊的整理进 MemBagu, or otherwise references persisting a 八股 discussion. The skill mines the ongoing conversation or pasted text, classifies the topic into the right library and category, deduplicates and merges with existing entries, formats frontmatter plus 问题/回答 blocks, and writes the file to remove the manual sorting burden.
---

# Bagu Organizer

## Overview

把「在聊天里讨论过的八股问题」一键整理成 MemBagu 项目要求的 Markdown 条目，并落盘到
`src/data/<library>/<category>_<topic>.md` 的对应位置。核心目标是消除人工判断分类、手敲 frontmatter、
手动搬运问答的重复劳动。详细格式规范见 `references/format-spec.md`；分类与去重时先用
`scripts/scan_entries.py` 查看已有条目。

## When to Use

- 用户刚在对话中讨论了一个或多个八股问题，希望保存进项目知识库。
- 用户贴入一段八股讨论/笔记，希望按项目规范归类存档。
- 用户明确说「整理」「保存」「存一下」「归档」与八股相关的内容。

不要用于：从图片/外部资料批量抽取八股（那是 `八股提取器` agent 的职责）；单纯的问答不保存；
与 MemBagu 格式无关的其他文档写作。

## Workflow

严格按顺序执行，遇到需要用户拍板的分支再停下确认。

### Step 1 — 收集讨论内容

- 优先从**当前对话上下文**中提取刚才讨论的八股问答（模型已拥有上下文）。
- 若用户额外粘贴了文本，以粘贴文本为准。
- 若不清楚「要保存哪一段」或讨论含多个无关主题，用一句话向用户确认范围（例如：
  「刚聊了闭包和 event loop 两块，是要都存，还是只存闭包？」），不要一次存错一堆。

### Step 2 — 抽取并合并问答

- 把讨论整理成若干条干净的「问题 → 回答」对。保留讨论中沉淀出的关键结论、代码示例、对比要点。
- 将同一概念的不同问法（如「什么是闭包？」「闭包是什么？」）**合并为一条更完整的问答**，
  不要逐字重复堆叠（参考 `JavaScript_闭包.md` 的问题冗余反面案例）。
- 识别每条问答的隐含元数据：涉及的技术方向、标签、难度、是否算法题（有无题目链接）。

### Step 3 — 分类定位

运行以下脚本查看已有归类，确保命名一致、优先复用已有 category：

```bash
python3 <skill_dir>/scripts/scan_entries.py
```

依据 `references/format-spec.md` 第 2 节决定：

- **library**：`frontend`（前端）/ `AI`（大模型·算法）/ `leetcode`（算法题，带题目链接）/
  `cs-basics`（计算机基础）。
- **category**：子领域，必须与文件名前缀一致（如 `JavaScript`、`Vue`、`哈希表`、`操作系统`）。
- **topic**：具体概念（如 `闭包`、`两数之和`）。

若讨论跨多个主题，拆分为多个 (library, category, topic) 条目分别处理。

### Step 4 — 查重与合并

对每一个目标 (library, category, topic)：

1. 检查 `src/data/<library>/<category>_<topic>.md` 是否已存在（参考 scan 输出）。
2. **已存在**：读取该文件，将新问答合并进去——
   - 同一问题已存在：用讨论中更完整/更新的回答**覆盖或补充**，不要新增重复块。
   - 全新问题：追加到文件末尾（保持 `## 【问题】`/`## 【回答】` 结构）。
   - 同步更新 `tags`/`difficulty`/`created` 等 frontmatter（created 保留首次日期，不覆盖）。
3. **不存在**：新建文件，按 Step 5 格式化。

禁止创建 `xxx2.md` 这类副本文件。

### Step 5 — 格式化

按 `references/format-spec.md` 生成内容：

- frontmatter：`category`/`topic`/`type`/`tags`/`difficulty`/`created`（数组用 `[a, b]` 形式）。
- 正文：首行 `# <topic>`，随后多个 `## 【问题】` + `## 【回答】` 块。
- `leetcode` 类型：`type: leetcode` 且包含 `## 【题目链接】` 块。
- 关键结论用 `**加粗**`（解析器据此统计要点数）。
- `【题目链接】`/`【难点分析】`/`【考察点】`/`【衍生问题】`/`【口诀】`/`【代码】` 等增强块
  **单独成块**，不要嵌在 `【回答】` 内部。

### Step 6 — 预览与确认（写入前必做）

向用户展示将要写入/合并的内容摘要：目标路径、library/category/topic、问答条数、是否新建或合并。
这一步是非破坏性的，务必在落盘前获得确认，避免误写或覆盖。若用户要求「直接存」则可跳过确认。

### Step 7 — 落盘

- 新建：用 `write_to_file` 写入 `src/data/<library>/<category>_<topic>.md`。
- 合并：用 `replace_in_file` 在文件末尾追加新问答，或更新既有问答块与 frontmatter。
- 写入后无需手动触达构建，`src/utils/parser.js` 会在应用加载时自动收录新文件。

### Step 8 — 汇报

简要告知：保存/合并到了哪个路径、新增了几条问答、是否复用了已有文件。提示用户可在应用里
按 category/topic 检索验证。如本次因不确定而跳过了某些主题，列出来让用户决定是否补存。

## Resources

- `references/format-spec.md` — 完整格式规范、四个 library 归类约定、解析器行为、命名反模式。
- `scripts/scan_entries.py` — 扫描 `src/data/` 输出已有 library/category/topic 清单，用于分类一致与去重。

## Cautions

- 永远是「整理讨论结论」，不要凭空编造答案；讨论未覆盖的内容标注待补充或向用户确认。
- 合并已有文件时只增补，不删除原文件中的既有有效内容。
- 文件名前缀 category 必须与 frontmatter.category 完全一致，否则应用内展示错位。

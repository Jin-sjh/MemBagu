---
name: bagu-organizer
description: This skill should be used when the user wants to organize 八股 (technical interview / coding-knowledge) content into the MemBagu project's required Markdown format and save it under src/data. It supports TWO input modes. Mode A: the user just discussed a 八股 topic in chat and wants it saved (triggers like 整理一下我们刚讨论的八股, 把这个八股存到项目里, 把讨论的问题保存成条目). Mode B: the user provides external MATERIALS (pasted text, a local .md/.txt/.pdf/.docx file, a screenshot/image, or a web/article URL) and wants the 八股 questions and answers distilled and extracted from them (triggers like 从这份资料里抽八股, 把这篇文档整理成八股条目, 这是我整理的笔记帮我沉淀到 MemBagu, 从这篇文章里提取面试考点, 把这份截图里的知识点存进 MemBagu). The skill mines the source, classifies into the right library/category, dedups and merges with existing entries, formats frontmatter plus 问题/回答 blocks, and writes the file to remove manual sorting burden.
---

# Bagu Organizer

## Overview

把八股内容一键整理成 MemBagu 项目要求的 Markdown 条目，并落盘到
`src/data/<library>/<category>_<topic>.md` 的对应位置。支持两种输入：

- **Mode A — 沉淀聊天讨论**：从当前对话里刚讨论过的八股，整理存档。
- **Mode B — 从资料抽取**：用户提供一份外部资料（粘贴文本 / 文件 / 截图 / 链接），
  从中**抽取并蒸馏**出八股问答，存入项目。

核心目标是消除人工判断分类、手敲 frontmatter、手动搬运问答的重复劳动。
详细格式规范见 `references/format-spec.md`；抽取实操见 `references/extraction-guide.md`；
分类与去重时先用 `scripts/scan_entries.py`、从资料抽取时可用 `scripts/extract_candidates.py` 辅助。

## When to Use

- 用户刚在对话中讨论了一个或多个八股问题，希望保存进项目知识库（Mode A）。
- 用户贴入一段八股讨论 / 笔记 / 文章，希望按项目规范归类存档（Mode A 或 B）。
- 用户**提供了一份资料**（文本 / 文件 / 截图 / 链接），希望从中抽取八股问答（Mode B）。
- 用户明确说「整理」「保存」「存一下」「归档」「抽取」「沉淀」与八股相关的内容。

不要用于：与 MemBagu 格式无关的其他文档写作；纯问答但不保存。
（注：图片资料现在由本 skill 直接读取处理；只有「古典八股文/科举试题」类的图片才归属
`八股提取器` agent，那是另一个领域，与本项目的技术八股无关。）

## Workflow

严格按顺序执行，遇到需要用户拍板的分支再停下确认。

### Step 1 — 确定输入模式与来源

- **Mode A（聊天讨论）**：优先从**当前对话上下文**提取刚讨论的八股问答；若用户额外粘贴了
  文本，以粘贴文本为准。
- **Mode B（资料抽取）**：先确认资料来源，按 `references/extraction-guide.md` 第 1 节接入：
  - 粘贴文本 → 直接用于抽取；
  - 本地 `.md`/`.txt` → `read_file`；`.pdf`/`.docx` → 先用 `pdf`/`docx` skill 提取正文；
  - 截图/图片 → `read_file` 读图（多模态）或请用户贴图；
  - 网页/文章链接 → `web_fetch` 抓取正文；
  - 多文件/多段 → 逐个接入，统一归并到同一批抽取任务。
- 若不清楚「要处理哪一份 / 哪一段」，或资料含多个无关主题，用一句话向用户确认范围，
  不要一次存错一堆。

### Step 2 — 结构化资料（Mode B 推荐）

运行以下脚本，把资料按标题切分为若干 segment，并标记每个段落是否含显式 Q&A、
是否疑似算法题、八股价值分与建议提问，作为抽取骨架：

```bash
python3 <skill_dir>/scripts/extract_candidates.py <material_file>
```

（无本地文件、纯粘贴文本时，可跳过脚本，直接在第 3 步按文本抽取。）

### Step 3 — 抽取与蒸馏问答（核心）

把来源整理成若干条干净的「问题 → 回答」对。遵循 `references/extraction-guide.md`：

- **显式问答资料**（笔记/FAQ/面经/带 `【问题】` 的原文）：忠实保留原意，只做格式归一；
  同一概念不同问法合并为一条更完整的问答。
- **讲解型资料**（文章/叙述，无现成问答）：做**蒸馏** —— 用 `suggested_questions`
  作骨架，从资料里选 1–4 个最贴切的问法（定义/原理/对比/场景/优缺点类），答案**严格从
  原文提炼**，保留关键结论并用 `**加粗**` 突出，代码/图示/表格原样保留。
- 识别每条问答的隐含元数据：技术方向、标签、难度、是否算法题（有无题目链接）。
- 资料未覆盖但常考的点，加 `## 【衍生问题】` 并标注「待补充」，**绝不编造答案**。
- 跨多个主题的资料拆分为多个 `(library, category, topic)` 条目分别处理。

### Step 4 — 分类定位

运行以下脚本查看已有归类，确保命名一致、优先复用已有 category：

```bash
python3 <skill_dir>/scripts/scan_entries.py
```

依据 `references/format-spec.md` 第 2 节决定：

- **library**：`frontend`（前端）/ `AI`（大模型·算法）/ `leetcode`（算法题，带题目链接）/
  `cs-basics`（计算机基础）。
- **category**：子领域，必须与文件名前缀一致（如 `JavaScript`、`Vue`、`哈希表`、`操作系统`）。
- **topic**：具体概念（如 `闭包`、`两数之和`）。
- **type**：`bagu`（默认）/ `leetcode`（含题目链接）/ `explain`（纯讲解存档）。

若资料跨多个主题，拆分为多个条目分别处理。

### Step 5 — 查重与合并

对每一个目标 `(library, category, topic)`：

1. 检查 `src/data/<library>/<category>_<topic>.md` 是否已存在（参考 scan 输出）。
2. **已存在**：读取该文件，将新问答合并进去 ——
   - 同一问题已存在：用资料中更完整/更新的回答**覆盖或补充**，不新增重复块。
   - 全新问题：追加到文件末尾（保持 `## 【问题】`/`## 【回答】` 结构）。
   - 同步更新 `tags`/`difficulty`/`created` 等 frontmatter（created 保留首次日期，不覆盖）。
3. **不存在**：新建文件，按 Step 6 格式化。

禁止创建 `xxx2.md` 这类副本文件。

### Step 6 — 格式化

按 `references/format-spec.md` 生成内容：

- frontmatter：`category`/`topic`/`type`/`tags`/`difficulty`/`created`（数组用 `[a, b]` 形式）。
- 正文：首行 `# <topic>`，随后多个 `## 【问题】` + `## 【回答】` 块。
- `leetcode` 类型：`type: leetcode` 且包含 `## 【题目链接】` 块。
- 关键结论用 `**加粗**`（解析器据此统计要点数）。
- `【题目链接】`/`【难点分析】`/`【考察点】`/`【衍生问题】`/`【口诀】`/`【代码】` 等增强块
  **单独成块**，不要嵌在 `【回答】` 内部。

### Step 7 — 预览与确认（写入前必做）

向用户展示将要写入/合并的内容摘要：目标路径、library/category/topic、每条资料的问答条数、
是否新建或合并。资料量大或跨多主题时，明确列出拆分方案与条数，让用户确认范围与去重结果，
避免误写或覆盖。若用户要求「直接存」则可跳过确认。

### Step 8 — 落盘

- 新建：用 `write_to_file` 写入 `src/data/<library>/<category>_<topic>.md`。
- 合并：用 `replace_in_file` 在文件末尾追加新问答，或更新既有问答块与 frontmatter。
- 写入后无需手动触达构建，`src/utils/parser.js` 会在应用加载时自动收录新文件。

### Step 9 — 汇报

简要告知：保存/合并到了哪个路径、新增了几条问答、是否复用了已有文件、本次从哪份资料抽取。
提示用户可在应用里按 category/topic 检索验证。如本次因不确定而跳过了某些主题，列出来让用户
决定是否补存。

## Resources

- `references/format-spec.md` — 完整格式规范、四个 library 归类约定、解析器行为、命名反模式。
- `references/extraction-guide.md` — Mode B 资料接入方式、抽取/蒸馏方法论、类型判定、示例。
- `scripts/scan_entries.py` — 扫描 `src/data/` 输出已有 library/category/topic 清单，用于分类一致与去重。
- `scripts/extract_candidates.py` — 把资料按标题切成 segment，标记显式 Q&A / 算法题 / 八股价值分 / 建议提问，辅助 Mode B 抽取。

## Cautions

- 永远是「抽取/蒸馏资料结论」，不要凭空编造答案；资料未覆盖的内容标注待补充或向用户确认。
- 合并已有文件时只增补，不删除原文件中的既有有效内容。
- 文件名前缀 category 必须与 frontmatter.category 完全一致，否则应用内展示错位。
- Mode B 蒸馏时，术语、代码、公式、复杂度数字保留原文，不擅自「润色」成不准确表述。

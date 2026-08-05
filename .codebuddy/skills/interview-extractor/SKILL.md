---
name: interview-extractor
description: This skill should be used when the user drops in an IMAGE (screenshot of interview experience, 面经截图, chat screenshot) or a LINK (面经 article, job posting JD, interview collection page) and wants the interview questions extracted and organized BY COMPANY and POSITION (按照公司岗位提取面试题目/整理面试题/提取面经问题). It extracts questions from the material, keeps Q&A pairs where the source provides answers, and adds clear "回答建议" (suggested answers based on public knowledge) for questions that lack original answers. Output is saved to MemBagu's src/data as 面经 files named by company and position, with company/position/rounds frontmatter, merging into existing files when the same company+position already exists. Triggers include: 从这张图片提取面试题, 把这个链接里的面经整理一下, 提取面试问题, 整理面试题目, 按公司岗位整理面经.
---

# Interview Extractor

## Overview

把用户扔进来的**图片（面经截图）或链接（面经文章 / JD / 面试题合集）**中的面试题目提取出来，
**按公司、岗位**整理成 MemBagu 项目格式的面经文件，落盘到
`src/data/面经/面经_<公司><岗位>.md`（面经为独立题库库）。

核心能力：
- 识别资料中的 **company / position / rounds** 元数据并写入 frontmatter；
- **有问题+回答的都提取**；只有问题没有答案的，附加「回答建议」（标注为整理而非原文）；
- 同公司同岗位已存在时**合并**而非新建副本。

详细格式见 `references/format-spec.md`；提取实操见 `references/extraction-guide.md`；
写入前用 `scripts/scan_entries.py` 查重。

## When to Use

- 用户提供**一张图片**（面经截图、聊天截图、面试记录截图），希望提取面试题。
- 用户提供**一个链接**（面经文章、牛客/知乎面经、招聘 JD、面试题合集），希望整理成题目。
- 用户说「提取面试题」「整理面经」「按公司岗位整理面试题目」「把这份资料里的面试问题提取出来」。

不要用于：纯八股知识点整理（那是 `bagu-organizer` 的职责）；没有明确面试题提取意图的链接浏览。

## Workflow

严格按顺序执行。

### Step 1 — 接入资料

按 `references/extraction-guide.md` 第 1 节接入：
- **图片** → `read_file` 读图（多模态），读取图中文字后再提取；截图含多页时逐张读取。
- **链接** → `web_fetch` 抓取正文；微信文章抓取受限时请用户粘贴正文。
- **粘贴文本 / 多来源** → 统一归并到同一批提取任务。

### Step 2 — 提取元数据

识别并记录 **company**（公司）、**position**（岗位）、**rounds**（轮次），
识别不到就标注「未提及」，不猜。参考 `extraction-guide.md` 第 2 节。

### Step 3 — 提取与整理问题（核心）

- **有原文问答** → 忠实保留，按轮次组织为 `## 【问题】` / `## 【回答】` 对。
- **只有问题无答案** → 问题原样提取；`## 【回答】` 写**回答建议**，开头标注
  `> 回答建议（资料未提供原文答案，以下为根据公开资料的整理）`，保守可验证，不编造。
- **讲解/JD 类** → 提炼「该岗位可能被考察的问题」，答案标注为回答建议。
- 代码题/手撕题单独成块，代码缺失标注「代码待补充」。

### Step 4 — 分类定位

- **library**：固定 `面经`（`src/data/面经/`，面经为独立题库库，不再按岗位方向拆分到 AI/frontend）。
- **category**：固定 `面经`。
- **topic**：公司+岗位（如 `字节大模型算法岗`）；同公司岗位多篇加后缀区分
  （如 `面经_字节大模型算法岗_秋招.md`）。

### Step 5 — 查重与合并

```bash
python3 <skill_dir>/scripts/scan_entries.py
```

- **已存在同公司+岗位文件** → 读取原文件，新问题合并进去，`rounds`/`tags` 取并集，
  `created` 保留首次日期；不新增重复块，不创建副本。
- **不存在** → 新建文件。

### Step 6 — 格式化

按 `references/format-spec.md` 生成：
- frontmatter：`category: 面经`、`topic`、`type: bagu`、`company`、`position`、
  `rounds`、`tags`、`difficulty`、`created`。
- 正文：首行 `# <公司><岗位>面试记录`，随后多个 `## 【问题】` + `## 【回答】` 块。
- 关键结论用 `**加粗**`（解析器据此统计要点数）；增强块（`【衍生问题】` 等）单独成块。

### Step 7 — 预览与确认（写入前必做）

向用户展示：目标路径、公司/岗位/轮次、提取出的问题条数、每条是否有原文答案还是回答建议、
是新建还是合并。让用户确认后再写入。

### Step 8 — 落盘

- 新建：`write_to_file` 写入 `src/data/面经/面经_<公司><岗位>.md`。
- 合并：`replace_in_file` 追加新问答或更新既有问答块与 frontmatter。
- 写入后无需手动构建，`src/utils/parser.js` 会自动收录。

### Step 9 — 汇报

告知：保存/合并路径、公司/岗位/轮次、问题条数（其中多少条带原文答案、多少条为回答建议）、
是否复用已有文件。提示用户可在应用里按 category「面经」或 company/position 检索验证。

## Resources

- `references/format-spec.md` — 面经文件格式规范、frontmatter 字段、解析器行为、命名反模式。
- `references/extraction-guide.md` — 图片/链接接入方式、公司/岗位/轮次识别、提取/整理方法论。
- `scripts/scan_entries.py` — 扫描 `src/data/` 输出已有面经文件清单，用于查重与合并判断。

## Cautions

- 永远「提取/整理」而非编造：回答建议必须可验证并明确标注，识别不到的元数据写「未提及」。
- 只有问题没有答案时，回答建议要保守，不确定的细节标「待补充」。
- 合并已有文件时只增补，不删除既有有效内容。
- `category` 必须为 `面经` 且与文件名前缀一致，否则应用内展示错位。
- 术语、代码、复杂度数字保留原文，不擅自润色。

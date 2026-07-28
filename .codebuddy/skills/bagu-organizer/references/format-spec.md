# MemBagu 八股条目格式规范

本文件是 `bagu-organizer` skill 的详细参考。SKILL.md 中的格式化步骤应严格遵循此规范，
确保产出文件能被 `src/utils/parser.js` 正确解析并收录进应用。

## 1. 文件存储位置

````
src/data/<library>/<category>_<topic>.md
````

- `<library>`：顶层文件夹，目前固定为以下四个之一：`frontend`、`AI`、`leetcode`、`cs-basics`。
- `<category>_<topic>.md`：文件名由下划线连接，且 `category` 部分必须与 frontmatter 中的
  `category` 字段完全一致（解析器在缺少 frontmatter 时会回退用文件名前缀作为 category）。

## 2. 四个 library 的归类约定

- `frontend`：前端领域。子 category 通常是语言/技术栈/方向，例如 `JavaScript`、`Vue`、`CSS`、
  `HTTP`、`TCP`、`DNS`、`Nginx`、`Webpack`、`Vite`、`浏览器`、`工程化`、`手写` 等。
- `AI`：人工智能 / 大模型 / 算法领域。子 category 例如 `Transformer`、`MoE`、`强化学习`、
  `Agent`、`RAG`、`大模型`、`深度学习` 等。注意：部分文件 category 直接是 `AI`（如
  `AI_大模型性能指标.md`），也有用更细子类的（如 `强化学习_RLHF.md`）。
- `leetcode`：算法题。子 category 通常是数据结构/算法类型，例如 `哈希表`、`数组`、`动态规划`、
  `链表`、`二叉树` 等。此类条目 `type` 必须为 `leetcode`，并包含 `【题目链接】` 块。
- `cs-basics`：计算机基础。子 category 例如 `操作系统`、`网络`、`SQL`、`数据结构`、`网络安全` 等。

归类不确定时，优先贴近已有文件的命名习惯（见 scan_entries.py 输出），不要新造不统一的 category 名。

## 3. Frontmatter（YAML，轻量解析）

解析器为轻量实现，支持 `key: value` 与 `[a, b]` 数组；字符串可用可不用引号。字段如下：

````
---
category: <category>        # 必填，与文件名前缀一致
topic: <topic>             # 必填，与文件名后缀一致
type: bagu | leetcode | explain   # 默认 bagu；算法题用 leetcode；纯讲解用 explain
tags: [标签1, 标签2]        # 可选，数组形式
difficulty: easy | medium | hard  # 可选
created: YYYY-MM-DD        # 必填，创建日期
---
````

- 数组字段务必使用 `[a, b]` 形式，不要用 YAML 多行列表。
- `type: explain` 且无任何 `【问题】【回答】` 块时，整篇正文会被解析为一条讲解记录。

## 4. 正文结构

````
# <topic>

## 【问题】
<问题正文，可多行>

## 【回答】
<回答正文，支持 markdown、代码块、加粗等>

## 【问题】
...

## 【回答】
...

## 【题目链接】        # 仅 leetcode 类型
https://leetcode.cn/problems/xxx/

## 【难点分析】        # 可选增强块
...

## 【考察点】          # 可选增强块
...

## 【衍生问题】        # 可选增强块
...

## 【口诀】            # 可选增强块
...

## 【代码】            # 可选增强块
...
````

## 5. 解析器关键行为（务必遵守）

来自 `src/utils/parser.js` 的实测行为：

1. 以 `## ` 或顶格 `【问题】` / `【回答】` 标记问答块；同行之后的内容算作该块正文。
2. 任一其他 `【xxx】` 增强块出现时，会**结束当前回答的收集**，且增强块独立存在、不计入 answer。
   因此 `【题目链接】`/`【难点分析】` 等应单独成块，不要写在 `【回答】` 内部。
3. `title` 取第一个 `# ` 行（应为 topic）。
4. `category`/`topic` 优先取 frontmatter；缺省时回退为文件名 `category_topic` 的下划线拆分。
5. `keyPointsCount` 由回答中 `**加粗**` 数量统计，故关键结论建议用 `**加粗**` 突出。
6. 文件必须位于 `src/data/<library>/` 下，且不能是 `README.md`，否则不会被收录。

## 6. 命名与去重反模式

- 不要创建 `JavaScript_闭包2.md` 这类副本；若话题已存在，合并进原文件。
- category 与文件名前缀必须一致，否则应用内展示与解析会错位。
- 同一讨论中多个相似问法（如「什么是闭包？」「闭包是什么？」）应合并为一条更完整的问答，
  而非逐字重复堆叠。

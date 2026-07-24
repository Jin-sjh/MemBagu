# MemBagu 内容录入规范

本规范定义 `src/data` 下所有题库 `.md` 文件的统一格式，确保 `parser.js` 能稳定解析、分类准确，并支持后续按难度/标签筛选。

---

## 一、文件命名规范

统一采用 `分类_主题.md` 格式：

```
<分类>_<主题>.md
```

示例：
- `CSS_单位.md`
- `JavaScript_闭包.md`
- `强化学习_PPO 算法.md`
- `哈希表_两数之和.md`

说明：
- `分类` 与 `主题` 之间用半角下划线 `_` 分隔。
- `分类` 为大方向（如 `CSS`、`HTTP`、`强化学习`、`哈希表`），`主题` 为具体知识点。
- 若文件已带 frontmatter，命名仍建议遵循此格式以便人工检索；frontmatter 中的 `category`/`topic` 为解析时的权威来源。

---

## 二、Frontmatter 元信息（必填）

每个文件**必须**以 YAML frontmatter 开头，用 `---` 包裹：

```yaml
---
category: JavaScript        # 必填，分类，与文件名分类前缀对应
topic: 闭包                 # 必填，主题，与文件名主题对应
type: bagu                  # 必填，内容类型：bagu | explain | leetcode
tags: [作用域, 内存管理]     # 可选，标签数组，用逗号分隔
difficulty: medium          # 可选，难度：easy | medium | hard
created: 2026-07-24         # 可选，创建日期
---
```

### 字段说明

| 字段 | 必填 | 取值 | 用途 |
|------|------|------|------|
| `category` | 是 | 自由文本，建议简短 | 分类筛选、统计 |
| `topic` | 是 | 自由文本 | 展示、搜索 |
| `type` | 是 | `bagu` / `explain` / `leetcode` | 决定正文结构与解析行为 |
| `tags` | 否 | 数组 | 后续标签筛选 |
| `difficulty` | 否 | `easy` / `medium` / `hard` | 后续难度筛选 |
| `created` | 否 | `YYYY-MM-DD` | 录入时间追溯 |

### type 三种类型

- `bagu`：八股问答型，以【问题】【回答】为主体。
- `explain`：知识讲解型，无问答结构，正文整体作为一条讲解记录。
- `leetcode`：算法题解型，含题目链接、口诀、代码等专用块。

---

## 三、正文结构模板

所有文件在 frontmatter 之后，以一级标题 `# 主题名` 开头，随后按 type 填充正文。

### 3.1 bagu 八股问答型

```markdown
---
category: JavaScript
topic: 闭包
type: bagu
tags: [作用域, 内存管理]
difficulty: medium
created: 2026-07-24
---

# 闭包

## 【问题】
什么是闭包？

## 【回答】
闭包是指函数能够访问并记住自己定义时的词法作用域，即使这个函数在定义作用域之外执行，依然能访问外层变量。

简单说：内部函数 + 它引用的外层作用域，一起形成了闭包。

## 【问题】
闭包有什么缺点？

## 【回答】
闭包会让外层作用域的变量**无法被垃圾回收**，使用不当可能造成**内存泄漏**，用完需要手动置空释放。
```

要点：
- 每道题由 `## 【问题】` 和 `## 【回答】` 成对组成，可有多组。
- `【问题】` 后紧跟问题正文；`【回答】` 后紧跟回答正文。
- 标记固定用二级标题 `## 【问题】` / `## 【回答】`，不要用 `###` 或顶格混用。

### 3.2 explain 知识讲解型

```markdown
---
category: 模型架构
topic: RMSNorm 均方根归一化
type: explain
tags: [归一化, LayerNorm]
difficulty: medium
created: 2026-07-24
---

# RMSNorm 均方根归一化

## 1. 计算效率更高（去除了均值计算）

LayerNorm 需要计算均值（μ）和方差（σ²）...

RMSNorm 仅计算均方根（RMS），无需均值中心化：

$$
\text{RMS} = \sqrt{\frac{1}{D} \sum_{i=1}^{D} x_i^2 + \epsilon}
$$

实际训练中 RMSNorm 可提速 10%-30%。
```

要点：
- 无需【问题】【回答】标记，正文自由组织。
- 解析时整篇正文（去掉一级标题）作为一条记录，`question` 取标题，`answer` 取正文。
- 适合不便拆成问答的系统性讲解。

### 3.3 leetcode 算法题解型

```markdown
---
category: 哈希表
topic: 两数之和
type: leetcode
tags: [数组, 哈希表]
difficulty: easy
created: 2026-07-24
---

# 两数之和

## 【题目链接】
https://leetcode.cn/problems/two-sum/

## 【问题】
请解释两数之和的解题思路和实现方法。

## 【回答】
利用哈希表存储已遍历元素及其索引，在单次遍历中通过查找"补数"是否存在，实现 O(n) 时间复杂度求解。

## 【口诀】
初始化字典存数字和索引，遍历数组取索引与数值，计算补数，补数在字典则返回双索引。

## 【代码】
```python
def twoSum(nums, target):
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []
```
```

要点：
- `## 【题目链接】` 放 LeetCode 题目 URL。
- `## 【问题】`/`## 【回答】` 描述思路。
- `## 【口诀】` 为速记口诀。
- `## 【代码】` 为实现代码块。

---

## 四、可选增强块

`bagu` 类型在【回答】之后，可按需追加以下增强块，用于结构化补充面试信息。这些块以 `## 【块名】` 标记，**独立存在，不计入回答正文**：

| 块标记 | 用途 |
|--------|------|
| `## 【难点分析】` | 该问题的理解难点 |
| `## 【考察点】` | 面试官考察意图 |
| `## 【衍生问题】` | 相关追问方向 |

示例：

```markdown
## 【问题】
在注意力分数计算中，为什么要除 √dk？

## 【回答】
核心原因：控制点积 QK^T 的方差，防止数值过大导致 Softmax 输出极端化。

## 【难点分析】
需从方差角度理解缩放的必要性，而非仅记结论。当 Q、K 维度较大时，点积过大导致 Softmax 进入饱和区，梯度消失。

## 【考察点】
- 对 Attention 数值稳定性的理解
- 概率论基础：方差计算与缩放影响
- Softmax 特性：输入过大导致梯度消失

## 【衍生问题】
- 如果不缩放，训练中会出现什么问题？
- 为什么是除以 √dk 而不是其他值？
```

---

## 五、解析规则说明

`parser.js` 对每个文件的处理流程：

1. 读取文件内容，提取 frontmatter（`---` 包裹的 YAML）。
2. 剥离 frontmatter 后的正文进入标记解析：
   - 遇到 `## 【问题】` 开始收集问题文本；
   - 遇到 `## 【回答】` 开始收集回答文本；
   - 遇到下一个 `## 【问题】` 或其他 `## 【xxx】` 增强块时，结束当前问答并存入。
3. 元信息优先级：frontmatter 的 `category`/`topic` 为权威来源；无 frontmatter 时回退到文件名 `_` 分割（向后兼容）。
4. `type: explain` 且未解析到问答块时，整篇正文作为一条记录。
5. 每条记录输出字段：`id`、`category`、`topic`、`question`、`answer`、`keyPointsCount`（回答中 `**粗体**` 数量）、`source`（文件名）、`libraryId`、`type`、`tags`、`difficulty`。

> 注：`README.md` 会被解析器自动排除，不会进入题库。

---

## 六、存量迁移指南

存量 272 个文件分批迁移，按以下步骤：

1. 在文件头部添加 frontmatter，补全 `category`/`topic`/`type` 三项必填字段。
2. 规范文件名为 `分类_主题.md`（已有前缀的保持，无前缀的补上）。
3. 统一问答标记为 `## 【问题】` / `## 【回答】`（原有 `### 【问题】`、顶格 `【问题】` 仍可解析，但新录入一律用 `##`）。
4. 纯讲解类文件标注 `type: explain`，无需强行转为问答。
5. LeetCode 题解补全 `## 【题目链接】` 等专用块。

迁移可借助脚本批量添加 frontmatter，少数结构特殊的文件手动调整。

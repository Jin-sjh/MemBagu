# MemBagu 项目长期记忆

## 核心工作流约定（强制）

### 八股题统一走 bagu-organizer skill 沉淀
- 用户在这个项目里**发八股题 / 八股笔记 / 面经资料**（粘贴文本、md、截图、链接都算）时，
  默认动作不是「在对话里回答完就结束」，而是**调用 `bagu-organizer` skill 走完流程并落盘**到
  `src/data/<library>/<category>_<topic>.md`。
- 2026-09-14 Jin 明确：「我发这种题就用 bagu skill 处理沉淀」。
- 落盘规范要点（详见 `.codebuddy/skills/bagu-organizer/references/format-spec.md`）：
  - frontmatter 的 `category` 必须与文件名前缀一致；`created` 保留首次日期不覆盖。
  - 正文结构 `## 【问题】` + `## 【回答】`；`【考察点】` `【衍生问题】` 等增强块单独成块，
    不要嵌进 `【回答】` 里（解析器会提前结束回答收集）。
  - **已存在同名条目就合并，禁止建 `xxx2.md` 副本**；合并时只增补、不删既有内容。
  - 关键结论用 `**加粗**`（解析器据此统计 keyPointsCount）。
- 对话里照样给简答（用户要背的版本），同时把内容沉淀进知识库，两件事一起做。

## 已知待办
- `src/data/frontend/JavaScript_闭包.md` 里有多条重复的「什么是闭包？」问答（历史累积），
  用户未授权删除，暂时保留，后续可提议做一轮去重合并。

---
category: Skill
topic: Agent Skills 脚本编写
type: bagu
tags: [Agent Skills, 脚本, 一次性命令, 自包含脚本, 代理脚本设计]
difficulty: medium
created: 2026-08-19
---

# Agent Skills 脚本编写

## 【问题】
Agent Skills 里「运行命令 / 使用脚本」的机制是什么？什么时候该直接写一次性命令，什么时候该放进 scripts/ 目录？

## 【回答】
技能（Skill）可以**指示代理运行 shell 命令**，并把**可重用的脚本捆绑在 `scripts/` 目录下**。核心区分是：

- **一次性命令（one-off commands）**：当已有现成工具/包能满足需求，直接在 `SKILL.md` 里引用即可，**不需要 `scripts/` 目录**。适合简单、单条、无需自维护依赖的命令。
- **scripts/ 自包含脚本**：把可复用逻辑封装进 `scripts/`，并在脚本内**内联声明依赖**，单条命令即可运行。适合复杂逻辑、需要固定依赖版本、或要重复调用的场景。官方建议：**复杂命令应移入 `scripts/` 下的已测试脚本**，而不是堆在 SKILL.md 里。

此外，文档还专门讨论了**为代理（agentic）使用设计脚本**的最佳实践 —— 因为代理运行在**非交互 shell** 中，脚本必须满足无交互、可被发现用法、结构化输出等约束。

## 【问题】
有哪些「一次性命令」工具可以在 SKILL.md 中直接引用？各自的特点是什么？

## 【回答】
多个生态提供了「运行时自动解析并下载依赖、可固定版本」的工具，可直接在 SKILL.md 里写，无需本地安装目标包：

| 工具 | 特点与示例 |
| --- | --- |
| **uvx**（需先装 [uv](https://docs.astral.sh/uv/)） | `uvx ruff@0.8.0 check .`、`uvx black@24.10.0 .`；**隔离环境 + 激进缓存**，重复运行近乎即时。 |
| **pipx**（通过 OS 包管理器安装） | `pipx run 'black==24.10.0' .`、`pipx run 'ruff==0.8.0' check .`；成熟替代方案，OS 包可用性广。 |
| **npx**（随 Node.js 捆绑） | `npx eslint@9 --fix .`、`npx create-vite@6 my-app`；下载并缓存，用 `@version` 固定版本。 |
| **bunx**（随 [Bun](https://bun.sh/) 捆绑） | `bunx eslint@9 --fix .`；Bun 环境下的 npx 替代。 |
| **deno run**（随 [Deno](https://deno.com/) 捆绑） | `deno run npm:create-vite@6 my-app`、`deno run --allow-read npm:eslint@9 -- --fix .`；**需权限标志**（如 `--allow-read`），用 `--` 分隔 Deno 与工具自身的标志。 |
| **go run**（Go 内置） | `go run golang.org/x/tools/cmd/goimports@v0.28.0 .`、`go run github.com/golangci/golangci-lint/cmd/golangci-lint@v1.62.0 run`；**内置**，可固定版本或 `@latest`。 |

关键技巧：**固定版本**（如 `npx eslint@9.0.0`）保证跨环境一致性；在 SKILL.md 中**声明前置条件**（如 "Requires Node.js 18+"）或使用 `compatibility` frontmatter 字段；复杂命令应移入 `scripts/`。

## 【问题】
如何在 SKILL.md 中引用 `scripts/` 下的脚本？路径怎么写？

## 【回答】
使用**相对于技能目录根目录**的相对路径，代理会自动解析。推荐在 SKILL.md 里用一个小节列出可用脚本：

```markdown
## Available scripts

- **`scripts/validate.sh`** — Validates configuration files
- **`scripts/process.py`** — Processes input data
```

随后指示代理运行：

```markdown
## Workflow

1. Run the validation script:
   ```bash
   bash scripts/validate.sh "$INPUT_FILE"
   ```

2. Process the results:
   ```bash
   python3 scripts/process.py --input results.json
   ```
```

同样的约定也适用于 `references/*.md` 等支持文件：代码块中的执行路径**相对于技能目录根**。

## 【问题】
什么是「自包含脚本（self-contained scripts）」？如何不依赖外部 environment 就内联声明依赖？支持哪些语言？

## 【回答】
自包含脚本把可重用逻辑放进 `scripts/`，并在脚本**内部联声明依赖**，做到单命令即跑、不污染外部环境。支持 **Python、Deno、Bun、Ruby** 四种方式：

**1. Python（PEP 723）** —— 用脚本头部的 `# /// script` 块声明依赖：
```python
# /// script
# dependencies = [
#   "beautifulsoup4",
# ]
# ///

from bs4 import BeautifulSoup

html = '<html><body><h1>Welcome</h1><p class="info">This is a test.</p></body></html>'
print(BeautifulSoup(html, "html.parser").select_one("p.info").get_text())
```
运行：`uv run scripts/extract.py`（推荐）或 `pipx run scripts/extract.py`。可用 PEP 508 固定版本 `"beautifulsoup4>=4.12,<5"`，用 `requires-python` 约束解释器版本，`uv lock --script` 生成锁文件。

**2. Deno（TypeScript）** —— 用 shebang + `npm:`/`jsr:` 引包：
```typescript
#!/usr/bin/env -S deno run

import * as cheerio from "npm:cheerio@1.0.0";

const html = `<html><body><h1>Welcome</h1><p class="info">This is a test.</p></body></html>`;
const $ = cheerio.load(html);
console.log($("p.info").text());
```
运行：`deno run scripts/extract.ts`。版本 semver：`@1.0.0` 精确、`@^1.0.0` 兼容；全局缓存，`--reload` 强制重取；原生 addon 可能不支持。

**3. Bun（TypeScript）** —— 无需 `package.json`/`node_modules`，TS 原生支持：
```typescript
#!/usr/bin/env bun

import * as cheerio from "cheerio@1.0.0";

const html = `<html><body><h1>Welcome</h1><p class="info">This is a test.</p></body></html>`;
const $ = cheerio.load(html);
console.log($("p.info").text());
```
运行：`bun run scripts/extract.ts`。全局缓存；若**上级目录存在 `node_modules` 则禁用自动安装**。

**4. Ruby（bundler/inline）** —— 在脚本内嵌 gemfile：
```ruby
require 'bundler/inline'

gemfile do
  source 'https://rubygems.org'
  gem 'nokogiri'
end

html = '<html><body><h1>Welcome</h1><p class="info">This is a test.</p></body></html>'
doc = Nokogiri::HTML(html)
puts doc.at_css('p.info').text
```
运行：`ruby scripts/extract.rb`。应显式固定版本（`gem 'nokogiri', '~> 1.16'`），无锁文件；当前目录的 `Gemfile` 或 `BUNDLE_GEMFILE` 可能干扰。

## 【问题】
为「代理使用（agentic use）」设计脚本时，有哪些硬性要求和最佳实践？

## 【回答】
代理运行在**非交互 shell** 中，不能响应 TTY 提示，因此脚本设计有硬性约束和一系列最佳实践：

- **避免交互提示（硬性要求）**：所有输入必须通过**命令行标志、环境变量或 stdin**。坏例子：直接运行 `python scripts/deploy.py` 后卡在 `Target environment: _` 等待输入；好例子：缺参数时给出清晰错误与用法提示（`Error: --env is required. Options: development, staging, production.`）。
- **用 `--help` 文档化用法**：`--help` 是代理学习接口的主要途径，应包含描述、标志、示例，简洁明了。
- **编写有用的错误消息**：指明错误、期望的值与可尝试的方案，例如 `Error: --format must be one of: json, csv, table. Received: "xml"`。
- **使用结构化输出**：优先 **JSON / CSV / TSV**，便于代理配合 `jq`/`cut` 等工具处理；**数据送 stdout，诊断/进度送 stderr**。
- **幂等性**：代理可能重试，**「存在则跳过」优于「重复即失败」**。
- **输入约束**：用**枚举 / 闭集**拒绝歧义输入。
- **干跑支持**：破坏性操作提供 `--dry-run`。
- **有意义退出码**：不同失败类型区分退出码并文档化。
- **安全默认**：危险操作需显式 `--confirm` / `--force`。
- **可预测的输出大小**：许多代理框架会**截断过长输出（10–30K 字符）**；默认返回摘要或做限制，并支持 `--offset`，或要求用 `--output` 文件 / `-` 显式选入 stdout。

## 【衍生问题】
- 自包含脚本如何与 `compatibility` frontmatter（声明 Node/Python 版本前置条件）配合校验，避免运行环境不符？（待补充）
- scripts/ 脚本的**可见性/权限**（如是否随 skill 打包、跨平台 shell 兼容性）如何管理？（待补充）

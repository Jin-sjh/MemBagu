---
name: membagu-ui-redesign
overview: 对 MemBagu（八股记忆·艾宾浩斯记忆辅助系统）前端进行整体视觉重塑：采用现代知识工具风（浅色中性背景 + 蓝灰色系 + 细边框 + 字重色阶层级），重构布局并全面更新设计 token 与全部 10 个组件样式，动效保持克制微交互，功能逻辑不变。
design:
  architecture:
    framework: vue
  styleKeywords:
    - 现代知识工具风
    - 蓝灰商务
    - 浅色极简
    - 细边框卡片
    - 克制微交互
  fontSystem:
    fontFamily: PingFang SC
    heading:
      size: 24px
      weight: 600
    subheading:
      size: 16px
      weight: 600
    body:
      size: 15px
      weight: 400
  colorSystem:
    primary:
      - "#3D63DD"
      - "#2F4FC4"
      - "#EEF2FF"
    background:
      - "#F7F8FA"
      - "#FFFFFF"
      - "#F1F3F5"
    text:
      - "#1F2937"
      - "#6B7280"
      - "#9CA3AF"
    functional:
      - "#2F9E6E"
      - "#D97706"
      - "#DC2626"
      - "#E5E7EB"
todos:
  - id: rebuild-design-tokens
    content: 重构 main.css 设计 token，移除渐变背景，确立蓝灰色系与阴影动效规范
    status: completed
  - id: redesign-app-layout
    content: 重构 App.vue 顶部导航栏、工具行与内容区布局结构
    status: completed
    dependencies:
      - rebuild-design-tokens
  - id: restyle-learning-flow
    content: 统一 QuestionCard、ReviewList、ProgressBar 学习链路组件样式
    status: completed
    dependencies:
      - redesign-app-layout
  - id: restyle-stats-library
    content: 统一 Statistics、LibraryManager、LibrarySelector、Auth、AudioGenerator 样式
    status: completed
    dependencies:
      - redesign-app-layout
  - id: restyle-search-markdown
    content: 统一 SearchBox、CategoryFilter 与 markdown.css、index.html 细节
    status: completed
    dependencies:
      - redesign-app-layout
  - id: verify-build-responsive
    content: 运行构建验证，走查各断点响应式与对比度
    status: completed
    dependencies:
      - restyle-learning-flow
      - restyle-stats-library
      - restyle-search-markdown
---

## 用户需求

对 MemBagu「八股记忆」艾宾浩斯记忆辅助系统的整个前端界面进行设计优化。用户已确认：整体视觉重塑（全部页面统一换一套设计语言）；风格由 AI 推荐；动效保持克制微交互；允许重构布局结构（导航位置、信息架构、组件排布可重设计），但功能流程与业务逻辑完全不变。

## 产品概述

MemBagu 是一个 Vue 3 单页应用，帮助用户基于艾宾浩斯遗忘曲线记忆前端八股文知识点。包含五个视图：待复习、学习、音频生成、统计、库管理，外加全局搜索、分类筛选、登录云同步、记忆池状态展示等能力。当前界面为紫蓝渐变背景 + Bootstrap 风亮蓝主色 + 重阴影大白卡片，视觉陈旧、配色花哨、硬编码颜色分散。

## 核心功能（视觉重塑范围）

- 全局设计体系：浅色中性背景替换紫蓝渐变，蓝灰商务色系 token 统一全站，细边框代替重阴影，层级靠字号/字重/色阶/留白区分
- 布局重构：顶部整合式导航栏（品牌 + 五个主导航 + 保存状态/库选择/登录），搜索与分类筛选整合为工具行，内容区层级重新梳理
- 学习链路焕新：QuestionCard 学习卡片、三档评分按钮（不会/模糊/会）、ReviewList 复习列表与记忆池状态条、复习弹窗的视觉统一
- 其余视图统一：Statistics 统计卡片与进度条、LibraryManager/LibrarySelector 库管理、Auth 登录、AudioGenerator 音频生成、SearchBox 搜索下拉
- 辅助细节：markdown 渲染样式（代码块/标题/引用）、空状态、移动端响应式与 44px 触控体验不退化、克制过渡动效（150-250ms）

## 技术栈选择

- 沿用现有栈：Vue 3.4（Composition API + `<script setup>`）+ Vite 5 + 纯 CSS 设计 token，**不引入任何新依赖**（不加 UI 框架/Tailwind），避免体积与维护成本
- 样式方案：CSS 自定义属性 token（`:root`）+ 组件 scoped style，与现状一致

## 实施方案

**策略：Token 先行 → 布局重构 → 组件批量收敛**。先在 `main.css` 重构设计 token（配色语义、背景、阴影、过渡曲线），再重构 `App.vue` 布局结构，最后将全部组件的硬编码颜色（#555/#666/#e8e8e8/#f0f0f0/#34495e/#eaecef 等）与散落样式收敛到 token，统一按钮/卡片/标签/badge 四类基础样式语言。

**关键决策**：

- 沿用并扩展现有 token 体系而非另起炉灶：现有 --spacing/--font-size/--radius/--color 命名已被全部组件引用，只重定义色值并补充语义 token（--color-surface、--color-border-strong、--color-primary-soft、阴影 --shadow-sm/md、--transition-fast），改动面可控
- 字体优先系统字体栈（-apple-system / PingFang SC / Microsoft YaHei），不引入 Web 字体，零加载成本
- 功能色柔和化：评分三键保留红/橙/绿语义但降饱和度（#DC2626/#D97706/#2F9E6E），与蓝灰基调协调且满足 WCAG AA 对比度

**性能与可靠性**：纯 CSS 变更，无运行时开销；过渡仅作用于 transform/opacity/background-color，避免触发 layout；构建产物体积基本不变。

## 实施注意事项

- **保留未提交改动**：git status 显示 App.vue、QuestionCard.vue、ReviewList.vue、Statistics.vue、useEbbinghaus.js、useProgress.js、parser.js 有未提交修改，本次只动 template 结构与 style，绝不触碰 script 逻辑
- **逻辑零改动**：不改任何 props/emits/事件流/艾宾浩斯算法/云同步/localStorage
- **响应式不退化**：保留 576/768/992/1200/1400px 断点、44px 触控目标、safe-area 适配、移动端横向滚动导航
- **可访问性**：正文对比度 ≥ 4.5:1，交互元素保留 focus-visible 态
- 验证：`npm run build` 通过

## 架构与目录

单页应用壳结构不变，仅视觉层改造。涉及文件：

```
MemBagu/
├── index.html                          # [MODIFY] 增加 meta theme-color（#F7F8FA），匹配新浅色背景，避免移动端地址栏/启动白屏色差
├── src/
│   ├── styles/
│   │   ├── main.css                    # [MODIFY] 核心：重构设计 token。移除 body 紫蓝渐变改为 #F7F8FA 浅色中性背景；主色改为蓝灰系 #3D63DD；新增 surface/border-strong/primary-soft/shadow/transition 语义 token；统一滚动条与 focus 态样式
│   │   └── markdown.css                # [MODIFY] markdown 渲染样式适配：正文色 #374151、代码块浅灰底 #F3F4F6 + 边框、引用左侧主色竖条、标题字重层级，全部引用 token
│   ├── App.vue                         # [MODIFY] 布局重构：顶部整合式导航栏（左品牌区 + 中间五导航项 + 右侧保存状态/库选择/Auth）；搜索 + 分类筛选整合为工具行；main 去重阴影大卡片改为细边框/留白层级；样式全部 token 化。script 逻辑不动
│   └── components/
│       ├── QuestionCard.vue            # [MODIFY] 学习卡片：标签/badge 改为浅色底+色阶文字；评分三键柔和化；「显示答案」主按钮用新主色；导航按钮 ghost 化。仅 template class 与 style
│       ├── ReviewList.vue              # [MODIFY] 复习列表：pool-chip 五色池用柔和语义色 token；列表项细边框卡片 + hover 微提升；弹窗遮罩与圆角统一；空状态 emoji 可保留但更克制
│       ├── Statistics.vue              # [MODIFY] 统计卡片网格：数值用大字号字重层级，卡片细边框；危险操作按钮弱化
│       ├── ProgressBar.vue             # [MODIFY] 进度条四档色收敛到新功能色 token，轨道色用 --color-border
│       ├── CategoryFilter.vue          # [MODIFY] 筛选 pill：白底细边框，激活态主色浅底+主色文字（替代实心填充），移除硬编码 #555/#666
│       ├── SearchBox.vue               # [MODIFY] 搜索框：圆角输入框 + 聚焦主色描边；结果下拉细边框卡片 + hover 色阶
│       ├── LibrarySelector.vue         # [MODIFY] 库选择下拉视觉统一（边框/hover/激活态 token 化）
│       ├── LibraryManager.vue          # [MODIFY] 库管理卡片列表统一新卡片语言
│       ├── Auth.vue                    # [MODIFY] 登录按钮与同步状态样式 token 化
│       └── AudioGenerator.vue          # [MODIFY] 音频生成表单控件（输入/按钮/列表）统一新语言
```

## 关键代码结构

新设计 token 契约（全部组件依赖，先行定义）：

```css
:root {
  /* 蓝灰商务色系 */
  --color-primary: #3D63DD;
  --color-primary-dark: #2F4FC4;
  --color-primary-soft: #EEF2FF;        /* 激活态浅底 */
  /* 中性层级 */
  --color-bg: #F7F8FA;                  /* 页面背景 */
  --color-surface: #FFFFFF;             /* 卡片 */
  --color-surface-sunken: #F1F3F5;      /* 次级填充 */
  --color-border: #E5E7EB;
  --color-border-strong: #D1D5DB;
  --color-text: #1F2937;
  --color-text-secondary: #6B7280;
  --color-text-light: #9CA3AF;
  /* 柔和功能色（评分/状态） */
  --color-success: #2F9E6E;
  --color-warning: #D97706;
  --color-danger: #DC2626;
  /* 阴影与动效 */
  --shadow-sm: 0 1px 2px rgba(16, 24, 40, 0.05);
  --shadow-md: 0 4px 12px rgba(16, 24, 40, 0.08);
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
}
```

## 设计风格

采用「现代知识工具风」（参考 Linear / Notion / Obsidian）：浅色中性背景、蓝灰商务色系、细边框卡片、字号字重色阶构建层级，契合记忆学习工具的专注、理性氛围，亦符合用户长期偏好的蓝灰商务风与无花哨动效。

## 布局设计（单页应用，五个视图共享一套框架）

- **顶部导航栏**：通栏白色吸顶导航。左侧品牌「八股记忆」（字重 600，副标题移除或弱化为小字）；中间五个导航项（待复习带计数 badge），激活态为主色浅底 pill + 主色文字；右侧依次为保存状态点、库选择器、登录入口。移动端导航项横向滚动。
- **工具行**：导航栏下方一行整合搜索框（左，flex 自适应）与分类筛选 pill 组（右/换行），背景透明，与内容区拉开 24px 间距。
- **内容区**：最大宽度 960px 居中。取消重阴影大白板，学习内容直接承载于留白背景；列表项与统计卡使用白底 + 1px 细边框 + 12px 圆角卡片，hover 时 translateY(-1px) + 浅阴影。
- **学习卡片视图**：问题区大字号（18-20px/600），「显示答案」主色大按钮居中；评分三键等宽横排，柔和红/琥珀/绿；底部上一题/下一题 ghost 按钮 + 页码小字。
- **待复习视图**：标题 + 计数居左，记忆池五 chip 横排（浅底 + 语义色文字 + 数字加粗）；题目列表卡片纵向排列，右侧「开始复习」主色描边按钮；空状态居中图标 + 灰字提示。
- **统计视图**：四张统计卡 2x2/4 列网格，数值 32px/700 主色或语义色，标签小字灰；分类覆盖列表行内进度条；危险操作（重置进度）弱化为描边红按钮置底。
- **弹窗**：复习弹窗居中卡片，遮罩 rgba(15,23,42,0.4)，圆角 16px，关闭按钮右上角灰字。

## 交互与动效

克制微交互：全部过渡 150-250ms ease；hover 仅色阶加深/细微位移/浅阴影；按钮 active 态 scale(0.98)；导航切换无动画；focus-visible 显示主色描边。滚动条细窄灰色。

## Agent Extensions

### Skill

- **frontend-design**
- 用途：为现有 UI 重塑提供有辨识度、非模板化的视觉设计指导，把控配色、字体层级与美学方向
- 预期结果：设计 token 与组件视觉方案具备现代知识工具质感，避免默认模板感
- **ui-ux-pro-max**
- 用途：辅助决策蓝灰色板、字体搭配与卡片/按钮/导航等元素的 UI 细节，校验设计一致性
- 预期结果：配色与元素规格有据可依，全站视觉统一
- **coding-standards**
- 用途：编写 Vue SFC 与 CSS 时自动遵循项目编码规范
- 预期结果：样式改动符合 Vue/CSS 规范，与现有代码风格一致
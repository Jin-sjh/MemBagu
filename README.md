
"MemBagu"八股记忆 - 艾宾浩斯记忆辅助系统
==========================

一个基于艾宾浩斯遗忘曲线的记忆辅助应用，帮助用户高效记忆八股文题目。支持文本学习和音频播放两种模式。

## 功能特性

- **艾宾浩斯记忆曲线** - 基于科学的记忆间隔算法，自动安排复习时间
- **多题库管理** - 支持创建、切换和管理多个题库
- **分类筛选** - 按类别和主题快速筛选题目
- **全文搜索** - 快速搜索题目和答案内容
- **学习统计** - 可视化展示学习进度和记忆保持率
- **音频生成** - 将题目转换为音频，支持离线收听
- **进度持久化** - 学习进度自动保存到本地存储

## 技术栈

- **前端**: Vue 3 + Vite
- **语音合成**: Edge TTS (Microsoft Azure)
- **服务端**: Express.js
- **数据存储**: LocalStorage

## 项目结构

```
├── src/
│   ├── components/        # Vue 组件
│   │   ├── AudioGenerator.vue
│   │   ├── CategoryFilter.vue
│   │   ├── LibraryManager.vue
│   │   ├── QuestionCard.vue
│   │   └── ...
│   ├── composables/       # 组合式函数
│   │   ├── useAudioGenerator.js
│   │   ├── useEbbinghaus.js
│   │   ├── useLibraries.js
│   │   ├── useProgress.js
│   │   └── useQuestions.js
│   ├── data/              # 题目数据 (Markdown 格式)
│   ├── styles/            # 样式文件
│   ├── utils/             # 工具函数
│   ├── App.vue
│   └── main.js
├── scripts/               # 音频生成脚本
│   ├── audio-generator.js
│   ├── tts_direct.py
│   └── utils/
├── server/                # 音频服务器
│   └── audio-server.js
├── audio/                 # 生成的音频文件
├── index.html
├── package.json
└── vite.config.js
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

启动前端开发服务器：

```bash
npm run dev
```

启动音频服务器（用于音频生成功能）：

```bash
npm run server
```

同时启动前端和音频服务器：

```bash
npm run dev:all
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 使用指南

### 题目格式

题目采用 Markdown 格式存储，支持以下格式：

```markdown
# 标题

## 【问题】
这里是问题内容

## 【回答】
这里是答案内容
```

### 记忆间隔

系统采用艾宾浩斯记忆曲线，复习间隔如下：

| 复习次数 | 间隔时间 |
| ---- | ---- |
| 第1次  | 20分钟 |
| 第2次  | 1小时  |
| 第3次  | 9小时  |
| 第4次  | 1天   |
| 第5次  | 2天   |
| 第6次  | 6天   |
| 第7次+ | 30天  |

### 音频生成

生成单个题目音频：

```bash
npm run generate:audio
```

或在应用中通过"音频生成"页面进行操作。

## API 接口

音频服务器提供以下接口：

| 接口                              | 方法   | 描述     |
| ------------------------------- | ---- | ------ |
| `/api/categories`               | GET  | 获取所有分类 |
| `/api/questions/count`          | GET  | 获取题目数量 |
| `/api/audio/generate`           | POST | 生成音频   |
| `/api/audio/download/:filename` | GET  | 下载音频文件 |

## 开发说明

### 添加新题库

1. 在 `src/data/` 目录下创建新文件夹
2. 添加 Markdown 格式的题目文件
3. 文件命名格式：`类别_主题.md`

### 自定义语音

音频生成支持多种语音选项，可在 `scripts/audio-generator.js` 中修改：

```javascript
const voice = 'zh-CN-XiaoxiaoNeural' // 默认语音
const rate = 0 // 语速调整 (-100 到 100)
```

可用的中文语音：

- `zh-CN-XiaoxiaoNeural` - 晓晓（女声）
- `zh-CN-YunxiNeural` - 云希（男声）
- `zh-CN-YunyangNeural` - 云扬（男声）

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

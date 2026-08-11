---
category: AI
topic: 模型路由与Token压缩
type: bagu
tags: [AICoding, 模型路由, 9Router, Token压缩, Cavenman, RTK, 模型分级, 弱模型, 面试]
difficulty: medium
created: 2026-08-10
---

# 模型路由与Token压缩

## 【问题】

如何对模型分级，并通过路由与 Token 压缩降低 AI Coding 成本？

## 【回答】

按研发阶段对模型能力做三级划分，并据此路由：

- **Level 1（执行简单任务，如 hunyuan、DeepSeek-V3）**：对应 Phase 6 门禁验证、代提交，只需执行脚本和输出文件验证。
- **Level 2（理解技术方案并配合知识图谱修改代码，如 DeepSeek-V4、GLM）**：对应 Phase 2~5 编码执行阶段。
- **Level 3（强自然语言/代码理解、多轮交互完善方案，如 Claude-opus）**：对应 Phase 0~1 方案生成、任务划分。

实战默认策略：Phase 0~1 用 claude-sonnet 或 deepseek-v4-pro（结合 Understand-Anything 能力，sonnet 可达 opus 效果且省成本；简单需求甚至 deepseek-v4-pro 也能胜任）；Phase 2~5 用 **deepseek-v4-pro 首选**（便宜、快速、稳定、准确），glm5.1 / claude-sonnet 高峰备选；Phase 6 用 deepseek-v4-pro（门禁验证不到 ￥1，速度快、风险低）。

通过 **9Router** 实现插拔式热切换：支持跨模型提供商切换、同等级配置化/热更新切换、**自动灾备**（高峰某模型故障自动降级同等级其他模型，不阻塞开发）。Token 进一步压缩：

- **Cavenman**（压缩模型回复冗余）：简洁语言重构（要点式去废话）、空谈过滤（删掉"理解/知道了"等重复）、前置上下文偏好（让模型自精炼）。
- **RTK**（压缩历史对话上下文）：只保留末尾 N 轮完整对话其余压成摘要、自然语言压缩、技术前缀剥离（"I'm a…"→"AI: "）、高效编码格式。

## 【问题】

弱模型（DeepSeek）在强约束下能否达到强模型（Claude）的开发效果？实测数据如何？

## 【回答】

能。腾讯广告机审 HE3.0 架构升级实测（控制变量对比设计与开发两阶段）：

- **设计过程**：同等起点下，DeepSeek 第一版即确定正确架构方向，比 Claude 节约 **13 版探索**（整体节省 10 余次探索）；其首版方案的工程深度已和 Opus 第 15 版相当。
- **费用**：Claude 5 月设计+开发约 ￥7978.83 + ￥2981.64；DeepSeek 6 月实验 token 量差 7.5 倍，拉齐 token 后整体费用差距约 **30 倍**。
- **归因**：①强制 TDD + 编译门禁自动兜底，让弱模型也能在可控成本内产出可用代码（agent-skills 非强制流程在弱模型下缺乏纠偏，大量时间耗在方向试错）；②项目级知识图谱（understand-anything 自动加载架构/依赖/命名约定），大幅减少模型探索成本。

三种开发模式成本对照（2000 行规模、保障质量）：**Claude 模式 ≈ ￥1000**（全程 Claude，不需深懂项目）、**标准模式 ≈ ￥200**（Sonnet 出方案 + DeepSeek-V4-Pro 开发）、**专家模式 ≈ ￥20**（全程 DeepSeek-V4-Pro，需研发深懂项目、多次引导）。

**面试要点**：强弱模型搭配 + 知识图谱 + Skill 体系约束，即可在大幅降低成本的同时匹配强模型的代码实现能力——弱模型不是不能用，关键在于用工程化约束弥补其"方向试错"短板。

## 【衍生问题】

- 跨提供商模型如何做等级划分与降级备选？（本文给出一份跨提供商等级表，含 Hy3/DeepSeek-V4-Pro/GLM-5.1/Claude-Sonnet-4.6 等及 credits 倍数，level3 类不会自动选择、仅显式指定才用）
- 9Router 与腾讯内部 OA 认证模型集成需注意什么？（需修改 9Router 源码以对接内部 SSO，其本身为 MIT license）

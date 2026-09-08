---
category: AI
topic: LangChain-Chatchat 与自建服务
type: bagu
tags: [AI, 大模型, LangChain, LangChain-Chatchat, 本地部署]
difficulty: medium
created: 2026-09-08
---
# LangChain-Chatchat 与自建服务

> 来源：「项目前预备知识」大纲（图片）。原文只给出知识点清单，未给出答案，
> 以下回答为根据公开资料（LangChain-Chatchat 项目 README）整理，项目迭代较快，细节以官方仓库为准。

## 【问题】

LangChain-Chatchat 是什么？它解决了什么问题？

## 【回答】

**LangChain-Chatchat（原 Langchain-ChatGLM）是一个基于 LangChain + 开源大模型（如 ChatGLM、Qwen、Baichuan 等）的开源、可离线部署的 RAG 知识库问答项目**。

**它解决的问题**：把「**本地大模型 + 本地知识库**」整套链路开箱即用化：

- **前端交互**：提供 **Web UI**，支持**知识库管理、多轮对话、引用来源展示**。
- **知识库管理**：内置**文档上传、切分、向量化、入库、检索**的完整流程。
- **本地私有化**：**模型与数据都可不出内网**，解决**数据合规与泄密风险**。
- **多模型支持**：模型层可替换（**ChatGLM3、Qwen、Llama 等 + 各类 Embedding / Rerank 模型**）。
- **Agent 能力**：提供**工具调用**相关能力（不同版本支持程度不一，以官方为准）。

**定位**：它不是底层框架，而是**「LangChain + RAG」的成品应用模板**，适合**快速搭建企业/个人本地知识库问答**，也常被用作**学习 RAG 工程落地的参考实现**。

## 【问题】

如何配置自己的 LangChain + LLM 服务？

## 【回答】

典型自建路径（以本地知识库问答为例）：

**1. 模型层**

- 选基座：**ChatGLM3-6B / Qwen / Baichuan / Llama** 等开源模型。
- 本地推理框架：**Transformers、vLLM（高吞吐）、llama.cpp / Ollama（轻量、CPU 可用）**；也可用 **OpenAI 兼容 API**（如 Xinference、One-API 做统一网关）。
- 资源受限时：**量化（GPTQ / AWQ / GGUF）+ LoRA** 降低显存。

**2. 数据与检索层**

- 文档加载与切分：按文档类型选择 **Loader 与 Text Splitter**，配置 **chunk_size / overlap**。
- 向量化：选**中文 Embedding**（如 bge、m3e 等），入库 **FAISS / Milvus / Chroma / PGVector**。
- 检索优化：**Top-K + 相似度阈值 + 混合检索（BM25 + 向量）+ Rerank**。

**3. 应用编排层（LangChain）**

- 用 **Prompt Template** 约束「**只依据上下文作答、无法回答时拒答、给出引用编号**」。
- 用 **LCEL / Chain** 串起「检索 → 组装 → 生成 → 解析」；用 **Memory** 管理多轮上下文。
- 需要动作能力时接 **Tool / Agent**。

**4. 服务化与工程配套**

- 用 **FastAPI / LangServe** 暴露 API，前端或 Web UI 调用；**流式输出（SSE）** 改善体验。
- 配套：**配置中心（模型地址、密钥、参数）、日志与链路追踪、Token 与成本核算、缓存、限流、鉴权、敏感词与安全过滤**。
- 评测：搭**自建评测集**做回归（准确率、拒答率、忠实度、延迟），持续迭代。

**最小可跑路径**：**Ollama 起本地模型 → LangChain 接入 → FAISS 建本地知识库 → Streamlit/FastAPI 起服务**。

## 【衍生问题】

- 自建 RAG 服务时，如何做多租户的权限隔离与数据隔离？（待补充）
- 本地部署在并发与延迟上如何调优（批处理、continuous batching、KV Cache、量化）？（待补充）

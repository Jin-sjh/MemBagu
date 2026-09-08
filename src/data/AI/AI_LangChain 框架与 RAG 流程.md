---
category: AI
topic: LangChain 框架与 RAG 流程
type: bagu
tags: [AI, 大模型, LangChain, RAG, Agent]
difficulty: medium
created: 2026-09-08
---
# LangChain 框架与 RAG 流程

> 来源：「项目前预备知识」大纲（图片）。原文只给出知识点清单，未给出答案，
> 以下回答为根据公开资料（LangChain 官方文档与社区实践）整理，版本演进较快，细节以官方文档为准。

## 【问题】

LangChain 是什么？它解决什么问题？

## 【回答】

**LangChain 是一个用于开发 LLM 应用的开源编排框架**，把**模型、数据检索、工具、记忆、流程**等能力抽象成统一接口，用于**快速搭建 RAG、Agent、对话机器人等应用**。

**它解决的问题**：

- **模型无关**：统一 **LLM / ChatModel / Embedding** 接口，**一行替换不同厂商模型**（OpenAI、ChatGLM、通义等）。
- **数据接入**：内置 **Document Loader、Text Splitter、VectorStore、Retriever**，把外部知识接入模型。
- **流程编排**：用 **Chain / Runnable（LCEL）** 把「检索 → 组装 Prompt → 调用模型 → 解析输出」串成流水线。
- **智能体**：提供 **Agent / Tool / Memory**，让模型**自主调用工具、多步推理**。
- **工程能力**：**回调与可观测性、流式输出、缓存、输出解析器**等生产化配套。

**局限**：抽象层次多、**版本迭代快、API 变动频繁**，简单场景有时**不如直接调用 SDK 清晰**。

## 【问题】

LangChain 有哪些核心组件？

## 【回答】

1. **Model I/O（模型输入输出）**
   - **LLM / Chat Model**：同步、流式、异步调用接口。
   - **Prompt Template**：参数化提示词模板（含 **FewShotPromptTemplate**、**ChatPromptTemplate**）。
   - **Output Parser**：把模型输出解析为**结构化数据（JSON / Pydantic）**。

2. **Data Connection（数据连接）**
   - **Document Loader**：加载 **PDF、Markdown、网页、数据库**等数据源。
   - **Text Splitter**：**按字符/递归/语义切分为 Chunk**（常用 **RecursiveCharacterTextSplitter**）。
   - **Embedding Model**：把文本转为**稠密向量**。
   - **Vector Store**：**FAISS、Chroma、Milvus、PGVector** 等向量库。
   - **Retriever**：**相似度检索 / MMR / 混合检索 / 重排序（Rerank）**。

3. **Chains（链）**
   - 用 **LCEL（LangChain Expression Language）** 以 `|` 组合组件，支持**并行、批处理、流式、回退**。
   - 典型：**Stuff（全塞）、Map-Reduce、Refine、Map-Rerank** 四种文档问答链。

4. **Memory（记忆）**
   - **ConversationBuffer / Summary / BufferWindow** 等，**管理多轮对话上下文**。

5. **Agents 与 Tools**
   - **Tool**：把外部函数封装成模型可调用的能力。
   - **Agent**：模型**自主决定调用哪个工具、循环执行直到完成**（ReAct 模式）。

6. **Callbacks 与可观测性**
   - 埋点、日志、**Token 统计、链路追踪**（可对接 LangSmith 等）。

## 【问题】

基于 LangChain 的 RAG 流程是怎样的？

## 【回答】

**离线阶段（知识库构建 / Indexing）**：

1. **Load**：用 **Document Loader** 读取原始文档（PDF/MD/HTML/DB）。
2. **Split**：用 **Text Splitter** 切分为合适大小的 **Chunk**（需与 embedding 模型的上下文匹配，常配合 **chunk_overlap** 保留跨块语义）。
3. **Embed**：调用 **Embedding 模型**把每个 Chunk 转为向量。
4. **Store**：写入**向量数据库**并建索引（**FAISS / Milvus / Chroma** 等），同时保留 **metadata 与原文**以便溯源。

**在线阶段（Retrieval + Generation）**：

1. **Query 改写/扩展**：对用户输入做**同义扩展、HyDE、多查询**等（可选但常见）。
2. **Retrieve**：把 query 向量化后在向量库中做**相似度检索**，常配合 **Top-K + 阈值 + Rerank + 混合检索（BM25 + 向量）** 提升召回质量。
3. **Augment**：把检索到的 Chunk 作为**上下文**与问题一起填入 **Prompt Template**（并附**引用编号**）。
4. **Generate**：调用 **Chat Model**（如 **ChatGLM3**）生成答案，要求**只依据给定上下文作答、无法回答时明确拒答**。
5. **后处理**：**输出解析、引用溯源、格式化、安全过滤**。

**关键结论**：RAG 的效果瓶颈**往往不在生成端，而在检索端**——**切分策略、embedding 质量、召回与重排序**决定上限。

## 【衍生问题】

- 如何评估 RAG 系统？召回率与答案忠实度指标如何设计？（可对照 `大模型_RAG忠实度.md`）
- 多路召回 + Rerank 的具体实现与代价权衡？（待补充）

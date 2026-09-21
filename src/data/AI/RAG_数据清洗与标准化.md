---
category: RAG
topic: 数据清洗与标准化
type: bagu
tags: [RAG, 数据清洗, 去重, 标准化]
difficulty: medium
created: 2026-09-15
---
# 数据清洗与标准化

## 【问题】
文档解析之后、分块之前，RAG 的数据清洗与标准化一般要做哪些事？

## 【回答】
要点清单：

- **统一编码（UTF-8）**、去除不可见字符（如零宽字符 `\u200b`）。
- **合并多余空白与断行**，避免分块噪声。
- **全角半角、数字与单位格式统一**。
- **去重**：用 `MinHash`/`SimHash` 或 embedding 聚类识别近似重复。
- **PII 脱敏**（电话、身份证）按合规要求处理。

基础清洗示例（NFKC 归一化 + 去零宽 + 合并空白）：

```python
import re, unicodedata
def normalize_text(s: str) -> str:
    s = unicodedata.normalize("NFKC", s)
    s = s.replace("\u200b", "")
    s = re.sub(r"\s+", " ", s).strip()
    return s
```

## 【问题】
RAG 知识库里为什么要做去重？用什么方法？

## 【回答】
同一份知识常因复制、版本、格式差异产生**近似重复块**，会导致检索冗余、答案被重复片段主导。

- **MinHash**：估算集合 Jaccard 相似度，适合大规模文本/集合去重。
- **SimHash**：生成文档指纹（汉明距离判断近似重复），速度快。
- **embedding 聚类**：语义层聚类，能识别"表述不同但意思相同"的重复。
生产上常先用 MinHash/SimHash 快速筛候选，再精确判断。

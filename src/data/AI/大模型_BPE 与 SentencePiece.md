---
category: 大模型
topic: BPE 与 SentencePiece
type: bagu
tags: [Tokenizer, BPE, SentencePiece]
difficulty: medium
created: 2026-09-15
---
# BPE 与 SentencePiece

## 【问题】
BPE 是怎么构建词表的？为什么 LLM 常用子词而不是纯词？

## 【回答】
- **BPE（Byte Pair Encoding）**：从字符/字节基础符号开始，反复统计相邻符号对频率，**合并最高频的对**成新符号，迭代直到达到目标词表规模。
- 特点：平衡词级与字符级，未登录词可由子词拼出（如 "play"+"ing"）；GPT-2、RoBERTa 等常用。
- **子词而非纯词**：控制词表规模、处理 OOV、开放集词汇；纯词级词表巨大且稀疏。

## 【问题】
WordPiece 与 BPE 主要区别是什么？SentencePiece 为什么适合中文和多语言？

## 【回答】
- **WordPiece（BERT）**合并准则常基于"最大化语言模型似然"而非单纯最高频，实现略有差异；面试答"合并准则不同"即可。
- **SentencePiece 不依赖空格分词**，把整句当输入在原始字符串上学习子词（支持 BPE / Unigram），适合无空格语言（中文、日文）。
- Unigram 从大词表迭代删词，多语言友好；实践多用 SentencePiece + 大词表或字节级 BPE，并对领域语料再训词表。

## 【问题】
Tokenizer 不一致（训练 / 微调 / 推理用不同 tokenizer）会导致什么问题？

## 【回答】
- **id 错位、性能异常、语义碎片化**：同一文本在不同 tokenizer 下切出的 token 不同，embedding / 词表对不上。
- **微调与推理必须用同一套 tokenizer 与规则**，否则效果骤降；领域适配需谨慎重训词表。

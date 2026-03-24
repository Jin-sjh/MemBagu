# Tokenizer 与词元化技术

## 问题 1：为什么要出现 Special Token？

### 【问题】
为什么要出现 Special Token？

### 【回答】
在预训练阶段，模型在大量连续文本上进行训练，并不主动涉及到交互场景。而在 post training 阶段，大多数模型需要学习特定的交互方法，在此引入 special tokens 来划分交互过程的阶段。

**常见的 Special Token 应用场景：**

**1. 标记对话或文本的开头和结尾**
- `<|begin_of_text|>`：对话的开始
- `<|end_of_text|>`：对话的结束，和 `<|eot_id|>` 是类似的

**2. 区分角色**
- `<|start_header_id|>user<|end_header_id|>`：下面的内容来自 user
- `<|start_header_id|>assistant<|end_header_id|>`：下面的内容是 assistant 的回答
- `<|start_header_id|>system<|end_header_id|>`：表明 system prompt

**3. Function Calling**
- 部分模型会用 `<|tool_call|> ... ` 的形式，或以 JSON schema 发起函数调用

**4. 训练与使用注意事项**
- 这些 Special Tokens 需要在模型微调阶段就被明确定义且反复出现，从而让模型学会其含义
- 如果在推理时没有正确使用这些 special tokens，那么模型的效果将会大打折扣
- `add_special_tokens` 参数默认为 `True`
- decode 的时候，`skip_special_tokens` 则默认为 `False`，所以能够看到输出中包含 special tokens

### 问题难点分析
这个问题考察的是对大模型训练阶段和交互机制的理解。难点在于理解 pre-training 和 post-training 两个阶段的不同需求，以及 special token 在多阶段交互中扮演的角色。

### 面试官考察点
- **对大模型训练流程的理解**，是否清楚 pre-training 和 post-training 的区别。
- **对交互场景的认知**，是否理解模型从单向文本生成到双向交互的转变。
- **工程实践能力**，是否在实际应用中使用过 special token 来控制模型行为。

### 问题衍生
- 常见的 special token 有哪些（如 [BOS], [EOS], [PAD], [MASK] 等）？
- special token 在 tokenizer 中是如何处理的？
- 如何在 fine-tuning 阶段自定义 special token？
- special token 的 embedding 是如何初始化和训练的？

---

## 问题 2：BBPE 相较于 BPE 有什么好处？

### 【问题】
BBPE 相较于 BPE 有什么好处？

### 【回答】
BBPE (Byte-level BPE) 相比传统 BPE (Character-level BPE) 的优势主要体现在以下几个方面：

**1. 基础单元更少**
- 传统 BPE：基于 Unicode 字符，字符集大小超过 14 万
- BBPE：基于字节，固定 256 个字节单元

**2. 未知字符处理更优**
- 传统 BPE：经常出现 [UNK] 标记，无法处理词汇表外的字符
- BBPE：零 [UNK]，任何字符都可以用字节序列表示

**3. 内存占用更低**
- 传统 BPE：初始阶段较高，需要维护大规模字符集
- BBPE：极低，仅需 256 个基础字节单元

**4. 适应性更强**
- 传统 BPE：偏向于常见语言，对小语种支持不佳
- BBPE：全语言、全符号通用，对所有 Unicode 字符一视同仁

**5. 代表应用**
- 传统 BPE：BERT (WordPiece)、早起模型
- BBPE：GPT-2/3/4、Llama、Qwen 等现代大模型

### 问题难点分析
这个问题考察的是对 tokenizer 技术演进的理解。难点在于不仅要说出 BBPE 的优势，还要理解为什么字节级别的处理能解决字符级别的痛点。面试官可能追问"为什么 256 个字节就能表示所有字符"或"BBPE 的 merge 操作是如何进行的"。

### 面试官考察点
- **对 tokenizer 技术发展的了解**，是否知道从 BPE 到 BBPE 的演进。
- **对大模型预处理流程的理解**，tokenizer 选择对模型性能的影响。
- **工程实践能力**，是否真正动手处理过多语言数据，遇到过 OOV 问题。

### 问题衍生
- BBPE 的 merge 操作具体是如何进行的？
- 为什么现代大模型（GPT、Llama）都选择 BBPE？
- BBPE 在中文处理上有什么特殊优势或劣势？
- Tokenizer 的词表大小对模型性能有什么影响？

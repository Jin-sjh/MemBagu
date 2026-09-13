---
category: AI
topic: vLLM 推理加速原理
type: bagu
tags: [AI, vLLM, 推理加速, PagedAttention, Continuous Batching, 大模型]
difficulty: hard
created: 2026-09-13
---
# vLLM 推理加速原理

## 【问题】
vLLM 为什么快？不要只罗列 PagedAttention、Continuous Batching、CUDA Graph 等名词，请构造因果链。

## 【回答】
**vLLM 的优化对象不是模型结构，而是 Serving Runtime（推理服务运行时）**。回答应先给出因果链的地基，再展开机制。

**地基：decode 阶段是 memory-bound**。自回归解码每一步只处理 1 个 token/序列，计算量极小，但需要把整个模型权重从 HBM 读一遍，因此**单步耗时由访存决定，不由计算决定**。以 13B 模型 fp16（权重约 26 GB）在 A100 为例：读一遍权重约 13 ms（HBM 带宽约 2 TB/s），而 batch = 1 时的计算量约 2 × 13e9 = 26 GFLOP，按 150 TFLOPs 实测算力约 0.17 ms。**访存耗时约为计算耗时的 76 倍**，所以 batch 从 1 增长到几十的区间内单步时间几乎不变，**吞吐近似正比于能同时驻留的序列数**。这条性质是后续所有优化的立足点。

**两个系统约束把有效 batch size 往下拽**：

1. **KV Cache 随请求动态增长**。请求输出长度事先不可知，传统系统按最大长度预留连续显存，导致严重碎片。实测有效 token 只占已分配显存的 **20.4%–38.2%**，即 **60%–80% 被浪费**。
2. **静态批被最长序列锁死**。Static Batching（静态批）一旦成批，必须等最长序列生成完毕才释放资源，短序列生成完成后其 slot 空转，有效 batch 持续衰减。

**vLLM 用两项主攻机制分别顶回这两个约束**：

- **PagedAttention 解决显存约束**：把 KV Cache 按固定大小切块（默认 `block_size = 16`），通过**块表（block table）**把逻辑块映射到非连续的物理块，按需分配，浪费降至 **4% 以下**。同一张 A100（40GB）跑 ShareGPT 负载，有效 batch 从约 **7 提升到 30**。
- **Continuous Batching 解决调度约束**：调度粒度从「整个请求」降到「单个 iteration」，每生成一个 token 后重新组批，完成的序列立即释放 slot，等待队列中的请求下一步即可进入。

**这两项互为前提**：没有分页式管理，每步频繁扩缩的变长 KV 会把碎片放大，抵消调度收益；没有 iteration 级调度，仅靠分页装进来的请求依旧被长度不齐锁死。

**在此之上叠加的优化属同一 runtime 内的独立增量**，可按层次归类：

- 显存层：Prefix Caching（前缀缓存）、量化（FP8 / INT8）、KV Cache 量化
- 调度层：Chunked Prefill（分块预填充）、Prefill / Decode 分离、优先级调度
- 执行层：CUDA Graph、融合 Kernel（Fused Kernel）、FlashAttention
- 算法层：Speculative Decoding（投机解码）

**结论口径**：vLLM 论文报告的是「同等延迟水平下吞吐提升 2–4×」，且**长序列、大模型、复杂解码算法下提升更明显**。注意这是吞吐指标，不是单请求延迟优化。

## 【问题】
为什么说 decode 阶段提升 batch size 几乎不增加单步时间？

## 【回答】
因为 **decode 是 memory-bound 而非 compute-bound**。

**量化对照**（13B fp16 模型 / A100，HBM 带宽约 2 TB/s）：

| 项 | 计算方式 | 结果 |
|---|---|---|
| 单步访存 | 读取全部模型权重 | 约 26 GB → 约 13 ms |
| 单步计算（batch = 1） | 2 × 参数量 × 批内 token 数 | 约 26 GFLOP → 约 0.17 ms |

**访存耗时约为计算耗时的 76 倍**。在 batch 增长到几十之前，计算时间仍远小于访存时间，单步耗时基本保持不变；而每步产出的 token 数随 batch 线性增长，**因此吞吐随 batch 近似线性上升**。

由此可推出一个重要推论：**任何能提升显存利用效率、从而容纳更多并发序列的技术，都会直接转化为吞吐收益**。这正是 PagedAttention 的价值立足点——否则「减少碎片」只是省显存，与速度无关。

**注意前提边界**：该结论成立的条件是序列 KV 读取尚未成为访存主导项。当上下文很长、batch 很大时，KV Cache 自身的读取耗时会上升，吞吐增益随之收敛。

## 【问题】
PagedAttention 减少的是哪几类显存碎片？

## 【回答】
传统系统为每个请求按**最大可能长度**预留一整块连续显存，由此产生三类浪费：

1. **预留浪费（reservation waste）**：输出长度不可预知，按上限预留，未生成的 token 也占用显存。
2. **内部碎片（internal fragmentation）**：已分配的连续张量必须覆盖 0 到最大长度，而生成可能才到第 100 个 token，块内大片未填满。
3. **外部碎片（external fragmentation）**：请求完成释放后，空闲区域散落在地址空间中，新请求需要一整块连续空间时，总空闲量够但没有单块够大。

**PagedAttention 消掉的是第 1 类和第 3 类**：物理块按需分配、不需要连续，因此无需按上限预留，也不会产生无法利用的零散空洞。

**第 2 类无法完全消除，但被压到极小**：唯一的浪费只剩每个序列最后一个未填满块的空位，即**至多 `block_size - 1` 个 token**。这就是论文所称「近零浪费」以及「浪费低于 4%」的来源。

**`block_size = 16` 是论文的调优结果**：块太小则块表过大、访存寻址开销上升；块太大则最后一个块的内部浪费变多。16 是在这组权衡下的折中值。

## 【问题】
分页之后 attention 需要查块表做非连续访存，为什么系统整体反而更快？

## 【回答】
**必须区分算子级开销与系统级收益，这是本题的得分点**。

**算子级确实变慢了**：block table 的间接寻址与非连续物理块的 gather，使 attention kernel 自身延迟增加约 **20%–26%**（论文实测）。

**系统级收益远大于此**：并发 batch 提升带来的吞吐增益是 **2–4×**（同为论文口径）。即**用一个算子约 20% 以上的延迟代价，换取系统 2–4 倍的吞吐**。

**代价的缓解手段**：

- **融合 Kernel**：把 reshape、块表寻址与 attention 计算融合进单个 kernel，减少中间结果的访存与 kernel 启动开销。
- **后续路线 vAttention**：使用 CUDA 的 `cuMemMap` 系列 API，为每个序列分配连续虚拟地址、物理页按需映射。attention kernel 看到的仍是连续张量，**FlashAttention / FlashInfer 等现有内核无需改造成分页感知即可直接使用**，从而绕开分页带来的内核复杂度与可移植性问题。

## 【问题】
Continuous Batching 与经典 dynamic batching 有什么区别？

## 【回答】
**两者的批不可变性（immutability）不同，这是本质区别**。

| 维度 | 经典 Dynamic Batching | Continuous Batching |
|---|---|---|
| 触发方式 | 攒一个时间窗口（如 5 ms）或攒满 max batch | 无需积累窗口，请求可即时注入 |
| 调度粒度 | 请求级（request-level） | **迭代级（iteration-level）** |
| 派发之后 | 批不可变，GPU 算完为止 | 每个 decode step 后重新组批，可插可出 |
| 适用场景 | 定长负载（如图像分类） | **自回归生成这类长度高方差负载** |

**Continuous Batching 由 Orca（OSDI '22）提出，原名 iteration-level scheduling（迭代级调度）**：调度器以「一次 decoder 迭代」为单位调用引擎，两次迭代之间可以剔除刚产出 EOS 的序列，并从队列准入新请求。短请求在第 20 次迭代退出，队首请求在第 21 次迭代即补位，**GPU 不会为尾部序列 padding 空转**。

**Orca 的第二个贡献是 Selective Batching（选择性批处理），常被忽略但同样关键**：一步之内不同序列处于不同位置甚至不同阶段，张量形状参差，无法直接拼接成整齐的 batch matmul。Orca 的拆解方式是按算子类别切分：

- **线性层 / MLP / LayerNorm 与序列长度无关**，只作用于 hidden 维度，可把所有序列的 token 拍平成 `[总 token 数, d_model]`，作为一次融合 matmul 执行；
- **attention 依赖各自序列的历史**，必须拆开逐序列计算。

**attention 拆开不产生额外 IO 开销**，因为它只消费已生成的 Q / K / V 向量，不读取模型权重。

## 【问题】
PagedAttention 和 Continuous Batching 为什么必须配合使用？

## 【回答】
**两者互为前提，单独使用任何一个都会失效**。

**只有 Continuous Batching、没有分页管理**：迭代级调度意味着每个 step 都可能准入新请求、剔除完成请求，KV 显存频繁地变长申请与释放。在按最大长度预分配连续显存的方案下，**这种高频变长分配释放会把碎片问题放大**，显存很快耗散，调度腾挪出的并发度装不进去。

**只有 PagedAttention、没有迭代级调度**：分页管理把更多请求的 KV 装进了显存，但请求级调度仍让批被最长序列锁死，**装进来的序列照样在 slot 中空转**，有效 batch 依然上不去。

**因此论文把两者放在同一系统内实现**：PagedAttention 负责「装得下」，Continuous Batching 负责「用满」，二者共同把有效 batch size 顶到显存容量允许的上限。

## 【问题】
Chunked Prefill 解决什么问题？

## 【回答】
**解决 Continuous Batching 引入的 prefill–decode 干扰**。

混批之后，prefill 与 decode 会进入同一个 batch。若某个新请求带 10K token 的 prompt，**该 step 需要处理 10K 个 token 而非几十个**，单步耗时被拉到数百毫秒级；所有与之共批的 decode 请求在这一步被冻结，token 输出出现停顿，即 **TPOT（Time Per Output Token）抖动**。

**Chunked Prefill（出自 Sarathi-Serve）的做法**：把 prefill 请求按接近均等的计算量切成多个 chunk，在多次调度迭代中逐步完成，并把 decode 请求与新请求的一个或多个 prefill chunk 合并，构造**受 token 预算约束的混合批次**。这样每轮迭代的延迟上界可控，且几乎不受输入 prompt 总长度影响。

**本质是一次权衡**：用 TTFT（Time To First Token）换取 TPOT 的稳定与可预测。

**版本差异（加分项）**：在 vLLM V1 引擎的统一调度模型下，Chunked Prefill 是 token budget 切分的自然结果（`num_new_tokens = min(num_new_tokens, token_budget)`），不需要额外开关；Prefix Caching 在 V1 中深度集成于调度流程并默认开启。

## 【问题】
引用 vLLM 的吞吐提升数据时需要注意什么？

## 【回答】
**必须区分对比基线，不同基线的数字不可混用**。

| 数字 | 含义 | 基线 | 出处 |
|---|---|---|---|
| **2–4×** | 同等延迟水平下的吞吐提升 | FasterTransformer、Orca | vLLM 论文（SOSP '23）摘要 |
| **23×** | 吞吐提升 | naive static batching，OPT-13B / A100 | **Anyscale 自测博客，非论文数字** |
| **8×** | 吞吐提升 | naive batching（Ray Serve / TGI） | 同上 |
| **36.9×** | 同等延迟预算下吞吐提升 | FasterTransformer | Orca 论文（OSDI '22） |

**建议优先引用论文口径的 2–4×**，并明确说明是「同等延迟水平」下的**吞吐**对比，而非单请求延迟优化；引用 23× 时须说明其为 Anyscale 对朴素静态批的自测结果。**将不同基线的数字并列陈述是常见失分点。**

## 【难点分析】
- 本题是典型的「系统设计而非模型结构」类问题。第一层难点在于**先建立因果链再落名词**：若直接罗列 PagedAttention / Continuous Batching / CUDA Graph，会被追问「这些解决的是同一个问题吗」「各自在哪一层」，从而暴露理解深度不足。
- 第二层难点是**必须补上 memory-bound 这一地基**。多数回答跳过「为什么减少碎片能提速」，直接给结论，逻辑是断的。
- 第三层难点是**区分算子级与系统级代价**（分页使 attention kernel 自身变慢 20% 以上，但系统吞吐净增 2–4×），以及**区分论文口径与博客口径**的数字。

## 【考察点】
- **是否理解 LLM 在线推理的系统瓶颈**：KV Cache 显存管理与批调度，而非模型结构。
- **是否能构造因果链而非罗列名词**：从 memory-bound 出发，推导出「有效 batch size 决定吞吐」。
- **对 PagedAttention 机制细节的掌握**：块表映射、按需分配、copy-on-write、三类碎片的区分。
- **对 iteration-level scheduling 与 selective batching 分工的理解**。
- **数据引用的严谨性**：能否主动区分 2–4×（论文）与 23×（Anyscale）的基线差异。

## 【衍生问题】
- Prefix Caching 的块级哈希复用机制具体如何实现？（**待补充**）
- CUDA Graph 在 vLLM 中如何降低 CPU 侧 kernel 启动开销？piecewise CUDA Graph 是什么？（**待补充**）
- Speculative Decoding 的草稿模型与验证流程如何设计？vLLM 如何集成？（**待补充**）
- vLLM V0 与 V1 引擎在调度器设计上有哪些关键差异？（**待补充**）
- PagedAttention 如何通过 Copy-on-Write 支持 beam search 与 parallel sampling 的前缀共享？（**待补充**）
- Prefill / Decode 分离部署（PD 分离）解决了什么问题？（**待补充**）

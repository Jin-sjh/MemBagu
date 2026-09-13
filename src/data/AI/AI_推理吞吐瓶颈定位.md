---
category: AI
topic: 推理吞吐瓶颈定位
type: bagu
tags: [AI, vLLM, PagedAttention, 推理优化, 吞吐, Profiling, Nsight, 面试]
difficulty: hard
created: 2026-09-13
---

# 推理吞吐瓶颈定位

## 【问题】

显存还有很多，为什么吞吐上不去了？（面对一个显存仍有富余的 LLM 推理服务，如何定位吞吐瓶颈？）

## 【回答】

先说结论：**显存仍有余量，说明当前至少不显著是 memory-capacity bound（显存容量受限）**，因此不应该默认继续优化 PagedAttention —— **PagedAttention 解决的是 KV Cache 的内存管理、碎片与有效容量问题，属于容量维度**，在容量不是瓶颈时继续投入它不会带来吞吐提升。

定位顺序按「先判瓶颈类型，再看调度层，最后看 CPU 侧」三步走。

**第一步：用 profiler 判断 compute-bound 还是 memory-bandwidth-bound**

- **SM / Tensor Core 接近饱和** → compute-bound。此时**继续增大 batch 或优化 KV Cache 分配不会明显提高吞吐**，应转向降低计算量：量化（INT8/FP8）、更高效的 attention kernel（FlashAttention）、算子融合、投机解码等。
- **HBM bandwidth 接近饱和** → memory-bandwidth-bound。此时关注**访存效率**：attention、KV Cache 与权重的读写是否合并、是否重复搬运，以及 **kernel fusion**（融合以减少中间张量在 HBM 上的往返）。decode 阶段的大 batch 推理本身极易进入 bandwidth-bound。

**第二步：若 GPU Compute 与 Bandwidth 都没有打满**

说明 GPU 没有被喂饱，瓶颈更可能在调度与数据供给侧：

- 检查 **effective batch（有效批大小）**：并发请求数是否足够、KV Cache 显存上限是否压住了可并发数、序列长度分布是否导致长尾请求提前退出而使 batch 长期偏小。
- 检查 **vLLM scheduler 是否能持续形成足够大的 batch**：continuous batching 是否存在断流（新请求到达速度跟不上、队列空转），prefill 与 decode 的混跑策略是否造成相互抢占。
- 检查 **GPU timeline 是否存在大量 kernel gap**（GPU 空转区间）。这一步是区分后两类原因的分水岭：
  - **存在大量短 kernel** → 属于 kernel launch 开销 / 融合不足：做 **kernel fusion**，或用 **CUDA Graph** 把一串小 kernel 图化，消除逐 kernel 的 launch overhead。
  - **GPU 经常 idle** → 属于 CPU 侧供数不足：继续排查 **CPU scheduler、tokenization / detokenization、Python 与 kernel launch overhead**（如 Python 侧逐 token 采样、框架 await / 序列化开销），以及请求入队与网络传输路径。

一句话收口：**显存有余量只排除了容量瓶颈，下一步必须靠 profiler 把 compute / bandwidth / 调度 / CPU 四类瓶颈定量分开**，而不是继续在 KV Cache 分配上做默认优化。

## 【难点分析】

陷阱在于「优化直觉」：候选人看到 vLLM + PagedAttention 的显存数据，容易顺着显存优化往下答，而忽略了显存富余恰恰说明容量不是瓶颈。真正的考点是**能否先用 profiler 把瓶颈类型定量化，再决定优化方向**，而不是凭猜测挑一个热点模块继续优化。

## 【考察点】

- **瓶颈分类的清晰度**：能否区分 compute-bound、memory-bandwidth-bound、调度不足（GPU 未打满）三类，并说出各自的优化方向。
- **PagedAttention 的定位是否准确**：是否清楚它解决的是 KV Cache 的碎片与容量问题，而非吞吐上限。
- **profiling 落地能力**：是否知道用 Nsight Systems / Nsight Compute 观察 SM 占用率、HBM 带宽利用率与 timeline 上的 kernel gap。
- **对推理引擎调度机制的理解**：effective batch、continuous batching、prefill/decode 混跑与吞吐之间的关系。

## 【衍生问题】

- 如何用 Nsight Systems / Nsight Compute 区分 compute-bound 与 memory-bandwidth-bound？
- vLLM 的 continuous batching 与 dynamic batching 有什么区别？
- prefill 阶段与 decode 阶段的瓶颈类型有什么不同？
- 什么是 CUDA Graph，为什么它能减少 kernel launch overhead？
- 如何估算给定显存下的最大并发数与 KV Cache 上限？（另见 `AI_KV Cache 缓存机制.md`）
- PagedAttention 具体解决了哪些碎片问题，它与吞吐之间是什么关系？（详见 `AI_vLLM 推理加速原理.md`）
- Continuous Batching、Chunked Prefill、CUDA Graph 分别在哪个阶段起作用？（详见 `AI_vLLM 推理加速原理.md`）

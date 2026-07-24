---
category: TCP
topic: 拥塞控制
type: bagu
tags: [TCP]
difficulty: medium
created: 2026-07-24
---
# TCP 拥塞控制

## 【问题】
TCP 拥塞控制有哪些算法？各自的工作原理是什么？

## 【回答】
TCP 拥塞控制包含四个核心算法，它们共同作用，在不过载网络的前提下最大化传输效率：

### 1. 慢启动（Slow Start）
- TCP 连接刚建立时，发送方不知道网络的承载能力，于是从很小的拥塞窗口（cwnd）开始，通常初始值为 1-10 个 MSS。
- 每收到一个 ACK，cwnd 翻倍（指数增长），直到达到慢启动阈值（ssthresh）或发生丢包。
- **目的**：探测网络可用带宽，避免一开始就注入大量数据导致拥塞。

### 2. 拥塞避免（Congestion Avoidance）
- 当 cwnd >= ssthresh 时，进入拥塞避免阶段，cwnd 的增长从指数变为线性——每经过一个 RTT，cwnd 增加 1 个 MSS。
- **目的**：接近网络容量时降低增长速度，温和地探测额外可用带宽。

### 3. 拥塞发生（Congestion Detection / Fast Retransmit）
- 当发送方检测到丢包（超时重传或收到 3 个重复 ACK）时，认为网络发生拥塞。
- **超时重传（RTO）**：ssthresh = cwnd / 2，cwnd 重置为 1，重新进入慢启动。这是较严重的拥塞信号。
- **快速重传（3 个重复 ACK）**：ssthresh = cwnd / 2，cwnd = ssthresh + 3，进入快速恢复。说明网络还有一定的传输能力。

### 4. 快速恢复（Fast Recovery）
- 收到 3 个重复 ACK 后进入，不再把 cwnd 降到 1，而是将 cwnd 减半后继续线性增长。
- 每收到一个重复 ACK，cwnd += 1；收到新数据的 ACK 后，cwnd = ssthresh，回到拥塞避免阶段。
- **目的**：避免因为个别丢包就大幅降低发送速率，提升传输效率。

### 总结
这四个算法的协同流程是：慢启动（指数探测）→ 拥塞避免（线性探测）→ 丢包时快速重传/恢复（减半而非归零）→ 回到拥塞避免。整个过程通过 cwnd 和 ssthresh 两个核心变量来控制发送窗口大小。

# RMSNorm 均方根归一化

## 1. 计算效率更高（去除了均值计算）

### LayerNorm 的计算

LayerNorm 需要计算均值（μ）和方差（σ²），涉及两次逐元素操作：

$$
\mu = \frac{1}{D} \sum_{i=1}^{D} x_i, \quad \sigma^2 = \frac{1}{D} \sum_{i=1}^{D} (x_i - \mu)^2
$$

### RMSNorm 的计算

RMSNorm 仅计算均方根（RMS），无需均值中心化：

$$
\text{RMS} = \sqrt{\frac{1}{D} \sum_{i=1}^{D} x_i^2 + \epsilon}
$$

### 节省的计算量

- **均值计算**：减少一次求和操作。
- **方差计算**：避免对 $(x_i - \mu)^2$ 的逐元素减法。
- **实际训练中**：RMSNorm 可提速 **10%-30%**（尤其在大规模模型中显著）。

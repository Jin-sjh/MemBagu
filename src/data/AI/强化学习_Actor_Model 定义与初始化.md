# 强化学习 Actor Model 定义与初始化

## 【问题】
什么是 Actor Model？在 RLHF 中如何初始化 Actor Model？

## 【回答】
**Actor Model** 就是我们想要训练的目标语言模型。

**初始化方式**：我们一般用 SFT 阶段产出的 SFT 模型来对它做初始化。

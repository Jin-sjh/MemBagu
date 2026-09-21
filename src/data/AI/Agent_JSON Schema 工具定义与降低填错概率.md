---
category: Agent
topic: JSON Schema 工具定义与降低填错概率
type: bagu
tags: [Agent, Function Calling, JSON Schema]
difficulty: medium
created: 2026-09-15
---

# JSON Schema 工具定义与降低填错概率

## 【问题】
怎么用 JSON Schema 定义工具参数，并降低模型填错的概率？

## 【回答】
参数用 JSON Schema 描述**类型、范围、枚举、必填**；服务端设 `additionalProperties: false` 禁止多余字段，流式不完整时剥离未知键。降低填错概率：

- 减少可选参数的模糊性；
- **用 enum 代替自由文本**；
- 在 `description` 给示例；
- 避免深层嵌套；
- 必要时**拆成多个函数**。

失败时分层的校验：**语法层** `json.loads` → **结构层** `jsonschema.validate` → **语义层**业务函数（如用户 ID 是否存在）→ **安全层**鉴权与输入清洗。

## 【问题】
模型选错工具怎么办？

## 【回答】
工程上不能假设模型 100% 正确，做法：

1. **优化 description 与示例边界**，把易混淆工具的适用/不适用场景写进工具描述；
2. **工具路由缩小候选集**，只把路由命中的少数工具塞进 `tools`；
3. 执行前做**规则校验或二次确认**（参数合法性、金额/权限阈值）；
4. **高风险操作要求人类确认**（两阶段提交）；
5. **记录 bad case** 做 prompt 迭代与回归测试。

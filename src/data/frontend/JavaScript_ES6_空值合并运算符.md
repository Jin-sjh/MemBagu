# ES6 中的 ?? 空值合并运算符

## 【问题】
ES6 中的 ?? 运算符是什么？有什么作用？

## 【回答】

`??` 全称是**空值合并运算符**，它是 ES2020（ES11）新增的语法，作用是：

**只有当左侧的值是 `null` 或 `undefined` 时，才会返回右侧的默认值；其他所有值（`0`、`''`、`false`、`NaN`）都算有效值，直接返回左侧值。**

---

## 使用示例

```javascript
// ?? 的使用
const value1 = null ?? 'default';        // 'default'
const value2 = undefined ?? 'default';   // 'default'
const value3 = 0 ?? 'default';           // 0
const value4 = '' ?? 'default';          // ''
const value5 = false ?? 'default';       // false
const value6 = NaN ?? 'default';         // NaN

// 与 || 的对比
const value7 = null || 'default';        // 'default'
const value8 = 0 || 'default';           // 'default' (注意区别)
const value9 = '' || 'default';          // 'default' (注意区别)
```

---

## 核心区别

- **`||` 逻辑或**：只要左侧是** falsy 值**（`null`、`undefined`、`0`、`''`、`false`、`NaN`），就返回右侧
- **`??` 空值合并**：只有左侧是 `null` 或 `undefined` 时，才返回右侧

---

## 使用场景

当需要为变量提供默认值，但又希望保留 `0`、`''`、`false` 等有效值时，使用 `??` 更合适。

```javascript
// 设置默认值，但保留 0
const count = userCount ?? 10;  // userCount 为 0 时，结果仍是 0

// 如果用 || 会出错
const count = userCount || 10;  // userCount 为 0 时，结果变成 10（错误）
```

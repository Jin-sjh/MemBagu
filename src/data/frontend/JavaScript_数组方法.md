# 数组方法

## 【问题】
分类列举 JavaScript 数组方法，并说明哪些会改变原数组

## 【回答】

### 会改变原数组的方法

- `push()` - 末尾添加元素
- `pop()` - 删除末尾元素
- `shift()` - 删除首元素
- `unshift()` - 开头添加元素
- `splice()` - 添加/删除元素
- `sort()` - 排序
- `reverse()` - 反转数组

### 不改变原数组的方法

- `concat()` - 合并数组
- `slice()` - 截取数组
- `join()` - 连接为字符串
- `map()` - 映射新数组
- `filter()` - 过滤数组
- `reduce()` - 累计计算
- `some()` - 测试某些元素
- `every()` - 测试所有元素
- `find()` - 查找元素
- `findIndex()` - 查找索引
- `includes()` - 是否包含

## 【问题】
includes 比 indexOf 进步了哪些？

## 【回答】

核心区别在于对 NaN 的处理和底层比较算法：

- `indexOf` 用严格相等 `===` 比较，而 `NaN === NaN` 是 `false`，所以**找不到数组里的 NaN**，会返回 `-1`。
- `includes` 用 **SameValueZero** 算法，会把 `NaN` 视为和自身相等，所以**能正确判断数组是否包含 NaN**，返回 `true`。
- 另外，语义上 `includes` 更直观，专门用来判断"是否包含"，而 `indexOf` 主要是返回元素位置。

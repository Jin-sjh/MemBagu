---
category: JavaScript
topic: 数组方法
type: bagu
tags: [JavaScript, 数组, 数组方法, Map, Set, 深浅拷贝]
difficulty: hard
created: 2026-07-24
---
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

## 【问题】
for...in 循环的缺点是什么？

## 【回答】
缺点如下。

（1）数组的键名是数字，但是 for...in 循环以字符串作为键名。

（2）for...in 循环不仅遍历数字键名，还会遍历手动添加的其他键，甚至包括原型链上的键。

（3）某些情况下，for...in 循环会以任意顺序遍历键名。

总之，for...in 循环主要是为遍历对象而设计的，不适用于遍历数组。

## 【问题】
for...of 的优点是什么？

## 【回答】
优点如下。

（1）有着同 for...in 一样的简洁语法，但是没有 for...in 的缺点。

（2）不同于 forEach 方法，它可以与 break、continue 和 return 配合使用。

（3）提供了遍历所有数据结构的统一操作接口。

## 【问题】
一句话总结 for...in 和 for...of 的区别？

## 【回答】
for...in 主要用来遍历**对象的键名**，遍历数组时拿到的是字符串类型索引，还会遍历原型链上可枚举属性，一般只用于普通对象遍历；而 for...of 是 ES6 新增，遍历**可迭代对象的 value 值**，比如数组、字符串、Map、Set 等，无法直接遍历普通对象，不会遍历原型属性，遍历数组更安全规范，日常遍历集合优先使用 for...of。

## 【问题】
map 和 forEach 的区别？

## 【回答】

| 特性 | map | forEach |
|------|-----|---------|
| **返回值** | 返回一个**新数组**，长度与原数组一致，由回调函数的返回值组成 | 没有返回值（返回 `undefined`） |
| **用途** | 数组映射/转换（比如把数组每个元素加工成新值） | 纯遍历，只做副作用操作（比如打印、修改外部变量） |
| **链式调用** | 支持链式调用（因为返回数组，可接 `.filter()` / `.reduce()` 等） | 不支持链式调用 |
| **性能** | 理论上和 `forEach` 相近，但 `map` 因需创建新数组，内存开销略高 | 仅遍历，内存开销更低 |
| **能否中断** | 都不能用 `break` / `continue` 中断，只能通过 `return` 跳过当前回调（相当于 `continue`） | 同上 |

---

## 【问题】
reduce 适合什么场景？为什么不能用 forEach 写异步串行？

## 【回答】
`reduce` 把多项**折叠成一个结果**，适合求和、分组、索引化和状态聚合；它不是「更高级的循环」，复杂逻辑中滥用反而降低可读性。

```js
const total = items.reduce((sum, item) => sum + item.price, 0);
const byId = items.reduce((map, item) => {
  map[item.id] = item;
  return map;
}, {});
```

**关键结论：**

- 简单副作用用 `for...of` 或 `forEach`；需要 `break`、`continue`、`await` 顺序控制时优先用 `for...of`；
- **`forEach` 不会等待异步回调**：不要写 `items.forEach(async item => ...)` 来期待串行执行，回调里的 `await` 不会被 forEach 等待，多个异步会并发跑；
- 真的要异步顺序执行，应用 `for...of` + `await`，或 `reduce` 串起 Promise 链。

## 【问题】
slice 和 splice 有什么区别？为什么常被混淆？

## 【回答】
二者名字像但语义相反，是高频误区：

- **`slice(start, end)`**：**不修改原数组**，返回截取区间的**新数组**（浅拷贝片段）；
- **`splice(start, deleteCount, ...items)`**：**直接修改原数组**，删除/插入中间元素，并返回**被删除的元素**。

**关键结论：**

- 记忆点：`slice` = 切片（只读副本），`splice` = 拼接（改原数组）；
- 在 Vue/React 状态中要返回新数组做引用比较，`slice` 更安全；原地改 `splice` 要确认框架能感知变化，否则可能 UI 不更新。

## 【问题】
Map、Set 和普通对象该怎么选择？各自适合什么？

## 【回答】
选择依据不是「哪个更快」，而是键类型、唯一性、序列化需求和可读性：

- **`Map`**：任意类型键值映射，**保留插入顺序**，适合频繁增删和非字符串键；
- **`Set`**：唯一值集合，适合去重和成员判断；
- **普通对象**：适合结构化记录、JSON 交换和固定字段。

**关键结论：**

- 需要「键不是字符串」或「保留插入顺序、频繁增删」时优先 Map；
- 去重/成员判断用 Set：`new Set([1,1,2])` 直接去重；
- 对象适合固定字段的记录与 JSON 序列化，别什么都塞进 Map。

## 【问题】
Object.assign、Object.is、Object.entries 等常用静态方法有什么坑？

## 【回答】
常用 Object 静态方法及其注意点：

| API | 作用 | 注意 |
|---|---|---|
| `Object.is` | 比较两个值 | `NaN` 相等，`+0/-0` 不相等 |
| `Object.assign` | 复制可枚举自有属性 | **浅拷贝，会修改第一个参数** |
| `Object.entries` | 返回键值对数组 | 只包含可枚举自有属性 |
| `Object.values` | 返回属性值数组 | 只包含可枚举自有属性 |
| `Object.fromEntries` | 键值对转对象 | 常用于 Map/entries 转对象 |

**关键结论：**

- `Object.assign` 与对象展开都主要是**浅层复制**；
- `Object.is` **不是深比较**：两个内容相同但引用不同的数组仍不相等；
- 它们只处理可枚举自有属性，原型链/不可枚举属性不会进入 `entries`/`values`。

## 【问题】
浅拷贝和深拷贝的边界是什么？JSON.parse(JSON.stringify()) 有什么局限？

## 【回答】
变量保存的是**对象引用**，赋值和参数传递不会自动深拷贝。浅拷贝可用展开、`Object.assign`、`slice`；嵌套数据需结构化克隆或专用方案。

```js
const a = { count: 1 };
const b = a;
b.count = 2; // a.count === 2，引用共享
```

**关键结论：**

- `JSON.parse(JSON.stringify(x))` 会**丢失函数、`undefined`、`Symbol`、日期、循环引用**等信息，不能当作通用深拷贝；
- 展开/`Object.assign` 只复制一层，嵌套对象仍是浅拷贝（共享引用）；
- 真正的深拷贝要按数据类型选择结构化克隆（`structuredClone`）或专用库，并谨慎处理循环引用。

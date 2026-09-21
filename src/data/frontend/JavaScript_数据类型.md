---
category: JavaScript
topic: 数据类型
type: bagu
tags: [JavaScript, 数据类型, 类型转换, Symbol, 基本类型, 运算符]
difficulty: hard
created: 2026-07-24
---
# 数据类型

## 【问题】
JavaScript 有哪些数据类型？如何判断数据类型？

## 【回答】
**基本数据类型：**

1. `undefined`
2. `null`
3. `boolean`
4. `number`
5. `string`
6. `symbol` (ES6)
7. `bigint` (ES2020)

**引用数据类型：**

- `object` (包括数组、函数、日期等)

---

## 【问题】
typeof 与 instanceof 的区别是什么？

## 【回答】
在 JavaScript 中，判断一个变量的类型可以用 typeof。

（1）如果是数字类型，typeof 返回的值是 number。比如 typeof(1) 返回的值是 number。

（2）如果是字符串类型，typeof 返回的值是 string。比如 typeof("123") 返回的值是 string。

（3）如果是布尔类型，typeof 返回的值是 boolean。比如 typeof(true) 返回的值是 boolean。

（4）如果是对象、数组、null，typeof 返回的值是 object。比如 typeof(window)、typeof(document)、typeof(null) 返回的值都是 object。

（5）如果是函数类型，typeof 返回的值是 function。比如 typeof(eval)、typeof(Date) 返回的值都是 function。

（6）对于不存在的变量、函数或者 undefined，将返回 undefined。比如 typeof(abc)、typeof(undefined) 都返回 undefined。

在 JavaScript 中，instanceof 用于判断某个对象是否被另一个类构造（也就是说，是否是该类的实例化对象）。

当使用 typeof 运算符判断引用类型存储值时，会出现一个问题，无论引用的是什么类型的对象，它都返回"object"。ECMAScript 引入了另一个 Java 运算符 instanceof 来解决这个问题。与 typeof 运算符相似，instanceof 运算符用于识别正在处理的对象的类型。与 typeof 方法不同的是，instanceof 方法要求开发者明确地给出对象的特定类型。

---

## 【问题】
请解释以下表达式的结果：
```javascript
var undefined;
undefined == null; // true
1 == true;         // true
2 == true;         // false
0 == false;        // true
0 == '';           // true
NaN == NaN;        // false
[] == ![];         // true
[] == []           // false
```

## 【回答】
**1. `undefined == null` // true**
- 这是 JavaScript 规范中的特殊规定：`undefined` 和 `null` 在宽松相等比较时被认为相等
- 但它们与其他值比较时都不相等

**2. `1 == true` // true**
- 布尔值 `true` 会被转换为数字 1
- 然后比较 `1 == 1`，结果为 true

**3. `2 == true` // false**
- 布尔值 `true` 转换为数字 1
- 比较 `2 == 1`，结果为 false

**4. `0 == false` // true**
- 布尔值 `false` 转换为数字 0
- 比较 `0 == 0`，结果为 true

**5. `0 == ''` // true**
- 空字符串 `''` 会被转换为数字 0
- 比较 `0 == 0`，结果为 true

**6. `NaN == NaN` // false**
- `NaN`（Not a Number）是 JavaScript 中唯一一个不等于自身的值
- 这是 IEEE 754 浮点数标准的规定
- 判断 NaN 应该使用 `isNaN()` 或 `Number.isNaN()`

**7. `[] == ![]` // true**
- 首先计算 `![]`，空数组是 truthy 值，`![]` 结果为 `false`
- 然后比较 `[] == false`
- 空数组 `[]` 转换为原始值是空字符串 `''`
- 空字符串 `''` 转换为数字是 0
- `false` 转换为数字是 0
- 最终比较 `0 == 0`，结果为 true

**8. `[] == []` // false**
- 数组是引用类型，两个空数组指向不同的内存地址
- 引用类型比较的是内存地址，而不是内容
- 所以结果为 false

**总结：**
- `==` 是宽松相等，会进行隐式类型转换
- `===` 是严格相等，不会进行类型转换，类型不同直接返回 false
- 建议在实际开发中优先使用 `===` 避免隐式转换带来的意外结果

---

## 【问题】
用什么方法来判断一个对象的数据类型？如何判断数组？

## 【回答】
用 `typeof` 判断对象类型，可以准确地检测值类型（有人也叫原始类型或基本类型）数据，用 `instanceof` 判断是不是数组。

---

## 【问题】
说出几个常见的 JavaScript 内置对象，并指出它们的优点。

## 【回答】
常见的 JavaScript 内置对象包括：Object、Array、String、Number、Boolean、Date、Function。

**优点：**
- 可以方便地使用一些方法和常量
- 例如 String 里面就有很多字符串函数（如 `split()`、`substring()`、`indexOf()` 等）
- Date 可以处理时间相关的操作（如获取当前时间、格式化日期、计算时间差等）
- Array 提供了丰富的数组操作方法（如 `map()`、`filter()`、`reduce()` 等）
- 这些内置对象都经过高度优化，性能可靠，且跨浏览器兼容性好

---

## 【问题】
基本类型和引用类型有什么区别？

## 【回答】

| 对比维度 | 基本数据类型 | 引用数据类型 |
|---------|-------------|-------------|
| **存储位置** | 栈内存（直接存值） | 栈中存「地址引用」，堆内存中存「真实数据」 |
| **赋值方式** | 拷贝值（新变量和原变量互不影响） | 拷贝地址（新变量和原变量指向同一个堆内存数据） |
| **比较方式** | 比较值本身是否相等 | 比较引用地址是否指向同一个对象 |
| **可变性** | 不可变（值本身无法修改，只能重新赋值） | 可变（可以直接修改对象内部属性） |

**详细说明：**

**1. 存储位置**
- 基本类型：直接存储在栈内存中，变量保存的就是值本身
- 引用类型：栈内存存储的是指向堆内存的地址引用，真实数据存储在堆内存中

**2. 赋值方式**
```javascript
// 基本类型 - 拷贝值
let a = 10;
let b = a;
b = 20;
console.log(a); // 10，a 不受影响

// 引用类型 - 拷贝地址
let obj1 = { name: 'Tom' };
let obj2 = obj1;
obj2.name = 'Jerry';
console.log(obj1.name); // 'Jerry'，obj1 也被修改了
```

**3. 比较方式**
```javascript
// 基本类型比较值
let x = 10;
let y = 10;
console.log(x === y); // true

// 引用类型比较地址
let arr1 = [1, 2, 3];
let arr2 = [1, 2, 3];
console.log(arr1 === arr2); // false，不同地址
console.log(arr1 === arr1); // true，相同地址
```

**4. 可变性**
- 基本类型的值是不可变的，修改时会创建新的值
- 引用类型的对象是可变的，可以修改其属性而不改变引用地址

## 【问题】
const 声明的对象能被修改吗？

## 【回答】
**不能修改的是"绑定"，不是"对象内容"。** `const` 只禁止变量重新指向其他值，不会冻结对象内部。

```javascript
const user = { name: 'A' };
user.name = 'B';   // 可以，对象内部属性仍可修改
// user = {};      // 不可以，不能重新绑定
```

若要让对象真正不可变，需要 `Object.freeze` 或不可变数据策略。**误区**：认为 `const` 让对象不可变——正确理解是只保护绑定，需 `Object.freeze` 才能限制修改。

## 【问题】
== 和 === 有什么区别？Object.is 又有什么不同？

## 【回答】
**=== 严格相等**：不进行类型转换，类型和值都相等才为真。

**== 宽松相等**：允许按规范进行类型转换，规则复杂，容易掩盖输入错误，工程上默认使用 `===`。

```javascript
'2' == 2;   // true：发生类型转换
'2' === 2;  // false：类型不同
```

`Object.is` 与 `===` 的主要差异在 **NaN 和 +0/-0**：
- `Object.is(NaN, NaN)` 为 true（而 `NaN === NaN` 为 false）；
- `Object.is(0, -0)` 为 false（而 `0 === -0` 为 true）。

判断是否为 `NaN` 应优先用 `Number.isNaN`，不要使用会先隐式转换的全局 `isNaN`。

## 【问题】
typeof null 为什么返回 "object"？

## 【回答】
这是 **历史兼容性行为**，不代表 `null` 是普通对象。

```javascript
typeof null === 'object'; // 历史兼容性行为，不代表 null 是普通对象
```

`typeof` 只能提供有限分类：数组、`null`、日期等都返回 `object`，无法准确区分所有类型。因此判断数组要用 `Array.isArray`，判断具体对象类型可用 `Object.prototype.toString.call`。**不要把 `typeof null === 'object'` 当作 "null 是对象" 的依据。**

## 【问题】
Symbol 是什么？有什么使用场景？

## 【回答】
**Symbol 是唯一的原始值**，适合在不确定对象已有属性名时创建不会意外冲突的键：

```javascript
const internalId = Symbol('internalId');
const user = { [internalId]: 42 };
user[internalId]; // 42
```

特点：
- **同一个描述不代表同一个 Symbol**：`Symbol('id') !== Symbol('id')`；
- 需全局共享时用 `Symbol.for('id')`，并用 `Symbol.keyFor` 反查注册键；
- Symbol 属性**不会被 `Object.keys` / `for...in` 枚举**，可用 `Object.getOwnPropertySymbols` 或 `Reflect.ownKeys` 获取。

注意它不是"私有属性"或安全边界：拿到 Symbol 引用后仍可访问，且反射 API 可发现它。

## 【问题】
for...in 和 for...of 有什么区别？

## 【回答】
**for...in 遍历可枚举的属性名（键）**，可能包含继承属性，不适合直接遍历数组（得到的是索引字符串，且可能受原型影响）。

**for...of 遍历可迭代对象产生的值**，适合数组、字符串、`Map`、`Set`。

不要认为两者都是"遍历数组"——**前者遍历键，后者遍历值**。遍历对象自身属性可用 `Object.keys` + `for...of`；`while` 适合循环次数未知但终止条件明确的场景。

## 【问题】
JavaScript 的数字有什么精度问题？

## 【回答】
`number` 使用**双精度浮点数**，不能精确表示所有十进制小数（如 `0.1 + 0.2 !== 0.3`）。

- **NaN** 是唯一不等于自身的值（`NaN === NaN` 为 false），判断用 `Number.isNaN` / `Object.is`；
- 涉及金额、精确大整数等场景，应采用**整数最小单位、`BigInt` 或专用库**，且它们不能直接混合运算；
- 存在 `-0`（`Object.is(0, -0)` 为 false，`===` 下 `0 === -0` 为 true）。


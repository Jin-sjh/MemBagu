# ES6+ 新特性

【问题】列举 10 个 ES6+ 的重要新特性

【回答】

块级箭模解，默展类模诺，符步链空大，全局

1. **let/const** - 块级作用域变量声明

2. **箭头函数** - `() => {}` 简洁语法，无自己的 `this`

3. **模板字符串** - \`Hello ${name}\` 支持插值

4. **解构赋值** - `const {a, b} = obj`

5. **默认参数** - `function(a = 1) {}`

6. **展开/剩余运算符** - `...arr` / `function(...args)`

7. **类语法** - `class` 关键字

8. **模块化** - `import/export`

9. **Promise** - 异步编程解决方案

10. **Symbol/Map/Set** - 新的数据类型

11. **async/await** - 更优雅的异步处理

12. **可选链** - `?.` 安全访问属性

13. **空值合并** - `??` 提供默认值

14. **BigInt** - 大整数支持

15. **全局对象标准化** - `globalThis`

16. 手写代码题

## 【问题】
箭头函数与普通函数的区别？

## 【回答】
1. 语法更加简洁、清晰。

2. 箭头函数的 this 默认指向定义它时，所处的上下文的对象的 this 指向，并且即使是 call、apply、bind 等方法也不能改变箭头函数 this 指向。

3. 如果箭头函数是全局函数（外层没有函数包裹）
   a. 在没有使用严格模式的情况下，它的 this 指向的是 window。
   b. 如果开启了严格模式，它的 this 指向 undefined。

4. 箭头函数是没有显示原型 prototype 的，所以不能作为构造函数，也不能使用 new 来创建对象。
   a. 因为在 new 的过程当中，构造函数的 prototype 属性需要赋值给 new 出来的实例对象的 _proto_ 属性，但是箭头函数没有 prototype 属性，所以没有办法作为构造函数。

5. 箭头函数没有自己的 arguments，如果存在函数嵌套，箭头函数会沿着作用域链向上获取外层函数的 arguments 的值。

## 【问题】
?? 和 || 的区别是什么？

## 【回答】
**?? (空值合并运算符):** 只有左值等于 `undefined` 和 `null` 才会返回右值

**|| (逻辑或运算符):** 只有左值为 `false` 时才会返回右值（包括 `false`、`0`、`''`、`null`、`undefined`、`NaN`）

**示例:**
```javascript
0 ?? 'default'  // 0 (0 不是 null/undefined)
0 || 'default'  // 'default' (0 是 falsy)

'' ?? 'default' // '' (空字符串不是 null/undefined)
'' || 'default' // 'default' (空字符串是 falsy)

null ?? 'default' // 'default'
null || 'default' // 'default'
```

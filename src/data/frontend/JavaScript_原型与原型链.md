---
category: JavaScript
topic: 原型与原型链
type: bagu
tags: [JavaScript, 原型, 原型链, new, instanceof, 继承]
difficulty: medium
created: 2026-07-24
---
# 原型与原型链

## 【问题】
prototype（原型）是什么？它是如何使用的？

## 【回答】
每个函数都有一个 prototype 属性，它是一个引用变量，默认指向一个空 Object 对象。当调用一个对象的函数或者属性的时候，如果在当前对象里面找不到，那么就到原型对象里面逐级寻找。

## 【问题】
如何理解 JavaScript 原型链？

## 【回答】
JavaScript 中的每个对象都有一个 prototype 属性，称为原型，而原型的值也是一个对象，因此它也有自己的原型，这样就串联起了一条原型链。原型链的链头是 object，它的 prototype 比较特殊，值为 null。

原型链的作用是对象继承。函数 A 的原型属性（prototype property）是一个对象，当把这个函数作为构造函数来创建实例时，该函数的原型属性将作为原型赋值给所有对象实例，比如新建一个数组，数组的方法便从数组的原型上继承而来。

当访问对象的一个属性时，首先查找对象本身。若找到，则返回；若未找到，则继续查找其原型对象的属性（如果还找不到，实际上还会沿着原型链向上查找，直到根）。只要没有被覆盖，对象原型的属性就能在所有的实例中找到，若整个原型链都未找到，则返回 undefined。

## 【问题】
解释原型和原型链的概念

## 【回答】
**原型：**
- 每个函数都有一个 `prototype` 属性，指向原型对象
- 原型对象包含共享的属性和方法
- 实例通过 `__proto__` 访问其构造函数的原型

**原型链：**
- 当访问对象属性时，如果对象本身没有，会通过 `__proto__` 向上查找
- 直到找到 `Object.prototype`（顶层原型，`__proto__` 为 `null`）
- 这种链式查找机制称为原型链

## 【问题】
JavaScript 原型链的核心规则

## 【回答】
1. **所有函数**的 `__proto__`（隐式原型），都指向 `Function.prototype`（函数的原型对象）。

2. **所有普通对象**的 `__proto__`，都指向其构造函数的 `prototype`（显式原型）。

3. **所有原型链的终点**都是 `Object.prototype`，它的 `__proto__` 为 `null`。

## 【问题】
用一段话精准总结 new 一个构造函数的执行过程

## 【回答】
当执行 `new 构造函数 ()` 时，JS 引擎会**先创建一个空的全新对象**，将这个空对象的原型指向构造函数的 `prototype`，再把构造函数内部的 `this` 绑定到这个新对象上，然后执行构造函数体内的代码给对象赋值，最后如果构造函数没有手动返回对象/函数，就自动返回这个新创建的实例对象。

**总结**

核心四步：**创建空对象** → **关联原型** → **绑定 this** → **执行赋值** → **返回实例**。

## 【问题】
区分作用域链与原型链

## 【回答】
作用域链和原型链是 JS 中两种完全不同的查找机制，**作用域链主要用于变量和函数的查找**，基于词法作用域，由函数嵌套关系形成，查找时从当前局部作用域逐层向外层作用域直至全局作用域检索；而**原型链用于对象属性和方法的查找**，基于对象的 `__proto__` 原型引用形成继承链路，实例自身没有的属性方法，会顺着原型对象向上查找，最终到 `Object.prototype` 直至 `null`。简单来说，作用域链管变量访问，原型链管对象属性与方法继承，二者底层结构、作用场景完全不同。

## 【问题】
为什么需要原型？方法放在原型上有什么好处？

## 【回答】
若把相同方法分别写在每个对象上，每个对象都会拥有一份不同的函数值，**既重复占用资源，也不利于统一修改**。

原型机制把"对象独有的数据"和"多个对象共享的行为"分开：方法放到原型对象上，实例通过原型委托访问同一份方法。

```javascript
function User(name) { this.name = name; }
User.prototype.sayHi = function () { return `hi ${this.name}`; };
const u1 = new User('Tom');
const u2 = new User('Jack');
u1.sayHi === u2.sayHi; // true，共享同一个函数
```

核心收益：**方法共享、表达对象关系、不复制属性即可完成委托式继承**。

## 【问题】
prototype、__proto__ 和 constructor 有什么区别？

## 【回答】
- **prototype**：函数对象上的数据属性，用作构造实例的原型对象。
- **__proto__**：访问对象内部 `[[Prototype]]` 的历史访问器，不建议作为通用业务 API（应改用 `Object.getPrototypeOf` / `Object.create`）。
- **constructor**：通常是原型对象上指回构造函数的**普通属性**，不是引擎永久维护的魔法指针。

函数默认创建的 `User.prototype` 通常有 `constructor: User`；如果整体替换为没有该属性的普通对象，它会沿原型链找到 `Object.prototype.constructor`：

```javascript
function User() {}
User.prototype = { sayHi() {} };
User.prototype.constructor === Object; // true
```

## 【问题】
instanceof 的原理是什么？它一定可靠吗？

## 【回答】
`value instanceof Ctor` 检查 **`Ctor.prototype` 是否出现在 `value` 的原型链上**，判断的是原型链关系，不是"对象是否由某构造函数唯一创建"。简化实现即沿 `value` 的原型链向上找，遇到 `Ctor.prototype` 返回 true。

它**不绝对可靠**：跨 Realm（如 iframe）对象、被手动修改的 `prototype`、以及自定义的 `Symbol.hasInstance` 都可能影响结果。判断类型名不应依赖 `instanceof`。

## 【问题】
class 和原型是什么关系？class 彻底脱离原型模型了吗？

## 【回答】
没有。`class` 只是提供更清晰语法，实例方法通常**仍放在原型上**，静态方法放在构造函数上。类语法对构造、方法、继承、私有字段提供封装，但没有消灭原型模型。

注意：`class` 方法默认**不可枚举**，类构造函数**必须通过 `new` 调用**，这些与手写构造函数行为并不完全相同。数组的 `arr.toString` 通常先命中 `Array.prototype.toString`，而非 `Object.prototype.toString`。

## 【问题】
new 和 Object.create 有什么区别？

## 【回答】
**`new Ctor()`**：创建对象、把 `[[Prototype]]` 设为 `Ctor.prototype`、以新对象为 `this` 执行构造函数、并根据显式返回值决定结果。

**`Object.create(proto)`**：只创建一个新对象并把其 `[[Prototype]]` 设为 `proto`，**不会执行构造函数，也不会自动初始化实例字段**。

无原型对象 `Object.create(null)` 适合纯字典场景（避免继承 `toString` 等），但失去常见对象方法。二者不等同。

## 【问题】
构造函数显式返回对象或基本类型时，new 的结果分别是什么？

## 【回答】
**显式返回对象会覆盖默认实例**；**返回基本类型则被忽略**，仍返回新创建的实例。即返回值是对象/函数则用它，否则用新实例：

```javascript
function A() { this.x = 1; return { x: 2 }; }
function B() { this.x = 1; return 2; }
new A().x; // 2，返回对象覆盖实例
new B().x; // 1，基本类型被忽略
```

手写 `myNew` 也遵循此规则（result 为 object/function 时返回 result，否则返回新 obj）。

## 【问题】
为什么不能把可变的数组/对象直接放在原型上？

## 【回答】
因为原型上的属性被**所有实例共享**，写在原型上的数组/对象会被实例共享，修改一个实例可能影响全部实例：

```javascript
function User() {}
User.prototype.list = [];
const a = new User();
a.list.push(1); // 其它实例的 list 也受影响
```

正确做法：**实例独有状态放在构造函数中**（`this.list = []`），共享方法放原型。可变数据不要直接放原型，避免跨实例污染。

---
category: JavaScript
topic: this 指向
type: bagu
tags: [JavaScript, this, 箭头函数, 绑定, call/apply/bind, 作用域]
difficulty: hard
created: 2026-07-24
---
# JavaScript this 指向

## 【问题】
解释 JavaScript 中 this 的指向规则

## 【回答】
this 的指向取决于函数的调用方式：

**1. 默认绑定：** 独立函数调用，this 指向全局对象（严格模式下为 undefined）

```javascript
function foo() {
  console.log(this); // 浏览器中为 window
}
foo();
```

**2. 隐式绑定：** 作为对象方法调用，this 指向调用对象

```javascript
const obj = {
  name: 'Alice',
  sayName: function() {
    console.log(this.name);
  }
};
obj.sayName(); // "Alice"
```

**3. 显式绑定：** 通过 call、apply、bind 指定 this

```javascript
function greet() {
  console.log(
    `Hello, ${this.name}`
  );
}
const person = { name: 'Bob' };
greet.call(person); // "Hello, Bob"
```

**4. new 绑定：** 构造函数调用，this 指向新创建的对象

```javascript
function Person(name) {
  this.name = name;
}
const p = new Person('Charlie');
console.log(p.name); // "Charlie"
```

**5. 箭头函数：** 没有自己的 this，继承外层作用域的 this

```javascript
const obj = {
  name: 'Dave',
  sayName: () => {
    console.log(this.name); // 取决于外层作用域
  }
};
obj.sayName(); // 可能不是 "Dave"
```

## 【问题】
this 为什么会"丢失"？怎么防？

## 【回答】

### (1) this 丢失的本质

JS 中 this 的指向**不是由函数定义的位置决定，而是由函数调用的方式 / 上下文决定**。当函数的调用上下文发生改变（脱离了原本的对象），this 就会丢失，默认指向 window（非严格模式）或 undefined（严格模式）。

### (2) 常见丢失场景

- **回调函数中**：比如 setTimeout、事件监听、数组方法（forEach / map）中传入对象方法；
- **函数赋值**：把对象方法赋值给一个变量，再单独调用；
- **普通函数调用**：脱离对象的独立调用。

### (3) 4 种解决方案（按优先级排序）

1. **箭头函数**：箭头函数不绑定自己的 this，继承外层作用域的 this，是最简洁的方案；

2. **bind() 硬绑定**：`fn.bind(obj)` 永久绑定 this 为 obj，无法被 call / apply 修改；

3. **call() / apply() 临时绑定**：`fn.call(obj, args)` / `fn.apply(obj, args)` 临时指定 this，仅本次调用生效；

4. **变量缓存（that = this）**：在函数内部用 `const that = this` 缓存，在内部函数中使用 that，兼容性最好。

### 面试加分点

- 箭头函数的 this 是**词法作用域**，在定义时就确定了，不会改变；
- `bind` 是 ES5 的方法，会返回一个新函数，原函数的 this 不会被修改；
- 严格模式下，普通函数调用的 this 为 `undefined`，非严格模式为 `window`，这是丢失后最常见的表现。

## 【问题】
下面的代码将输出什么内容到控制台？为什么？

```javascript
var myObject = {
    foo: "bar",
    func: function() {
        var self = this;
        console.log("outer func:  this.foo = " + this.foo);
        console.log("outer func:  self.foo = " + self.foo);
        (function() {
            console.log("inner func:  this.foo = " + this.foo);
            console.log("inner func:  self.foo = " + self.foo);
        }());
    }
};
myObject.func();
```

## 【回答】

**输出结果：**

```
outer func:  this.foo = bar
outer func:  self.foo = bar
inner func:  this.foo = undefined
inner func:  self.foo = bar
```

**原因分析：**

1. **外部函数 (outer func)**：
   - `this.foo` 输出 `bar`：因为 `func` 是通过 `myObject.func()` 调用的，this 指向 `myObject`，所以 `this.foo` 等于 `"bar"`
   - `self.foo` 输出 `bar`：`self` 被赋值为 `this`，所以 `self.foo` 也是 `"bar"`

2. **内部立即执行函数 (inner func)**：
   - `this.foo` 输出 `undefined`：这是一个**立即执行函数(IIFE)**，它作为普通函数被调用，this 指向全局对象（浏览器中是 `window`）。由于 `var foo` 定义在 `myObject` 中，全局对象上没有 `foo` 属性，所以输出 `undefined`
   - `self.foo` 输出 `bar`：`self` 是通过闭包捕获的外部变量，仍然指向 `myObject`，所以 `self.foo` 仍然是 `"bar"`

**核心考点：**

这道题考察了 JavaScript 中 this 指向的两个关键知识点：
- **隐式绑定**：对象方法调用时 this 指向该对象
- **默认绑定**：普通函数调用时 this 指向全局对象（非严格模式）
- **闭包**：内部函数通过作用域链访问外部变量 `self`

## 【问题】
说出以下程序的运行结果。

```javascript
(function() {
    console.log([
        (() => this.x).bind({ x: 'inner' })(),
        (() => this.x)()
    ])
}).call({ x: 'outer' });
```

## 【回答】

**结果为 `['outer', 'outer']`。**

**原因分析：**

这道题考察箭头函数的 `this` 绑定特性：

1. **箭头函数的 this 特性**：箭头函数没有自己的 `this`，它的 `this` 继承自外层作用域（词法作用域），在定义时就确定了，且**无法通过 `bind`、`call`、`apply` 改变**。

2. **代码执行分析**：
   - 外层是一个立即执行函数(IIFE)，通过 `.call({ x: 'outer' })` 调用，所以外层函数内的 `this` 指向 `{ x: 'outer' }`
   - 第一个箭头函数 `(() => this.x).bind({ x: 'inner' })()`：
     - 虽然使用了 `bind({ x: 'inner' })`，但箭头函数的 `this` 无法被改变
     - 它仍然继承外层作用域的 `this`，即 `{ x: 'outer' }`
     - 所以返回 `'outer'`
   - 第二个箭头函数 `(() => this.x)()`：
     - 同样继承外层作用域的 `this`，即 `{ x: 'outer' }`
     - 所以返回 `'outer'`

3. **最终结果**：两个箭头函数都返回 `'outer'`，所以输出 `['outer', 'outer']`

**核心考点：**
- 箭头函数的 `this` 是词法绑定的，定义时确定，运行时不可改变
- `bind`、`call`、`apply` 对箭头函数的 `this` 绑定无效
- 箭头函数与普通函数在 `this` 处理上的本质区别

## 【问题】
this 的绑定优先级是怎样的？

## 【回答】
判断 `this` 应按以下顺序（从高到低）：

**`new` 绑定 / 显式绑定（但 new 与 bind 有特殊组合）> 隐式绑定（对象调用）> 默认绑定（独立调用）**。

箭头函数是例外，它**没有自己的 `this`**，不参与这套动态绑定，而是在定义时捕获外层词法 `this`。简单记：先看是否 `new`，再看 `call`/`apply`/`bind`，再看 `obj.xxx()`，最后才是独立调用（非严格模式 `window` / 严格模式 `undefined`）。

## 【问题】
函数被 bind 之后，还能用 call/apply 改变 this 吗？用 new 调用呢？

## 【回答】
**普通调用时不能**：`bind` 返回的新函数已固定 `this`，`call`/`apply` 无法覆盖。

**作为构造函数 `new` 调用时，实例绑定优先于 bind 保存的 this**。例如 `User.bind({ name: 'bound' })` 后 `new fixed()`，得到的 `instance.name` 是构造函数体内的 `'instance'`，而非 `'bound'`（`bind` 预置的参数仍可能生效）。这是 bind 与 new 的特殊交互。

## 【问题】
箭头函数为什么不能作为构造函数用 new？

## 【回答】
因为箭头函数**没有自己的 `[[Construct]]` 语义和构造能力**，也没有 `prototype`。同时它的 `this` 是词法捕获的、不可被 `call`/`apply`/`bind` 重写，所以 `new (() => {})` 会报错。

需要动态接收调用者（如对象方法、构造函数）时应使用普通函数；回调需要继承外层 `this` 时用箭头函数。不要为"看起来简洁"把所有函数改成箭头函数。

## 【问题】
DOM 事件监听器和 Promise 回调里的 this 分别是什么？

## 【回答】
**DOM 事件监听器**中的普通函数，浏览器通常把 `this` 设为触发事件的元素；箭头函数则继承外层 `this`（不是元素）。

**Promise 回调**由 Promise 调用，不存在隐式对象调用关系，普通函数按默认绑定处理（非严格 `window` / 严格 `undefined`）；Promise 不会自动把 `this` 设成 Promise 本身。排查 `this` 时应先确认 API 如何调用回调。

```javascript
button.addEventListener('click', function () { console.log(this === button); }); // true
button.addEventListener('click', () => { /* this 来自外层，不是 button */ });
```

## 【问题】
为什么把对象方法作为回调传给定时器或解构出来后，this 会丢失？怎么修复？

## 【回答】
传递的是**函数值本身**，不会自动保留原来的对象调用关系，调用者信息丢失：

```javascript
setTimeout(user.say, 0);        // 不应依赖 this 为 user
const { say } = user; say();    // 不再是 user.say()，this 不是 user
```

修复方式：
- **箭头函数包装**：`() => user.say()`，回调执行时重新写出对象调用；
- **bind 固定**：`user.say.bind(user)`，提前创建固定上下文的新函数；
- 让方法本身不依赖动态 `this`。

箭头包装在回调执行时调用，bind 提前创建固定上下文的函数，二者有区别。

## 【问题】
如何手写一个简化版的 call / apply？

## 【回答】
思路：把函数**临时作为对象方法调用**，从而获得隐式绑定：

```javascript
Function.prototype.myCall = function (receiver, ...args) {
  const target = receiver == null ? globalThis : Object(receiver);
  const key = Symbol('fn');
  target[key] = this;
  try { return target[key](...args); }
  finally { delete target[key]; }
};
```

这仅用于理解机制；真实规范还涉及严格模式、原始值、构造调用、异常和内置函数等细节，不能当作完整 polyfill。`bind` 还要保存预置参数并返回包装函数，且 `new` 调用时实例 `this` 优先。

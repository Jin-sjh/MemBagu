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

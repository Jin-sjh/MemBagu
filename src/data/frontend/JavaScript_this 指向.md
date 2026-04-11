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

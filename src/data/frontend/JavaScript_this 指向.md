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

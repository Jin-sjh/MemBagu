# JavaScript 继承方式

## 【问题】
JS 有哪些继承方式？（背这 4 种）

## 【回答】
**1. 原型链继承**

实现方式：
```javascript
Child.prototype = new Parent()
```

- 优点：方法能共享
- 缺点：引用类型属性污染、不能传参

**2. 借用构造函数继承（经典继承）**

实现方式：
```javascript
Parent.call(this)
```

- 优点：不污染、能传参
- 缺点：方法不能共享，浪费内存

**3. 组合继承**

实现方式：
```javascript
call + new Parent()
```

- 优点：解决污染 + 传参 + 方法共享
- 缺点：父类构造执行两次

**4. 组合寄生式继承（⭐ 面试标准答案）**

实现方式：
```javascript
call + Object.create
```

- 优点：完美无缺陷
- 缺点：无

## 【问题】
组合寄生式继承 手写代码（直接默写）

## 【回答】
```javascript
// 父类
function Parent(name) {
    this.name = name; // 实例属性
}
Parent.prototype.say = function () {}; // 原型方法

// 子类
function Child(name) {
    Parent.call(this, name); // 【1】继承属性：隔离、不污染、可传参
}

// 【2】继承方法：共享、干净、不执行父类构造
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child; // 修复构造器
```

## 【问题】
组合寄生式继承 手写代码（升级版）

## 【回答】
```javascript
// 父类
function Parent(name) {
    this.name = name; // 实例属性
}
Parent.prototype.say = function () {}; // 原型方法

// 子类
function Child(name, age) {
    Parent.call(this, name); // 【1】继承属性：隔离、不污染、可传参
    this.age = age;
}

// 【2】继承方法：共享、干净、不执行父类构造
function myCreate(parentProto, childProto) {
    // 类型检查
    if (Object.prototype.toString.call(parentProto) !== "[object Object]") {
        throw new TypeError("parentProto must be an object");
    }
    if (childProto && Object.prototype.toString.call(childProto) !== "[object Object]") {
        throw new TypeError("childProto must be an object");
    }

    // 创建一个中间对象，避免直接修改父类原型
    var TempConstructor = function() {};
    TempConstructor.prototype = parentProto;

    // 创建新对象，其原型是父类原型
    var result = new TempConstructor();

    // 如果传入了额外的属性，则添加到新对象上
    if (childProto) {
        for (var key in childProto) {
            if (childProto.hasOwnProperty(key)) {
                result[key] = childProto[key];
            }
        }
    }

    // 修复 constructor 属性
    if (result.constructor === TempConstructor) {
        result.constructor = myCreate;
    }

    return result;
}

// 使用自定义的 myCreate 函数实现继承
Child.prototype = myCreate(Parent.prototype, {
    constructor: {
        value: Child,
        writable: true,
        configurable: true,
        enumerable: false // constructor 属性不可枚举
    }
});
```

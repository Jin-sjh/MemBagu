# Reflect 对象常见方法

## 【问题】
说说 Reflect 对象的常见方法。

## 【回答】
常见方法如下：

- **Reflect.apply(target, thisArg, args)** - 调用函数，相当于 `Function.prototype.apply.call(target, thisArg, args)`

- **Reflect.construct(target, args)** - 创建对象实例，相当于 `new target(...args)`

- **Reflect.get(target, name, receiver)** - 获取对象属性值，相当于 `target[name]`

- **Reflect.set(target, name, value, receiver)** - 设置对象属性值，相当于 `target[name] = value`

- **Reflect.defineProperty(target, name, desc)** - 定义对象属性，相当于 `Object.defineProperty()`

- **Reflect.deleteProperty(target, name)** - 删除对象属性，相当于 `delete target[name]`

- **Reflect.has(target, name)** - 检查对象是否有该属性，相当于 `name in target`

- **Reflect.ownKeys(target)** - 返回对象所有自有属性键（包括不可枚举和 Symbol），相当于 `Object.getOwnPropertyNames()` + `Object.getOwnPropertySymbols()`

- **Reflect.isExtensible(target)** - 判断对象是否可扩展，相当于 `Object.isExtensible()`

- **Reflect.preventExtensions(target)** - 阻止对象扩展，相当于 `Object.preventExtensions()`

- **Reflect.getOwnPropertyDescriptor(target, name)** - 获取属性描述符，相当于 `Object.getOwnPropertyDescriptor()`

- **Reflect.getPrototypeOf(target)** - 获取对象原型，相当于 `Object.getPrototypeOf()`

- **Reflect.setPrototypeOf(target, prototype)** - 设置对象原型，相当于 `Object.setPrototypeOf()`

**Reflect 的优势**：
1. 统一了对象操作 API，所有方法都是静态函数式调用
2. 返回值更规范（成功返回 true，失败返回 false 而非抛出错误）
3. 与 Proxy 完美配合，Proxy 的拦截器与 Reflect 方法一一对应

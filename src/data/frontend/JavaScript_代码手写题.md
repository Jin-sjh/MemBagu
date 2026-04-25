# 代码手写题

## 【问题】
实现深拷贝

# 深拷贝 8步8字口诀（超好记）
1. **判基**（判断基础类型）
2. **查缓**（检查缓存）
3. **建空**（创建空容器）
4. **存映**（存入缓存映射）
5. **遍历**（遍历属性）
6. **滤原**（过滤原型属性）
7. **递归**（递归拷贝子值）
8. **返复**（返回拷贝结果）

**记忆口诀：判基查缓，建空存映，遍历滤原，递归返复**

## 【回答】
```javascript
function deepClone(obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (map.has(obj)) {
    return map.get(obj);
  }

  const clone = Array.isArray(obj) ? [] : {};
  map.set(obj, clone);

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key], map);
    }
  }

  return clone;
}
```

**关键点：**

1. **边界条件处理**：判断是否为 null 或非对象类型，直接返回
2. **循环引用处理**：使用 WeakMap 存储已克隆的对象，避免循环引用导致无限递归
3. **类型判断**：使用 Array.isArray 区分数组和对象
4. **递归克隆**：遍历对象自身属性，递归调用 deepClone
5. **WeakMap 优势**：弱引用不会阻止垃圾回收，避免内存泄漏

## 【问题】
手写实现数组去重，要求使用 Map 方法。

## 【回答】
```javascript
function uniqueByMap(arr) {
  const map = new Map();
  for (let item of arr) {
    if (!map.has(item)) {
      map.set(item, true);
    }
  }
  return [...map.keys()];
}
```

## 【问题】
手写实现数组去重，要求使用 filter 方法。

## 【回答】
```javascript
function uniqueByFilter(arr) {
  return arr.filter((item, index) => {
    return arr.indexOf(item) === index;
  });
}
```

## 【问题】
手写实现原地快速排序（极简好懂版）

## 【回答】
```javascript
function quickSort(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return;

  // 分区：把小于pivot的放左边，大于放右边
  let i = left, j = right;
  const pivot = arr[left]; // 基准值

  while (i < j) {
    // 右指针往左找小的
    while (i < j && arr[j] >= pivot) j--;
    arr[i] = arr[j];

    // 左指针往右找大的
    while (i < j && arr[i] <= pivot) i++;
    arr[j] = arr[i];
  }

  // 基准归位
  arr[i] = pivot;

  // 递归左右
  quickSort(arr, left, i - 1);
  quickSort(arr, i + 1, right);
}
```

**关键点：**

1. **基准值选择**：取 `arr[left]` 作为基准值（pivot）
2. **双指针分区**：
   - 右指针 `j` 从右向左找比 pivot 小的元素
   - 左指针 `i` 从左向右找比 pivot 大的元素
   - 交换两者位置
3. **基准归位**：当 `i === j` 时，将 pivot 放到正确位置
4. **递归排序**：分别对左半区和右半区递归调用 quickSort
5. **原地排序**：空间复杂度 O(log n)，仅递归栈开销，无需额外数组

## 【问题】
手写 bind

## 【回答】
```javascript
Function.prototype.myBind = function(context, ...args1) {
  const fn = this

  return function(...args2) {
    return fn.apply(context, [...args1, ...args2])
  }
}
```

**关键点：**

1. **原型方法**：在 `Function.prototype` 上添加 `myBind` 方法
2. **保存当前函数**：使用 `const fn = this` 保存原函数引用
3. **参数分组**：
   - `args1`：bind 时传入的预设参数
   - `args2`：调用返回函数时传入的参数
4. **this 绑定**：通过 `fn.apply(context, ...)` 将 this 绑定到指定上下文
5. **参数合并**：使用扩展运算符合并预设参数和调用参数 `[...args1, ...args2]`
6. **返回新函数**：返回一个闭包，保持对原函数和上下文的引用

## 【问题】
手写 call

**原理：** 把函数临时挂到对象上执行

## 【回答】
```javascript
Function.prototype.myCall = function(context, ...args) {
  context = context || window

  const key = Symbol()

  context[key] = this

  const result = context[key](...args)

  delete context[key]

  return result
}
```

**关键点：**

1. **默认 context**：如果 context 为 null 或 undefined，则默认为 window
2. **Symbol 唯一键**：使用 Symbol 创建唯一键名，避免与对象原有属性冲突
3. **临时绑定**：将当前函数（this）赋值给 context 的 Symbol 属性
4. **执行函数**：通过 context[key] 调用函数，传入参数，此时 this 指向 context
5. **清理现场**：执行完成后删除临时属性，避免污染对象
6. **返回结果**：返回函数执行的结果

## 【问题】
手写防抖函数

## 【回答】
```javascript
function debounce(fn, delay) {
    let timer = null;
    return function(...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    }
}
```

**关键点：**

1. **闭包保存状态**：使用 `timer` 变量保存定时器引用
2. **清除旧定时器**：每次触发时清除之前的定时器，重新计时
3. **apply 绑定 this**：确保回调函数的 this 指向正确
4. **参数透传**：使用 `...args` 接收并传递所有参数

## 【问题】
手写节流函数

## 【回答】
```javascript
function throttle(fn, delay) {
    let last = 0;
    return function(...args) {
        const now = Date.now();
        if ((now - last) >= delay) {
            fn.apply(this, args);
            last = now;
        }
    }
}
```

**关键点：**

1. **时间戳记录**：使用 `last` 记录上次执行时间
2. **时间差判断**：当前时间与上次执行时间的差值大于等于 delay 时才执行
3. **更新时间戳**：执行后更新 `last` 为当前时间
4. **apply 绑定 this**：确保回调函数的 this 指向正确

## 【问题】
手写数组转树（递归方式）

## 【回答】
```javascript
function toTree(list, parId) {
    function loop(pid) {
        const res = [];
        for (const item of list) {
            if (item.pid === pid) {
                const children = loop(item.id);
                if (children.length) {
                    item.children = children;
                }
                res.push(item);
            }
        }
        return res;
    }
    return loop(parId);
}
```

**极简版：**
```javascript
const toTree = (list, pid) => 
    list.filter(item => item.pid === pid).map(item => ({
        ...item,
        children: toTree(list, item.id)
    }));
```

**关键点：**

1. **递归构建**：通过递归查找每个节点的子节点
2. **pid 匹配**：根据 pid 找到所有子节点
3. **children 处理**：只有存在子节点时才添加 children 属性

## 【问题】
手写数组转树（Hash方式）

## 【回答】
```javascript
function toTreeHash(list) {
    const res = [];
    const map = {};

    for (const item of list) {
        const node = { ...item, children: [] };
        map[item.id] = node;
    }

    for (const item of list) {
        const node = map[item.id];
        if (item.pid) {
            if (map[item.pid]) {
                map[item.pid].children.push(node);
            }
        } else {
            res.push(node);
        }
    }
    return res;
}
```

**关键点：**

1. **Map 映射**：先遍历一次建立 id 到节点的映射
2. **O(n) 复杂度**：只需两次遍历，时间复杂度为 O(n)
3. **父子关系**：通过 pid 找到父节点，将当前节点加入父节点的 children

## 【问题】
手写 new 操作符

## 【回答】
```javascript
function myNew(fn, ...args) {
    if (typeof fn !== 'function') {
        throw new TypeError('fn must be a function');
    }
    const obj = Object.create(fn.prototype);
    const res = fn.call(obj, ...args);
    return res instanceof Object ? res : obj;
}
```

**关键点：**

1. **类型检查**：确保第一个参数是函数
2. **创建对象**：使用 `Object.create(fn.prototype)` 创建原型链
3. **执行构造函数**：使用 `call` 绑定 this 到新对象
4. **返回值处理**：如果构造函数返回对象则使用该对象，否则返回新创建的对象

## 【问题】
手写浅拷贝

## 【回答】
```javascript
function shallow(obj) {
    const newObj = {};
    for (const key in obj) {
        newObj[key] = obj[key];
    }
    return newObj;
}
```

**关键点：**

1. **创建新对象**：开辟新的内存空间
2. **遍历属性**：使用 `for...in` 遍历对象属性
3. **复制引用**：只复制第一层属性的引用，不递归

## 【问题】
手写 Promise.all

## 【回答】
```javascript
function myPromiseAll(promises) {
    let count = 0;
    let result = [];
    return new Promise((resolve, reject) => {
        if (!promises.length) return resolve([]);
        promises.forEach((item, index) => {
            Promise.resolve(item).then(value => {
                result[index] = value;
                count++;
                if (count === promises.length) {
                    resolve(result);
                }
            }).catch(reject);
        });
    });
}
```

**关键点：**

1. **计数器**：使用 `count` 记录已完成的 Promise 数量
2. **保持顺序**：使用 `result[index]` 保证结果顺序与输入顺序一致
3. **空数组处理**：空数组直接 resolve
4. **错误处理**：任一 Promise 失败则整体失败

## 【问题】
手写发布订阅模式

## 【回答】
```javascript
class EventEmitter {
    constructor() {
        this.events = {};
    }
    on(e, fn) {
        (this.events[e] || (this.events[e] = [])).push(fn);
    }
    emit(e, ...args) {
        (this.events[e] || []).forEach(fn => fn(...args));
    }
    off(e, fn) {
        this.events[e] = (this.events[e] || []).filter(f => f !== fn);
    }
    once(e, fn) {
        const wrap = (...args) => {
            fn(...args);
            this.off(e, wrap);
        };
        this.on(e, wrap);
    }
}
```

**关键点：**

1. **事件存储**：使用对象存储事件名到回调函数数组的映射
2. **on 订阅**：将回调函数加入对应事件数组
3. **emit 发布**：遍历执行所有订阅的回调函数
4. **off 取消订阅**：从数组中移除指定回调函数
5. **once 单次订阅**：包装回调函数，执行后自动取消订阅

## 【问题】
手写 URL 解析函数

## 【回答】
```javascript
function parseUrl(url) {
    const [path, queryStr] = url.split("?");
    const query = {};
    queryStr?.split('&').forEach(kv => {
        let [k, v = ''] = kv.split("=");
        if (query[k]) {
            query[k] = [].concat(query[k], decodeURIComponent(v));
        } else {
            query[k] = decodeURIComponent(v);
        }
    });
    return { path, query };
}
```

**关键点：**

1. **分割路径和参数**：使用 `split("?")` 分离
2. **解析参数**：使用 `split("&")` 和 `split("=")` 解析键值对
3. **URL 解码**：使用 `decodeURIComponent` 解码参数值
4. **重复参数处理**：同名参数转为数组

## 【问题】
手写对象深度比较

## 【回答】
```javascript
function isEqual(a, b) {
    if (a === b) return true;
    if (Number.isNaN(a) && Number.isNaN(b)) return true;
    if (a === null || b === null) return false;
    if (typeof a === 'object' && typeof b === 'object') {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        return keysA.every(key => isEqual(a[key], b[key]));
    }
    return false;
}
```

**关键点：**

1. **严格相等**：基础类型直接比较
2. **NaN 处理**：NaN === NaN 为 false，需单独判断
3. **null 处理**：typeof null === 'object'，需提前过滤
4. **递归比较**：对象类型递归比较每个属性

## 【问题】
手写 instanceof

## 【回答】
```javascript
function myInstanceof(left, right) {
    const prototype = right.prototype;
    let proto = Object.getPrototypeOf(left);
    while (true) {
        if (proto === null) return false;
        if (proto === prototype) return true;
        proto = Object.getPrototypeOf(proto);
    }
}
```

**关键点：**

1. **获取原型**：获取右操作数的 prototype
2. **遍历原型链**：使用 `Object.getPrototypeOf` 获取左操作数的原型
3. **比较原型**：如果找到相等的原型则返回 true
4. **终止条件**：原型链到 null 时终止，返回 false

## 【问题】
手写数组扁平化

## 【回答】
```javascript
function flat(arr, depth) {
    let res = [];
    for (let i = 0; i < arr.length; i++) {
        if (Array.isArray(arr[i]) && depth) {
            res = res.concat(flat(arr[i], depth - 1));
        } else {
            res.push(arr[i]);
        }
    }
    return res;
}
```

**关键点：**

1. **递归展开**：遇到数组且深度大于 0 时递归
2. **深度控制**：每次递归深度减 1
3. **concat 合并**：使用 concat 合并结果数组

## 【问题】
手写对象扁平化

## 【回答】
```javascript
function objectFlat(obj = {}) {
    const res = {};
    function flat(item, preKey = '') {
        Object.entries(item).forEach(([key, val]) => {
            const newKey = preKey ? `${preKey}.${key}` : key;
            if (val && typeof val === 'object') {
                flat(val, newKey);
            } else {
                res[newKey] = val;
            }
        });
    }
    flat(obj);
    return res;
}
```

**关键点：**

1. **递归遍历**：遍历对象的所有属性
2. **键名拼接**：使用 `.` 连接嵌套的键名
3. **类型判断**：遇到对象类型递归处理

## 【问题】
说出创建 Ajax 的大致过程

## 【回答】
创建 Ajax 的大致过程如下：

（1）创建 XMLHttpRequest 对象，也就是创建一个异步调用对象。

（2）设置响应 HTTP 请求状态变化的函数。

（3）打开一个新的 HTTP 请求，并指定该 HTTP 请求的方法、URL 及验证信息。

（4）发送 HTTP 请求。

（5）在响应回调函数中，根据改变状态和请求状态码，获取异步请求返回的数据。

（6）渲染返回的数据。

## 【问题】
手写 Ajax 请求

## 【回答】
```javascript
const url = 'https://api.example.com/data';

const xhr = new XMLHttpRequest();
xhr.open('GET', url, true);

xhr.onreadystatechange = function() {
    if (this.readyState !== 4) return;
    if (this.status >= 200 && this.status < 300) {
        console.log('请求成功:', this.response);
    } else {
        console.error('请求失败，状态码:', this.status);
    }
};

xhr.onerror = function() {
    console.error('网络请求失败');
};

xhr.send();
```

**关键点：**

1. **创建 XHR 对象**：`new XMLHttpRequest()`
2. **open 初始化**：指定请求方法、URL、是否异步
3. **onreadystatechange**：监听请求状态变化
4. **readyState**：4 表示请求完成
5. **status**：HTTP 状态码，200-299 表示成功
6. **onerror**：处理网络错误

## 【问题】
手写 apply

## 【回答】
```javascript
Function.prototype.myApply = function(context, args) {
    context = context || window;
    const fn = Symbol();
    context[fn] = this;
    args = args || [];
    const result = context[fn](...args);
    delete context[fn];
    return result;
}
```

**关键点：**

1. **默认 context**：context 为 null 或 undefined 时默认为 window
2. **Symbol 唯一键**：避免与对象原有属性冲突
3. **参数数组**：apply 接收参数数组，使用展开运算符传递
4. **清理现场**：执行完成后删除临时属性

## 【问题】
手写 bind（支持 new 调用）

## 【回答】
```javascript
Function.prototype.myBind = function(context, ...bindArgs) {
    const fn = this;
    if (typeof fn !== 'function') {
        throw new TypeError('Bind must be called on a function');
    }
    return function BoundFunc(...runArgs) {
        if (new.target) {
            return new fn(...bindArgs, ...runArgs);
        }
        return fn.apply(context || window, [...bindArgs, ...runArgs]);
    };
};
```

**关键点：**

1. **保存原函数**：使用 `const fn = this` 保存
2. **new 调用判断**：使用 `new.target` 判断是否为 new 调用
3. **new 时忽略 this**：new 调用时忽略绑定的 this
4. **参数合并**：合并 bind 时和调用时的参数

## 【问题】
手写函数柯里化

## 【回答】
```javascript
function curry(fn) {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn(...args);
        }
        return function(...newArgs) {
            return curried(...args, ...newArgs);
        };
    };
}
```

**关键点：**

1. **参数长度判断**：使用 `fn.length` 获取函数期望参数数量
2. **参数收集**：使用 `...args` 收集已传入参数
3. **递归返回**：参数不足时返回新函数继续收集
4. **参数合并**：每次调用合并已有参数和新参数

## 【问题】
手写千分位分隔符

## 【回答】
```javascript
function thousandSeparator(n) {
    n = n.toString();
    let count = 0;
    const arr = [];
    for (let i = n.length - 1; i >= 0; i--) {
        count++;
        if (count < 4) {
            arr.push(n[i]);
        } else {
            arr.push(',', n[i]);
            count = 1;
        }
    }
    return arr.reverse().join('');
}
```

**关键点：**

1. **从右向左遍历**：从个位开始处理
2. **计数器**：每三位添加一个逗号
3. **数组反转**：最后反转数组并拼接

## 【问题】
手写洗牌算法（Fisher-Yates）

## 【回答】
```javascript
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
```

**关键点：**

1. **从后向前遍历**：从最后一个元素开始
2. **随机交换**：随机选择一个位置与当前位置交换
3. **原地修改**：直接在原数组上操作，空间复杂度 O(1)

## 【问题】
手写数组 map 方法

## 【回答】
```javascript
Array.prototype.myMap = function(fn) {
    const res = [];
    for (let i = 0; i < this.length; i++) {
        res.push(fn(this[i], i, this));
    }
    return res;
}
```

## 【问题】
手写数组 filter 方法

## 【回答】
```javascript
Array.prototype.myFilter = function(fn) {
    const res = [];
    for (let i = 0; i < this.length; i++) {
        if (fn(this[i], i, this)) {
            res.push(this[i]);
        }
    }
    return res;
}
```

## 【问题】
手写数组 reduce 方法

## 【回答】
```javascript
Array.prototype.myReduce = function(fn, initValue) {
    let res, start = 0;
    if (arguments.length !== 1) {
        res = initValue;
    } else {
        res = this[0];
        start = 1;
    }
    for (let i = start; i < this.length; i++) {
        res = fn(res, this[i], i, this);
    }
    return res;
}
```

## 【问题】
手写异步并发数限制

## 【回答】
```javascript
async function limit(count, array, fn) {
    const result = [];
    const doing = [];

    for (const item of array) {
        const p = fn(item).then(res => result.push(res));
        doing.push(p);

        if (doing.length >= count) {
            await Promise.race(doing);
            doing.splice(doing.indexOf(p), 1);
        }
    }

    await Promise.all(doing);
    return result;
}
```

**关键点：**

1. **并发控制**：使用数组保存正在执行的任务
2. **Promise.race**：等待任一任务完成
3. **动态调整**：完成一个任务后移除并添加新任务

## 【问题】
手写大数相加

## 【回答】
```javascript
function bigAdd(a, b) {
    let i = a.length - 1;
    let j = b.length - 1;
    let carry = 0;
    let res = [];

    while (i >= 0 || j >= 0 || carry) {
        const num1 = +a[i--] || 0;
        const num2 = +b[j--] || 0;
        const sum = num1 + num2 + carry;
        res.push(sum % 10);
        carry = (sum / 10) | 0;
    }

    return res.reverse().join('');
}
```

**关键点：**

1. **从低位开始**：从字符串末尾开始相加
2. **进位处理**：使用 carry 变量保存进位
3. **位数对齐**：较短的数字用 0 补齐
4. **结果反转**：最后反转数组得到正确顺序

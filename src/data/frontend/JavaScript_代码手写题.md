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

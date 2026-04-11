# 4.2.2 深拷贝实现

## 【问题】

手写深拷贝函数，需要处理以下情况：
1. 基本类型直接返回
2. 日期和正则特殊处理
3. 循环引用处理
4. 区分数组和对象
5. 递归拷贝属性

## 【回答】

```javascript
function deepClone(obj, hash = new WeakMap()) {
  // 基本类型直接返回
  if (obj === null || typeof obj !== 'object') return obj;
  
  // 日期和正则特殊处理
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags);
  
  // 循环引用处理
  if (hash.has(obj)) return hash.get(obj);
  
  // 区分数组和对象
  const cloneObj = Array.isArray(obj) ? [] : {};
  hash.set(obj, cloneObj);
  
  // 递归拷贝属性
  Reflect.ownKeys(obj).forEach(key => {
    cloneObj[key] = deepClone(obj[key], hash);
  });
  
  return cloneObj;
}
```

### 核心要点

1. **WeakMap 处理循环引用**：使用 WeakMap 存储已拷贝的对象，避免循环引用导致栈溢出
2. **特殊对象处理**：Date 和 RegExp 需要特殊构造，不能简单复制
3. **类型判断**：使用 `Array.isArray()` 区分数组和普通对象
4. **Reflect.ownKeys**：获取对象自身的所有属性（包括 Symbol 属性）
5. **递归拷贝**：对每个属性递归调用 deepClone 实现深度复制

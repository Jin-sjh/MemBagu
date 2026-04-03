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

# DOM 节点类型

## DOM 节点类型

【问题】
列举几种类型的 DOM 节点？

【回答】
有以下几类 DOM 节点：

- 整个文档是一个文档（Document）节点。
- 每个 HTML 标签是一个元素（Element）节点。
- 每一个 HTML 属性是一个属性（Attribute）节点。
- 包含在 HTML 元素中的文本是文本（Text）节点。

---

## script 标签 defer 和 async 属性的区别

【问题】
谈谈 script 标签中 defer 和 async 属性的区别。

【回答】
defer 和 async 都是用于控制脚本加载和执行的属性，它们的区别如下：

### 相同点

- 两者都不会阻塞 HTML 解析（DOM 构建）
- 两者都是异步下载脚本文件

### 不同点

| 特性 | defer | async |
|------|-------|-------|
| 执行时机 | 在 HTML 解析完成后、DOMContentLoaded 事件前执行 | 脚本下载完成后立即执行，不等待 HTML 解析 |
| 执行顺序 | 按文档中出现的顺序依次执行 | 哪个先下载完就先执行哪个，不保证顺序 |
| 适用场景 | 需要等待 DOM 准备好，且脚本之间有依赖关系 | 独立脚本，不依赖其他脚本，不操作 DOM |

### 图示说明

```
无属性（默认）：
HTML 解析 → 遇到 script → 暂停解析 → 下载并执行 → 继续解析

defer：
HTML 解析（同时下载）→ 解析完成 → 按顺序执行 → DOMContentLoaded

async：
HTML 解析（同时下载）→ 下载完成立即执行 → 继续解析
```

### 使用建议

- **defer**：大多数情况下的首选，特别是当脚本需要访问 DOM 或脚本之间有依赖关系时
- **async**：适用于独立的第三方脚本（如统计代码、广告脚本），不依赖 DOM 和其他脚本

---

## attribute 和 property 的区别

【问题】
对于元素，attribute 和 property 的区别是什么？

【回答】
attribute 是 DOM 元素在文档中作为 HTML 标签拥有的属性；property 就是 DOM 元素在 JavaScript 中作为对象拥有的属性。

---

## 清除定时器的方法

【问题】
如何清除一个定时器？

【回答】
清除定时器使用的方法是：`window.clearInterval()`。清除循环定时器使用的方法是 `window.clearTimeout()`。

---

## 在 body 中添加 DOM 对象

【问题】
如何在 body 中添加一个 DOM 对象？innerHTML 和 innerText 有什么区别？

【回答】
在 body 中添加 DOM 的方法是使用 `body.appendChild(DOM 元素)`。

**innerHTML** 是指从对象的起始位置到终止位置的全部内容，包括 HTML 标签。

**innerText** 是指从起始位置到终止位置的内容，但它不包括 HTML 标签。

---

## DOM 对象的 3 种查询方式

【问题】
说明 DOM 对象的 3 种查询方式。

【回答】
3 种查询方法如下：

- 使用 `getElementById()`，根据元素 id 进行查找。
- 使用 `getElementsByTagName(tag)`，根据标签名称进行查找。
- 使用 `getElementsByName(name)`，根据元素名称进行查找。

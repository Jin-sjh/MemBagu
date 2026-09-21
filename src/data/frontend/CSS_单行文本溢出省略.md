---
category: CSS
topic: 单行文本溢出省略
type: bagu
tags: [CSS, 文本溢出, 省略号, 换行, 垂直对齐, line-clamp]
difficulty: medium
created: 2026-07-24
---
# CSS 单行文本溢出省略

## 【问题】

如何实现单行文本溢出省略效果？需要哪些 CSS 属性配合？

## 【回答】

理解也很简单，即文本在一行内显示，超出部分以省略号的形式展现。

实现方式也很简单，涉及的 CSS 属性有：

- **text-overflow**：规定当文本溢出时，显示省略符号来代表被修剪的文本
- **white-space**：设置文字在一行显示，不能换行
- **overflow**：文字长度超出限定宽度，则隐藏超出的内容

### 属性说明

**overflow 设为 hidden**，普通情况用在块级元素的外层隐藏内部溢出元素，或者配合下面两个属性实现文本溢出省略。

**white-space: nowrap**，作用是设置文本不换行，是 `overflow: hidden` 和 `text-overflow: ellipsis` 生效的基础。

### text-overflow 属性值

- **clip**：当对象内文本溢出部分裁切掉
- **ellipsis**：当对象内文本溢出时显示省略标记（...）

### 完整实现代码

```css
.ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
```

---

## 【问题】
如何实现多行文本溢出省略？

## 【回答】
单行省略用 `white-space: nowrap + overflow: hidden + text-overflow: ellipsis`；**多行省略可用 line-clamp 等现代能力**：
```css
.multi {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```
它限制显示行数并省略溢出。但**兼容性和布局需实测**，-webkit-line-clamp 仍是较广泛支持但带前缀的方案，复杂内容要验证截断位置。

---

## 【问题】
overflow-wrap 与 word-break 有什么区别？

## 【回答】
二者都处理长文本断行：
- **overflow-wrap**：决定**过长单词是否允许在任意位置断开**，默认不强制；
- **word-break**：更直接地**改变断词规则**（如 `break-all` 允许在任意字符间断）。

遇到**英文长单词或连续字符串（如长 URL）超过正常断词规则**时，应结合 `overflow-wrap: anywhere` 或 `word-break` 选择，否则文本会撑破容器。

---

## 【问题】
line-height 和 vertical-align 的作用与常见误区？

## 【回答】
**line-height** 是行框高度相关属性，影响**视觉垂直对齐**，但**不是通用的盒子居中方案**（只对单行文本内有效）。**vertical-align 只作用于行内/表格单元的对齐上下文**，用于行内元素与文本基线对齐，**不是 flex 对齐**（flex 用 align-items）。把这两个属性当成通用垂直居中手段是常见误区。

---

## 【问题】
文本垂直居中有哪些可行方式？

## 【回答】
应按场景区分：
- **单行文本**：用 `line-height` 等于容器高度实现垂直居中；
- **flex/grid 容器**：用 `align-items: center` / `place-items: center`；
- **多行文本 / 动态高度**：用 flex/grid 而非 line-height，否则多行会整体偏移。

不能把"单行 line-height 居中"套用到多行或块级场景，验证时应覆盖中英文、长 URL 与动态内容。

# CSS 单行文本溢出省略

## 问题

如何实现单行文本溢出省略效果？需要哪些 CSS 属性配合？

## 回答

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

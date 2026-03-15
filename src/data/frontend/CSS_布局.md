# CSS 布局

## 问题 1：两栏布局（左定宽，右自适应）有哪些实现方案？

### 【问题】
两栏布局（左定宽，右自适应）有哪些实现方案？

### 【回答】
HTML 统一结构：

```html
<div class="container">
  <div class="left">left</div>
  <div class="right">right</div>
</div>
```

**方案 1：float + margin（经典必会）**

```css
.left {
  float: left;
  width: 200px;
}

.right {
  margin-left: 200px;
}
```

特点：
- 最老的方案，面试常问
- 需要处理浮动清除（clearfix）

**方案 2：flex（推荐方案）**

```css
.container {
  display: flex;
}

.left {
  width: 200px;
}

.right {
  flex: 1;
}
```

特点：
- 语义清晰
- 自适应能力强
- 实际项目首选

**方案 3：absolute + padding**

```css
.container {
  position: relative;
}

.left {
  position: absolute;
  width: 200px;
  left: 0;
}

.right {
  padding-left: 200px;
}
```

特点：
- 不参与文档流
- 常用于整体布局容器

---

## 问题 2：三栏布局（中间自适应）有哪些实现方案？

### 【问题】
三栏布局（中间自适应）有哪些实现方案？

### 【回答】
HTML 统一结构：

```html
<div class="container">
  <div class="left">left</div>
  <div class="main">main</div>
  <div class="right">right</div>
</div>
```

**方案 1：float + margin（圣杯布局）**

```css
.container {
  overflow: hidden;
}

.left {
  float: left;
  width: 200px;
}

.right {
  float: right;
  width: 200px;
}

.main {
  margin-left: 200px;
  margin-right: 200px;
}
```

特点：
- 经典面试题
- 需要注意清除浮动

**方案 2：flex（推荐方案）**

```css
.container {
  display: flex;
}

.left {
  width: 200px;
}

.main {
  flex: 1;
}

.right {
  width: 200px;
}
```

特点：
- 代码简洁
- 自适应能力强
- 实际项目首选

**方案 3：grid（现代方案）**

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
}
```

特点：
- 代码最简洁
- 适合复杂布局场景

---

## 问题 3：水平垂直居中有哪些实现方案？

### 【问题】
水平垂直居中有哪些实现方案？

### 【回答】
**方案 1：flex 布局（推荐）**

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

特点：
- 代码简洁
- 兼容性良好
- 现代项目首选

**方案 2：position + transform**

```css
.container {
  position: relative;
}

.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

特点：
- 不需要知道元素尺寸
- 兼容性较好

**方案 3：position + margin（需要知道尺寸）**

```css
.container {
  position: relative;
}

.center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 100px;
  margin-top: -50px;
  margin-left: -100px;
}
```

特点：
- 需要知道元素宽高
- 兼容性最好

**方案 4：grid 布局**

```css
.container {
  display: grid;
  place-items: center;
}
```

特点：
- 代码最简洁
- 适合现代浏览器

---

## 问题 4：BFC 是什么？有什么作用？

### 【问题】
BFC 是什么？有什么作用？

### 【回答】
BFC（Block Formatting Context，块级格式化上下文）是 CSS 中一个重要的概念，它是一个独立的渲染区域，内部的元素布局不会影响外部元素。

**触发 BFC 的条件：**
- 根元素（html）
- float 不为 none
- position 为 absolute 或 fixed
- display 为 inline-block、table-cell、flex、grid 等
- overflow 不为 visible

**BFC 的作用：**
1. **清除浮动**：BFC 可以包含浮动元素，解决父元素高度塌陷问题
2. **阻止 margin 重叠**：同一 BFC 内的相邻块级元素 margin 会重叠，创建新的 BFC 可以避免
3. **阻止元素被浮动元素覆盖**：BFC 区域不会与浮动元素重叠

**实际应用：**
- 清除浮动：`overflow: hidden` 或 `display: flow-root`
- 防止 margin 重叠：给其中一个元素创建 BFC
- 自适应两栏布局：右侧元素创建 BFC 避开左侧浮动元素

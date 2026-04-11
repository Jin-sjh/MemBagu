# CSS 布局

---

## 问题 0：width 默认包含哪些部分？

### 【问题】
width 默认包含哪些部分？

### 【回答】
在浏览器默认的标准盒模型（content-box）下：

- width 只包含内容区域（content）的宽度
- 不包含 padding（内边距）、border（边框）、margin（外边距）
- 元素实际占据的总宽度 = width + 左右 padding + 左右 border + 左右 margin

---

## 问题 1：box-sizing: border-box 解决了什么问题？

### 【问题】
box-sizing: border-box 解决了什么问题？

### 【回答】
它解决了标准盒模型下元素尺寸容易"溢出"的问题：

- 标准盒模型：给元素设置 width: 200px，再加上 padding 和 border 后，元素总宽度会超过 200px，容易破坏布局
- border-box 模型：width 直接包含 content + padding + border，padding 和 border 不会再撑大元素，让布局计算更直观、可控

---

## 问题 2：在什么场景一定会加 box-sizing: border-box？

### 【问题】
在什么场景一定会加 box-sizing: border-box？

### 【回答】
这些场景几乎都会使用：

1. 布局系统（Flex/Grid/浮动布局）：需要精确控制列宽、栅格比例时，避免 padding/border 撑破容器

2. 表单控件：输入框、按钮等需要统一尺寸，防止加了内边距后变形

3. 全局样式重置：现代前端开发中，通常会在 * 或 html/body 上全局设置 border-box，统一所有元素的盒模型行为

4. 组件化开发：保证组件在不同 padding/border 配置下，尺寸依然符合设计规范

---

## 问题 3：position 常用属性有哪些？

### 【问题】
position 常用属性有哪些？

### 【回答】
CSS 中的 position 属性指定一个元素在文档中的定位方式，它有以下几个值：

**1. static**：默认值，元素根据文档流进行布局，不会进行定位。

**2. relative**：元素相对于自身正常位置定位，通过设置 left、right、top、bottom 属性来调整元素的位置，但是其他元素的布局不会受到影响。

**3. fixed**：元素相对于浏览器窗口定位，通过设置 left、right、top、bottom 属性来调整元素的位置，它们的位置固定不变，即使滚动条滚动，会脱离文档流。

**4. absolute**：元素相对于最近的已经定位的祖先元素进行定位，如果没有已经定位的祖先元素，相对于 `<html>` 或 `<body>` 元素进行定位。会脱离文档流。

**5. sticky**：其最近的滚动祖先元素（即具有 `overflow` 属性设置为 `scroll` 或 `auto` 的祖先元素）进行定位。当用户滚动页面时，元素会在指定的位置停留。

---

## 问题 4：什么是浮动？

### 【问题】
什么是浮动？

### 【回答】
浮动（float）是 CSS 中的一种布局方式，可以使元素脱离正常文档流，向左或向右移动，直到它的外边缘触碰到包含块或另一个浮动元素为止。

浮动可以改变元素标签默认的排列方式。

常用于实现多列布局、图文混排等效果。

---

## 问题 5：行内元素和块级元素的区别？

### 【问题】
行内元素和块级元素的区别？

### 【回答】
**1. 行内元素：span、a、strong、em、img、input、button**
- 设置宽高无效
- 可以设置水平方向的 margin 和 padding，不能设置垂直方向的 padding 和 margin
- 不会自动换行

**2. 块级元素：div、p、h1、ul、ol、table、form**
- 可以设置宽高
- 设置 margin 和 padding 都有效
- 独占一行

---

## 问题 6：display 的属性值有哪些？

### 【问题】
display 的属性值有哪些？

### 【回答】
- **none**：元素不会显示，并且会从文档流中移除。
- **block**：块元素，默认宽度继承父元素，可设置宽高，换行显示。
- **inline**：行内元素类型，默认宽度为内容宽度，不可设置宽度。
- **inline-block**：行内块元素，默认宽度为内容宽度，但可设置宽高，同行显示。
- **table**：次元素会作为块级表格来显示。
- **inherit**：规定应该从父元素继承 display 属性的值。
- **list-item**：像块类型元素一样显示，并添加样式列表标记。

---

## 问题 7：两栏布局（左定宽，右自适应）有哪些实现方案？

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

## 问题 8：Flex 和 Grid 布局的区别？

### 【问题】
Flex 和 Grid 布局的区别？

### 【回答】
flex 布局和 grid 布局都是用于响应式页面布局的强大工具，它们各有特点和适用场景。

**Flex 布局：**

Flex 布局是一维的布局模型，主要适用于线性布局（水平或垂直）。Flex 布局提供了强大的对齐、分布和排序等功能，可以实现各种复杂的布局需求，特别适用于移动端开发。

**Grid 布局：**

Grid 布局是二维的布局模型，可以同时控制行和列，支持各种复杂的网格布局。Grid 布局可以通过网格线划分网格单元格，并为每个单元格指定大小和位置，支持跨行、跨列、对齐等操作。

**常用的 Grid 布局属性有：**

- **grid-template-columns、grid-template-rows**：指定网格的列数和行数，以及每个网格单元格的大小。

- **grid-template-areas**：通过指定网格单元格的区域名称，快速定义网格布局。

- **grid-column、grid-row**：指定子元素跨越的列数和行数，支持 start、end、span 等取值。

- **grid-area**：指定子元素所在的网格单元格，支持区域名称或列、行、列跨度和行跨度的组合。

**使用场景：**

- Flex 布局主要适用于单行或单列的布局，如顶部导航、侧边栏、列表等；

- 而 Grid 布局适用于更复杂的网格布局，如网格菜单、新闻列表、画廊等。在实际开发中，可以根据需求选择适合的布局方式。

**核心区别总结：**

1. Flex 布局是一维布局，Grid 布局是二维布局。

2. Flex 布局一次只能处理一个维度上的元素布局，一行或者一列。

3. Grid 布局是将容器划分成了"行"和"列"，产生了一个个的网格，我们可以将网格元素放在与这些行和列相关的位置上，从而达到我们布局的目的。

- 兼容性方面 Flex 布局要优于 Grid，由于 Grid 是一种新的 CSS 布局模型所以兼容性方便比较差一些。

---

## 问题 8-1：Grid 方案优缺点

### 【问题】
Grid 方案优缺点

### 【回答】
**优点：**

- 语法最直观，直接在父容器定义列宽，无需给子元素额外样式
- 二维布局能力极强，后续扩展为多列、复杂页面结构时非常方便
- 天然解决高度塌陷问题，父容器会自动包裹子元素高度
- 支持对齐、间距、区域命名等高级布局特性

**缺点：**

- 对极老旧浏览器（如 IE10 及以下）兼容性差
- 相比 Flex，学习成本稍高，适合更复杂的布局场景

---

## 问题 9：Flex 方案优缺点

### 【问题】
Flex 方案优缺点

### 【回答】
**优点：**

- 现代布局方案，天然解决高度塌陷问题，父容器会自动包裹子元素高度
- 布局灵活强大，支持水平 / 垂直居中、空间分配、对齐等复杂需求
- 代码更直观，可维护性高，是目前主流推荐方案

**缺点：**

- 对极老旧浏览器（如 IE9 及以下）不兼容
- 部分复杂嵌套场景下，Flex 布局的计算逻辑可能稍难理解

---

## 问题 10：三栏布局（中间自适应）有哪些实现方案？

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

## 问题 10：水平垂直居中有哪些实现方案？

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

## 问题 11：BFC 是什么？有什么作用？

### 【问题】
BFC 是什么？有什么作用？

### 【回答】
**1. 概念**

BFC 名为"块级格式化上下文"，简单来说就是，BFC 它是一个独立的渲染区域，使内部元素的布局不会影响外部元素，外部元素也不会影响内部元素。

参与 BFC 的元素会遵循 CSS 模型的规则，该模型定义了元素的边距、边框和如何与同一上下文中的其他块交互。

**2. 创建 BFC 的条件**

任何块级元素都可以通过某些 CSS 属性来创建一个 BFC：

- 根元素或其它包含它的元素
- float: left、right
- overflow: hidden
- position: absolute
- position: fixed
- display: flex
- display: inline-block

**3. BFC 规则**

- 在有 BFC 的盒子中，box 会在垂直方向上一个挨着一个的排布。
- 在有 BFC 的盒子中，垂直方向的间距由 margin 属性决定。
- 在同一个 BFC 中，相邻两个 box 之间的 margin 会发生折叠。
- 在 BFC 中，每个元素的左边缘是紧挨着包含块的左边缘的。

**4. BFC 应用**

- **解决 margin 的折叠问题**：通过创建不同的 BFC 来避免相邻元素的 margin 折叠
- **清除浮动**：BFC 可以包含浮动元素，解决父元素高度塌陷问题
- **阻止元素被浮动元素覆盖**：BFC 区域不会与浮动元素重叠
- **自适应两栏布局**：右侧元素创建 BFC 避开左侧浮动元素

**实际应用示例：**
- 清除浮动：`overflow: hidden` 或 `display: flow-root`
- 防止 margin 重叠：给其中一个元素创建 BFC

**5. BFC 解决 float 高度塌陷问题**

**需要的两个条件：**
- 浮动元素的父元素触发 BFC，形成独立的块级格式化上下文
- 浮动元素的父元素的高度是 auto

**做法：** 在父元素上面添加 `overflow: hidden`，用来给父盒子创建一个新的 BFC，这样子元素的浮动不会影响到父元素的高度从而实现解决浮动塌陷问题。

**注意：** BFC 只能解决浮动高度塌陷问题，解决不了绝对定位高度塌陷问题。

**原理：**
- BFC 的高度在是 auto 的情况下：
- 如果有绝对定位元素，将被忽略。
- 如果有浮动元素，那么会增加高度以包括这些浮动元素的下边缘。

---

## 问题 12：响应式布局的实现方法有哪些？

### 【问题】
响应式布局的实现方法有哪些？

### 【回答】
响应式开发是一种设计和开发网站或应用程序的方法，使其能够在不同设备上以适应性和灵活性的方式呈现。它可以确保网站或应用程序在各种屏幕尺寸、浏览器和设备上都能提供良好的用户体验。

响应式开发的实现基于使用 CSS 媒体查询、弹性布局和流体网格等技术。以下是一些主要的实现方法：

**1. CSS 媒体查询**
使用 CSS 媒体查询可以检测设备的屏幕尺寸、分辨率和方向等特性，并根据这些特性应用不同的样式规则。通过定义不同的 CSS 样式，可以使网页在不同的设备上以不同的方式呈现。

**2. 弹性布局（flexbox）**
即 `display: flex`，使用弹性布局（flexbox）可以创建灵活的布局结构，使内容能够根据屏幕尺寸进行自动调整。弹性布局使得元素的大小、位置和间距能够根据可用空间进行自适应。

**3. 网格布局（grid）**
即 `display: grid`，使用流体网格（fluid grid）可以创建基于相对单位（如百分比）的网格系统，使页面的布局能够根据屏幕大小进行缩放和调整。这样可以确保内容在不同屏幕尺寸上均匀分布和对齐。

---

## 问题 12-1：响应式布局的优缺点？

### 【问题】
响应式布局的优缺点？

### 【回答】
**优点：**

- 面对不同分辨率设备灵活性强
- 能够快捷解决多设备显示适应问题

**缺点：**

- 仅适用布局、信息、框架并不复杂的部门类型网站
- 兼容各种设备工作量大，效率低下
- 代码累赘，会出现隐藏无用的元素，加载时间加长
- 其实这是一种折中性质的设计解决方案，多方面因素影响而达不到最佳效果
- 一定程度上改变了网站原有的布局结构，会出现用户混淆的情况

---

## 问题 13：Flex 布局是什么？如何使用？

### 【问题】
Flex 布局是什么？如何使用？

### 【回答】
Flex 布局（Flexible Box Layout Module）是一种用于在单一维度（水平或垂直）上排列子元素的布局模式。它提供了一种更有效的方式来布置、对齐和分配容器中项目之间的空间。

**1. 创建 Flex 容器**

在 CSS 文件中使用 `display: flex;` 将容器元素设置为 Flex 容器：

```css
.container {
  display: flex;
}
```

**2. 使用 Flexbox 属性定义布局**

常用的 Flex 容器属性：

```css
.container {
  display: flex;
  flex-direction: row;           /* 指定项目排列方向：row | row-reverse | column | column-reverse */
  justify-content: center;       /* 指定主轴上的对齐方式 */
  align-items: center;           /* 指定交叉轴上的对齐方式 */
}
```

**常用属性说明：**

- **flex-direction**：指定项目的排列方向
  - `row`：水平排列（默认）
  - `column`：垂直排列
  - `row-reverse`：水平反向排列
  - `column-reverse`：垂直反向排列

- **justify-content**：指定在主轴上如何对齐项目
  - `flex-start`：起始端对齐（默认）
  - `flex-end`：末端对齐
  - `center`：居中对齐
  - `space-between`：两端对齐，项目之间间隔相等
  - `space-around`：每个项目两侧间隔相等

- **align-items**：指定在交叉轴上如何对齐项目
  - `flex-start`：起始端对齐
  - `flex-end`：末端对齐
  - `center`：居中对齐
  - `stretch`：拉伸填满容器（默认）
  - `baseline`：基线对齐

**示例代码：**

```css
.container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
```

这个示例创建了一个 Flex 容器，其中的子元素会：
- 水平排列（row）
- 在主轴（水平方向）上居中对齐
- 在交叉轴（垂直方向）上居中对齐

**特点：**
- 代码简洁，语义清晰
- 强大的对齐和分布能力
- 自适应能力强，适合响应式布局
- 现代浏览器支持良好
- 实际项目中的首选布局方案

---

## 问题 14：详细说说 Flex 布局？

### 【问题】
详细说说 Flex 布局？

### 【回答】
Flex 布局是 CSS3 新增的一种布局方式，可以通过元素的 display 属性设置为 flex 从而它变成一个 flex 容器，它的所有子元素都会成为它的项目。

一个容器默认有两个轴：一个是水平的主轴，一个是垂直的交叉轴。

**常用的 Flex 布局属性有：**

- **flex-direction**：指定主轴方向，可设置为 row、row-reverse、column、column-reverse。

- **justify-content**：指定 flex items 主轴上的对齐方式，可设置为 flex-start、flex-end、center、space-between、space-around 等。

- **align-items**：指定 flex items 交叉轴上的对齐方式，可设置为 flex-start、flex-end、center、baseline、stretch 等。

- **align-self**：指定单个元素在交叉轴上的对齐方式，可覆盖 align-items 的设置。

- **flex-wrap**：指定是否换行，可设置为 nowrap、wrap、wrap-reverse 等。

**flex: 1**

这意味着该元素初始大小为 0，将根据可用空间自动增长或缩小。

```css
flex-grow: 1;
flex-shrink: 1;
flex-basis: 0%;
```

**flex: auto**

表示该元素的初始大小根据其内容或宽度/高度属性确定，然后根据可用空间进行调整。

```css
flex-grow: 1;
flex-shrink: 1;
flex-basis: auto;
```

**如何计算**

1. **flex-grow**：按指定比例瓜分剩余空间

   - 假设 ABC 盒子宽度均为 20px，都在父盒子 D 中排成一列，但还有 60px 没占满。
   - 将 flex-grow 属性值分别设置为 1、2、3
   - A 最后的宽度 = 60 * 1/6 * 1 + 20 = 30
   - B 最后的宽度 = 60 * 1/6 * 2 + 20 = 40
   - C 最后的宽度 = 60 * 1/6 * 3 + 20 = 50

2. **flex-shrink**：按指定比例压缩溢出空间

   - 假设 ABC 盒子宽度为 300px、150px、200px，flex-shrink 为 1、2、3
   - 子容器宽度总和为 650，溢出空间为 200
   - 总压缩：300 * 1 + 150 * 2 + 200 * 3 = 1200
   - A 的压缩率：300 * 1 / 1200 = 0.25
   - A 的压缩值：150 * 0.25 = 37.5
   - A 的实际宽度：300 - 37.5 = 262.5

3. **flex-basis**：用于设置 Flexbox 布局中某个元素在 flex 容器的主轴方向上的初始尺寸。

主轴：flex item 会沿着主轴从 start 往 end 方向排布。

交叉轴：当涉及到换行的问题时，就需要通过操作交叉轴的原性来进行设置了。

---

## 问题 15：display 和 visibility 的区别

### 【问题】
display 和 visibility 的区别

### 【回答】
- **display: none**：元素在页面上将彻底消失会脱离文档流，不占据页面空间。
- **visibility: hidden**：只是隐藏内容，并没有脱离文档流，DOM 结果均会存在，会占据页面的空间。
- **display: none**：会引起回流和重绘，**visibility: hidden**：不会触发回流但会引起重绘。

---

## 问题 16：什么是 margin 重叠？

### 【问题】
什么是 margin 重叠？

### 【回答】
**定义：**
在常规文档流中，两个或多个相邻的块级盒子（Block-level Box）的垂直方向（top/bottom）外边距会合并为一个单一的外边距，最终外边距的高度取两者中的最大值。这种现象即为 Margin Collapsing（外边距重叠）。

**关键点：**
- 只发生在块级元素的垂直方向
- 必须是处于常规文档流中
- 无浮动、无绝对定位、无 clear 清理的元素之间

---

## 问题 17：哪些情况会发生 margin 重叠？

### 【问题】
哪些情况会发生 margin 重叠？

### 【回答】
主要分为以下四大类场景：

**1. 相邻兄弟元素**
- 同一个父容器内的两个相邻块级子元素，它们的上下 margin 会重叠

**2. 父元素与第一/最后一个子元素**
- 父元素的 margin-top 与第一个子元素的 margin-top 重叠
- 父元素的 margin-bottom 与最后一个子元素的 margin-bottom 重叠
- 特例：如果父元素没有内边距（padding）或边框（border）包裹，子元素的 margin 会"穿透"父元素，导致父元素与其子元素一起向上或向下偏移

**3. 空的块级元素**
- 一个空的块级元素，既没有边框也没有内边距，且内部没有内容或清除元素，它的 margin-top 和 margin-bottom 会直接重叠

**4. 带有 clear 属性的元素**
- 元素设置了 clear 属性（如 clear: both）来清除浮动，其上下 margin 可能与其父元素或兄弟元素的 margin 发生重叠

---

## 问题 18：如何避免 margin 重叠？

### 【问题】
如何避免 margin 重叠？

### 【回答】
破坏 margin 重叠的"触发条件"即可，核心思路是创建独立的 BFC 或增加隔离层：

**1. 创建 BFC（最推荐）**
为其中一个或两个元素创建块级格式化上下文，使其成为一个独立的布局区域：
- 给元素添加 `float: left/right`（不推荐，会影响布局）
- 给元素添加 `position: absolute/fixed`（脱离文档流）
- 给元素添加 `display: inline-block` / `display: flex` / `display: grid`
- 给元素添加 `overflow: hidden` / `overflow: auto`（注意：内容不能被遮挡，否则失效）

**2. 增加隔离层**
- 在两个元素之间添加一个带 border 或 padding 的父容器/空 div
- 在垂直方向上添加一个高度为 0 的元素作为隔断

**3. 单一方向控制**
统一使用单一方向的 margin（例如只使用 margin-bottom，避免混用 margin-top 和 margin-bottom），通过约定来减少冲突

---

## 问题 19：Float 方案优缺点

### 【问题】
Float 方案优缺点

### 【回答】
**优点**：
- 兼容性极好，支持所有浏览器（包括老旧 IE）
- 实现简单，代码量少

**缺点**：
- 浮动元素会脱离文档流，可能导致父容器高度塌陷（需要清除浮动，如 `overflow:hidden` 或伪元素 `clearfix`）
- 布局灵活性差，后续扩展复杂布局（如多列、垂直居中）时很麻烦
- 容易影响周围元素的布局，维护成本高

---

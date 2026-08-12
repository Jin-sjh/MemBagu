---
category: CSS
topic: 常用属性
type: bagu
tags: [CSS]
difficulty: hard
created: 2026-07-24
---
# CSS 常用属性

---

## 问题 1：overflow 常用属性有哪些？

## 【问题】
overflow 常用属性有哪些？

## 【回答】
overflow 是 CSS 中用于控制内容超出容器元素时的表现方式的属性。其可用取值包括：

- **visible**：默认值，内容超出容器部分将显示在容器之外。

- **hidden**：超出部分将被隐藏，无法滚动查看。

- **scroll**：超出部分将被裁剪，但会出现滚动条以便查看全部内容。

- **auto**：自动决定是否显示滚动条或截断内容。

- **inherit**：继承父元素的 overflow 属性。

---

## 问题 2:transform 相较于 margin 的好处

## 【问题】
transform 相较于 margin 的好处

## 【回答】
1. 性能更好：使用 transform 属性来实现元素的移动、旋转等操作，浏览器不需要重新计算元素的布局和绘制，而是仅对元素进行单纯的变换。这样可以减少浏览器的重排 (reflow) 和重绘 (repaint) 操作，从而提高页面的渲染性能。

2. 不影响文档流：使用 margin 属性来实现元素的移动会影响到元素所在的文档流，可能会导致其他元素的位置发生变化。而使用 transform 属性可以将元素的位置进行调整，但不会影响到其他元素的布局和位置。

3. 可以使用硬件加速：一些浏览器支持使用 GPU 进行硬件加速来执行 transform 变换，这样可以进一步提高页面的渲染性能。

---

## 问题 3：哪些属性会触发 reflow？

## 【问题】
哪些属性会触发 reflow？

## 【回答】
触发 reflow（重排 / 回流）的属性是那些会改变元素几何尺寸或布局的属性，浏览器需要重新计算元素的位置和大小，并更新整个渲染树的布局。

常见属性包括：

- **盒模型相关**：width / height / margin / padding / border / box-sizing

- **布局相关**：display / float / clear / position / top / left / right / bottom

- **文本相关**：font-size / font-family / line-height / text-align

- **其他**：overflow / min-height / max-width

---

## 问题 4：哪些只会触发 repaint？

## 【问题】
哪些只会触发 repaint？

## 【回答】
只会触发 repaint（重绘）的属性是那些不影响布局、只改变元素视觉外观的属性，浏览器不需要重新计算布局，只需要重新绘制像素。

常见属性包括：

- **颜色与背景**：color / background-color / background-image / background-repeat

- **边框样式**：border-style / border-color / border-radius

- **可见性与装饰**：visibility / text-decoration / box-shadow / outline

- **其他**：z-index（仅在层叠上下文变化时可能触发额外布局，通常只触发重绘）

---

## 问题 5：z-index 的生效范围

## 【问题】
z-index 的生效范围是什么？

## 【回答】
z-index 并不是对所有元素都生效，它的生效有严格范围：

**1. 仅对「定位元素」生效**

静态定位（`position: static`，默认值）的元素，设置 z-index 完全无效；

只有设置了非 static 定位（`relative/absolute/fixed/sticky`）的元素，z-index 才会生效。

**2. 受「父级层叠上下文」限制**

z-index 是相对父级层叠上下文比较大小，不能突破父容器层级。

简单说：子元素 z-index 再大，也盖不过父元素的兄弟元素。

**3. 层叠顺序规则（优先级）**

同层级下，z-index 数值越大，层级越高，显示越靠前；

数值相同则后来居上（DOM 靠后的元素覆盖前面的）。

---

## 真实业务 / 面试场景（案例补充）

### 场景 1：z-index 设了很大却盖不过兄弟元素
**背景**：弹窗 `z-index: 9999` 还是被旁边卡片压住。
**为什么**：z-index 只在"定位元素"上生效，且只能在同一个"父级层叠上下文"内比较；若父容器本身 z-index 较低或新建了层叠上下文，子元素再大也出不去。
**解决**：检查父级是否 `position: static`（需设 relative 等），或调整父级层叠上下文的层级。

### 场景 2：动画用 margin 位移导致页面卡顿
**背景**：列表项用 `margin-left` 做滑动动画，低端机掉帧。
**为什么**：改 margin 触发 reflow（重排），浏览器要重算布局。
**解决**：改用 `transform: translateX()`，只触发 composite，可走 GPU 硬件加速，不重排不重绘，流畅很多。

### 场景 3：面试——哪些属性触发 reflow，哪些只触发 repaint
**要点**：改 width/height/margin/position/font-size 等会触发 reflow（重排，最贵）；改 color/background/visibility/border-style 等只触发 repaint（重绘）；能用 transform/opacity 就尽量绕开 reflow，是性能优化关键点。

---

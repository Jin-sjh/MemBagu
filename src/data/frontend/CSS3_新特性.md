# CSS3 新特性

## 问题 1：CSS3 中有哪些新特性

### 【问题】
CSS3 中有哪些新特性

### 【回答】
- 新增各种 CSS 选择器（: not(.input)：所有 class 不是"input"的节点）
- 圆角（border-radius:8px）
- 多列布局（multi-column layout）
- 阴影和反射（Shadoweflect）
- 文字特效（text-shadow）
- 文字渲染（Text-decoration）
- 线性渐变（gradient）
- 旋转（transform）
- 增加了旋转、缩放、定位、倾斜、动画、多背景

---

## 问题 2：Animation 属性值有哪些？

### 【问题】
Animation 属性值有哪些？

### 【回答】
两个必要属性如下：

- animation-name，即动画名称。
- animation-duration，即动画持续时间。

其他属性值如下：

- animation-play-state，即播放状态（running 表示播放，paused 表示暂停），可以用来控制动画暂停。
- animation-timing-function，即动画运动形式。
- animation-delay，即动画延迟时间。
- animation-iteration-count，即重复次数。
- animation-direction，即播放前重置（alternate 动画直接从上一次停止的位置开始执行）。

---

## 问题 3：前端面试如何回答为什么 transform / opacity 更适合做动画？

### 【问题】
前端面试如何回答为什么 transform / opacity 更适合做动画？

### 【回答】
transform 和 opacity 更适合做动画，是因为它们只会触发浏览器的 composite（合成）阶段，不会触发 layout（回流）和 paint（重绘）。
这样可以避免大量计算，同时还能利用 GPU 加速，所以动画会更流畅、性能更好。

---

## 问题 4：CSS3 动画的优点是什么？

### 【问题】
CSS3 动画的优点是什么？

### 【回答】
优点如下：

1. 在性能上会稍微好一些，浏览器会对 CSS3 的动画做一些优化
2. 代码相对简单

---

## 问题 5：CSS3 动画的缺点是什么？

### 【问题】
CSS3 动画的缺点是什么？

### 【回答】
缺点如下：

1. 在动画控制上不够灵活
2. 兼容性不好
3. 部分动画功能无法实现

---

## 问题 6：CSS3 中 transition 属性值及含义是什么？

### 【问题】
CSS3 中 transition 属性值及含义是什么？

### 【回答】
transition 属性是一个简写属性，用于设置以下 4 个过渡属性：

- **transition-property**：哪个属性需要实现过渡。
- **transition-duration**：完成过渡效果需要多少秒/毫秒。
- **transition-timing-function**：速度效果的运动曲线，如 linear、ease-in、ease、ease-out、ease-in-out、cube-bezier。
- **transition-delay**：规定过渡开始前的延迟时间。

---

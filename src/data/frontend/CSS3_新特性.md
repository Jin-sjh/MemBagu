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

## 问题 2：前端面试如何回答为什么 transform / opacity 更适合做动画？

### 【问题】
前端面试如何回答为什么 transform / opacity 更适合做动画？

### 【回答】
transform 和 opacity 更适合做动画，是因为它们只会触发浏览器的 composite（合成）阶段，不会触发 layout（回流）和 paint（重绘）。
这样可以避免大量计算，同时还能利用 GPU 加速，所以动画会更流畅、性能更好。

---

---
category: CSS
topic: 响应式布局
type: bagu
tags: [CSS, 响应式布局, Media Query, Container Query, 响应式图片, 暗色模式]
difficulty: medium
created: 2026-09-21
---
# 响应式布局

## 【问题】
什么是响应式布局 / 响应式设计

## 【回答】
**响应式设计让同一内容根据容器、视口、输入能力和资源条件调整布局**，而不是为某个固定设备单独写一套页面。它让同一份结构在不同宽度、不同输入方式和不同资源条件下都能良好呈现，是相对“为每种设备单独适配”的更通用的做法。

---

## 【问题】
响应式断点应该怎么定？为什么不能按设备型号硬编码

## 【回答】
**断点应由内容何时拥挤来决定，而不是按某个设备型号硬编码**。响应式设计关注的是内容在多大宽度下开始难以阅读或排布，因此断点要基于布局需求和真实设备分布来定，而不是基于“iPhone / 平板”这类具体型号。用设备型号硬编码断点，会在新设备出现时迅速失效。

---

## 【问题】
Media Query 和 Container Query 有什么区别？分别适合什么场景

## 【回答】
**Media Query 观察视口 / 设备特征，适合页面级响应**；**Container Query 观察组件自身容器，更适合可复用组件**。页面整体布局切换（如导航在窄屏变抽屉）用 Media Query；而一个卡片组件要根据它所在容器宽度自适应排列时，用 Container Query 更合适，避免被页面视口绑架。

---

## 【问题】
如何实现响应式图片

## 【回答】
响应式图片使用 `srcset` 提供候选资源，`sizes` 告诉浏览器在不同条件下预期显示宽度，由浏览器结合 DPR 和网络选择最合适的那张。
```html
<img src="small.jpg"
     srcset="small.jpg 480w, medium.jpg 960w, large.jpg 1440w"
     sizes="(max-width: 600px) 480px, 960px"
     alt="示例">
```

---

## 【问题】
如何用纯 CSS 实现暗色模式

## 【回答】
通过 `prefers-color-scheme` 媒体查询结合 CSS 变量实现：根据用户对系统的明暗偏好切换变量取值，从而驱动整体主题，无需 JS 即可跟随系统。
```css
:root { --color-bg: #fff; --color-text: #111; }
@media (prefers-color-scheme: dark) {
  :root { --color-bg: #111; --color-text: #fff; }
}
body { background: var(--color-bg); color: var(--color-text); }
```

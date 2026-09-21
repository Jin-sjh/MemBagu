---
category: CSS
topic: 居中方案
type: bagu
tags: [CSS, 居中, Flex, Grid, 定位, 布局]
difficulty: medium
created: 2026-09-21
---
# 居中方案

## 【问题】
CSS 中有哪些常见居中方案？如何按场景选择？

## 【回答】
居中方案取决于**元素是否在普通流、是否已知尺寸、是单轴还是双轴、是否允许内容自适应**：

| 场景 | 推荐方案 | 关键点 |
|---|---|---|
| 块级水平居中 | `margin-inline: auto` | 元素需有可用宽度限制 |
| inline / inline-block | 父级 `text-align: center` | 行内格式化上下文 |
| Flex 双轴 | `justify-content: center; align-items: center` | 主轴/交叉轴由 direction 决定 |
| Grid 双轴 | `place-items: center` | 适合二维容器 |
| absolute 未知尺寸 | `inset: 50% auto auto 50%; transform: translate(-50%, -50%)` | 先定位中心再回移 |

不要只背一种"万能"方案。

---

## 【问题】
如何用 absolute + transform 实现未知尺寸元素居中？

## 【回答】
关键思路是**先定位到容器中心，再按自身尺寸回移**：
```css
.center {
  position: absolute;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
}
```
`inset: 50%` 把元素左上角移到中心，`translate(-50%, -50%)` 再向左上回移自身宽高的一半，从而真正居中，**无需已知元素宽高**。适合弹窗、覆盖层等脱离普通流的场景，但要考虑 containing block、溢出和无障碍焦点管理。

---

## 【问题】
如何用 Flex / Grid 实现水平垂直居中？

## 【回答】
Flex 双轴居中：
```css
.container { display: flex; justify-content: center; align-items: center; }
```
Grid 更简洁：
```css
.container { display: grid; place-items: center; }
```
两者**通常不依赖子元素固定宽高**，自适应能力强，是现代项目的首选方案。

---

## 【问题】
用纯 CSS 实现一个居中弹窗需要注意什么？

## 【回答】
布局上用 `position: fixed; inset: 0` 覆盖视口，内部容器 `display: grid; place-items: center`，面板设置 `width: min(560px, 100%)`、`max-height: min(720px, 100%); overflow: auto` 让其内部滚动且不随页面滚动。但**纯 CSS 只解决视觉布局**，完整组件还需焦点陷阱、Esc 关闭、关闭按钮、背景滚动锁和屏幕阅读器处理。

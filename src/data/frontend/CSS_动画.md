---
category: CSS
topic: 动画
type: bagu
tags: [CSS, 动画, transition, animation, 合成层, will-change]
difficulty: medium
created: 2026-09-21
---
# 动画

## 【问题】
transition 和 animation 有什么区别？分别适合什么场景

## 【回答】
**transition 描述属性从一个状态到另一个状态的过渡**；**animation 通过 `@keyframes` 描述多个时间点和可重复播放的动画**。简单状态切换用 transition，复杂关键帧或需要循环播放用 animation。

---

## 【问题】
timing function 和 fill-mode 分别有什么作用

## 【回答】
**timing function 决定时间到进度的映射**：`linear` 匀速，`ease` / `cubic-bezier` 可自定义曲线；**fill-mode 控制动画前后是否保留关键帧样式**（如 `forwards` 保留结束态、`backwards` 应用起始态）。

---

## 【问题】
为什么推荐用 transform / opacity 做动画？它们一定零成本吗

## 【回答】
**transform / opacity 在条件满足时更容易只走合成路径，降低 Layout / Paint 风险**，但不保证零成本。动画涉及尺寸、字体、复杂阴影、filter 或大面积内容时仍可能 Layout / Paint / 栅格化。
```css
.box { transition: transform 0.3s ease, opacity 0.3s ease; }
.box:hover { transform: translateX(20px); opacity: 0.8; }
```

---

## 【问题】
CSS 动画和 JS 动画怎么选

## 【回答】
看控制复杂度、交互驱动和可中断性。简单状态切换和声明式关键帧优先 CSS；需要按进度精确控制、可被交互中断或与状态强绑定时用 JS（如 Web Animations API / requestAnimationFrame）。

---

## 【问题】
`will-change` 有什么作用和注意事项

## 【回答】
**`will-change` 提示浏览器提前准备以优化动画元素**（如 `will-change: transform`），但滥用会增加合成层和 GPU 内存。应在真正需要优化的元素上按需使用，动画结束后及时去掉。

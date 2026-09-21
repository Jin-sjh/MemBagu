---
category: 浏览器
topic: requestAnimationFrame
type: bagu
tags: [浏览器, requestAnimationFrame, 动画, 渲染, 性能]
difficulty: medium
created: 2026-09-21
---
# requestAnimationFrame

## 【问题】
requestAnimationFrame 是什么？和 setTimeout 有什么区别？

## 【回答】
`requestAnimationFrame`（rAF）**请求浏览器在下一次重绘前调用回调**，适合把视觉更新与显示刷新节奏对齐。与 `setTimeout` 的区别在于：setTimeout 按**定时器队列调度，可能与绘制不同步**；rAF 面向**下一次绘制**，更适合动画和把一批高频事件更新合并为一帧。

注意 rAF **不是后台计算器，也不能自动消除长任务**——它只负责调度时机，不减少回调内部的工作量。

---

## 【问题】
如何用 requestAnimationFrame 做滚动节流？

## 【回答】
滚动节流的关键是**只保留"是否已预约"状态**，避免每个 scroll 事件都排一个 rAF。下面的模式在第一次 scroll 时预约一帧，帧内执行 `updateVisuals()` 并把 `scheduled` 复位，**把一帧内的多次高频事件合并成一次视觉更新**：

```js
let scheduled = false;
addEventListener('scroll', () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    updateVisuals();
  });
});
```

---

## 【问题】
requestAnimationFrame 是否保证 60FPS？回调执行过重会怎样？

## 【回答】
rAF **不保证 60FPS**，也不修复回调内部的长任务或昂贵布局。60Hz 约 16.67ms 一帧、120Hz 约 8.33ms，但**帧预算还要分给样式、布局、绘制和其他任务**。

如果 rAF 回调执行过重仍会**掉帧**；动画触发的 Layout/Paint 依然昂贵；后台标签页的 rAF 还可能被**暂停或降频**。必须用 Performance 验证真实帧时间与 Long Task，不能凭经验假设流畅。

---

## 【问题】
面试时怎么答 requestAnimationFrame？

## 【回答】
先说定义：**rAF 在下一次重绘前调度回调，能与屏幕刷新同步，适合视觉动画和批量 UI 更新**。再对比 setTimeout：rAF 面向绘制、timer 面向队列，rAF 更易合并高频更新。

然后澄清边界：**rAF 不保证 60FPS，不能消除回调内的长任务或昂贵布局；帧预算取决于刷新率和其他阶段**；后台标签页可能被暂停。最后给出验证方法：用 Performance 看帧时间、Long Task、Layout/Paint 与输入延迟，比较 rAF、timer 和 CSS animation 的真实结果，不靠经验臆断。

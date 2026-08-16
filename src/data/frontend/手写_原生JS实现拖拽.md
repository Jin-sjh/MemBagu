---
category: 手写
topic: 原生JS实现拖拽
type: bagu
tags: [拖拽, 原生JS, DragAndDrop, 事件模型, 手写代码]
difficulty: medium
created: 2026-08-12
---

# 原生JS实现拖拽

## 【问题】

面试被问「不用 react-dnd / sortablejs，原生 JS 怎么实现拖拽」，第一步该做什么？

## 【回答】

先**主动界定场景**，因为"拖拽"一词在面试里至少指向三类不同需求：

| 场景类型 | 典型需求 | 核心技术 |
| --- | --- | --- |
| 自由拖拽 | 将元素从 A 区拖到 B 区（如待办事项拖入已完成） | `drag` / `dragover` / `drop` 或 `mousedown` + `mousemove` |
| 排序拖拽 | 调整列表顺序（如看板卡片上下拖动排序） | 上述基础上增加"占位指示器"和"交换/插入逻辑" |
| 文件拖拽上传 | 从桌面拖文件到网页区域上传 | `dragenter` / `dragover` / `drop` + `DataTransfer.files` |

面试中**最常被追问的是前两种**。回答时先分清要的是"拖到另一个区域"还是"在列表里排序"，再决定实现复杂度。

整体推荐话术：优先选择**基于鼠标事件**来实现，因为**可控性更强、兼容性更好**。核心思路是用 `mousedown` 记录起始偏移量，用 `document` 级别的 `mousemove` 更新元素位置，用 `mouseup` 收尾清理。关键点是：**`mousemove` 和 `mouseup` 必须绑在 `document` 上保证不丢事件**；**用 `requestAnimationFrame` 做性能节流**；**如果需要跨页面滚动，要加上 `scrollX/Y` 补偿**。如果是排序场景，在此基础上增加占位指示器和插入索引计算。触屏支持用 `touch` 事件替换鼠标事件即可。

## 【问题】

用浏览器原生 HTML5 Drag and Drop API 怎么实现？优缺点是什么？

## 【回答】

HTML5 原生拖拽由浏览器托管，实现简单、无需自己算坐标，但**样式控制受限、移动端完全不支持**。

核心 API 与最小实现：

```javascript
// 拖拽源（被拖的元素）
element.addEventListener('dragstart', (e) => {
  e.dataTransfer.setData('text/plain', element.id);
  e.dataTransfer.effectAllowed = 'move';
});

// 拖拽目标（放置区）
target.addEventListener('dragover', (e) => {
  e.preventDefault(); // 必须阻止默认行为，drop 事件才会触发
  e.dataTransfer.dropEffect = 'move';
});

target.addEventListener('drop', (e) => {
  e.preventDefault();
  const id = e.dataTransfer.getData('text/plain');
  const draggedElement = document.getElementById(id);
  target.appendChild(draggedElement);
});
```

关键追问与结论：

- **`setData`/`getData` 存到哪里？** 存到 `DataTransfer` 对象中，这是一个**拖拽会话级别的数据存储，仅在本次拖拽操作期间有效**；可存多种 MIME 类型（`text/plain`、`text/html`、`text/uri-list`），按类型取用。
- **为什么 `dragover` 必须 `preventDefault()`？** 浏览器对 `div` 等元素**默认不允许放置**，需调用 `preventDefault()` 告诉浏览器"这里允许被 drop"，否则 `drop` 事件不会触发。
- **需要实时跟随光标 / 显示拖拽克隆体怎么办？** 在 `drag` 事件中更新反馈元素位置（注意 `drag` 触发频率极高，**不适合做重 DOM 操作，用 `requestAnimationFrame` 节流**），或通过 `e.dataTransfer.setDragImage()` 自定义幽灵图像。

缺点：**样式定制能力差**（幽灵图只能 `setDragImage` 设一张图或一个元素）、**移动端完全不支持**（需另写 `touch` 事件）、**跨浏览器行为有细微差异**（如 `drop` 触发时机）。

## 【问题】

基于鼠标事件模拟拖拽（`mousedown` + `mousemove` + `mouseup`）核心怎么写？有哪些必须注意的工程细节？

## 【回答】

这是**更通用、可控性更强**的实现，也是面试官最希望你讲清楚的方案。

```javascript
let isDragging = false;
let offsetX, offsetY;
let dragElement;

element.addEventListener('mousedown', (e) => {
  isDragging = true;
  dragElement = element;
  const rect = element.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;
  element.style.cursor = 'grabbing';
  element.style.zIndex = 999;
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging || !dragElement) return;
  requestAnimationFrame(() => {
    dragElement.style.left = (e.clientX - offsetX) + 'px';
    dragElement.style.top = (e.clientY - offsetY) + 'px';
  });
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  dragElement.style.cursor = '';
  dragElement.style.zIndex = '';
  dragElement = null;
});
```

必须讲清的关键细节：

- **`mousemove` / `mouseup` 为什么绑在 `document` 上？** 绑在元素上则鼠标移出元素边界后收不到 `mousemove`，拖拽会"断掉"；绑 `document` 可保证无论鼠标移到页面何处都能持续，直到松开。
- **`offsetX/Y` 与 `clientX/Y` 区别？** `clientX/Y` 是相对**浏览器视口**坐标；`offsetX/Y` 是相对**元素自身**（从左上角起）。用 `e.clientX - offsetX` 算出的是元素左上角应放置的视口坐标，**确保鼠标始终跟在拖拽元素的同一相对点上**。
- **页面有滚动怎么处理？** 需补偿滚动偏移：`left = (e.clientX - offsetX + scrollX)`，`scrollX = window.scrollX || window.pageXOffset`（同理 Y）；或改用 `position: fixed` 规避滚动影响。
- **性能节流：** `mousemove` 约 60fps，用 `requestAnimationFrame` 把 DOM 操作控制在每帧一次，避免频繁重排。
- **触屏支持：** 用 `touchstart` / `touchmove` / `touchend` 替换，`touchmove` 里 `e.preventDefault()` 阻止页面滚动，坐标取 `e.touches[0].clientX/Y`；`touchstart` 监听建议 `{ passive: false }`。
- **检测拖到了哪个元素上：** 用 `document.elementsFromPoint(x, y)` 取鼠标位置下的所有元素，再遍历判断命中目标（如 `classList.contains('drop-zone')`）并高亮。

## 【问题】

如果要做一个可排序列表（拖动一项到另一项的位置），核心逻辑和优化点是什么？

## 【回答】

这是 sortablejs 的核心思路：**占位指示器 + 插入/交换逻辑**。

```javascript
let dragIndex; // 被拖拽项索引
let targetIndex; // 目标位置索引
// mousedown 时记录 dragIndex
// mousemove 时遍历列表项，算当前鼠标下是哪一项，更新 targetIndex
// mouseup 时执行数组移动

function moveItem(from, to) {
  const items = [...list.children];
  if (from === to) return;
  const [removed] = items.splice(from, 1);
  items.splice(to, 0, removed);
  // 重新渲染列表
}
```

关键优化点：

- **避免频繁重排：** 拖拽过程中**不要每次都重渲染整个列表**。只移动被拖拽项 DOM 位置（`insertBefore` / `appendChild`），或用"占位元素"插在目标位置，拖拽结束后统一更新数据。
- **边界判断：** 用中线判定插入上下方——`midY = rect.top + rect.height / 2`，若 `e.clientY > midY` 插到该项下方，否则插上方。
- **节流：** `mousemove` 中做 `getBoundingClientRect` 等查询会触发回流，用 `requestAnimationFrame` 把 DOM 操作控制在每帧一次。

## 【问题】

和 react-dnd 这类库相比，原生实现有什么劣势？

## 【回答】

加分回答：原生实现的劣势在于**缺少封装好的抽象能力**——状态管理、拖拽预览、碰撞检测、跨屏交互都需要自己实现。此外，**跨 iframe、跨窗口拖拽，以及无障碍支持（ARIA）都是非常复杂的问题**。所以实际项目中若非极简场景，仍应优先选成熟库；但**理解底层原理能让你在遇到 bug 时快速定位，而不是盲目搜索**。

## 【考察点】

- API 熟悉度：知道 `drag` / `drop` / `dragover` 的触发顺序和 `preventDefault()` 的作用。
- 工程思维：事件绑在 `document` 上、`RAF` 节流、滚动偏移补偿。
- 边界意识：触屏适配、跨浏览器差异、性能优化、内存泄漏防范（拖完解绑/清理引用）。
- 技术判断力：能说清何时用库、何时自己写，不盲目造轮子也不过度依赖黑盒。

## 【衍生问题】

- 拖拽过程中如何做"碰撞检测"并自动吸附到最近容器？（待补充）
- 跨 iframe / 跨窗口拖拽在原生条件下如何实现？（待补充）
- 拖拽时的无障碍（ARIA `aria-grabbed` / 键盘可操作）应怎么设计？（待补充）
- 用 Pointer Events（`pointerdown`/`pointermove`）统一鼠标与触屏的方案有哪些取舍？（待补充）

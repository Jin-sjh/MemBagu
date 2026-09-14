---
category: React
topic: 10万行大表格渲染优化
type: bagu
tags: [React, 性能优化, 虚拟列表, 渲染优化]
difficulty: hard
created: 2026-09-14
---

# 10万行大表格渲染优化

## 【问题】
React 渲染 10 万行大表格的核心优化思路是什么？

## 【回答】
核心思想：**不要一次性渲染 10 万行 DOM**。React 的 JSX 与 Fiber 调度再强，也扛不住十万个 DOM 节点的挂载、更新与布局重排。

前提认知：**10 万行只是原始数据，可视区域永远只有几十条** —— 只渲染视口内的行，滚动时动态替换 DOM。

由此得出的优化主线是 **虚拟滚动（Virtual List）**，再在其上叠加 React 生态的最佳实践：

- **核心方案**：虚拟滚动（重中之重）
- **数据层**：原始大数据放 ref，不进 React state；筛选/排序结果用 `useMemo` 缓存
- **渲染层**：拆分组件、`React.memo` 阻断无意义重渲染、`useCallback` 稳定引用、`useTransition` 降低计算优先级
- **DOM / 样式层**：固定表头独立渲染、CSS class 代替内联 style、滚动事件节流
- **进阶**：后端分页懒加载、Web Worker 承接 CPU 密集型计算

## 【问题】
虚拟滚动（Virtual List）的实现原理是什么？

## 【回答】
市面上成熟库有 `react-window`（轻量）、`react-virtualized`（功能更强），也可以手写简易版本。原理：

1. 计算**容器高度**与**单行高度**；
2. 根据 `scrollTop` 算出**起始索引、结束索引**；
3. **只渲染 `[startIndex, endIndex]` 区间内的行**；
4. 外层放一个**占位 div**（高度 = 总行数 × 单行高度），把滚动条撑开；
5. 可视区域内的行用 `transform` 做位移，而不是 `margin` / `top`，**减少重排**。

## 【问题】
React 层面使用虚拟列表有哪些关键要点？

## 【回答】
1. **行组件必须 `memo`**，防止父组件因滚动重渲染时，所有可见行跟着做无意义的重渲染：

```jsx
const Row = React.memo(({ data }) => <tr>...</tr>)
```

> ⚠️ 注意：如果传了内联函数，`memo` 会失效，事件要用 `useCallback` 绑定。

2. **稳定 key**。虚拟列表的 key **不要用 index** —— 10 万行数据增删时 index 会错乱，直接用业务唯一 id：

```jsx
{visibleRows.map(item => <Row key={item.id} data={item} />)}
```

3. **固定行高优先**。动态行高会复杂很多，需要**缓存每行的实际高度**。

## 【问题】
React 状态管理层面（数据层）该如何优化大表格？

## 【回答】
1. **不要把 10 万行全部塞进 React state**。原始大数组放 `ref`，state 只维护**当前可视区域数据**、滚动位置、排序/筛选状态。ref 数据变更**不会触发组件重渲染**，适合存放纯原始大数据：

```jsx
const allDataRef = useRef<RowItem[]>(raw100kData); // 原始数据放 ref，不触发渲染
const [visibleData, setVisibleData] = useState<RowItem[]>([]);
```

2. **筛选 / 分页 / 排序在 `allDataRef` 上做纯 JS 计算**，不要在 render 里循环遍历 10 万条 —— render 函数里写 `filter` / `map` 遍历十万行，每次渲染都会重复计算，会卡死。用 `useMemo` 缓存计算结果，**依赖数组只放筛选条件**：

```jsx
const filteredData = useMemo(() => {
  return allDataRef.current.filter(...);
}, [keyword, sortField]); // 只有筛选条件变化才重算
```

3. **大数据不要做深拷贝，尽量只读引用**。

## 【问题】
如何利用 React 渲染机制与 Fiber 调度进一步优化大表格？

## 【回答】
1. **拆分组件，职责隔离**：
   - 外层容器：监听滚动、计算可视范围
   - 表格头部：固定表头，独立组件
   - 行：`Row` 组件，`memo`
   - 单元格：`Cell` 组件，尽量细粒度

   避免单个巨型组件承载全部逻辑，否则任何小改动都会触发整棵子树渲染。

2. **避免不必要的 Context 更新**。用 Context 传表格配置时，**不要把全量数据丢进 Context** —— Context value 引用变化会导致所有消费者重渲染，只传必要的配置。

3. **非紧急任务用 `useTransition`**（React 18+）。排序、筛选这类耗时计算标记为 transition，不阻塞 UI：

```jsx
const [isPending, startTransition] = useTransition();

const handleSort = () => {
  startTransition(() => {
    // 十万行排序计算，低优先级
  })
}
```

   这样页面滚动等高优先级任务优先执行，**减少卡顿感**。

## 【问题】
DOM 与样式层面有哪些与大表格配合的优化点？

## 【回答】
1. **固定表头**：表头单独一个 `table`，主体虚拟滚动区域另起一个 `table`，**不要一体渲染**；
2. **单元格样式用 CSS class**，不要用内联 `style` 做大量动态赋值；
3. **滚动容器**用 `overflow: auto`，但**不要在 `scroll` 回调里频繁 `setState`** —— 滚动事件触发频率极高，必须加**节流 throttle**。`react-window` 内部已做滚动优化，**自己手写虚拟列表一定要节流**。

## 【问题】
除了虚拟滚动，还有哪些额外优化点？

## 【回答】
1. **懒加载数据**。如果 10 万行来自后端接口，不要一次性拉全量，可以**虚拟滚动 + 后端分页**，滚动到底部再请求下一批，前端只缓存已加载的数据。
2. **避免大型对象作为 props 传递**。保证引用稳定，或解构出基础类型再传给 `memo` 行组件。
3. **禁用不必要的重渲染**：
   - `React.memo` 包裹纯展示组件
   - `useCallback` 稳定事件回调
   - `useMemo` 缓存计算结果
   > 注意：`memo` / `useMemo` 不是万能，本身有开销，**只在渲染开销大的组件上使用**。
4. **Web Worker（可选进阶）**。筛选、排序、格式化十万行这类 CPU 密集计算丢进 Web Worker，**不和 React 主线程抢时间**，防止页面卡死；主线程只负责渲染可视区域。

## 【问题】
虚拟列表方案如何选型？整体架构是怎样的？

## 【回答】
选型对比：

| 方案 | 适用场景 |
| --- | --- |
| `react-window` | **推荐**，轻量，虚拟列表，适合 10 万行表格 |
| `react-virtualized` | 功能多，支持冻结列、动态行高，体积更大 |
| 自己手写虚拟滚动 | 高度定制，但要处理边界（滚动、行高、缓冲区） |

架构总结：

```
TableContainer
├─ TableHeader（固定表头，memo）
└─ VirtualList（react-window）
   └─ Row（React.memo，key=业务 id）
      └─ Cell
```

- 原始 10w 数据存 `ref`；
- 筛选排序用 `useMemo` 缓存；
- 虚拟列表只渲染**视口 + 少量缓冲区**（上下多渲染几行防止滚动白屏）；
- 滚动事件**节流**；
- 耗时计算用 `useTransition` 或 Web Worker；
- 所有行组件 `memo`，事件用 `useCallback` 稳定引用。

## 【问题】
React 大表格渲染有哪些常见坑点（面试常问）？

## 【回答】
1. ❌ **直接渲染 10 万行 `<tr>`**：DOM 节点爆炸，挂载、重排极其耗时；
2. ❌ **key 用 index**：虚拟列表滚动时组件实例复用错乱；
3. ❌ **render 里循环 10 万行 `filter`**：每次渲染重复计算；
4. ❌ **滚动回调直接 `setState` 不节流**：高频更新导致卡顿；
5. ❌ **虚拟列表不加缓冲区**：滚动时出现白屏。

## 【考察点】
- 是否理解虚拟滚动的**索引计算 + 占位撑开 + transform 位移**三件套，而不是只会调库；
- 是否能区分「原始数据」与「渲染数据」，把大数组从 React state 挪到 ref；
- 是否知道 `memo` 在传入内联函数 / 不稳定对象引用时会**静默失效**；
- 是否能把优化按**数据层 / 渲染层 / DOM 层 / 计算层**分层回答，而不是罗列零散技巧。

## 【衍生问题】
- **动态行高虚拟列表**如何实现？（原文提到「需要缓存每行实际高度」，未展开，待补充）
- `useTransition` 与 `useDeferredValue` 在长列表场景下的**选型差异**？（待补充）
- 虚拟列表**缓冲区行数**如何确定，与滚动速度、行高有何关系？（待补充）
- `react-window` 与 `react-virtualized` 的**内部实现差异**（是否都用绝对定位 / transform）？（待补充）

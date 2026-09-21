---
category: 手写
topic: 原生JS实现Todo
type: bagu
tags: [手写, DOM, 事件委托, 状态管理, 局部更新, XSS]
difficulty: medium
created: 2026-09-21
---
# 原生JS实现Todo

## 【问题】
用原生 JS 实现 Todo 的核心流程是什么

## 【回答】
数据流为 **用户输入 → 事件监听 → 更新内存中的任务状态 → 更新 DOM → 浏览器 Layout / Paint**。先把用户操作转成任务状态，再据状态渲染界面，避免直接散落地操作 DOM。

---

## 【问题】
原生 DOM 操作常用哪些 API

## 【回答】
查询 `getElementById` / `querySelector` / `querySelectorAll`；内容优先 `textContent`，只有需解析 HTML 才用 `innerHTML`；节点 `createElement` / `append` / `remove`；样式 / 状态 `classList.toggle` / `dataset`；事件 `addEventListener`、`event.target`、`preventDefault`、`stopPropagation`。

---

## 【问题】
`textContent` 和 `innerHTML` 应该怎么选

## 【回答】
**优先 `textContent`；只有确实需要解析 HTML 时才使用 `innerHTML`**。用户输入不要直接拼接进 `innerHTML`，否则会引入 XSS 风险。任务文本用 `textContent` 写入能天然避免标签被解析。

---

## 【问题】
如何用事件委托处理动态列表？要注意什么

## 【回答】
把监听放在列表容器（稳定祖先），用 `event.target.closest('button')` 和 `dataset` 做边界判断，减少监听器数量；动态增删时无需逐个重绑。注意判断 `closest` 是否命中有效节点，未命中则直接 return。

---

## 【问题】
状态与 DOM 的关系应该怎么设计

## 【回答】
**推荐把“状态”和“渲染结果”分开**：用户操作先改变状态，再根据状态更新界面，避免直接散落地操作 DOM 导致数据不一致。DOM 是 HTML 的对象模型，不是完整的业务状态。

---

## 【问题】
原生 DOM 和 Vue / React 框架怎么选型

## 【回答】
原生 DOM 适合**小型交互、无框架页面和理解浏览器基础**；复杂表单、跨组件状态和频繁更新用 Vue / React 更易维护，但要承担框架运行时、构建和抽象学习成本。依据是状态复杂度、组件复用、团队约束和性能预算，而非“原生一定快”或“框架一定慢”。

---

## 【代码】
```js
const state = [];

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  state.push({ id: crypto.randomUUID(), title, done: false });
  input.value = '';
  render();
});

function render() {
  list.replaceChildren();
  for (const task of state) {
    const item = document.createElement('li');
    item.dataset.id = task.id;
    item.classList.toggle('done', task.done);
    item.append(document.createTextNode(task.title));

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = '删除';
    remove.dataset.action = 'remove';
    item.append(remove);
    list.append(item);
  }
}

list.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  const item = event.target.closest('li');
  if (!button || !item) return;
  const index = state.findIndex(task => task.id === item.dataset.id);
  if (index < 0) return;
  if (button.dataset.action === 'remove') state.splice(index, 1);
  render();
});
```

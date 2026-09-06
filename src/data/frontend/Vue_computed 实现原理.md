---
category: Vue
topic: computed 实现原理
type: bagu
tags: [Vue, computed, 缓存, lazy effect, dirty, 源码]
difficulty: hard
created: 2026-07-24
---
# Vue computed 实现原理

## 1. computed 是实时响应的吗？

## 【问题】
computed 是实时响应的吗？

## 【回答】
**是实时响应的。**

computed 会自动监听它内部用到的响应式数据（ref / reactive），只要依赖数据一变，计算属性就会自动重新计算并更新，页面也会同步刷新，并且自带缓存，依赖不变时不会重复执行。

---

## 2. computed 底层怎么实现的？

## 【问题】
computed 底层怎么实现的？

## 【回答】
**底层实现原理：**

- 响应式数据通过 **Proxy** 拦截 get（读取）和 set（修改）。

- 执行 computed 回调时，触发数据 get，Vue 进行**依赖收集**，记录该计算属性依赖哪些数据。

- 数据修改时触发 set，Vue **派发更新**，将对应 computed 标记为"脏（dirty）"。

- 下次读取 computed 时，若为脏数据则**重新计算并缓存结果**，否则直接返回缓存值。

- **本质：computed 是一个懒执行、带缓存的 watcher。**

---

## 3. computed 的缓存底层是怎么实现的？（lazy effect + dirty）

## 【问题】
computed 为什么能缓存？它的底层缓存机制（lazy effect + dirty 脏标记）是怎么工作的？

## 【回答】
**核心结论：computed 能缓存，靠的是 lazy（惰性）effect + dirty 脏标记；watch 没有这套机制，依赖变更就直接执行回调。概念区分：computed = 声明式派生数据；watch = 命令式副作用。**

**① lazy effect（惰性副作用）：** 普通 `reactive`/`ref` 的 effect **一旦依赖发生变化，立刻执行回调函数**；而 computed 创建的 effect 配置了 **`lazy: true`**：

1. **依赖改变的时候，不会立刻执行计算函数（getter）**，仅仅把 `dirty` 标记置为 `true`；
2. 只有**外部真正读取 `computed.value`** 的时候，才会去执行计算函数，拿到最新值。

> **不读取，就永远不跑计算逻辑，这就是"惰性"。**

**② dirty 脏标记：** `dirty` 是布尔标记：

- `dirty = true`：依赖已经更新，缓存值过期，需要重新执行 computed 的 getter 计算新结果；
- `dirty = false`：缓存有效，直接返回上一次计算保存的值，**不重新执行计算函数**。

完整流转流程：

1. 初始化 computed：创建 lazy effect，`dirty = true`；
2. 第一次读取 `computed.value`：dirty=true → 执行用户传入的 getter，收集内部响应式依赖 → 将结果缓存保存 → `dirty = false` → 返回缓存结果；
3. 后续再次读取：dirty=false → **直接返回缓存，完全不执行 getter**，这就是缓存效果；
4. computed 内部依赖发生变化（用到的 ref / reactive 改值）：触发 computed 的 lazy effect，**不运行 getter，仅把 `dirty = true`**；
5. 下次再读取 `.value`：发现 dirty=true，重新执行 getter，更新缓存，dirty 重置 false。

**重点：依赖变了，不会马上重算；等到你读的时候才重算。不读，就一直用旧缓存。**

伪代码简化示意（Vue 3 源码逻辑简化）：

```js
function computed(getter) {
  let value
  let dirty = true

  const effectFn = effect(getter, {
    lazy: true, // 惰性：依赖变化不立刻执行
    scheduler() {
      dirty = true // 依赖变化，只打脏标记，不执行 getter
    }
  })

  return {
    get value() {
      if (dirty) {
        value = effectFn() // 真正读取才执行 getter 计算
        dirty = false
      }
      return value // 返回缓存 value
    }
  }
}
```

---

## 4. computed 和 watch 的实现差异（面试必背对比）

## 【问题】
从实现机制上看，computed 和 watch 有什么本质区别？

## 【回答】
**watch 包装的是普通 effect，没有 lazy、没有 dirty 缓存：**

- 当监听的依赖发生变化，scheduler 会**立刻执行 watch 的回调函数**；
- watch 不在乎你有没有去读取结果，只要依赖变动，就命令式执行一段副作用逻辑（请求、赋值、修改 DOM 等）；
- **watch 不产生返回值，只做副作用。**

**computed 产出派生状态数据**，声明式描述"这个值由别的值计算得来"；计算逻辑有缓存，多次访问只执行一次 getter，依赖更新也不会立即计算，**读取才更新**。

```js
// watch：命令式副作用，依赖变就跑回调
watch(count, (newVal) => {
  console.log("count变了", newVal) // 依赖一变就执行，没有缓存
})
```

---

## 5. computed 依赖变了，为什么打印 computed.value 看不到立刻变化？

## 【问题】
computed 的依赖已经改变了，为什么立刻打印 computed.value 看不到变化？

## 【回答】
**依赖变更只会把 `dirty` 置为 `true`，不会执行 getter；只有访问 `.value` 的那一刻才重新计算。**

---

## 6. computed 不被读取时，依赖疯狂变化会频繁执行 getter 吗？

## 【问题】
如果 computed 既没被模板渲染、也没被 JS 读取，而它的依赖在疯狂变化，getter 会频繁跑吗？

## 【回答】
**不会。** 因为从来没有访问 `.value`，lazy effect 不会执行 getter，只会反复把 `dirty = true`，**计算逻辑完全不运行，性能很好**。

---

## 7. computed 的 setter 场景下，缓存逻辑还生效吗？

## 【问题】
computed 写成 getter / setter 形式时，getter 的缓存逻辑还生效吗？

## 【回答】
**生效。** getter 的缓存逻辑依旧（仍由 lazy effect + dirty 控制）；setter 是写入逻辑，手动修改 computed 时，内部会更新底层依赖源。

---

## 真实业务 / 面试场景（案例补充）

### 场景 1：列表搜索过滤，用 computed 还是 method
**背景**：一个 1000 条的用户列表，按关键词过滤。
**解决**：用 `computed filteredList()`——它带缓存，只有 `list` 或 `keyword` 变了才重算；若用 method，每次渲染（甚至无关数据变化）都会重跑过滤，白白消耗。

### 场景 2：computed 依赖没变，为什么返回旧值
**为什么**：computed 在依赖未变时直接返回上一次缓存结果（dirty 标记 false），不执行回调——这正是它"带缓存、懒执行"的体现，性能好。

### 场景 3：面试——computed、watch、method 怎么选
**要点**：computed 用于"依赖变化派生出新值"且有缓存；watch 用于"数据变化后要执行副作用"（如发请求、改 DOM）；method 每次调用都执行、无缓存。三者适用场景不同，不要混用。

---

## 【难点分析】
把"依赖变更"与"重新计算"解耦：依赖变更时 lazy effect 的 scheduler **只做 `dirty = true`（打脏）**，真正的重算被推迟到下一次读取 `.value`。需要把 `lazy: true` 的 scheduler 行为与 dirty 状态机（`true → false → true`）串起来理解，而不是直觉上认为"依赖一变就重算"。

## 【考察点】
- computed 缓存的两大支柱：**lazy effect + dirty 脏标记**
- 依赖变化时为什么不立即重算（scheduler 只打脏标记）
- dirty 状态机的完整流转：初始化 → 首次读 → 再读 → 依赖变 → 再读
- computed 与 watch 的本质区别：**声明式派生数据 vs 命令式副作用**
- 坑点：computed 不被任何地方读取时，依赖变化 getter 一次都不跑

## 【口诀】
1. **要得到一个新的派生数据 → computed（声明式，有缓存）**
2. **数据变化之后要做一件事：发请求、改别的变量、DOM 操作 → watch（命令式副作用）**

一句话背诵版：computed 的缓存底层依靠 **lazy effect + dirty 脏标记**。computed 的 effect 设置 `lazy: true`，当依赖变化不会立刻执行计算函数，仅仅将 dirty 置为 true；只有当读取 computed 的值时，如果 dirty 为 true 才重新执行 getter 计算并缓存结果，dirty 置 false；后续读取直接返回缓存。watch 没有这套惰性缓存机制，监听的依赖一旦变化就直接执行回调。

## 【衍生问题】
- computed 依赖另一个 computed 时，dirty 标记是如何向上传递的？（原资料未覆盖，待补充）
- Vue 3.4+ 对 computed 的失效传播（脏标记链）做了哪些优化？（原资料未覆盖，待补充）

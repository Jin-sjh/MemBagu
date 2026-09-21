---
category: Vue
topic: ref 与 reactive
type: bagu
tags: [Vue, ref, reactive, 响应式, Proxy, RefImpl, 源码, 面试]
difficulty: medium
created: 2026-09-06
---
# ref 与 reactive

## 【问题】
ref 和 reactive 有什么区别？平时开发应该怎么选型？（标准版，约 1.5 分钟，一面 / 基础考察可背这版）

## 【回答】
**ref 和 reactive 都是 Vue3 实现响应式的 API，底层基于 Proxy。**

**reactive** 接收对象、数组这类引用类型，返回原对象的 Proxy 代理，是**深层响应式**。它有局限：第一，**不能传基础数据类型**；第二，把整个变量**重新赋值会丢失响应式**；第三，**直接解构会丢失响应**。

**ref** 是为了解决 reactive 的限制而设计的，既支持基础类型，也支持对象。ref 会把值包装成一个带 `.value` 属性的对象：

- 传入**基础类型**：靠这个包装对象的 get/set 做**依赖收集和触发更新**；
- 传入**对象**：内部其实会调用 reactive，把代理后的对象存到 `.value` 上。

所以在 script 脚本里访问 ref 必须写 `.value`。

**模板自动解包**：只有**模板顶层直接使用 ref 变量**时，编译器才会自动加上 `.value`；如果 ref 是对象的属性，就不会自动解包，仍需手动写 `.value`。

**选型**：聚合的表单对象这类用 reactive；单独的布尔、数字等基础类型，或需要**整体替换对象**的场景优先用 ref；要解构 reactive 对象时，用 **toRefs** 保留响应式。

## 【问题】
ref 和 reactive 的底层实现原理是什么？（深挖版，二面 / 中高级追问底层用，重点说 Proxy、track、trigger、装箱）

## 【回答】
ref 和 reactive 都是 Vue3 响应式 API，核心依靠 **Proxy** 做对象劫持。

**1. reactive**：入参只能是引用类型，返回原始对象的 Proxy 代理实例，做深层递归代理。因为 Proxy 不能代理基础类型，所以 reactive 不支持 number、string。风险点：变量重赋值会切断 Proxy 引用、丢失响应；解构取出普通变量脱离代理、也会丢失响应。

**2. ref** 本质是手动"装箱"，返回一个 `{ value }` 的包装对象：

- 传入**基础类型**：没法用 Proxy，就利用包装对象的 getter/setter，**get 时 track 收集依赖，set 时 trigger 触发更新**；
- 传入**对象**：内部直接调用 reactive，将 Proxy 代理对象赋值给 `.value`。

这就是脚本中必须写 `.value` 的原因：**必须有一个能被劫持访问的属性，才能完成响应式追踪**。

**模板自动解包有严格限制**：仅模板**顶层作用域直接使用 ref 变量**，渲染层自动补 `.value`；ref 作为对象成员时不会解包。

**选型总结**：聚合状态对象用 reactive；基础类型、需要整体替换数据源用 ref；reactive 想解构时配合 toRefs，把每个属性转成 ref。

## 【问题】
为什么 ref 访问时必须写 .value？

## 【回答】
**Proxy 只能代理对象，不能劫持数字、字符串这种基础值。**

ref 把数据装进一个 `{ value }` 对象里，通过拦截 value 属性的 get/set 实现 track/trigger。所以脚本中访问必须 `.value`。

模板顶层则做了**语法糖自动省略**，可以不用写。

## 【问题】
ref 传入对象的时候内部发生了什么？

## 【回答】
ref 内部会判断：如果 value 是**对象**，直接调用 **reactive** 生成 Proxy，再赋值给 ref 实例的 `.value`。

所以 `ref(obj).value` 等价于 `reactive(obj)`。

## 【问题】
为什么解构 reactive 会丢失响应式？怎么解决？

## 【回答】
reactive 返回的是 Proxy 对象，**解构得到的是普通原始值**，脱离了 Proxy 的代理劫持，不再会触发 track/trigger，所以丢失响应式。

解决办法是用 **toRefs**，把每个属性转为 ref 对象，解构出来的仍是响应式引用。

## 【问题】
模板中什么情况下不会自动解包 ref？

## 【回答】
两种典型场景：

1. **ref 作为另一个对象的属性**：`{{ obj.refVal }}` 不会解包，需要写 `obj.refVal.value`；
2. ref 出现在**复杂表达式、函数返回值**中，也不会自动解包。

口诀：**只有模板顶层的裸变量才会自动解包**。

## 【问题】
实际开发中 ref 和 reactive 一般怎么选型？

## 【回答】
- 简单聚合对象用 reactive；
- 单个状态（loading、count）或**接口返回需要整体替换的数据**，优先用 ref；
- 现在很多 Vue3 项目直接**统一用 ref**，配合 toRefs 解构，规避 reactive 重赋值丢失响应的坑。

## 【问题】
关于 ref 和 reactive 有哪些容易说错、需要避雷的点？

## 【回答】
- ❌ 错误：ref 底层是 Object.defineProperty
  ✅ 正确：ref 的包装对象用 getter/setter；对象场景内部用 Proxy（reactive）
- ❌ 错误：模板里所有 ref 都会自动解包
  ✅ 正确：仅限顶层裸变量，属性引用不解包
- ❌ 错误：reactive 不能传数字字符串
  ✅ 正确：传基础类型不会报错，但不会有响应式

## 【问题】
ref 传入基本类型（如 `ref(123)`）和引用类型（如 `ref({name:'xxx'})`）时，`.value` 的实现有什么不同？（源码级 RefImpl 视角）

## 【回答】
ref 返回一个 **RefImpl 类实例**，内部用 `_value` 字段保存值，`.value` 走 getter/setter。两种入参的内部处理路径不同：

**① 传入基本类型（ref(123)）**

1. 创建 RefImpl 实例，原始基础值直接存入内部 `_value` 字段；
2. `.value` 的 getter：返回内部保存的基础值，同时 **track 收集依赖**；
3. `.value` 的 setter：赋入新基础值，**trigger 触发更新**；
4. 全程**不调用 reactive**，完全靠 RefImpl 类自身的 getter/setter 完成响应式。

**② 传入引用类型（ref({name:'xxx'})）**

1. 同样创建 RefImpl 实例；
2. 构造函数内部会把传入对象交给 **reactive() 转成 Proxy**，代理对象存入 `_value`；
3. `.value` 的 getter：返回这个 **reactive 代理对象**，同时收集依赖；
4. `.value` 的 setter：若新值仍是对象，再次经 reactive 代理后替换 `_value` 并触发更新；
5. 若修改的是 `.value.xxx` 属性：本质是操作 reactive 代理对象的内部属性，**由 Proxy 负责劫持，不走 ref 的 setter**。

伪代码示意（Vue 源码简化）：

```ts
class RefImpl<T> {
  private _value: T
  constructor(value: T) {
    // 对象则再包一层 reactive，基础类型原样保存
    this._value = isObject(value) ? reactive(value) : value
  }
  get value() {
    track() // 收集依赖
    return this._value
  }
  set value(newVal) {
    this._value = isObject(newVal) ? reactive(newVal) : newVal
    trigger() // 派发更新
  }
}
```

**一句话区分：**

- **基本类型 ref：响应式来自 RefImpl 类的访问器属性（getter/setter）；**
- **对象 ref：外层壳子仍是 RefImpl，内部实际响应能力委托给 reactive(Proxy)。**

## 【问题】
toRef、toRefs、toRaw 和 markRaw 各自是做什么的？怎么用？

## 【回答】
- **toRef**：为响应式对象的**单个属性**建立 ref 视图，保持与原对象的双向连接；
- **toRefs**：**批量**把每个属性转成 ref，适合把响应式对象暴露给组合式函数时**保留响应式**；
- **toRaw**：取得响应式对象的**原始对象**，用于特殊场景，但直接读写会**绕开代理、跳过追踪**；
- **markRaw**：让对象**不被转换为代理**，适合大型第三方实例、不可变数据等不应被代理的对象。

典型用法：`const { count } = toRefs(state)` 解构后仍是响应式引用；`const { count: c } = toRef(state)` 为单属性建 ref。

## 【问题】
shallowRef 和 shallowReactive 是什么？什么时候需要浅层响应式？

## 【回答】
`shallowReactive`（对应 reactive）**只处理根层属性**，不会递归代理内层对象；`shallowRef`（对应 ref）也只做浅层追踪。它们是**浅层版本**，用来降低深层递归代理带来的内存/CPU 成本。适用场景：数据为**大型第三方实例、不可变数据或不应被代理的对象**时，用 `shallow` 系列或配合 `markRaw` 控制开销；对象只根层变化时用 shallow 即可。代价是内层修改**不再自动触发更新**。

## 【问题】
面试时怎么答「ref 和 reactive 怎么选型」？（基础版）

## 【回答】
`ref` 通过 **`.value` 包装值**，适合**基本类型和可整体替换的状态**；`reactive` 通过 **Proxy 代理对象**，适合**结构化对象**。直接解构 reactive 属性可能**失去响应性**，`toRef / toRefs` 用于保留联系；选择看**数据形态、是否需要整体替换、是否需要浅层性能控制**。验证方式：用**组件更新观察和断点实验**验证解构、嵌套和 raw 行为。一句话：**组件/组合函数返回值通常用 ref 统一表达，复杂实体用 reactive。**

## 【问题】
为什么大型第三方实例或不可变数据可以用 markRaw 跳过代理？

## 【回答】
`reactive / ref` 默认会对对象做**深层递归代理**，对**大型第三方实例**（如图表库、第三方 class 实例）或**不可变数据**做代理既无意义又增加内存/CPU 开销，甚至破坏第三方对象内部逻辑。用 **`markRaw`** 标记后，该对象**完全跳过代理**，保持原始形态，避免无谓的响应式成本。类似的，若只需根层响应，可用 `shallowReactive / shallowRef` 减少深层代理开销。注意跳过代理后，对这些对象的修改**不再触发更新**。

---
category: Vue
topic: ref 与 reactive
type: bagu
tags: [Vue, ref, reactive, 响应式, Proxy, 面试]
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

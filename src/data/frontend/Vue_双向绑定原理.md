# Vue 双向绑定原理

## 1. Vue 双向绑定原理

【问题】
请简述 Vue 的双向绑定原理，包括 Vue2 和 Vue3 的实现方式及其区别。

【回答】
**Vue2:**
当创建 Vue 实例时，vue 会遍历 data 选项的属性，利用 `Object.defineProperty` 为属性添加 getter 和 setter 对数据的读取进行劫持（getter 用来依赖收集，setter 用来派发更新），并且在内部追踪依赖，在属性被访问和修改时通知变化。每个组件实例会有相应的 watcher 实例，会在组件渲染的过程中记录依赖的所有数据属性（进行依赖收集，还有 computed watcher, user watcher 实例），之后依赖项被改动时，setter 方法会通知依赖与此 data 的 watcher 实例重新计算（派发更新），从而使它关联的组件重新渲染。

一句话总结：vue.js 采用数据劫持结合发布 - 订阅模式，通过 `Object.defineproperty` 来劫持各个属性的 setter, getter，在数据变动时发布消息给订阅者，触发响应的监听回调。

**Vue3:**
使用了代理（Proxy）来替代 Vue2 中的 `Object.defineProperty` 实现数据的响应式。具体来说，当数据被初始化时，Vue3 会利用 ES6 的 Proxy 对象来代理数据对象的所有操作。通过 Proxy 可以拦截数据的读取和修改操作，并且自动追踪依赖和触发更新。Vue3 引入了 reactive 和 ref API 来创建响应式对象和响应式引用。使用 effect 函数来追踪副作用（例如视图的更新），当依赖的数据变化时，effect 会自动重新执行。

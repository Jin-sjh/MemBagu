# Vue keep-alive 组件

## 【问题】
请说明 `<keep-alive>` 组件的作用。

## 【回答】
当 `<keep-alive>` 包裹动态组件时，会缓存不活动的组件实例，而不是销毁它们。`<keep-alive>` 是一个抽象组件，它自身不会渲染一个 DOM 元素，也不会出现在父组件链中。

当在 `<keep-alive>` 内切换组件时，它的 `activated` 和 `deactivated` 这两个生命周期钩子函数将会执行。

```vue
<keep-alive>
  <component :is="view"></component>
</keep-alive>
```

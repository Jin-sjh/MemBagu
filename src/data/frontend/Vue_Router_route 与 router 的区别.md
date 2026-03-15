# Vue Router 中 route 与 router 的区别

## 1. 本质不同

- route 是当前路由信息对象，只读；
- router 是 Vue Router 的全局路由实例对象。

## 2. 作用不同

- route 用来获取路由信息，如 path、query、params、meta 等；
- router 用来执行路由操作，如 push、replace、go、back 等跳转方法。

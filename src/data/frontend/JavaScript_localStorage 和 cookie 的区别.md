# localStorage 和 cookie 的区别

## 问题

localStorage 和 cookie 的区别是什么？

## 回答

localStorage 的概念和 cookie 相似，区别是 localStorage 是为了更大容量的存储设计的。cookie 的大小是受限的，并且每次请求一个新页面时，cookie 都会被发送过去，这样无形中浪费了带宽。另外，cookie 还需要指定作用域，不可以跨域调用。

除此之外，localStorage 拥有 setItem、getItem、removeItem、clear 等方法，cookie 则需要前端开发者自己封装 setCookie 和 getCookie。但 cookie 也是不可或缺的，因为 cookie 的作用是与服务器进行交互，并且还是 HTTP 规范的一部分，而 localStorage 仅因为是为了在本地"存储"数据而已，无法跨浏览器使用。

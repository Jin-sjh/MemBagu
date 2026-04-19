# HTTPS 认证流程与 SSL/TLS 握手

## 1. 客户端发起请求，发送支持的加密套件、随机数 A

【问题】HTTPS 认证流程中，客户端发起请求时发送什么内容？

【回答】
客户端发起请求时发送：
- 支持的加密套件列表
- 随机数 A（Client Random）

## 2. 服务端返回证书

【问题】HTTPS 认证流程中，服务端返回证书包含什么？

【回答】
服务端返回证书包含：
- 公钥信息
- 证书颁发机构（CA）颁发
- 有效期、颁发国家、适用域名等
- 数字签名（CA 对证书信息进行签名）

## 3. 客户端验证证书

【问题】客户端如何验证证书的有效性？

【回答】
客户端验证证书的步骤：
- 浏览器验证证书的有效性（确认证书是否过期、是否被吊销）
- 使用 CA 的公钥解密数字签名，验证证书完整性
- 确认证书是由可信的 CA 颁发

## 4. 生成随机数 B，用公钥加密后发送给服务端

【问题】客户端生成随机数 B 后如何发送给服务端？

【回答】
- 客户端生成随机数 B（Pre-Master Secret）
- 使用服务端公钥加密随机数 B
- 发送给服务端，只有拥有私钥的服务端才能解密

## 5. 服务端用私钥解密，获取随机数 B

【问题】服务端如何获取随机数 B？

【回答】
- 服务端使用私钥解密客户端发送的加密数据
- 获取随机数 B（Pre-Master Secret）
- 此时双方都拥有：随机数 A、随机数 B、随机数 C（服务端生成的随机数）

## 6. 双方生成会话密钥，用对称加密传输后续所有数据

【问题】HTTPS 如何生成会话密钥？

【回答】
- 客户端和服务端都使用相同的算法，基于三个随机数（A、B、C）生成相同的会话密钥
- 后续所有数据传输都使用这个会话密钥进行对称加密
- 对称加密效率高，适合大量数据传输

---

## 7. Web Workers 应用、常见问题、应用场景

### 作用

【问题】Web Workers 的作用是什么？

【回答】
- 创建独立线程处理复杂计算、数据解析等耗时任务
- 将复杂任务分配到后台线程，避免阻塞主线程导致页面卡顿
- 主线程继续响应用户操作，保证页面流畅交互

### 应用场景

【问题】Web Workers 的应用场景有哪些？

【回答】
1. **复杂数学运算**：大量数据计算、矩阵运算、图像处理算法
2. **数据解析**：JSON 解析、XML 解析、大文件处理
3. **文件处理**：文件压缩、加密解密、格式转换
4. **实时数据处理**：实时音视频处理、传感器数据处理
5. **后台任务**：定时任务、数据同步、日志记录

### 常见问题

【问题】使用 Web Workers 需要注意哪些问题？

【回答】
1. **不能操作 DOM**：Worker 线程无法访问 DOM、window、document 对象
2. **通信开销**：主线程和 Worker 之间通过 postMessage 通信，数据需要序列化/反序列化
3. **同源策略**：Worker 脚本必须与主页面同源
4. **资源消耗**：每个 Worker 都是独立线程，创建过多会消耗大量内存
5. **生命周期管理**：需要手动终止 Worker，避免内存泄漏

---

## 8. 组件间通信（前端架构）

### 自底向上定义

【问题】什么是自底向上的组件通信？

【回答】
- 子组件通过事件（$emit）向父组件传递数据
- 父组件监听子组件事件，接收数据并处理
- 适用于子组件向父组件传递数据的场景

### 自顶向下传递

【问题】什么是自顶向下的组件通信？

【回答】
- 父组件通过 props 向子组件传递数据
- 子组件接收 props 并使用数据渲染
- 适用于父组件向子组件传递配置、数据的场景

### 适用跨层级通信

【问题】如何实现跨层级的组件通信？

【回答】
1. **Event Bus（事件总线）**：
```javascript
// 创建事件总线
const bus = new Vue()

// 组件 A 发送事件
bus.$emit('event-name', data)

// 组件 B 监听事件
bus.$on('event-name', (data) => {
  // 处理数据
})
```

2. **Vuex/Pinia 状态管理**：
```javascript
// 使用 Vuex 或 Pinia 管理全局状态
// 任何组件都可以访问和修改状态
```

3. **Provide/Inject（Vue）**：
```javascript
// 父组件提供数据
provide() {
  return {
    sharedData: this.data
  }
}

// 子组件注入数据
inject: ['sharedData']
```

---

## 9. 组件间通信（React）

### 自下向上（父子/兄弟）

【问题】React 中如何实现自下向上的组件通信？

【回答】
- 父组件通过 props 传递回调函数给子组件
- 子组件调用回调函数，传递数据给父组件
- 兄弟组件通信需要通过共同的父组件作为中介

### 自上向下（父子）

【问题】React 中如何实现自上向下的组件通信？

【回答】
- 父组件通过 props 向子组件传递数据
- 子组件接收 props 并使用数据
- 数据流向是单向的，从父到子

### 跨层级通信（Context）

【问题】React 中如何实现跨层级通信？

【回答】
```javascript
// 创建 Context
const MyContext = React.createContext(defaultValue)

// 父组件提供数据
<MyContext.Provider value={sharedData}>
  <ChildComponent />
</MyContext.Provider>

// 子组件消费数据
// 方式 1：Context.Consumer
<MyContext.Consumer>
  {value => <div>{value}</div>}
</MyContext.Consumer>

// 方式 2：useContext Hook
const value = useContext(MyContext)
```

---

## 10. 组件间通信（Vue）

### 自下向上触发事件

【问题】Vue 中如何实现自下向上的组件通信？

【回答】
- 子组件通过 `$emit` 触发事件，传递数据给父组件
- 父组件使用 `v-on` 或 `@` 监听子组件事件
```javascript
// 子组件
this.$emit('event-name', data)

// 父组件
<child-component @event-name="handleEvent"></child-component>
```

### 自上向下通过 props 传递

【问题】Vue 中如何实现自上向下的组件通信？

【回答】
- 父组件通过 props 向子组件传递数据
- 子组件通过 props 选项接收数据
```javascript
// 父组件
<child-component :message="parentData"></child-component>

// 子组件
props: ['message']
```

### 跨层级通信（Provide/Inject、Event Bus）

【问题】Vue 中如何实现跨层级通信？

【回答】
1. **Provide/Inject**：
```javascript
// 祖先组件提供数据
provide() {
  return {
    sharedData: this.data
  }
}

// 后代组件注入数据
inject: ['sharedData']
```

2. **Event Bus**：
```javascript
// 创建事件总线
const bus = new Vue()

// 发送事件
bus.$emit('event-name', data)

// 监听事件
bus.$on('event-name', callback)
```

---

## 11. 组件间通信（React）

### 自下向上（Event/Callback 等）

【问题】React 自下向上通信的方式有哪些？

【回答】
1. **回调函数（Callback）**：父组件传递回调函数给子组件，子组件调用回调传递数据
2. **事件提升**：将状态提升到共同的父组件，通过父组件协调兄弟组件通信
3. **Render Props**：父组件传递函数作为子组件的 children，子组件调用函数传递数据

### 自上向下传递

【问题】React 自上向下传递数据的方式？

【回答】
- 通过 props 传递：父组件将数据作为 props 传递给子组件
- 数据流向是单向的，从父组件流向子组件
- 子组件不能直接修改 props，需要通过回调函数通知父组件修改

### 适用跨层级通信

【问题】React 跨层级通信的解决方案？

【回答】
1. **Context API**：React 内置的跨层级通信方案
2. **状态管理库**：Redux、MobX、Zustand、Recoil 等
3. **自定义 Hooks**：封装共享逻辑，在多个组件中使用

---

## 12. 组件间通信（Vue）

### 自下向上触发事件

【问题】Vue 自下向上通信的方式？

【回答】
- 子组件使用 `$emit` 触发事件
- 父组件使用 `v-on` 或 `@` 监听事件
- 支持传递多个参数给父组件

### 自上向下通过 props 传递

【问题】Vue 自上向下通信的方式？

【回答】
- 父组件通过 props 传递数据给子组件
- 支持传递各种类型的数据（字符串、对象、数组、函数等）
- 子组件应该将 props 视为只读，不应直接修改

### 适用跨层级通信

【问题】Vue 跨层级通信的解决方案？

【回答】
1. **Provide/Inject**：祖先组件提供数据，后代组件注入使用
2. **Event Bus**：创建全局事件总线，任何组件都可以发送和监听事件
3. **Vuex/Pinia**：状态管理库，管理全局状态
4. **$attrs/$listeners**：透传 props 和事件到子组件

---

## 13. 组件间通信（总结）

### 自下向上（父子/兄弟）

【问题】组件通信自下向上的方式总结？

【回答】
**Vue：**
- `$emit` 触发事件
- `$parent` 访问父组件实例（不推荐）

**React：**
- 回调函数（Callback Props）
- 状态提升（Lifting State Up）

### 自上向下（父子）

【问题】组件通信自上向下的方式总结？

【回答】
**Vue：**
- `props` 传递数据
- `$children` 访问子组件实例（Vue 2，不推荐）

**React：**
- `props` 传递数据
- `children` props 传递组件

### 跨层级通信

【问题】组件跨层级通信的方式总结？

【回答】
**Vue：**
- Provide/Inject
- Event Bus（Vue 2）
- Vuex/Pinia（状态管理）
- `$attrs/$listeners`（透传）

**React：**
- Context API
- Redux/MobX/Zustand（状态管理）
- 自定义 Hooks

---

## 14. 组件间通信（React 两种方式、场景）

### 1) Vue / React 通用思考方向

#### a) Props / 属性传递

【问题】Props 传递的使用场景？

【回答】
- 父子：子 → 父（通过回调函数）
- 父子：父 → 子（直接传递 props）
- 适用：组件树层级较近的场景，数据流向清晰

#### b) 自定义事件 / 回调函数

【问题】自定义事件/回调函数的使用场景？

【回答】
- 父子：子 → 父
- 适用：子组件需要向父组件传递数据或触发父组件方法

#### c) Context / 状态管理

【问题】Context/状态管理的使用场景？

【回答】
- 跨层级：任意组件之间
- 适用：全局状态、主题配置、用户信息等需要多个组件共享的数据

### 2) Vue / React 各自特性

#### a) Vue：$emit / 事件总线 / 响应式系统特性

【问题】Vue 特有的通信方式有哪些？

【回答】
- `$emit`：子组件触发事件
- Event Bus：全局事件总线（Vue 2）
- 响应式系统：数据变化自动触发视图更新
- Provide/Inject：祖先组件提供数据给后代组件

#### b) React：回调、状态提升、无状态组件

【问题】React 特有的通信方式有哪些？

【回答】
- 回调函数：父组件传递回调给子组件
- 状态提升：将状态提升到共同父组件
- 无状态组件：函数组件通过 props 接收数据
- Hooks：useState、useContext、useReducer 等

#### c) 状态管理：Vuex / Pinia vs Redux / Zustand

【问题】Vue 和 React 的状态管理方案对比？

【回答】
**Vue：**
- Vuex：集中式状态管理，包含 state、getter、mutation、action、module
- Pinia：Vuex 的替代方案，更简洁，支持 TypeScript，去除了 mutation

**React：**
- Redux：集中式状态管理，包含 store、reducer、action、middleware
- Zustand：轻量级状态管理，API 简洁，无需 Provider 包裹
- MobX：响应式状态管理，自动追踪依赖

### 3) 全局状态管理

#### a) Vuex / Pinia / Redux / Zustand

【问题】主流状态管理库的特点？

【回答】
**Vuex（Vue）：**
- 单一状态树
- 严格模式，必须通过 mutation 修改状态
- 支持模块化

**Pinia（Vue）：**
- 去除了 mutation，直接修改 state
- 更好的 TypeScript 支持
- 支持代码分割

**Redux（React）：**
- 单一状态树
- 状态不可变，通过 reducer 修改
- 中间件机制强大

**Zustand（React）：**
- API 简洁，学习成本低
- 无需 Provider 包裹
- 支持中间件

#### b) provide / inject（Vue）/ Context（React）

【问题】Vue 的 provide/inject 和 React 的 Context 对比？

【回答】
**Vue provide/inject：**
- 祖先组件通过 provide 提供数据
- 后代组件通过 inject 注入数据
- 非响应式（除非传递响应式对象）

**React Context：**
- 通过 Context.Provider 提供数据
- 通过 Context.Consumer 或 useContext 消费数据
- 支持多个 Context 组合使用

#### c) 事件总线（Event Bus）（Vue 2）

【问题】Event Bus 的使用场景和注意事项？

【回答】
- 适用：Vue 2 中跨组件通信的简单方案
- 创建：`const bus = new Vue()`
- 发送：`bus.$emit('event', data)`
- 接收：`bus.$on('event', callback)`
- 注意：Vue 3 中已移除，建议使用 mitt 等替代方案
- 风险：事件过多时难以维护，容易产生命名冲突

---

## 15. 异步加载：三种常用技术

### 什么是异步加载？

【问题】什么是异步加载？

【回答】
异步加载是指不阻塞主线程，将耗时任务放到后台执行，完成后通过回调、Promise 或 async/await 通知主线程。主要用于网络请求、文件读取、定时任务等场景，避免阻塞 UI 导致页面卡顿。

### 三种常用异步加载技术

#### 1) async / 异步

【问题】async/await 的使用方式？

【回答】
```javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data')
    const data = await response.json()
    return data
  } catch (error) {
    console.error(error)
  }
}
```
- `async` 声明异步函数，返回 Promise
- `await` 等待 Promise 完成，语法更简洁，代码更易读
- 必须配合 try/catch 处理错误

#### 2) defer 属性

【问题】script 标签的 defer 属性有什么作用？

【回答】
```html
<script src="script.js" defer></script>
```
- 下载脚本：浏览器异步下载脚本文件
- 执行时机：DOM 加载完成后按顺序执行
- 适用场景：脚本依赖 DOM 结构，但不需要在下载时立即执行
- 注意：多个 defer 脚本按声明顺序执行

#### 3) 动态注入：HTML 解析完再执行，加载不阻塞

【问题】如何动态注入脚本？

【回答】
```javascript
const script = document.createElement('script')
script.src = 'script.js'
script.onload = () => {
  // 脚本加载完成后的回调
}
document.body.appendChild(script)
```
- 创建 script 元素并设置 src
- 通过 onload 监听加载完成
- 添加到 DOM 中开始加载
- 适用：按需加载、懒加载脚本

---

## 16. 脚本加载：代码执行时机

### 脚本不阻塞 HTML 解析的实现方案

【问题】如何实现脚本不阻塞 HTML 解析？

【回答】
1. **defer 属性**：异步下载，DOM 加载完成后执行
2. **async 属性**：异步下载，下载完成后立即执行（不保证顺序）
3. **动态注入**：通过 JavaScript 动态创建 script 标签
4. **放在 body 底部**：HTML 解析完成后再加载脚本
5. **模块加载**：使用 `<script type="module">`，默认 defer 行为

### 三种常用异步加载技术

#### 1) async 属性

【问题】script 标签的 async 属性有什么特点？

【回答】
```html
<script src="script.js" async></script>
```
- 下载：异步下载脚本，不阻塞 HTML 解析
- 执行：下载完成后立即执行，可能阻塞 HTML 解析
- 顺序：不保证执行顺序，多个 async 脚本谁先下载完谁先执行
- 适用：独立脚本，不依赖其他脚本和 DOM

#### 2) defer 属性

【问题】script 标签的 defer 属性有什么特点？

【回答】
```html
<script src="script.js" defer></script>
```
- 下载：异步下载脚本，不阻塞 HTML 解析
- 执行：DOM 加载完成后按顺序执行
- 顺序：多个 defer 脚本按声明顺序执行
- 适用：依赖 DOM 的脚本，需要保证执行顺序

#### 3) 动态注入

【问题】动态注入脚本的实现方式？

【回答】
```javascript
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = reject
    document.body.appendChild(script)
  })
}

// 使用
loadScript('script.js').then(() => {
  // 脚本加载完成
})
```
- 返回 Promise，支持 async/await
- 按需加载，灵活控制加载时机
- 适用：懒加载、条件加载、代码分割

---

## 17. 加密技术：前端加密方案

### 1. 加密技术概述

【问题】前端常用的加密技术有哪些？

【回答】
**对称加密：**
- 加密和解密使用相同的密钥
- 常见算法：AES、DES、3DES
- 优点：加密解密速度快
- 缺点：密钥分发困难

**非对称加密：**
- 加密和解密使用不同的密钥（公钥和私钥）
- 常见算法：RSA、ECC
- 优点：密钥分发安全
- 缺点：加密解密速度慢

**哈希算法：**
- 单向加密，不可逆
- 常见算法：MD5、SHA-1、SHA-256
- 用途：数据完整性校验、密码存储

### 2. 前端加密应用场景

【问题】前端加密的应用场景有哪些？

【回答】
1. **密码加密**：用户密码在传输前使用哈希算法加密
2. **敏感数据加密**：身份证号、银行卡号等使用 AES 加密
3. **签名验证**：使用非对称加密进行数字签名
4. **数据完整性校验**：使用哈希算法校验数据是否被篡改
5. **Token 加密**：JWT Token 使用签名算法保证安全性

### 3. 前端加密库

【问题】前端常用的加密库有哪些？

【回答】
- **crypto-js**：支持 AES、DES、RSA、MD5、SHA 等多种加密算法
- **bcrypt.js**：bcrypt 加密算法的 JavaScript 实现
- **node-forge**：支持 TLS/SSL、RSA、AES 等加密算法
- **JSEncrypt**：RSA 加密算法的 JavaScript 实现
- **Web Crypto API**：浏览器原生加密 API，性能更好

### 4. 加密技术选型建议

【问题】前端加密技术如何选型？

【回答】
1. **密码传输**：使用 HTTPS + 密码哈希（SHA-256）
2. **敏感数据存储**：使用 AES 对称加密
3. **数字签名**：使用 RSA 非对称加密
4. **数据完整性校验**：使用 SHA-256 哈希算法
5. **性能要求高**：优先使用 Web Crypto API

---

## 18. 前端性能优化：首屏加载优化

### 路由级别（路由懒加载）

【问题】如何实现路由级别的性能优化？

【回答】
**Vue Router 懒加载：**
```javascript
const routes = [
  {
    path: '/home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/about',
    component: () => import('@/views/About.vue')
  }
]
```

**React Router 懒加载：**
```javascript
import { lazy, Suspense } from 'react'

const Home = lazy(() => import('@/views/Home'))
const About = lazy(() => import('@/views/About'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  )
}
```

### 组件级别（组件懒加载）

【问题】如何实现组件级别的性能优化？

【回答】
**Vue 异步组件：**
```javascript
// 简单用法
components: {
  MyComponent: () => import('@/components/MyComponent.vue')
}

// 高级用法（带 loading 和 error 处理）
components: {
  MyComponent: () => ({
    component: import('@/components/MyComponent.vue'),
    loading: LoadingComponent,
    error: ErrorComponent,
    delay: 200,
    timeout: 3000
  })
}
```

**React 组件懒加载：**
```javascript
import { lazy, Suspense } from 'react'

const MyComponent = lazy(() => import('@/components/MyComponent'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <MyComponent />
    </Suspense>
  )
}
```

### 图片优化（懒加载、预加载、WebP）

【问题】图片优化的方式有哪些？

【回答】
1. **懒加载**：
```javascript
// 使用 Intersection Observer API
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target
      img.src = img.dataset.src
      observer.unobserve(img)
    }
  })
})

document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img)
})
```

2. **预加载**：
```html
<link rel="preload" as="image" href="critical-image.jpg">
```

3. **WebP 格式**：
```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="description">
</picture>
```

4. **响应式图片**：
```html
<img 
  srcset="small.jpg 480w, medium.jpg 768w, large.jpg 1200w"
  sizes="(max-width: 600px) 480px, (max-width: 900px) 768px, 1200px"
  src="medium.jpg"
  alt="description"
>
```

### 代码分割（Code Splitting）

【问题】如何实现代码分割？

【回答】
**Webpack 代码分割：**
```javascript
// 动态 import
const module = await import('./module.js')

// require.ensure（Webpack 3+）
require.ensure([], function(require) {
  const module = require('./module')
}, 'chunkName')
```

**Vite 代码分割：**
```javascript
// 动态 import，Vite 自动进行代码分割
const module = await import('./module.js')

// 手动指定 chunk
import { chunkA } from './chunkA.js'
```

### 缓存优化（浏览器缓存、CDN 缓存）

【问题】如何利用缓存优化性能？

【回答】
1. **浏览器缓存**：
```http
Cache-Control: max-age=31536000
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
Last-Modified: Wed, 21 Oct 2023 07:28:00 GMT
```

2. **CDN 缓存**：
- 静态资源上传到 CDN
- 配置 CDN 缓存策略
- 使用版本号或哈希值更新缓存

3. **Service Worker 缓存**：
```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request)
    })
  )
})
```

### 资源压缩（压缩图片、压缩代码）

【问题】如何进行资源压缩？

【回答】
1. **代码压缩**：
- Webpack：使用 TerserPlugin 压缩 JavaScript
- Vite：内置代码压缩功能
- CSS 压缩：使用 cssnano、clean-css

2. **图片压缩**：
- 在线工具：TinyPNG、Squoosh
- 构建工具：imagemin-webpack-plugin
- 格式转换：转为 WebP、AVIF 等高效格式

3. **Gzip/Brotli 压缩**：
```javascript
// Nginx 配置
gzip on;
gzip_types text/plain text/css application/json application/javascript;

brotli on;
brotli_types text/plain text/css application/json application/javascript;
```

---

## 19. 其他性能优化技术

### 防抖与节流

【问题】防抖和节流的区别和应用场景？

【回答】
**防抖（Debounce）：**
```javascript
function debounce(fn, delay) {
  let timer = null
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 适用场景：搜索框输入、窗口大小调整
```

**节流（Throttle）：**
```javascript
function throttle(fn, delay) {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

// 适用场景：滚动事件、按钮点击
```

### 虚拟列表

【问题】虚拟列表的实现原理？

【回答】
- 只渲染可视区域的列表项
- 监听滚动事件，计算可视区域范围
- 动态渲染对应范围的列表项
- 使用占位元素保持列表总高度
- 适用：长列表、大数据量列表

### 时间分片（Time Slicing）

【问题】时间分片的实现方式？

【回答】
```javascript
function timeSlicing(tasks, chunkSize = 16) {
  let index = 0
  
  function performTask() {
    const startTime = performance.now()
    
    while (index < tasks.length) {
      if (performance.now() - startTime > chunkSize) {
        requestAnimationFrame(performTask)
        return
      }
      
      tasks[index]()
      index++
    }
  }
  
  requestAnimationFrame(performTask)
}
```

### Web Workers

【问题】Web Workers 的使用场景？

【回答】
- 复杂计算：矩阵运算、图像处理、数据加密
- 数据解析：大文件解析、JSON 解析
- 实时处理：音视频处理、传感器数据处理
- 后台任务：定时任务、数据同步

---

## 20. 浏览器存储方案对比

【问题】Cookie、LocalStorage、SessionStorage、IndexedDB 的区别？

【回答】

| 特性 | Cookie | LocalStorage | SessionStorage | IndexedDB |
|------|--------|--------------|----------------|-----------|
| 容量 | 4KB | 5MB | 5MB | 大容量（取决于磁盘空间） |
| 生命周期 | 可设置过期时间 | 永久存储 | 会话结束清除 | 永久存储 |
| 与服务端通信 | 自动携带 | 不携带 | 不携带 | 不携带 |
| API | 原生 API 较复杂 | 简单易用 | 简单易用 | 复杂（基于回调） |
| 数据类型 | 仅字符串 | 仅字符串 | 仅字符串 | 任意类型 |
| 作用域 | 同源 | 同源 | 同源同窗口 | 同源 |
| 适用场景 | 身份认证、用户偏好 | 缓存、用户设置 | 临时数据 | 复杂数据、离线存储 |

**使用建议：**
- 身份认证：使用 Cookie（HttpOnly）
- 简单缓存：使用 LocalStorage
- 临时数据：使用 SessionStorage
- 复杂数据：使用 IndexedDB

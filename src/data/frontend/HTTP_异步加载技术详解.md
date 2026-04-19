# 异步加载技术详解

## 【问题】
请简述异步加载的概念、实现方式和应用场景。

## 【回答】

### 1 分钟精简版回答（直接背诵）

面试官您好，异步加载是指浏览器加载资源时不阻塞页面解析与渲染，通过并行、按需加载提升性能，核心解决同步加载的白屏、卡顿问题。

主要有三种实现方式：第一是 HTML 层面的脚本异步，包括 async、defer 和动态创建 script，分别解决无依赖、有依赖和按需加载的场景；第二是工程化层面的动态导入，基于 ES6 的 import() 结合 Webpack/Vite 实现代码分割，比如 Vue 的路由懒加载和组件懒加载，减少初始包体积；第三是资源层面的懒加载，通过 Intersection Observer 监听图片、视频等资源，进入视口再加载，降低初始带宽占用。

异步加载能有效优化首屏加载速度，但复杂 JS 执行阻塞仍需结合 Web Worker 等方案解决。

---

### 详细解析

#### 一、核心概念

**异步加载**：浏览器在加载外部资源（脚本、样式、图片等）时，不阻塞 HTML 文档的解析和渲染过程，允许页面继续构建和显示，资源在后台并行加载。

**对比同步加载**：
- 同步：遇到 `<script src="...">` 立即停止解析，下载并执行完成后才继续
- 异步：继续解析 HTML，资源下载完成后在合适时机执行

#### 二、三种实现方式

##### 1. HTML 层面的脚本异步

**async 属性**：
```html
<script src="analytics.js" async></script>
```
- 异步下载，不阻塞解析
- 下载完成后立即执行，会阻塞解析
- 不保证执行顺序
- **适用场景**：无依赖的独立脚本（统计、广告）

**defer 属性**：
```html
<script src="bundle.js" defer></script>
```
- 异步下载，不阻塞解析
- 等到 HTML 解析完成后按顺序执行
- 保证执行顺序
- **适用场景**：有依赖关系的脚本

**动态创建 script**：
```javascript
const script = document.createElement('script');
script.src = 'module.js';
document.body.appendChild(script);
```
- 完全按需加载
- 可控制加载时机
- **适用场景**：条件加载、懒加载

##### 2. 工程化层面的动态导入

**ES6 import()**：
```javascript
// 条件加载
if (needFeature) {
  import('./feature.js').then(module => {
    module.init();
  });
}

// Vue 路由懒加载
const routes = [
  {
    path: '/about',
    component: () => import('@/views/About.vue')
  }
];

// Vue 组件懒加载
const AsyncComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
);
```
- 返回 Promise
- 支持代码分割（Code Splitting）
- 减少初始包体积
- **适用场景**：路由级别、组件级别的按需加载

##### 3. 资源层面的懒加载

**图片懒加载**：
```html
<!-- 原生 loading 属性 -->
<img src="image.jpg" loading="lazy" alt="...">

<!-- Intersection Observer API -->
<img data-src="image.jpg" class="lazy" alt="...">

<script>
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});

document.querySelectorAll('.lazy').forEach(img => {
  observer.observe(img);
});
</script>
```

**视频懒加载**：
```html
<video preload="none" data-src="video.mp4">
  <source data-src="video.mp4" type="video/mp4">
</video>
```

- 降低初始带宽占用
- 提升首屏加载速度
- **适用场景**：长列表图片、视频资源

#### 三、性能优化效果

| 优化维度 | 同步加载 | 异步加载 | 提升效果 |
|---------|---------|---------|---------|
| 首屏时间 | 阻塞等待 | 并行加载 | 40-60% |
| 初始包体积 | 全部加载 | 按需加载 | 50-70% |
| 带宽占用 | 一次性 | 分批次 | 30-50% |
| 用户体验 | 白屏等待 | 渐进显示 | 显著提升 |

#### 四、局限性与补充方案

**异步加载的局限**：
- 复杂 JS 执行仍会阻塞主线程
- 无法解决计算密集型任务的卡顿

**补充方案**：
```javascript
// Web Worker 处理计算密集型任务
const worker = new Worker('worker.js');
worker.postMessage(data);
worker.onmessage = (e) => {
  console.log('Result:', e.data);
};

// requestIdleCallback 空闲时执行
requestIdleCallback(() => {
  // 非关键任务
});
```

#### 五、最佳实践总结

1. **第三方脚本**：优先使用 async
2. **业务脚本**：使用 defer 保证顺序
3. **路由/组件**：使用 import() 动态导入
4. **图片视频**：使用懒加载
5. **计算任务**：结合 Web Worker
6. **监控指标**：关注 FCP、LCP、TTI

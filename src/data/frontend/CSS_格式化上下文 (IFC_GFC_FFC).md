# CSS 格式化上下文 (IFC/GFC/FFC)

## 问题

了解 IFC 吗？GFC 和 FFC 听说过吗？

1. IFC 名为行级格式化上下文。

如何触发 IFC？
- 块级元素中仅包含内联级别元素。
- 形成条件非常简单，需要注意的是当 IFC 中有块级元素插入时，会产生两个匿名块将父元素分割开来，产生两个 IFC。

2. GFC 名为网格格式上下文。

如何触发 GFC？
- 当为一个元素设置 display 值为 grid 或者 inline-grid 的时候，此元素将会获得一个独立的渲染区域。

3. FFC 名为弹性格式上下文。

如何触发 FFC？
- 当 display 的值为 flex 或 inline-flex 时，将生成弹性容器（Flex Containers），一个弹性容器为其内容建立了一个新的弹性格式化上下文环境（FFC）

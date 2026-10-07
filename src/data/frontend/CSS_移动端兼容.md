---
category: CSS
topic: 移动端兼容
type: bagu
tags: [CSS, 移动端, H5, 兼容性, iOS, 安卓]
difficulty: medium
created: 2026-10-07
---
# 移动端兼容

## 【问题】
你解决了哪些移动端的兼容问题？

## 【回答】
常见移动端 H5 兼容问题及解决方案：

**1. 安卓环境下 placeholder 文字设置行高时会偏上**
input 有 placeholder 属性的时候**不要设置行高**。

**2. 移动端字体小于 12px 时异常显示**
应该先**把整体放大一倍，然后再用 transform 进行缩小**（如 `font-size: 24px` + `transform: scale(0.5)`）。

**3. iOS 下 input 按钮设置了 disabled 属性为 true 显示异常**
```css
input[type=button]{
    opacity: 1;
}
```

**4. 安卓手机下取消语音输入按钮**
```css
input::-webkit-input-speech-button{
    display: none;
}
```

**5. iOS 下取消 input 输入框在输入引文首字母默认大写**
```html
<input autocapitalize='off' autocorrect='off'/>
```

**6. 禁用 iOS 和安卓用户选中文字**
添加全局 CSS 样式：`-webkit-user-select: none`。

**7. 禁止 iOS 弹出各种窗口（长按菜单）**
`-webkit-touch-callout: none`。

**8. 禁止 iOS 识别长串数字为电话**
添加 meta 属性：
```html
<meta name='format-detection' content='telephone=no'>
```

**9. 设置 `overflow: scroll/auto` 时 iOS 上的滑动会卡顿**
使用 `-webkit-overflow-scrolling: touch` 开启惯性滚动。

## 【考察点】
- 移动端 H5 开发中对 iOS / 安卓差异的实操经验
- -webkit 私有前缀属性的使用（user-select、touch-callout、overflow-scrolling）
- meta 标签控制 iOS 默认行为（format-detection、autocapitalize）

## 【衍生问题】
- rem 与 px 的换算适配（1rem=16px 的基准换算问题）——待补充
- 移动端 1px 边框问题——待补充
- iPhone 安全区域 safe-area-inset 适配——待补充
- 移动端点击 300ms 延迟——待补充

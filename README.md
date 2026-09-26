# Edge Fluent Scrollbars

![Edge Fluent Scrollbars](Chromium%20(.crx)/images/icon.png)

一个专用于 Microsoft Edge 的轻量扩展：当新版 Edge 的内置 Fluent 覆盖式滚动条失效时，在普通网页中恢复接近原版的细滚动条外观和交互。

当前扩展版本：**1.1.1**

本项目由 [modern scroll](https://github.com/Christoph142/modern-scroll) 精简而来。设置页、自定义配色、滚动增强、超级滚动条、右键菜单、后台服务和同步存储等与目标无关的功能均已移除。

## 效果与功能

- 静止时只显示纤细滑块，不占用网页布局宽度
- 鼠标进入滚动条区域后，展开完整轨道、宽滑块与两端箭头
- 展开、滑块悬停和按下使用不同的 Edge 明暗色阶
- 根据网页配色和系统首选项自动切换浅色、深色样式
- 按设备像素比例校准宽度与左右间距，减少高 DPI 下的偏移
- 支持拖动滑块、箭头滚动、轨道平滑翻页和按住连续翻页
- 支持页面根滚动条、常规嵌套滚动区域和横向滚动条
- 保留浏览器原有的滚轮、触控板、键盘和中键滚动行为
- 尊重网站对嵌套滚动条的隐藏和尺寸设置，避免与 Telegram 等网站的自定义滚动条重复显示

## 安装

本项目是原生 Manifest V3 扩展，不需要安装依赖、编译源码或运行 GitHub Actions。

1. 下载或克隆本仓库。
2. 在 Edge 地址栏打开 `edge://extensions/`。
3. 开启“开发人员模式”。
4. 点击“加载解压缩的扩展”。
5. 选择仓库中的 `Chromium (.crx)` 文件夹。
6. 刷新已经打开的网页。

### 使用固定目录

如果不希望扩展目录随仓库位置变化，可以把 `Chromium (.crx)` 内的成品文件复制到：

```text
C:\Program Files (x86)\Microsoft\Edge\LocalExtensions\EdgeFluentScrollbars
```

写入 `Program Files` 需要管理员权限。这个目录只存放解压后的扩展文件，不会覆盖或修改 Edge 自带程序。

## 更新

更新本地文件后，在 `edge://extensions/` 中找到 **Edge Fluent Scrollbars**，点击“重新加载”，然后刷新网页。浏览器可能会缓存已加载的内容脚本，因此仅刷新网页不一定能立即应用新版本。

### 网站出现两个滚动条

Telegram 等网站可能隐藏浏览器原生滚动条，再自行绘制滑块。旧版扩展强制恢复嵌套区域的原生滚动条，可能使两条滚动条同时出现。**1.1.1** 保留网站设置的 `scrollbar-width`、`scrollbar-color` 以及原生滚动条的 `display`、宽高；普通嵌套滚动区域继续使用 Fluent 滑块样式。页面根区域设置 `overflow: hidden` 或 `clip` 时，也不再绘制对应的覆盖滚动条。

这项兼容处理适用于使用相同隐藏方式的其他网站，无需逐个添加域名。更新后请重新加载扩展并刷新网站。网站自行绘制的滚动条会保留其原有外观；如果某个网站仍然重复显示，可以暂时停用扩展并刷新页面，并提供网址和截图以便排查。

## 权限与隐私

- 不申请 `storage`、`activeTab`、`contextMenus` 等额外权限
- 没有后台 Service Worker、设置页、遥测、统计或网络请求
- 内容脚本使用 `<all_urls>`，唯一用途是在普通网页中绘制和控制滚动条
- 不读取、保存或上传网页内容与浏览记录

## 打包

需要 ZIP 成品时，将 `Chromium (.crx)` 文件夹中的内容直接放到 ZIP 根目录：

```text
manifest.json
images/
includes/
```

不要在 ZIP 中再套一层 `Chromium (.crx)` 文件夹。GitHub Actions 仅在需要自动生成 Release 附件时才有必要，本地加载扩展不需要它。

## 项目结构

```text
Chromium (.crx)/
├─ manifest.json
├─ images/
│  ├─ icon.png
│  └─ icon@2x.png
└─ includes/
   └─ edge_fluent_scrollbars.js
```

## 实现依据

Microsoft Edge 基于 Chromium，但 Edge 整套浏览器并未完整开源。本扩展的尺寸与交互以 Chromium 的
[Fluent 原生主题实现](https://chromium.googlesource.com/chromium/src/+/main/ui/native_theme/native_theme_fluent.cc)
为基础，并依据当前 Edge 的实际渲染结果校准颜色、悬停状态和设备像素。

## 已知限制

- 无法修改 `edge://`、Edge 扩展商店、新标签页等受保护的浏览器界面
- 网页使用 Canvas 绘制或通过脚本完全自定义的滚动条无法统一替换
- 浏览器或网页禁止内容脚本运行时，扩展不会生效

## License

本项目保留上游项目的 [LICENSE.txt](LICENSE.txt)。Microsoft Edge 是 Microsoft Corporation 的商标，本项目与 Microsoft 无隶属关系。

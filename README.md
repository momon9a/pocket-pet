# 口袋桌宠 PWA

这是一个纯本地的 iPhone 桌宠 PWA 原型。它不需要后端，状态会保存在浏览器本地，支持 Service Worker 离线缓存。

## 本地运行

```powershell
powershell -ExecutionPolicy Bypass -File .\dev-server.ps1 -Port 8080
```

也可以直接双击 `start-server.bat`。

如果手机访问开发服务器很慢，可以先打开快速单文件版：

```text
http://你的电脑局域网IP:8080/fast.html
```

电脑和 iPhone 连接同一个 Wi-Fi 后，在 iPhone Safari 打开：

```text
http://你的电脑局域网IP:8080
```

然后点 Safari 的分享按钮，选择“添加到主屏幕”。

## 替换宠物和图标

- App 图标：替换 `icons/icon-192.png`、`icons/icon-512.png` 和 `icons/apple-touch-icon.png`。
- 页面里的桌宠：当前是 CSS 画出来的。后续可以把 `.pet` 里的占位结构改成 `<img>`，指向你的图片或 GIF。

## 注意

iOS 对 PWA 的完整离线缓存更偏好 HTTPS。局域网 HTTP 适合开发测试；如果要长期稳定添加到主屏幕，建议部署到 GitHub Pages、Cloudflare Pages 或 Vercel。

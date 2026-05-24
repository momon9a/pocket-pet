# 部署到 GitHub Pages

## 方法：网页上传

1. 打开 https://github.com/new
2. Repository name 填一个名字，比如 `pocket-pet`
3. 选择 `Public`
4. 不要勾选初始化 README
5. 点击 `Create repository`
6. 在新仓库页面点击 `uploading an existing file`
7. 上传 `github-pages-upload.zip` 解压后的所有文件
8. 点击 `Commit changes`
9. 进入仓库 `Settings` -> `Pages`
10. Source 选择 `Deploy from a branch`
11. Branch 选择 `main`，Folder 选择 `/ (root)`
12. 点击 `Save`

稍等 1 到 3 分钟，页面会变成：

```text
https://你的用户名.github.io/pocket-pet/
```

用 iPhone Safari 打开这个地址，再点分享按钮，选择“添加到主屏幕”。

## 后续替换图片

- 主屏幕图标：替换 `icons/icon-192.png`、`icons/icon-512.png`、`icons/apple-touch-icon.png`
- 页面宠物：当前在 `index.html` + `styles.css` 里用 CSS 画出，后续可以换成图片或 GIF。

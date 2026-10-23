# 解压大厅 · pudding games

静态 HTML 小游戏合集。入口：[index.html](./index.html)（GitHub Pages 部署后打开站点根路径即可）。

## 本地预览

```bash
python3 -m http.server 8080
```

浏览器打开 `http://127.0.0.1:8080/`。

## GitHub Pages

仓库：[zhaoleink/pudding.github.io](https://github.com/zhaoleink/pudding.github.io)

1. 将本仓库推送到 GitHub 的 **main** 分支（根目录含 `index.html`）。
2. 仓库 **Settings → Pages → Build and deployment**：
   - **Source** 选 **GitHub Actions**（推荐，仓库已含 `.github/workflows/deploy-pages.yml`）
   - 或选 **Deploy from a branch** → 分支 **`main`**，目录 **`/ (root)`**
3. 打开 **Actions**，等 **Deploy to GitHub Pages** 跑绿；Pages 设置页会出现站点 URL。

**访问地址**（项目站，路径带仓库名）：

`https://zhaoleink.github.io/pudding.github.io/`

若希望根域名 `https://zhaoleink.github.io/`（不带子路径），需把仓库改名为 **`zhaoleink.github.io`**（与用户账号同名的 Pages 仓库）。

根目录的 `.nojekyll` 用于让 GitHub 正常发布含下划线路径的静态资源。

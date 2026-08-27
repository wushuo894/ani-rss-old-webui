<div align="center">
  <img alt="ANI-RSS" height="80" src="public/icon-512.png" width="80"/>
  <h1>ANI-RSS Old WebUI</h1>
  <p>从 ANI-RSS <code>207831dd</code> 提取并独立维护的旧版 WebUI。</p>
</div>

## 使用

从 Releases 下载 `ani-rss-old-webui.zip`，在 ANI-RSS 的“设置 / 基本设置 / 页面设置 / WebUI”中上传。发布包根目录包含 `webui.json`，上传后可直接使用 `WebUIController` 检查更新、在线更新或删除并恢复内置界面。

## 开发

需要 Node.js 24+ 与 pnpm 11。

```bash
pnpm install
pnpm dev
```

默认将 `/api` 代理到 `http://127.0.0.1:7789`，也可以通过 `SERVER_HOST` 指定 ANI-RSS 后端地址。

```bash
SERVER_HOST=http://192.168.1.10:7789 pnpm dev
```

## 构建

```bash
pnpm test
pnpm build
pnpm verify
```

构建时会在 `dist/webui.json` 写入仓库、版本和发布文件名。Release 工作流从 `package.json` 读取版本号，创建对应的 `vX.Y.Z` Release，并将 `dist` 内容直接压缩到 `ani-rss-old-webui.zip` 根目录发布。

## 来源与许可

前端源码取自 [wushuo894/ani-rss](https://github.com/wushuo894/ani-rss) 原提交 `207831dd` 中的 `ani-rss-ui` 目录，并在此独立维护。项目沿用原仓库的 GNU GPL v2 许可。

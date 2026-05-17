# 全屋定制小红书文案生成器

一个面向全屋定制行业的静态 Web 工具。用户上传室内实景图后，页面会在浏览器本地分析图片色彩、亮度、明暗占比、画面比例和文件名关键词，并生成更适合小红书发布的图片分析结果、种草点、标题、正文、封面短句和标签。

## 功能亮点

- 图片上传、拖拽上传和空间预览。
- 本地图片分析：识别空间类型、整体风格、主色调、柜体设计、材质亮点、收纳亮点、灯光判断、发布角度和适合人群。
- 适配客厅、餐厅、厨房、卧室、衣帽间、玄关、儿童房、书房、展厅等全屋定制常见场景。
- 小红书文案升级：生成 5 个标题、1 篇真实分享口吻正文、封面短句、装修/全屋定制/高定木作相关标签。
- 文案重点讲“为什么值得参考”：比例、留白、材质光感、灯光层次、收纳动线和柜体收口，避免普通广告腔。
- 输出模块包括图片分析结果、种草点、小红书标题、正文、封面短句、标签，并支持一键复制。
- 简洁高级的响应式界面，无需后端即可在 GitHub Pages 部署。

## 本地运行

```bash
python3 -m http.server 4173
```

然后在浏览器访问：

```text
http://localhost:4173
```

## 文件结构

```text
index.html   # 页面结构
styles.css   # 高级简洁视觉样式
script.js    # 图片分析与文案生成逻辑
```

## GitHub Pages 部署

本仓库已配置 GitHub Actions 自动发布到 GitHub Pages：

- 工作流文件：`.github/workflows/deploy-pages.yml`。
- 发布内容：工作流会把当前仓库根目录的 `index.html`、`styles.css`、`script.js` 和 `.nojekyll` 复制到 `_site`，并将 `_site` 作为 GitHub Pages 静态站点发布。
- 触发方式：推送到 `main`、`master` 或当前 `work` 分支时自动部署，也可以在 GitHub 的 **Actions** 页面手动运行 `Deploy static site to GitHub Pages`。
- Pages Source：在 GitHub 仓库 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。
- 部署完成后：打开仓库 **Actions → Deploy static site to GitHub Pages**，进入最新成功的运行记录，在 `deploy` job 或部署摘要中查看 `page_url`；也可以在 **Settings → Pages** 查看最终网址。常见地址格式为 `https://<用户名或组织名>.github.io/<仓库名>/`。

仓库根目录包含 `.nojekyll`，用于让 GitHub Pages 直接按静态文件发布，不经过 Jekyll 处理。

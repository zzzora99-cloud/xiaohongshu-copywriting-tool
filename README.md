# 全屋定制小红书文案生成器

一个面向全屋定制行业的静态 Web 工具。用户上传空间图片后，页面会在浏览器本地分析图片色彩、亮度、比例和文件名关键词，并生成适合小红书发布的标题、正文、标签和封面文案。

## 功能亮点

- 图片上传、拖拽上传和空间预览。
- 本地图片分析：识别空间类型、风格倾向、材质氛围、收纳亮点、构图建议和小红书爆点。
- 适配客厅、厨房、卧室、衣帽间、玄关、儿童房等全屋定制常见场景。
- 支持选择品牌语气与客单价定位，生成更贴近门店运营、设计师或品牌账号的文案。
- 输出标题、正文、标签、封面文案，并支持一键复制。
- 简洁高级的响应式界面，无需后端即可运行。

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

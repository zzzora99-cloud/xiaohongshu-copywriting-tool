# 全屋定制小红书文案生成器

一个面向全屋定制、高定木作、别墅大宅客户的图片分析与小红书文案生成工具。用户上传室内实景图后，前端会请求后端接口分析空间类型、风格、主色调、柜体、材质、灯光、收纳和装修亮点，并生成更像小红书真实分享的标题、正文、封面短句和标签。

## 功能亮点

- 前端支持图片上传、拖拽上传、预览和一键复制。
- 后端接口 `POST /api/generate` 接收图片，并在服务端读取 `OPENAI_API_KEY` 调用视觉模型；API Key 不会出现在前端代码中。后端使用结构化 JSON 输出约束，减少字段缺失和文案跑偏。
- 结构化输出图片分析结果：空间类型、整体风格、主色调、柜体设计、材质亮点、收纳亮点、灯光、落地亮点、种草爆点、发布角度和适合人群。
- 小红书文案升级：生成 5 个标题、1 篇真实种草正文、封面短句和装修/全屋定制/高定木作相关标签；正文会围绕比例、留白、材质光感、灯光层次、柜体收口和收纳动线展开。
- GitHub Pages 静态部署可直接打开页面；由于 Pages 不运行 Node 后端，页面会自动切换为浏览器本地兜底分析。要使用真正视觉模型分析，请部署 Node 后端并配置环境变量。

## 本地运行

### 仅预览静态页面

```bash
python3 -m http.server 4173
```

然后在浏览器访问：

```text
http://localhost:4173
```

### 启动前端 + 后端接口

```bash
npm start
```

如果要启用 OpenAI 视觉模型分析，请先在后端环境中设置 API Key：

```bash
export OPENAI_API_KEY="你的 OpenAI API Key"
export OPENAI_MODEL="gpt-4.1-mini"
npm start
```

接口流程：

```text
前端上传图片 -> POST /api/generate -> 后端读取 OPENAI_API_KEY -> 调用视觉模型 -> 返回 analysis + copywriting -> 前端分模块渲染
```

## 文件结构

```text
index.html                         # 页面结构
styles.css                         # 高级简洁视觉样式
script.js                          # 前端上传、渲染、兜底分析和复制逻辑
server.js                          # Node 后端接口与 OpenAI Responses API 调用
package.json                       # 本地后端启动脚本
.github/workflows/deploy-pages.yml # GitHub Pages 发布工作流
.nojekyll                          # 让 GitHub Pages 直接发布静态文件
```

## GitHub Pages 部署

本仓库已配置 GitHub Actions 自动发布到 GitHub Pages：

- 工作流文件：`.github/workflows/deploy-pages.yml`。
- 发布内容：工作流会把当前仓库根目录的 `index.html`、`styles.css`、`script.js` 和 `.nojekyll` 复制到 `_site`，并将 `_site` 作为 GitHub Pages 静态站点发布。
- 触发方式：推送到 `main`、`master` 或当前 `work` 分支时自动部署，也可以在 GitHub 的 **Actions** 页面手动运行 `Deploy static site to GitHub Pages`。
- Pages Source：在 GitHub 仓库 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。
- 部署完成后：打开仓库 **Actions → Deploy static site to GitHub Pages**，进入最新成功的运行记录，在 `deploy` job 或部署摘要中查看 `page_url`；也可以在 **Settings → Pages** 查看最终网址。常见地址格式为 `https://<用户名或组织名>.github.io/<仓库名>/`。

> 注意：GitHub Pages 只能托管静态文件，不能运行 `server.js`。Pages 版本会正常展示页面并使用浏览器本地兜底分析；如果需要真正的后端视觉模型分析，请将 `server.js` 部署到支持 Node 的平台，并在后端平台配置 `OPENAI_API_KEY`。

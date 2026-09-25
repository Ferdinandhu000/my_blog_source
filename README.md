# HJ Blog

个人博客。首页是基于 [RhineLabUI](https://github.com/LBEILC/RhineLabUI) 改造的三维档案；文章、归档、搜索、终端和关于页是独立的静态页面。文章页不加载 Three.js。前端使用 Vite、TypeScript 和 Three.js，内容从 Markdown 在构建时生成。Hugo 不参与构建。

## 本地开发

使用 Node 24：

```sh
npm ci
npm run dev
```

发布前运行：

```sh
npm run build
npm run check:content
npm run preview
```

`dist/` 是完整静态站点。首页默认启用 Super Performance（三维画面以 50% 分辨率、最高 30 帧运行），音频关闭；设置中可以调整画质。若浏览器无法创建 WebGL 上下文，可从首页错误提示进入 `/archives/` 或 `/search/`。

## 发布文章

在 `content/articles/` 下新增 Markdown 文件。文件名可自行组织，公开文章必须有 `title`、唯一的英文 `slug` 和有效的 `date`，`category` 或 `categories` 可指定分类：

```md
---
title: 示例文章
slug: example-article
date: 2026-09-25
category: Notes
tags: [example]
draft: false
---

正文内容。
```

`draft: true` 的文章不会发布；文件名以 `_` 开头或以 `.en.md` 结尾的文件也不会进入中文首发索引。分类直接取自文章，无须维护固定列数或每列档案数。文章地址为 `/p/<slug>/`，修改现有 `slug` 会改变地址及 Giscus 的 pathname 映射。搜索索引、归档和三维档案都由同一组 Markdown 生成。正文支持目录、代码高亮、图片、`$...$` / `$$...$$` / `\(...\)` / `\[...\]` 公式。

旧文中的图片继续使用公开的 `Ferdinandhu000/my_blog_img` 图床；因此图片可用性仍取决于该仓库。新增图片可以放在文章 Markdown 所在文件夹，并用与文章 URL 相对的文件名引用。发布 Obsidian 笔记前先人工筛选并检查私人信息、内部链接和图片授权，不会自动同步整个笔记库。

## Netlify 预览与切换

`netlify.toml` 已指定 `npm run build` 与 `dist`，`.nvmrc` 指定 Node 24。将此分支从 `Ferdinandhu000/my_blog_source` 连接到一个**独立的 Netlify 预览站**，先确认文章、图片、Giscus、移动端和三维性能。现有站点在预览验收前继续运行旧部署。

验收后，将分支合并到 `main`，确认旧的 Hugo GitHub Actions 部署工作流已停用，再将原 Netlify 站点改连 `my_blog_source` 的 `main`。此后推送 Markdown 会触发 Netlify 自动构建。每天的统计工作流仍在 GitHub Actions 运行，使用生成的文章索引查找评论所属文章。

RhineLabUI 的原始 MIT 许可在 [RHINELABUI-LICENSE](RHINELABUI-LICENSE)。三维模型保留供首页使用；原项目的演示档案、音频、字体和美术源文件不进入发布构建。

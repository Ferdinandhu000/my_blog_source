# HJ Blog

胡珏的个人博客。首页是基于 [LBEILC 的 RhineLabUI](https://github.com/LBEILC/RhineLabUI) 改造的三维档案；从首页打开归档、搜索、终端、About Me 和文章时，内容显示在三维画面上的悬浮窗口中，画面暂停渲染并模糊。直接访问文章或归档等地址时使用相同风格的轻量静态背景，文章页不加载 Three.js。前端使用 Vite、TypeScript 和 Three.js，内容从 Markdown 在构建时生成。Hugo 不参与构建。

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

`dist/` 是完整静态站点。首页默认启用 Super Performance（三维画面以 50% 分辨率、最高 60 帧运行，实际帧率取决于设备），音频关闭；设置中可以调整画质。中文首页使用 `/`，英文首页使用 `/en/`，语言选择保存在本机并随地址切换。档案卡出现时会预取正文，打开阅读窗时复用已加载的文章。若浏览器无法创建 WebGL 上下文，可从首页错误提示进入 `/archives/` 或 `/search/`。

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

目前按主题分为「算法与数据结构」「Java 基础」「桌面开发」「AI 与研究」「开发实践」「随笔」。旧文章只更新分类与标签，保留原有 `slug` 和发布日期。首批从 Obsidian 人工整理的公开文章为梯度诊断、梯度裁剪与早停、Docker 和 FastAPI；实验日志、组会记录、个人练习及重复摘录未导入。

「收藏档案」使用访客浏览器的 `localStorage`：每个浏览器配置文件保存自己的列表，不公开、不跨设备同步；使用同一浏览器配置文件的人能看到相同的本地收藏。

About Me 和终端 `/whoami` 共用 `src/site-content.js` 中的双语资料。站点底栏链接至 RhineLabUI 原项目，原始 MIT 许可同时保留在发布目录。

旧文中的图片继续使用公开的 `Ferdinandhu000/my_blog_img` 图床；因此图片可用性仍取决于该仓库。新增图片可以放在文章 Markdown 所在文件夹，并用与文章 URL 相对的文件名引用。发布 Obsidian 笔记前先人工筛选并检查私人信息、内部链接和图片授权，不会自动同步整个笔记库。

## Netlify 预览与切换

`netlify.toml` 已指定 `npm run build` 与 `dist`，`.nvmrc` 指定 Node 24。当前重构分支连接到独立 Netlify 预览站，先确认文章、图片、Giscus、移动端和三维性能。构建使用 Netlify 的 `URL` 生成 canonical、双语 alternate 和站点地图；本地构建默认使用原站地址。

验收后，将分支合并到 `main`，再在 Netlify 将当前预览站的生产分支改为 `main`，由站点所有者调整主域名并触发一次新部署，以刷新页面元数据。此后推送 Markdown 会触发 Netlify 自动构建。每天的统计工作流仍在 GitHub Actions 运行，使用生成的文章索引查找评论所属文章。

RhineLabUI 的原始 MIT 许可在 [RHINELABUI-LICENSE](RHINELABUI-LICENSE)。三维模型保留供首页使用；原项目的演示档案、音频、字体和美术源文件不进入发布构建。

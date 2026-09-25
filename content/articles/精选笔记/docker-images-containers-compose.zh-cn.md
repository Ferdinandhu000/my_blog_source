---
title: "从镜像到 Compose：Docker 入门实践"
slug: docker-images-containers-compose
date: 2026-09-25
category: "开发实践"
tags: ["Docker", "容器", "Compose"]
description: "从个人 Docker 学习笔记整理镜像、容器、Dockerfile、数据卷和 Compose 的关系。"
---

这篇文章由我的 Obsidian Docker 学习笔记整理，保留最常用的概念与命令。初学 Docker 时，我觉得最容易混淆的不是某个命令参数，而是**镜像、容器与运行配置**这三层。

## 镜像、容器和仓库

- **镜像**打包运行应用所需的文件与配置，可被命名和分发。
- **容器**是由镜像创建的、相对隔离的运行进程。同一镜像可以启动多个容器。
- **仓库**保存和分发镜像；镜像名称中的标签用于选择具体版本，生产环境应避免把 `latest` 当作不可变版本号。

容器通常共享宿主机内核，和拥有独立客体内核的虚拟机不同。Docker Desktop 在 Windows 或 macOS 上会借助虚拟化环境运行 Linux 容器，因此“共享内核”要放在实际的 Linux 容器宿主环境中理解。

先运行一个可随时删除的本地示例：

```sh
docker run --rm --name demo-web -p 127.0.0.1:8080:80 nginx:alpine
```

打开 `http://127.0.0.1:8080` 可看到页面。`--rm` 表示容器停止后删除容器，`-p` 将容器的 80 端口映射到本机 8080；这里限定在 `127.0.0.1`，避免无意把练习服务暴露给局域网。

## Dockerfile 负责构建镜像

假设项目中有 `site/index.html`，可以用两行 Dockerfile 构建静态网页镜像：

```dockerfile
FROM nginx:alpine
COPY ./site/ /usr/share/nginx/html/
```

```sh
docker build -t demo-web:local .
docker run --rm -p 127.0.0.1:8080:80 demo-web:local
```

最后的 `.` 是构建上下文。修改本地文件后，需重新构建镜像；镜像不会随着源文件自动改变。实际项目还应写 `.dockerignore`，排除不需要进入构建上下文的文件。

## Compose 负责运行多项服务

Dockerfile 描述怎样构建一个镜像；Compose 文件描述要启动哪些服务，以及端口、环境变量和数据卷如何连接。单个网页服务也能用一个最小示例理解：

```yaml
services:
  web:
    build: .
    ports:
      - "127.0.0.1:8080:80"
```

```sh
docker compose up --build -d
docker compose ps
docker compose down
```

数据库等有状态服务需要为数据目录配置卷。普通 `docker compose down` 与 `docker compose down -v` 的区别要特别留意：后者还会删除项目声明的命名卷，可能清除数据。

**参考：**[Docker 的容器概念](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/)、[Dockerfile 指南](https://docs.docker.com/get-started/docker-concepts/building-images/writing-a-dockerfile/)、[Compose 快速入门](https://docs.docker.com/compose/gettingstarted/)。

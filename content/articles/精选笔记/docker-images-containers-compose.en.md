---
title: 'From Mirror to Common: Docker Introduction'
slug: docker-images-containers-compose
date: '2026-09-25'
category: Development Practice
draft: false
description: Learn from the individual Docker to sort out the relationship between mirrors, containers, Dockerfiles, data
  files and Compoce.
tags:
- Docker
- Containers
- Compose
---
This article is organized by my Obsidian Docker study notes, keeping the most common concepts and commands. At the beginning of Docker, I felt that it was not a command parameter that was most easily confused, but the three layers of mirrors, containers and operating configurations.

## Mirrors, containers and warehouses

- **Mirror** documents and configurations required for the operation of the packaged application can be named and distributed.
- **Containers** are relatively isolated processes created by mirrors. The same mirror can activate multiple containers.
- **Repository** to preserve and distribute mirror images; labels in mirror names are used to select specific versions, and the production environment should avoid`latest`Consider it a non-variable version number.

Packagings usually share the inner core of the host, unlike virtual machines that have a separate host. Docker Desktop operates Linux packagings in Windows or MacOS using a virtual environment, so "shared kernel" is understood in the actual Linux container host environment.

Start with a local example that can be deleted:

```sh
docker run --rm --name demo-web -p 127.0.0.1:8080:80 nginx:alpine
```

Open`http://127.0.0.1:8080`See pages.`--rm`Means that the container is removed after it has ceased,`-p`Map the 80 port of the container to the machine 8080; this is limited to`127.0.0.1`, avoid unintentional exposure of practice services to LAN.

## Dockerfile builds mirrors

Assumptions include`site/index.html`Two rows of Dockerfile can be used to construct static web images:

```dockerfile
FROM nginx:alpine
COPY ./site/ /usr/share/nginx/html/
```

```sh
docker build -t demo-web:local .
docker run --rm -p 127.0.0.1:8080:80 demo-web:local
```

Last.`.`is the construction context. The local file needs to be re-engineered; the mirror does not automatically change with the source file. The actual items should also be written`.dockerignore`, excludes files that do not require access to the built context.

## Compose runs multiple services

Dockerfile describes how to construct a mirror; Compose documents describe which services are to be started and how ports, environment variables and data files are to be connected. A single web service can also be understood with a minimum example:

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

Status services such as databases need to be configured for the data catalogue. Normal`docker compose down`and`docker compose down -v`Particular attention should be paid to the distinction: the latter would also remove the naming volume of the project statement and possibly remove the data.

**Ref:** [Docker's Concept of Containers](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/), [Dockerfile Guide](https://docs.docker.com/get-started/docker-concepts/building-images/writing-a-dockerfile/), [Compose Quick Start](https://docs.docker.com/compose/gettingstarted/).

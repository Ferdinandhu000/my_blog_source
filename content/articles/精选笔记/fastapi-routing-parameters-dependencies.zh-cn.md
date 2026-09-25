---
title: "FastAPI 路由、参数与依赖注入速记"
slug: fastapi-routing-parameters-dependencies
date: 2026-09-25
category: "开发实践"
tags: ["FastAPI", "Python", "API"]
description: "将 Obsidian 中的 FastAPI 基础笔记整理为可运行示例，串起路径、查询、请求体与依赖注入。"
---

这篇文章从我的 Obsidian《FastAPI基础》笔记整理而来。原笔记记录了路由、参数、响应、异常处理和依赖注入；这里把零散片段收束成一个可以运行的小例子。

## 一个完整的最小示例

安装带常用可选依赖的 FastAPI 后，将下面代码保存为 `main.py`：

```sh
python -m pip install "fastapi[standard]"
```

```python
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query
from pydantic import BaseModel

app = FastAPI()


class Item(BaseModel):
    name: str
    price: float


def page_size(limit: Annotated[int, Query(ge=1, le=100)] = 20) -> int:
    return limit


@app.get("/items/{item_id}")
def read_item(item_id: int, limit: Annotated[int, Depends(page_size)]):
    if item_id < 1:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"item_id": item_id, "limit": limit}


@app.post("/items")
def create_item(item: Item):
    return item
```

```sh
fastapi dev main.py
```

开发服务器启动后，可访问 `/docs` 查看自动生成的交互式 API 文档。

## 参数分别从哪里来

请求 `GET /items/3?limit=10` 时：

1. `item_id` 对应路径中的 `{item_id}`；声明为 `int` 后，FastAPI 会解析和校验它。
2. `limit` 来自 `?limit=10`；`Query(ge=1, le=100)` 限制允许范围。
3. `Depends(page_size)` 告诉 FastAPI 先调用 `page_size`，再把结果传给路由函数。这个位置将来也可以提供数据库会话或共享业务规则。

`POST /items` 的 JSON 请求体会按 `Item` 模型解析。示例返回模型本身，适合演示；真实接口通常还要明确状态码、数据持久化、异常类型和响应模型。`HTTPException` 是主动返回业务错误，和参数校验失败产生的响应不是同一回事。

## 什么时候用依赖注入

当多个路由都需要同一段参数解析、权限检查或资源获取逻辑时，依赖函数可以避免重复。不要把所有普通函数都改成依赖：只有需要 FastAPI 在请求期间解析并提供结果的逻辑，才适合放入 `Depends`。

**参考：**[FastAPI 入门](https://fastapi.tiangolo.com/tutorial/first-steps/)、[路径参数](https://fastapi.tiangolo.com/tutorial/path-params/)、[依赖注入](https://fastapi.tiangolo.com/tutorial/dependencies/)。

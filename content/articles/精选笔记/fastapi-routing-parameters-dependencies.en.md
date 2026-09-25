---
title: FastAPI Routes, Parameters and Dependence Injection Synopsis
slug: fastapi-routing-parameters-dependencies
date: '2026-09-25'
category: Development Practice
draft: false
description: Organises the FastAPI base notes of Obsidian as a runable example of a serial path, query, requesting body and
  dependent injection.
tags:
- FastAPI
- Python
- API
---
This article is based on my Obsidian "FastAPI Foundation" notes. The original notes document the route, parameters, response, abnormal treatment and dependence injection; here, the fraction is bound to a small case where it is operational.

## A complete minimum example

Saves the following code after installing an optional FastAPI with a common option`main.py`：

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

Accessible after server startup`/docs`View automatically generated interactive API documents.

## Where are the parameters coming from?

Request`GET /items/3?limit=10`Other Organiser

1. `item_id`in the corresponding path`{item_id}`;declare as`int`After that, FastAPI will parse and verify it.
2. `limit`From`?limit=10`；`Query(ge=1, le=100)`Limit the permissible scope.
3. `Depends(page_size)`Tell FastAPI to call first.`page_size`, then pass the result to the route function. This location will also provide database sessions or shared business rules in the future.

`POST /items`JSON REQUESTS to TRY`Item`Model resolution. The example returns the model itself, which is suitable for demonstration; the real interface is usually also required to specify the state code, data durability, unusual type and response model.`HTTPException`It is a voluntary return of business error, and it is not the same as the response resulting from the failure to verify the parameters.

## When do you have to rely on injection?

Reliance functions avoid duplication when multiple routes require the same parameter resolution, permission check or resource acquisition logic. Do not change all normal functions to depend: only if the logic that FastAPI interprets and provides the results during the request is needed will fit into`Depends`。

** Ref:** [FastAPI Introduction]https://fastapi.tiangolo.com/tutorial/first-steps/), [road parameters] (https://fastapi.tiangolo.com/tutorial/path-params/), [dependent injections] (https://fastapi.tiangolo.com/tutorial/dependencies/)。

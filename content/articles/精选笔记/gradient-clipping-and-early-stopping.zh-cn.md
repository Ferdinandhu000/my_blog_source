---
title: "梯度裁剪与早停：两种不同的训练保护"
slug: gradient-clipping-and-early-stopping
date: 2026-09-25
category: "AI 与研究"
tags: ["深度学习", "梯度裁剪", "早停"]
description: "梯度裁剪约束单次更新，早停依据验证集决定训练时长；附 PyTorch 实现与使用边界。"
---

这篇文章由我的 Obsidian 笔记《训练稳定性技术：梯度裁剪与提前停止法》整理而来。这两个方法经常一同出现在训练配置中，却解决不同问题：**梯度裁剪约束一次参数更新的输入，早停决定何时结束训练。**

## 梯度裁剪约束什么

设所有参数的梯度拼接为向量 $g$，最大允许范数为 $c$。按二范数裁剪的概念形式是

$$
g_{\mathrm{clip}} = g\cdot\min\left(1,\frac{c}{\lVert g\rVert_2}\right).
$$

当范数超过 $c$ 时，整组梯度按同一个比例缩小，方向基本保持不变；低于阈值时不修改。逐元素裁剪则分别限制各分量，可能改变方向。裁剪不能修复错误标签、无效损失或过高的学习率，只是让异常大的梯度不会原样传给优化器。

在 PyTorch 中，裁剪应放在反向传播之后、优化器更新之前：

```python
optimizer.zero_grad(set_to_none=True)
loss = loss_fn(model(inputs), targets)
loss.backward()

norm_before_clipping = torch.nn.utils.clip_grad_norm_(
    model.parameters(), max_norm=1.0, error_if_nonfinite=True
)
optimizer.step()
```

`clip_grad_norm_` 会原地修改梯度，并返回裁剪前的总范数。这里的 `1.0` 只是演示值；阈值应结合实际梯度分布选择，不存在适合所有模型的常数。如果使用自动混合精度的梯度缩放，应先按相应训练流程解除缩放，再裁剪。

## 早停看的是验证集

早停通常在每个 epoch 后评估验证损失。一个简单规则是：只有当验证损失至少改善 `min_delta`，才重置计数；连续 `patience` 次未改善便停止，并恢复表现最好的参数。

```python
import copy

min_delta = 0.001
patience = 5
max_epochs = 100
best_loss = float("inf")
bad_epochs = 0
best_state = None

for epoch in range(max_epochs):
    train_one_epoch(model, train_loader, optimizer)
    validation_loss = evaluate(model, validation_loader)

    if validation_loss < best_loss - min_delta:
        best_loss = validation_loss
        bad_epochs = 0
        best_state = copy.deepcopy(model.state_dict())
    else:
        bad_epochs += 1
        if bad_epochs >= patience:
            break

if best_state is not None:
    model.load_state_dict(best_state)
```

示例省略了设备、检查点落盘和训练状态恢复等工程细节。验证集波动较大时，过小的 `patience` 会过早结束；频繁根据测试集表现调早停规则，则会把测试集变相用于调参。

## 组合使用时如何判断效果

先记录未裁剪的梯度范数和训练、验证曲线，再加入裁剪；如果绝大多数训练步都触发裁剪，应检查阈值或上游训练配置。早停要和“固定 epoch、保存最佳验证检查点”的基线比较。两者都应放在同一数据划分和指标定义下评估。

延伸阅读：[如何读懂梯度信号](/p/gradient-flow-diagnostics/)。

**参考：**[PyTorch `clip_grad_norm_` 文档](https://docs.pytorch.org/docs/stable/generated/torch.nn.utils.clip_grad_norm_.html)、[PyTorch 参数优化教程](https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial)、[自动混合精度示例](https://docs.pytorch.org/docs/stable/notes/amp_examples.html)。

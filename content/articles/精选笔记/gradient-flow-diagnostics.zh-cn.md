---
title: "训练神经网络时，如何读懂梯度信号"
slug: gradient-flow-diagnostics
date: 2026-09-25
category: "AI 与研究"
tags: ["深度学习", "梯度", "训练诊断"]
description: "从链式法则出发，整理梯度范数、训练损失和验证损失该如何一起观察。"
---

这篇文章由我的 Obsidian 笔记《梯度分析的数学基础》整理而来。训练曲线不稳定时，我以前常先调学习率；更稳妥的做法是先弄清梯度在网络中如何传播，再判断异常发生在哪一层、哪一步。

## 梯度为什么会变大或变小

以最简单的梯度下降为例，参数更新可写为

$$
\theta_{t+1}=\theta_t-\eta\nabla_\theta L(\theta_t).
$$

深层网络中的反向传播依赖链式法则。某个较早的隐藏层收到的梯度，包含后续各层局部导数或雅可比矩阵的连乘。连乘可能让信号不断放大，也可能让信号逐渐衰减。不过，**不能仅凭某一层梯度范数大或小，就断言模型已经“梯度爆炸”或“梯度消失”**：层的规模、损失缩放、批量大小和优化器都会影响数值。

我会同时观察以下信号：

| 信号 | 值得追查的现象 | 先检查什么 |
| --- | --- | --- |
| 训练损失 | 突然跳升或变为非有限值 | 数据、学习率、数值运算 |
| 各层梯度范数 | 持续异常增大，或长期接近零 | 对应层、激活函数、初始化 |
| 参数更新幅度 | 与参数尺度相比过大或过小 | 学习率与优化器设置 |
| 验证损失 | 训练仍改善，验证却持续变差 | 泛化与过拟合，而非单纯梯度问题 |

## 在训练循环里记录梯度

PyTorch 在 `loss.backward()` 后将梯度写入参数的 `grad` 字段；读取应发生在清零之前。下面只展示诊断所需的部分：

```python
import torch

optimizer.zero_grad(set_to_none=True)
loss = loss_fn(model(inputs), targets)
loss.backward()

for name, parameter in model.named_parameters():
    if parameter.grad is None:
        continue
    gradient = parameter.grad.detach()
    print(name, gradient.norm(2).item(), torch.isfinite(gradient).all().item())

optimizer.step()
```

记录时保持同一套批量、损失定义和混合精度设置，比较**随时间的变化**比照搬一个通用阈值更有用。若使用梯度累积，要在完整累积周期结束时解读总梯度；若使用自动混合精度，记录和裁剪前还需考虑梯度缩放。

## 一个排查顺序

1. 确认输入、标签、损失和梯度没有 `NaN` 或 `Inf`。
2. 把发生异常的训练步与数据批次、学习率和梯度范数对齐。
3. 查看异常是否集中在特定层，而不是只看全模型平均值。
4. 对照训练与验证曲线：验证变差但训练正常，首先是泛化问题。
5. 再尝试学习率、初始化、归一化或[梯度裁剪与早停](/p/gradient-clipping-and-early-stopping/)，每次只改变少数变量。

这套记录不能自动给出原因，但能让调整有证据可循。

**参考：**[PyTorch 自动微分](https://docs.pytorch.org/tutorials/beginner/basics/autogradqs_tutorial)、[PyTorch 参数优化教程](https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial)、[自动混合精度示例](https://docs.pytorch.org/docs/stable/notes/amp_examples.html)。

---
title: MTGP-SMOTE论文研读笔记
slug: a-critical-reading-of-mtgp-smote-concepts-analysis-and-observations
date: 2025-09-13
category: "AI 与研究"
tags: ["论文研读","机器学习"]
---

<h2 id="问题背景">问题背景
</h2><p>解决分类问题是机器学习的其中重要的一个分支。要实现分类首先需要获得相应数据进行学习，而现实生活中我们得到的数据通常是不平衡的（例如银行需要对异常交易和正常交易数据进行分类，而学习的数据中大部分是正常的交易数据，异常交易数据毕竟占少数），这就会使分类的结果产生影响。为此，本论文所提出的MTGP-SMOTE方法在数据层面运用合成少数过采样技术（SMOTE）方法对原始数据进行过采样（oversampling），而后借助遗传编程中的多树遗传编程（Multitree Genetic Programming）策略，将单个树的运行结果作为一个独立的填补数据，从而实现多树对总体数据的填补。</p>
<h2 id="概念理解">概念理解
</h2><h3 id="majority-classmaj">Majority class（$Maj$）
</h3><p>原始数据集中样本数量较多的类别（例如银行交易数据中的正常交易数据）</p>
<h3 id="minority-classmin">Minority class（$Min$）
</h3><p>原始数据集中样本数量较少的类别（如异常银行交易）</p>
<h3 id="smote算法">SMOTE算法
</h3><p>SMOTE（Synthetic Minority Over-sampling Technique）合成少数过采样技术。</p>
<h4 id="算法流程">算法流程
</h4><ol>
<li>确定临近数量</li>
<li>选择近邻样本</li>
<li>合成新样本</li>
</ol>
<h3 id="遗传编程gp">遗传编程（GP）
</h3><p>遗传编程是一种模拟自然界进化过程的算法，包含以下组件：</p>
<h4 id="1-初始化initialization">1. 初始化（Initialization）
</h4><p>常用的初始化方法包括：</p>
<ul>
<li>Grow</li>
<li>Full</li>
<li>Ramped half-and-half</li>
</ul>
<p>本论文使用&quot;Ramped half-and-half&quot;方法进行初始化</p>
<h4 id="2-选择selection">2. 选择（Selection）
</h4><p>从当前代中选择某些个体作为下一代的父代的过程。本论文使用的选择方法是&quot;精英策略&quot;（elite strategy）和&quot;锦标赛选择&quot;（tournament selection）。</p>
<h4 id="3-适应度fitness">3. 适应度（Fitness）
</h4><p>衡量遗传过程质量的指标，对后续的交叉和变异操作起决定性作用。</p>
<h4 id="4-交叉crossover">4. 交叉（Crossover）
</h4><p>从两个随机选取的父代个体中产生两个子代个体进行互换。</p>
<h4 id="5-变异mutation">5. 变异（Mutation）
</h4><p>类似于生成新基因的过程，有助于形成种群多样性，使算法有可能跳出局部最优。</p>
<h4 id="6-复制replication">6. 复制（Replication）
</h4><p>父代个体在未经任何变化的条件下从当前代复制到新一代。（本论文使用的算子没有包括复制操作）</p>
<p>以上操作是否发生完全取决于该个体的适应度，即个体的适应度越大，被选中的概率越大。</p>
<h2 id="mtgp-smote的具体流程">MTGP-SMOTE的具体流程
</h2><ol>
<li><strong>确定需要填补的少数类的个体数量</strong>（即为树的数量）</li>
<li><strong>确定Terminal set和Function set</strong>，定义树中运算的基本结构</li>
<li><strong>获得目标评估对（Mait, Mint）</strong> 用于指导个体的生成。不同的树要分配不同的（Mait, Mint）作为后续评估目标生成的标准</li>
<li><strong>适应度评估</strong>：利用距离测量和角度测量两种方法进行评估，评价个体的生成情况，决定后续是否进行交叉或变异操作</li>
</ol>
<p><img src="https://raw.githubusercontent.com/Ferdinandhu000/my_blog_img/master/626225f8ad3de7a02010c0a0b910b100.png"



	loading="lazy"


>
<img src="https://raw.githubusercontent.com/Ferdinandhu000/my_blog_img/master/6b0c7285a1c9921f22464f2b4fc3e118.png"



	loading="lazy"


></p>
<h2 id="与stgp的区别">与STGP的区别
</h2><ol>
<li>STGP生成的一棵树只能作为一个样本，而MTGP同时生成多棵树作为一组样本，相比之下效率更高</li>
<li>在进行适应度评估中，STGP只是对每个样本进行独立评估，无法保证全局最优，而MTGP是将每个样本的适应度汇总成整体的适应度进行评估，分布上来看，生成样本的多样性更佳</li>
<li>在遗传操作上，MTGP相比STGP对优质样本个体进行保护，使生成的样本质量更佳</li>
</ol>
<h2 id="一些问题">一些问题
</h2><ol>
<li>
<p><strong>论文使用到了变异算子和交叉算子，为什么不考虑使用复制算子，复制算子的使用对整个系统会有什么影响？</strong></p>
</li>
<li>
<p><strong>该方法可以实现多元分类还是只能处理二元分类？</strong></p>
</li>
<li>
<p><strong>在处理实际问题时，树中存储的数据是什么？</strong></p>
</li>
</ol>

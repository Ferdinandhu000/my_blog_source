---
title: "Reading Notes on the MTGP-SMOTE Paper"
slug: a-critical-reading-of-mtgp-smote-concepts-analysis-and-observations
date: '2025-09-13'
category: AI & Research
draft: false
tags:
- "Paper Reading"
- "Machine Learning"
---
<h2 id="问题背景">Background
</h2><p>Addressing classification is one of the important branches of machine learning. In order to achieve classification, there is a need to learn from the corresponding data, and in real life the data we receive are often uneven (e.g. banks need to classify both unusual transactions and normal transactions, while most of the data studied are normal transactions, which are, after all, a minority), which can influence the results of the classification. To this end, the MTTGP-SMOTE approach presented in this paper used the synthesis of a few oversampling techniques (SMOTE) at the data level to sample raw data (oversampling) and then, using the Multitree General Programme (Multitree) strategy in the genetic programming, to use the results of the operation of individual trees as a stand-alone filling data, thus enabling multitrees to fill the overall data.</p>
<h2 id="概念理解">Conceptual understanding
</h2><h3 id="majority-classmaj">Majority class（$Maj$）
</h3><p>Category with higher number of samples of primary data (e.g., normal transaction data in bank transaction data)</p>
<h3 id="minority-classmin">Minority class（$Min$）
</h3><p>Category with lower number of samples from primary data concentration (e.g. unusual banking transactions)</p>
<h3 id="smote算法">SMOTE algorithm
</h3><p>SMOTE (Synthetic Mining Over-sampling Technique) synthesis of a few sampling techniques.</p>
<h4 id="算法流程">Algorithm Process
</h4><ol>
<li>Determine the approximate number</li>
<li>Select a nearby sample</li>
<li>Synthetic new samples</li>
</ol>
<h3 id="遗传编程gp">Genetic programming (GP)
</h3><p>Genetic programming is an algorithm that simulates the evolution of nature and contains the following components:</p>
<h4 id="1-初始化initialization">1. Initialization
</h4><p>Common initialization methods include:</p>
<ul>
<li>Grow</li>
<li>Full</li>
<li>Ramped half-and-half</li>
</ul>
<p>&quat; Ramped half-and-half&quat; method for initialization</p>
<h4 id="2-选择selection">2. Selection
</h4><p>The process of selecting certain individuals from the current generation as fathers of the next generation. The choice used in this paper is &quot; elitist strategy &quot; elite strategy and &quot; championship selection &quot; tournament action.</p>
<h4 id="3-适应度fitness">3. Adaptation
</h4><p>Indicators to measure the quality of genetic processes are decisive for subsequent cross-cutting and mutation operations.</p>
<h4 id="4-交叉crossover">Crossover
</h4><p>From two randomly selected fathers, two generations of individuals are exchanged.</p>
<h4 id="5-变异mutation">5. Mutation
</h4><p>A process similar to the generation of new genes contributes to the development of diversity of populations, making it possible for algorithms to escape local excellence.</p>
<h4 id="6-复制replication">Reproduction
</h4><p>The father-in-law reproduces from the current generation to the new generation without any change. (The algorithm used in this paper does not include reproduction)</p>
<p>Whether the above operations take place depends entirely on the individual ' s adaptability, i.e., the greater the individual ' s adaptability, the greater the probability of being selected.</p>
<h2 id="mtgp-smote的具体流程">MTTGP-SMOTE Specific Processes
</h2><ol>
<li><strong>Identification of a few categories of individuals to be filled</strong>(i.e. the number of trees)</li>
<li><strong>Determine Terminal Set and Function Set</strong>, define the basic structure of the operation in the tree</li>
<li><strong>(Mait, Mint)</strong>To guide the generation of individuals. Different trees are allocated different criteria (Mait, Mint) for subsequent evaluation objectives</li>
<li><strong>Assessment of adaptation</strong>: Assessment using distance and angle measurements, evaluation of individual generation and decision on subsequent cross-cutting or mutation</li>
</ol>
<p><img src="https://raw.githubusercontent.com/Ferdinandhu000/my_blog_img/master/626225f8ad3de7a02010c0a0b910b100.png"



	loading="lazy"


>
<img src="https://raw.githubusercontent.com/Ferdinandhu000/my_blog_img/master/6b0c7285a1c9921f22464f2b4fc3e118.png"



	loading="lazy"


></p>
<h2 id="与stgp的区别">Distinction from STGP
</h2><ol>
<li>STGP produces a tree that can only be used as a sample, while MTGP produces multiple trees as a group, which is more efficient than</li>
<li>In conducting adaptation assessments, STGP only independently assesses each sample and does not guarantee global excellence, while MTGP assesses the adaptation of each sample in aggregate and in terms of distribution, the diversity of the samples generated is better.</li>
<li>Genetically, MTGP protects high-quality sample individuals over STGP, resulting in better quality samples produced</li>
</ol>
<h2 id="一些问题">Some questions
</h2><ol>
<li>
<p><strong>The dissertation uses mutations and cross-calculators. Why not consider the use of copying algorithms, and what would the use of copying algorithms affect the system as a whole?</strong></p>
</li>
<li>
<p><strong>Can the methodology achieve multiple classifications or can it only deal with binary classifications?</strong></p>
</li>
<li>
<p><strong>What are the data stored in trees when dealing with practical issues?</strong></p>
</li>
</ol>

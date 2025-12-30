---
title: CMU15445lab记录
published: 2025-12-29
description: ""
tags: []
category: 学习
draft: false
---

## project 0 c++ primer
具体的project要求的任务请到[CMU官方课程网站](https://15445.courses.cs.cmu.edu/fall2025/project0/)查看
这个project的的主要任务是实现一个支持插入、计数估计和合并的基本 Count-min sketch 数据结构。主要的目的是让我们熟悉现代c++(c++17)的语法。需要知道移动语义、智能指针、原子计数类等知识。

这个任务还是比较容易完成的，按照实验说明跟着完成就可以实现，需要注意的是计数可能是多线程的，需要是线程安全的，实现线程安全用aotmic原子计数类就行。

## project 1 Buffer Pool Manager
具体的project要求的任务请到[CMU官方课程网站](https://15445.courses.cs.cmu.edu/fall2025/project1/)查看
第一个编程项目是实现数据库管理系统（DBMS）的缓冲池管理器。缓冲池负责将物理数据页在主内存的缓冲区和持久化存储之间来回移动。它还起到缓存的作用，将频繁使用的页面保存在内存中以加快访问速度，并将未使用或冷页面驱逐回存储设备。
感觉跟Mysql的Buffer Pool类似，读取数据的时候是以页为单位进行读取，project 1的主要任务就是实现它
### 第一个任务 Adaptive Replacement Cache (ARC) Replacement Policy

Buffer Pool的大小是固定的，如果满了又要读新的页进内存，就需要一种替换策略把在Buffer Pool中的页替换下来，第一个任务就是实现ARC替换算法
**ARC（Adaptive Replacement Cache，自适应替换缓存）** 是一种高性能的页面置换算法。它由 IBM 的 Nimrod Megiddo 和 Dharmendra S. Modha 在 2003 年提出。

ARC 的核心设计目标是结合 **LRU（最近最少使用）** 和 **LFU（最不经常使用）** 的优点，同时克服它们的缺点，并且能够根据工作负载的变化**自动调整**策略。

更多关于ARC算法，可以看看[这篇博客](/2025/12/30/ARC算法/)



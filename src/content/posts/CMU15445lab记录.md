---
title: CMU15445projec0记录
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


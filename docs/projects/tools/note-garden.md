---
layout: project
title: 知园 · 笔记整理工具
description: 用目录、标签与关联链接，把零散的学习记录整理为可以回看的知识地图。
date: '2026-10-15'
category: 工具与实验
directory: 效率工具
tags: [TypeScript, Markdown, 知识管理]
cover: mountain
featured: true
sample: true
---

## 为什么整理笔记

记录是开始，能够再次找到并使用，才让记录产生价值。这个示例描述一个以 Markdown 为基础的整理工具设想，用于演示作品集的内容结构。

## 功能设计

| 功能 | 目的 |
| --- | --- |
| 目录分类 | 帮助建立稳定的知识结构 |
| 主题标签 | 连接分散在不同目录的内容 |
| 双向关联 | 从当前问题找到相关笔记 |
| 全文搜索 | 按记得的片段重新找到记录 |

## 数据组织

尽量让内容不依赖特定界面。Markdown 保存正文，页面头部保存标题、日期、分类和标签。

```ts
interface Note {
  title: string
  category: string
  tags: string[]
  content: string
}
```

## 实践中的取舍

分类过细会增加维护负担，标签过多则会降低辨识度。可以先从少量稳定的一级目录开始，再随着内容增加调整结构。

## 相关笔记

阅读 [让笔记成为自己的知识地图](/journal/notes/knowledge-map.md)，了解这份设计背后的思路。

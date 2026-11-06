---
layout: project
title: 山水之间
description: 我的个人网站，集中展示技术文章、项目和个人资料。
category: Web 开发
tags: [Vue 3, VitePress, 交互设计]
displayOrder: 10
source: https://github.com/smwy-cj/smwy-cj.github.io
---

## 项目缘起

「山水之间」是我的个人网站。我用它整理技术笔记与项目实践，也让来访者能从首页了解我的关注方向。

## 设计与实现

### 素纸淡墨的视觉

早期版本用暖白、炭灰和山水图形组织页面。本次改版采用黑白排版，首页以居中长卡展示近期文章，文章索引提供年份分组和标签筛选。

### 克制的动态

文章和项目轮播由读者操作，支持滑动、方向键和分页。项目索引可在画廊与列表间切换。系统开启减少动态效果时，页面保留同样的操作方式。

### 内容与页面分离

文章和项目使用 Markdown 维护。VitePress 构建静态页面，GitHub Actions 将构建结果发布到 GitHub Pages。

```text
Markdown → VitePress → GitHub Actions → GitHub Pages
```

<span id="展示项目时可以补充什么"></span>
<span id="下一步"></span>

## 本地使用

克隆页面顶部链接的仓库，在项目目录依次运行以下命令。

<CodeSteps :steps="['安装依赖', '启动预览']">
<template #step-1>

```bash
npm ci
```

</template>
<template #step-2>

```bash
npm run dev
```

</template>
</CodeSteps>

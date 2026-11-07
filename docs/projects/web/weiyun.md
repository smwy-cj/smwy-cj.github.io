---
layout: project
title: 微云集
description: 个人博客项目简介
category: Web 开发
tags: [Vue 3, VitePress, Github Actions, Github Pages, TypeScript]
displayOrder: 10
source: https://github.com/smwy-cj/smwy-cj.github.io
---

<script setup>
import { computed } from 'vue'
import { entriesFor } from '../../.vitepress/theme/entries'const noteCount = computed(() => entriesFor('zh', 'article').length)
const projectCount = computed(() => entriesFor('zh', 'project').length)
</script>
## 项目简介

[「山抹微云·微云集」](https://github.com/smwy-cj/smwy-cj.github.io)是我的个人博客项目。我希望用它来记录一些我的日常学习与胡乱思考，希望我能够坚持下去……

当前该项目内部共有 {{ noteCount }} 篇笔记，{{ projectCount }} 个项目，还在持续更新中！

## 具体架构

该项目整体架构为：

```
Vue 3 + TypeScript + VitePress + GitHub Actions + GitHub Pages
```

运行过程主要分为两个部分：

- 远端发布时：将 md 格式的文章和 Vue 页面组件编译成静态网页
- 用户访问时：浏览器加载网页，再由 Vue 提供动态交互功能

为什么会是这样的架构呢？

~~当然是codex推荐的啦(☆▽☆)~~

## 参考记录

感谢以下大神网站提供的一些细节思路方向的参考

- [Rauno Freiberg](https://rauno.me) — 交互细节
- [Dennis Snellenberg](https://www.dennissnellenberg.com/) — 沉浸式滚动
- [Maggie Appleton](https://maggieappleton.com) — 数字花园
- [Bruno Simon](https://bruno-simon.com) — 3D 交互世界

感觉这些大神都好厉害，不知道什么时候我也能设计出原创的令人惊叹的ui界面……




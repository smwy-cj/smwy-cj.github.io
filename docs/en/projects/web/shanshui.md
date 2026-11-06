---
layout: project
title: Shanshui
description: My personal site for technical writing, projects, and a little about me.
category: Web development
tags: [Vue 3, VitePress, 交互设计]
displayOrder: 10
source: https://github.com/smwy-cj/smwy-cj.github.io
---

## Why I built it

Shanshui is my personal site. I use it to organize technical notes and projects. The home page gives visitors a quick overview of what I work on.

## Design and implementation

### Visual design

The early version used warm whites, charcoal, and landscape illustrations. The redesign uses a monochrome palette, tall cards for recent writing, and an archive organized by year and tag.

### Motion

Readers control the carousel by swiping, using the arrow keys, or choosing a slide. The project index switches between gallery and list views. The same controls work when the system preference for reduced motion is enabled.

### Content and layout

I maintain articles and project notes in Markdown. VitePress generates static pages, and GitHub Actions publishes them to GitHub Pages.

```text
Markdown → VitePress → GitHub Actions → GitHub Pages
```

## Run it locally

Clone the repository linked above. Run `npm ci` to install dependencies and `npm run dev` to start the local preview.

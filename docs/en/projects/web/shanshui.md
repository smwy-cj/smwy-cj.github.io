---
layout: project
title: Shanshui
description: A personal blog for notes on AI, agents, and development, with projects and lessons learned along the way.
category: Web development
tags: [Vue 3, VitePress, 交互设计]
displayOrder: 10
source: https://github.com/smwy-cj/smwy-cj.github.io
---

## Why I built it

Shanshui is my personal blog. I use it to organize notes on AI, agents, retrieval-augmented generation, and development, and to record how I build projects and what I learn from them.

The home page provides a starting point for recent content. The writing archive keeps notes accessible over time, while project pages document practical work. Readers can browse by date or explore a topic through tags.

## Features

### Writing and reading

The writing archive groups articles by year and supports tag filters and incremental loading. Articles show their publication date, tags, and estimated reading time. Reading pages include a section outline, a progress indicator, and related content.

Technical notes support syntax highlighting, line numbers, code copying, Mermaid diagrams, and mathematical notation. Images can be enlarged to inspect diagrams and screenshots.

### Projects

Each project has a page for its background, features, implementation, and usage. The project index offers gallery and list views. When an external link is available, “Visit project” opens the demo first, or the source repository if no demo is configured.

### Languages

The interface is available in Chinese and English. Readers can switch between existing translations. When an English version is unavailable, a notice links to the Chinese original. Translations are maintained separately.

## Design and implementation

### Visual design

The home page starts with a pale cyan-green gradient that fades downward into white. Reading pages keep a light background and dark text.

Writing and projects use tall cards. Wide screens show up to three cards, with a larger dark card in the center and slightly smaller cards on either side. Narrow screens show one card. Each card presents a title, description, and tags to help readers choose what to open.

### Motion

Readers control the carousel using buttons on either side, dragging, or the keyboard. Slides retain movement, scale, and color transitions. A fixed-width position track and numeric count show the current position without adding a marker for every item.

When the carousel has keyboard focus, the arrow keys move between slides, while Home and End jump to the first and last items. A single project is displayed without carousel controls. The system preference for reduced motion simplifies animations while keeping the controls available.

### Content and layout

Articles and project notes are maintained in Markdown, with titles, descriptions, dates, and tags in the frontmatter. The home page and indexes are generated from that content.

Vue 3 and TypeScript provide the page components. VitePress builds static pages, and GitHub Actions runs type checks, builds the site, and checks internal links before publishing to GitHub Pages.

```text
Markdown → VitePress build → Link checks → GitHub Pages
```

## Run it locally

Install Node.js 22 or newer, clone the repository linked above, and run:

```bash
npm ci
npm run dev
```

Open the local address printed in the terminal. On Windows, `preview.cmd` also starts the development preview.

Before publishing, run:

```bash
npm run check
npm run build
```

Chinese articles live in `docs/journal/`, English articles in `docs/en/writing/`, and project notes in the corresponding `projects/` directories. Images belong in `docs/public/images/`. The repository includes article and project templates under `templates/`; the [README](https://github.com/smwy-cj/smwy-cj.github.io/blob/main/README.md) documents the content fields and deployment steps.

## Current scope

The site focuses on publishing, organizing, and reading technical content. Content is maintained through the repository. Comments, full-text search, and user accounts have not been integrated. Further features will follow practical writing and reading needs.

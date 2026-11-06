---
layout: article
title: How to build a static personal site on GitHub
description: Build a personal site with VitePress and publish it automatically with GitHub Pages.
category: Frontend development
tags: [Vue 3, VitePress, GitHub Pages]
---

## Before you start

A personal site gives people a place to learn about you. Start by deciding what you want readers to know, what they should be able to find, and how you’ll update the site.

For a site centered on projects and technical notes, the main entry points are an introduction, a project list, and a writing archive.

## Why generate static pages?

The build turns Markdown into HTML so readers can open a link and read the page directly. Vue adds interactive features such as filters where the page needs them.

This setup works well when the content is known at build time and all readers see the same text. Rebuild the site after editing the content to publish a new version.

## Organizing content

Use directories for the long-term structure and tags to connect related topics. A frontend directory can hold notes on building the site. The GitHub Pages tag can connect an article about deployment with the project notes for the site itself.

```text
docs/
├─ projects/       # Project notes
├─ journal/        # Technical writing
├─ public/         # Images and other static assets
└─ .vitepress/     # Theme and site configuration
```

## Automatic deployment

After a commit lands on the main branch, GitHub Actions installs dependencies, checks types, builds the site, and deploys the output to GitHub Pages.

In the repository’s Pages settings, select **GitHub Actions** as the publishing source. See the repository README for the site’s setup instructions.

## Make it easy to maintain

Keep the content format consistent and improve the design as the site grows. For projects, record the context, approach, outcome, and what you learned. For technical notes, state the question, the conclusion, and where it applies.

> Give your site a clear starting point and let it grow over time.

## Further reading

- [Project notes for Shanshui](/en/projects/web/shanshui.md)
- [Turn your notes into a knowledge map (Chinese)](/journal/notes/knowledge-map.md)

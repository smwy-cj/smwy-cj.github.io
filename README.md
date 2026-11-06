# 山水之间 · 个人博客

「山水之间」是山抹微云（smwy-cj）的个人博客，用来整理 AI、Agent、检索增强生成及开发实践中的技术笔记，也记录个人项目与学习过程。

网站使用 Vue 3、TypeScript 和 VitePress 构建，内容以 Markdown 维护，通过 GitHub Actions 发布到 GitHub Pages。

[网站入口](https://smwy-cj.github.io/) · [项目介绍](docs/projects/web/shanshui.md) · [文章模板](templates/article.md) · [项目模板](templates/project.md)

## 页面与功能

| 页面 | 内容与操作 |
| --- | --- |
| 首页 | 个人简介、文章与项目轮播；宽屏最多并排显示三张卡片，中间卡片突出显示；支持两侧按钮、拖动与键盘切换 |
| 文章 | 按年份整理、按标签筛选、显示预计阅读时间；内容较多时分批加载 |
| 项目 | 画廊与列表两种视图，提供项目介绍和外部访问入口 |
| 正文 | 二、三级标题目录、阅读进度、代码高亮与复制、Mermaid 图表、数学公式、图片放大和相关内容 |
| 关于 | 个人介绍、技术方向、兴趣与联系方式 |
| 双语 | 中文与英文界面、对应文章切换；缺少英文版本时提供中文原文入口 |

首页以浅青绿色渐变向下过渡到白色，卡片保持黑白层次。轮播底栏使用固定长度的位置条和数字计数，数量增加时不会堆叠分页横线。窄屏显示单张卡片；系统开启“减少动态效果”时会简化动画。

当前站点提供静态内容阅读，没有接入评论、全文搜索或账号系统。

## 本地运行

需要 Node.js 22 或更新版本，以及 npm。部署工作流使用 Node.js 24。

```sh
npm ci
npm run dev
```

打开终端显示的本地地址。修改 Markdown 或页面代码后，开发预览会自动更新。

Windows 也可以双击仓库中的 `preview.cmd`。它会在缺少依赖时执行安装，随后启动开发预览并打开浏览器；预览期间需要保留窗口。

发布前检查与构建：

```sh
npm run check
npm run build
npm run preview
```

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run check` | 检查 Vue 和 TypeScript 类型 |
| `npm run build` | 构建静态页面，并检查站内链接、图片路径和章节锚点 |
| `npm run check:links` | 对已有构建结果单独执行链接检查，不请求外部网站 |
| `npm run preview` | 预览最近一次构建的结果；修改源码后需要重新构建 |

默认构建目录为 `docs/.vitepress/dist/`，无需提交到仓库。

## 项目结构

```text
docs/
├── index.md                    # 中文首页信息
├── about.md                    # 中文关于页信息
├── journal/                    # 中文文章
├── projects/                   # 中文项目介绍
├── en/                         # 英文页面、writing 文章和 projects 项目
├── public/                     # 图片、图标及其他静态资源
└── .vitepress/
    ├── config.ts               # 站点标题、语言、Markdown 与构建配置
    └── theme/
        ├── site.ts             # 作者资料、双语文案与路由
        ├── Layout.vue          # 导航、页面分发与页脚
        ├── content.data.ts     # 内容读取、排序与阅读时间计算
        ├── styles.css          # 字体、颜色、布局和动效
        └── components/         # 首页、轮播、内容索引及正文组件
templates/                      # 文章和项目模板，不参与页面构建
scripts/                        # 链接检查、字体维护脚本
.github/workflows/deploy.yml    # 检查、构建和部署流程
```

## 发布文章

1. 将 [文章模板](templates/article.md) 复制到 `docs/journal/` 的合适子目录，例如 `docs/journal/notes/my-note.md`。
2. 修改文件开头的标题、简介、日期与标签，再填写正文。
3. 运行本地预览，检查首页、文章索引和正文。
4. 运行类型检查和构建，确认通过后提交并推送。

文件必须从 YAML 信息块开始；两行 `---` 之间填写文章信息：

```yaml
---
layout: article
title: '我的第一篇笔记'
description: '用一句话介绍文章讨论的问题。'
date: '2026-11-06'
tags: [Markdown, 学习笔记]
sample: false
draft: false
---
```

复制时只保留信息块本身，不要带上示例外层的代码围栏。日期请加引号，并替换为实际发布日期。正文直接从 `##` 开始分节，页面会自动显示文章标题。

| 字段 | 说明 |
| --- | --- |
| `layout` | 文章使用 `article`，项目使用 `project`；内容目录中的普通页面缺少有效布局会导致构建报错 |
| `title`、`description` | 标题与简介，供卡片、索引和正文使用；建议每篇都填写 |
| `date`、`updated` | 发布日期与可选的更新日期，格式为 `YYYY-MM-DD` |
| `tags` | 标签数组；用于展示和文章筛选 |
| `category` | 可选的分类名称，显示在正文标题上方；未填写时显示“文章”或“项目” |
| `sample` | 设为 `true` 时从首页和内容索引中隐藏，用于保留示例 |
| `draft` | 设为 `true` 时不加入内容索引数据 |
| `translationKey` | 可选；中英文内容路径不对应时，用相同值关联语言切换 |

文章按发布日期倒序排列，首页轮播包含当前语言的全部非草稿、非示例文章。完整列表位于“文章”页，初次展示最多 30 篇，之后每次加载 30 篇。

`draft: true` 和 `sample: true` 都不会阻止 VitePress 生成页面，直接地址仍可能访问。未公开的草稿应放在 `docs/` 之外。

文章索引按日期和标签组织内容，不提供分类筛选。旧内容中的 `directory` 字段可以保留，当前界面不使用该字段。

## 发布项目

将 [项目模板](templates/project.md) 复制到 `docs/projects/` 的子目录。项目使用 `layout: project`，并可填写以下字段：

```yaml
---
layout: project
title: '我的项目'
description: '说明项目的用途与使用场景。'
date: '2026-11-06'
tags: [Vue 3, TypeScript]
displayOrder: 10
source: https://github.com/your-account/your-repository
demo: https://your-demo.example.com
sample: false
draft: false
---
```

`source` 是源码仓库地址，`demo` 是演示或在线使用地址。请替换为真实链接，没有对应入口时删除该字段。“访问项目”优先使用 `demo`，其次使用 `source`，仅接受 HTTP 或 HTTPS 地址；两个字段都未填写时隐藏该入口。

项目先按 `displayOrder` 从小到大排序，再按日期倒序排列；没有填写排序值的项目排在已填写的项目之后。正文适合介绍项目缘起、主要功能、设计实现和使用方式。旧版 `cover`、`featured` 字段不参与当前展示。

## 维护中英文内容

对应页面优先采用相同的子目录与文件名：

| 中文 | 英文 |
| --- | --- |
| `docs/journal/notes/my-note.md` | `docs/en/writing/notes/my-note.md` |
| `docs/projects/web/my-project.md` | `docs/en/projects/web/my-project.md` |

这种结构会自动建立内容切换和页面的语言关联链接。英文版本需要单独编写，不会自动翻译；发布日期沿用对应中文内容的日期。没有英文版本时，语言切换会进入提示页，并提供中文原文入口。

如果中英文文件使用不同路径，在两份文件中填写相同的 `translationKey` 可关联界面上的语言切换。页面头部的语言关联链接仍按对应路径生成，因此建议保持目录和文件名一致。

## 图片、图表与公式

图片放在 `docs/public/images/`，引用时省略 `public`：

```markdown
![项目截图](/images/project-screenshot.webp)
```

正文中的普通图片支持点击放大，也支持聚焦后按 Enter 或空格打开；按 Esc 或再次点击关闭。链接图片保留原有跳转行为。

文章中使用 `mermaid` 代码块绘制图表：

````markdown
```mermaid
flowchart LR
    A[编写 Markdown] --> B[本地预览]
    B --> C[检查与构建]
    C --> D[部署发布]
```
````

数学公式支持行内 `$E = mc^2$`，以及独立成段的公式：

```latex
$$
P(A \mid B) = \frac{P(B \mid A)P(A)}{P(B)}
$$
```

正文使用 `##`、`###` 建立章节目录。代码块写明语言即可获得语法高亮、行号与复制按钮。需要分步骤展示命令时，可参考 [本站项目介绍](docs/projects/web/shanshui.md) 中的 `CodeSteps` 用法。

链接路径包含空格时，用尖括号包裹路径，例如 `[另一篇文章](<./my note.md>)`，也可以将空格编码为 `%20`。

## 修改站点信息和样式

| 修改内容 | 位置 |
| --- | --- |
| 网站名称与作者资料 | `docs/.vitepress/theme/site.ts` 中的 `profile`；`siteName` 为网站名称，`name` 为作者姓名 |
| 作者简介、邮箱与 GitHub | 同文件中的 `profile`；关于页使用这些资料展示联系入口 |
| 首页浏览器标题与简介 | `docs/index.md`、`docs/en/index.md` |
| 导航名称与页脚署名 | `docs/.vitepress/theme/Layout.vue`，当前使用作者姓名或账号 |
| 头像 | 图片放到 `docs/public/images/`，修改 `profile.avatar`；导航、首页和关于页共用 |
| 关于页结构与文案引用 | `docs/.vitepress/theme/components/About.vue` |
| 渐变背景、字体、卡片和响应式布局 | `docs/.vitepress/theme/styles.css` |
| 浏览器图标 | `docs/public/plush-icon-32.png`、`plush-icon-180.png`，引用在 `config.ts` |
| 站点域名、路径、语言和 Markdown 配置 | `docs/.vitepress/config.ts` |

当前排版使用系统字体栈；仓库保留的宋体子集及 `npm run font:update` 属于可选资源，当前样式未启用该字体。字体授权见 `docs/public/fonts/OFL.txt`。

## GitHub Pages 部署

1. 在仓库 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。
2. 将修改提交并推送到 `smwy-cj/smwy-cj.github.io` 的 `main` 分支。
3. 在 **Actions** 查看 `Build and deploy to GitHub Pages` 工作流。通过后访问 [网站入口](https://smwy-cj.github.io/)。

工作流依次安装依赖、检查类型、构建页面并检查站内链接。拉取请求只执行检查与构建；推送到 `main` 后自动部署。也可以在 Actions 页面手动运行工作流。

当前配置对应用户主页，`base` 为 `/`。迁移到其他域名或仓库子路径时，需要同步调整 `config.ts` 中的 `base`、sitemap 域名、语言关联链接域名和图标地址，并检查正文中使用的绝对资源路径。

import { defineConfig } from 'vitepress'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { profile } from './theme/site'

export default defineConfig({
  title: `${profile.name} · ${profile.siteName}`,
  description: profile.zh.description,
  locales: {
    root: { lang: 'zh-CN', label: '中文' },
    en: { lang: 'en', label: 'English', title: `${profile.handle} · Personal site`, description: profile.en.description }
  },
  base: '/',
  cacheDir: '../node_modules/.vitepress',
  cleanUrls: false,
  appearance: false,
  lastUpdated: false,
  scrollOffset: { selector: '.site-header', padding: 16 },
  sitemap: {
    hostname: 'https://smwy-cj.github.io',
    transformItems: items => items.filter(item => !['404.html', 'en/unavailable.html'].includes(item.url))
  },
  head: [
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/plush-icon-32.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/plush-icon-180.png' }],
    ['meta', { name: 'theme-color', content: '#ffffff' }],
    ['meta', { property: 'og:type', content: 'website' }]
  ],
  markdown: {
    math: true,
    config(md) {
      const fence = md.renderer.rules.fence!
      md.renderer.rules.fence = (tokens, index, options, env, self) => {
        const token = tokens[index]
        if (token.info.trim() === 'mermaid') {
          return `<MermaidDiagram source="${md.utils.escapeHtml(token.content)}" />`
        }
        return fence(tokens, index, options, env, self)
      }
    },
    headers: { level: [2, 3] },
    codeCopyButtonTitle: '复制代码 / Copy code',
    theme: 'github-light',
    lineNumbers: true
  },
  transformPageData(page, { siteConfig }) {
    const equivalents: Record<string, string> = {
      'index.md': 'en/index.md', 'journal/index.md': 'en/writing/index.md', 'projects/index.md': 'en/projects/index.md', 'about.md': 'en/about.md',
      'en/index.md': 'index.md', 'en/writing/index.md': 'journal/index.md', 'en/projects/index.md': 'projects/index.md', 'en/about.md': 'about.md'
    }
    const path = page.relativePath
    const alternate = equivalents[path] || (
      path.startsWith('journal/') ? path.replace(/^journal\//, 'en/writing/')
      : path.startsWith('projects/') ? 'en/' + path
      : path.startsWith('en/writing/') ? path.replace(/^en\/writing\//, 'journal/')
      : path.startsWith('en/projects/') ? path.slice(3)
      : ''
    )
    if (!alternate || !existsSync(resolve(siteConfig.srcDir, alternate))) return
    const url = alternate.endsWith('/index.md') || alternate === 'index.md'
      ? alternate.slice(0, -'index.md'.length)
      : alternate.replace(/\.md$/, '.html')
    page.frontmatter.head ||= []
    page.frontmatter.head.push(['link', { rel: 'alternate', hreflang: path.startsWith('en/') ? 'zh-CN' : 'en',
      href: 'https://smwy-cj.github.io/' + encodeURI(url) }])
  },
  transformHtml(html, _id, context) {
    if (context.page === '404.md' && context.content) {
      return html.replace('<div id="app"></div>', `<div id="app">${context.content}</div>`)
    }
  }
})

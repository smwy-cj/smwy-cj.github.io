import { defineConfig } from 'vitepress'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { profile } from './theme/site'
import vitesseLight from '@shikijs/themes/vitesse-light'

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
  scrollOffset: { selector: '.site-header-offset', padding: 16 },
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
        const info = token.info.trim()
        if (info === 'mermaid') {
          return `<MermaidDiagram source="${md.utils.escapeHtml(token.content)}" />`
        }
        const language = info.split(/[\s:{\[]/, 1)[0].toLowerCase()
        const filename = info.match(/\[([^\]]+)\]/)?.[1]
        const languageNames: Record<string, string> = {
          ts: 'TypeScript', js: 'JavaScript', vue: 'Vue', python: 'Python', py: 'Python',
          bash: 'Bash', sh: 'Shell', json: 'JSON', yaml: 'YAML', toml: 'TOML',
          html: 'HTML', css: 'CSS', text: 'Text', '': 'Text'
        }
        // Short terminal commands do not need a line-number gutter.
        if (/^(bash|sh|shell|console)$/.test(language)
          && token.content.trimEnd().split('\n').length <= 3 && !info.includes(':line-numbers')) {
          token.info += ' :no-line-numbers'
        }
        const label = md.utils.escapeHtml(filename || languageNames[language] || language)
        return fence(tokens, index, options, env, self)
          .replace(/<span class="lang">[^<]*<\/span>/,
            () => `<span class="lang" title="${label}">${label}</span>`)
      }
    },
    headers: { level: [2, 3] },
    codeCopyButtonTitle: '复制代码 / Copy code',
    theme: {
      ...vitesseLight,
      name: 'weiyun-light',
      colors: {
        ...vitesseLight.colors,
        'editor.background': '#F6F8F7',
        'editor.foreground': '#2D3C36'
      },
      tokenColors: [
        ...(vitesseLight.tokenColors || []),
        { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#66776F' } }
      ]
    },
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

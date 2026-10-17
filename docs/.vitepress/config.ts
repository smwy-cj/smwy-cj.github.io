import { defineConfig } from 'vitepress'
import { profile } from './theme/site'

export default defineConfig({
  lang: 'zh-CN',
  title: `${profile.name} · ${profile.siteName}`,
  description: profile.description,
  base: '/',
  cleanUrls: false,
  appearance: false,
  lastUpdated: false,
  sitemap: {
    hostname: 'https://smwy-cj.github.io',
    transformItems: items => items.filter(item => item.url !== '404.html')
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#f7f5ef' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['script', {}, `(function(){try{var t=localStorage.getItem('shanshui-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark');if(localStorage.getItem('shanshui-motion')==='off')document.documentElement.classList.add('motion-off')}catch(e){}})()`]
  ],
  markdown: {
    headers: { level: [2, 3] },
    codeCopyButtonTitle: '复制代码',
    theme: { light: 'github-light', dark: 'github-dark' },
    lineNumbers: true
  },
  themeConfig: {},
  transformHtml(html, _id, context) {
    // VitePress leaves 404 HTML empty by default; keep a readable static fallback.
    if (context.page === '404.md' && context.content) {
      return html.replace('<div id="app"></div>', `<div id="app">${context.content}</div>`)
    }
  }
})

import { createContentLoader } from 'vitepress'
import type { Entry } from './types'

export declare const data: Entry[]

export default createContentLoader(['journal/**/*.md', 'projects/**/*.md'], {
  includeSrc: true,
  transform(pages): Entry[] {
    const invalidPages = pages.filter(({ url, frontmatter: f }) =>
      !f.draft && !['/journal/', '/projects/'].includes(url) && !['article', 'project'].includes(f.layout)
    )
    if (invalidPages.length) {
      throw new Error(`以下内容缺少有效的 layout，无法加入列表与搜索：\n${invalidPages.map(({ url }) => {
        const file = `docs${url.replace(/\.html$/, '.md')}`
        const layout = url.startsWith('/journal/') ? 'article' : 'project'
        return `${file}：请在文件开头用 --- 包裹 YAML 头部，并设置 layout: ${layout}`
      }).join('\n')}`)
    }
    return pages
      .filter(({ frontmatter: f }) => ['article', 'project'].includes(f.layout) && !f.draft)
      .map(({ url, frontmatter: f, src }) => {
        const text = (src || '').replace(/^---[\s\S]*?---/, '').replace(/<[^>]*>/g, ' ').replace(/[#*`>|]/g, '')
        return {
          url, title: f.title, description: f.description || '',
          date: String(f.date || '').slice(0, 10), category: f.category || '其他',
          directory: f.directory || '', tags: f.tags || [], layout: f.layout,
          cover: f.cover || 'mountain', featured: !!f.featured, sample: !!f.sample,
          readingTime: Math.max(1, Math.ceil(text.length / 400)), text
        }
      })
      .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, 'zh-CN'))
  }
})

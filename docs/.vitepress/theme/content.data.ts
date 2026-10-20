import { createContentLoader } from 'vitepress'
import type { Entry } from './types'

export declare const data: Entry[]

export default createContentLoader(['journal/**/*.md', 'projects/**/*.md'], {
  includeSrc: true,
  transform(pages): Entry[] {
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

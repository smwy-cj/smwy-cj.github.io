import { createContentLoader } from 'vitepress'
import { tagId } from './site'
import type { Entry } from './types'

export declare const data: Entry[]

function date(value: unknown) {
  const candidate = (value instanceof Date ? value.toISOString() : String(value || '')).slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(candidate) && Number.isFinite(Date.parse(candidate)) ? candidate : ''
}

function publicLink(value: unknown) {
  return typeof value === 'string' && /^https?:\/\//i.test(value) ? value : ''
}

export default createContentLoader(['journal/**/*.md', 'projects/**/*.md', 'en/writing/**/*.md', 'en/projects/**/*.md'], {
  includeSrc: true,
  transform(pages): Entry[] {
    const entries = pages.flatMap(({ url, frontmatter: f, src }): Entry[] => {
      if (f.draft || url.endsWith('/') || ['journal', 'projects'].includes(f.layout)) return []
      if (f.layout !== 'article' && f.layout !== 'project') throw new Error(`docs${url}: set layout to article or project`)
      const locale = url.startsWith('/en/') ? 'en' : 'zh'
      const body = (src || '').replace(/^---[\s\S]*?---/, '').replace(/<[^>]*>/g, ' ')
      const han = body.match(/\p{Script=Han}/gu)?.length || 0
      const words = body.replace(/\p{Script=Han}/gu, ' ').match(/[\p{L}\p{N}]+/gu)?.length || 0
      const tags = new Map<string, string>()
      for (const label of Array.isArray(f.tags) ? f.tags : []) {
        if (typeof label === 'string' && label.trim() && !tags.has(tagId(label))) tags.set(tagId(label), label.trim())
      }
      return [{
        url, key: f.translationKey || url.replace(/^\/en\/(writing|projects)\//, (_, section) =>
          section === 'writing' ? '/journal/' : '/projects/'),
        locale, title: f.title, description: f.description || '', date: date(f.date), updated: date(f.updated),
        tags: [...tags.values()], layout: f.layout, projectUrl: publicLink(f.demo) || publicLink(f.source),
        order: typeof f.displayOrder === 'number' ? f.displayOrder : Number.MAX_SAFE_INTEGER,
        readingTime: Math.max(1, Math.ceil(han / 400 + words / (locale === 'en' ? 225 : 200))),
        sample: !!f.sample
      }]
    })
    const originals = new Map(entries.filter(entry => entry.locale === 'zh').map(entry => [entry.key, entry.date]))
    for (const entry of entries) {
      if (entry.locale === 'en' && originals.has(entry.key)) entry.date = originals.get(entry.key)!
    }
    return entries.sort((a, b) => a.layout.localeCompare(b.layout) || (a.layout === 'project' ? a.order - b.order : 0)
      || b.date.localeCompare(a.date) || a.key.localeCompare(b.key))
  }
})

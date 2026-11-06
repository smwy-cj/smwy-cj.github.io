import type { Locale } from './site'

export interface Entry {
  url: string
  key: string
  locale: Locale
  title: string
  description: string
  date: string
  updated: string
  tags: string[]
  layout: 'article' | 'project'
  projectUrl: string
  order: number
  readingTime: number
  sample: boolean
}

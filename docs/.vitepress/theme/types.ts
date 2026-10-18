export interface Entry {
  url: string
  title: string
  description: string
  date: string
  category: string
  directory: string
  tags: string[]
  layout: 'article' | 'project'
  cover: string
  featured: boolean
  sample: boolean
  readingTime: number
  text: string
}

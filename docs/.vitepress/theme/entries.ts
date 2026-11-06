import { data } from './content.data'
import { routes, type Locale } from './site'
import type { Entry } from './types'

export function entriesFor(locale: Locale, layout: Entry['layout']) {
  return data.filter(entry => entry.locale === locale && entry.layout === layout && !entry.sample)
}

export function findEntry(path: string) {
  return data.find(entry => entry.url === path)
}

export function entrySection(entry: Entry) {
  return entry.layout === 'project' ? 'projects' : 'journal'
}

export function translationUrl(entry: Entry, locale: Locale, hash = '') {
  const counterpart = data.find(item => item.locale === locale && item.key === entry.key)
  if (counterpart) return counterpart.url + (counterpart.url === entry.url ? hash : '')
  return locale === 'en'
    ? '/en/unavailable.html?' + new URLSearchParams({ entry: entry.key, ...(hash ? { anchor: hash } : {}) })
    : routes.zh[entrySection(entry)]
}

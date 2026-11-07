<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData, useRouter, withBase } from 'vitepress'
import { entriesFor } from '../entries'
import { dateLabel, labels, routes, tagId, tagName, tagUrl, type Locale } from '../site'
import type { Entry } from '../types'
import ArticleOutline from './ArticleOutline.vue'
import Icon from './Icon.vue'

const props = defineProps<{ entry?: Entry; locale: Locale }>()
const { frontmatter: f, page } = useData()
const router = useRouter()
const t = computed(() => labels[props.locale])
const section = computed(() => f.value.layout === 'project' ? 'projects' : 'journal')
const headers = computed(() => page.value.headers || [])
const returnQuery = ref('')
const related = computed(() => {
  if (!props.entry || props.entry.sample) return []
  const tags = new Set(props.entry.tags.map(tagId))
  return entriesFor(props.locale, props.entry.layout).filter(item => item.key !== props.entry?.key && item.tags.some(tag => tags.has(tagId(tag)))).slice(0, 3)
})
const back = computed(() => withBase(routes[props.locale][section.value] + returnQuery.value))
const copied = ref('')
let timer: ReturnType<typeof setTimeout>
let copiedButton: HTMLButtonElement | undefined
let copyRequest = 0
onMounted(() => {
  if (section.value === 'journal') {
    const from = new URLSearchParams(location.search).get('from')
    if (from?.startsWith('?')) returnQuery.value = from
  }
  document.querySelectorAll<HTMLButtonElement>('.prose button.copy').forEach(button => {
    button.title = t.value.copy
    button.setAttribute('aria-label', t.value.copy)
    button.textContent = t.value.copy
  })
})
onBeforeUnmount(() => { clearTimeout(timer); copyRequest++ })
async function goBack(event: MouseEvent) {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  let scroll = 0
  try {
    const saved = JSON.parse(sessionStorage.getItem('writing-return-' + props.locale) || 'null')
    if (saved && new URL(saved.entry, location.origin).href === location.origin + location.pathname + location.search) scroll = saved.scroll
  } catch {}
  await router.go(back.value)
  requestAnimationFrame(() => window.scrollTo(0, scroll))
}
async function copy(event: MouseEvent) {
  if (!(event.target instanceof HTMLElement)) return
  const button = event.target.closest<HTMLButtonElement>('button.copy')
  const code = button?.parentElement?.querySelector('pre code')
  if (!button || !code) return
  event.stopPropagation()
  const request = ++copyRequest
  clearTimeout(timer)
  copiedButton?.classList.remove('copied')
  if (copiedButton) copiedButton.textContent = t.value.copy
  copiedButton = button
  copied.value = ''
  const clean = code.cloneNode(true) as HTMLElement
  clean.querySelectorAll('.vp-copy-ignore, .diff.remove').forEach(node => node.remove())
  try {
    await navigator.clipboard.writeText((clean.textContent || '').replace(/\n$/, ''))
    if (request !== copyRequest) return
    button.classList.add('copied')
    button.textContent = t.value.copied
    copied.value = t.value.copied
  } catch {
    if (request !== copyRequest) return
    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(code)
    selection?.removeAllRanges()
    selection?.addRange(range)
    copied.value = t.value.copyFailed
    button.textContent = props.locale === 'zh' ? '请手动复制' : 'Select to copy'
  }
  timer = setTimeout(() => {
    button.classList.remove('copied')
    button.textContent = t.value.copy
    copied.value = ''
  }, 1500)
}
</script>

<template>
  <main id="main-content" class="shell" tabindex="-1">
    <div class="reader">
      <a class="back inline-link vp-raw" :href="back" @click="goBack"><Icon name="arrow" :size="14" /> {{ t.back }}{{ locale === 'en' ? ' ' : '' }}{{ t[section] }}</a>
      <header class="reader-title">
        <div class="eyebrow">{{ f.category || t[section] }}</div>
        <h1>{{ f.title }}</h1>
        <p v-if="f.description">{{ f.description }}</p>
        <div class="article-meta" v-if="entry && section === 'journal'">
          <span v-if="entry.date">{{ t.published }} <time :datetime="entry.date">{{ dateLabel(entry.date, locale, true) }}</time></span>
          <span v-if="entry.updated">{{ t.updated }} <time :datetime="entry.updated">{{ dateLabel(entry.updated, locale, true) }}</time></span>
          <span>{{ entry.readingTime }} {{ t.minutes }}</span>
        </div>
        <div class="entry-tags" v-if="entry?.tags.length">
          <template v-for="tag in entry.tags" :key="tag">
            <a v-if="section === 'journal'" :href="withBase(tagUrl(locale, tag))">{{ tagName(tag, locale) }}</a>
            <span v-else>{{ tagName(tag, locale) }}</span>
          </template>
        </div>
      </header>
      <details v-if="headers.length" class="mobile-article-toc"><summary>{{ t.toc }}</summary><ArticleOutline :headings="headers" :page-key="page.relativePath" /></details>
      <div class="reading-layout">
        <article>
          <a v-if="entry?.projectUrl" class="inline-link project-visit" :href="entry.projectUrl" target="_blank" rel="noopener noreferrer">{{ t.visit }} <Icon name="diagonal" :size="13" /></a>
          <div class="prose vp-doc" @click.capture="copy"><Content /></div>
          <div class="sr-only" role="status">{{ copied }}</div>
          <nav v-if="related.length" class="related" :aria-label="t.related">
            <h2>{{ t.related }}</h2>
            <a v-for="item in related" :key="item.url" :href="withBase(item.url)">{{ item.title }} <Icon name="diagonal" :size="13" /></a>
          </nav>
        </article>
        <aside v-if="headers.length" class="article-toc"><strong>{{ t.toc }}</strong><ArticleOutline :headings="headers" :page-key="page.relativePath" /></aside>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { dateLabel, labels, routes, tagId, tagName, tagUrl, type Locale } from '../site'
import { entriesFor } from '../entries'
import Icon from './Icon.vue'

const props = defineProps<{ kind: 'journal' | 'projects'; locale: Locale }>()
const emit = defineEmits<{ archiveChange: [] }>()
const t = computed(() => labels[props.locale])
const isWriting = computed(() => props.kind === 'journal')
const items = computed(() => entriesFor(props.locale, isWriting.value ? 'article' : 'project'))
const view = ref(false)
const tag = ref('all')
const list = ref(false)
const limit = ref(30)
const gallery = ref<HTMLElement>()
const archivePath = computed(() => routes[props.locale].journal)
const filtered = computed(() => items.value.filter(item => !view.value || tag.value === 'all' || item.tags.some(label => tagId(label) === tag.value)))
const tagCounts = computed(() => {
  const tags = new Map<string, { id: string; label: string; count: number }>()
  for (const item of items.value) {
    for (const label of item.tags) {
      const id = tagId(label)
      const info = tags.get(id) || { id, label: tagName(label, props.locale), count: 0 }
      info.count++
      tags.set(id, info)
    }
  }
  return [...tags.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, props.locale))
})
const groups = computed(() => {
  const years = new Map<string, typeof filtered.value>()
  for (const item of filtered.value.slice(0, limit.value)) {
    const year = item.date.slice(0, 4)
    if (!years.has(year)) years.set(year, [])
    years.get(year)!.push(item)
  }
  return [...years]
})
function sync() {
  const params = new URLSearchParams(location.search)
  view.value = params.get('view') === 'tags'
  tag.value = params.get('tag') || 'all'
  limit.value = Math.max(30, Number(params.get('limit')) || 30)
}
function archiveHref(tags: boolean, selected = 'all') {
  return withBase(tags ? tagUrl(props.locale, selected) : archivePath.value)
}
function filter(event: MouseEvent, tags: boolean, selected = 'all') {
  if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  const href = archiveHref(tags, selected)
  if (location.pathname + location.search === href) return
  history.replaceState({ ...history.state, scrollPosition: window.scrollY }, '')
  history.pushState({}, '', href)
  sync()
  emit('archiveChange')
}
function loadMore() {
  limit.value += 30
  const url = new URL(location.href)
  url.searchParams.set('limit', String(limit.value))
  history.replaceState(history.state, '', url)
  emit('archiveChange')
}
function entryHref(url: string) {
  const query = new URLSearchParams()
  if (view.value) { query.set('view', 'tags'); query.set('tag', tag.value) }
  if (limit.value > 30) query.set('limit', String(limit.value))
  return withBase(url + (query.size ? '?' + new URLSearchParams({ from: '?' + query }) : ''))
}
function rememberArchive(url: string) {
  try {
    sessionStorage.setItem('writing-return-' + props.locale, JSON.stringify({
      entry: entryHref(url), scroll: window.scrollY
    }))
  } catch {}
}
async function showList(value: boolean) {
  if (value === list.value) return
  const cards = Array.from(gallery.value?.querySelectorAll<HTMLElement>('.work-stage, .work-details') || [])
  const before = cards.map(card => card.getBoundingClientRect())
  list.value = value
  await nextTick()
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  cards.forEach((card, index) => {
    card.getAnimations().forEach(animation => animation.cancel())
    const after = card.getBoundingClientRect()
    card.animate([
      { transform: `translate(${before[index].x - after.x}px, ${before[index].y - after.y}px)`, opacity: .35 },
      { transform: 'none', opacity: 1 }
    ], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' })
  })
}
onMounted(() => { sync(); window.addEventListener('popstate', sync) })
onUnmounted(() => window.removeEventListener('popstate', sync))
</script>

<template>
  <main id="main-content" class="shell" :class="isWriting ? 'archive-page' : 'project-gallery'" tabindex="-1">
    <div class="page-title">
      <div class="eyebrow">{{ isWriting ? 'Writing / Archive' : 'Project index / ' + String(items.length).padStart(2, '0') }}</div>
      <h1>{{ isWriting ? t.writingTitle : t.workTitle }}</h1>
      <p>{{ isWriting ? t.writingIntro : t.workIntro }}</p>
    </div>

    <template v-if="isWriting">
      <div class="toolbar">
        <div class="switcher">
          <a class="vp-raw" :href="archiveHref(false)" :aria-current="!view ? 'true' : undefined" @click="filter($event, false)">{{ t.latest }}</a>
          <a class="vp-raw" :href="archiveHref(true)" :aria-current="view ? 'true' : undefined" @click="filter($event, true)">{{ t.tags }}</a>
        </div>
        <span role="status">{{ filtered.length }} {{ t.entries }} / {{ tagCounts.length }} {{ t.topicCount }}</span>
      </div>
      <div v-if="view" class="filter-chips">
        <a class="vp-raw" :href="archiveHref(true)" :aria-current="tag === 'all' ? 'true' : undefined" @click="filter($event, true)">{{ t.all }} <span>{{ items.length }}</span></a>
        <a v-for="item in tagCounts" :key="item.id" class="vp-raw" :href="archiveHref(true, item.id)"
          :aria-current="item.id === tag ? 'true' : undefined" @click="filter($event, true, item.id)">{{ item.label }} <span>{{ item.count }}</span></a>
      </div>
      <div :key="view + ':' + tag" class="archive-results">
        <div v-if="!filtered.length" class="empty">{{ t.empty }} <a v-if="tag !== 'all'" class="vp-raw" :href="archiveHref(true)" @click="filter($event, true)">{{ t.all }} ↗</a></div>
        <section v-for="[year, entries] in groups" :key="year" class="archive-year">
          <h2 class="year-heading">{{ year || t.undated }}</h2>
          <div>
            <article v-for="(entry, index) in entries" :key="entry.url" class="archive-row" :style="{ '--delay': Math.min(index * 35, 140) + 'ms' }">
              <div>
                <h3><a :href="entryHref(entry.url)" @click="rememberArchive(entry.url)">{{ entry.title }}</a></h3>
                <p>{{ entry.description }}</p>
                <div class="entry-tags">
                  <a v-for="label in entry.tags" :key="label" class="vp-raw" :href="archiveHref(true, label)" @click="filter($event, true, label)">{{ tagName(label, locale) }}</a>
                </div>
              </div>
              <div class="archive-date"><time v-if="entry.date" :datetime="entry.date">{{ dateLabel(entry.date, locale) }}</time><span>{{ entry.readingTime }} {{ t.minutes }}</span></div>
            </article>
          </div>
        </section>
        <button v-if="limit < filtered.length" class="load-more" @click="loadMore">{{ t.moreEntries }}</button>
      </div>
    </template>

    <template v-else>
      <div class="toolbar gallery-toolbar">
        <span>{{ items.length }} {{ t.works }}</span>
        <div class="switcher">
          <button :aria-pressed="!list" @click="showList(false)">{{ t.gallery }}</button>
          <button :aria-pressed="list" @click="showList(true)">{{ t.list }}</button>
        </div>
      </div>
      <p v-if="!items.length" class="empty">{{ t.empty }}</p>
      <div ref="gallery" class="gallery-grid" :class="{ 'is-list': list }">
        <article v-for="(item, index) in items" :key="item.url" class="gallery-work">
          <a class="work-stage" :href="withBase(item.url)">
            <span>PROJECT / {{ String(index + 1).padStart(2, '0') }}</span>
            <strong class="work-word">{{ item.title }}</strong>
            <div class="work-bottom"><span>{{ item.tags[0] ? tagName(item.tags[0], locale) : '' }}</span><Icon name="diagonal" :size="17" /></div>
          </a>
          <div class="work-details">
            <h2>{{ item.title }}</h2>
            <p>{{ item.description }}</p>
            <div class="project-links">
              <a v-if="item.projectUrl" class="inline-link" :href="item.projectUrl" target="_blank" rel="noopener noreferrer">{{ t.visit }} <Icon name="diagonal" :size="12" /></a>
              <a class="inline-link" :href="withBase(item.url)">{{ t.details }} <Icon name="arrow" :size="12" /></a>
            </div>
          </div>
        </article>
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import { data } from './content.data'
import { entrySection, findEntry, translationUrl } from './entries'
import { labels, profile, routes, sections, type Locale, type Section } from './site'
import { useImageZoom } from './useImageZoom'
import Home from './components/Home.vue'
import ContentHub from './components/ContentHub.vue'
import About from './components/About.vue'
import ArticlePage from './components/ArticlePage.vue'
import Icon from './components/Icon.vue'

const { frontmatter, page } = useData()
const route = useRoute()
const layout = computed(() => frontmatter.value.layout)
const locale = computed<Locale>(() => page.value.relativePath.startsWith('en/') || route.path.startsWith(withBase('/en/')) ? 'en' : 'zh')
const t = computed(() => labels[locale.value])
const path = computed(() => routes[locale.value])
const entry = computed(() => findEntry('/' + page.value.relativePath.replace(/\.md$/, '.html')))
const header = ref<HTMLElement>()
const readingProgress = ref<HTMLElement>()
const headerHidden = ref(false)
const collapseStart = 24
const collapseEnd = 160
let narrowHeader: MediaQueryList
let reducedMotion: MediaQueryList
let scrollFrame = 0
let lastScrollY = 0
let directionStart = 0
let scrollDirection = 0
let lastCompression = -1
const nav = ref<HTMLElement>()
const indicator = ref<{ x: number; width: number }>()
let navObserver: ResizeObserver | undefined
const query = ref('')
const hash = ref('')
const notFound = computed(() => page.value.isNotFound || layout.value === 'not-found')
const unavailable = computed(() => {
  if (layout.value !== 'unavailable') return
  const key = new URLSearchParams(query.value).get('entry')
  return data.find(item => item.key === key && item.locale === 'zh')
})
const section = computed<Section | undefined>(() => {
  if (entry.value) return entrySection(entry.value)
  if (unavailable.value) return entrySection(unavailable.value)
  return sections.find(section => section === layout.value)
})
const original = computed(() => unavailable.value ? unavailable.value.url + (new URLSearchParams(query.value).get('anchor') || '') : '')
const isReading = computed(() => ['article', 'project'].includes(layout.value))
useImageZoom()

function languageUrl(target: Locale) {
  if (layout.value === 'unavailable') {
    if (target === 'en') return withBase('/en/unavailable.html' + query.value)
    if (original.value) return withBase(original.value)
  }
  if (entry.value) return withBase(translationUrl(entry.value, target, hash.value))
  const destination = routes[target][section.value || 'home']
  return withBase(destination + (section.value === 'journal' ? query.value : ''))
}
function revealHeader() {
  headerHidden.value = false
  directionStart = lastScrollY
  scrollDirection = 0
}
function updateScroll() {
  scrollFrame = 0
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  const y = Math.max(0, Math.min(window.scrollY, maxScroll))
  const direction = Math.sign(y - lastScrollY)
  if (direction && direction !== scrollDirection) {
    directionStart = lastScrollY
    scrollDirection = direction
  }
  lastScrollY = y

  const hideAfter = narrowHeader.matches ? 220 : 320
  if (y <= collapseEnd || (direction < 0 && directionStart - y >= 24)) {
    headerHidden.value = false
  } else if (y >= hideAfter && direction > 0 && y - directionStart >= 12
    && !header.value?.matches(':has(:focus-visible)')) {
    headerHidden.value = true
  }

  const compression = reducedMotion.matches
    ? Number(y >= collapseEnd)
    : Math.max(0, Math.min(1, (y - collapseStart) / (collapseEnd - collapseStart)))
  if (compression !== lastCompression) {
    header.value?.style.setProperty('--header-compression', String(compression))
    lastCompression = compression
  }
  if (readingProgress.value) {
    readingProgress.value.style.transform = 'scaleX(' + (maxScroll > 0 ? y / maxScroll : 0) + ')'
  }
}
function scheduleScroll() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll)
}
function sync() {
  query.value = location.search
  hash.value = location.hash
  scheduleScroll()
}
function syncPage() {
  lastScrollY = Math.max(0, window.scrollY)
  revealHeader()
  sync()
}
function alignIndicator() {
  const active = nav.value?.querySelector<HTMLElement>('a[aria-current]')
  indicator.value = active ? { x: active.offsetLeft, width: active.offsetWidth } : undefined
}
onMounted(() => {
  narrowHeader = matchMedia('(max-width: 460px)')
  reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
  syncPage()
  alignIndicator()
  navObserver = new ResizeObserver(alignIndicator)
  if (nav.value) navObserver.observe(nav.value)
  nav.value?.querySelectorAll('a').forEach(link => navObserver?.observe(link))
  window.addEventListener('scroll', scheduleScroll, { passive: true })
  window.addEventListener('resize', scheduleScroll)
  reducedMotion.addEventListener('change', scheduleScroll)
  window.addEventListener('popstate', sync)
  window.addEventListener('hashchange', sync)
})
watch(() => route.path, syncPage, { flush: 'post' })
watch([section, locale], alignIndicator, { flush: 'post' })
onBeforeUnmount(() => {
  navObserver?.disconnect()
  cancelAnimationFrame(scrollFrame)
  window.removeEventListener('scroll', scheduleScroll)
  window.removeEventListener('resize', scheduleScroll)
  reducedMotion?.removeEventListener('change', scheduleScroll)
  window.removeEventListener('popstate', sync)
  window.removeEventListener('hashchange', sync)
})
</script>

<template>
  <a class="skip-link" href="#main-content">{{ t.skip }}</a>
  <div id="top" class="site-header-space" aria-hidden="true">
    <div class="site-header-offset"></div>
  </div>
  <header ref="header" class="site-header" :class="{ 'is-hidden': headerHidden }" @focusin="revealHeader">
    <div class="shell header-inner">
      <a :href="withBase(path.home)" class="brand">
        <img class="brand-avatar" :src="withBase(profile.avatar)" alt="" width="28" height="28" />
        <span>{{ locale === 'zh' ? profile.name : profile.handle }}<span class="brand-period">.</span></span>
      </a>
      <div class="header-right">
        <nav ref="nav" :aria-label="t.navigation" :class="{ 'has-indicator': indicator }">
          <a v-for="item in sections" :key="item" :href="withBase(path[item])"
            :aria-current="section === item ? (layout === item ? 'page' : 'location') : undefined">{{ t[item] }}</a>
          <span v-if="indicator" class="nav-indicator" aria-hidden="true"
            :style="{ transform: `translateX(${indicator.x}px)`, width: `${indicator.width}px` }"></span>
        </nav>
        <div class="langs" aria-label="Language">
          <a :href="languageUrl('en')" lang="en" :aria-current="locale === 'en' ? 'true' : undefined">Eng</a>
          <span aria-hidden="true">/</span>
          <a :href="languageUrl('zh')" lang="zh-CN" :aria-current="locale === 'zh' ? 'true' : undefined">中文</a>
        </div>
      </div>
    </div>
  </header>
  <div v-if="isReading" ref="readingProgress" class="reading-progress" aria-hidden="true"></div>

  <div :key="route.path" class="route-content">
    <main v-if="notFound" id="main-content" class="shell" tabindex="-1">
      <div class="page-title"><div class="eyebrow">404</div><h1>{{ t.notFound }}</h1><p>{{ t.notFoundBody }}</p></div>
      <a class="inline-link" :href="withBase(path.home)">{{ t.home }} <Icon name="arrow" :size="16" /></a>
    </main>
    <Home v-else-if="layout === 'home'" :locale="locale" />
    <ContentHub v-else-if="layout === 'journal' || layout === 'projects'" :kind="layout" :locale="locale" @archive-change="sync" />
    <About v-else-if="layout === 'about'" :locale="locale" />
    <main v-else-if="layout === 'unavailable'" id="main-content" class="shell" tabindex="-1">
      <div class="page-title">
        <div class="eyebrow">{{ t[section || 'journal'] }}</div>
        <h1>{{ t.unavailable }}</h1>
        <p v-if="unavailable" lang="zh-CN">{{ unavailable.title }}</p>
        <p>{{ t.unavailableBody }}</p>
      </div>
      <a v-if="original" class="inline-link" :href="withBase(original)">{{ t.original }} <Icon name="diagonal" :size="13" /></a>
      <a v-else class="inline-link" :href="withBase(path.journal)">{{ t.journal }} <Icon name="arrow" :size="13" /></a>
    </main>
    <ArticlePage v-else :entry="entry" :locale="locale" />
  </div>

  <footer class="shell"><div class="foot">
    <span>© {{ new Date().getFullYear() }} {{ locale === 'zh' ? profile.name : profile.handle }}</span>
    <div class="foot-links">
      <a :href="profile.github" target="_blank" rel="noopener noreferrer">GitHub <Icon name="diagonal" :size="11" /></a>
      <a href="#top">{{ t.top }} ↑</a>
    </div>
  </div></footer>
</template>

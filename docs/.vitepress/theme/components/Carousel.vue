<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { dateLabel, labels, routes, tagName, type Locale } from '../site'
import type { Entry } from '../types'
import Icon from './Icon.vue'

const props = defineProps<{ items: Entry[]; locale: Locale; kind: 'journal' | 'projects' }>()
const t = computed(() => labels[props.locale])
const count = computed(() => props.items.length)
const current = ref(count.value >= 3 ? 1 : 0)
const mobile = ref(false)
const rail = ref<HTMLElement>()
const track = ref<HTMLElement>()
const dragging = ref(false)
let media: MediaQueryList
let animation: Animation | undefined
let queued: number | undefined
let pointer: { id: number; x: number; y: number } | undefined
let dragWidth = 0
let dragOffset = 0
let dragFrame = 0
let suppressClick = false
let clickTimer: ReturnType<typeof setTimeout>
const moving = computed(() => mobile.value ? count.value > 1 : count.value >= 3)
const visible = computed(() => mobile.value ? 1 : Math.min(3, count.value))
const left = computed(() => mobile.value ? 0 : 1)
const wrap = (index: number) => (index % count.value + count.value) % count.value
const slots = computed(() => {
  if (!moving.value) return props.items.map((item, index) => ({ item, index, position: index, extra: false }))
  return Array.from({ length: visible.value + 2 }, (_, slot) => {
    const position = current.value + slot - left.value - 1
    const index = wrap(position)
    return { item: props.items[index], index, position, extra: slot === 0 || slot > visible.value }
  })
})
const selected = computed(() => wrap(current.value))
const progress = computed(() => count.value > 1 ? selected.value / (count.value - 1) : 0)
const ordinal = (index: number) => String(index + 1).padStart(2, '0')
const total = computed(() => String(count.value).padStart(2, '0'))
function syncWidth() { stop(); mobile.value = media.matches }
function stop() {
  if (animation) {
    animation.cancel()
    animation = undefined
  }
  cancelAnimationFrame(dragFrame)
  dragFrame = 0
  dragWidth = 0
  dragOffset = 0
  pointer = undefined
  dragging.value = false
  if (track.value) track.value.style.transform = ''
  queued = undefined
}
function step(direction: number) {
  if (!moving.value) return
  if (animation) {
    queued = direction
    return
  }
  animateStep(direction)
}
function stepWidth(trackElement: HTMLElement) {
  const first = trackElement.firstElementChild
  if (!first) return 0
  return parseFloat(getComputedStyle(first).width) + parseFloat(getComputedStyle(trackElement).columnGap)
}
function animateStep(direction: number) {
  const start = dragOffset
  const width = dragWidth
  stop()
  const trackElement = track.value
  if (!trackElement || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    current.value += direction
    return
  }
  const end = direction === 0 ? 0 : -direction * (width || stepWidth(trackElement))
  const run = trackElement.animate(
    [{ transform: `translateX(${start}px)` }, { transform: `translateX(${end}px)` }],
    { duration: direction === 0 ? 180 : 480, easing: 'cubic-bezier(.25,.7,.35,1)', fill: 'forwards' }
  )
  animation = run
  run.onfinish = async () => {
    if (animation !== run) return
    current.value += direction
    await nextTick()
    if (animation !== run) return
    const nextDirection = queued
    stop()
    if (nextDirection !== undefined) animateStep(nextDirection)
  }
}
function keyboard(event: KeyboardEvent) {
  if (!moving.value || event.target !== rail.value) return
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') step(event.key === 'ArrowLeft' ? -1 : 1)
  else {
    stop()
    current.value = event.key === 'Home' ? 0 : count.value - 1
  }
}
function down(event: PointerEvent) {
  if (!moving.value || animation || event.button !== 0 || !event.isPrimary) return
  pointer = { id: event.pointerId, x: event.clientX, y: event.clientY }
}
function move(event: PointerEvent) {
  if (pointer?.id !== event.pointerId) return
  const x = event.clientX - pointer.x
  const y = event.clientY - pointer.y
  if (!dragging.value && Math.abs(y) > 8 && Math.abs(y) > Math.abs(x)) { pointer = undefined; return }
  if (!dragging.value && Math.abs(x) < 8) return
  const trackElement = track.value
  if (!trackElement) return
  if (!dragging.value) {
    dragWidth = stepWidth(trackElement)
    dragging.value = true
    rail.value?.setPointerCapture(event.pointerId)
  }
  dragOffset = Math.max(-dragWidth, Math.min(dragWidth, x))
  if (!dragFrame) {
    dragFrame = requestAnimationFrame(() => {
      trackElement.style.transform = `translateX(${dragOffset}px)`
      dragFrame = 0
    })
  }
}
function finish(event: PointerEvent) {
  if (pointer?.id !== event.pointerId) return
  pointer = undefined
  if (!dragging.value) return
  dragging.value = false
  suppressClick = true
  clearTimeout(clickTimer)
  clickTimer = setTimeout(() => suppressClick = false, 0)
  const direction = event.type === 'pointerup' && Math.abs(dragOffset) >= 45 ? Math.sign(-dragOffset) : 0
  animateStep(direction)
}
function intercept(event: MouseEvent) {
  if (!suppressClick) return
  event.preventDefault()
  event.stopPropagation()
}
onMounted(() => {
  media = matchMedia('(max-width: 800px)')
  if (media.matches) current.value = 0
  syncWidth()
  media.addEventListener('change', syncWidth)
})
onBeforeUnmount(() => {
  media?.removeEventListener('change', syncWidth)
  stop()
  clearTimeout(clickTimer)
})
</script>

<template>
  <section class="collection" :aria-label="t[kind]" :aria-roledescription="t.carousel">
    <div class="collection-heading">
      <div><div class="eyebrow">{{ kind === 'journal' ? '01 / Writing' : '02 / Projects' }}</div><h2>{{ t[kind] }}</h2></div>
      <div class="collection-actions">
        <a class="inline-link" :href="withBase(routes[locale][kind])">{{ kind === 'journal' ? t.allArticles : t.allProjects }} <Icon name="diagonal" :size="12" /></a>
      </div>
    </div>
    <p v-if="!count" class="empty">{{ t.empty }}</p>
    <template v-else>
      <div class="carousel-stage" :class="{ 'has-controls': moving }">
        <button v-if="moving" type="button" class="round-button previous" :aria-label="t.previous"
          :aria-controls="'rail-' + kind" @click="step(-1)"><Icon name="arrow" :size="16" /></button>
        <div :id="'rail-' + kind" ref="rail" class="rail" :class="{ moving, dragging }" :tabindex="moving ? 0 : undefined" :aria-label="t[kind]"
          @keydown="keyboard" @pointerdown="down" @pointermove="move" @pointerup="finish"
          @pointercancel="finish" @lostpointercapture="finish" @pointerleave="!dragging && (pointer = undefined)"
          @click.capture="intercept" @dragstart.prevent>
          <div ref="track" class="rail-track">
            <article v-for="{ item, index, position, extra } in slots" :key="position" :inert="extra" :aria-hidden="extra || undefined"
              :class="['rail-item', { 'project-card': kind === 'projects' }]">
              <div class="card-top"><span>{{ ordinal(index) }} / {{ total }}</span><time v-if="item.date && kind === 'journal'" :datetime="item.date">{{ dateLabel(item.date, locale, true) }}</time></div>
              <h3><a :href="withBase(item.url)">{{ item.title }}</a></h3>
              <p>{{ item.description }}</p>
              <div class="card-bottom">
                <ul v-if="item.tags.length" class="tag-set"><li v-for="tag in item.tags" :key="tag">{{ tagName(tag, locale) }}</li></ul>
                <div class="project-links" v-if="kind === 'projects'">
                  <a v-if="item.projectUrl" class="inline-link" :href="item.projectUrl" target="_blank" rel="noopener noreferrer">{{ t.visit }} <Icon name="diagonal" :size="12" /></a>
                  <a class="inline-link" :href="withBase(item.url)">{{ t.details }} <Icon name="arrow" :size="12" /></a>
                </div>
                <span v-else class="card-open" aria-hidden="true"><Icon name="diagonal" :size="17" /></span>
              </div>
            </article>
          </div>
        </div>
        <button v-if="moving" type="button" class="round-button next" :aria-label="t.next"
          :aria-controls="'rail-' + kind" @click="step(1)"><Icon name="arrow" :size="16" /></button>
      </div>
      <div class="rail-footer" v-if="moving">
        <div class="rail-position" aria-hidden="true">
          <span class="rail-thumb" :style="{ '--position': progress }"></span>
        </div>
        <span class="rail-count" aria-live="polite" aria-atomic="true">{{ ordinal(selected) }} / {{ total }}</span>
      </div>
    </template>
  </section>
</template>

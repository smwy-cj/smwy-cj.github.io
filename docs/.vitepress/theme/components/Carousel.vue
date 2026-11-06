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
const offset = ref(0)
const dragging = ref(false)
const visualFocus = ref(0)
let media: MediaQueryList
let animation: Animation | undefined
let queued: number | undefined
let pointer: { id: number; x: number; y: number } | undefined
let suppressClick = false
let clickTimer: ReturnType<typeof setTimeout>
const moving = computed(() => mobile.value ? count.value > 1 : count.value >= 3)
const visible = computed(() => mobile.value ? 1 : Math.min(3, count.value))
const left = computed(() => mobile.value ? 0 : 1)
const wrap = (index: number) => (index % count.value + count.value) % count.value
const slots = computed(() => {
  if (!moving.value) return props.items.map((item, index) => ({ item, index, slot: index, position: index, extra: false }))
  return Array.from({ length: visible.value + 2 }, (_, slot) => {
    const position = current.value + slot - left.value - 1
    const index = wrap(position)
    return { item: props.items[index], index, slot, position, extra: slot === 0 || slot > visible.value }
  })
})
const center = computed(() => moving.value ? left.value + 1 + visualFocus.value : wrap(current.value))
const selected = computed(() => wrap(current.value))
const ordinal = (index: number) => String(index + 1).padStart(2, '0')
const total = computed(() => String(count.value).padStart(2, '0'))
function syncWidth() { stop(); mobile.value = media.matches }
function stop() {
  if (animation) {
    animation.cancel()
    animation = undefined
  }
  offset.value = 0
  visualFocus.value = 0
  queued = undefined
}
function step(direction: number) {
  if (!moving.value) return
  if (animation) { queued = (queued ?? (current.value + visualFocus.value)) + direction; return }
  animateStep(direction)
}
function animateStep(direction: number) {
  const start = offset.value
  stop()
  const trackElement = track.value
  const first = trackElement?.children[0] as HTMLElement | undefined
  const second = trackElement?.children[1] as HTMLElement | undefined
  if (!trackElement || !first || !second || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    current.value += direction
    return
  }
  const width = second.offsetLeft - first.offsetLeft
  visualFocus.value = direction
  const run = trackElement.animate(
    [{ transform: `translateX(${start}px)` }, { transform: `translateX(${-direction * width}px)` }],
    { duration: 580, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' }
  )
  animation = run
  run.onfinish = async () => {
    if (animation !== run) return
    current.value += direction
    visualFocus.value = 0
    await nextTick()
    if (animation !== run) return
    const target = queued
    stop()
    if (target !== undefined) go(target)
  }
}
function go(target: number) {
  if (animation) { queued = target; return }
  if (target === current.value) return
  const direction = Math.sign(target - current.value)
  current.value = target - direction
  animateStep(direction)
}
function choose(index: number) {
  go(current.value + index - selected.value)
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
  if (!moving.value || event.button !== 0 || !event.isPrimary) return
  stop()
  pointer = { id: event.pointerId, x: event.clientX, y: event.clientY }
}
function move(event: PointerEvent) {
  if (pointer?.id !== event.pointerId) return
  const x = event.clientX - pointer.x
  const y = event.clientY - pointer.y
  if (!dragging.value && Math.abs(y) > 8 && Math.abs(y) > Math.abs(x)) { pointer = undefined; return }
  if (!dragging.value && Math.abs(x) < 8) return
  if (!dragging.value) {
    dragging.value = true
    rail.value?.setPointerCapture(event.pointerId)
  }
  const first = track.value?.children[0] as HTMLElement | undefined
  const second = track.value?.children[1] as HTMLElement | undefined
  const limit = first && second ? second.offsetLeft - first.offsetLeft : 0
  offset.value = Math.max(-limit, Math.min(limit, x))
}
function finish(event: PointerEvent) {
  if (pointer?.id !== event.pointerId) return
  pointer = undefined
  if (!dragging.value) return
  dragging.value = false
  suppressClick = true
  clearTimeout(clickTimer)
  clickTimer = setTimeout(() => suppressClick = false, 0)
  step(event.type === 'pointerup' && Math.abs(offset.value) >= 45 ? (offset.value < 0 ? 1 : -1) : 0)
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
    <div class="collection-heading" :class="{ 'has-controls': moving }">
      <div><div class="eyebrow">{{ kind === 'journal' ? '01 / Writing' : '02 / Projects' }}</div><h2>{{ t[kind] }}</h2></div>
      <div class="collection-actions">
        <a class="inline-link" :href="withBase(routes[locale][kind])">{{ kind === 'journal' ? t.allArticles : t.allProjects }} <Icon name="diagonal" :size="12" /></a>
        <template v-if="moving">
          <button class="round-button previous" :aria-label="t.previous" :aria-controls="'rail-' + kind" @click="step(-1)"><Icon name="arrow" :size="16" /></button>
          <button class="round-button" :aria-label="t.next" :aria-controls="'rail-' + kind" @click="step(1)"><Icon name="arrow" :size="16" /></button>
        </template>
      </div>
    </div>
    <p v-if="!count" class="empty">{{ t.empty }}</p>
    <template v-else>
      <div :id="'rail-' + kind" ref="rail" class="rail" :class="{ moving, dragging }" :tabindex="moving ? 0 : undefined" :aria-label="t[kind]"
        @keydown="keyboard" @pointerdown="down" @pointermove="move" @pointerup="finish"
        @pointercancel="finish" @lostpointercapture="finish" @pointerleave="!dragging && (pointer = undefined)"
        @click.capture="intercept" @dragstart.prevent>
        <div ref="track" class="rail-track" :style="{ transform: offset ? `translateX(${offset}px)` : undefined }">
          <article v-for="{ item, index, slot, position, extra } in slots" :key="position" :inert="extra" :aria-hidden="extra || undefined"
            :class="['rail-item', { 'is-featured': slot === center, 'project-card': kind === 'projects' }]">
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
      <div class="rail-footer" v-if="moving">
        <span>{{ t.drag }}</span>
        <div class="rail-pagination">
          <button v-for="(_, index) in items" :key="index" :aria-label="t.slide.replace('{n}', String(index + 1))"
            :aria-current="index === selected ? 'true' : undefined" @click="choose(index)"></button>
        </div>
        <span aria-live="polite">{{ ordinal(selected) }} / {{ total }}</span>
      </div>
    </template>
  </section>
</template>

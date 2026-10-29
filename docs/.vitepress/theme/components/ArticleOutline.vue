<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import OutlineBranch, { type OutlineHeading } from './OutlineBranch.vue'
const props = defineProps<{ headings: OutlineHeading[]; pageKey: string }>()
const expanded = ref(new Set<string>())
const active = ref('')
let frame = 0
let mounted = false
function expand(slug: string) { expanded.value.add(slug) }
function toggle(slug: string) {
  if (expanded.value.has(slug)) expanded.value.delete(slug)
  else expand(slug)
}
function flatten(headings: OutlineHeading[]): OutlineHeading[] {
  return headings.flatMap(heading => [heading, ...flatten(heading.children)])
}
function revealHash() {
  let slug: string
  try { slug = decodeURIComponent(location.hash.slice(1)) } catch { return }
  function reveal(headings: OutlineHeading[]): boolean {
    for (const heading of headings) {
      if (heading.slug === slug) { expand(heading.slug); return true }
      if (reveal(heading.children)) { expand(heading.slug); return true }
    }
    return false
  }
  if (reveal(props.headings)) active.value = slug
}
function updateActive() {
  frame = 0
  const headings = flatten(props.headings)
  let slug = headings[0]?.slug || ''
  for (const heading of headings) {
    const element = document.getElementById(heading.slug)
    if (element && element.getBoundingClientRect().top <= 130) slug = heading.slug
  }
  active.value = slug
}
function onScroll() { if (!frame) frame = requestAnimationFrame(updateActive) }
watch(() => props.pageKey, async () => {
  expanded.value = new Set()
  active.value = ''
  await nextTick()
  if (mounted) { updateActive(); revealHash() }
})
onMounted(() => {
  mounted = true
  updateActive()
  revealHash()
  window.addEventListener('hashchange', revealHash)
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => {
  mounted = false
  cancelAnimationFrame(frame)
  window.removeEventListener('hashchange', revealHash)
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <nav class="article-outline" aria-label="本文目录">
    <OutlineBranch :headings="headings" :expanded="expanded" :active="active" @toggle="toggle" @expand="expand" />
  </nav>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import { createRiverRenderer } from '../riverRenderer'
import { riverX, riverY, scenePoint, sceneCover } from '../riverGeometry'
const props = defineProps<{ motion: boolean }>()
const surface = ref<HTMLCanvasElement>(), particles = ref<HTMLCanvasElement>(), boat = ref<HTMLImageElement>()
const intro = ref(false)
let cleanup = () => {}, skip = () => {}, refresh = () => {}
watch(() => props.motion, () => { if (!props.motion) skip(); refresh() })
onMounted(() => {
  const root = document.documentElement
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  const fine = matchMedia('(pointer: fine)')
  const canvas = surface.value!, dust = particles.value!, ctx = dust.getContext('2d')
  const source = new Image()
  let renderer: ReturnType<typeof createRiverRenderer> = null
  let frame = 0, width = document.documentElement.clientWidth, height = innerHeight, disposed = false
  let start = 0, elapsed = 0, last = 0, time = 0, px = 0, py = 0, targetX = 0, targetY = 0
  let journey = 0, journeyTarget = 0, journeyLength = 1
  const home = canvas.closest<HTMLElement>('.river-home')
  let initialized = false
  intro.value = props.motion && !reduced.matches
  if (intro.value) {
    root.classList.remove('river-ui-ready')
    root.classList.add('river-boot')
  }
  try { sessionStorage.setItem('shanshui-arrived', '1') } catch { /* Session memory is optional. */ }
  const seeds = Array.from({ length: innerWidth < 700 ? 65 : 140 }, (_, i) => ({
    x: ((i * 73.13) % 137) / 137, y: ((i * 31.17) % 97) / 97,
    speed: .3 + ((i * 19) % 29) / 40, size: .5 + (i % 4) * .35
  }))
  const finishIntro = () => {
    intro.value = false
    root.classList.remove('river-boot')
    root.classList.add('river-ui-ready')
    refresh()
  }
  skip = finishIntro
  const moving = () => props.motion && !reduced.matches && !document.hidden
  const scroll = () => {
    journeyTarget = Math.max(0, Math.min(1, scrollY / journeyLength))
    refresh()
  }
  const measureJourney = () => {
    journeyLength = Math.max(1, (home?.offsetHeight || height) - height)
    scroll()
  }
  function size() {
    width = document.documentElement.clientWidth; height = innerHeight
    const ratio = Math.min(devicePixelRatio, width < 700 ? 1.25 : 1.5)
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio)
    dust.width = Math.round(width * ratio); dust.height = Math.round(height * ratio)
    ctx?.setTransform(ratio, 0, 0, ratio, 0, 0)
    measureJourney()
    refresh()
  }
  function draw(now: number) {
    frame = 0
    if (disposed || document.hidden) return
    const delta = last ? Math.min((now - last) / 1000, .06) : 0
    last = now
    if (moving()) time += delta
    // Native scrolling remains in charge; the boat gently catches up to its position.
    journey = moving() ? journey + (journeyTarget - journey) * (1 - Math.exp(-delta * 4.5)) : journeyTarget
    if (intro.value && initialized) {
      if (!start) start = now
      elapsed = (now - start) / 1000
      if (elapsed > 1.9) root.classList.add('river-ui-ready')
      if (elapsed >= 3.4) finishIntro()
    }
    px += (targetX - px) * .035; py += (targetY - py) * .035
    const reveal = intro.value ? Math.min(1, Math.max(0, (elapsed - .12) / 2.7)) : 1
    renderer?.draw(time, reveal, moving(), px, py, width, height)
    if (boat.value) {
      const advance = intro.value ? Math.max(0, Math.min(1, (elapsed - 1.1) / 2)) : 1
      const cover = sceneCover(width, height)
      const anchor = .5 - .195 * cover.x
      const destination = Math.min(.5 + .34 * cover.x, riverX(.5 - .32 * cover.y))
      const sailing = props.motion && !reduced.matches ? journey : 0
      const x = anchor + (destination - anchor) * sailing - .035 + advance * .035 + (moving() ? Math.sin(time * .16) * .002 : 0)
      const point = scenePoint(x, riverY(x) + .012, width, height)
      boat.value.style.left = point.x + 'px'
      boat.value.style.top = (point.y + (moving() ? Math.sin(time * 1.4) * 1.8 : 0)) + 'px'
      boat.value.style.opacity = String(intro.value ? Math.max(0, Math.min(1, elapsed - 1.4)) : 1)
      boat.value.style.transform = 'translate(-50%, -90%) scale(' + (1 - sailing * .23) + ') rotate(' + (moving() ? Math.sin(time * 1.2) * 1.3 : 0) + 'deg)'
    }
    if (ctx) {
      ctx.clearRect(0, 0, width, height)
      if (moving()) for (const seed of seeds) {
        let x: number, y: number, alpha: number
        if (intro.value) {
          const travel = Math.max(0, elapsed - .15) / 2.9
          x = width * (seed.x * travel * 1.5 + Math.sin(time + seed.y * 8) * .015)
          y = height * (1 - seed.y * travel * 1.55)
          alpha = Math.min(1, elapsed * 2) * Math.max(0, 1 - (elapsed - 2.2) / 1.1) * .65
        } else {
          const along = (seed.x + time * .008 * seed.speed) % 1
          const point = scenePoint(along, riverY(along) + (seed.y - .5) * .12, width, height)
          x = point.x; y = point.y
          alpha = (.16 + Math.sin(time * .6 + seed.x * 20) * .12) * (1 - along * .6)
        }
        ctx.fillStyle = 'rgba(239,219,177,' + alpha + ')'
        ctx.beginPath(); ctx.arc(x, y, seed.size, 0, Math.PI * 2); ctx.fill()
      }
    }
    if ((moving() || intro.value) && !frame) frame = requestAnimationFrame(draw)
  }
  refresh = () => { if (!frame && !disposed && !document.hidden) frame = requestAnimationFrame(draw) }
  const visibility = () => { last = 0; if (document.hidden) { cancelAnimationFrame(frame); frame = 0 } else refresh() }
  const pointer = (event: PointerEvent) => {
    if (fine.matches && props.motion) { targetX = event.clientX / width - .5; targetY = event.clientY / height - .5 }
  }
  const exit = () => { targetX = 0; targetY = 0 }
  const intent = () => { if (intro.value) finishIntro() }
  const keyIntent = (e: KeyboardEvent) => { if (['Tab','Escape','Enter',' ','PageDown','ArrowDown'].includes(e.key)) intent() }
  const preference = () => { if (reduced.matches) finishIntro(); refresh() }
  const lost = (e: Event) => { e.preventDefault(); canvas.style.visibility = 'hidden'; finishIntro() }
  source.onload = () => {
    if (disposed) return
    renderer = createRiverRenderer(canvas, source)
    initialized = true
    if (!renderer) { canvas.style.visibility = 'hidden'; finishIntro() }
    size(); refresh()
  }
  source.onerror = () => { canvas.style.visibility = 'hidden'; finishIntro() }
  source.src = withBase('/images/river-scene.png')
  // A slow or unavailable graphics layer must never hold content behind black.
  const safety = window.setTimeout(() => { if (!initialized) finishIntro() }, 1700)
  size()
  journey = journeyTarget
  const journeyObserver = new ResizeObserver(measureJourney)
  if (home) journeyObserver.observe(home)
  window.addEventListener('resize', size)
  window.addEventListener('scroll', scroll, { passive: true })
  window.addEventListener('pointermove', pointer, { passive: true })
  window.addEventListener('wheel', intent, { passive: true })
  window.addEventListener('touchstart', intent, { passive: true })
  window.addEventListener('keydown', keyIntent)
  document.addEventListener('pointerleave', exit)
  document.addEventListener('visibilitychange', visibility)
  reduced.addEventListener('change', preference)
  canvas.addEventListener('webglcontextlost', lost)
  cleanup = () => {
    disposed = true; cancelAnimationFrame(frame); clearTimeout(safety); renderer?.dispose()
    journeyObserver.disconnect()
    source.onload = null; source.onerror = null
    root.classList.remove('river-boot', 'river-ui-ready')
    window.removeEventListener('resize', size); window.removeEventListener('pointermove', pointer)
    window.removeEventListener('scroll', scroll)
    window.removeEventListener('wheel', intent); window.removeEventListener('touchstart', intent)
    window.removeEventListener('keydown', keyIntent); document.removeEventListener('pointerleave', exit)
    document.removeEventListener('visibilitychange', visibility); reduced.removeEventListener('change', preference)
    canvas.removeEventListener('webglcontextlost', lost)
  }
})
onBeforeUnmount(() => cleanup())
</script>

<template>
  <div class="river-scene" aria-hidden="true">
    <img class="river-fallback" :src="withBase('/images/river-scene.png')" alt="" fetchpriority="high" />
    <canvas ref="surface" class="river-surface"></canvas>
    <canvas ref="particles" class="river-particles"></canvas>
    <img ref="boat" class="river-boat" :src="withBase('/images/river-boat.png')" alt="" />
  </div>
  <button v-if="intro" class="intro-skip" @click="skip">跳过开场 <span aria-hidden="true">↗</span></button>
</template>

import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'
import mediumZoom from 'medium-zoom'

export function useImageZoom() {
  const route = useRoute()
  let zoom: ReturnType<typeof mediumZoom> | undefined
  let stopped = false
  async function attach() {
    await nextTick()
    if (stopped) return
    zoom?.detach()
    zoom = mediumZoom('.prose img:not(a img)', { background: 'rgba(15, 20, 17, .94)', margin: 24 })
    zoom.getImages().forEach(image => {
      image.tabIndex = 0
      image.setAttribute('role', 'button')
      image.setAttribute('aria-label', `${image.getAttribute('alt') || '图片'}，点击放大`)
    })
  }
  function keydown(event: KeyboardEvent) {
    if ((event.key === 'Enter' || event.key === ' ') && event.target instanceof HTMLImageElement && zoom?.getImages().includes(event.target)) {
      event.preventDefault()
      zoom.open({ target: event.target })
    }
  }
  onMounted(() => { attach(); document.addEventListener('keydown', keydown) })
  watch(() => route.path, attach, { flush: 'post' })
  onBeforeUnmount(() => { stopped = true; zoom?.detach(); document.removeEventListener('keydown', keydown) })
}

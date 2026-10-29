import { nextTick, onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vitepress'
import { riverClips } from './riverGeometry'

export function useRiverNavigation() {
  const router = useRouter()
  let cleanup = () => {}
  onMounted(() => {
    const previousBefore = router.onBeforePageLoad
    const previousAfter = router.onAfterRouteChange
    let overlay: HTMLDivElement | null = null
    let timer = 0, fromHome = false
    let generation = 0
    const animated = () => !document.documentElement.classList.contains('motion-off') && !matchMedia('(prefers-reduced-motion: reduce)').matches
    const remove = () => {
      overlay?.remove(); overlay = null; clearTimeout(timer)
      if (document.documentElement.classList.contains('river-navigating')) document.documentElement.classList.remove('river-navigating')
    }
    const capture = () => {
      const source = document.querySelector<HTMLElement>('.site-shell')
      if (!source) return
      const offset = scrollY
      const viewWidth = document.documentElement.clientWidth
      const clips = riverClips(viewWidth, innerHeight)
      overlay = document.createElement('div')
      overlay.className = 'river-transition'; overlay.inert = true; overlay.setAttribute('aria-hidden', 'true')
      for (let i = 0; i < 2; i++) {
        const panel = document.createElement('div')
        panel.className = 'river-transition-bank'; panel.style.clipPath = clips[i]
        const clone = source.cloneNode(true) as HTMLElement
        clone.classList.add('river-frozen')
        clone.style.cssText = `position:absolute;left:0;top:${-offset}px;width:${viewWidth}px;pointer-events:none;`
        clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'))
        const oldCanvases = source.querySelectorAll('canvas')
        clone.querySelectorAll('canvas').forEach((canvas, n) => {
          try { canvas.getContext('2d')?.drawImage(oldCanvases[n], 0, 0) } catch { /* The static image remains below the canvas. */ }
        })
        for (const selector of ['.river-scene', '.site-header']) {
          const el = clone.querySelector<HTMLElement>(selector)
          if (el) { el.style.position = 'absolute'; el.style.top = offset + 'px'; el.style.width = '100%' }
        }
        clone.querySelector('.intro-skip')?.remove()
        panel.append(clone); overlay.append(panel)
      }
      document.body.append(overlay)
    }
    router.onBeforePageLoad = async href => {
      if ((await previousBefore?.(href)) === false) return false
      const to = new URL(href, location.href)
      if (to.pathname === router.route.path) return
      generation++
      remove()
      fromHome = router.route.data.frontmatter.layout === 'home'
      if (fromHome && animated()) {
        capture()
        document.documentElement.classList.add('river-navigating')
        // Release a stalled snapshot without preventing the underlying route retry.
        timer = window.setTimeout(remove, 5000)
      }
    }
    router.onAfterRouteChange = async href => {
      await previousAfter?.(href)
      if (new URL(href, location.href).pathname !== router.route.path) return
      await nextTick()
      const version = generation
      const home = router.route.data.frontmatter.layout === 'home'
      if (home && !location.hash) window.scrollTo({ top: 0, behavior: 'instant' })
      const activeOverlay = overlay
      if (activeOverlay) {
        clearTimeout(timer)
        const duration = innerWidth < 700 ? 480 : 820
        const panels = [...activeOverlay.children] as HTMLElement[]
        await Promise.all(panels.map((panel, i) => panel.animate([
          { transform: 'translate(0,0)', opacity: 1 },
          { transform: `translate(${i ? '' : '-'}72vw,${i ? '' : '-'}95vh)`, opacity: 0 }
        ], { duration, easing: 'cubic-bezier(.65,0,.2,1)', fill: 'forwards' }).finished.catch(() => {})))
        if (version === generation) remove()
        else activeOverlay.remove()
      } else if (!home && animated()) {
        const content = document.querySelector('.route-content')
        content?.animate(home ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], {
          duration: home ? 500 : 220, easing: 'cubic-bezier(.2,.65,.3,1)'
        })
      }
      if (version === generation && !location.hash) {
        const heading = document.querySelector<HTMLElement>('#main-content h1')
        heading?.setAttribute('tabindex', '-1'); heading?.focus({ preventScroll: true })
      }
    }
    const interrupt = () => { if (!animated()) remove() }
    const observer = new MutationObserver(interrupt)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const resize = () => remove()
    window.addEventListener('resize', resize)
    cleanup = () => { generation++; remove(); observer.disconnect(); window.removeEventListener('resize', resize); router.onBeforePageLoad = previousBefore; router.onAfterRouteChange = previousAfter }
  })
  onBeforeUnmount(() => cleanup())
}

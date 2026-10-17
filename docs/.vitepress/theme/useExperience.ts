import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useExperience() {
  const dark = ref(false)
  const motion = ref(true)
  const progress = ref(0)
  const scrolled = ref(false)
  const toast = ref('')
  const ripples = ref<{ id: number; x: number; y: number }[]>([])
  let cleanup = () => {}
  let toastTimer: ReturnType<typeof setTimeout>
  function announce(message: string) { toast.value = message; clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.value = '', 2200) }
  function persist(key: string, value: string) { try { localStorage.setItem(key, value) } catch { /* Browsing preferences are optional. */ } }
  function toggleTheme() { dark.value = !dark.value; document.documentElement.classList.toggle('dark', dark.value); persist('shanshui-theme', dark.value ? 'dark' : 'light') }
  function toggleMotion() { motion.value = !motion.value; document.documentElement.classList.toggle('motion-off', !motion.value); persist('shanshui-motion', motion.value ? 'on' : 'off'); announce(motion.value ? '轻动态已开启' : '已切换为静态阅读') }

  onMounted(() => {
    const root = document.documentElement
    dark.value = root.classList.contains('dark')
    motion.value = !root.classList.contains('motion-off')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fine = window.matchMedia('(pointer: fine)')
    const active = () => motion.value && !reduced.matches
    const seen = new WeakSet<Element>()
    let sequence = 0
    let pointerFrame = 0
    let scrollFrame = 0
    let revealFrame = 0
    let tilted: HTMLElement | null = null
    let pointerX = 0
    let pointerY = 0
    let pointerTarget: Element | null = null
    const resetTilt = () => { tilted?.style.removeProperty('--tilt-x'); tilted?.style.removeProperty('--tilt-y'); tilted = null }
    const pointer = (event: PointerEvent) => {
      if (!active() || !fine.matches || event.pointerType === 'touch') return
      pointerX = event.clientX; pointerY = event.clientY; pointerTarget = event.target instanceof Element ? event.target : null
      if (pointerFrame) return
      pointerFrame = requestAnimationFrame(() => {
        root.style.setProperty('--px', String(pointerX / innerWidth - .5))
        root.style.setProperty('--py', String(pointerY / innerHeight - .5))
        root.style.setProperty('--cursor-x', `${pointerX}px`)
        root.style.setProperty('--cursor-y', `${pointerY}px`)
        root.classList.add('has-pointer')
        const card = pointerTarget?.closest<HTMLElement>('.tilt-card') || null
        if (card !== tilted) resetTilt()
        tilted = card
        if (card) { const box = card.getBoundingClientRect(); card.style.setProperty('--tilt-x', `${-(pointerY - box.top - box.height / 2) / box.height * 2.2}deg`); card.style.setProperty('--tilt-y', `${(pointerX - box.left - box.width / 2) / box.width * 2.2}deg`) }
        pointerFrame = 0
      })
    }
    const leave = () => { root.classList.remove('has-pointer'); root.style.setProperty('--px', '0'); root.style.setProperty('--py', '0'); resetTilt() }
    const scroll = () => {
      if (scrollFrame) return
      scrollFrame = requestAnimationFrame(() => {
        const maximum = document.documentElement.scrollHeight - innerHeight
        progress.value = maximum > 0 ? Math.min(100, Math.max(0, scrollY / maximum * 100)) : 0
        scrolled.value = scrollY > 24
        root.style.setProperty('--hero-scroll', active() ? `${Math.min(scrollY, 700) * .11}px` : '0px')
        scrollFrame = 0
      })
    }
    const click = async (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return
      const copy = event.target.closest<HTMLButtonElement>('button.copy')
      if (copy) {
        const code = copy.parentElement?.querySelector('code')?.textContent
        if (code) {
          try { await navigator.clipboard.writeText(code); copy.classList.add('copied'); announce('代码已复制'); setTimeout(() => copy.classList.remove('copied'), 2000) }
          catch { announce('暂时无法复制，请手动选取代码') }
        }
      }
      if (!active() || event.detail === 0 || event.target.closest('dialog')) return
      const id = sequence++
      ripples.value = [...ripples.value.slice(-5), { id, x: event.clientX, y: event.clientY }]
    }
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer?.unobserve(entry.target) }
    }, { threshold: .08, rootMargin: '0px 0px -12px 0px' }) : null
    const reveal = () => {
      document.querySelectorAll('[data-reveal]').forEach(element => {
        if (seen.has(element)) return
        seen.add(element)
        if (!observer || !active() || element.getBoundingClientRect().top < innerHeight - 12) element.classList.add('is-visible')
        else observer.observe(element)
      })
      scroll()
    }
    reveal()
    root.classList.add('motion-ready')
    const mutations = new MutationObserver(() => { if (!revealFrame) revealFrame = requestAnimationFrame(() => { reveal(); revealFrame = 0 }) })
    const view = document.querySelector('.route-view')
    if (view) mutations.observe(view, { childList: true, subtree: true })
    window.addEventListener('pointermove', pointer, { passive: true })
    document.addEventListener('pointerleave', leave)
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('resize', scroll, { passive: true })
    document.addEventListener('click', click)
    cleanup = () => {
      window.removeEventListener('pointermove', pointer); document.removeEventListener('pointerleave', leave)
      window.removeEventListener('scroll', scroll); window.removeEventListener('resize', scroll); document.removeEventListener('click', click)
      cancelAnimationFrame(pointerFrame); cancelAnimationFrame(scrollFrame); cancelAnimationFrame(revealFrame)
      observer?.disconnect(); mutations.disconnect(); root.classList.remove('motion-ready', 'has-pointer'); resetTilt()
    }
  })
  onBeforeUnmount(() => { cleanup(); clearTimeout(toastTimer) })
  return { dark, motion, progress, scrolled, toast, ripples, toggleTheme, toggleMotion }
}

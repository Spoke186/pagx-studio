import { createClock, gsap, ScrollTrigger } from '@pagx/motion'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

const EASE = 'expo.out' // DESIGN.md: cubic-bezier(0.16, 1, 0.3, 1)
const root = document.documentElement
const hoverable = () => matchMedia('(hover: hover) and (pointer: fine)').matches
// static = prefers-reduced-motion (set inline in Layout); the stage picks high or mid for itself (stage.ts)
const still = () => root.dataset.tier === 'static'
let firstLoadDone = false
let stageApi: { flow(head: number): void } | null = null

// one listener per session, whichever page loads first (home or portfolio)
let booted = false
export function bootSite() {
  if (booted) return
  booted = true
  document.addEventListener('astro:page-load', initSite)
}

export function initSite() {
  const cleanups: (() => void)[] = []
  const on = (t: EventTarget, type: string, fn: any, opts?: AddEventListenerOptions) => {
    t.addEventListener(type, fn, opts)
    cleanups.push(() => t.removeEventListener(type, fn, opts))
  }
  root.classList.replace('no-js', 'js')

  const clock = createClock({ smooth: !still() && hoverable() })
  const ctx = gsap.context(() => {})
  cleanups.push(() => ctx.revert())

  if (still()) root.classList.add('is-ready', 'is-revealed')
  else if (!firstLoadDone) intro(cleanups)
  else {
    root.classList.add('is-ready', 'is-revealed')
    proximities(cleanups)
  }

  ctx.add(() => {
    if (!still()) {
      heroLift()
      lineReveals()
      showcases()
    }
    navState()
    shop()
    automations()
  })
  liveFrames(cleanups)
  scrollHints(on)

  stage(cleanups, clock)
  footWord(cleanups)
  diveLinks(still())
  header(on, clock.lenis)
  pointer(on)
  buttons(on)
  menu(on)
  themeToggle(on)
  copyButtons(on)
  ScrollTrigger.refresh()

  const teardown = () => {
    cleanups.splice(0).forEach((fn) => fn())
    document.removeEventListener('astro:before-swap', teardown)
  }
  document.addEventListener('astro:before-swap', teardown)
}

/* ---------- footer wordmark: rises in, an orange wave runs through it every few seconds, the cursor lights it ---------- */
function footWord(cleanups: (() => void)[]) {
  const el = document.querySelector<HTMLElement>('[data-foot-word]')
  if (!el || still()) return
  const chars = [...el.querySelectorAll<HTMLElement>('.c')]
  const wave = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 4.5 })
    .to(chars, { '--kw': 1, duration: 0.35, ease: 'power2.out', stagger: 0.07 })
    .to(chars, { '--kw': 0, duration: 0.8, ease: 'power2.in', stagger: 0.07 }, 0.35)
  const intro = gsap.timeline({ paused: true, onComplete: () => { wave.play() } })
    .from(chars, { yPercent: 105, duration: 1.2, ease: EASE, stagger: 0.045 })
    .from(el, { '--sq': 0, duration: 0.8, ease: 'back.out(3)' }, 0.25)
  const st = ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => intro.play() })
  let visible = false
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible && intro.progress() === 1 ? wave.play() : wave.pause() })
  io.observe(el)
  const onMove = (e: PointerEvent) => {
    if (!visible || e.pointerType !== 'mouse') return
    chars.forEach((c) => {
      const r = c.getBoundingClientRect()
      const t = Math.max(0, 1 - Math.hypot(r.left + r.width / 2 - e.clientX, r.top + r.height / 2 - e.clientY) / 280)
      gsap.to(c, { '--kc': t * t * (3 - 2 * t), duration: 0.45, ease: 'power3.out', overwrite: 'auto' })
    })
  }
  const onLeave = () => gsap.to(chars, { '--kc': 0, duration: 0.8, ease: 'power3.out', overwrite: 'auto' })
  addEventListener('pointermove', onMove, { passive: true })
  el.closest('footer')!.addEventListener('pointerleave', onLeave)
  cleanups.push(() => { wave.kill(); intro.kill(); st.kill(); io.disconnect(); removeEventListener('pointermove', onMove) })
}

/* ---------- intro: the title decodes from terminal glyphs, letter by letter (wow moment) ---------- */
const GLYPHS = '01<>/{}[]=+*#%&$'
function intro(cleanups: (() => void)[]) {
  firstLoadDone = true
  const title = document.querySelector<HTMLElement>('.hero [data-hero-title]')
  if (!title) return root.classList.add('is-ready', 'is-revealed') // pages without the hero (portfolio)
  gsap.set('.hero .reveal', { autoAlpha: 0, y: 12 })
  const chars = [...title.querySelectorAll<HTMLElement>('.c')]
  const finals = chars.map((c) => c.textContent ?? '')
  document.fonts.ready.then(() => {
    root.classList.add('is-ready', 'is-revealed')
    // each letter shows random glyphs until its turn, then settles; the text is real from the first paint (LCP)
    const clock = { t: 0 }
    gsap
      .timeline({ onComplete: () => proximities(cleanups) })
      .from(chars, { yPercent: 110, duration: 1.1, ease: EASE, stagger: 0.03 })
      .to(clock, {
        t: 1, duration: 1.5, ease: 'none',
        onUpdate: () => chars.forEach((c, i) => {
          const done = clock.t > 0.25 + (i / chars.length) * 0.7
          const ch = done ? finals[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0]
          if (finals[i].trim() && c.textContent !== ch) c.textContent = ch
        }),
        onComplete: () => chars.forEach((c, i) => (c.textContent = finals[i])),
      }, 0)
      .to('.hero .reveal', { autoAlpha: 1, y: 0, duration: 0.9, ease: EASE, stagger: 0.08 }, 0.7)
  })
}

function proximities(cleanups: (() => void)[]) {
  document.querySelectorAll<HTMLElement>('[data-proximity]').forEach((el) => cleanups.push(proximity(el)))
}

/* ---------- cursor proximity: letters near the cursor thin out to a wireframe weight ---------- */
function proximity(el: HTMLElement, radius = 300) {
  const chars = [...el.querySelectorAll<HTMLElement>('.c')]
  const cur = chars.map(() => -1)
  // letter centres in page coordinates, measured on resize and every half second while the cursor is around:
  // reading 24 rects per frame after writing weights forced a layout per frame (Lighthouse: 4.8 s of style & layout)
  let centres: { x: number; y: number }[] = []
  const measure = () => (centres = chars.map((c) => { const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2 + scrollX, y: r.top + r.height / 2 + scrollY } }))
  measure()
  const iv = setInterval(() => mouse.active && visible && measure(), 500)
  addEventListener('resize', measure)
  let visible = true
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
  io.observe(el)
  const tick = () => {
    if (!visible) return
    chars.forEach((c, k) => {
      let t = 0
      if (mouse.active) {
        const d = Math.hypot(centres[k].x - scrollX - mouse.x, centres[k].y - scrollY - mouse.y)
        t = Math.max(0, 1 - d / radius)
        t = t * t * (3 - 2 * t)
      }
      const target = 600 - 420 * t
      if (cur[k] < 0) cur[k] = target
      if (Math.abs(target - cur[k]) < 0.5) return
      cur[k] += (target - cur[k]) * 0.14
      c.style.fontVariationSettings = `"wght" ${cur[k].toFixed(0)}`
    })
  }
  gsap.ticker.add(tick)
  return () => { gsap.ticker.remove(tick); clearInterval(iv); io.disconnect(); removeEventListener('resize', measure) }
}

const mouse = { x: -9999, y: -9999, active: false }

/* ---------- buttons: rolling letters + the cursor drives the sheen (primary) and the glow (secondary) ---------- */
function buttons(on: Function) {
  if (!still()) document.querySelectorAll<HTMLElement>('.btn .btn-label:not([data-split])').forEach((label) => {
    const text = label.textContent ?? ''
    label.dataset.split = ''
    // letters are decorative twins; screen readers get the plain text
    label.innerHTML = `<span class="sr-only">${text}</span>` + [...text].map((ch, i) => `<span class="l" aria-hidden="true" style="--i:${i}"><span>${ch}</span><span>${ch}</span></span>`).join('')
  })
  document.querySelectorAll<HTMLElement>('.btn').forEach((b) => {
    const set = (e: PointerEvent) => {
      const r = b.getBoundingClientRect()
      b.style.setProperty('--x', `${e.clientX - r.left}px`)
      b.style.setProperty('--y', `${e.clientY - r.top}px`)
    }
    on(b, 'pointerenter', set)
    on(b, 'pointermove', set)
  })
}

function pointer(on: Function) {
  on(window, 'pointermove', (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    mouse.x = e.clientX
    mouse.y = e.clientY
    mouse.active = true
  })
  on(document, 'pointerleave', () => { mouse.active = false })

  // Magnetic primary buttons (max 8 px)
  if (still() || !hoverable()) return
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((b) => {
    const mx = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3.out' })
    const my = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3.out' })
    on(b, 'pointermove', (e: PointerEvent) => {
      const r = b.getBoundingClientRect()
      mx(((e.clientX - r.left) / r.width - 0.5) * 16)
      my(((e.clientY - r.top) / r.height - 0.5) * 16)
    })
    on(b, 'pointerleave', () => { mx(0); my(0) })
  })
}

/* ---------- hero: the title lifts and fades as the camera falls into the hole ---------- */
function heroLift() {
  const hero = document.querySelector('.hero')
  if (!hero) return
  gsap.to('[data-hero-title]', { yPercent: -24, autoAlpha: 0.15, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
}

/* ---------- section headlines: line reveal ---------- */
function lineReveals() {
  document.querySelectorAll<HTMLElement>('[data-lines]').forEach((el) => {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines' })
    gsap.from(split.lines, { yPercent: 100, duration: 0.9, ease: EASE, stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 85%', once: true } })
  })
}

/* ---------- concept showcases: the phone floats with the page ---------- */
function showcases() {
  document.querySelectorAll<HTMLElement>('[data-float]').forEach((phone) => {
    gsap.fromTo(phone, { yPercent: 12 }, { yPercent: -12, ease: 'none', scrollTrigger: { trigger: phone, start: 'top bottom', end: 'bottom top', scrub: true } })
  })
}

/* ---------- header ---------- */
function header(on: Function, lenis: any) {
  const h = document.querySelector<HTMLElement>('[data-header]')!
  let last = 0
  const update = () => {
    const y = scrollY
    h.classList.toggle('is-scrolled', y > 40)
    h.classList.toggle('is-hidden', y > last && y > 400)
    last = y
  }
  on(window, 'scroll', update, { passive: true })
  update()
  // anchor links go through Lenis so the smooth scroll stays in one clock
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    on(a, 'click', (e: Event) => {
      const target = document.querySelector(a.getAttribute('href')!)
      if (!target) return
      e.preventDefault()
      closeMenu()
      if (lenis) lenis.scrollTo(target, { offset: -40, duration: 1.4 })
      else target.scrollIntoView({ behavior: still() ? 'auto' : 'smooth' })
      ;(target as HTMLElement).focus?.({ preventScroll: true })
    })
  })
}

function navState() {
  document.querySelectorAll<HTMLElement>('[data-section]').forEach((sec) => {
    const link = document.querySelector(`[data-navlink="${sec.dataset.section}"]`)
    if (!link) return
    ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => link.setAttribute('aria-current', String(s.isActive)) })
  })
}

/* ---------- mobile menu ---------- */
let closeMenu = () => {}
function menu(on: Function) {
  const btn = document.querySelector<HTMLButtonElement>('[data-menu-btn]')
  const sheet = document.querySelector<HTMLElement>('[data-menu]')
  if (!btn || !sheet) return
  const set = (open: boolean) => {
    sheet.hidden = !open
    btn.setAttribute('aria-expanded', String(open))
    btn.textContent = open ? btn.dataset.close! : btn.dataset.open!
    if (open) {
      if (!still()) gsap.from(sheet.querySelectorAll('a'), { y: 24, autoAlpha: 0, fontVariationSettings: '"wght" 200', duration: 0.6, ease: EASE, stagger: 0.04 })
      sheet.querySelector('a')?.focus()
    }
  }
  closeMenu = () => { if (!sheet.hidden) { set(false); btn.focus() } }
  on(btn, 'click', () => set(sheet.hidden))
  on(document, 'keydown', (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu() })
}

/* ---------- Cumbre: Antes | Comparar | Después over the live store ---------- */
function shop() {
  const stage = document.querySelector<HTMLElement>('[data-shop]')
  const handle = stage?.querySelector<HTMLElement>('[data-split]')
  if (!stage || !handle) return
  const view = stage.querySelector<HTMLElement>('.browser-view')!
  const btns = stage.querySelectorAll<HTMLButtonElement>('[data-ba]')
  let split = 50
  const set = (v: number) => {
    split = Math.max(0, Math.min(100, v))
    stage.style.setProperty('--split', `${split}%`)
    handle.setAttribute('aria-valuenow', String(Math.round(split)))
  }
  const mode = (m: string) => {
    stage.dataset.mode = m
    btns.forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.ba === m)))
    set(m === 'before' ? 100 : m === 'after' ? 0 : 50)
  }
  btns.forEach((b) => b.addEventListener('click', () => mode(b.dataset.ba!)))

  // drag: the handle captures the pointer so the iframe never steals the gesture
  const fromEvent = (e: PointerEvent) => { const r = view.getBoundingClientRect(); set(((e.clientX - r.left) / r.width) * 100) }
  const knob = handle.querySelector('span')!
  knob.addEventListener('pointerdown', (e) => { knob.setPointerCapture(e.pointerId); stage.classList.add('is-dragging'); hint.kill() })
  knob.addEventListener('pointermove', (e) => { if (knob.hasPointerCapture(e.pointerId)) fromEvent(e) })
  knob.addEventListener('pointerup', () => stage.classList.remove('is-dragging'))
  handle.addEventListener('keydown', (e) => {
    const step = { ArrowLeft: -5, ArrowRight: 5, Home: -100, End: 100 }[e.key]
    if (step === undefined) return
    e.preventDefault()
    set(split + step)
  })

  // the bar sways once to invite dragging
  const o = { v: 50 }
  const sway = () => { stage.classList.add('is-dragging'); set(o.v) }
  const hint = gsap.timeline({ paused: true, onComplete: () => stage.classList.remove('is-dragging') })
    .to(o, { v: 36, duration: 0.7, ease: 'power2.inOut', onUpdate: sway })
    .to(o, { v: 58, duration: 0.8, ease: 'power2.inOut', onUpdate: sway })
    .to(o, { v: 50, duration: 0.6, ease: EASE, onUpdate: sway })
  if (!still()) ScrollTrigger.create({ trigger: stage, start: 'top 60%', once: true, onEnter: () => stage.dataset.mode === 'compare' && hint.play() })
  set(50)
}

/* ---------- live concepts: the hint leaves once the visitor scrolls inside the site (same-origin iframe) ---------- */
// Same-origin iframes share this page's main thread, and native lazy loading starts them ~2,500 px early.
// Load each live concept only when it is about to scroll in.
function liveFrames(cleanups: (() => void)[]) {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return
    const f = e.target as HTMLIFrameElement
    f.src = f.dataset.src!
    io.unobserve(f)
  }), { rootMargin: '300px 0px' })
  document.querySelectorAll<HTMLIFrameElement>('iframe[data-src]').forEach((f) => io.observe(f))
  cleanups.push(() => io.disconnect())
}

function scrollHints(on: Function) {
  document.querySelectorAll<HTMLIFrameElement>('iframe[data-scroll-view]').forEach((frame) => {
    const hint = frame.closest('.browser')?.querySelector('[data-scroll-hint]')
    if (!hint) return
    const bind = () => frame.contentWindow?.addEventListener('scroll', () => hint.classList.add('is-gone'), { once: true, passive: true })
    if (frame.contentDocument?.readyState === 'complete') bind()
    on(frame, 'load', bind)
  })
}

/* ---------- automations: tabs + the flow draws itself, then the chat plays ---------- */
function automations() {
  const root = document.querySelector<HTMLElement>('[data-auto]')
  if (!root) return
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[data-auto-tab]')]
  const panels = [...root.querySelectorAll<HTMLElement>('[data-auto-panel]')]
  let tl: gsap.core.Timeline | null = null

  // bubbles: false leaves the chat for its own trigger (phones, where it sits a screen below the flow)
  const play = (panel: HTMLElement, bubbles = true) => {
    tl?.kill()
    const nodes = [...panel.querySelectorAll<HTMLElement>('[data-node]')]
    const chat = panel.querySelectorAll('[data-bubble]')
    const fill = panel.querySelector('[data-flow-fill]')
    const packet = panel.querySelector<HTMLElement>('[data-flow-packet]')!
    const line = packet.parentElement!
    if (still()) {
      nodes.forEach((n) => n.classList.add('is-on'))
      gsap.set(fill, { scaleY: 1 })
      return
    }
    nodes.forEach((n) => n.classList.remove('is-on'))
    const step = 0.55
    // the packet stops at each node's dot, which lights up as it arrives
    const stops = nodes.map((n) => n.offsetTop + 22 - line.offsetTop)
    tl = gsap.timeline()
      .set(fill, { scaleY: 0 })
      .set(packet, { y: 0, opacity: 1 })
      .add(() => stageApi?.flow(0))
      .set(chat, { autoAlpha: 0, y: 10 })
      .fromTo(nodes, { autoAlpha: 0, x: -12 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: EASE, stagger: 0.07 })
    nodes.forEach((n, i) => {
      const y = Math.max(0, stops[i])
      // the 3D ribbon of code (stage.ts) lights up to the packet
      tl!.to(packet, { y, duration: i ? step : 0.2, ease: 'power2.inOut', onUpdate: () => stageApi?.flow((gsap.getProperty(packet, 'y') as number) / line.offsetHeight) }, i ? '>' : '<0.2')
        .to(fill, { scaleY: y / line.offsetHeight, duration: i ? step : 0.2, ease: 'power2.inOut' }, '<')
        .add(() => n.classList.add('is-on'))
    })
    tl.to(packet, { opacity: 0, duration: 0.3 })
    const show = () => gsap.to(chat, { autoAlpha: 1, y: 0, duration: 0.5, ease: EASE, stagger: 0.6 })
    if (bubbles) tl.add(show, '-=0.1')
    else ScrollTrigger.create({ trigger: panel.querySelector('.chat'), start: 'top 75%', once: true, onEnter: show })
  }

  const select = (i: number, focus = false) => {
    tabs.forEach((t, k) => {
      t.setAttribute('aria-selected', String(k === i))
      t.tabIndex = k === i ? 0 : -1
      panels[k].hidden = k !== i
    })
    if (focus) tabs[i].focus()
    play(panels[i])
  }

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i))
    t.addEventListener('keydown', (e) => {
      const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]
      if (!d) return
      e.preventDefault()
      select((i + d + tabs.length) % tabs.length, true)
    })
  })
  root.querySelectorAll('[data-auto-replay]').forEach((b) => b.addEventListener('click', () => play(b.closest<HTMLElement>('[data-auto-panel]')!)))
  // first case plays when the section comes into view
  ScrollTrigger.create({ trigger: root, start: 'top 65%', once: true, onEnter: () => play(panels[tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true')], innerWidth > 860) })
  if (!still()) panels.forEach((p) => gsap.set(p.querySelectorAll('[data-bubble]'), { autoAlpha: 0 }))
}

/* ---------- stage: live 3D per section (stage.ts); the poster stays for reduced motion or no WebGL ---------- */
function stage(cleanups: (() => void)[], clock: { add: (fn: (t: number) => void) => () => void }) {
  const canvas = document.querySelector<HTMLCanvasElement>('canvas[data-stage]')
  if (!canvas || still()) return
  let dead = false
  cleanups.push(() => { dead = true })
  // three.js loads once the page is loaded and the main thread is free, so it never competes with first paint
  const start = async () => {
    const [{ mountStage }] = await Promise.all([import('./stage'), document.fonts.load('50px "Share Tech Mono"'), document.fonts.load('600 30px "Hanken Grotesk Variable"')])
    if (dead) return
    const s = mountStage(canvas, clock.add)
    if (!s) return
    stageApi = s
    cleanups.push(() => { s.destroy(); stageApi = null })
  }
  const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 1200 }) : setTimeout(start, 300))
  if (document.readyState === 'complete') idle()
  else addEventListener('load', idle, { once: true })
}

/* ---------- light / dark: the choice is remembered; the first paint is set inline in Layout ---------- */
function themeToggle(on: Function) {
  const btn = document.querySelector<HTMLButtonElement>('[data-theme-toggle]')
  if (!btn) return
  const sync = () => btn.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'))
  sync()
  on(btn, 'click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'
    try { localStorage.setItem('theme', root.dataset.theme) } catch {}
    sync()
  })
}

/* ---------- copy number ---------- */
function copyButtons(on: Function) {
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((b) => {
    const label = b.textContent
    on(b, 'click', async () => {
      try {
        await navigator.clipboard.writeText(b.dataset.copy!)
        b.textContent = b.dataset.copied!
        setTimeout(() => (b.textContent = label), 2000)
      } catch {
        const strong = b.parentElement?.querySelector('strong')
        if (strong) getSelection()?.selectAllChildren(strong)
      }
    })
  })
}

// links marked data-dive fade the page to black before leaving (to the portfolio)
function diveLinks(still: boolean) {
  document.querySelectorAll<HTMLAnchorElement>('a[data-dive]').forEach((a) => {
    a.addEventListener('click', (e) => {
      if (still || e.metaKey || e.ctrlKey || e.shiftKey || location.pathname === new URL(a.href).pathname) return
      e.preventDefault()
      document.documentElement.classList.add('is-diving')
      gsap.delayedCall(0.7, () => (location.href = a.href))
    })
  })
}

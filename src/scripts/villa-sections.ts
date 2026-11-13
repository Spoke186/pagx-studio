// Instituto La Villa: everything below the hero. Renders come from assets/blender/villa.blend (villa_render.py).
// Scroll belongs to ScrollTrigger (synced to Lenis), loops to the shared clock, interactions to pointer events.
import { gsap, ScrollTrigger } from '@pagx/motion'
import { SplitText } from 'gsap/SplitText'

type Opts = { add: (fn: (t: number) => void) => () => void; reduced: boolean }
type Anchors = { d: Record<string, [number, number]>[]; m: Record<string, [number, number]>[]; range: Record<string, [number, number]> }
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s)!
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)]
const SEQ_FRAMES = 120 // Blender frames; the phone set renders every second one

/** Load a numbered webp sequence; resolves the frames array immediately and fills it as images arrive. */
function sequence(n: number, url: (i: number) => string) {
  const frames: (HTMLImageElement | null)[] = Array(n).fill(null)
  // every 8th frame first so a fast scrub always has something close, then the rest in order
  const order = [...Array(n).keys()].sort((a, b) => (a % 8 === 0 ? -1 : 0) - (b % 8 === 0 ? -1 : 0) || a - b)
  order.forEach((i) => {
    const img = new Image()
    img.decoding = 'async'
    img.src = url(i)
    // decoded off the main thread before the scrub may draw it, so drawing never stalls a frame
    img.decode().then(() => (frames[i] = img), () => {})
  })
  return frames
}
function nearest(frames: (HTMLImageElement | null)[], i: number) {
  for (let d = 1; d < frames.length; d++) { const f = frames[i - d] ?? frames[i + d]; if (f) return f }
  return null
}
// object-fit: cover, returns the drawn rect so anchors can be mapped onto it
function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const dw = img.naturalWidth * s, dh = img.naturalHeight * s, x = (w - dw) / 2, y = (h - dh) / 2
  ctx.drawImage(img, x, y, dw, dh)
  return { x, y, w: dw, h: dh }
}

export function mountSections({ add, reduced }: Opts) {
  const root = document.documentElement
  const fine = matchMedia('(pointer: fine)').matches
  const mm = gsap.matchMedia()
  const fmt = new Intl.NumberFormat('es-CO')

  /* ---------- cursor: a dot that swells into a ring on anything you can press ---------- */
  if (fine && !reduced) {
    const cur = $('[data-cursor]')
    const dot = { x: innerWidth / 2, y: innerHeight / 2, rx: innerWidth / 2, ry: innerHeight / 2 }
    addEventListener('pointermove', (e) => { dot.x = e.clientX; dot.y = e.clientY }, { passive: true })
    document.addEventListener('pointerover', (e) => cur.classList.toggle('is-hot', !!(e.target as Element).closest('a,button')))
    add(() => {
      dot.rx += (dot.x - dot.rx) * 0.2
      dot.ry += (dot.y - dot.ry) * 0.2
      cur.style.transform = `translate3d(${dot.rx}px, ${dot.ry}px, 0)`
    })
    root.classList.add('has-cursor')
    $$('[data-magnet]').forEach((b) => {
      const qx = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3.out' }), qy = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3.out' })
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect()
        qx((e.clientX - r.left - r.width / 2) * 0.2)
        qy((e.clientY - r.top - r.height / 2) * 0.3)
      })
      b.addEventListener('pointerenter', (e) => {
        const r = b.getBoundingClientRect()
        b.style.setProperty('--x', `${e.clientX - r.left}px`)
        b.style.setProperty('--y', `${e.clientY - r.top}px`)
      })
      b.addEventListener('pointerleave', () => { qx(0); qy(0) })
    })
  }

  /* ---------- nav: hides going down, returns going up, turns to paper past the hero ---------- */
  const nav = $('[data-nav]')
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (s) => {
      nav.classList.toggle('is-hidden', s.direction > 0 && s.scroll() > innerHeight * 0.6)
      nav.classList.toggle('is-solid', s.scroll() > innerHeight * 0.85)
    },
  })

  /* ---------- headings rise by lines, paragraphs fade up ---------- */
  $$('[data-split]').forEach((h) => {
    const s = new SplitText(h, { type: 'lines', mask: 'lines' })
    if (reduced) return
    gsap.from(s.lines, { yPercent: 105, duration: 1.2, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: h, start: 'top 84%', once: true } })
  })
  if (!reduced) {
    $$('[data-fade], [data-species]').forEach((el, i) =>
      gsap.from(el, { y: 26, opacity: 0, duration: 1.1, ease: 'power3.out', delay: el.hasAttribute('data-species') ? (i % 5) * 0.08 : 0, scrollTrigger: { trigger: el, start: 'top 88%', once: true } }),
    )
  }

  /* ---------- hero exit: the two words part, the aerial drifts down ---------- */
  if (!reduced) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true } })
    tl.to('.v-title-a', { xPercent: -8, ease: 'none' }, 0)
      .to('.v-title-b', { xPercent: 6, ease: 'none' }, 0)
      .to('.v-front img', { scale: 1.05, ease: 'none' }, 0)
      .to('.v-hero-top, .v-scroll', { opacity: 0, y: -30, ease: 'none' }, 0)
  }

  /* ---------- the numbers count up once, in Colombian notation ---------- */
  $$('[data-count]').forEach((el) => {
    const n = Number(el.dataset.count)
    if (reduced) return
    const o = { v: 0 }
    el.textContent = '0'
    gsap.to(o, {
      v: n, duration: 1.8, ease: 'power3.out', onUpdate: () => (el.textContent = fmt.format(Math.round(o.v))),
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    })
  })
  if (!reduced) gsap.fromTo('[data-wide] img', { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '[data-wide]', start: 'top bottom', end: 'bottom center', scrub: true } })

  /* ---------- 3 · proceso: the lot becomes the school, scrubbed; labels ride their parts ---------- */
  {
    const sec = $('[data-proceso]'), cv = $<HTMLCanvasElement>('[data-seq]'), ctx = cv.getContext('2d')!
    const steps = $$('[data-step]'), bar = $('[data-bar]'), pins = $$('[data-pin]')
    // the Blender frame where each step starts
    const STEP_AT = [1, 24, 54, 72, 88]
    let frames: (HTMLImageElement | null)[] | null = null
    let anchors: Anchors | null = null
    let p = 0, sp = 0, drawn = -1
    const prof = () => (innerWidth / innerHeight < 0.9 ? 'm' : 'd')
    let P = prof()
    const count = () => (P === 'm' ? SEQ_FRAMES / 2 : SEQ_FRAMES)
    const size = () => {
      const d = Math.min(devicePixelRatio, 2)
      cv.width = cv.clientWidth * d
      cv.height = cv.clientHeight * d
      drawn = -1
    }
    new ResizeObserver(size).observe(cv)
    const start = () => {
      P = prof()
      frames = sequence(count(), (i) => `/villa/seq-${P}/${String(i).padStart(3, '0')}.webp`)
      fetch('/villa/anchors.json').then((r) => r.json()).then((a) => (anchors = a)).catch(() => {})
    }
    if (root.dataset.tier !== 'static') {
      // only once the hero is in (is-ready): on a phone the section is within reach at load, and its 4 MB would starve the hero
      const watch = () => new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { start(); o.disconnect() } }, { rootMargin: '150% 0px' }).observe(sec)
      if (root.classList.contains('is-ready')) watch()
      else new MutationObserver((_, mo) => { if (root.classList.contains('is-ready')) { mo.disconnect(); watch() } }).observe(root, { attributes: true, attributeFilter: ['class'] })
    }
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: (s) => {
        p = s.progress
        bar.style.transform = `scaleX(${p})`
        const f = 1 + p * (SEQ_FRAMES - 1)
        const k = STEP_AT.reduce((acc, at, i) => (f >= at ? i : acc), 0)
        steps.forEach((el, i) => el.classList.toggle('is-on', i === k))
      },
    })
    add(() => {
      if (!frames) return
      sp += (p - sp) * 0.15
      if (Math.abs(p - sp) < 1e-4) sp = p
      const n = frames.length, t = sp * (n - 1), a = Math.floor(t), b = Math.min(n - 1, a + 1), mix = t - a
      const key = Math.round(t * 100)
      if (key === drawn) return
      const fa = frames[a] ?? nearest(frames, a), fb = frames[b]
      if (!fa) return
      ctx.globalAlpha = 1
      const r = cover(ctx, fa, cv.width, cv.height)
      if (fb && fb !== fa && mix > 0.01) { ctx.globalAlpha = mix; cover(ctx, fb, cv.width, cv.height); ctx.globalAlpha = 1 }
      drawn = frames[a] ? key : -1
      // labels: placed from the camera projection exported by Blender, shown once their part has risen
      if (!anchors) return
      const bf = 1 + sp * (SEQ_FRAMES - 1), row = anchors[P as 'd' | 'm'][Math.min(SEQ_FRAMES - 1, Math.round(bf) - 1)]
      const d = Math.min(devicePixelRatio, 2)
      pins.forEach((pin) => {
        const k = pin.dataset.pin!, [x, y] = row[k], [, end] = anchors!.range[k]
        // visibility in canvas pixels: cover crops the frame's sides, and the label runs to the right of its dot
        const px = r.x + x * r.w, py = r.y + y * r.h
        const on = bf >= end - 2 && px > cv.width * 0.03 && px + pin.offsetWidth * d < cv.width * 0.98 && py > cv.height * 0.06 && py < cv.height * 0.94
        pin.classList.toggle('is-on', on)
        pin.style.transform = `translate3d(${px / d}px, ${py / d}px, 0)`
      })
    })
  }

  /* ---------- 4 · programa: each zone button lights its block on the plan ---------- */
  {
    const btns = $$<HTMLButtonElement>('[data-zone]'), shapes = $$('[data-zone-shape]'), plan = $('[data-plan]')
    const set = (k: string) => {
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.zone === k)))
      shapes.forEach((s) => s.classList.toggle('is-on', s.getAttribute('data-zone-shape') === k))
      plan.classList.add('has-zone')
    }
    btns.forEach((b) => {
      b.addEventListener('click', () => set(b.dataset.zone!))
      if (fine) b.addEventListener('pointerenter', () => set(b.dataset.zone!))
      b.addEventListener('focus', () => set(b.dataset.zone!))
    })
    set(btns[0].dataset.zone!)
  }

  /* ---------- 5 · ambiente: pinned horizontal run of the four pillars on wide screens ---------- */
  {
    const sec = $('[data-ambiente]'), track = $('[data-pillars]')
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const dist = () => track.scrollWidth - track.clientWidth
      gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top top', end: () => `+=${dist()}`, pin: '.v-ambiente-pin', scrub: 0.6, invalidateOnRefresh: true },
      })
    })
    if (!reduced) gsap.from('[data-x]', { scale: 0, rotate: -90, duration: 0.7, ease: 'back.out(2)', stagger: 0.09, scrollTrigger: { trigger: '[data-table]', start: 'top 75%', once: true } })
  }

  /* ---------- 6 · agua: the drawing fills from the roof to the garden ---------- */
  {
    const flow = $<SVGPathElement>('[data-flow]'), ws = $$('[data-wstep]')
    const paint = (p: number) => {
      flow.style.strokeDashoffset = String(1 - p)
      ws.forEach((w, i) => w.classList.toggle('is-on', p > i / ws.length + 0.02))
    }
    if (reduced) paint(1)
    else ScrollTrigger.create({ trigger: '[data-agua]', start: 'top 70%', end: 'bottom 70%', scrub: true, onUpdate: (s) => paint(s.progress) })
  }

  /* ---------- 7 · huerta + 8 · cierre: slow reveals ---------- */
  if (!reduced) {
    gsap.fromTo('[data-reveal]', { clipPath: 'inset(18% 12% 18% 12%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: '[data-reveal]', start: 'top bottom', end: 'center center', scrub: true } })
    gsap.fromTo('[data-dusk]', { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '#cierre', start: 'top bottom', end: 'center center', scrub: true } })
  }
}

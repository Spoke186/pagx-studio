// Sotobosque: everything below the hero. Renders come from assets/blender/sotobosque.blend (sb_shot.py).
// Scroll belongs to ScrollTrigger (synced to Lenis), loops to the shared clock, interactions to pointer events.
import { gsap, ScrollTrigger } from '@pagx/motion'
import { SplitText } from 'gsap/SplitText'
import type Lenis from 'lenis'

type Opts = { add: (fn: (t: number) => void) => () => void; lenis: Lenis | null; reduced: boolean }
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s)!
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)]
const FRAMES = 95

/** Load a numbered webp sequence; resolves the frames array immediately and fills it as images arrive. */
function sequence(n: number, url: (i: number) => string) {
  const frames: (HTMLImageElement | null)[] = Array(n).fill(null)
  // load from the middle outwards so a scrub has something near wherever it lands
  const order = [...Array(n).keys()].sort((a, b) => Math.abs(a - n / 2) - Math.abs(b - n / 2))
  order.forEach((i) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => (frames[i] = img)
    img.src = url(i)
  })
  return frames
}

// nearest loaded frame, so a fast scrub never shows a hole
function nearest(frames: (HTMLImageElement | null)[], i: number) {
  for (let d = 1; d < frames.length; d++) { const f = frames[i - d] ?? frames[i + d]; if (f) return f }
  return null
}

// fill: share of the height the image covers; below 1 it sits low with its top edge faded into the dark
function cover(ctx:CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number, focusX = 0.5, fill = 1) {
  const s = Math.max(w / img.naturalWidth, (h * fill) / img.naturalHeight)
  const dw = img.naturalWidth * s, dh = img.naturalHeight * s, y = fill < 1 ? h - dh - h * 0.12 : (h - dh) / 2
  ctx.drawImage(img, (w - dw) * focusX, y, dw, dh)
  if (fill < 1) {
    const g = ctx.createLinearGradient(0, y, 0, y + dh * 0.45)
    g.addColorStop(0, '#020302'); g.addColorStop(1, 'rgb(2 3 2 / 0)')
    ctx.fillStyle = g; ctx.fillRect(0, y, w, dh * 0.45)
  }
}

export function mountSections({ add, reduced }: Opts) {
  const fine = matchMedia('(pointer: fine)').matches
  const mm = gsap.matchMedia()

  /* ---------- cursor: a dot and a ring that swells on anything you can press ---------- */
  if (fine && !reduced) {
    const cur = $('[data-cursor]')
    const dot = { x: innerWidth / 2, y: innerHeight / 2, rx: innerWidth / 2, ry: innerHeight / 2 }
    addEventListener('pointermove', (e) => { dot.x = e.clientX; dot.y = e.clientY }, { passive: true })
    document.addEventListener('pointerover', (e) => cur.classList.toggle('is-hot', !!(e.target as Element).closest('a,button,[data-magnet]')))
    add(() => {
      dot.rx += (dot.x - dot.rx) * 0.18
      dot.ry += (dot.y - dot.ry) * 0.18
      cur.style.transform = `translate3d(${dot.rx}px, ${dot.ry}px, 0)`
    })
    root().classList.add('has-cursor')
    // magnetic buttons: they lean towards the cursor, and their fill grows from where it entered
    $$('[data-magnet]').forEach((b) => {
      const qx = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3.out' }), qy = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3.out' })
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect()
        qx((e.clientX - r.left - r.width / 2) * 0.22)
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

  /* ---------- nav: hides going down, returns going up, gains a veil past the hero ---------- */
  const nav = $('[data-nav]')
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (s) => {
      nav.classList.toggle('is-hidden', s.direction > 0 && s.scroll() > innerHeight * 0.6)
      nav.classList.toggle('is-solid', s.scroll() > innerHeight * 0.85)
    },
  })

  /* ---------- the hour: one afternoon in the clearing, read off whichever section holds the centre ---------- */
  const hourT = $('[data-hour-t]'), hourL = $('[data-hour-l]'), hourBox = hourT.parentElement!
  $$('[data-hour]').forEach((sec) => {
    const [t, l] = sec.dataset.hour!.split('|')
    const show = () => {
      if (hourT.textContent === t) return
      hourBox.classList.remove('is-tick')
      void hourBox.offsetWidth // restart the tick animation
      hourT.textContent = t
      hourL.textContent = l
      hourBox.classList.add('is-tick')
    }
    ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onEnter: show, onEnterBack: show })
  })

  /* ---------- headings: lines rise out of a mask when they enter ---------- */
  $$('[data-split]').forEach((h) => {
    const s = new SplitText(h, { type: 'lines', mask: 'lines', linesClass: 'sb-line' })
    if (reduced) return
    gsap.from(s.lines, { yPercent: 105, duration: 1.3, ease: 'expo.out', stagger: 0.09, scrollTrigger: { trigger: h, start: 'top 82%', once: true } })
  })
  if (!reduced) {
    $$('.sb-section-fade, .sb-values > div, .sb-ritual-d, .sb-cierre-d, .sb-cierre-cta').forEach((el) =>
      gsap.from(el, { y: 28, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }),
    )
  }

  /* ---------- hero exit: the title parts, the scene sinks a little ---------- */
  if (!reduced) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true } })
    tl.to('.sb-title-a', { yPercent: -45, ease: 'none' }, 0)
      .to('.sb-title-b', { yPercent: 35, ease: 'none' }, 0)
      .to('.sb-front img', { scale: 1.06, yPercent: -3, ease: 'none' }, 0)
      .to('.sb-intro, .sb-spec, .sb-scroll', { opacity: 0, y: -40, ease: 'none' }, 0)
  }

  /* ---------- 2 · anatomy: 95 frames, the camera walks in past each note, scrubbed by scroll ---------- */
  {
    const sec = $('[data-notes]'), cv = $<HTMLCanvasElement>('[data-seq]'), ctx = cv.getContext('2d')!
    const notes = $$('[data-note]'), rail = $('[data-rail]')
    let frames: (HTMLImageElement | null)[] | null = null
    let p = 0, drawn = -1
    const size = () => {
      const d = Math.min(devicePixelRatio, 2)
      cv.width = cv.clientWidth * d
      cv.height = cv.clientHeight * d
      drawn = -1
    }
    new ResizeObserver(size).observe(cv)
    // start loading well before the section arrives
    new IntersectionObserver((e, o) => {
      if (!e[0].isIntersecting) return
      frames = sequence(FRAMES, (i) => `/sotobosque/ana/f${String(i + 1).padStart(4, '0')}.webp`)
      o.disconnect()
    }, { rootMargin: '150% 0px' }).observe(sec)
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: (s) => {
        p = s.progress
        const k = Math.min(2, Math.floor(p * 3.2))
        notes.forEach((n, i) => n.classList.toggle('is-on', i <= k && p > 0.04))
        rail.style.transform = `scaleY(${p})`
      },
    })
    const narrow = () => innerWidth / innerHeight < 0.9
    // the drawn position eases toward the scroll and blends the two nearest frames, so 95 stills play like film
    let sp = 0
    add(() => {
      if (!frames) return
      sp += (p - sp) * 0.14
      if (Math.abs(p - sp) < 1e-4) sp = p
      const t = sp * (FRAMES - 1), a = Math.floor(t), b = Math.min(FRAMES - 1, a + 1), mix = t - a
      const key = Math.round(t * 100)
      if (key === drawn) return
      const fa = frames[a] ?? nearest(frames, a), fb = frames[b]
      if (!fa) return
      const fx = narrow() ? 0.66 : 0.5, fill = narrow() ? 0.62 : 1 // the render already sets the bottle right of centre; phones keep it below the title
      ctx.globalAlpha = 1
      ctx.fillStyle = '#020302'
      ctx.fillRect(0, 0, cv.width, cv.height)
      cover(ctx, fa, cv.width, cv.height, fx, fill)
      if (fb && fb !== fa && mix > 0.01) {
        ctx.globalAlpha = mix
        cover(ctx, fb, cv.width, cv.height, fx, fill)
        ctx.globalAlpha = 1
      }
      drawn = frames[a] ? key : -1
    })
  }

  /* ---------- 3 · collection: pinned horizontal gallery on wide screens, swipe on phones ---------- */
  {
    const sec = $('[data-col]'), track = $('[data-track]'), cards = $$('[data-card]'), count = $('[data-count]')
    const setActive = (i: number) => {
      count.textContent = String(i + 1).padStart(2, '0')
      sec.style.setProperty('--wash', getComputedStyle(cards[i]).getPropertyValue('--tone'))
      cards.forEach((c, j) => c.classList.toggle('is-active', j === i))
    }
    setActive(0)
    mm.add('(min-width: 900px)', () => {
      const dist = () => track.scrollWidth - innerWidth + parseFloat(getComputedStyle(track).paddingLeft)
      gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: sec, start: 'top top', end: () => `+=${dist()}`, pin: '.sb-col-pin', scrub: 0.6, invalidateOnRefresh: true,
          onUpdate: (s) => setActive(Math.min(cards.length - 1, Math.round(s.progress * (cards.length - 1)))),
        },
      })
    })
    mm.add('(max-width: 899px)', () => {
      const onScroll = () => setActive(Math.round(track.scrollLeft / (cards[0].offsetWidth + 16)))
      track.addEventListener('scroll', onScroll, { passive: true })
      return () => track.removeEventListener('scroll', onScroll)
    })
    // a slow, gentle tilt under the cursor
    if (fine && !reduced) cards.forEach((c) => {
      const img = $('img', c)
      c.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect()
        gsap.to(img, { x: ((e.clientX - r.left) / r.width - 0.5) * -14, y: ((e.clientY - r.top) / r.height - 0.5) * -14, scale: 1.05, duration: 0.8, ease: 'power3.out' })
      })
      c.addEventListener('pointerleave', () => gsap.to(img, { x: 0, y: 0, scale: 1, duration: 1, ease: 'power3.out' }))
    })
    // the bag counts what you add
    const bag = $('[data-bag]')
    let items = 0
    $$('[data-add]').forEach((b) => b.addEventListener('click', () => {
      bag.textContent = String(++items)
      gsap.fromTo(bag, { scale: 1.6 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.4)' })
      b.classList.add('is-added')
      setTimeout(() => b.classList.remove('is-added'), 1400)
    }))
  }

  /* ---------- 4 · ritual: the cap in the render is the button; hold it and the bottle mists ---------- */
  {
    const sec = $('[data-ritual]'), cv = $<HTMLCanvasElement>('[data-mist]'), ctx = cv.getContext('2d')!
    const btn = $('[data-hold]'), prog = $<SVGCircleElement>('[data-hold-prog]'), words = $$('[data-word]')
    const C = 2 * Math.PI * 56
    prog.style.strokeDasharray = `${C}`
    prog.style.strokeDashoffset = `${C}`
    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number; life: number }
    const parts: P[] = []
    let held = false, hold = 0, visible = false, last = performance.now()
    const size = () => { cv.width = cv.clientWidth; cv.height = cv.clientHeight }
    new ResizeObserver(size).observe(cv)
    new IntersectionObserver((e) => (visible = e[0].isIntersecting)).observe(sec)
    // where the spray head sits in ritual.webp (1920×1080, object-fit: cover, object-position x from CSS), so the ring lands on it at any size
    const HEAD = { x: 0.648, y: 0.217, d: 0.085 }
    const place = () => {
      const W = sec.clientWidth, H = sec.clientHeight, k = Math.max(W / 1920, H / 1080)
      const fx = parseFloat(getComputedStyle($('.sb-ritual-img', sec)).objectPosition) / 100
      btn.style.left = `${(W - 1920 * k) * fx + HEAD.x * 1920 * k}px`
      btn.style.top = `${(H - 1080 * k) / 2 + HEAD.y * 1080 * k}px`
      btn.style.setProperty('--d', `${HEAD.d * 1920 * k}px`)
    }
    new ResizeObserver(place).observe(sec)
    const press = (v: boolean) => (e: Event) => { e.preventDefault(); held = v; btn.classList.toggle('is-held', v) }
    btn.addEventListener('pointerdown', press(true))
    addEventListener('pointerup', press(false))
    btn.addEventListener('pointerleave', press(false))
    btn.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') press(true)(e) })
    btn.addEventListener('keyup', press(false))
    btn.addEventListener('contextmenu', (e) => e.preventDefault())
    add(() => {
      const now = performance.now(), dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (!visible) return
      hold = Math.max(0, Math.min(1, hold + (held ? dt / 2.4 : -dt / 1.6)))
      prog.style.strokeDashoffset = `${C * (1 - hold)}`
      words.forEach((w, i) => w.classList.toggle('is-on', hold > (i + 1) / (words.length + 1)))
      sec.classList.toggle('is-full', hold > 0.98)
      // the orifice faces right: mist leaves it into the low sun, towards the words, widening as it slows
      const r = btn.getBoundingClientRect(), s = sec.getBoundingClientRect()
      const ox = r.left - s.left + r.width * 0.7, oy = r.top - s.top + r.height * 0.5
      // two kinds of particle: a soft plume (big, faint) and fine droplets that catch the light and fall
      // few, denser puffs: very faint ones band into a dotted pattern at 8 bits
      if (held && !reduced) for (let i = 0; i < 4; i++) {
        const fine = i > 0, a = -0.25 + (Math.random() - 0.5) * (fine ? 0.9 : 0.5), v = (fine ? 380 : 220) + Math.random() * 360
        parts.push({ x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: fine ? 0.6 + Math.random() * 1.4 : 10 + Math.random() * 16, a: fine ? 0.9 : 0.07, life: 1 })
      }
      ctx.clearRect(0, 0, cv.width, cv.height)
      ctx.globalCompositeOperation = 'screen'
      for (let i = parts.length - 1; i >= 0; i--) {
        const q = parts[i], fine = q.r < 3
        q.vx *= 1 - dt * (fine ? 1.4 : 2.4)
        q.vy = q.vy * (1 - dt * (fine ? 1.4 : 2.4)) + dt * (fine ? 160 : -14)
        q.x += q.vx * dt
        q.y += q.vy * dt
        if (!fine) q.r += dt * 70
        q.life -= dt * (fine ? 0.8 : 0.45)
        if (q.life <= 0) { parts.splice(i, 1); continue }
        if (fine) {
          ctx.fillStyle = `rgba(246,232,200,${q.a * q.life})`
          ctx.fillRect(q.x, q.y, q.r, q.r)
          continue
        }
        const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.r)
        g.addColorStop(0, `rgba(255,238,206,${q.a * q.life})`)
        g.addColorStop(1, 'rgba(255,238,206,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
    })
  }

  /* ---------- 5 · la casa: the clearing settles, the manifesto lights word by word ---------- */
  if (!reduced) {
    gsap.fromTo('[data-casa-img]', { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '[data-casa]', start: 'top bottom', end: 'center center', scrub: true } })
    const words = new SplitText('[data-manifesto]', { type: 'words' }).words
    gsap.fromTo(words, { opacity: 0.14 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: '[data-manifesto]', start: 'top 80%', end: 'bottom 45%', scrub: true } })
  }

  /* ---------- 6 · cierre: fireflies over the night clearing ---------- */
  {
    const sec = $('[data-cierre]'), cv = $<HTMLCanvasElement>('[data-flies]'), ctx = cv.getContext('2d')!
    let visible = false
    const flies = Array.from({ length: 30 }, () => ({ x: Math.random(), y: 0.25 + Math.random() * 0.7, s: Math.random(), z: Math.random() }))
    const size = () => { const d = Math.min(devicePixelRatio, 2); cv.width = cv.clientWidth * d; cv.height = cv.clientHeight * d }
    new ResizeObserver(size).observe(cv)
    new IntersectionObserver((e) => (visible = e[0].isIntersecting)).observe(sec)
    add((t) => {
      if (!visible || reduced) return
      const T = t / 1000, w = cv.width, h = cv.height
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      for (const f of flies) {
        const x = (f.x + Math.sin(T * 0.13 + f.s * 40) * 0.04) * w, y = (f.y + Math.cos(T * 0.11 + f.s * 30) * 0.03) * h
        const tw = 0.3 + 0.7 * Math.max(0, Math.sin(T * (0.8 + f.s) + f.s * 50)) ** 4
        const r = (1.2 + f.z * 4.5) * (w / 1600) * 1.5
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 5)
        g.addColorStop(0, `rgba(255,214,140,${0.85 * tw})`)
        g.addColorStop(0.16, `rgba(255,170,80,${0.22 * tw})`)
        g.addColorStop(1, 'rgba(255,150,60,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, r * 5, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
    })
  }
}

const root = () => document.documentElement

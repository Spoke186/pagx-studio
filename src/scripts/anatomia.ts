// Portfolio "Anatomía de un sitio" (DECISIONS #38, #39). Each site is shown as an exploded view of its real layers:
// code, grid, colour and type spec, imagery, type, plus its phone version. Labels name what each layer really holds
// (its fonts, its colours). Scrolling assembles them: a scan line runs down, they lock with a flash, and the site
// comes alive (the page shows the real site in an iframe over the frame). Layers are captured by qa/layers.mjs.
// One canvas on the master clock; labels and the live site are HTML.
import * as THREE from 'three'

export type Spec = { fonts: string[]; colors: string[] }
export type Anatomy = { go(i: number): void; nudge(d: number): void; toggle(): void; frame(): DOMRect | null; destroy(): void }
const BASE = '/portafolio/anatomia/'
const ease = (x: number) => x * x * (3 - 2 * x)
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const W = 1.6, H = 1.0 // a 16:10 screen
const PH = 0.86, PW = PH * (390 / 844) // the phone

/* ---------- procedural layers ---------- */
const canvas2d = () => { const c = document.createElement('canvas'); c.width = 1280; c.height = 800; return [c, c.getContext('2d')!] as const }
function codeTexture(src: string) {
  const [c, g] = canvas2d()
  g.font = '17px "Share Tech Mono", monospace'
  src.split('\n').slice(0, 38).forEach((line, i) => {
    let x = 36
    for (const part of line.split(/(<\/?[\w-]+|>|"[^"]*")/)) {
      if (!part) continue
      g.fillStyle = part.startsWith('<') || part === '>' ? '#ff6a2b' : part.startsWith('"') ? '#b9a98f' : '#ece5d8'
      g.fillText(part, x, 44 + i * 20)
      x += g.measureText(part).width
      if (x > 1240) break
    }
  })
  return c
}
function gridTexture() {
  const [c, g] = canvas2d()
  const gut = 56, col = (1280 - gut * 2 - 11 * 24) / 12
  g.fillStyle = 'rgba(255,106,43,0.07)'
  for (let i = 0; i < 12; i++) g.fillRect(gut + i * (col + 24), 0, col, 800)
  g.strokeStyle = 'rgba(255,106,43,0.55)'
  for (let i = 0; i < 12; i++) g.strokeRect(gut + i * (col + 24) + 0.5, 0.5, col, 799)
  g.strokeStyle = 'rgba(236,229,216,0.12)'
  for (let y = 8; y < 800; y += 8) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(1280, y + 0.5); g.stroke() }
  g.fillStyle = '#ff6a2b'
  g.font = '14px "Share Tech Mono", monospace'
  for (let i = 0; i < 12; i++) g.fillText(String(i + 1).padStart(2, '0'), gut + i * (col + 24) + 6, 20)
  return c
}
// the spec sheet: the site's real colours as swatches and its fonts as specimens
function specTexture(spec: Spec) {
  const [c, g] = canvas2d()
  const sw = 150
  spec.colors.forEach((hex, i) => {
    const x = 70 + i * (sw + 24)
    g.fillStyle = hex
    g.fillRect(x, 470, sw, 190)
    g.strokeStyle = 'rgba(236,229,216,0.35)'
    g.strokeRect(x + 0.5, 470.5, sw, 190)
    g.fillStyle = '#ece5d8'
    g.font = '18px "Share Tech Mono", monospace'
    g.fillText(hex.toUpperCase(), x, 694)
  })
  spec.fonts.forEach((f, i) => {
    g.fillStyle = i ? 'rgba(236,229,216,0.7)' : '#ece5d8'
    g.font = `${i ? 64 : 120}px "${f} Variable", "${f}", sans-serif`
    g.fillText(i ? f : 'Aa', 70, i ? 220 + i * 86 : 190)
    g.fillStyle = '#ff6a2b'
    g.font = '18px "Share Tech Mono", monospace'
    if (!i) g.fillText(f.toUpperCase(), 260, 150)
  })
  return c
}

export async function mountAnatomy(
  canvas: HTMLCanvasElement,
  add: (fn: (t: number) => void) => () => void,
  sites: string[],
  labels: { root: HTMLElement; names: string[] },
  onProgress: (p: number) => void,
  onAssembled: (done: boolean) => void,
): Promise<Anatomy | null> {
  const coarse = matchMedia('(pointer: coarse)').matches
  const mid = coarse || (navigator.hardwareConcurrency ?? 8) <= 4
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !mid, alpha: true, powerPreference: 'high-performance' })
  } catch {
    return null
  }
  renderer.setPixelRatio(mid ? 1 : Math.min(devicePixelRatio, 1.75))
  renderer.setClearColor(0x000000, 0)

  // --- loading: everything up front, with progress for the loader ---
  const total = sites.length * 6
  let done = 0
  const tick = <T,>(p: Promise<T>) => p.then((v) => { onProgress(++done / total); return v })
  const tl = new THREE.TextureLoader()
  const tex = (url: string) => tick(tl.loadAsync(url).then((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t }))
  await document.fonts.load('17px "Share Tech Mono"')
  const data = await Promise.all(sites.map(async (s) => {
    const [photo, type, full, mobile, code, spec] = await Promise.all([
      tex(`${BASE}${s}-photo.webp`), tex(`${BASE}${s}-type.webp`), tex(`${BASE}${s}-full.webp`), tex(`${BASE}${s}-mobile.webp`),
      tick(fetch(`${BASE}${s}-code.txt`).then((r) => r.text())), tick(fetch(`${BASE}${s}-spec.json`).then((r) => r.json() as Promise<Spec>)),
    ])
    return { photo, type, full, mobile, code, spec }
  }))
  // the specimens need the sites' own fonts when this page has them; otherwise a serif stands in
  await Promise.all(data.flatMap((d) => d.spec.fonts.flatMap((f) => [`64px "${f}"`, `64px "${f} Variable"`].map((q) => document.fonts.load(q).catch(() => null)))))
  const grid = new THREE.CanvasTexture(gridTexture())

  const scene = new THREE.Scene()
  const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 50)
  const plane = new THREE.PlaneGeometry(W, H)
  const edges = new THREE.EdgesGeometry(plane)
  const phonePlane = new THREE.PlaneGeometry(PW, PH)
  const phoneEdges = new THREE.EdgesGeometry(phonePlane)
  // a soft mirror under each frame: the image flipped, fading into the floor
  const REFLECT = /* glsl */ `
    uniform sampler2D map; uniform float uA; varying vec2 vUv;
    void main() { vec4 c = texture2D(map, vec2(vUv.x, 1.0 - vUv.y)); gl_FragColor = vec4(c.rgb, c.a * uA * smoothstep(0.55, 1.0, vUv.y) * 0.22); }`
  const VERT = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'

  type Layer = { holder: THREE.Group; mat: THREE.MeshBasicMaterial; edge: THREE.LineBasicMaterial; base: number }
  const stacks = data.map((d) => {
    const g = new THREE.Group()
    const made: THREE.Texture[] = []
    const canvasTex = (c: HTMLCanvasElement) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; made.push(t); return t }
    const layer = (map: THREE.Texture, opacity: number, geo = plane, eg = edges): Layer => {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map, transparent: true, opacity, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }))
      const e = new THREE.LineSegments(eg, new THREE.LineBasicMaterial({ color: 0xff6a2b, transparent: true, opacity: 0.5 }))
      const holder = new THREE.Group()
      holder.add(m, e)
      g.add(holder)
      return { holder, mat: m.material as THREE.MeshBasicMaterial, edge: e.material as THREE.LineBasicMaterial, base: opacity }
    }
    // back to front: code, grid, spec, imagery, type; then the phone beside it and the whole site on top
    const layers = [layer(canvasTex(codeTexture(d.code)), 0.95), layer(grid, 0.9), layer(canvasTex(specTexture(d.spec)), 1), layer(d.photo, 1), layer(d.type, 1)]
    const phone = layer(d.mobile, 1, phonePlane, phoneEdges)
    const full = layer(d.full, 0)
    const flash = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ color: 0xffe2c8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }))
    full.holder.add(flash)
    const reflect = new THREE.Mesh(plane, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { map: { value: d.full }, uA: { value: 0 } }, vertexShader: VERT, fragmentShader: REFLECT }))
    reflect.position.y = -H - 0.04
    g.add(reflect)
    scene.add(g)
    g.visible = false
    return { g, layers, phone, full, flash, reflect, made, spec: d.spec, enter: 0, leave: 1, dir: 1, flashT: -1 }
  })

  // the scan line that runs down the stack while it assembles
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.08, 0.006), new THREE.MeshBasicMaterial({ color: 0xff6a2b, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }))
  scene.add(scan)
  // dust in the light
  const D = mid ? 160 : 360
  const dp = new Float32Array(D * 3), ds = new Float32Array(D)
  for (let i = 0; i < D; i++) { dp.set([(Math.random() - 0.5) * 7, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3], i * 3); ds[i] = Math.random() }
  const dg = new THREE.BufferGeometry()
  dg.setAttribute('position', new THREE.BufferAttribute(dp, 3))
  dg.setAttribute('aS', new THREE.BufferAttribute(ds, 1))
  const dust = new THREE.Points(dg, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uPx: { value: 600 } },
    vertexShader: 'attribute float aS; uniform float uTime, uPx; varying float vA; void main() { vec3 p = position; p.y = mod(p.y + uTime * (0.03 + aS * 0.05) + 2.0, 4.0) - 2.0; p.x += sin(uTime * 0.2 + aS * 30.0) * 0.1; vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = uPx * (0.004 + 0.008 * aS) / -mv.z; vA = 0.25 + 0.5 * aS; }',
    fragmentShader: 'varying float vA; void main() { float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; gl_FragColor = vec4(1.0, 0.62, 0.36, (1.0 - d * 2.0) * vA * 0.5); }',
  }))
  scene.add(dust)

  // the field: a sheet of white dots behind everything that keeps folding into strange shapes (waves, a ripple, a
  // vortex, a travelling blob), swells under the cursor, shakes when the site changes and calms while it assembles
  const GX = mid ? 130 : 210, GY = mid ? 76 : 120
  const fp = new Float32Array(GX * GY * 3), fr = new Float32Array(GX * GY)
  for (let y = 0; y < GY; y++) for (let x = 0; x < GX; x++) {
    const i = y * GX + x
    fp.set([(x / (GX - 1) - 0.5) * 12, (y / (GY - 1) - 0.5) * 7, 0], i * 3)
    fr[i] = Math.random()
  }
  const fg = new THREE.BufferGeometry()
  fg.setAttribute('position', new THREE.BufferAttribute(fp, 3))
  fg.setAttribute('aR', new THREE.BufferAttribute(fr, 1))
  const fu = { uTime: { value: 0 }, uPx: { value: 600 }, uMix: { value: new THREE.Vector4(1, 0, 0, 0) }, uMouse: { value: new THREE.Vector2(99, 99) }, uCalm: { value: 0 }, uKick: { value: 0 } }
  const field = new THREE.Points(fg, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: fu,
    vertexShader: /* glsl */ `
      attribute float aR;
      uniform float uTime, uPx, uCalm, uKick; uniform vec4 uMix; uniform vec2 uMouse;
      varying float vA; varying float vHot;
      void main() {
        float t = uTime;
        vec2 p = position.xy;
        float r = length(p), ang = atan(p.y, p.x);
        float f0 = sin(p.x * 0.9 + t * 0.6) * cos(p.y * 1.3 - t * 0.4) * 0.55 + sin(p.x * 2.1 - p.y * 1.7 + t) * 0.15;
        float f1 = sin(r * 2.6 - t * 1.6) * exp(-r * 0.22) * 0.7;
        float f2 = sin(ang * 5.0 + r * 1.8 - t * 1.1) * 0.5 * smoothstep(0.2, 2.0, r) * exp(-r * 0.18);
        vec2 c = vec2(sin(t * 0.31) * 3.0, cos(t * 0.23) * 1.4);
        float f3 = 1.5 * exp(-dot(p - c, p - c) * 0.5) - 0.8 * exp(-dot(p + c, p + c) * 0.7);
        float z = dot(vec4(f0, f1, f2, f3), uMix) * 1.6 * (1.0 - 0.55 * uCalm);
        p += vec2(-sin(ang), cos(ang)) * f2 * 0.25 * uMix.z;                 // the vortex also swirls the dots
        z += uKick * sin(r * 4.0 - t * 9.0) * exp(-r * 0.35) * 0.5;           // a shock wave when the site changes
        float md = length(p - uMouse);
        z += exp(-md * md * 1.2) * (0.55 + 0.15 * sin(md * 7.0 - t * 5.0));   // it swells under the cursor
        vec4 mv = modelViewMatrix * vec4(p, -3.2 + z, 1.0);
        gl_Position = projectionMatrix * mv;
        float lit = smoothstep(0.05, 1.1, abs(z));
        gl_PointSize = uPx * (0.017 + 0.02 * lit + 0.006 * aR) / -mv.z;
        float edge = 1.0 - smoothstep(0.55, 1.0, length(position.xy / vec2(6.0, 3.5)));
        vA = (0.26 + 0.74 * lit) * edge * (0.8 + 0.2 * sin(t * 2.0 + aR * 40.0));
        vHot = smoothstep(0.8, 1.8, z);
      }`,
    fragmentShader: /* glsl */ `
      varying float vA; varying float vHot;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        gl_FragColor = vec4(mix(vec3(0.93, 0.9, 0.85), vec3(1.0, 0.45, 0.15), vHot), (1.0 - d * 2.0) * vA);
      }`,
  }))
  field.frustumCulled = false
  field.renderOrder = -10
  scene.add(field)
  const mixTo = new THREE.Vector4(1, 0, 0, 0)
  let shape = 0, shapeAt = 0
  const setShape = (n: number) => { shape = ((n % 4) + 4) % 4; mixTo.set(+(shape === 0), +(shape === 1), +(shape === 2), +(shape === 3)) }

  // HTML labels with leader lines: one per layer and the phone; the spec ones carry the site's real fonts and colours
  const tags = [...labels.names].map((name) => {
    const el = document.createElement('div')
    el.className = 'an-tag'
    el.innerHTML = `<i></i><span></span>`
    labels.root.append(el)
    return { el, name, text: el.querySelector('span')! }
  })
  const writeTags = (s: (typeof stacks)[number]) => tags.forEach((tg, i) => {
    const extra = i === 2 ? s.spec.colors.slice(0, 3).map((c) => c.toUpperCase()).join(' ') : i === 4 ? s.spec.fonts.slice(0, 2).join(' / ') : ''
    tg.text.innerHTML = `<b>0${i + 1}</b> ${tg.name}${extra ? ` <em>${extra}</em>` : ''}`
  })

  let w = 1, h = 1, wide = true, fit = 0.7, cy = 0.05
  const resize = () => {
    w = canvas.clientWidth; h = canvas.clientHeight
    renderer.setSize(w, h, false)
    cam.aspect = w / h
    wide = w / h > 1
    cam.position.set(0, 0, wide ? 4.3 : 6.4)
    cam.updateProjectionMatrix()
    // phones: the stack fills the band between the title and the card, as wide as the screen allows
    if (!wide) {
      const vh = 2 * Math.tan((cam.fov * Math.PI) / 360) * cam.position.z, vw = vh * cam.aspect
      const top = document.querySelector('.an-head')?.getBoundingClientRect().bottom ?? h * 0.3
      const bot = document.querySelector('.an-cards')?.getBoundingClientRect().top ?? h * 0.55
      fit = Math.min((vw * 0.94) / (W + PW + 0.14), (((bot - top) / h) * vh * 0.9) / H)
      cy = (0.5 - (top + bot) / 2 / h) * vh
    }
    ;(dust.material as THREE.ShaderMaterial).uniforms.uPx.value = fu.uPx.value = (h * renderer.getPixelRatio()) / (2 * Math.tan((cam.fov * Math.PI) / 360))
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 }
  const onMove = (e: PointerEvent) => { mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = -((e.clientY / innerHeight) * 2 - 1) }
  addEventListener('pointermove', onMove, { passive: true })

  let cur = 0, target = 0, a = 0, last = 0, wasDone = false, time = 0
  stacks[0].g.visible = true
  writeTags(stacks[0])
  const v = new THREE.Vector3()
  const off = add((ms) => {
    const t = ms / 1000
    const dt = Math.min(0.05, last ? t - last : 0)
    last = t; time = t
    a += (target - a) * Math.min(1, dt * 3.2)
    mouse.sx += (mouse.x - mouse.sx) * 0.05
    mouse.sy += (mouse.y - mouse.sy) * 0.05
    const k = ease(clamp01(a))
    const ex = 1 - k
    const isDone = a > 0.985
    if (isDone !== wasDone) {
      onAssembled((wasDone = isDone))
      if (isDone) stacks[cur].flashT = t
    }
    ;(dust.material as THREE.ShaderMaterial).uniforms.uTime.value = t
    // the field: its own shape every 9 s, blended; the cursor projected onto its plane (z = -3.2)
    if (t - shapeAt > 9) { shapeAt = t; setShape(shape + 1) }
    fu.uMix.value.lerp(mixTo, Math.min(1, dt * 0.8))
    fu.uTime.value = t
    fu.uCalm.value += (k - fu.uCalm.value) * Math.min(1, dt * 2)
    fu.uKick.value = Math.max(0, fu.uKick.value - dt * 0.9)
    const depth = cam.position.z + 3.2, hh = Math.tan((cam.fov * Math.PI) / 360) * depth
    fu.uMouse.value.set(mouse.sx * hh * cam.aspect, mouse.sy * hh)
    stacks.forEach((s, si) => {
      if (!s.g.visible) return
      s.enter = Math.min(1, s.enter + dt * 0.9)
      if (si !== cur) s.leave = Math.min(1, s.leave + dt * 1.6)
      const out = si === cur ? 0 : ease(s.leave)
      if (si !== cur && s.leave >= 1) { s.g.visible = false; return }
      const kk = si === cur ? k : 0, xx = 1 - kk
      // an isometric exploded view that straightens and closes up as it assembles; still once assembled
      s.g.rotation.set(-0.32 * xx + mouse.sy * 0.06 * xx, (wide ? 0.62 : 0.35) * xx + mouse.sx * 0.1 * xx + out * s.dir * 0.8, 0.04 * xx)
      s.g.position.set((wide ? 0.32 + kk * 0.18 : -0.26 * fit * kk - 0.42 * fit * xx) + out * s.dir * 3, (wide ? -0.02 : cy) + Math.sin(t * 0.6) * 0.015 * xx, -out * 1.5)
      s.g.scale.setScalar(wide ? 1 - kk * 0.06 : fit * (0.74 + 0.26 * kk)) // phones: exploded a little smaller, so the labels fit beside it
      const n = s.layers.length
      s.layers.forEach((l, i) => {
        const arrive = ease(clamp01(s.enter * 1.6 - i * 0.1)) // layers fly in one by one, back first
        l.holder.position.set((i - (n - 1) / 2) * 0.05 * xx, Math.sin(t * 0.8 + i) * 0.012 * xx, (i - (n - 1) / 2) * 0.36 * xx + (1 - arrive) * 2.5)
        const vis = arrive * (1 - out)
        const fade = i < 3 ? 1 - kk * 0.9 : 1 // code, grid and spec sink away; imagery and type merge into the site
        l.mat.opacity = l.base * vis * fade * (1 - clamp01((kk - 0.85) / 0.12))
        l.edge.opacity = 0.55 * vis * xx
      })
      // the phone: off to the side and turned while exploded, standing beside the screen once assembled
      const pa = ease(clamp01(s.enter * 1.6 - 0.55))
      s.phone.holder.position.set(W / 2 + PW / 2 + 0.12 - 0.12 * xx, -H / 2 + PH / 2 - 0.06 - 0.05 * xx, 0.55 * xx + 0.02 + (1 - pa) * 2.5)
      s.phone.holder.rotation.y = -0.5 * xx
      s.phone.mat.opacity = pa * (1 - out)
      s.phone.edge.opacity = 0.55 * pa * (1 - out)
      s.full.holder.position.z = (n / 2) * 0.36 * xx + 0.002
      s.full.mat.opacity = clamp01((kk - 0.82) / 0.15) * (1 - out)
      s.full.edge.opacity = 0
      const f = s.flashT < 0 ? 0 : Math.max(0, 1 - (t - s.flashT) / 0.6)
      ;(s.flash.material as THREE.MeshBasicMaterial).opacity = f * f * 0.5
      ;(s.reflect.material as THREE.ShaderMaterial).uniforms.uA.value = clamp01((kk - 0.7) / 0.3) * (1 - out)
      if (si !== cur) return
      // the scan line runs down while it assembles
      scan.visible = kk > 0.03 && kk < 0.97
      if (scan.visible) {
        v.set(0, H / 2 - kk * H, (n / 2) * 0.36 * xx + 0.01).applyMatrix4(s.g.matrixWorld)
        scan.position.copy(v); scan.quaternion.copy(s.g.quaternion); scan.scale.setScalar(s.g.scale.x)
        ;(scan.material as THREE.MeshBasicMaterial).opacity = Math.sin(kk * Math.PI)
      }
      // labels follow a corner of each layer (the phone's top-left), and fade as it assembles
      s.g.updateMatrixWorld(true)
      tags.forEach((tg, i) => {
        const l = i < n ? s.layers[i] : s.phone
        const corner = i < n ? v.set(W / 2, H / 2, 0) : v.set(PW / 2, PH / 2, 0)
        corner.applyMatrix4(l.holder.matrixWorld).project(cam)
        tg.el.style.transform = `translate(${((corner.x * 0.5 + 0.5) * w).toFixed(1)}px, ${((-corner.y * 0.5 + 0.5) * h).toFixed(1)}px)`
        tg.el.style.opacity = (xx * ease(clamp01(s.enter * 1.6 - i * 0.1 - 0.3))).toFixed(3)
      })
    })
    renderer.render(scene, cam)
  })
  canvas.classList.add('is-live')

  return {
    go(i) {
      const n = stacks.length
      i = ((i % n) + n) % n
      if (i === cur) return
      const dir = i > cur ? -1 : 1
      const prev = stacks[cur]
      prev.dir = dir; prev.leave = 0
      cur = i
      const s = stacks[i]
      s.g.visible = true; s.enter = 0; s.leave = 1; s.dir = -dir; s.flashT = -1
      writeTags(s)
      target = 0; a = Math.min(a, 0.3)
      fu.uKick.value = 1; shapeAt = time; setShape(shape + 1)
    },
    nudge(d) { target = clamp01(target + d) },
    toggle() { target = target > 0.5 ? 0 : 1 },
    /** the assembled frame on screen, once it is still (for the live site on top) */
    frame() {
      if (a < 0.995 || time - (stacks[cur].flashT ?? 0) < 0.35) return null
      const s = stacks[cur]
      const pts = [[-W / 2, H / 2], [W / 2, -H / 2]].map(([x, y]) => v.set(x, y, 0).applyMatrix4(s.full.holder.matrixWorld).project(cam).clone())
      const x0 = (pts[0].x * 0.5 + 0.5) * w, y0 = (-pts[0].y * 0.5 + 0.5) * h, x1 = (pts[1].x * 0.5 + 0.5) * w, y1 = (-pts[1].y * 0.5 + 0.5) * h
      return new DOMRect(x0, y0, x1 - x0, y1 - y0)
    },
    destroy() {
      off()
      ro.disconnect()
      removeEventListener('pointermove', onMove)
      tags.forEach((tg) => tg.el.remove())
      stacks.forEach((s) => s.made.forEach((t) => t.dispose()))
      scene.traverse((o: any) => { o.material?.map?.dispose?.(); o.material?.dispose?.(); if (o.geometry && o.geometry !== plane) o.geometry.dispose() })
      plane.dispose(); edges.dispose(); grid.dispose()
      renderer.dispose()
    },
  }
}

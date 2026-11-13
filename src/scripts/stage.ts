// Live 3D on the home (DECISIONS #33–#35, DIRECTION §11). One renderer on one fixed, transparent canvas, driven by
// the master clock. One story: code becomes things.
//  · ribbons: Imagica-like ribbons of light drawn with code glyphs behind the hero
//  · devices: the same glyphs fall and assemble a laptop and a phone for each concept; the device turns to face the
//             visitor, lands exactly on the browser/phone frame, and the live site fades in over it
//  · flow:    a ribbon of code threads the automation's steps; a packet of light runs it as the case plays
//  · phone:   a path-traced iPhone (assets/blender/iphone.py) turns with the cursor while WhatsApp for iOS types the chat
// The canvas is transparent so the page's own background (light or dark) shows through.
import * as THREE from 'three'
import '@fontsource-variable/inter/wght.css' // the chat's SF stand-in where -apple-system is missing

type Tier = 'high' | 'mid'
const root = document.documentElement
const light = () => root.dataset.theme === 'light'
const mouse = { x: 0, y: 0, sx: 0, sy: 0 }
const ease = (x: number) => x * x * (3 - 2 * x)
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const smooth = (a: number, b: number, x: number) => ease(clamp01((x - a) / (b - a)))
const pxScale = (cam: THREE.PerspectiveCamera, h: number, dpr: number) => (h * dpr) / (2 * Math.tan((cam.fov * Math.PI) / 360))

/* ---------- glyph atlas: 32 terminal glyphs, 8 x 4 cells (Share Tech Mono) ---------- */
const GLYPHS = '01<>/{}[]=+;:*#$%&@?!pagxPAGX()|'
let atlasTex: THREE.Texture | null = null
function atlas() {
  if (atlasTex) return atlasTex
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 256
  const g = c.getContext('2d')!
  g.fillStyle = '#fff'
  g.font = '50px "Share Tech Mono", monospace'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  ;[...GLYPHS].forEach((ch, i) => g.fillText(ch, (i % 8) * 64 + 32, Math.floor(i / 8) * 64 + 34))
  const tex = new THREE.CanvasTexture(c)
  tex.flipY = false
  tex.generateMipmaps = false
  tex.minFilter = THREE.LinearFilter
  return (atlasTex = tex)
}
// a glyph from the atlas, or a round dot when vGlyph < 0
const GLYPH_FRAG = /* glsl */ `
  uniform sampler2D uAtlas;
  varying vec3 vCol; varying float vA; varying float vGlyph;
  void main() {
    float a;
    if (vGlyph < 0.0) a = smoothstep(0.5, 0.2, length(gl_PointCoord - 0.5));
    else a = texture2D(uAtlas, (vec2(mod(vGlyph, 8.0), floor(vGlyph / 8.0)) + gl_PointCoord) / vec2(8.0, 4.0)).a;
    a *= vA;
    if (a < 0.02) discard;
    gl_FragColor = vec4(vCol, a);
  }`
// The 3D's ink comes from the page's tokens (--gl-* in global.css), so the colours live in CSS only:
// 1 = main, 2 = rims and sparks, 3 = the ribbons' body, hi = the folds. The uniforms are shared by every material.
const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!
const tok = (name: string) => getComputedStyle(root).getPropertyValue(name).trim()
const srgb = (css: string): [number, number, number] => { // any CSS colour (oklch too) to sRGB 0..1
  probe.fillStyle = '#000'
  probe.fillStyle = css
  probe.fillRect(0, 0, 1, 1)
  const d = probe.getImageData(0, 0, 1, 1).data
  return [d[0] / 255, d[1] / 255, d[2] / 255]
}
const PAL = { uC1: { value: new THREE.Vector3() }, uC2: { value: new THREE.Vector3() }, uC3: { value: new THREE.Vector3() }, uHi: { value: new THREE.Vector3() } }
const readPalette = () => { for (const [k, name] of [['uC1', '--gl-1'], ['uC2', '--gl-2'], ['uC3', '--gl-3'], ['uHi', '--gl-hi']] as const) PAL[k].value.set(...srgb(tok(name))) }
const INK = 'uniform vec3 uC1, uC2, uC3, uHi;'
const glyphMat = (uniforms: Record<string, THREE.IUniform>, vertexShader: string) =>
  new THREE.ShaderMaterial({ transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, uniforms: { uAtlas: { value: atlas() }, ...PAL, ...uniforms }, vertexShader, fragmentShader: GLYPH_FRAG })
const setBlend = (m: THREE.ShaderMaterial, isLight: boolean) => { m.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending; m.needsUpdate = true }

/* ---------- ribbons of code (hero) ---------- */
function ribbons(tier: Tier, dpr: number) {
  const scene = new THREE.Scene()
  const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
  let dist = 8.5 // closer on phones, so the domes fill the narrow frame
  // ribbon: phase, height, depth, width (the arcs of pin Imagica: domes sweeping over the title)
  const RIBS = [[0.0, 0.6, 0.0, 2.8], [1.7, -0.3, -1.4, 2.0], [3.1, 1.3, -0.6, 1.5], [4.4, -1.2, 0.9, 2.3], [5.6, 1.9, -2.4, 1.2]]
  const U = tier === 'high' ? 380 : 220, W = tier === 'high' ? 26 : 16
  const n = RIBS.length * U * W
  const g = new Float32Array(n * 4), r = new Float32Array(n * 4)
  let k = 0
  for (const rib of RIBS) for (let a = 0; a < U; a++) for (let b = 0; b < W; b++) {
    g.set([(a + Math.random() * 0.6) / U, (b + 0.5) / W + (Math.random() - 0.5) * 0.02, Math.random(), Math.random()], k * 4)
    r.set(rib, k * 4)
    k++
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
  geo.setAttribute('aG', new THREE.BufferAttribute(g, 4))
  geo.setAttribute('aR', new THREE.BufferAttribute(r, 4))
  const u = { uTime: { value: 0 }, uFade: { value: 1 }, uPx: { value: 1000 }, uLight: { value: 0 } }
  const mat = glyphMat(u, /* glsl */ `
    attribute vec4 aG, aR;
    uniform float uTime, uFade, uPx, uLight;
    varying vec3 vCol; varying float vA; varying float vGlyph;
    ${INK}
    void main() {
      float t = uTime;
      float u = fract(aG.x + t * 0.012), v = aG.y;
      float ph = aR.x;
      vec3 c = vec3((u - 0.5) * 27.0,
                    aR.y + 2.2 * cos((u - 0.5) * 2.6) - 1.7 + 0.5 * sin(u * 5.0 + t * 0.22 + ph),
                    aR.z + 1.9 * sin(u * 2.6 + t * 0.16 + ph));
      float tw = u * 3.4 + t * 0.3 + ph * 1.7;
      vec3 p = c + vec3(0.0, cos(tw), sin(tw)) * (v - 0.5) * aR.w;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      float fold = pow(1.0 - abs(cos(tw)), 5.0);   // edge-on: the glyphs crowd into a bright seam
      float edge = pow(abs(v - 0.5) * 2.0, 3.0);   // the ribbon's rims
      float hi = max(fold, edge * 0.85);
      gl_PointSize = uPx * (0.06 + 0.03 * aG.w) * (1.0 + hi * 0.35) / -mv.z;
      vec3 base = mix(uC3, uC1, u);
      vCol = mix(mix(base, uC2, edge * edge * smoothstep(0.1, 0.7, sin(u * 7.0 + ph + t * 0.2) * 0.5 + 0.5)), uHi, fold * 0.7);
      float ends = smoothstep(0.0, 0.12, u) * smoothstep(1.0, 0.88, u);
      float flick = 0.7 + 0.3 * sin(t * (1.5 + aG.w * 5.0) + aG.z * 40.0);
      vA = min(1.0, mix(0.12, 0.42, uLight) + mix(0.88, 1.1, uLight) * hi) * ends * flick * uFade;
      vGlyph = floor(fract(aG.z * 13.7 + floor(t * (0.4 + aG.w * 1.6)) * 0.379) * 32.0);
    }`)
  scene.add(new THREE.Points(geo, mat))
  return {
    scene, cam,
    theme(isLight: boolean) { u.uLight.value = isLight ? 1 : 0; setBlend(mat, isLight) },
    update(t: number, k: number, p: number) {
      u.uTime.value = t
      u.uFade.value = k
      cam.position.set(mouse.sx * 0.7, mouse.sy * 0.4 - p * 1.2, dist)
      cam.lookAt(0, 0.2 - p * 1.6, 0)
    },
    resize(w: number, h: number) {
      cam.aspect = w / h
      cam.fov = w > h ? 40 : 62
      dist = w > h ? 8.5 : 6
      if (w > h) cam.clearViewOffset()
      else cam.setViewOffset(w, h, 0, h * 0.14, w, h)
      cam.updateProjectionMatrix()
      u.uPx.value = pxScale(cam, h, dpr)
    },
  }
}

/* ---------- devices assembled from code (concepts) ---------- */
// Local space: the screen is the unit square centred on the origin, so the final pose can be stretched onto any DOM
// frame. part 0 = code on the screen, 1 = bezel dots, 2 = keyboard base dots (fades out as the device faces you).
function deviceGeo(kind: 'laptop' | 'phone', tier: Tier) {
  const P: number[] = [], S: number[] = []
  const push = (x: number, y: number, z: number, part: number) => { P.push(x, y, z); S.push(Math.random(), part, Math.random(), Math.random()) }
  const rows = kind === 'laptop' ? (tier === 'high' ? 26 : 20) : 24, cols = kind === 'laptop' ? (tier === 'high' ? 64 : 48) : 16
  const top = kind === 'laptop' ? 0.08 : 0.07 // under the browser bar / the phone's status bar
  for (let r = 0; r < rows; r++) { // lines of code: indent, then a run of glyphs
    if (Math.random() < 0.12) continue
    const indent = (Math.random() * 4) | 0, len = 4 + ((Math.random() * (cols * 0.55)) | 0)
    for (let c = indent * 2; c < Math.min(cols, indent * 2 + len); c++) {
      if (Math.random() < 0.12) continue // spaces between words
      push(-0.46 + (c / cols) * 0.92, 0.5 - top - ((r + 0.5) / rows) * (0.92 - top), 0, 0)
    }
  }
  const per = (n: number, f: (s: number) => [number, number]) => { for (let i = 0; i < n; i++) { const [x, y] = f(i / n); push(x, y, 0, 1) } }
  const edge = (s: number): [number, number] => { // the frame's perimeter
    const q = s * 4
    if (q < 1) return [-0.5 + q, 0.5]
    if (q < 2) return [0.5, 0.5 - (q - 1)]
    if (q < 3) return [0.5 - (q - 2), -0.5]
    return [-0.5, -0.5 + (q - 3)]
  }
  per(kind === 'laptop' ? 700 : 420, edge)
  if (kind === 'laptop') {
    per(260, (s) => [-0.5 + s, 0.5 - top]) // the browser bar's rule
    // keyboard base, hinged at the bottom edge; it slopes so it reads as a desk surface while the lid leans back
    const d = new THREE.Vector3(0, -0.68, 1).normalize()
    const at = (x: number, depth: number) => push(x, -0.5 + d.y * depth, d.z * depth, 2)
    for (let ky = 0; ky < 5; ky++) for (let kx = 0; kx < 14; kx++) for (let e = 0; e < 8; e++) { // key caps as small squares of dots
      const s = e / 8, x0 = -0.44 + kx * 0.0629, z0 = 0.08 + ky * 0.07, w = 0.05
      const [ex, ez] = s < 0.25 ? [s * 4 * w, 0] : s < 0.5 ? [w, (s - 0.25) * 4 * w] : s < 0.75 ? [w - (s - 0.5) * 4 * w, w] : [0, w - (s - 0.75) * 4 * w]
      at(x0 + ex, z0 + ez)
    }
    for (let i = 0; i < 160; i++) { const s = i / 160, q = s * 4, w = 0.3, h = 0.18; const [ex, ez] = q < 1 ? [q * w, 0] : q < 2 ? [w, (q - 1) * h] : q < 3 ? [w - (q - 2) * w, h] : [0, h - (q - 3) * h]; at(-0.15 + ex, 0.46 + ez) }
    for (let i = 0; i < 300; i++) { const s = i / 300; at(-0.52 + s * 1.04, 0.7); at(-0.52 + s * 1.04, 0) }
  }
  const pos = new Float32Array(P)
  const from = new Float32Array(P.length)
  for (let i = 0; i < P.length; i += 3) { // it falls from above, like the hero's code raining down
    from[i] = P[i] + (Math.random() - 0.5) * 1.6
    from[i + 1] = P[i + 1] + 1.6 + Math.random() * 2.2
    from[i + 2] = P[i + 2] + (Math.random() - 0.5) * 1.2
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aFrom', new THREE.BufferAttribute(from, 3))
  geo.setAttribute('aS', new THREE.BufferAttribute(new Float32Array(S), 4))
  return geo
}

function devices(tier: Tier, dpr: number) {
  const scene = new THREE.Scene()
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  cam.position.set(0, 0, 10)
  const vert = /* glsl */ `
    attribute vec3 aFrom; attribute vec4 aS;
    uniform float uT, uTime, uFade, uPx, uLight, uBase;
    varying vec3 vCol; varying float vA; varying float vGlyph;
    ${INK}
    void main() {
      float a = smoothstep(0.0, 1.0, clamp((uT - aS.x * 0.45) / 0.55, 0.0, 1.0));
      vec3 p = mix(aFrom, position, a);
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      bool dot = aS.y > 0.5;
      gl_PointSize = uPx * (dot ? 0.026 : 0.085) * (0.8 + 0.4 * aS.w) * mix(1.5, 1.0, a) / -mv.z;
      vCol = dot ? (aS.y > 1.5 ? uC1 : uHi) : mix(mix(uC3, uC1, position.x + 0.5), uC2, step(0.93, aS.z));
      vA = uFade * (aS.y > 1.5 ? uBase : 1.0) * mix(0.7, 1.0, a) * (0.8 + 0.2 * sin(uTime * 3.0 + aS.z * 50.0));
      vGlyph = dot ? -1.0 : floor(fract(aS.z * 13.7 + floor(uTime * (0.5 + aS.w * 2.0)) * 0.379) * 32.0);
    }`
  const make = (kind: 'laptop' | 'phone') => {
    const u = { uT: { value: 0 }, uTime: { value: 0 }, uFade: { value: 1 }, uPx: { value: 1000 }, uLight: { value: 0 }, uBase: { value: 1 } }
    const pts = new THREE.Points(deviceGeo(kind, tier), glyphMat(u, vert))
    pts.frustumCulled = false
    // the lit glass of the screen behind the code, so the device reads as an object and not only as points
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, uniforms: { ...PAL, ...u },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: /* glsl */ `
        uniform float uT, uFade, uLight; uniform vec3 uC1, uC3; varying vec2 vUv;
        void main() {
          vec3 c = mix(uC3, uC1, vUv.x);
          c = mix(c, mix(c, vec3(1.0), 0.75), uLight);
          float a = smoothstep(0.5, 1.0, uT) * uFade * mix(0.16, 0.5, uLight) * (0.55 + 0.45 * vUv.y);
          gl_FragColor = vec4(c, a);
        }`,
    }))
    glass.renderOrder = -1
    const obj = new THREE.Group()
    obj.add(glass, pts)
    scene.add(obj)
    return { pts: obj, mats: [pts.material as THREE.ShaderMaterial, glass.material as THREE.ShaderMaterial], u }
  }
  const laptop = make('laptop'), phone = make('phone')
  let W = 1, H = 1, px = 1
  // place a device so that, at e = 1, its unit screen covers the DOM rect exactly (z = 0 plane, camera at z = 10)
  const pose = (d: ReturnType<typeof make>, r: DOMRect, e: number, side: number, t: number, tilt: number) => {
    const s = (2 * 10 * Math.tan((15 * Math.PI) / 180)) / H
    const w = r.width * s, h = r.height * s, k = 1 - e
    d.pts.position.set((r.left + r.width / 2 - W / 2) * s + side * w * 0.12 * k, -(r.top + r.height / 2 - H / 2) * s + Math.sin(t * 0.8) * 0.05 * k, -2.2 * k)
    d.pts.rotation.set(-tilt * k, side * 0.55 * k + mouse.sx * 0.08 * k, side * -0.04 * k)
    d.pts.scale.set(w, h, w)
  }
  return {
    scene, cam,
    theme(isLight: boolean) { for (const d of [laptop, phone]) { d.u.uLight.value = isLight ? 1 : 0; d.mats.forEach((m) => setBlend(m, isLight)) } },
    resize(w: number, h: number) {
      W = w; H = h
      cam.aspect = w / h
      cam.updateProjectionMatrix()
      px = pxScale(cam, h, dpr)
    },
    /** draws one case; returns false when there is nothing to draw */
    update(t: number, p: number, browser: DOMRect, ph: DOMRect | null, side: number) {
      const e = smooth(0.35, 0.95, p)
      laptop.pts.visible = p < 1
      laptop.u.uT.value = smooth(0, 0.5, p)
      laptop.u.uFade.value = 1 - smooth(0.9, 1, p)
      laptop.u.uBase.value = 1 - smooth(0.55, 0.85, p)
      pose(laptop, browser, e, side, t, 0.3)
      const q = clamp01((p - 0.12) / 0.88) // the phone follows a beat later
      phone.pts.visible = !!ph && q < 1 && p > 0.05
      if (ph) {
        phone.u.uT.value = smooth(0, 0.5, q)
        phone.u.uFade.value = 1 - smooth(0.9, 1, q)
        pose(phone, ph, smooth(0.35, 0.95, q), -side * 1.3, t + 1, 0.15)
      }
      for (const d of [laptop, phone]) { d.u.uTime.value = t; d.u.uPx.value = px }
      return p < 1
    },
  }
}

/* ---------- a ribbon of code through the automation's steps ---------- */
function flow(tier: Tier, dpr: number) {
  const scene = new THREE.Scene()
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  cam.position.set(0, 0, 10)
  const G = tier === 'high' ? 900 : 500
  const pos = new Float32Array(G * 3), au = new Float32Array(G), seed = new Float32Array(G * 4)
  for (let i = 0; i < G; i++) seed.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4)
  const geo = new THREE.BufferGeometry()
  const posAttr = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage)
  const uAttr = new THREE.BufferAttribute(au, 1).setUsage(THREE.DynamicDrawUsage)
  geo.setAttribute('position', posAttr)
  geo.setAttribute('aU', uAttr)
  geo.setAttribute('aS', new THREE.BufferAttribute(seed, 4))
  const u = { uTime: { value: 0 }, uFade: { value: 0 }, uPx: { value: 1000 }, uLight: { value: 0 }, uHead: { value: 0 } }
  const pts = new THREE.Points(geo, glyphMat(u, /* glsl */ `
    attribute float aU; attribute vec4 aS;
    uniform float uTime, uFade, uPx, uLight, uHead;
    varying vec3 vCol; varying float vA; varying float vGlyph;
    ${INK}
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mv;
      float lit = step(aU, uHead), head = exp(-pow((aU - uHead) * 26.0, 2.0)) * step(0.001, uHead);
      gl_PointSize = uPx * (0.042 + 0.02 * aS.w) * (1.0 + head * 0.8) / -mv.z;
      vec3 dim = mix(vec3(0.42, 0.46, 0.66), vec3(0.6, 0.62, 0.74), uLight);
      vCol = mix(mix(dim, mix(uC1, uC2, aU), lit), uHi, head);
      vA = uFade * mix(mix(0.35, 0.45, uLight), 1.0, max(lit, head)) * (0.75 + 0.25 * sin(uTime * 4.0 + aS.x * 60.0));
      vGlyph = floor(fract(aS.z * 13.7 + floor(uTime * (0.6 + aS.w * 2.0)) * 0.379) * 32.0);
    }`))
  pts.frustumCulled = false
  scene.add(pts)
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(0, -1, 0)])
  let W = 1, H = 1
  return {
    scene, cam, u,
    theme(isLight: boolean) { u.uLight.value = isLight ? 1 : 0; setBlend(pts.material as THREE.ShaderMaterial, isLight) },
    resize(w: number, h: number) { W = w; H = h; cam.aspect = w / h; cam.updateProjectionMatrix(); u.uPx.value = pxScale(cam, h, dpr) },
    /** dots: the step markers on screen; the ribbon weaves through them in depth */
    update(t: number, k: number, dots: DOMRect[]) {
      const s = (2 * 10 * Math.tan((15 * Math.PI) / 180)) / H
      curve.points = dots.map((r, i) => new THREE.Vector3((r.left + r.width / 2 - W / 2) * s + Math.sin(i * 1.7 + t * 0.4) * 0.12, -(r.top + r.height / 2 - H / 2) * s, Math.sin(i * 1.3 + t * 0.3) * 0.5))
      curve.updateArcLengths()
      const v = new THREE.Vector3()
      for (let i = 0; i < G; i++) {
        const sd = seed[i * 4], ww = seed[i * 4 + 1] - 0.5
        const uu = (sd + t * 0.03) % 1
        curve.getPointAt(uu, v)
        const tw = uu * 14 + t * 1.2 + sd * 6 // the ribbon twists as it runs
        pos[i * 3] = v.x + Math.cos(tw) * ww * 0.16
        pos[i * 3 + 1] = v.y
        pos[i * 3 + 2] = v.z + Math.sin(tw) * ww * 0.16
        au[i] = uu
      }
      posAttr.needsUpdate = true
      uAttr.needsUpdate = true
      u.uTime.value = t
      u.uFade.value = k
    },
  }
}

/* ---------- the phone (closing): a path-traced iPhone 15 Pro with WhatsApp for iOS open ---------- */
type Msg = { from: 'in' | 'out'; text: string }
// WhatsApp for iOS in dark mode, in iOS points (393 x 852) at 2x: neutral system greys, a translucent nav bar with the
// tint-coloured chevron, bubbles whose tail curls from the bottom corner of the last one in a run, "escribiendo…"
// under the name instead of a bubble, and the composer with "+", the field, camera and mic.
// 'in' is the visitor writing (green, right), 'out' is PagX.
function chatScreen(msgs: Msg[]) {
  const k = 2
  const c = document.createElement('canvas')
  c.width = 393 * k
  c.height = 852 * k
  const g = c.getContext('2d')!
  const tex = new THREE.CanvasTexture(c)
  tex.anisotropy = 8
  const es = (document.documentElement.lang || 'es').startsWith('es')
  const L = es ? { online: 'en línea', typing: 'escribiendo…', today: 'Hoy' } : { online: 'online', typing: 'typing…', today: 'Today' }
  const font = (w: number, pt: number) => `${w} ${pt * k}px -apple-system, "SF Pro Text", "Inter Variable", system-ui, sans-serif`
  const TINT = '#0a84ff', GREY = '#8e8e93', BAR = 'rgba(28,28,30,0.94)'
  const P = (x: number) => x * k
  const wrap = (text: string, max: number) => {
    const lines: string[] = []
    let line = ''
    for (const word of text.split(' ')) {
      const test = line ? `${line} ${word}` : word
      if (g.measureText(test).width > max && line) { lines.push(line); line = word } else line = test
    }
    return [...lines, line]
  }
  const rr = (x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.roundRect(x, y, w, h, r) }
  const stroke = (color: string, w: number) => { g.strokeStyle = color; g.lineWidth = P(w); g.lineCap = 'round'; g.lineJoin = 'round' }
  // the dark doodle wallpaper, drawn once
  const wall = document.createElement('canvas')
  wall.width = c.width; wall.height = c.height
  const wg = wall.getContext('2d')!
  wg.fillStyle = '#0c0c0c'
  wg.fillRect(0, 0, wall.width, wall.height)
  wg.strokeStyle = 'rgba(255,255,255,0.05)'
  wg.lineWidth = P(1.1)
  let seed = 7
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < 170; i++) {
    const x = rnd() * wall.width, y = rnd() * wall.height, s = P(5 + rnd() * 8)
    wg.beginPath()
    const kind = (rnd() * 5) | 0
    if (kind === 0) wg.arc(x, y, s, 0, Math.PI * 2)
    else if (kind === 1) { wg.moveTo(x - s, y); wg.lineTo(x + s, y); wg.moveTo(x, y - s); wg.lineTo(x, y + s) }
    else if (kind === 2) wg.roundRect(x - s, y - s * 0.7, s * 2, s * 1.4, P(2))
    else if (kind === 3) { wg.moveTo(x - s, y + s); wg.quadraticCurveTo(x, y - s * 1.5, x + s, y + s) }
    else { wg.moveTo(x - s, y); wg.lineTo(x, y - s); wg.lineTo(x + s, y); wg.lineTo(x, y + s); wg.closePath() }
    wg.stroke()
  }
  let key = '', avatar = ['#ff6a2b', '#c2410c']
  for (const w of [400, 600, 700]) document.fonts.load(font(w, 17)).then(() => { key = '' }) // redraw once the face is in
  const times = msgs.map((_, i) => `10:${String(24 + i).padStart(2, '0')}`)
  const Wd = c.width, H = c.height
  const NAV = P(54), NAVH = P(52), COMP = P(86)

  const bubble = (x: number, y: number, w: number, h: number, mine: boolean, tail: boolean) => {
    const r = P(17)
    g.beginPath()
    g.roundRect(x, y, w, h, tail ? (mine ? [r, r, P(6), r] : [r, r, r, P(6)]) : r)
    g.fill()
    if (!tail) return
    // the iOS tail: a curl out of the bottom corner
    const ex = mine ? x + w : x, dir = mine ? 1 : -1
    g.beginPath()
    g.moveTo(ex - dir * P(8), y + h - P(14)); g.lineTo(ex - dir * P(8), y + h)
    g.quadraticCurveTo(ex + dir * P(2), y + h + P(0.5), ex + dir * P(6), y + h - P(0.5))
    g.quadraticCurveTo(ex, y + h - P(4), ex, y + h - P(14))
    g.fill()
  }

  return {
    tex,
    recolor() { avatar = [tok('--gl-2') || '#ff6a2b', tok('--color-c2') || '#c2410c']; key = '' },
    draw(shown: number, typing: boolean) {
      const kk = `${shown}${typing}`
      if (kk === key) return
      key = kk
      g.drawImage(wall, 0, 0)

      // bubbles, stacked up from the composer like the real app
      const lh = P(21), padX = P(12), padY = P(7), max = P(262)
      const items = msgs.slice(0, shown).map((m, i) => {
        const mine = m.from === 'in'
        g.font = font(400, 17)
        const lines = wrap(m.text, max)
        const textW = Math.max(...lines.map((l) => g.measureText(l).width))
        const lastW = g.measureText(lines[lines.length - 1]).width
        g.font = font(400, 11)
        const metaW = g.measureText(times[i]).width + (mine ? P(19) : 0)
        const inline = lastW + metaW + P(10) < max // the time sits on the last line when it fits
        const w = Math.max(textW, inline ? lastW + metaW + P(10) : metaW) + padX * 2
        const h = lines.length * lh + padY * 2 + (inline ? 0 : P(13))
        const last = i === shown - 1 || msgs[i + 1].from !== m.from
        return { mine, lines, meta: times[i], metaW, w, h, last }
      })
      let y = H - COMP - P(10) - items.reduce((sum, it) => sum + it.h + (it.last ? P(8) : P(2)), 0)
      // the "today" chip, above the first message
      g.font = font(600, 12)
      const tw = g.measureText(L.today).width + P(20), ty = Math.min(y - P(36), NAV + NAVH + P(14))
      g.fillStyle = 'rgba(38,38,40,0.92)'; rr((Wd - tw) / 2, ty, tw, P(22), P(11)); g.fill()
      g.fillStyle = '#d1d1d6'; g.textAlign = 'center'; g.fillText(L.today, Wd / 2, ty + P(15.5)); g.textAlign = 'left'
      for (const it of items) {
        const x = it.mine ? Wd - P(14) - it.w : P(14)
        g.fillStyle = it.mine ? '#144d37' : '#262628'
        bubble(x, y, it.w, it.h, it.mine, it.last)
        g.fillStyle = '#ffffff'; g.font = font(400, 17)
        it.lines.forEach((l, j) => g.fillText(l, x + padX, y + padY + P(16) + j * lh))
        g.font = font(400, 11); g.fillStyle = it.mine ? 'rgba(255,255,255,0.55)' : GREY
        const my = y + it.h - P(7)
        g.fillText(it.meta, x + it.w - padX - it.metaW, my)
        if (it.mine) { // read: two blue ticks
          stroke('#34b7f1', 1.3)
          for (const o of [0, 4.5]) { g.beginPath(); g.moveTo(x + it.w - padX - P(14 - o), my - P(4)); g.lineTo(x + it.w - padX - P(11 - o), my - P(1)); g.lineTo(x + it.w - padX - P(5 - o), my - P(8)); g.stroke() }
        }
        y += it.h + (it.last ? P(8) : P(2))
      }

      // status bar over the translucent nav bar, then the Dynamic Island
      g.fillStyle = BAR; g.fillRect(0, 0, Wd, NAV + NAVH)
      g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, NAV + NAVH - 1, Wd, 1)
      g.fillStyle = '#fff'
      g.font = font(600, 17); g.textAlign = 'center'; g.fillText('9:41', P(64), P(37)); g.textAlign = 'left'
      for (let i = 0; i < 4; i++) { rr(P(292 + i * 5.2), P(36 - 3.4 - i * 2.4), P(3.4), P(3.4 + i * 2.4), P(1)); g.fill() }
      for (const [r0, r1] of [[7.4, 10], [3.8, 6.4]]) { // wifi: two arcs and a dot
        g.beginPath(); g.arc(P(323.5), P(37), P(r1), -Math.PI * 0.76, -Math.PI * 0.24); g.arc(P(323.5), P(37), P(r0), -Math.PI * 0.24, -Math.PI * 0.76, true); g.closePath(); g.fill()
      }
      g.beginPath(); g.moveTo(P(323.5), P(37)); g.arc(P(323.5), P(37), P(2.4), -Math.PI * 0.76, -Math.PI * 0.24); g.closePath(); g.fill()
      stroke('rgba(255,255,255,0.4)', 1); rr(P(341), P(26.5), P(25), P(12), P(3.8)); g.stroke()
      g.fillStyle = '#fff'; rr(P(343), P(28.5), P(19), P(8), P(2.2)); g.fill()
      g.fillStyle = 'rgba(255,255,255,0.4)'; rr(P(367.3), P(30.5), P(1.6), P(4), P(1)); g.fill()
      g.fillStyle = '#000'; rr(P(393 / 2 - 62.5), P(11), P(125), P(37), P(18.5)); g.fill()

      // nav bar: chevron and unread count, avatar, name over status, video and call
      const ny = NAV
      stroke(TINT, 2.6)
      g.beginPath(); g.moveTo(P(19), ny + P(15)); g.lineTo(P(10), ny + P(26)); g.lineTo(P(19), ny + P(37)); g.stroke()
      g.fillStyle = TINT; g.font = font(400, 17); g.fillText('3', P(25), ny + P(32))
      const grad = g.createLinearGradient(P(40), ny + P(8), P(76), ny + P(44))
      grad.addColorStop(0, avatar[0]); grad.addColorStop(1, avatar[1])
      g.fillStyle = grad; g.beginPath(); g.arc(P(57), ny + P(26), P(18), 0, Math.PI * 2); g.fill()
      g.fillStyle = '#fff'; g.font = font(700, 16); g.textAlign = 'center'; g.fillText('P', P(57), ny + P(32)); g.textAlign = 'left'
      g.fillStyle = '#fff'; g.font = font(600, 17); g.fillText('PagX Studio', P(84), ny + P(23))
      g.fillStyle = GREY; g.font = font(400, 12.5); g.fillText(typing ? L.typing : L.online, P(84), ny + P(40))
      stroke(TINT, 1.9)
      rr(P(302), ny + P(18), P(20), P(15), P(4)); g.stroke()
      g.beginPath(); g.moveTo(P(322), ny + P(23.5)); g.lineTo(P(329), ny + P(19.5)); g.lineTo(P(329), ny + P(31.5)); g.lineTo(P(322), ny + P(27.5)); g.stroke()
      g.beginPath(); g.moveTo(P(352), ny + P(15)); g.quadraticCurveTo(P(347), ny + P(33), P(366), ny + P(38)); g.lineTo(P(371), ny + P(33)); g.lineTo(P(365), ny + P(28.5)); g.lineTo(P(361.5), ny + P(31)); g.quadraticCurveTo(P(356.5), ny + P(27), P(357.5), ny + P(22)); g.lineTo(P(360), ny + P(19)); g.lineTo(P(355.5), ny + P(13)); g.closePath(); g.stroke()

      // composer and the home indicator
      const cy = H - COMP
      g.fillStyle = BAR; g.fillRect(0, cy, Wd, COMP)
      g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, cy, Wd, 1)
      stroke(TINT, 2.2)
      g.beginPath(); g.moveTo(P(22), cy + P(13)); g.lineTo(P(22), cy + P(31)); g.moveTo(P(13), cy + P(22)); g.lineTo(P(31), cy + P(22)); g.stroke()
      g.fillStyle = '#1c1c1e'; rr(P(44), cy + P(6), P(250), P(34), P(17)); g.fill()
      stroke('rgba(255,255,255,0.14)', 0.8); rr(P(44), cy + P(6), P(250), P(34), P(17)); g.stroke()
      stroke(TINT, 1.7) // the sticker, inside the field
      rr(P(263), cy + P(13), P(20), P(20), P(5)); g.stroke()
      g.beginPath(); g.moveTo(P(273), cy + P(33)); g.quadraticCurveTo(P(273), cy + P(23), P(283), cy + P(23)); g.stroke()
      rr(P(311), cy + P(14), P(23), P(17), P(4)); g.stroke() // camera
      g.beginPath(); g.arc(P(322.5), cy + P(22.5), P(4.6), 0, Math.PI * 2); g.stroke()
      rr(P(358), cy + P(10), P(10), P(16), P(5)); g.stroke() // mic
      g.beginPath(); g.moveTo(P(353), cy + P(21)); g.quadraticCurveTo(P(363), cy + P(35), P(373), cy + P(21)); g.moveTo(P(363), cy + P(30)); g.lineTo(P(363), cy + P(35)); g.stroke()
      g.fillStyle = '#fff'; rr((Wd - P(134)) / 2, H - P(13), P(134), P(5), P(2.5)); g.fill()
      tex.needsUpdate = true
    },
  }
}

// The homography taking frame UV to display UV: square -> quad (TL, TR, BR, BL; v down) for the 4 corners, inverted.
// Matrix3.set takes row-major values; the shader gets it column-major, as GLSL expects.
type V2 = [number, number]
function quadToSquare([[x0, y0], [x1, y1], [x2, y2], [x3, y3]]: V2[], out: THREE.Matrix3) {
  const dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2
  const sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3
  const den = dx1 * dy2 - dx2 * dy1
  const g = (sx * dy2 - dx2 * sy) / den, h = (dx1 * sy - sx * dy1) / den
  out.set(x1 - x0 + g * x1, x3 - x0 + h * x3, x0, y1 - y0 + g * y1, y3 - y0 + h * y3, y0, g, h, 1)
  return out.invert()
}

function phoneAct(msgs: Msg[], tier: Tier) {
  const scene = new THREE.Scene()
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  cam.position.set(0, 0, 10)
  // the sweep rendered by assets/blender/iphone.py: frame i turns the phone to yaw(i); the display's corners per frame
  type Meta = { n: number; w: number; h: number; yaw: [number, number]; screen: [number, number, number]; corners: V2[][] }
  let meta: Meta | null = null
  const dir = `/home/iphone/${tier === 'high' ? 'd' : 'm'}/`
  const frames: (THREE.Texture | undefined)[] = []
  const chat = chatScreen(msgs)
  const u = {
    uA: { value: null as THREE.Texture | null }, uB: { value: null as THREE.Texture | null }, uMix: { value: 0 }, uChat: { value: chat.tex },
    uH: { value: new THREE.Matrix3() }, uScreen: { value: new THREE.Vector3(66.2, 142.2, 8.8) },
  }
  // the frame (straight alpha) plus the lit display added under its glass: the render's black glass only carries reflections
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, premultipliedAlpha: true, uniforms: u,
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: /* glsl */ `
      uniform sampler2D uA, uB, uChat; uniform float uMix; uniform mat3 uH; uniform vec3 uScreen;
      varying vec2 vUv;
      void main() {
        vec2 f = vec2(vUv.x, 1.0 - vUv.y);
        vec4 a = texture2D(uA, vUv), b = texture2D(uB, vUv);
        vec3 col = mix(a.rgb * a.a, b.rgb * b.a, uMix);
        float al = mix(a.a, b.a, uMix);
        vec3 s = uH * vec3(f, 1.0);
        vec2 d = s.xy / s.z;
        // the display's rounded corners, in mm
        vec2 q = abs((d - 0.5) * uScreen.xy) - (uScreen.xy * 0.5 - uScreen.z);
        float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uScreen.z;
        float aa = max(fwidth(sd), 1e-4);
        float m = 1.0 - smoothstep(-aa, aa, sd);
        col += texture2D(uChat, vec2(d.x, 1.0 - d.y)).rgb * m * 0.96;
        gl_FragColor = vec4(col, max(al, m));
      }`,
  })
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat)
  plane.visible = false
  // the coloured light it stands in, as two soft halos behind it
  const halo = (x: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uC: { value: new THREE.Color() }, uA: { value: 0.5 } },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform vec3 uC; uniform float uA; varying vec2 vUv; void main() { float d = length(vUv - 0.5) * 2.0; gl_FragColor = vec4(uC, uA * pow(max(0.0, 1.0 - d), 2.2)); }',
    }))
    m.position.set(x, 0, -0.6)
    m.scale.set(1.3, 1.6, 1)
    return m
  }
  const h1 = halo(-0.35), h2 = halo(0.4)
  const rig = new THREE.Group()
  rig.add(h1, h2, plane)
  scene.add(rig)

  // load the sweep, the resting pose first so the phone is there as soon as the closing is reached
  fetch('/home/iphone/phone.json').then((r) => r.json()).then((m: Meta) => {
    meta = m
    u.uScreen.value.set(...m.screen)
    plane.scale.set(m.w / m.h / 0.88, 1 / 0.88, 1) // the phone fills 88 % of the frame's height
    const rest = Math.round(((m.yaw[0] + 0.34) / (m.yaw[0] - m.yaw[1])) * (m.n - 1))
    const order = [...Array(m.n).keys()].sort((x, y) => Math.abs(x - rest) - Math.abs(y - rest))
    const loader = new THREE.TextureLoader()
    let next = 0
    const load = () => {
      const i = order[next++]
      if (i === undefined) return
      loader.load(`${dir}${String(i).padStart(3, '0')}.webp`, (t) => { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; frames[i] = t; load() }, undefined, load)
    }
    for (let c = 0; c < 4; c++) load()
  })

  let W = 1, H = 1
  const seq = msgs.map((m) => m.from)
  const quad: V2[] = [[0, 0], [0, 0], [0, 0], [0, 0]]
  const nearest = (i: number) => { for (let d = 0; d < 64; d++) { if (frames[i - d]) return i - d; if (frames[i + d]) return i + d } return -1 }
  return {
    scene, cam,
    theme(isLight: boolean) {
      chat.recolor()
      for (const [h, name] of [[h1, '--gl-1'], [h2, '--gl-2']] as const) {
        const m = h.material as THREE.ShaderMaterial
        m.uniforms.uC.value.setRGB(...srgb(tok(name)), THREE.SRGBColorSpace)
        m.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending
        m.uniforms.uA.value = isLight ? 0.35 : 0.5
        m.needsUpdate = true
      }
    },
    resize(w: number, h: number) { W = w; H = h; cam.aspect = w / h; cam.updateProjectionMatrix() },
    update(t: number, r: DOMRect, k: number) {
      const s = (2 * 10 * Math.tan((15 * Math.PI) / 180)) / H
      const enter = ease(k)
      rig.position.set((r.left + r.width / 2 - W / 2) * s, -(r.top + r.height / 2 - H / 2) * s - (1 - enter) * 0.8 + Math.sin(t * 0.9) * 0.04, 0)
      rig.scale.setScalar(r.height * s * 0.92)
      if (!meta) return
      // yaw as the live phone had it, played back through the sweep
      const yaw = -0.34 + mouse.sx * 0.3 + (1 - enter) * 0.8 + Math.sin(t * 0.6) * 0.02
      const f = clamp01((meta.yaw[0] - yaw) / (meta.yaw[0] - meta.yaw[1])) * (meta.n - 1)
      let i0 = Math.floor(f), i1 = Math.min(meta.n - 1, i0 + 1), mix = f - i0
      if (!frames[i0] || !frames[i1]) { i0 = i1 = nearest(Math.round(f)); mix = 0 }
      plane.visible = i0 >= 0
      if (i0 < 0) return
      u.uA.value = frames[i0]!; u.uB.value = frames[i1]!; u.uMix.value = mix
      const c0 = meta.corners[i0], c1 = meta.corners[i1]
      for (let j = 0; j < 4; j++) quad[j] = [c0[j][0] + (c1[j][0] - c0[j][0]) * mix, c0[j][1] + (c1[j][1] - c0[j][1]) * mix]
      quadToSquare(quad, u.uH.value)
      // the conversation: a message every 1.6 s, "escribiendo…" under the name before each PagX reply, a pause, again
      const step = 1.6, cycle = seq.length * step + 4
      const c = (t % cycle) / step
      const shown = Math.min(seq.length, Math.floor(c))
      const typing = shown < seq.length && seq[shown] === 'out' && c - shown > 0.25
      chat.draw(Math.max(1, shown), typing)
    },
  }
}

/* ---------- the stage ---------- */
export type Stage = { destroy(): void; flow(head: number): void }
export function mountStage(canvas: HTMLCanvasElement, add: (fn: (t: number) => void) => () => void): Stage | null {
  const tier: Tier = matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency ?? 8) <= 4 ? 'mid' : 'high'
  const dpr = tier === 'high' ? Math.min(devicePixelRatio, 1.75) : 1
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: tier === 'high', alpha: true, powerPreference: 'high-performance' })
  } catch {
    return null
  }
  renderer.setPixelRatio(dpr)
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.autoClear = false

  const q = (s: string) => document.querySelector<HTMLElement>(s)
  const heroEl = q('[data-act="ribbons"]'), phoneEl = q('[data-phone]'), autoEl = q('[data-auto]')
  const hero = heroEl ? ribbons(tier, dpr) : null
  const dev = devices(tier, dpr)
  const fl = autoEl ? flow(tier, dpr) : null
  const ph = phoneEl ? phoneAct(JSON.parse(phoneEl.dataset.chat ?? '[]'), tier) : null
  const cases = [...document.querySelectorAll<HTMLElement>('[data-morph]')].map((el) => ({
    stage: el.querySelector<HTMLElement>('.case-stage')!,
    browser: el.querySelector<HTMLElement>('.browser')!,
    phone: el.querySelector<HTMLElement>('.phone'),
    side: el.classList.contains('case-alt') ? -1 : 1,
    shown: -1,
  }))
  const acts = [hero, dev, fl, ph]

  // the hero's bounds in page coordinates, measured on resize only
  let W = 0, H = 0, hb = { top: 0, h: 1 }
  const measure = () => {
    W = innerWidth
    H = innerHeight
    renderer.setSize(W, H, false)
    if (heroEl) { const r = heroEl.getBoundingClientRect(); hb = { top: r.top + scrollY, h: r.height } }
    acts.forEach((a) => a?.resize(W, H))
  }
  measure()
  const ro = new ResizeObserver(measure)
  ro.observe(document.body)
  const onMove = (e: PointerEvent) => { mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = -((e.clientY / innerHeight) * 2 - 1) }
  addEventListener('pointermove', onMove, { passive: true })

  let theme = ''
  const syncTheme = () => {
    const now = root.dataset.theme ?? 'dark'
    if (theme === now) return
    theme = now
    readPalette()
    acts.forEach((a) => a?.theme(light()))
  }
  const vis = (r: DOMRect, m = 0) => r.bottom > -m && r.top < H + m && r.width > 4
  const setOpacity = (el: HTMLElement | null, o: number) => {
    if (!el) return
    const v = o.toFixed(3)
    if (el.style.opacity !== v) { el.style.opacity = v; el.style.pointerEvents = o < 0.5 ? 'none' : '' }
  }

  let dirty = true
  const start = performance.now()
  const off = add(() => {
    const t = (performance.now() - start) / 1000
    mouse.sx += (mouse.x - mouse.sx) * 0.04
    mouse.sy += (mouse.y - mouse.sy) * 0.04
    syncTheme()
    const y = scrollY
    const jobs: (() => void)[] = []

    if (hero) {
      const k = ease(clamp01(((Math.min(y + H, hb.top + hb.h) - Math.max(y, hb.top)) / Math.min(H, hb.h)) * 1.25))
      if (k > 0.002) jobs.push(() => { hero.update(t, k, clamp01((y + H - hb.top) / (hb.h + H))); renderer.render(hero.scene, hero.cam) })
    }
    // concepts: the frame lands when its top reaches a quarter of the screen.
    // Phones skip the glyph assembly (in one narrow column it rains over the copy) and simply fade the frames in.
    const narrow = W < 760
    for (const c of cases) {
      const r = c.stage.getBoundingClientRect()
      const p = clamp01((H - r.top) / (H * 0.75))
      setOpacity(c.browser, narrow ? smooth(0.15, 0.55, p) : smooth(0.86, 0.98, p))
      setOpacity(c.phone, narrow ? smooth(0.25, 0.65, p) : smooth(0.88, 1, clamp01((p - 0.12) / 0.88)))
      if (narrow || !vis(r) || p >= 1 || p <= 0) continue
      const b = c.browser.getBoundingClientRect(), pr = c.phone?.getBoundingClientRect()
      jobs.push(() => { dev.update(t, p, b, pr && pr.width > 4 ? pr : null, c.side); renderer.clearDepth(); renderer.render(dev.scene, dev.cam) })
    }
    if (fl && autoEl) {
      const panel = autoEl.querySelector<HTMLElement>('[data-auto-panel]:not([hidden])')
      const r = autoEl.getBoundingClientRect()
      if (panel && vis(r)) {
        const dots = [...panel.querySelectorAll<HTMLElement>('.node-dot')].map((d) => d.getBoundingClientRect())
        const k = clamp01(Math.min(r.bottom, H) / H * 2) * clamp01((H - r.top) / (H * 0.5))
        if (k > 0.002 && dots.length > 1) jobs.push(() => { fl.update(t, k, dots); renderer.render(fl.scene, fl.cam) })
      }
    }
    if (ph && phoneEl) {
      const r = phoneEl.getBoundingClientRect()
      if (vis(r, 100)) {
        const k = clamp01((H - r.top) / (H * 0.6))
        jobs.push(() => { ph.update(t, r, k); renderer.clearDepth(); renderer.render(ph.scene, ph.cam) })
      }
    }
    // when nothing of the 3D is on screen the canvas is left untouched, so the compositor has nothing to redo
    if (jobs.length || dirty) renderer.clear()
    dirty = jobs.length > 0
    jobs.forEach((j) => j())
  })
  canvas.classList.add('is-live')
  root.classList.add('gl-live')

  return {
    flow: (head) => { if (fl) fl.u.uHead.value = head },
    destroy() {
      off()
      ro.disconnect()
      removeEventListener('pointermove', onMove)
      root.classList.remove('gl-live')
      cases.forEach((c) => { for (const el of [c.browser, c.phone]) if (el) { el.style.opacity = ''; el.style.pointerEvents = '' } })
      for (const a of acts) a?.scene.traverse((o: any) => { o.geometry?.dispose(); o.material?.dispose?.() })
      renderer.dispose()
    },
  }
}

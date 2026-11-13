// Instituto La Villa (PagX concept): the hero is a Cycles aerial in layers, brought to life in WebGL.
//   plate = the whole site (assets/blender/villa.blend, villa_render.py hero)
//   depth = its mist pass, for a depth-correct parallax
//   front = the foreground trees with alpha, an <img> above the DOM title (the title stands among the trees)
// The canvas adds what a still can't: cloud shadows drifting over the site, a soft sun that follows the cursor,
// and an intro where the render develops out of the white paper like a drawing. One clock (@pagx/motion).

export type Scene = { destroy(): void }

const VERT = /* glsl */ `#version 300 es
in vec2 p; out vec2 vUv;
void main() { vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`

const FRAG = /* glsl */ `#version 300 es
precision highp float;
uniform sampler2D uPlate, uDepth, uFront;
uniform vec2 uRes, uImg, uPtr, uPar;
uniform float uTime, uFocus, uIntro;
in vec2 vUv; out vec4 o;

float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * noise(p); p *= 2.03; a *= 0.5; } return s; }

vec2 cover(vec2 uv) {
  float rs = uRes.x / uRes.y, ri = uImg.x / uImg.y;
  vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  return (uv - 0.5) * s + 0.5;
}

void main() {
  vec2 uv = cover(vUv);
  // depth-correct parallax around the school (the focus plane); the trees in front swing one way, the hills the other
  vec2 off = uPar * (texture(uDepth, uv).r - uFocus) * 0.018;
  for (int i = 0; i < 2; i++) off = uPar * (texture(uDepth, uv - off).r - uFocus) * 0.018;
  float hide = smoothstep(0.05, 0.6, texture(uFront, uv - off).a) * (1.0 - texture(uFront, uv).a);
  off *= 1.0 - hide;
  float d = texture(uDepth, uv - off).r;
  vec3 col = texture(uPlate, uv - off).rgb;
  // a touch of grade: the haze reads milky on screen, so firm up the mid-tones
  col = mix(col, col * col * (3.0 - 2.0 * col), 0.3);

  // cloud shadows: slow fbm drifting across the ground plane (stretched with depth so they lie flat)
  vec2 gp = vec2(uv.x * 2.2, uv.y * 2.2 / mix(1.0, 0.35, d));
  float cl = smoothstep(0.48, 0.72, fbm(gp + vec2(uTime * 0.018, uTime * 0.006)));
  col *= 1.0 - cl * 0.22 * (1.0 - d * 0.7);

  // a low sun that follows the cursor: warms what it touches, more on the white roofs than the grass
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  float sun = exp(-pow(distance(vUv * asp, (uPtr * 0.5 + 0.5) * asp) * 1.8, 2.0));
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col += vec3(1.0, 0.86, 0.66) * sun * smoothstep(0.35, 0.85, lum) * 0.12;

  // intro: the render develops out of the paper, far things first
  float dev = smoothstep(0.0, 1.0, uIntro * 1.6 - (1.0 - d) * 0.6);
  o = vec4(mix(vec3(1.0), col, dev), 1.0);
}`

function load(src: string) {
  return new Promise<HTMLImageElement>((ok, bad) => {
    const i = new Image()
    i.decoding = 'async'
    i.onload = () => ok(i)
    i.onerror = bad
    i.src = src
  })
}

export async function mountScene(
  canvas: HTMLCanvasElement,
  add: (fn: (t: number) => void) => () => void,
  onProgress: (p: number) => void,
): Promise<Scene | null> {
  const gl = canvas.getContext('webgl2', { antialias: false })
  if (!gl) return null
  const prof = innerWidth / innerHeight < 0.9 ? 'm' : 'd'
  let done = 0
  const step = (i: HTMLImageElement) => (onProgress(++done / 3), i)
  const [plate, depth, frontImg] = await Promise.all([
    load(`/villa/${prof}-plate.webp`).then(step),
    load(`/villa/${prof}-depth.webp`).then(step),
    load(`/villa/${prof}-front.webp`).then(step),
  ])

  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader')
    return s
  }
  const prog = gl.createProgram()!
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(prog)
  gl.useProgram(prog)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'p')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const textures = [plate, depth, frontImg].map((img, unit) => {
    const t = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, t)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    gl.generateMipmap(gl.TEXTURE_2D)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.uniform1i(gl.getUniformLocation(prog, ['uPlate', 'uDepth', 'uFront'][unit]), unit)
    return t
  })
  const U = (n: string) => gl.getUniformLocation(prog, n)
  const uRes = U('uRes'), uPtr = U('uPtr'), uPar = U('uPar'), uTime = U('uTime'), uIntro = U('uIntro')
  gl.uniform2f(U('uImg'), plate.naturalWidth, plate.naturalHeight)
  // focus plane = the depth at the centre of the frame, where the wave roof sits
  const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!
  probe.canvas.width = depth.naturalWidth
  probe.canvas.height = depth.naturalHeight
  probe.drawImage(depth, 0, 0)
  gl.uniform1f(U('uFocus'), probe.getImageData(depth.naturalWidth >> 1, depth.naturalHeight >> 1, 1, 1).data[0] / 255)

  const dpr = Math.min(devicePixelRatio, 1.5)
  const resize = () => {
    canvas.width = Math.round(innerWidth * dpr)
    canvas.height = Math.round(innerHeight * dpr)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uRes, canvas.width, canvas.height)
  }
  resize()
  addEventListener('resize', resize)

  const ptr = { x: 0.4, y: 0.3, sx: 0.4, sy: 0.3 }
  const onMove = (e: PointerEvent) => { ptr.x = (e.clientX / innerWidth) * 2 - 1; ptr.y = -((e.clientY / innerHeight) * 2 - 1) }
  addEventListener('pointermove', onMove, { passive: true })
  const front = document.querySelector<HTMLElement>('.v-front')

  let onScreen = true
  const io = new IntersectionObserver((e) => (onScreen = e[0].isIntersecting))
  io.observe(canvas)
  canvas.classList.add('is-live')
  const start = performance.now()
  const off = add(() => {
    if (!onScreen) return
    const t = (performance.now() - start) / 1000
    ptr.sx += (ptr.x - ptr.sx) * 0.05
    ptr.sy += (ptr.y - ptr.sy) * 0.05
    const dx = ptr.sx + Math.sin(t * 0.21) * 0.12, dy = ptr.sy + Math.cos(t * 0.17) * 0.08
    gl.uniform1f(uTime, t)
    gl.uniform1f(uIntro, Math.min(t / 2.2, 1))
    gl.uniform2f(uPtr, ptr.sx, ptr.sy)
    gl.uniform2f(uPar, dx, dy)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    // the front trees only breathe a hair: a bigger shift would open a gap against their copy in the plate
    if (front) front.style.transform = `translate3d(${(-dx * 3).toFixed(2)}px, ${(dy * 2).toFixed(2)}px, 0)`
  })

  return {
    destroy() {
      off()
      io.disconnect()
      removeEventListener('resize', resize)
      removeEventListener('pointermove', onMove)
      textures.forEach((t) => gl.deleteTexture(t))
      gl.deleteProgram(prog)
    },
  }
}

// Sotobosque (PagX concept, fictional brand): the hero is a Cycles render in layers, brought to life in WebGL.
//   plate  = the whole clearing (assets/blender/sotobosque.blend, sb_render.py)
//   depth  = its mist pass, used for a depth-correct parallax around the bottle
//   front  = bottle + rock + foreground ferns with alpha, an <img> above the DOM title (so the title sits *inside* the scene)
// The canvas adds what a still can't: drifting light shafts, a warm light that follows the cursor through the fog,
// spores that catch it and twinkling fireflies. One clock (@pagx/motion), no React state per frame.

export type Forest = { destroy(): void }

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

// object-fit: cover, centred (the front <img> uses the same rule)
vec2 cover(vec2 uv) {
  float rs = uRes.x / uRes.y, ri = uImg.x / uImg.y;
  vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  return (uv - 0.5) * s + 0.5;
}

void main() {
  vec2 uv = cover(vUv);
  // depth-correct parallax: the focus plane (the bottle) stays put, near things swing one way, the forest the other
  vec2 off = uPar * (texture(uDepth, uv).r - uFocus) * 0.02;
  for (int i = 0; i < 2; i++) off = uPar * (texture(uDepth, uv - off).r - uFocus) * 0.02;
  // never pull the bottle or the rock out from under the front layer (that would show a ghost): where the shifted
  // sample lands on them, fall back to the unshifted plate, which is the forest at this pixel
  float hide = smoothstep(0.05, 0.6, texture(uFront, uv - off).a) * (1.0 - texture(uFront, uv).a);
  off *= 1.0 - hide;
  float d = texture(uDepth, uv - off).r;
  vec3 col = texture(uPlate, uv - off).rgb;
  // a touch of grade: deeper shadows, the render stays soft
  col = mix(col, col * col * (3.0 - 2.0 * col), 0.35);

  // aspect-correct screen space
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  vec2 sp = vUv * asp, pp = (uPtr * 0.5 + 0.5) * asp;

  // light shafts drifting through the canopy (slanted, from the top right), only in the far fog
  vec2 bp = vec2(sp.x * 0.86 + sp.y * 0.5, sp.y);
  float shaft = noise(vec2(bp.x * 5.5 + uTime * 0.035, 0.5)) * noise(vec2(bp.x * 13.0 - uTime * 0.05, 3.0));
  shaft = smoothstep(0.28, 0.75, shaft) * smoothstep(0.1, 1.0, vUv.y) * smoothstep(0.25, 0.9, d);
  col += vec3(1.0, 0.86, 0.6) * shaft * 0.14;

  // the cursor carries a warm lantern through the mist: it lights the fog behind more than the near moss
  float lamp = exp(-pow(distance(sp, pp) * 2.6, 2.0));
  col += vec3(1.0, 0.72, 0.38) * lamp * (0.04 + 0.1 * smoothstep(0.2, 0.9, d));
  col *= 1.0 + lamp * 0.2;

  // fireflies: a sparse twinkling grid at two depths
  for (int k = 0; k < 2; k++) {
    float sc = k == 0 ? 7.0 : 13.0;
    vec2 g = sp * sc + vec2(uTime * 0.02, -uTime * 0.035) * float(k + 1);
    vec2 gi = floor(g), gf = fract(g);
    float r = h21(gi + float(k) * 17.0);
    if (r > 0.88) {
      vec2 c = vec2(h21(gi + 3.1), h21(gi + 7.7)) * 0.7 + 0.15;
      c += vec2(sin(uTime * 0.6 + r * 40.0), cos(uTime * 0.5 + r * 30.0)) * 0.12;
      float tw = 0.5 + 0.5 * sin(uTime * (1.2 + r * 2.0) + r * 60.0);
      float sz = k == 0 ? 0.06 : 0.035;
      col += vec3(1.0, 0.65, 0.28) * smoothstep(sz, 0.0, length(gf - c)) * tw * (k == 0 ? 0.45 : 0.28);
    }
  }

  // spores: fine motes that only show inside the light
  vec2 sg = sp * 60.0 + vec2(uTime * 0.6, uTime * 1.1);
  vec2 si = floor(sg), sf = fract(sg);
  float mote = step(0.965, h21(si)) * smoothstep(0.12, 0.0, length(sf - vec2(h21(si + 1.3), h21(si + 2.9))));
  col += vec3(1.0, 0.92, 0.75) * mote * (shaft * 2.5 + lamp * 1.8) * 0.5;

  // intro: the clearing breathes in from the dark
  o = vec4(col * uIntro, 1.0);
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

export async function mountForest(
  canvas: HTMLCanvasElement,
  add: (fn: (t: number) => void) => () => void,
  onProgress: (p: number) => void,
): Promise<Forest | null> {
  const gl = canvas.getContext('webgl2', { antialias: false })
  if (!gl) return null
  const prof = innerWidth / innerHeight < 0.9 ? 'm' : 'd'
  let done = 0
  const step = (i: HTMLImageElement) => (onProgress(++done / 3), i)
  const [plate, depth, frontImg] = await Promise.all([
    load(`/sotobosque/${prof}-plate.webp`).then(step),
    load(`/sotobosque/${prof}-depth.webp`).then(step),
    load(`/sotobosque/${prof}-front.webp`).then(step),
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
  // the focus plane is the bottle's depth, read once from the depth map where the bottle stands
  const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!
  probe.canvas.width = depth.naturalWidth
  probe.canvas.height = depth.naturalHeight
  probe.drawImage(depth, 0, 0)
  const at = probe.getImageData(depth.naturalWidth >> 1, Math.round(depth.naturalHeight * 0.5), 1, 1).data[0] / 255
  gl.uniform1f(U('uFocus'), at)

  const dpr = Math.min(devicePixelRatio, 1.5)
  const resize = () => {
    canvas.width = Math.round(innerWidth * dpr)
    canvas.height = Math.round(innerHeight * dpr)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uRes, canvas.width, canvas.height)
  }
  resize()
  addEventListener('resize', resize)

  const ptr = { x: 0.3, y: 0.2, sx: 0.3, sy: 0.2 }
  const onMove = (e: PointerEvent) => { ptr.x = (e.clientX / innerWidth) * 2 - 1; ptr.y = -((e.clientY / innerHeight) * 2 - 1) }
  addEventListener('pointermove', onMove, { passive: true })
  const front = document.querySelector<HTMLElement>('.sb-front') // the picture; its img is driven by the scroll timeline

  // only draw while the hero is on screen
  let onScreen = true
  const io = new IntersectionObserver((e) => (onScreen = e[0].isIntersecting))
  io.observe(canvas)
  const start = performance.now()
  const off = add(() => {
    if (!onScreen) return
    const t = (performance.now() - start) / 1000
    ptr.sx += (ptr.x - ptr.sx) * 0.05
    ptr.sy += (ptr.y - ptr.sy) * 0.05
    // a slow drift even without a mouse, so touch screens breathe too
    const dx = ptr.sx + Math.sin(t * 0.23) * 0.15, dy = ptr.sy + Math.cos(t * 0.19) * 0.1
    gl.uniform1f(uTime, t)
    gl.uniform1f(uIntro, Math.min(t / 1.6, 1))
    gl.uniform2f(uPtr, ptr.sx, ptr.sy)
    gl.uniform2f(uPar, dx, dy)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    // the front layer lives on the focus plane: it only breathes a hair with the camera
    if (front) front.style.transform = `translate3d(${(-dx * 2).toFixed(2)}px, ${(dy * 2).toFixed(2)}px, 0)`
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

/* ================================================================
   سرآغازِ سه‌بعدیِ «قصر فارسی»
   قصری از زمین برمی‌خیزد و ساخته می‌شود؛ درش نور می‌گیرد و از دلِ آن
   حروفِ فارسی و هزاران ذرّهٔ طلایی به پرواز درمی‌آیند و در آسمان بیتِ
   فردوسی را می‌سازند:  «پی افکندم از نظم کاخی بلند / که از باد و باران نیابد گزند»
   همه‌چیز تابعِ زمانِ T است؛ پس از پایان، صحنه آرام زنده می‌ماند.
   ================================================================ */
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'

const section = document.getElementById('intro')
const canvas = document.getElementById('intro3d')
const VERSE = ['پی افکندم از نظم کاخی بلند', 'که از باد و باران نیابد گزند']
const LETTERS = 'ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی'.split('')
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const small = Math.min(innerWidth, innerHeight) < 700
const GOLD = new THREE.Color('#f2c96b')

/* ── زمان‌بندی ── */
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const pr = (t, a, b) => cl((t - a) / (b - a))
const eo = (p) => 1 - Math.pow(1 - p, 3)
const eio = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
const back = (p) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2) }
const lerp = (a, b, p) => a + (b - a) * p
const rnd = ((s) => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646)(1404)
const END = 13.5            // پایانِ سکانس؛ پس از آن صحنه فقط «زنده» می‌ماند

function fail() { section.classList.remove('loading'); section.classList.add('no3d') }

try { start() } catch (e) { console.warn('intro3d', e); fail() }

async function start() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 1.75))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#050816')
  scene.fog = new THREE.FogExp2('#070b1f', 0.0105)
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 600)

  /* ── نور ── */
  scene.add(new THREE.HemisphereLight('#4656b8', '#05060d', 0.9))
  const moonLight = new THREE.DirectionalLight('#a9bcff', 1.6)
  moonLight.position.set(-30, 40, 25); scene.add(moonLight)
  const doorLight = new THREE.PointLight('#ffc768', 0, 60, 1.2)
  doorLight.position.set(0, 3, 4); scene.add(doorLight)
  const upL = new THREE.PointLight('#ffad4a', 0, 26, 1.3); upL.position.set(-6, 0.6, 8); scene.add(upL)
  const upR = new THREE.PointLight('#ffad4a', 0, 26, 1.3); upR.position.set(6, 0.6, 8); scene.add(upR)

  /* ── آسمان: ستاره‌ها و ماه ── */
  const starGeo = new THREE.BufferGeometry()
  const SN = small ? 1400 : 2600, sp = new Float32Array(SN * 3)
  for (let i = 0; i < SN; i++) {
    const th = rnd() * Math.PI * 2, ph = Math.acos(rnd() * 0.9 + 0.1), r = 260
    sp.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) - 20, r * Math.sin(ph) * Math.sin(th)], i * 3)
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3))
  const dot = dotTexture()
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 1.6, map: dot, transparent: true, depthWrite: false, color: '#dfe6ff', opacity: 0 }))
  scene.add(stars)
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTexture(), transparent: true, depthWrite: false, opacity: 0 }))
  moon.scale.set(26, 26, 1); moon.position.set(-58, 62, -120); scene.add(moon)

  /* ── زمین ── */
  const ground = new THREE.Mesh(new THREE.CircleGeometry(160, 64), new THREE.MeshStandardMaterial({ color: '#070b1d', metalness: 0.45, roughness: 0.6 }))
  ground.rotation.x = -Math.PI / 2; scene.add(ground)
  const rings = []
  for (let k = 1; k <= 9; k++) {
    const r = k * 4.2
    const g = new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, r, r).getPoints(120).map((p) => new THREE.Vector3(p.x, 0.02, p.y)))
    const m = new THREE.Line(g, new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0, toneMapped: false }))
    m.userData.r = r; rings.push(m); scene.add(m)
  }

  /* ── مصالح ── */
  const girih = girihTexture()
  const tileMat = (repeat, color = '#ffffff') => {
    const map = girih.clone(); map.needsUpdate = true
    map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(repeat, repeat)
    return new THREE.MeshStandardMaterial({ map, color, roughness: 0.62, metalness: 0.18, emissive: '#0d1640', emissiveIntensity: 0.35 })
  }
  const stone = new THREE.MeshStandardMaterial({ color: '#1a2350', roughness: 0.75, metalness: 0.15 })
  const domeMat = new THREE.MeshStandardMaterial({ color: '#1b7fa3', roughness: 0.3, metalness: 0.35, emissive: '#0b3b5a', emissiveIntensity: 0.45 })
  const goldMat = new THREE.MeshStandardMaterial({ color: '#e9b64f', roughness: 0.25, metalness: 0.9, emissive: '#7a4a10', emissiveIntensity: 0.6 })
  const edgeMat = () => new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0, toneMapped: false })

  /* ── قصر ── */
  const palace = new THREE.Group(); scene.add(palace)
  const parts = []
  /** یک قطعه؛ ریشه در y=0 تا با «بالا آمدن» از دلِ زمین ساخته شود */
  function part(mesh, { x = 0, y = 0, z = 0, delay = 0, dur = 1.2, mode = 'rise', edges = true, h = 4 } = {}) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.add(mesh)
    if (edges && mesh.geometry) {
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 30), edgeMat())
      e.position.copy(mesh.position); e.rotation.copy(mesh.rotation); e.scale.copy(mesh.scale)
      g.add(e); g.userData.edges = e
    }
    g.userData = { ...g.userData, base: y, delay, dur, mode, h }
    palace.add(g); parts.push(g); return g
  }
  const box = (w, h, d, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.y = h / 2; return m }

  // سکّو
  part(box(34, 0.5, 18, stone), { delay: 0.5, dur: 1, h: 0.6 })
  part(box(31, 0.45, 15.5, stone), { y: 0.5, delay: 0.75, dur: 1, h: 0.6 })
  const B = 0.95 // ترازِ روی سکّو

  // تالارِ اصلی و بال‌ها
  part(box(14, 7.6, 8, tileMat(0.18)), { y: B, z: -2, delay: 1.1, h: 8.6 })
  for (const s of [-1, 1]) {
    part(box(6.2, 5.2, 7, tileMat(0.2)), { x: s * 10.4, y: B, z: -1.6, delay: 1.5, h: 6.2 })
    part(archFacade(6.2, 6, 3, 4.4, 0.9, tileMat(0.2)), { x: s * 10.4, y: B, z: 1.9, delay: 1.7, h: 7 })
  }
  // پیش‌طاقِ بزرگ (ایوان)
  part(archFacade(9.6, 11.6, 5.2, 8.4, 2.2, tileMat(0.16)), { y: B, z: 2, delay: 1.9, dur: 1.4, h: 12.6 })
  // قابِ طلاییِ درونِ طاق
  part(archFrame(5.6, 8.8, 0.22), { y: B, z: 4.25, delay: 2.4, dur: 1, h: 10, edges: false })

  // درِ نورانی
  const doorMat = new THREE.MeshStandardMaterial({ color: '#2a1a05', emissive: '#ffbf5a', emissiveIntensity: 0.15, toneMapped: true })
  const doorShape = new THREE.Shape(); archPath(doorShape, 0, 0, 2.6, 4.8)
  const door = new THREE.Mesh(new THREE.ShapeGeometry(doorShape, 24), doorMat)
  part(door, { y: B, z: 2.03, delay: 2.2, h: 6, edges: false })

  // ساقه و گنبد
  part(new THREE.Mesh(new THREE.CylinderGeometry(3.7, 3.9, 2, 48, 1, false), tileMat(0.25)).translateY(1), { y: B + 7.6, z: -2, delay: 3.0, dur: 1, h: 3 })
  const dome = part(onion(4.3, 7.6, domeMat), { y: B + 9.6, z: -2, delay: 3.5, dur: 1.5, mode: 'drop', h: 10, edges: false })
  addRibs(dome, 4.3, 7.6, 16)
  part(finial(1.2), { y: B + 17.2, z: -2, delay: 4.6, dur: 0.9, mode: 'drop', h: 6, edges: false })

  // مناره‌ها
  for (const s of [-1, 1]) {
    part(minaret(14.5, 0.55), { x: s * 5.75, y: B, z: 3.2, delay: 2.7, dur: 1.8, mode: 'grow', h: 15, edges: false })
    part(minaret(9, 0.42), { x: s * 14, y: B, z: 1.2, delay: 3.2, dur: 1.5, mode: 'grow', h: 10, edges: false })
    const sd = part(onion(1.9, 3.4, domeMat), { x: s * 10.4, y: B + 5.2, z: -1.6, delay: 3.9, dur: 1.2, mode: 'drop', h: 6, edges: false })
    addRibs(sd, 1.9, 3.4, 10)
  }

  /* ── گردِ طلاییِ معلّق ── */
  const DN = small ? 260 : 520
  const dGeo = new THREE.BufferGeometry(), dPos = new Float32Array(DN * 3), dSeed = new Float32Array(DN)
  for (let i = 0; i < DN; i++) { dPos.set([(rnd() - 0.5) * 70, rnd() * 30, (rnd() - 0.5) * 50], i * 3); dSeed[i] = rnd() * 100 }
  dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3))
  const dustMat = new THREE.PointsMaterial({ size: 0.28, map: dot, color: '#ffd98a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })
  const dust = new THREE.Points(dGeo, dustMat); scene.add(dust)

  /* ── چیدمانِ بیت و دوربین ── */
  try { await Promise.race([Promise.all(['130px Nastaliq', '100px Lalezar', '80px Vazirmatn'].map((f) => document.fonts.load(f, 'قصر فارسی'))), new Promise((r) => setTimeout(r, 2500))]) } catch {}
  let portrait = innerWidth / innerHeight < 1
  const verse = buildVerse(portrait)
  scene.add(verse.mesh)
  const particles = buildParticles(verse, small ? 5200 : 9500)
  scene.add(particles.points)
  const flyers = buildFlyers(small ? 40 : 72, verse)

  /* ── پس‌پردازش: درخشش ── */
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), small ? 0.6 : 0.7, 0.45, 0.82)
  composer.addPass(bloom)
  composer.addPass(new OutputPass())

  /* ── اندازه ── */
  let camDist = 60
  function resize() {
    const w = section.clientWidth, h = section.clientHeight
    renderer.setSize(w, h, false); composer.setSize(w, h)
    bloom.resolution.set(w / 2, h / 2)
    camera.aspect = w / h; camera.updateProjectionMatrix()
    const halfW = Math.max(18, verse.width / 2 + 1.5)
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    camDist = (camera.aspect > 1 ? 1.3 : 1.12) * Math.max(halfW / (tan * camera.aspect), (verse.top + 1.5) / 2 / tan + 6)
  }
  addEventListener('resize', resize); resize()

  /* ── موس: کمی جابه‌جاییِ دوربین ── */
  let mx = 0, my = 0, tmx = 0, tmy = 0
  addEventListener('pointermove', (e) => { tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5 }, { passive: true })

  /* ── پخش ── */
  let T = reduce ? END : 0, last = performance.now(), visible = true, raf = 0
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(loop) } }).observe(section)
  document.getElementById('intro-replay')?.addEventListener('click', () => { T = 0; section.classList.remove('done') })
  section.classList.remove('loading'); section.classList.add('ready')
  /* برای بازبینی و گرفتنِ تصویر: رفتن به یک لحظهٔ مشخّص */
  window.__intro = { seek(t) { T = t; update(T); composer.render() } }

  function loop(now) {
    raf = 0
    if (!visible || document.hidden) return   // IntersectionObserver و visibilitychange دوباره راهش می‌اندازند
    T += Math.min(0.05, (now - last) / 1000); last = now
    update(T)
    composer.render()
    raf = requestAnimationFrame(loop)
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !raf) { last = performance.now(); raf = requestAnimationFrame(loop) } })
  raf = requestAnimationFrame(loop)

  /* ================= به‌روزرسانیِ هر فریم ================= */
  function update(t) {
    const fadeIn = eo(pr(t, 0, 1.6))
    stars.material.opacity = fadeIn
    stars.rotation.y = t * 0.004
    moon.material.opacity = eo(pr(t, 0.4, 2.4))
    renderer.toneMappingExposure = 0.2 + 0.85 * fadeIn

    // حلقه‌های طلاییِ زمین از مرکز روشن می‌شوند و آرام می‌مانند
    for (const r of rings) {
      const p = pr(t, 0.2 + r.userData.r * 0.04, 0.8 + r.userData.r * 0.04)
      r.material.opacity = (Math.sin(p * Math.PI) * 0.9 + p * 0.12) * (1 - r.userData.r / 50)
    }

    // ساختِ قصر
    for (const g of parts) {
      const { delay, dur, mode, base, h } = g.userData
      const p = pr(t, delay, delay + dur)
      if (mode === 'rise') g.position.y = base - h * (1 - eo(p))
      else if (mode === 'grow') g.scale.y = Math.max(0.001, eo(p))
      else if (mode === 'drop') { g.position.y = base + 14 * (1 - back(p)); g.visible = p > 0 }
      if (g.userData.edges) g.userData.edges.material.opacity = cl(p * 1.6) * (0.55 + 0.45 * Math.sin(p * Math.PI))
    }
    // نورِ پایِ دیوار و در
    const lit = eo(pr(t, 2.2, 4.5))
    upL.intensity = upR.intensity = 12 * lit
    const glow = eo(pr(t, 5.2, 6.6))
    doorMat.emissiveIntensity = 0.15 + 1.5 * glow + (t > 6.6 ? 0.25 * Math.sin(t * 2.2) : 0)
    doorLight.intensity = 4 + 60 * glow * (1 - 0.5 * pr(t, 9, 12))
    dustMat.opacity = 0.75 * eo(pr(t, 1, 3))
    const pa = dGeo.attributes.position.array
    for (let i = 0; i < DN; i++) { pa[i * 3 + 1] = (dSeed[i] * 0.3 + t * 0.35) % 30; pa[i * 3] += Math.sin(t * 0.6 + dSeed[i]) * 0.004 }
    dGeo.attributes.position.needsUpdate = true

    // ذرّه‌ها و حروف
    particles.mat.uniforms.uT.value = t
    particles.mat.uniforms.uFade.value = 1 - 0.55 * pr(t, 11.8, 13)
    updateFlyers(t)
    verse.mat.opacity = eo(pr(t, 11.2, 12.6))

    // دوربین: از دور و پایین، گردشِ آرام، سپس روبه‌روی بیت
    mx += (tmx - mx) * 0.04; my += (tmy - my) * 0.04
    const a = lerp(0.55, 0, eio(pr(t, 0, 9))) + Math.sin(t * 0.12) * 0.05 * pr(t, END - 1, END + 2)
    const d = lerp(camDist * 1.15, camDist, eio(pr(t, 0, 10)))
    const ch = lerp(3.5, 9.5, eio(pr(t, 0, 7))) + lerp(0, verse.lift, eio(pr(t, 7, 11.5)))
    camera.position.set(Math.sin(a) * d - mx * 3, ch - my * 2, Math.cos(a) * d)
    camera.lookAt(0, lerp(6.5, verse.lookY, eio(pr(t, 6.5, 11.5))), 0)

    if (t > END && !section.classList.contains('done')) section.classList.add('done')
  }

  /* ================= سازنده‌ها ================= */
  function archPath(p, cx, y0, w, h) {
    const r = w / 2, spring = y0 + h - w * 0.72
    p.moveTo(cx - r, y0); p.lineTo(cx - r, spring)
    p.bezierCurveTo(cx - r, spring + w * 0.42, cx - r * 0.3, y0 + h - w * 0.1, cx, y0 + h)
    p.bezierCurveTo(cx + r * 0.3, y0 + h - w * 0.1, cx + r, spring + w * 0.42, cx + r, spring)
    p.lineTo(cx + r, y0)
  }
  /** نمای طاق‌دار: مستطیلی که طاقی تیزه‌دار از پایینش بریده شده */
  function archFacade(W, H, aw, ah, depth, mat) {
    const s = new THREE.Shape()
    s.moveTo(-W / 2, 0); s.lineTo(-aw / 2, 0)
    const r = aw / 2, spring = ah - aw * 0.72
    s.lineTo(-r, spring)
    s.bezierCurveTo(-r, spring + aw * 0.42, -r * 0.3, ah - aw * 0.1, 0, ah)
    s.bezierCurveTo(r * 0.3, ah - aw * 0.1, r, spring + aw * 0.42, r, spring)
    s.lineTo(r, 0); s.lineTo(W / 2, 0); s.lineTo(W / 2, H); s.lineTo(-W / 2, H); s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 2, curveSegments: 28 })
    return new THREE.Mesh(g, mat)
  }
  function archFrame(aw, ah, th) {
    const pts = new THREE.Path(); archPath(pts, 0, 0, aw, ah)
    const curve = new THREE.CurvePath()
    const p2 = pts.getPoints(80).map((p) => new THREE.Vector3(p.x, p.y, 0))
    curve.add(new THREE.CatmullRomCurve3(p2))
    return new THREE.Mesh(new THREE.TubeGeometry(curve.curves[0], 160, th, 8, false), goldMat)
  }
  function onion(R, H, mat) {
    const prof = [[1, 0], [1.06, 0.08], [1.16, 0.22], [1.18, 0.34], [1.08, 0.48], [0.86, 0.62], [0.56, 0.76], [0.3, 0.88], [0.1, 0.97], [0.0, 1]]
    const curve = new THREE.SplineCurve(prof.map(([x, y]) => new THREE.Vector2(x * R * 0.86, y * H)))
    const pts = curve.getPoints(48); pts[pts.length - 1].x = 0
    return new THREE.Mesh(new THREE.LatheGeometry(pts, 64), mat)
  }
  function addRibs(group, R, H, n) {
    const prof = [[1, 0], [1.06, 0.08], [1.16, 0.22], [1.18, 0.34], [1.08, 0.48], [0.86, 0.62], [0.56, 0.76], [0.3, 0.88], [0.1, 0.97], [0.0, 1]]
    const base = new THREE.SplineCurve(prof.map(([x, y]) => new THREE.Vector2(x * R * 0.86 * 1.01, y * H))).getPoints(48)
    const pos = []
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2
      for (let i = 0; i < base.length - 1; i++) {
        const p = base[i], q = base[i + 1]
        pos.push(Math.cos(a) * p.x, p.y, Math.sin(a) * p.x, Math.cos(a) * q.x, q.y, Math.sin(a) * q.x)
      }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    const l = new THREE.LineSegments(g, edgeMat()); group.add(l); group.userData.edges = l
  }
  function finial(s) {
    const g = new THREE.Group()
    const a = new THREE.Mesh(new THREE.SphereGeometry(0.32 * s, 20, 14), goldMat); a.position.y = 0.3 * s
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.22 * s, 20, 14), goldMat); b.position.y = 0.85 * s
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.08 * s, 1.4 * s, 12), goldMat); c.position.y = 1.7 * s
    g.add(a, b, c); return g
  }
  function minaret(H, r) {
    const g = new THREE.Group()
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.85, r, H, 28), tileMat(0.5)); shaft.position.y = H / 2
    g.add(shaft)
    for (const f of [0.62, 0.84]) {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.55, r * 1.2, 0.36, 28), goldMat); ring.position.y = H * f; g.add(ring)
    }
    const band = new THREE.Mesh(new THREE.TorusGeometry(r * 0.95, 0.05, 6, 32), goldMat); band.rotation.x = Math.PI / 2; band.position.y = H * 0.3; g.add(band)
    const cap = onion(r * 1.3, r * 3, domeMat); cap.position.y = H; g.add(cap)
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 1.1, 8), goldMat); tip.position.y = H + r * 3 + 0.45; g.add(tip)
    return g
  }

  /* بیت: یک بافتِ نستعلیقِ طلایی + نقاطِ نمونه‌برداری‌شده برای ذرّه‌ها */
  function buildVerse(stacked) {
    const PX = 120, scale = 38 // پیکسل در هر واحدِ جهان
    const c = document.createElement('canvas'), x = c.getContext('2d')
    const font = `${PX}px Nastaliq, Vazirmatn, serif`
    x.font = font
    const w1 = x.measureText(VERSE[0]).width, w2 = x.measureText(VERSE[1]).width
    const gap = PX * 1.2, lineH = PX * 2.3, pad = PX * 0.9
    c.width = Math.ceil(stacked ? Math.max(w1, w2) + pad * 2 : w1 + w2 + gap + pad * 2)
    c.height = Math.ceil(stacked ? lineH * 2 + pad : lineH + pad)
    const lines = stacked
      ? [[VERSE[0], c.width / 2, pad / 2 + lineH * 0.62], [VERSE[1], c.width / 2, pad / 2 + lineH * 1.62]]
      : [[VERSE[0], c.width - pad - w1 / 2, c.height * 0.58], [VERSE[1], pad + w2 / 2, c.height * 0.58]]
    const draw = (ctx, glow) => {
      ctx.clearRect(0, 0, c.width, c.height)
      ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'rtl'
      const g = ctx.createLinearGradient(0, 0, 0, c.height)
      g.addColorStop(0, '#fff3c8'); g.addColorStop(0.5, '#f2c96b'); g.addColorStop(1, '#d99a2f')
      ctx.fillStyle = g
      if (glow) { ctx.shadowColor = 'rgba(255,200,100,.85)'; ctx.shadowBlur = 26 }
      for (const [s, lx, ly] of lines) ctx.fillText(s, lx, ly)
    }
    // نمونه‌برداری (بی‌سایه)
    draw(x, false)
    const data = x.getImageData(0, 0, c.width, c.height).data
    const pts = [], step = small ? 4 : 3
    for (let yy = 0; yy < c.height; yy += step) for (let xx = 0; xx < c.width; xx += step) {
      if (data[(yy * c.width + xx) * 4 + 3] > 120) pts.push([xx, yy])
    }
    draw(x, true)
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4
    const W = c.width / scale, H = c.height / scale
    const cy = 16.5 + H / 2, cz = 3
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(W, H), mat)
    mesh.position.set(0, cy, cz)
    const targets = pts.map(([px, py]) => [(px - c.width / 2) / scale, cy - (py - c.height / 2) / scale, cz])
    return { mesh, mat, targets, width: W, top: cy + H / 2, lookY: (cy + H / 2) * (stacked ? 0.48 : 0.42), lift: stacked ? 4 : 2.5 }
  }

  function buildParticles(v, N) {
    const n = Math.min(N, v.targets.length * 2)
    const start = new Float32Array(n * 3), ctrl = new Float32Array(n * 3), target = new Float32Array(n * 3), seed = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const tg = v.targets[(Math.random() * v.targets.length) | 0]
      start.set([(rnd() - 0.5) * 2.2, B + 0.4 + rnd() * 4.2, 2.4 + rnd() * 0.6], i * 3)
      const a = rnd() * Math.PI * 2, r = 7 + rnd() * 12
      ctrl.set([Math.cos(a) * r, 5 + rnd() * 18, 6 + Math.sin(a) * r * 0.8], i * 3)
      target.set([tg[0] + (rnd() - 0.5) * 0.06, tg[1] + (rnd() - 0.5) * 0.06, tg[2] + (rnd() - 0.5) * 0.25], i * 3)
      seed[i] = rnd()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(target, 3))
    g.setAttribute('aStart', new THREE.BufferAttribute(start, 3))
    g.setAttribute('aCtrl', new THREE.BufferAttribute(ctrl, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
      uniforms: { uT: { value: 0 }, uFade: { value: 1 }, uSize: { value: (small ? 34 : 42) * renderer.getPixelRatio() }, uMap: { value: dot } },
      vertexShader: `
        attribute vec3 aStart; attribute vec3 aCtrl; attribute float aSeed;
        uniform float uT; uniform float uSize; varying float vA; varying float vHot;
        void main() {
          float t0 = 6.6 + aSeed * 2.8;
          float p = clamp((uT - t0) / 2.6, 0.0, 1.0);
          float e = p < .5 ? 4.*p*p*p : 1. - pow(-2.*p + 2., 3.) / 2.;
          vec3 a = mix(aStart, aCtrl, e), b = mix(aCtrl, position, e);
          vec3 pos = mix(a, b, e);
          float settle = smoothstep(.98, 1., p);
          pos += settle * vec3(sin(uT * 1.7 + aSeed * 40.) , cos(uT * 1.3 + aSeed * 30.), 0.) * .035;
          vA = step(0.0001, uT - t0) * (0.35 + 0.65 * (1. - settle * .4));
          vHot = 1. - p;
          vec4 mv = modelViewMatrix * vec4(pos, 1.);
          gl_PointSize = uSize * (0.35 + 0.65 * fract(aSeed * 13.7)) * (1. + vHot * 1.4) / -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform sampler2D uMap; uniform float uFade; varying float vA; varying float vHot;
        void main() {
          float m = texture2D(uMap, gl_PointCoord).a;
          vec3 c = mix(vec3(1., .78, .38), vec3(1., .97, .85), vHot * .8);
          gl_FragColor = vec4(c, m * vA * uFade);
        }`,
    })
    return { points: new THREE.Points(g, mat), mat }
  }

  function buildFlyers(n, v) {
    const tex = {}
    const list = []
    for (let i = 0; i < n; i++) {
      const ch = LETTERS[i % LETTERS.length]
      if (!tex[ch]) tex[ch] = letterTexture(ch)
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex[ch], transparent: true, depthWrite: false, opacity: 0, toneMapped: false, blending: THREE.AdditiveBlending }))
      const tg = v.targets[(rnd() * v.targets.length) | 0]
      s.userData = { t0: 6.4 + rnd() * 2.2, a0: rnd() * Math.PI * 2, dir: rnd() < 0.5 ? -1 : 1, R: 9 + rnd() * 9, Y: 7 + rnd() * 14, tg, size: 1.4 + rnd() * 1.6, spin: (rnd() - 0.5) * 2 }
      scene.add(s); list.push(s)
    }
    return list
  }
  function updateFlyers(t) {
    for (const s of flyers) {
      const u = s.userData
      const p = pr(t, u.t0, u.t0 + 4.6)
      if (p <= 0 || p >= 1) { s.visible = false; continue }
      s.visible = true
      const e = eo(p)
      const ang = u.a0 + u.dir * e * Math.PI * 2.1
      const r = lerp(0.6, u.R, eo(cl(p * 1.6)))
      let x = Math.cos(ang) * r, y = lerp(B + 2.5, u.Y, eo(cl(p * 1.3))), z = 3 + Math.sin(ang) * r * 0.75
      const k = eio(pr(p, 0.62, 1))       // پایان: فرورفتن در بیت
      x = lerp(x, u.tg[0], k); y = lerp(y, u.tg[1], k); z = lerp(z, u.tg[2], k)
      s.position.set(x, y, z)
      const sz = u.size * (1 - 0.85 * k)
      s.scale.set(sz, sz, 1)
      s.material.rotation = u.spin * (1 - k) * Math.sin(t)
      s.material.opacity = Math.min(1, p * 8) * (1 - pr(p, 0.85, 1))
    }
  }

  /* ── بافت‌ها ── */
  function dotTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 64
    const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.75)'); g.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = g; x.fillRect(0, 0, 64, 64)
    return new THREE.CanvasTexture(c)
  }
  function moonTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 256
    const x = c.getContext('2d')
    let g = x.createRadialGradient(128, 128, 30, 128, 128, 128)
    g.addColorStop(0, 'rgba(255,240,200,.55)'); g.addColorStop(1, 'rgba(255,240,200,0)')
    x.fillStyle = g; x.fillRect(0, 0, 256, 256)
    g = x.createRadialGradient(112, 112, 4, 128, 128, 44)
    g.addColorStop(0, '#fffdf4'); g.addColorStop(0.7, '#f1dfae'); g.addColorStop(1, '#d6b46a')
    x.fillStyle = g; x.beginPath(); x.arc(128, 128, 44, 0, 6.283); x.fill()
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
  }
  function letterTexture(ch) {
    const c = document.createElement('canvas'); c.width = c.height = 128
    const x = c.getContext('2d')
    x.font = '84px Lalezar, Vazirmatn, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'
    x.shadowColor = 'rgba(255,190,80,.95)'; x.shadowBlur = 18
    x.fillStyle = '#ffe4a0'; x.fillText(ch, 64, 70)
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
  }
  /** کاشیِ گره: ستارهٔ هشت‌پر، لاجوردی و فیروزه‌ای با خطِ طلایی */
  function girihTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 256
    const x = c.getContext('2d')
    x.fillStyle = '#1b2a66'; x.fillRect(0, 0, 256, 256)
    const star = (cx, cy, r, fill) => {
      x.beginPath()
      for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, rr = i % 2 ? r * 0.55 : r; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) }
      x.closePath(); x.fillStyle = fill; x.fill(); x.strokeStyle = '#d9a845'; x.lineWidth = 3; x.stroke()
    }
    for (const [cx, cy] of [[0, 0], [256, 0], [0, 256], [256, 256], [128, 128]]) star(cx, cy, 70, '#1f7fa6')
    for (const [cx, cy] of [[128, 0], [0, 128], [256, 128], [128, 256]]) star(cx, cy, 36, '#2b3f8f')
    x.strokeStyle = 'rgba(217,168,69,.55)'; x.lineWidth = 2
    x.beginPath(); x.moveTo(0, 0); x.lineTo(256, 256); x.moveTo(256, 0); x.lineTo(0, 256); x.stroke()
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t
  }
}

/* ================================================================
   قصر فارسی — رفتار و جلوه‌های متحرک
   ================================================================ */
(() => {
  const C = window.QASR || {}
  const root = document.documentElement
  root.classList.add('js')
  const $ = (s, el = document) => el.querySelector(s)
  const $$ = (s, el = document) => [...el.querySelectorAll(s)]
  const fa = (n) => Number(n).toLocaleString('fa-IR')
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

  /* ── سرآغازِ سه‌بعدی: اگر مرورگر importmap یا WebGL را نداشت یا بالا نیامد، کنار برود ── */
  const intro = $('#intro')
  if (intro) {
    const gl = (() => { try { return !!document.createElement('canvas').getContext('webgl2') } catch { return false } })()
    const im = !!(HTMLScriptElement.supports && HTMLScriptElement.supports('importmap'))
    if (!gl || !im) intro.classList.add('no3d')
    else setTimeout(() => { if (!intro.classList.contains('ready')) intro.classList.add('no3d') }, 9000)
  }

  /* ── پیوندها ── */
  $$('[data-app]').forEach((a) => { a.href = C.appUrl || '#'; a.rel = 'noopener' })
  $$('[data-buy]').forEach((a) => { if (C.bazaarUrl) { a.href = C.bazaarUrl; a.rel = 'noopener'; a.target = '_blank' } })
  if (C.bazaarUrl) $('#buy-note').textContent = 'خرید از طریقِ کافه‌بازار انجام می‌شود؛ پس از پرداخت، درس‌ها در اپ باز می‌شوند.'
  for (const k of ['half', 'full']) {
    const v = C.prices && C.prices[k]
    const el = $(`[data-price="${k}"]`)
    if (el && v) el.innerHTML = `<b>${fa(v)}</b> تومان <small>/ ۶ ماه</small>`
  }
  try { $('#year').textContent = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric' }).format(new Date()).replace(/[^۰-۹]/g, '') } catch {}

  /* ── سربرگ، نوارِ پیشرفت، فهرست ── */
  const top = $('#top')
  const bar = document.createElement('div'); bar.className = 'progress'; document.body.append(bar)
  const onScroll = () => {
    top.classList.toggle('solid', scrollY > 40)
    const h = document.documentElement.scrollHeight - innerHeight
    bar.style.setProperty('--sp', h > 0 ? (scrollY / h).toFixed(4) : 0)
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll()

  const nav = $('#nav'), menu = $('#menu')
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open')
    menu.setAttribute('aria-expanded', open)
  })
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false') } })

  $('#theme').addEventListener('click', () => {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches
    root.dataset.theme = dark ? 'light' : 'dark'
    try { localStorage.setItem('qasr-theme', root.dataset.theme) } catch {}
  })

  /* ── سرآغاز: عنوان، بیت، طاقِ قصر ── */
  const h1 = $('[data-split]')
  if (h1 && !reduce) {
    // واژه‌به‌واژه (نه حرف‌به‌حرف) تا پیوستگیِ حروفِ فارسی نشکند
    h1.innerHTML = h1.textContent.trim().split(/\s+/).map((w, i) => `<span class="ch" style="--i:${i}">${esc(w)}</span>`).join(' ')
    h1.classList.add('split')
  }
  const verse = $('[data-words]')
  if (verse) {
    let i = 0
    verse.innerHTML = verse.innerHTML.split('<br>').map((line) =>
      line.trim().split(/\s+/).map((w) => `<span class="w" style="--i:${i++}">${w}</span>`).join(' ')).join('<br>')
  }
  $$('.palace .draw path').forEach((p, i) => {
    let len = 2000
    try { len = Math.ceil(p.getTotalLength()) } catch {}
    p.style.setProperty('--len', len)
    p.style.setProperty('--d', `${0.15 * i}s`)
  })
  requestAnimationFrame(() => requestAnimationFrame(() => $('.hero').classList.add('ready')))

  /* ── آسمانِ ذره‌ای: ستاره‌های چشمک‌زن، غبارِ طلایی و حروفِ شناور ── */
  const cv = $('#sky')
  if (cv && !reduce) {
    const ctx = cv.getContext('2d')
    const LETTERS = 'ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی'.split('')
    const WORDS = ['فارسی', 'قصر', 'ادب', 'عشق', 'دانش', 'سخن', 'دل', 'جان', 'مهر', 'نور', 'خرد', 'شعر']
    let W = 0, H = 0, dpr = 1, stars = [], dust = [], glyphs = [], mx = 0, my = 0, tx = 0, ty = 0, raf = 0, visible = true
    const rnd = (a, b) => a + Math.random() * (b - a)
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2)
      W = cv.clientWidth; H = cv.clientHeight
      cv.width = W * dpr; cv.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const k = Math.min(1, W / 1200)
      stars = Array.from({ length: Math.round(140 * k + 40) }, () => ({ x: rnd(0, W), y: rnd(0, H * .8), r: rnd(.3, 1.4), p: rnd(0, 6.28), s: rnd(.6, 2), z: rnd(.2, 1) }))
      dust = Array.from({ length: Math.round(60 * k + 20) }, () => newDust(true))
      glyphs = Array.from({ length: Math.round(12 * k + 5) }, () => newGlyph(true))
    }
    const newDust = (any) => ({ x: rnd(0, W), y: any ? rnd(0, H) : H + 10, r: rnd(.8, 2.6), v: rnd(.15, .55), a: rnd(.25, .8), w: rnd(0, 6.28), z: rnd(.3, 1) })
    const newGlyph = (any) => {
      const word = Math.random() < .35
      return { t: word ? WORDS[(Math.random() * WORDS.length) | 0] : LETTERS[(Math.random() * LETTERS.length) | 0], x: rnd(0, W), y: any ? rnd(0, H) : H + 60, size: word ? rnd(18, 34) : rnd(22, 54), v: rnd(.12, .35), rot: rnd(-.4, .4), vr: rnd(-.002, .002), a: rnd(.05, .16), z: rnd(.4, 1) }
    }
    const font = getComputedStyle(document.body).fontFamily
    let t = 0
    const frame = () => {
      raf = 0
      if (!visible || document.hidden) return
      t += 1
      tx += (mx - tx) * .05; ty += (my - ty) * .05
      ctx.clearRect(0, 0, W, H)
      // ستاره‌ها
      for (const s of stars) {
        const a = .35 + .65 * (0.5 + 0.5 * Math.sin(s.p + t * .02 * s.s))
        ctx.globalAlpha = a * .9
        ctx.fillStyle = '#fff'
        ctx.beginPath(); ctx.arc(s.x + tx * 14 * s.z, s.y + ty * 10 * s.z, s.r, 0, 6.283); ctx.fill()
      }
      // حروف
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      for (const g of glyphs) {
        g.y -= g.v; g.rot += g.vr
        if (g.y < -80) Object.assign(g, newGlyph(false))
        ctx.save()
        ctx.translate(g.x + tx * 26 * g.z, g.y + ty * 18 * g.z); ctx.rotate(g.rot)
        ctx.globalAlpha = g.a * Math.min(1, (H - g.y) / 200, (g.y + 80) / 200)
        ctx.fillStyle = '#e9c46a'
        ctx.font = `${g.size}px ${font}`
        ctx.fillText(g.t, 0, 0)
        ctx.restore()
      }
      // غبارِ طلایی
      for (const d of dust) {
        d.y -= d.v; d.w += .01; const x = d.x + Math.sin(d.w) * 12 + tx * 20 * d.z
        if (d.y < -10) Object.assign(d, newDust(false))
        const gr = ctx.createRadialGradient(x, d.y, 0, x, d.y, d.r * 4)
        gr.addColorStop(0, `rgba(246,226,168,${d.a})`); gr.addColorStop(1, 'rgba(246,226,168,0)')
        ctx.globalAlpha = 1; ctx.fillStyle = gr
        ctx.beginPath(); ctx.arc(x, d.y, d.r * 4, 0, 6.283); ctx.fill()
      }
      // شهابِ گاه‌به‌گاه
      if (t % 420 === 200) meteor = { x: rnd(W * .3, W), y: rnd(0, H * .3), l: 0 }
      if (meteor) {
        meteor.l += 1
        const p = meteor.l / 50, x = meteor.x - p * 260, y = meteor.y + p * 120
        const gr = ctx.createLinearGradient(x, y, x + 90, y - 42)
        gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.globalAlpha = 1 - p; ctx.strokeStyle = gr; ctx.lineWidth = 1.6
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 90, y - 42); ctx.stroke()
        if (p >= 1) meteor = null
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }
    let meteor = null
    const kick = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame) }
    resize(); kick()
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150) })
    document.addEventListener('visibilitychange', kick)
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick() }).observe(cv)
    if (finePointer) addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5 }, { passive: true })
  }

  /* ── گوشیِ نمایشی: کج‌شدن با موس و چرخشِ زبانه‌ها ── */
  const phone = $('.phone')
  if (phone && !reduce) {
    const tabs = $$('.ph-tabs span', phone), tabsBox = $('.ph-tabs', phone), screens = $$('.ph-screen', phone)
    let k = 0, paused = 0
    const show = (n) => {
      k = n
      tabs.forEach((s, i) => s.classList.toggle('on', i === k))
      screens.forEach((s, i) => s.classList.toggle('on', i === k))
      tabsBox.style.setProperty('--tab', k)
    }
    // زبانه‌ها خودشان می‌چرخند؛ با لمسِ یک زبانه، چرخش کمی صبر می‌کند
    tabs.forEach((t, i) => t.addEventListener('click', () => { show(i); paused = 2 }))
    setInterval(() => {
      if (document.hidden) return
      if (paused > 0) { paused--; return }
      show((k + 1) % tabs.length)
    }, 3200)
    if (finePointer) {
      const hero = $('.hero')
      hero.addEventListener('pointermove', (e) => {
        const r = phone.getBoundingClientRect()
        const x = (e.clientX - (r.left + r.width / 2)) / innerWidth
        const y = (e.clientY - (r.top + r.height / 2)) / innerHeight
        phone.style.transform = `perspective(900px) rotateY(${x * 22}deg) rotateX(${-y * 16}deg)`
      })
      hero.addEventListener('pointerleave', () => { phone.style.transform = '' })
    }
  }

  /* ── نورِ دنبال‌کنندهٔ موس روی کارت‌ها ── */
  if (finePointer) {
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest && e.target.closest('.glow')
      if (!card) return
      const r = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${e.clientX - r.left}px`)
      card.style.setProperty('--my', `${e.clientY - r.top}px`)
    }, { passive: true })
  }

  /* ── شمارنده‌ها ── */
  const counters = $$('[data-count]')
  const runCount = (el) => {
    const to = +el.dataset.count, plus = el.hasAttribute('data-plus') ? '+' : ''
    if (reduce) { el.textContent = plus + fa(to); return }
    const t0 = performance.now(), dur = 1800
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 4)
      el.textContent = plus + fa(Math.round(to * e))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  /* ── آشکارشدن با اسکرول (با تأخیرِ پله‌ای در هر گروه) ── */
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      const el = e.target
      if (el.classList.contains('reveal')) {
        const sibs = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'))
        el.style.setProperty('--rd', `${Math.min(sibs.indexOf(el), 6) * 90}ms`)
        el.classList.add('in')
      }
      if (el.matches('.steps')) el.classList.add('in')
      if (el.matches('#stats')) counters.forEach(runCount)
      io.unobserve(el)
    }
  }, { threshold: .15, rootMargin: '0px 0px -40px 0px' })
  const watch = () => $$('.reveal:not(.in), .steps, #stats').forEach((el) => io.observe(el))
  watch()

  /* ── پایه‌ها ── */
  const COLORS = { 7: ['#4f46e5', '#7c3aed'], 8: ['#0e7490', '#2563eb'], 9: ['#047857', '#0d9488'], 10: ['#b45309', '#db2777'], 11: ['#be123c', '#7c3aed'], 12: ['#1e293b', '#4338ca'] }
  const ORD = { 7: 'هفتم', 8: 'هشتم', 9: 'نهم', 10: 'دهم', 11: 'یازدهم', 12: 'دوازدهم' }
  fetch('curriculum.json?v=4f805cca').then((r) => r.json()).then((data) => {
    const box = $('#grade-list')
    let total = 0
    box.innerHTML = data.grades.map((g) => {
      const [c1, c2] = COLORS[g.id] || COLORS[7]
      total += g.lessons.length
      const units = [...new Set(g.lessons.map((l) => l.unit))].slice(0, 6)
      return `<article class="grade reveal" style="--c1:${c1};--c2:${c2}">
        <span class="grade-n">${fa(g.id)}</span>
        <h3>${esc(g.title)}</h3>
        <p>${esc(g.tagline)}</p>
        <ul class="chips"><li>${fa(g.lessons.length)} درس</li>${units.slice(1, 4).map((u) => `<li>${esc(u)}</li>`).join('')}</ul>
        <details>
          <summary>فهرستِ درس‌های پایهٔ ${ORD[g.id] || fa(g.id)}</summary>
          <ol class="lessons">${g.lessons.map((l) => `<li><b>${l.number ? fa(l.number) : '—'}</b><div>${esc(l.title)}${l.by ? `<span>${esc(l.by)}</span>` : ''}</div></li>`).join('')}</ol>
        </details>
      </article>`
    }).join('')
    const sl = $('#stat-lessons'); if (sl) sl.dataset.count = total
    watch()
    if (finePointer && !reduce) $$('.grade', box).forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        if (e.target.closest('details[open]')) { card.style.transform = ''; return }
        const r = card.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5
        card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`
      })
      card.addEventListener('pointerleave', () => { card.style.transform = '' })
    })
  }).catch(() => { $('#grade-list').innerHTML = '<p>فهرستِ درس‌ها بارگیری نشد.</p>' })


  /* ── دانلود ── */
  const bz = $('#dl-bazaar')
  if (C.bazaarUrl) { bz.href = C.bazaarUrl; bz.target = '_blank'; bz.rel = 'noopener'; bz.removeAttribute('aria-disabled'); $('#dl-bazaar-sub').textContent = 'دریافت از' }
  if (C.apkUrl) $('#dl-apk').href = C.apkUrl
  const DLI = '<span class="dl"><svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg></span>'
  const fileCard = (f) => {
    const [c1, c2] = COLORS[f.grade] || COLORS[7]
    return `<a class="file reveal" href="${esc(f.file)}" download style="--c1:${c1};--c2:${c2}">
      <span class="file-ico" data-g="${f.grade ? fa(f.grade) : '★'}">PDF</span>
      <span><b>${esc(f.title)}</b><small>${esc(f.note || '')}</small></span>${DLI}</a>`
  }
  fetch('downloads/list.json').then((r) => r.json()).catch(() => []).then((auto) => {
    const files = [
      ...auto.map((f) => ({ file: `downloads/${f.file}`, grade: f.grade, title: `جزوهٔ ستایش — پایهٔ ${ORD[f.grade]}`, note: `«${f.title}» · ${fa(f.kb)} کیلوبایت` })),
      ...(C.downloads || []),
    ]
    $('#files').innerHTML = files.map(fileCard).join('')
    watch()
  })

  /* ── اشتراک‌گذاری ── */
  const url = C.siteUrl || location.href.split('#')[0]
  const msg = 'قصر فارسی (با ملیحه قصرانی) — آموزشِ کاملِ فارسیِ هفتم تا دوازدهم با معنیِ بیت‌به‌بیت، تمرین، آزمون و صدای معلّم:'
  $('#sh-tg').href = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(msg)}`
  $('#sh-wa').href = `https://wa.me/?text=${encodeURIComponent(msg + '\n' + url)}`
  $('#sh-eitaa').href = `https://eitaa.com/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(msg)}`
  const toast = (t) => {
    let el = $('.toast'); if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.append(el) }
    el.textContent = t; el.classList.add('show'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 2200)
  }
  $('#sh-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(url); toast('نشانی کپی شد') } catch { prompt('نشانی را کپی کنید:', url) }
  })
  if (navigator.share) {
    const b = $('#sh-native'); b.hidden = false
    b.addEventListener('click', () => navigator.share({ title: 'قصر فارسی', text: msg, url }).catch(() => {}))
  }



  /* ── جعبهٔ لایتنرِ نمایشی ── */
  const lt = $('#lt')
  if (lt) {
    const DECK = [
      ['واژه', 'سپهر', 'آسمان', 'ستایشِ نهم'],
      ['واژه', 'مونس', 'همدم، همراه', 'ستایشِ هفتم'],
      ['آرایه', '«دوستِ خوب، کیمیاست»', 'تشبیهِ بلیغ', 'درسِ چهارمِ هفتم'],
      ['واژه', 'بُرنا', 'جوان', 'ستایشِ نهم'],
      ['آرایه', '«کوته ز دَرَت، درازدستی»', 'تضاد و کنایه', 'ستایشِ هفتم'],
      ['واژه', 'کیوان', 'سیارهٔ زحل', 'ستایشِ نهم'],
      ['بیت', 'توانا بُوَد هر که دانا بُوَد…', 'دانایی مایهٔ توانایی است', 'فردوسی'],
    ]
    const boxEls = $$('.lt-box', lt), card = $('#lt-card', lt)
    const box = DECK.map(() => 0)
    let cur = 0
    const paintBoxes = (bump) => {
      boxEls.forEach((el, i) => {
        $('b', el).textContent = fa(box.filter((b) => b === i).length)
        if (i === bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); setTimeout(() => el.classList.remove('bump'), 450) }
      })
    }
    const paintCard = () => {
      const [kind, front, back, src] = DECK[cur]
      $('.lt-front small', card).textContent = kind
      $('.lt-front b', card).textContent = front
      $('.lt-back small', card).textContent = kind === 'واژه' ? 'معنی' : 'پاسخ'
      $('.lt-back b', card).textContent = back
      $('.lt-back em', card).textContent = src
    }
    // کارتِ بعدی: کمترین خانه، و در خانه‌های برابر به ترتیبِ دسته
    const nextCard = () => {
      let best = -1
      for (let k = 1; k <= DECK.length; k++) {
        const i = (cur + k) % DECK.length
        if (best < 0 || box[i] < box[best]) best = i
      }
      return best
    }
    card.addEventListener('click', () => card.classList.toggle('flip'))
    $$('.lt-btns button', lt).forEach((b) => b.addEventListener('click', () => {
      if (!card.classList.contains('flip')) { card.classList.add('flip'); return }
      const ok = b.dataset.ans === '1'
      box[cur] = ok ? Math.min(box[cur] + 1, 4) : 0
      const to = box[cur]
      card.classList.add('out')
      setTimeout(() => {
        cur = nextCard()
        card.classList.remove('out', 'flip')
        paintCard()
        paintBoxes(to)
      }, reduce ? 0 : 430)
    }))
    paintCard(); paintBoxes(-1)
  }

  /* ── نمونه تستِ تیزهوشان ── */
  const demo = $('#demo')
  if (demo) {
    const btns = $$('.demo-opts button', demo)
    btns.forEach((b) => b.addEventListener('click', () => {
      const ok = b.hasAttribute('data-ok')
      b.classList.add(ok ? 'ok' : 'bad')
      if (ok) {
        btns.forEach((x) => { x.disabled = true })
        $('#demo-exp').hidden = false
      } else {
        b.disabled = true
      }
    }))
  }

  /* ── عکسِ مدرّس ── */
  if (C.teacherPhoto) $('#t-face').innerHTML = `<img src="${esc(C.teacherPhoto)}" alt="ملیحه قصرانی">`

  /* ── تماس ── */
  const P = C.support || {}
  const contacts = [
    P.phone && `<li><a href="tel:${esc(P.phone)}">${esc(P.phone)}</a></li>`,
    P.email && `<li><a href="mailto:${esc(P.email)}">${esc(P.email)}</a></li>`,
    P.telegram && `<li><a href="https://t.me/${esc(P.telegram)}" rel="noopener" target="_blank">تلگرام: ${esc(P.telegram)}</a></li>`,
  ].filter(Boolean)
  if (contacts.length) $('#contact-list').innerHTML = contacts.join('')
})()

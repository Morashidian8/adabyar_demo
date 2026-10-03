/* ================================================================
   تیزرِ ۳۰ ثانیه‌ایِ «قصر فارسی» — موشن‌گرافیِ کدی
   همه‌چیز تابعی از زمانِ t است (render(t))؛ پس هم در سایت پخش می‌شود و
   هم می‌توان فریم‌به‌فریم از آن ویدیو گرفت: QasrTeaser.seek(t).
   صحنه‌ها:
   ۱) ۰–۵٫۵   شب، قصرِ خودکش، ماه، «به نامِ خداوندِ جان و خرد»
   ۲) ۵٫۵–۱۰٫۵ ورود به طاق، گشودنِ درها، نور، «قصر فارسی»
   ۳) ۱۰٫۵–۱۵٫۵ کتابِ باز، بیتِ فردوسی واژه‌به‌واژه، معنی و صدای استاد
   ۴) ۱۵٫۵–۲۰٫۵ چهار بخشِ هر درس و شمارنده‌ها
   ۵) ۲۰٫۵–۲۵٫۵ لایتنر، سطح، نشان‌ها، تیزهوشان و نهایی
   ۶) ۲۵٫۵–۳۰   نشانِ قصر، «کلاسِ تقویتی؟ دیگر لازم نیست»، دانلود
   ================================================================ */
(() => {
  const DUR = 30
  const W = 1600, H = 900
  const SCENES = [0, 5.5, 10.5, 15.5, 20.5, 25.5]
  const SCENE_NAMES = ['قصر', 'ورود', 'شعر', 'درس', 'انگیزه', 'دانلود']

  /* ── ابزارهای زمان ── */
  const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
  const pr = (t, a, b) => cl((t - a) / (b - a))
  const eo = (p) => 1 - Math.pow(1 - p, 3)
  const eio = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
  const back = (p) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2) }
  /** پنجرهٔ دیده‌شدن: از a با فیدِ d می‌آید و از b با فیدِ d می‌رود */
  const win = (t, a, b, d = 0.5) => Math.min(pr(t, a, a + d), 1 - pr(t, b, b + d))
  const fa = (n) => Math.round(n).toLocaleString('fa-IR')
  function put(el, { o = 1, x = 0, y = 0, s = 1, r = 0, b = 0 } = {}) {
    el.style.opacity = o.toFixed(3)
    el.style.transform = `translate(-50%,-50%) translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${s.toFixed(4)}) rotate(${r.toFixed(2)}deg)`
    el.style.filter = b > 0.05 ? `blur(${b.toFixed(2)}px)` : 'none'
    el.style.visibility = o < 0.002 ? 'hidden' : 'visible'
  }
  /* ابزارِ تصادفیِ قطعی تا هر فریم همیشه همان باشد */
  const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

  /* ── نقش‌ها ── */
  const PALACE = [
    'M470 520V300c0-70 40-118 130-150 90 32 130 80 130 150v220',
    'M520 520V318c0-48 28-82 80-104 52 22 80 56 80 104v202',
    'M500 196c10-70 50-112 100-130 50 18 90 60 100 130',
    'M600 66V22M600 22c-8 0-12-6-12-12s6-10 12-10 12 4 12 10-4 12-12 12',
    'M380 520V170M410 520V170M372 170h46M380 170l15-46 15 46M395 124V96',
    'M790 520V170M820 520V170M782 170h46M790 170l15-46 15 46M805 124V96',
    'M372 250h46M372 330h46M782 250h46M782 330h46',
    'M180 520V380c0-40 26-66 70-82 44 16 70 42 70 82v140',
    'M880 520V380c0-40 26-66 70-82 44 16 70 42 70 82v140',
    'M60 520V430c0-26 18-44 46-54 28 10 46 28 46 54v90',
    'M1048 520V430c0-26 18-44 46-54 28 10 46 28 46 54v90',
    'M0 519h1200',
  ]
  const DOOR_CLIP = 'M520 520V318c0-48 28-82 80-104 52 22 80 56 80 104v202z'
  const ICONS = {
    teach: '<path d="M4 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H4zM20 5h-4a3 3 0 0 0-3 3"/>',
    practice: '<path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3"/>',
    exam: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
    help: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z"/>',
  }

  function build(root) {
    root.classList.add('tz')
    root.innerHTML = `
      <div class="tz-world" dir="rtl">
        <div class="tz-bg"></div>
        <canvas class="tz-sky" width="${W}" height="${H}"></canvas>
        <div class="tz-moon tz-a"></div>

        <div class="tz-palace">
          <svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
            <defs>
              <linearGradient id="tzg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e2a8"/><stop offset="1" stop-color="#c98a26"/></linearGradient>
              <linearGradient id="tzd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a4f12"/><stop offset=".5" stop-color="#e9c46a"/><stop offset="1" stop-color="#7a4f12"/></linearGradient>
              <radialGradient id="tzl" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#fff8e1"/><stop offset=".4" stop-color="#f6e2a8" stop-opacity=".8"/><stop offset="1" stop-color="#e9c46a" stop-opacity="0"/></radialGradient>
              <clipPath id="tzc"><path transform="translate(200 380)" d="${DOOR_CLIP}"/></clipPath>
            </defs>
            <g clip-path="url(#tzc)">
              <rect class="tz-light" x="700" y="560" width="200" height="340" fill="url(#tzl)"/>
              <g class="tz-doorR"><rect x="800" y="560" width="80" height="340" fill="url(#tzd)"/><path d="M812 600v280M868 600v280M800 720h80" stroke="#5a3a0c" stroke-width="2" opacity=".5"/></g>
              <g class="tz-doorL"><rect x="720" y="560" width="80" height="340" fill="url(#tzd)"/><path d="M732 600v280M788 600v280M720 720h80" stroke="#5a3a0c" stroke-width="2" opacity=".5"/></g>
            </g>
            <g class="tz-lines" transform="translate(200 380)" fill="none" stroke="url(#tzg)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
              ${PALACE.map((d) => `<path d="${d}"/>`).join('')}
            </g>
          </svg>
        </div>

        <p class="tz-bism tz-a nastaliq">به نامِ خداوندِ جان و خرد</p>
        <div class="tz-flash"></div>

        <h2 class="tz-title tz-a"><span>قصر</span> <span>فارسی</span></h2>
        <p class="tz-sub tz-a">با تدریسِ <b>ملیحه قصرانی</b> · دبیرِ ادبیاتِ فرزانگان</p>

        <div class="tz-book tz-a">
          <svg viewBox="0 0 760 360" width="760" height="360">
            <defs><linearGradient id="tzp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#efe2c4"/></linearGradient></defs>
            <path d="M380 40c-90-40-210-40-340-10v300c130-30 250-30 340 10z" fill="url(#tzp)"/>
            <path d="M380 40c90-40 210-40 340-10v300c-130-30-250-30-340 10z" fill="url(#tzp)" opacity=".92"/>
            <path d="M380 40v300" stroke="#c98a26" stroke-width="6"/>
            <g stroke="#d9c69c" stroke-width="3" opacity=".7">${[110, 150, 190, 230, 270].map((y) => `<path d="M80 ${y}q130-22 260 0M420 ${y}q130-22 260 0"/>`).join('')}</g>
          </svg>
        </div>
        <p class="tz-verse tz-a nastaliq" data-l="1"></p>
        <p class="tz-verse tz-a nastaliq" data-l="2"></p>
        <div class="tz-chip tz-mean tz-a"><b>معنی:</b> دانایی، سرچشمهٔ توانایی است.</div>
        <div class="tz-chip tz-voice tz-a"><i class="tz-play"></i><span class="tz-wave">${'<i></i>'.repeat(18)}</span>صدای استاد قصرانی</div>

        <p class="tz-head tz-a" data-h="4">هر درس، یک کلاسِ کامل</p>
        ${[['teach', 'تدریس', 'معنیِ بیت‌به‌بیت'], ['practice', 'تمرین', 'بازخوردِ فوری'], ['exam', 'آزمون', 'زمان‌دار و کارنامه'], ['help', 'رفعِ اشکال', 'نکته و اشتباهِ رایج']]
          .map(([k, t, d], i) => `<div class="tz-tile tz-a" data-i="${i}"><svg viewBox="0 0 24 24">${ICONS[k]}</svg><b>${t}</b><span>${d}</span></div>`).join('')}
        ${[[111, '', 'درسِ کامل'], [1800, '+', 'پرسش و تمرین'], [120, '', 'تستِ تیزهوشان'], [2100, '+', 'واژهٔ معنی‌شده']]
          .map(([n, p, l], i) => `<div class="tz-count tz-a" data-i="${i}" data-n="${n}" data-p="${p}"><b>۰</b><span>${l}</span></div>`).join('')}

        <p class="tz-head tz-a" data-h="5">مرورِ لایتنر · سطح و نشان · تیزهوشان و نهایی</p>
        <div class="tz-boxes tz-a">${['امروز', '۱ روز', '۳ روز', '۷ روز', '۱۶ روز'].map((l) => `<div><span>${l}</span></div>`).join('')}</div>
        ${['سپهر = آسمان', 'مونس = همدم', 'بُرنا = جوان'].map((c, i) => `<div class="tz-card tz-a" data-i="${i}">${c}</div>`).join('')}
        <div class="tz-ring tz-a"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" class="bg"/><circle cx="60" cy="60" r="50" class="fg"/></svg><span><b>سطح ۵</b><small>ادیب</small></span></div>
        ${['💯', '🎓', '🔥', '🃏'].map((e, i) => `<div class="tz-badge tz-a" data-i="${i}">${e}</div>`).join('')}
        <div class="tz-chip tz-trophy tz-a">🏆 ۱۲۰ تستِ تیزهوشان · آمادگیِ امتحانِ نهایی</div>

        <div class="tz-logo tz-a"><img src="logo.svg" alt=""></div>
        <div class="tz-burst tz-a"></div>
        <p class="tz-brand tz-a">قصر فارسی</p>
        <p class="tz-hook tz-a">کلاسِ تقویتیِ فارسی؟ <b>دیگر لازم نیست.</b></p>
        <div class="tz-cta tz-a">دانلودِ اپ · رایگان شروع کنید</div>
        <p class="tz-url tz-a">morashidian8.github.io/adabyar_demo/qasr</p>
        <div class="tz-vignette"></div>
      </div>
      <div class="tz-ui">
        <button class="tz-btn tz-pp" type="button" aria-label="پخش/توقّف"><svg viewBox="0 0 24 24"><path class="i-play" d="M8 5v14l11-7z"/><path class="i-pause" d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg></button>
        <div class="tz-bar" role="slider" aria-label="زمانِ تیزر" aria-valuemin="0" aria-valuemax="30" tabindex="0">
          <i class="tz-fill"></i>
          ${SCENES.map((s, i) => `<span class="tz-tick" style="right:${(s / DUR) * 100}%" data-s="${s}" title="${SCENE_NAMES[i]}"></span>`).join('')}
        </div>
        <span class="tz-time">۰:۰۰</span>
        <button class="tz-btn tz-fs" type="button" aria-label="تمام‌صفحه"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>
      </div>`

    const q = (s) => root.querySelector(s)
    const qa = (s) => [...root.querySelectorAll(s)]
    const world = q('.tz-world')
    const E = {
      bg: q('.tz-bg'), moon: q('.tz-moon'), palace: q('.tz-palace'), lines: qa('.tz-lines path'),
      doorL: q('.tz-doorL'), doorR: q('.tz-doorR'), light: q('.tz-light'),
      bism: q('.tz-bism'), flash: q('.tz-flash'), title: q('.tz-title'), titleWords: qa('.tz-title span'), sub: q('.tz-sub'),
      book: q('.tz-book'), v1: q('[data-l="1"]'), v2: q('[data-l="2"]'), mean: q('.tz-mean'), voice: q('.tz-voice'), waves: qa('.tz-wave i'),
      h4: q('[data-h="4"]'), tiles: qa('.tz-tile'), counts: qa('.tz-count'),
      h5: q('[data-h="5"]'), boxes: q('.tz-boxes'), boxEls: qa('.tz-boxes > div'), cards: qa('.tz-card'), ring: q('.tz-ring'), ringFg: q('.tz-ring .fg'),
      badges: qa('.tz-badge'), trophy: q('.tz-trophy'),
      logo: q('.tz-logo'), burst: q('.tz-burst'), brand: q('.tz-brand'), hook: q('.tz-hook'), cta: q('.tz-cta'), url: q('.tz-url'),
    }
    /* واژه‌های بیت */
    const words = (el, text) => { el.innerHTML = text.split(' ').map((w) => `<span>${w}</span>`).join(' '); return [...el.children] }
    const w1 = words(E.v1, 'توانا بُوَد هر که دانا بُوَد')
    const w2 = words(E.v2, 'ز دانش دلِ پیر بُرنا بُوَد')
    const lens = E.lines.map((p) => { try { return p.getTotalLength() } catch { return 1500 } })
    E.lines.forEach((p, i) => { p.style.strokeDasharray = lens[i] })

    /* آسمان: ستاره و غبارِ طلایی، قطعی */
    const ctx = q('.tz-sky').getContext('2d')
    const R = rng(1404)
    const stars = Array.from({ length: 180 }, () => ({ x: R() * W, y: R() * H * 0.85, r: 0.4 + R() * 1.6, p: R() * 6.28, s: 0.6 + R() * 2 }))
    const dust = Array.from({ length: 70 }, () => ({ x: R() * W, y: R() * H, r: 1 + R() * 2.6, v: 12 + R() * 30, w: R() * 6.28, a: 0.3 + R() * 0.5 }))
    function sky(t, k) {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#fff'
      for (const s of stars) {
        ctx.globalAlpha = k * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s.p + t * s.s * 1.6)))
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill()
      }
      for (const d of dust) {
        const y = ((d.y - t * d.v) % H + H) % H
        const x = d.x + Math.sin(d.w + t * 0.8) * 14
        const g = ctx.createRadialGradient(x, y, 0, x, y, d.r * 4)
        g.addColorStop(0, `rgba(246,226,168,${d.a * k})`); g.addColorStop(1, 'rgba(246,226,168,0)')
        ctx.globalAlpha = 1; ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(x, y, d.r * 4, 0, 6.283); ctx.fill()
      }
      ctx.fillStyle = '#fff'; ctx.globalAlpha = 1
    }

    /* ── رندرِ یک لحظه ── */
    function render(t) {
      /* پس‌زمینه: رنگِ آسمان با صحنه‌ها کمی می‌گردد */
      const hue = 250 + 18 * Math.sin(t / 30 * Math.PI)
      E.bg.style.background = `radial-gradient(120% 90% at 70% 0%, hsl(${hue} 55% 22%), #070a17 62%)`
      sky(t, cl(pr(t, 0, 1.2)))

      /* ۱) قصر و ماه */
      const zoom = eio(pr(t, 5.6, 7.4))
      const palaceIn = pr(t, 0, 0.8), palaceBack = eo(pr(t, 25.6, 27.2))
      const palaceO = t < 20 ? palaceIn * (1 - pr(t, 7.6, 8.4)) : 0.32 * palaceBack
      E.palace.style.opacity = palaceO.toFixed(3)
      E.palace.style.transform = t < 20 ? `scale(${1 + zoom * 2.4})` : `translateY(${(1 - palaceBack) * 120}px) scale(.82)`
      E.lines.forEach((p, i) => {
        const d = t < 20 ? eio(pr(t, 0.3 + i * 0.22, 2.6 + i * 0.22)) : 1
        p.style.strokeDashoffset = (lens[i] * (1 - d)).toFixed(1)
      })
      const open = eio(pr(t, 6.7, 7.7))
      E.doorL.style.transform = `translateX(${-open * 82}px)`
      E.doorR.style.transform = `translateX(${open * 82}px)`
      E.light.style.opacity = ((0.15 + 0.85 * open) * pr(t, 2.2, 3.4)).toFixed(3)
      const doorsIn = t < 20 ? pr(t, 2.2, 3.4) : 1
      E.doorL.style.opacity = E.doorR.style.opacity = doorsIn.toFixed(3)
      put(E.moon, { o: win(t, 0.6, 5.2, 0.8), x: 0, y: (1 - eo(pr(t, 0.6, 3.6))) * 260 })
      put(E.bism, { o: win(t, 2.2, 5.0, 0.7), y: -300 + (1 - eo(pr(t, 2.2, 3.2))) * 20, b: 8 * (1 - pr(t, 2.2, 3.2)) + 8 * pr(t, 5, 5.7) })
      E.flash.style.opacity = (Math.min(pr(t, 7.2, 7.8), 1 - pr(t, 7.8, 8.8)) * 0.95).toFixed(3)

      /* ۲) عنوان */
      const tIn = pr(t, 7.8, 9.0), tOut = eio(pr(t, 10.0, 10.8))
      put(E.title, { o: Math.min(pr(t, 7.8, 8.3), 1 - pr(t, 10.2, 10.8)), y: -tOut * 260, s: (0.6 + 0.4 * back(tIn)) * (1 - tOut * 0.45) })
      E.titleWords.forEach((w, i) => { const p = back(pr(t, 7.9 + i * 0.25, 8.9 + i * 0.25)); w.style.transform = `translateY(${(1 - p) * 70}px)`; w.style.opacity = cl(p).toFixed(3) })
      E.titleWords.forEach((w) => { w.style.backgroundPosition = `${-((t * 40) % 250)}% 0` })
      put(E.sub, { o: win(t, 8.7, 10.0, 0.6), y: 120 + (1 - eo(pr(t, 8.7, 9.5))) * 24 })

      /* ۳) کتاب و بیت */
      const bk = eo(pr(t, 10.6, 11.7))
      put(E.book, { o: win(t, 10.6, 15.0, 0.6), y: 120 + (1 - bk) * 220, s: 0.8 + 0.2 * bk })
      w1.forEach((w, i) => { const p = eo(pr(t, 11.6 + i * 0.28, 12.2 + i * 0.28)); w.style.opacity = p.toFixed(3); w.style.filter = `blur(${(1 - p) * 6}px)` })
      w2.forEach((w, i) => { const p = eo(pr(t, 12.6 + i * 0.28, 13.2 + i * 0.28)); w.style.opacity = p.toFixed(3); w.style.filter = `blur(${(1 - p) * 6}px)` })
      put(E.v1, { o: 1 - pr(t, 15, 15.5), y: -300 })
      put(E.v2, { o: 1 - pr(t, 15, 15.5), y: -185 })
      put(E.mean, { o: win(t, 13.6, 15.0), x: 300, y: 365 + (1 - eo(pr(t, 13.6, 14.2))) * 30 })
      put(E.voice, { o: win(t, 13.0, 15.0), x: -300, y: 365 + (1 - eo(pr(t, 13.0, 13.6))) * 30 })
      E.waves.forEach((b, i) => { b.style.transform = `scaleY(${(0.3 + 0.7 * Math.abs(Math.sin(t * 7 + i * 0.7))).toFixed(3)})` })

      /* ۴) چهار بخش و شمارنده‌ها */
      put(E.h4, { o: win(t, 15.6, 20.0), y: -300 + (1 - eo(pr(t, 15.6, 16.3))) * -30 })
      E.tiles.forEach((el, i) => {
        const p = back(pr(t, 15.9 + i * 0.22, 16.8 + i * 0.22))
        put(el, { o: Math.min(cl(p), 1 - pr(t, 20, 20.5)), x: (1.5 - i) * 330 + (1 - cl(p)) * 120, y: -60, s: 0.85 + 0.15 * p })
      })
      E.counts.forEach((el, i) => {
        const p = eo(pr(t, 17.6 + i * 0.2, 19.4 + i * 0.2))
        put(el, { o: Math.min(pr(t, 17.6 + i * 0.2, 18 + i * 0.2), 1 - pr(t, 20, 20.5)), x: (1.5 - i) * 330, y: 210 })
        el.firstChild.textContent = el.dataset.p + fa(+el.dataset.n * p)
      })

      /* ۵) لایتنر، سطح، نشان‌ها */
      put(E.h5, { o: win(t, 20.6, 25.0), y: -330 })
      put(E.boxes, { o: win(t, 20.7, 25.0), x: 330, y: 110, s: 0.9 + 0.1 * eo(pr(t, 20.7, 21.4)) })
      E.cards.forEach((el, i) => {
        const p = eio(pr(t, 21.2 + i * 0.6, 22.0 + i * 0.6))
        const tx = [450, 330, 210][i]   // مرکزِ خانه‌های «۱ روز»، «۳ روز»، «۷ روز» (از راست)
        const ty = 100
        put(el, { o: Math.min(pr(t, 21.2 + i * 0.6, 21.4 + i * 0.6), 1 - pr(t, 25, 25.5)), x: 330 + (tx - 330) * p, y: -120 + (ty + 120) * p, s: 1 - 0.35 * p, r: (1 - p) * (i - 1) * 8 })
      })
      E.boxEls.forEach((b, i) => b.classList.toggle('hit', i >= 1 && i <= 3 && t > 22.0 + (i - 1) * 0.6 && t < 25))
      put(E.ring, { o: win(t, 21.0, 25.0), x: -360, y: -40, s: 0.8 + 0.2 * back(pr(t, 21, 21.8)) })
      E.ringFg.style.strokeDashoffset = (314 * (1 - 0.68 * eo(pr(t, 21.4, 23.2)))).toFixed(1)
      E.badges.forEach((el, i) => {
        const p = back(pr(t, 22.6 + i * 0.25, 23.2 + i * 0.25))
        put(el, { o: Math.min(cl(p * 1.5), 1 - pr(t, 25, 25.5)), x: -540 + i * 120, y: 170, s: p })
      })
      put(E.trophy, { o: win(t, 23.6, 25.0), y: 330, s: 0.7 + 0.3 * back(pr(t, 23.6, 24.3)) })

      /* ۶) پایان */
      const lg = back(pr(t, 25.8, 26.8))
      put(E.logo, { o: pr(t, 25.8, 26.2), y: -170, s: 0.4 + 0.6 * lg + 0.03 * Math.sin(t * 3) * pr(t, 27, 28) })
      put(E.burst, { o: Math.min(pr(t, 25.9, 26.3), 1 - pr(t, 26.3, 27.4)), y: -170, s: 0.4 + 2.4 * eo(pr(t, 25.9, 27.4)) })
      put(E.brand, { o: pr(t, 26.2, 26.8), y: -10 + (1 - eo(pr(t, 26.2, 27))) * 30 })
      put(E.hook, { o: pr(t, 26.9, 27.5), y: 90 + (1 - eo(pr(t, 26.9, 27.6))) * 24 })
      put(E.cta, { o: pr(t, 27.6, 28.1), y: 185, s: (0.8 + 0.2 * back(pr(t, 27.6, 28.3))) * (1 + 0.04 * Math.sin(t * 5) * pr(t, 28.3, 28.8)) })
      put(E.url, { o: pr(t, 28.2, 28.8) * 0.8, y: 260 })
    }

    /* ── اندازه و پخش ── */
    const fit = () => { world.style.transform = `scale(${root.clientWidth / W})` }
    new ResizeObserver(fit).observe(root); fit()

    let t = 0, playing = false, last = 0, raf = 0, holdUntil = 0
    const fill = q('.tz-fill'), time = q('.tz-time'), bar = q('.tz-bar')
    const ui = () => {
      fill.style.width = `${(t / DUR) * 100}%`
      const s = Math.floor(t)
      time.textContent = `${fa(0)}:${s < 10 ? fa(0) : ''}${fa(s)}`
      root.classList.toggle('playing', playing)
    }
    const frame = (now) => {
      raf = 0
      if (!playing) return
      const dt = Math.min(0.1, (now - last) / 1000); last = now
      if (holdUntil) { if (now > holdUntil) { holdUntil = 0; t = 0 } }
      else { t += dt; if (t >= DUR) { t = DUR; holdUntil = now + 2500 } }
      render(t); ui()
      raf = requestAnimationFrame(frame)
    }
    const play = () => { if (playing) return; playing = true; last = performance.now(); if (t >= DUR) t = 0; raf = requestAnimationFrame(frame); ui() }
    const pause = () => { playing = false; if (raf) cancelAnimationFrame(raf); raf = 0; ui() }
    const seek = (v) => { t = cl(v, 0, DUR); holdUntil = 0; render(t); ui() }

    q('.tz-pp').addEventListener('click', () => (playing ? pause() : play()))
    world.addEventListener('click', () => (playing ? pause() : play()))
    q('.tz-fs').addEventListener('click', () => {
      const el = root
      if (document.fullscreenElement) document.exitFullscreen()
      else (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el)
    })
    const scrub = (e) => {
      const r = bar.getBoundingClientRect()
      seek(((r.right - e.clientX) / r.width) * DUR)   // نوار راست‌به‌چپ است
    }
    bar.addEventListener('pointerdown', (e) => { scrub(e); bar.setPointerCapture(e.pointerId) })
    bar.addEventListener('pointermove', (e) => { if (e.buttons) scrub(e) })
    bar.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') seek(t + 2)
      if (e.key === 'ArrowRight') seek(t - 2)
    })

    return { play, pause, seek, render, get time() { return t } }
  }

  /* ── راه‌اندازی ── */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const exportMode = /[?&]export\b/.test(location.search)
  for (const el of document.querySelectorAll('[data-teaser]')) {
    const api = build(el)
    window.QasrTeaser = api
    if (exportMode) { el.classList.add('tz-export'); api.seek(0); continue }
    if (reduce) { api.seek(29); continue }
    api.seek(0)
    let started = false
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { api.play(); started = true } else if (started) api.pause()
    }, { threshold: 0.45 }).observe(el)
  }
})()

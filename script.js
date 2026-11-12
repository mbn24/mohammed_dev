const CONFIG = {
  githubRepo: 'mbn24/mohammed_dev', 
  branch: 'main',
  appsFolder: '_data/apps',              // نفس المجلد في admin/config.yml
  cacheTTL: 5 * 60 * 1000,             // كاش لمدة 5 دقائق (لتجنب حدود GitHub API)
};

/* ============================================================
   🌍 الترجمات
   ============================================================ */
const translations = {
  ar: {
    'nav.about': 'عنّي', 'nav.apps': 'تطبيقاتي', 'nav.contact': 'تواصل',
    'hero.badge': 'متاح للعمل الحر', 'hero.name': 'محمد',
    'hero.role.dev': 'مطوّر', 'hero.role.and': 'و', 'hero.role.des': 'مصمم',
    'hero.tagline': 'أصنع تطبيقات وتجارب رقمية أنيقة، تجمع بين البساطة والفخامة.',
    'hero.cta1': 'استكشف أعمالي', 'hero.cta2': 'تواصل معي',
    'about.label': 'ABOUT', 'about.title': 'عنّي',
    'about.text': 'مطوّر ومصمم شغوف، أصنع تطبيقات ويب وتجارب رقمية أنيقة تجمع بين البساطة والوظيفة. أهتم بالتفاصيل وأؤمن أن التصميم الجيد هو ما يجعل التقنية الممتازة تُلمس وتُحس.',
    'apps.label': 'WORK', 'apps.title': 'تطبيقاتي', 'apps.subtitle': 'مختارات من مشاريعي الأخيرة.',
    'contact.label': 'CONTACT', 'contact.title': 'لنعمل معًا',
    'contact.subtitle': 'لديك فكرة؟ دعنا نحوّلها إلى واقع.', 'contact.email': 'أرسل بريدًا',
    'footer.rights': 'جميع الحقوق محفوظة',
    'type.web': 'ويب', 'type.android': 'أندرويد', 'type.desktop': 'سطح المكتب',
    'action.visit': 'زيارة', 'action.install': 'تثبيت', 'action.download': 'تحميل',
    'marquee.1': 'تطوير ويب', 'marquee.2': 'تصميم واجهات', 'marquee.3': 'تجربة مستخدم',
    'marquee.4': 'تطبيقات', 'marquee.5': 'إبداع',
    'apps.empty.title': 'لا توجد تطبيقات بعد',
    'apps.empty.cta': 'أضف أول تطبيق من لوحة التحكم',
    'apps.error': 'تعذّر تحميل التطبيقات. حاول لاحقًا.',
  },
  en: {
    'nav.about': 'About', 'nav.apps': 'Work', 'nav.contact': 'Contact',
    'hero.badge': 'Available for freelance', 'hero.name': 'Mohammed',
    'hero.role.dev': 'Developer', 'hero.role.and': '&', 'hero.role.des': 'Designer',
    'hero.tagline': 'Crafting elegant apps and digital experiences where simplicity meets luxury.',
    'hero.cta1': 'Explore my work', 'hero.cta2': 'Get in touch',
    'about.label': 'ABOUT', 'about.title': 'About me',
    'about.text': 'A passionate developer and designer crafting elegant web apps and digital experiences where simplicity meets function. I care about the details and believe great design is what makes excellent technology felt.',
    'apps.label': 'WORK', 'apps.title': 'My apps', 'apps.subtitle': 'A selection of my recent work.',
    'contact.label': 'CONTACT', 'contact.title': "Let's work together",
    'contact.subtitle': "Have an idea? Let's bring it to life.", 'contact.email': 'Send email',
    'footer.rights': 'All rights reserved',
    'type.web': 'Web', 'type.android': 'Android', 'type.desktop': 'Desktop',
    'action.visit': 'Visit', 'action.install': 'Install', 'action.download': 'Download',
    'marquee.1': 'WEB DEV', 'marquee.2': 'UI DESIGN', 'marquee.3': 'UX',
    'marquee.4': 'APPS', 'marquee.5': 'CRAFT',
    'apps.empty.title': 'No apps yet',
    'apps.empty.cta': 'Add your first app from the dashboard',
    'apps.error': 'Could not load apps. Try again later.',
  },
};

/* ============================================================
   🎨 أيقونات (SVG paths)
   ============================================================ */
const icons = {
  web: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  android: '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
  desktop: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
};

/* ============================================================
   🔧 الحالة الداخلية
   ============================================================ */
let currentLang = localStorage.getItem('site-lang') || 'ar';
let revealObserver;
let appsCache = null;
let appsCacheTime = 0;

/* ============================================================
   🌐 تطبيق اللغة (Async لأنها تجلب التطبيقات)
   ============================================================ */
async function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('site-lang', lang);

  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === 'ar' ? 'rtl' : 'ltr';

  // ترجمة العناصر الثابتة
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const val = translations[lang][el.dataset.i18n];
    if (val !== undefined) el.textContent = val;
  });

  // زر اللغة
  const btn = document.getElementById('langToggle');
  if (btn) btn.textContent = lang === 'ar' ? 'EN' : 'ع';

  renderMarquee();

  // جلب التطبيقات وعرضها
  try {
    const apps = await fetchApps();
    renderApps(apps);
  } catch {
    renderAppsError();
  }

  requestAnimationFrame(() => {
    observeReveals();
    bindCursorHoverTargets();
  });
}

/* ============================================================
   📥 جلب التطبيقات من GitHub (مع كاش ذكي)
   ============================================================ */
async function fetchApps() {
  const now = Date.now();

  // إرجاع النسخة المخزنة إن كانت حديثة
  if (appsCache !== null && now - appsCacheTime < CONFIG.cacheTTL) {
    return appsCache;
  }

  // التحقق من إعدادات المستودع
  if (!CONFIG.githubRepo || CONFIG.githubRepo.includes('YOUR_USERNAME')) {
    console.warn('⚠️ لم يتم ضبط githubRepo في CONFIG داخل script.js');
    return [];
  }

  try {
    const listUrl =
      `https://api.github.com/repos/${CONFIG.githubRepo}/contents/` +
      `${CONFIG.appsFolder}?ref=${CONFIG.branch}`;

    const listRes = await fetch(listUrl, {
      headers: { Accept: 'application/vnd.github+json' },
    });

    // مجلد غير موجود = لا توجد تطبيقات (ليس خطأ)
    if (listRes.status === 404) {
      appsCache = []; appsCacheTime = now;
      return [];
    }
    // تجاوز حد الطلبات
    if (listRes.status === 403) {
      console.warn('⚠️ تجاوزت حد طلبات GitHub API. سيظهر الكاش أو قائمة فارغة.');
      return appsCache || [];
    }
    if (!listRes.ok) throw new Error(`GitHub API ${listRes.status}`);

    const files = await listRes.json();
    if (!Array.isArray(files)) return [];

    const jsonFiles = files.filter(
      (f) => f.type === 'file' && f.name.endsWith('.json')
    );

    // جلب كل ملف JSON بالتوازي
    const loaded = await Promise.all(
      jsonFiles.map(async (file) => {
        try {
          const res = await fetch(file.download_url);
          if (!res.ok) return null;
          return await res.json();
        } catch {
          return null;
        }
      })
    );

    // تطبيع البيانات
    const apps = loaded
      .filter(Boolean)
      .map((a) => ({
        type: a.type || 'web',
        action: a.action || 'visit',
        url: a.url || '#',
        image: a.image || null,
        titleAr: a.titleAr || a.title || '',
        titleEn: a.titleEn || a.title || '',
        descAr: a.descAr || a.desc || '',
        descEn: a.descEn || a.desc || '',
      }))
      .filter((a) => a.titleAr || a.titleEn); // استبعاد الملفات الفارغة

    appsCache = apps;
    appsCacheTime = now;
    return apps;
  } catch (err) {
    console.error('❌ فشل جلب التطبيقات:', err);
    return appsCache || [];
  }
}

/* ============================================================
   🖼️ عرض التطبيقات (Bento Grid)
   ============================================================ */
function renderApps(apps) {
  const grid = document.getElementById('appsGrid');
  if (!grid) return;

  const t = translations[currentLang];

  // حالة: لا توجد تطبيقات
  if (!apps || apps.length === 0) {
    const adminUrl = new URL('admin/', window.location.href).href;
    grid.innerHTML = `
      <div class="col-span-full text-center py-16">
        <p class="text-muted text-lg mb-4">${t['apps.empty.title']}</p>
        <a href="${adminUrl}"
           class="inline-flex items-center gap-2 text-gold text-sm font-medium hover:gap-3 transition-all">
          ${t['apps.empty.cta']}
          <svg class="rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>
      </div>`;
    return;
  }

  // عرض البطاقات
  grid.innerHTML = apps
    .map((app, i) => {
      const title = currentLang === 'ar' ? app.titleAr : app.titleEn;
      const desc = currentLang === 'ar' ? app.descAr : app.descEn;
      const typeL = t[`type.${app.type}`] || app.type;
      const actionL = t[`action.${app.action}`] || app.action;
      const icon = icons[app.type] || icons.web;

      // نمط Bento متناوب
      let shape = '';
      if (i % 5 === 0) shape = 'span-2';
      else if (i % 5 === 3) shape = 'tall';

      // صورة اختيارية
      const imageBlock = app.image
        ? `<div class="-mx-6 -mt-6 mb-4 aspect-video overflow-hidden rounded-t-2xl bg-surface">
             <img src="${app.image}" alt="${title}" loading="lazy"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onerror="this.parentElement.style.display='none'">
           </div>`
        : '';

      return `
        <article class="reveal bento-item ${shape} group bg-surface border border-white/5 rounded-2xl p-6
                        hover:border-gold/40 transition-all duration-500 hover:-translate-y-1
                        hover:shadow-2xl hover:shadow-gold/10 relative overflow-hidden">
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                      pointer-events-none"
               style="background: radial-gradient(circle at var(--x,50%) var(--y,50%),
                      rgba(201,169,97,0.10), transparent 60%);"></div>
          <div class="relative flex flex-col h-full">
            ${imageBlock}
            <div class="flex items-start justify-between mb-5">
              <div class="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center
                          justify-center text-gold shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="1.8"
                     stroke-linecap="round" stroke-linejoin="round">${icon}</svg>
              </div>
              <span class="text-xs px-2.5 py-1 rounded-full border border-gold/30 text-gold bg-gold/5">
                ${typeL}
              </span>
            </div>
            <h3 class="text-xl font-semibold mb-2 group-hover:text-gold transition">${title}</h3>
            <p class="text-muted text-sm mb-6 leading-relaxed flex-1">${desc}</p>
            <a href="${app.url}" ${app.action === 'visit' ? 'target="_blank" rel="noopener"' : ''}
               class="inline-flex items-center gap-2 text-gold text-sm font-medium
                      hover:gap-3 transition-all">
              ${actionL}
              <svg class="rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
          </div>
        </article>`;
    })
    .join('');

  // تفعيل تأثير الضوء داخل البطاقات
  grid.querySelectorAll('.bento-item').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--x', `${e.clientX - r.left}px`);
      card.style.setProperty('--y', `${e.clientY - r.top}px`);
    });
  });

  // إعادة ربط المؤشر والأزرار
  bindCursorHoverTargets();
  bindMagneticTargets();
  requestAnimationFrame(observeReveals);
}

/* عرض خطأ بسيط إن فشل كل شيء */
function renderAppsError() {
  const grid = document.getElementById('appsGrid');
  if (!grid) return;
  grid.innerHTML = `
    <div class="col-span-full text-center py-16 text-muted">
      ${translations[currentLang]['apps.error']}
    </div>`;
}

/* ============================================================
   📜 الشريط المتحرك
   ============================================================ */
function renderMarquee() {
  const track = document.getElementById('marqueeTrack');
  if (!track) return;
  const t = translations[currentLang];
  const items = ['marquee.1', 'marquee.2', 'marquee.3', 'marquee.4', 'marquee.5'];
  const build = () =>
    items.map((k) => `<span class="marquee-item">${t[k]}</span>
      <span class="marquee-sep">◆</span>`).join('');
  track.innerHTML = build() + build() + build() + build();
}

/* ============================================================
   ✨ الظهور عند التمرير
   ============================================================ */
function observeReveals() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
  }
  document.querySelectorAll('.reveal:not(.revealed)').forEach((el) => revealObserver.observe(el));
}

/* ============================================================
   🖱️ المؤشر المخصص
   ============================================================ */
function initCursor() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
  });

  (function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
    requestAnimationFrame(loop);
  })();

  bindCursorHoverTargets();
}

function bindCursorHoverTargets() {
  const ring = document.getElementById('cursorRing');
  if (!ring) return;
  const targets = document.querySelectorAll('a, button, .magnetic, .bento-item');
  targets.forEach((el) => {
    if (el.dataset.cursorBound) return;
    el.dataset.cursorBound = '1';
    el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
  });
}

/* ============================================================
   🔦 بقعة الضوء في الـ Hero
   ============================================================ */
function initSpotlight() {
  const sp = document.getElementById('spotlight');
  const hero = document.getElementById('hero');
  if (!sp || !hero) return;
  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    sp.style.setProperty('--mx', `${e.clientX - r.left}px`);
    sp.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
}

/* ============================================================
   🧲 الأزرار المغناطيسية
   ============================================================ */
function initMagnetic() { bindMagneticTargets(); }

function bindMagneticTargets() {
  document.querySelectorAll('.magnetic').forEach((el) => {
    if (el.dataset.magneticBound) return;
    el.dataset.magneticBound = '1';
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* ============================================================
   📊 شريط تقدم القراءة
   ============================================================ */
function initProgress() {
  const bar = document.getElementById('progressBar');
  if (!bar) return;
  const update = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    bar.style.width = `${Math.min(pct, 100)}%`;
  };
  document.addEventListener('scroll', update, { passive: true });
  update();
}

/* ============================================================
   🚀 التهيئة
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // السنة
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // زر اللغة
  document.getElementById('langToggle')?.addEventListener('click', () => {
    applyLanguage(currentLang === 'ar' ? 'en' : 'ar');
  });

  // قائمة الموبايل
  const menuBtn = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  menuBtn?.addEventListener('click', () => mobileMenu?.classList.toggle('hidden'));
  mobileMenu?.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => mobileMenu.classList.add('hidden'))
  );

  // المؤثرات
  initCursor();
  initSpotlight();
  initMagnetic();
  initProgress();

  // تطبيق اللغة الأولية (تجلب التطبيقات)
  applyLanguage(currentLang);
});
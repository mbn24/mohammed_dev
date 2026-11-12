import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyBuu3cSVKBzHEYds-B-6819feqym2exhMg",
  authDomain: "mohammed-d.firebaseapp.com",
  projectId: "mohammed-d",
  storageBucket: "mohammed-d.firebasestorage.app",
  messagingSenderId: "741341385004",
  appId: "1:741341385004:web:b669b668c78982b36e1c89"

};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ============================================================
   🌍 2. الترجمات
   ============================================================ */
const translations = {
  ar: {
    'nav.about': 'عنّي', 'nav.apps': 'تطبيقاتي', 'nav.contact': 'تواصل',
    'hero.badge': 'متاح للعمل الحر', 'hero.name': 'محمد',
    'hero.role.dev': 'مطوّر', 'hero.role.and': 'و', 'hero.role.des': 'مصمم',
    'hero.tagline': 'أصنع تطبيقات وتجارب رقمية أنيقة، تجمع بين البساطة والفخامة.',
    'about.label': 'ABOUT', 'about.title': 'عنّي',
    'about.text': 'مطوّر ومصمم شغوف، أصنع تطبيقات ويب وتجارب رقمية أنيقة تجمع بين البساطة والوظيفة. أهتم بالتفاصيل وأؤمن أن التصميم الجيد هو ما يجعل التقنية الممتازة تُلمس وتُحس.',
    'apps.label': 'WORK', 'apps.title': 'تطبيقاتي', 'apps.subtitle': 'مختارات من مشاريعي الأخيرة.',
    'contact.label': 'CONTACT', 'contact.title': 'لنعمل معًا', 'contact.subtitle': 'لديك فكرة؟ دعنا نحوّلها إلى واقع.',
    'type.web': 'ويب', 'type.android': 'أندرويد', 'type.desktop': 'سطح المكتب',
    'action.visit': 'زيارة', 'action.install': 'تثبيت', 'action.download': 'تحميل',
    'marquee.1': 'تطوير ويب', 'marquee.2': 'تصميم واجهات', 'marquee.3': 'تجربة مستخدم', 'marquee.4': 'تطبيقات', 'marquee.5': 'إبداع',
    'apps.empty': 'لا توجد تطبيقات بعد.',
    'auth.login': 'دخول', 'auth.logout': 'خروج',
  },
  en: {
    'nav.about': 'About', 'nav.apps': 'Work', 'nav.contact': 'Contact',
    'hero.badge': 'Available for freelance', 'hero.name': 'Mohammed',
    'hero.role.dev': 'Developer', 'hero.role.and': '&', 'hero.role.des': 'Designer',
    'hero.tagline': 'Crafting elegant apps and digital experiences where simplicity meets luxury.',
    'about.label': 'ABOUT', 'about.title': 'About me',
    'about.text': 'A passionate developer and designer crafting elegant web apps and digital experiences where simplicity meets function.',
    'apps.label': 'WORK', 'apps.title': 'My apps', 'apps.subtitle': 'A selection of my recent work.',
    'contact.label': 'CONTACT', 'contact.title': "Let's work together", 'contact.subtitle': "Have an idea? Let's bring it to life.",
    'type.web': 'Web', 'type.android': 'Android', 'type.desktop': 'Desktop',
    'action.visit': 'Visit', 'action.install': 'Install', 'action.download': 'Download',
    'marquee.1': 'WEB DEV', 'marquee.2': 'UI DESIGN', 'marquee.3': 'UX', 'marquee.4': 'APPS', 'marquee.5': 'CRAFT',
    'apps.empty': 'No apps yet.',
    'auth.login': 'Login', 'auth.logout': 'Logout',
  }
};

/* ============================================================
   🔧 3. المتغيرات الأساسية
   ============================================================ */
let currentLang = localStorage.getItem('site-lang') || 'ar';
let currentApps = [];
let isAdmin = false;
let revealObserver;

const t = (key) => translations[currentLang][key] || key;

/* ============================================================
   🖼️ 4. عرض التطبيقات
   ============================================================ */
function renderApps() {
  const grid = document.getElementById('appsGrid');
  if (!grid) return;

  if (currentApps.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center py-16 text-muted">${t('apps.empty')}</div>`;
    return;
  }

  const icons = {
    web: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    android: '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
    desktop: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  };

  grid.innerHTML = currentApps.map((app, i) => {
    const title = currentLang === 'ar' ? app.titleAr : app.titleEn;
    const desc = currentLang === 'ar' ? app.descAr : app.descEn;
    const icon = icons[app.type] || icons.web;
    let shape = (i % 5 === 0) ? 'span-2' : (i % 5 === 3) ? 'tall' : '';

    const imageBlock = app.image
      ? `<div class="-mx-6 -mt-6 mb-4 aspect-video overflow-hidden rounded-t-2xl bg-surface"><img src="${app.image}" class="w-full h-full object-cover" onerror="this.parentElement.style.display='none'"></div>`
      : '';

    return `
      <article class="reveal bento-item ${shape} group bg-surface border border-white/5 rounded-2xl p-6 hover:border-gold/40 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style="background: radial-gradient(circle at var(--x,50%) var(--y,50%), rgba(201,169,97,0.10), transparent 60%);"></div>
        <div class="relative flex flex-col h-full">
          ${imageBlock}
          <div class="flex items-start justify-between mb-5">
            <div class="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icon}</svg>
            </div>
            <span class="text-xs px-2.5 py-1 rounded-full border border-gold/30 text-gold bg-gold/5">${t('type.' + app.type)}</span>
          </div>
          <h3 class="text-xl font-semibold mb-2 group-hover:text-gold transition">${title}</h3>
          <p class="text-muted text-sm mb-6 leading-relaxed flex-1">${desc}</p>
          <a href="${app.url}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 text-gold text-sm font-medium hover:gap-3 transition-all">
            ${t('action.visit')} <svg class="rtl:rotate-180" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>
      </article>`;
  }).join('');

  // تفعيل تأثير الضوء داخل البطاقات
  grid.querySelectorAll('.bento-item').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--x', `${e.clientX - r.left}px`);
      card.style.setProperty('--y', `${e.clientY - r.top}px`);
    });
  });

  bindCursorHoverTargets();
  requestAnimationFrame(observeReveals);
}

/* ============================================================
   🌐 5. تطبيق اللغة
   ============================================================ */
function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('site-lang', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = t(el.dataset.i18n);
    if (val !== undefined) el.textContent = val;
  });

  document.getElementById('langToggle').textContent = lang === 'ar' ? 'EN' : 'ع';
  updateAuthUI();
  renderApps();
  renderMarquee();
}

function renderMarquee() {
  const track = document.getElementById('marqueeTrack');
  if (!track) return;
  const items = ['marquee.1', 'marquee.2', 'marquee.3', 'marquee.4', 'marquee.5'];
  const build = () => items.map(k => `<span class="marquee-item">${t(k)}</span><span class="marquee-sep">◆</span>`).join('');
  track.innerHTML = build() + build() + build() + build();
}

/* ============================================================
   🔐 6. إدارة حالة تسجيل الدخول
   ============================================================ */
function updateAuthUI() {
  const authBtn = document.getElementById('authBtn');
  const fab = document.getElementById('fabAdd');

  if (isAdmin) {
    authBtn.textContent = t('auth.logout');
    authBtn.classList.add('border-blue/50', 'text-blue');
    fab.classList.remove('hidden');
  } else {
    authBtn.textContent = t('auth.login');
    authBtn.classList.remove('border-blue/50', 'text-blue');
    fab.classList.add('hidden');
  }
}

// مراقبة حالة الدخول
onAuthStateChanged(auth, (user) => {
  isAdmin = !!user;
  updateAuthUI();
});

/* ============================================================
   📥 7. جلب التطبيقات من Firestore (تحديث لحظي)
   ============================================================ */
const appsRef = collection(db, "apps");
const q = query(appsRef, orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
  currentApps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderApps();
}, (error) => {
  console.error("خطأ في جلب البيانات:", error);
});

/* ============================================================
   ✨ 8. التأثيرات الحركية (Cursor, Reveal, etc.)
   ============================================================ */
function observeReveals() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  }
  document.querySelectorAll('.reveal:not(.revealed)').forEach((el) => revealObserver.observe(el));
}

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
  document.querySelectorAll('a, button, .magnetic, .bento-item').forEach((el) => {
    if (el.dataset.cursorBound) return;
    el.dataset.cursorBound = '1';
    el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
  });
}

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

function initMagnetic() {
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
   🚀 9. التهيئة والأحداث (Events)
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  applyLanguage(currentLang);

  // المؤثرات
  initCursor();
  initSpotlight();
  initMagnetic();
  initProgress();
  observeReveals();

  // تغيير اللغة
  document.getElementById('langToggle').addEventListener('click', () => {
    applyLanguage(currentLang === 'ar' ? 'en' : 'ar');
  });

  // فتح نافذة تسجيل الدخول / الخروج
  document.getElementById('authBtn').addEventListener('click', () => {
    if (isAdmin) {
      signOut(auth);
    } else {
      document.getElementById('loginModal').classList.remove('hidden');
    }
  });

  // إغلاق النوافذ المنبثقة
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.modal-overlay').classList.add('hidden');
    });
  });

  // نموذج تسجيل الدخول
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    try {
      await signInWithEmailAndPassword(auth, email, pass);
      document.getElementById('loginModal').classList.add('hidden');
      document.getElementById('loginForm').reset();
      errorEl.classList.add('hidden');
    } catch (err) {
      errorEl.textContent = "خطأ في البريد أو كلمة المرور";
      errorEl.classList.remove('hidden');
    }
  });

  // فتح نافذة إضافة تطبيق (الزر العائم)
  document.getElementById('fabAdd').addEventListener('click', () => {
    document.getElementById('addAppModal').classList.remove('hidden');
  });

  // نموذج إضافة تطبيق (حفظ في Firestore)
  document.getElementById('addAppForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.textContent = 'جاري النشر...';
    btn.disabled = true;

    try {
      await addDoc(collection(db, "apps"), {
        titleAr: document.getElementById('appTitleAr').value,
        titleEn: document.getElementById('appTitleEn').value,
        descAr: document.getElementById('appDescAr').value,
        descEn: document.getElementById('appDescEn').value,
        url: document.getElementById('appUrl').value,
        image: document.getElementById('appImage').value || null,
        type: document.getElementById('appType').value,
        createdAt: serverTimestamp()
      });

      document.getElementById('addAppModal').classList.add('hidden');
      document.getElementById('addAppForm').reset();
    } catch (err) {
      alert("حدث خطأ أثناء النشر: " + err.message);
    } finally {
      btn.textContent = 'نشر التطبيق';
      btn.disabled = false;
    }
  });
});
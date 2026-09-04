/* ============================================================
   VISHNU MEDHAS — PORTFOLIO v4 SCRIPTS
   Progressive enhancement: every block below checks that its
   dependency (GSAP / Lenis / fine pointer) actually exists
   before wiring up, so the page still works if a CDN fails.
   ============================================================ */

const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const HAS_GSAP = typeof gsap !== 'undefined';
if (HAS_GSAP && typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

/* ── PRELOADER ── */
(function preloader() {
  const pre = document.getElementById('preloader');
  const fill = document.getElementById('preloaderFill');
  if (!pre) return;
  let pct = 0;
  const tick = setInterval(() => {
    pct += Math.random() * 18;
    if (pct >= 92) pct = 92;
    if (fill) fill.style.width = pct + '%';
  }, 120);
  window.addEventListener('load', () => {
    clearInterval(tick);
    if (fill) fill.style.width = '100%';
    setTimeout(() => {
      pre.classList.add('loaded');
      document.body.classList.add('page-ready');
      runHeroEntrance();
    }, 320);
  });
})();

/* ── LENIS SMOOTH SCROLL + GSAP SYNC ── */
let lenis = null;
if (typeof Lenis !== 'undefined' && !REDUCE_MOTION) {
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  if (HAS_GSAP) {
    lenis.on('scroll', () => { if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update(); });
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }
}

/* ── TYPING ANIMATION FOR NAME ── */
const nameEl = document.getElementById('typed-name');
function typeName() {
  if (!nameEl) return;
  const fullName = 'Vishnu Medhas';
  let idx = 0;
  (function step() {
    if (idx < fullName.length) {
      nameEl.textContent += fullName[idx];
      idx++;
      setTimeout(step, 90);
    } else {
      // Stop the blinking caret but keep the gradient shimmering indefinitely.
      nameEl.style.animation = 'gradientShift 6s ease infinite';
      nameEl.style.borderRight = 'none';
      nameEl.style.paddingRight = '0';
    }
  })();
}
window.addEventListener('load', () => setTimeout(typeName, 500));

/* ── NAV ── */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('nav-hamburger');
const navMenu = document.getElementById('nav-links');
const navLinks = document.querySelectorAll('.nav-links a');
const navIndicatorLinks = document.querySelectorAll('.nav-links a:not(.nav-resume-btn)');
const navIndicator = document.getElementById('navIndicator');
const scrollTopBtn = document.getElementById('scrollTop');
const progressBar = document.getElementById('scrollProgressBar');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navMenu.classList.toggle('open');
  });
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navMenu.classList.remove('open');
    });
  });
}

/* Sliding pill indicator that tracks the active/hovered nav link */
function moveIndicatorTo(el) {
  if (!el || !navIndicator || !navMenu) return;
  const containerRect = navMenu.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  navIndicator.style.width = rect.width + 'px';
  navIndicator.style.transform = `translateX(${rect.left - containerRect.left}px)`;
  navIndicator.classList.add('ready');
}
function moveIndicatorToActive() {
  const active = navMenu ? navMenu.querySelector('a.active') : null;
  if (active) moveIndicatorTo(active);
  else if (navIndicator) navIndicator.classList.remove('ready');
}
if (navIndicator && navMenu) {
  navIndicatorLinks.forEach((a) => a.addEventListener('mouseenter', () => moveIndicatorTo(a)));
  navMenu.addEventListener('mouseleave', moveIndicatorToActive);
  window.addEventListener('resize', moveIndicatorToActive);
}

let lastScrollY = window.scrollY;
function onScroll() {
  const y = window.scrollY;
  if (navbar) {
    navbar.classList.toggle('scrolled', y > 20);
    const menuOpen = hamburger && hamburger.classList.contains('open');
    if (!menuOpen) {
      navbar.classList.toggle('nav-hidden', y > lastScrollY && y > 140);
    }
    lastScrollY = y;
  }

  let current = '';
  document.querySelectorAll('section[id]').forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top <= 120 && rect.bottom >= 120) current = sec.id;
  });
  navLinks.forEach(a => {
    a.classList.remove('active');
    const href = a.getAttribute('href');
    if (href && href.startsWith('#') && href === '#' + current) a.classList.add('active');
  });
  moveIndicatorToActive();

  if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', y > 400);

  if (progressBar) {
    const doc = document.documentElement;
    const max = (doc.scrollHeight || document.body.scrollHeight) - window.innerHeight;
    const pct = max > 0 ? Math.min(100, (y / max) * 100) : 0;
    progressBar.style.width = pct + '%';
  }
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ── KINETIC TEXT SPLIT (section titles) ── */
function splitWords(el) {
  if (el.children.length) return false; // skip titles with nested markup (e.g. <em>)
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map(w => `<span class="word-wrap"><span class="word">${w}</span></span>`).join(' ');
  return true;
}
const splitTitles = [];
document.querySelectorAll('.section-title').forEach((el) => { if (splitWords(el)) splitTitles.push(el); });

/* ── SCROLL REVEAL ── */
if (HAS_GSAP && typeof ScrollTrigger !== 'undefined') {
  const groups = [
    { sel: '.section-label', y: 16, stagger: 0 },
    { sel: '.about-text', y: 24, stagger: 0 },
    { sel: '.trait', y: 28, stagger: 0.08 },
    { sel: '.edu-card', y: 28, stagger: 0.1 },
    { sel: '.skill-row', y: 18, stagger: 0.06 },
    { sel: '.tool-chip', y: 14, stagger: 0.03 },
    { sel: '.exp-card', y: 28, stagger: 0 },
    { sel: '.project-item', y: 40, stagger: 0.12 },
    { sel: '.badge-card', y: 16, stagger: 0.05 },
    { sel: '.connect-card', y: 24, stagger: 0.06 },
    { sel: '.contact-form-box', y: 28, stagger: 0 },
    { sel: '.contact-info-box', y: 28, stagger: 0 },
  ];
  groups.forEach(g => {
    const els = document.querySelectorAll(g.sel);
    if (!els.length) return;
    gsap.set(els, { opacity: 0, y: g.y });
    ScrollTrigger.batch(els, {
      start: 'top 88%',
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: g.stagger }),
      once: true,
    });
  });

  // section titles not covered by splitWords (e.g. Contact's "Get In <em>Touch</em>") still fade normally
  const plainTitles = [...document.querySelectorAll('.section-title')].filter(el => !splitTitles.includes(el));
  if (plainTitles.length) {
    gsap.set(plainTitles, { opacity: 0, y: 24 });
    ScrollTrigger.batch(plainTitles, {
      start: 'top 88%',
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }),
      once: true,
    });
  }
  splitTitles.forEach((title) => {
    const words = title.querySelectorAll('.word');
    gsap.set(words, { yPercent: 110 });
    ScrollTrigger.create({
      trigger: title,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(words, { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.06 }),
    });
  });
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); revealObserver.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  function setupReveal(selector, delay) {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      if (delay) el.style.setProperty('--d', i);
      revealObserver.observe(el);
    });
  }
  ['.section-label', '.section-title', '.about-text', '.exp-card', '.contact-form-box', '.contact-info-box'].forEach(s => setupReveal(s, false));
  ['.trait', '.edu-card', '.skill-row', '.tool-chip', '.project-item', '.badge-card', '.connect-card'].forEach(s => setupReveal(s, true));
}

/* ── HORIZONTAL SCROLL-PINNED PROJECTS (desktop only) ── */
if (HAS_GSAP && typeof ScrollTrigger !== 'undefined') {
  ScrollTrigger.matchMedia({
    '(min-width: 901px)': function () {
      const wrapper = document.getElementById('projectsPinWrapper');
      const track = document.getElementById('projectsTrack');
      if (!wrapper || !track) return;
      const distance = () => Math.max(0, track.scrollWidth - wrapper.clientWidth);
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top+=68',
          end: () => '+=' + distance(),
          scrub: 0.6,
          pin: true,
          invalidateOnRefresh: true,
          onLeave: hideProjectsHint,
          onEnterBack: hideProjectsHint,
        },
      });
      return () => tween.scrollTrigger && tween.scrollTrigger.kill();
    },
  });
}
function hideProjectsHint() {
  const hint = document.getElementById('projectsHint');
  if (hint) hint.style.opacity = '0';
}

/* ── CURSOR SPOTLIGHT ── */
if (FINE_POINTER && !REDUCE_MOTION) {
  const spotlight = document.getElementById('cursorSpotlight');
  if (spotlight) {
    window.addEventListener('mousemove', (e) => {
      spotlight.style.setProperty('--sx', e.clientX + 'px');
      spotlight.style.setProperty('--sy', e.clientY + 'px');
    }, { passive: true });
  }
}

/* ── PAGE TRANSITIONS (multi-page nav) ── */
(function pageTransitions() {
  const overlay = document.getElementById('pageTransition');
  if (!overlay) return;
  document.querySelectorAll('a[href$=".html"], a[href*=".html#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') return;
      e.preventDefault();
      overlay.classList.add('active');
      setTimeout(() => { window.location.href = a.href; }, 480);
    });
  });
})();

/* ── SKILL BARS ── */
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const fill = e.target.querySelector('.skill-fill');
      if (fill) {
        const w = fill.getAttribute('data-w');
        setTimeout(() => { fill.style.width = w + '%'; }, 200);
      }
      skillObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('.skill-row').forEach(row => skillObserver.observe(row));

/* ── STAT COUNTERS ── */
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseFloat(el.getAttribute('data-count')) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

/* ── HERO ENTRANCE ── */
function runHeroEntrance() {
  if (HAS_GSAP) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('#home .home-left > *', { opacity: 0, y: 24, duration: 0.7, stagger: 0.1 })
      .from('.photo-frame', { opacity: 0, scale: 0.9, y: 20, duration: 0.9, ease: 'back.out(1.4)' }, '-=0.5')
      .from('.stat-card', { opacity: 0, scale: 0.7, duration: 0.5, stagger: 0.15, ease: 'back.out(1.6)' }, '-=0.4');
  } else {
    const heroEls = document.querySelectorAll('#home .home-left > *');
    heroEls.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = `opacity 0.6s ease ${i * 0.1 + 0.1}s, transform 0.6s ease ${i * 0.1 + 0.1}s`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }));
    });
    const photoFrame = document.querySelector('.photo-frame');
    if (photoFrame) {
      photoFrame.style.opacity = '0';
      photoFrame.style.transform = 'scale(0.94) translateY(20px)';
      photoFrame.style.transition = 'opacity 0.8s ease 0.4s, transform 0.9s cubic-bezier(.34,1.56,.64,1) 0.4s';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        photoFrame.style.opacity = '1';
        photoFrame.style.transform = 'scale(1) translateY(0)';
      }));
    }
    document.querySelectorAll('.stat-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.8)';
      card.style.transition = `opacity 0.5s ease ${0.6 + i * 0.15}s, transform 0.5s cubic-bezier(.34,1.56,.64,1) ${0.6 + i * 0.15}s`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
      }));
    });
  }
}

/* ── CUSTOM CURSOR ── */
if (FINE_POINTER && !REDUCE_MOTION) {
  document.documentElement.classList.add('cursor-ready');
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (dot && ring) {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let revealed = false;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
      if (!revealed) { revealed = true; dot.style.opacity = '1'; ring.style.opacity = '1'; }
    }, { passive: true });
    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    })();
    const hoverables = 'a, button, .magnetic, .project-item, .tool-chip, .trait, input, textarea';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverables)) ring.classList.add('active');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverables)) ring.classList.remove('active');
    });
  }
}

/* ── MAGNETIC BUTTONS ── */
if (FINE_POINTER && !REDUCE_MOTION) {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.3;
      const y = (e.clientY - r.top - r.height / 2) * 0.3;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* ── 3D TILT + GLOW ON PROJECT CARDS ── */
if (FINE_POINTER && !REDUCE_MOTION) {
  document.querySelectorAll('.project-item').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rotY = (px - 0.5) * 8;
      const rotX = (0.5 - py) * 8;
      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
      card.style.setProperty('--mx', (px * 100) + '%');
      card.style.setProperty('--my', (py * 100) + '%');
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ── EMAILJS CONTACT FORM ── */
function showMsg(msg, isError) {
  const el = document.getElementById('contact-error');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  el.style.background = isError ? 'rgba(220,38,38,0.12)' : 'rgba(34,197,94,0.12)';
  el.style.color = isError ? '#f87171' : '#4ade80';
  el.style.border = isError ? '1px solid rgba(220,38,38,0.35)' : '1px solid rgba(34,197,94,0.35)';
  setTimeout(() => { el.style.display = 'none'; }, 5000);
}

function sendEmail() {
  const name = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const subject = document.getElementById('contact-subject').value.trim();
  const message = document.getElementById('contact-message').value.trim();
  const btn = document.querySelector('.btn-send');
  if (!name) { showMsg('Please enter your name.', true); return; }
  if (!email) { showMsg('Please enter your email.', true); return; }
  if (!message) { showMsg('Please enter a message.', true); return; }
  if (typeof emailjs === 'undefined') { showMsg('❌ Email service unavailable right now.', true); return; }
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  // Sign up free at emailjs.com and replace these two IDs with your own service/template IDs
  emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', { name, email, subject: subject || 'Portfolio Contact from ' + name, message })
    .then(() => {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      showMsg('✅ Message sent! I will get back to you soon.', false);
      document.getElementById('contact-name').value = '';
      document.getElementById('contact-email').value = '';
      document.getElementById('contact-subject').value = '';
      document.getElementById('contact-message').value = '';
    })
    .catch(() => {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      showMsg('❌ Failed to send. Please try again.', true);
    });
}

function sendWhatsApp() {
  const name = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const message = document.getElementById('contact-message').value.trim();
  if (!message) { showMsg('Please enter a message first.', true); return; }
  const text = encodeURIComponent((name ? 'Name: ' + name + '\n' : '') + (email ? 'Email: ' + email + '\n' : '') + '\nMessage:\n' + message);
  window.open(`https://wa.me/916300823626?text=${text}`, '_blank');
}

/* ── ENTER-TO-SUBMIT ON CONTACT FORM ── */
['contact-name', 'contact-email', 'contact-subject'].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendEmail(); } });
});

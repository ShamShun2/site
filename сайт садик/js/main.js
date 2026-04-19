/* ═══ Language & Shared functionality ═══ */

let LANG = localStorage.getItem('nuraiLang') || 'ru';

function t(ru, kz) { return LANG === 'kz' ? (kz || ru) : ru; }

function setLang(lang) {
  LANG = lang;
  localStorage.setItem('nuraiLang', lang);
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  // re-render if render() exists
  if (typeof render === 'function') render();
}

function initHeader() {
  // scrolled shadow
  window.addEventListener('scroll', () => {
    document.querySelector('header')?.classList.toggle('scrolled', window.scrollY > 10);
  });
  // hamburger
  document.querySelector('.hamburger')?.addEventListener('click', () => {
    document.querySelector('nav').classList.toggle('open');
  });
  // lang buttons
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === LANG);
    b.addEventListener('click', () => setLang(b.dataset.lang));
  });
  // active nav link
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    a.classList.toggle('active', href === path);
  });
}

// Fade-in on scroll
function initFade() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
}

// Toast notification
function showToast(msg, type = 'success') {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3200);
}

// Lightbox
function initLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  const img = lb.querySelector('img');
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      img.src = item.dataset.full || item.querySelector('img').src;
      lb.classList.add('open');
    });
  });
  lb.querySelector('.lb-close')?.addEventListener('click', () => lb.classList.remove('open'));
  lb.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('open'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });
}

// Format date
function fmtDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const months = {
    ru: ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],
    kz: ['қаңтар','ақпан','наурыз','сәуір','мамыр','маусым','шілде','тамыз','қыркүйек','қазан','қараша','желтоқсан']
  };
  const m = LANG === 'kz' ? months.kz : months.ru;
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`;
}

// Contact form submit
function initContactForm() {
  document.querySelectorAll('.js-contact-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      showToast(t('Сообщение отправлено! Мы свяжемся с вами.', 'Хабарлама жіберілді! Біз сізбен хабарласамыз.'));
      form.reset();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initFade();
  initLightbox();
  initContactForm();
  if (typeof render === 'function') render();
});

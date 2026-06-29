/* ================================================
   main.js — Portfolio Gabriele Albanese
   ================================================ */

// Scroll progress bar
const scrollProgress = document.getElementById('scrollProgress');
if (scrollProgress) {
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.style.width = docHeight > 0 ? (scrollTop / docHeight * 100) + '%' : '0%';
  }, { passive: true });
}

// Navigation scroll effect
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// Mobile hamburger menu
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    const [s1, s2, s3] = hamburger.querySelectorAll('span');
    s1.style.transform = open ? 'rotate(45deg) translate(5px, 5px)' : '';
    s2.style.opacity   = open ? '0' : '';
    s3.style.transform = open ? 'rotate(-45deg) translate(5px, -5px)' : '';
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
  }));
}

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) current = s.id; });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
});

// Intersection Observer — fade-up animations
const fadeEls = document.querySelectorAll('.fade-up');
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
fadeEls.forEach(el => fadeObserver.observe(el));

// Skill bars animation (hero card)
const bars = document.querySelectorAll('.skill-bar-fill');
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.style.width = e.target.dataset.width; });
}, { threshold: 0.5 });
bars.forEach(b => barObserver.observe(b));

// Counter animation for stat numbers
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const start = performance.now();
  const isDecimal = target % 1 !== 0;
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;
    el.textContent = (isDecimal ? value.toFixed(1) : Math.floor(value)) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
const counterEls = document.querySelectorAll('[data-target]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); counterObserver.unobserve(e.target); } });
}, { threshold: 0.5 });
counterEls.forEach(el => counterObserver.observe(el));

// GA4 — eventi personalizzati
(function() {
  if (typeof gtag !== 'function') return;

  // Case study aperti
  document.querySelectorAll('a[href*="case-study/"]').forEach(function(link) {
    link.addEventListener('click', function() {
      var name = (link.getAttribute('href') || '').split('/').pop().replace('.html', '');
      gtag('event', 'case_study_aperto', { nome: name });
    });
  });

  // Articoli aperti
  document.querySelectorAll('a[href*="articoli/"]').forEach(function(link) {
    link.addEventListener('click', function() {
      var name = (link.getAttribute('href') || '').split('/').pop().replace('.html', '');
      gtag('event', 'articolo_aperto', { nome: name });
    });
  });

  // Click email contatto
  document.querySelectorAll('a[href^="mailto:"]').forEach(function(link) {
    link.addEventListener('click', function() {
      gtag('event', 'contatto_email');
    });
  });

  // Apertura Radar Feed
  document.querySelectorAll('a[href*="intelligence-hub"]').forEach(function(link) {
    link.addEventListener('click', function() {
      gtag('event', 'radar_feed_aperto');
    });
  });
})();

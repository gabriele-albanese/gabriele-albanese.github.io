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

// GA4 — tracking completo
(function() {
  if (typeof gtag !== 'function') return;

  // 1. Click su case study
  document.querySelectorAll('a[href*="case-study/"]').forEach(function(link) {
    link.addEventListener('click', function() {
      var name = (link.getAttribute('href') || '').split('/').pop().replace('.html', '');
      gtag('event', 'case_study_aperto', { nome: name });
    });
  });

  // 2. Click su articoli
  document.querySelectorAll('a[href*="articoli/"]').forEach(function(link) {
    link.addEventListener('click', function() {
      var name = (link.getAttribute('href') || '').split('/').pop().replace('.html', '');
      gtag('event', 'articolo_aperto', { nome: name });
    });
  });

  // 3. Click email contatto
  document.querySelectorAll('a[href^="mailto:"]').forEach(function(link) {
    link.addEventListener('click', function() {
      gtag('event', 'contatto_email');
    });
  });

  // 4. Click Radar Feed
  document.querySelectorAll('a[href*="intelligence-hub"]').forEach(function(link) {
    link.addEventListener('click', function() {
      gtag('event', 'radar_feed_aperto');
    });
  });

  // 5. Avanzamento lettura (25 / 50 / 75 / 100%) — su articoli e case study
  var pagePath = window.location.pathname;
  var isContentPage = pagePath.indexOf('articoli/') !== -1 || pagePath.indexOf('case-study/') !== -1;
  if (isContentPage) {
    var milestones = [25, 50, 75, 100];
    var reached = {};
    window.addEventListener('scroll', function() {
      var scrolled = window.scrollY + window.innerHeight;
      var total = document.documentElement.scrollHeight;
      var pct = Math.round(scrolled / total * 100);
      milestones.forEach(function(m) {
        if (pct >= m && !reached[m]) {
          reached[m] = true;
          gtag('event', 'lettura_avanzamento', { percentuale: m, pagina: pagePath.split('/').pop() });
        }
      });
    }, { passive: true });
  }

  // 6. Tempo nelle sezioni homepage (Chi Sono, Progetti, Articoli, Competenze, Formazione)
  var sectionStart = {};
  if (document.querySelectorAll('section[id]').length > 0) {
    var secObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        var id = e.target.id;
        if (e.isIntersecting) {
          sectionStart[id] = performance.now();
        } else if (sectionStart[id]) {
          var sec = Math.round((performance.now() - sectionStart[id]) / 1000);
          if (sec >= 3) {
            gtag('event', 'tempo_sezione', { sezione: id, secondi: sec });
          }
          delete sectionStart[id];
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('section[id]').forEach(function(s) { secObserver.observe(s); });
  }

  // 7. Tempo totale sulla pagina — inviato quando l'utente esce
  var pageStart = performance.now();
  var pageName = window.location.pathname.split('/').pop() || 'index';
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
      var sec = Math.round((performance.now() - pageStart) / 1000);
      if (sec >= 5) {
        gtag('event', 'tempo_pagina', { pagina: pageName, secondi: sec });
      }
    }
  });
})();

(function(){
  emailjs.init({ publicKey: "LZNbLn1XyZcF4cJ82" });
})();

/* ─── Hero Canvas ─────────────────────────────────────────────────────── */
const canvas = document.getElementById("heroCanvas");
const ctx = canvas.getContext("2d");
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
let t = 0;
let animFrameId = null;
let isPageVisible = true;

function draw() {
  if (!isPageVisible) { animFrameId = null; return; }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#0f172a");
  grad.addColorStop(1, "#1e3a8a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = `rgba(255,123,123,${0.15 + i * 0.06})`;
    const amplitude = 40 + i * 20;
    const yOffset = canvas.height * 0.35 + i * 90;
    for (let x = 0; x <= canvas.width; x++) {
      const y = yOffset + Math.sin((x + t * 20) * 0.003) * amplitude;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.1 + i * 90);
    ctx.lineTo(canvas.width, canvas.height * 0.1 + i * 90);
    ctx.stroke();
  }
  t += 0.015;
  animFrameId = requestAnimationFrame(draw);
}

function restartDraw() {
  if (!animFrameId) {
    draw();
  }
}

function cancelDraw() {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
}

window.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    isPageVisible = false;
    cancelDraw();
  } else {
    isPageVisible = true;
    restartDraw();
  }
});

restartDraw();

const navLinks = document.querySelectorAll('nav a[href^="#"], .mobile-menu a[href^="#"]');
const mobileMenu = document.querySelector('.mobile-menu');
const overlay = document.getElementById('cookie-overlay');
const toggleAnalytics = document.getElementById('opt-out');

function closeMenu() {
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}

function openMenu() {
  mobileMenu.classList.add('open');
  document.body.style.overflow = 'hidden';
}

document.getElementById('menu-btn').addEventListener('click', openMenu);

document.getElementById('close-menu').addEventListener('click', closeMenu);

menuLinks && menuLinks.forEach(item => {
  item.addEventListener('click', closeMenu);
});

function updateActiveLink() {
  const fromTop = window.scrollY + 120;
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    const section = document.querySelector(href);
    if (!section) return;
    const offset = section.offsetTop;
    const height = section.offsetHeight;
    const isActive = fromTop >= offset && fromTop < offset + height;
    link.classList.toggle('active', isActive);
  });
}

window.addEventListener('scroll', updateActiveLink);

updateActiveLink();

/* ─── Carousel ───────────────────────────────────────────────────────── */
const carouselTrack = document.querySelector('.carousel-track');
const carouselSlides = Array.from(carouselTrack.querySelectorAll('.carousel-slide'));
let currentIndex = 0;
let carouselInterval = null;
let isPaused = false;

function goToSlide(index) {
  const count = carouselSlides.length;
  const targetIndex = ((index % count) + count) % count;
  carouselTrack.style.transform = `translateX(-${targetIndex * 100}%)`;
  currentIndex = targetIndex;
}

function nextSlide() {
  goToSlide(currentIndex + 1);
}

function startAutoplay() {
  if (!carouselInterval) {
    carouselInterval = setInterval(nextSlide, 3000);
  }
}

function stopAutoplay() {
  clearInterval(carouselInterval);
  carouselInterval = null;
}

carouselTrack.addEventListener('mouseenter', () => {
  isPaused = true;
  stopAutoplay();
});

carouselTrack.addEventListener('mouseleave', () => {
  isPaused = false;
  startAutoplay();
});

let startX = 0;
let isTouching = false;

carouselTrack.addEventListener('touchstart', (e) => {
  isTouching = true;
  startX = e.touches[0].clientX;
  stopAutoplay();
});

carouselTrack.addEventListener('touchmove', (e) => {
  if (!isTouching) return;
  let deltaX = e.touches[0].clientX - startX;
  carouselTrack.style.transform = `translateX(calc(-${currentIndex * 100}% + ${deltaX}px))`;
});

carouselTrack.addEventListener('touchend', (e) => {
  if (!isTouching) return;
  isTouching = false;
  let endX = e.changedTouches[0].clientX;
  let moved = endX - startX;
  const swipeThreshold = 50;

  if (Math.abs(moved) > swipeThreshold) {
    if (moved < 0) {
      nextSlide();
    } else {
      goToSlide(currentIndex - 1);
    }
  } else {
    goToSlide(currentIndex);
  }

  if (!isPaused) startAutoplay();
});

startAutoplay();

/* ─── Scroll preservation / restoration ───────────────────────────────── */
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

function enforceTopOnLoad() {
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

window.addEventListener('pageshow', (event) => {
  if (event.persisted || (window.performance && window.performance.getEntriesByType('navigation')[0]?.type === 'back_forward')) {
    enforceTopOnLoad();
  }
});

window.addEventListener('load', enforceTopOnLoad);

navLinks.forEach(link => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const targetId = link.getAttribute('href')?.replace('#', '');
    const targetEl = targetId ? document.getElementById(targetId) : null;
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    link.blur();

    if (mobileMenu.classList.contains('open')) {
      closeMenu();
    }
  });
});

const backToTopBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  if (window.scrollY > window.innerHeight / 2) {
    backToTopBtn.classList.add('show');
  } else {
    backToTopBtn.classList.remove('show');
  }
});
backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ─── FAQ Accordion ───────────────────────────────────────────────────── */
document.querySelectorAll('.faq-question').forEach(q => {
  q.addEventListener('click', () => {
    const answer = q.nextElementSibling;
    const isOpen = answer.style.display === 'block';
    document.querySelectorAll('.faq-answer').forEach(a => a.style.display = 'none');
    document.querySelectorAll('.faq-question').forEach(q2 => q2.classList.remove('open'));
    if (!isOpen) { answer.style.display = 'block'; q.classList.add('open'); }
  });
});

/* ─── Contact Form ────────────────────────────────────────────────────── */
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = this.querySelector('button');
  const status = document.getElementById('formStatus');
  btn.textContent = 'Sending...';
  btn.disabled = true;

  emailjs.sendForm('service_3mh3fz6', 'template_m6b8q7m', this)
    .then(() => {
      status.textContent = '✓ Message sent! We\'ll be in touch shortly.';
      status.style.display = 'block';
      status.style.background = '#dcfce7';
      status.style.color = '#166534';
      status.style.border = '1px solid #bbf7d0';
      btn.textContent = '✓ Sent!';
      btn.style.background = '#22c55e';
      this.reset();
      setTimeout(() => {
        btn.textContent = 'Send Message';
        btn.style.background = '';
        btn.disabled = false;
        status.style.display = 'none';
      }, 5000);
    }, () => {
      status.textContent = '✗ Failed to send. Please email us directly at will.sutcliffe@chironremote.com';
      status.style.display = 'block';
      status.style.background = '#fee2e2';
      status.style.color = '#991b1b';
      status.style.border = '1px solid #fecaca';
      btn.textContent = 'Send Message';
      btn.disabled = false;
    });
});

/* ─── Cookie Consent ──────────────────────────────────────────────────── */
function getConsent() {
  try {
    return JSON.parse(localStorage.getItem('cookieConsent') || 'null');
  } catch (err) {
    localStorage.removeItem('cookieConsent');
    return null;
  }
}

function saveConsent(analyticsAllowed) {
  localStorage.setItem('cookieConsent', JSON.stringify({ analytics: analyticsAllowed, timestamp: Date.now() }));
  overlay.classList.add('hidden');
  if (analyticsAllowed) {
    loadAnalytics();
  }
}

function showBanner() {
  overlay.classList.remove('hidden');
  toggleAnalytics.checked = false;
  const saved = getConsent();
  if (saved) { toggleAnalytics.checked = saved.analytics; }
}

// Accept all
document.getElementById('btn-accept-all').addEventListener('click', () => {
  saveConsent(true);
});

// Reject all optional
document.getElementById('btn-reject-all').addEventListener('click', () => {
  saveConsent(false);
});

// Save granular preferences
document.getElementById('btn-save-prefs').addEventListener('click', () => {
  saveConsent(toggleAnalytics.checked);
});

// Re-open via footer link
document.getElementById('cookie-prefs-link').addEventListener('click', () => {
  showBanner();
});

// Smooth scroll for in-banner privacy link (doesn't dismiss banner)
document.getElementById('cookie-privacy-link').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('privacy-policy').scrollIntoView({ behavior: 'smooth' });
});

// On load: show banner only if no prior consent recorded
(function init() {
  const saved = getConsent();
  if (!saved) {
    overlay.classList.remove('hidden');
  } else {
    overlay.classList.add('hidden');
    if (saved.analytics) loadAnalytics();
  }
})();

// Analytics loader — only called after explicit consent
function loadAnalytics() {
  // Replace YOUR-ANALYTICS-ID with your actual GA/GTM ID when ready
  // const script = document.createElement('script');
  // script.src = 'https://www.googletagmanager.com/gtag/js?id=YOUR-ANALYTICS...';
  // script.async = true;
  // document.head.appendChild(script);
  // window.dataLayer = window.dataLayer || [];
  // function gtag(){dataLayer.push(arguments);}
  // gtag('js', new Date());
  // gtag('config', 'YOUR-ANALYTICS-ID');
}

/* =============================================
   Bo'ness Care Home — Main JavaScript
   ============================================= */

// ── Nav scroll effect ──
const nav = document.querySelector('.nav');
function updateNav() {
  if (!nav) return;
  const isHero = document.querySelector('.hero');
  if (window.scrollY > 60) {
    nav.classList.add('scrolled');
    nav.classList.remove('hero-top');
  } else if (isHero) {
    nav.classList.remove('scrolled');
    nav.classList.add('hero-top');
  } else {
    nav.classList.add('scrolled');
  }
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// ── Mobile menu ──
const hamburger = document.querySelector('.nav__hamburger');
const navLinks = document.querySelector('.nav__links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      nav.classList.add('menu-open');
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      nav.classList.remove('menu-open');
    }
  });
  // Close on link click
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      nav.classList.remove('menu-open');
      hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });
}

// ── Hero Slideshow ──
const slides = document.querySelectorAll('.hero__slide');
const dots = document.querySelectorAll('.hero__dot');
let currentSlide = 0;
let slideTimer;

function goToSlide(n) {
  slides[currentSlide].classList.remove('active');
  dots[currentSlide]?.classList.remove('active');
  currentSlide = (n + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  dots[currentSlide]?.classList.add('active');
}

function startSlideshow() {
  if (slides.length < 2) return;
  clearInterval(slideTimer);
  slideTimer = setInterval(() => goToSlide(currentSlide + 1), 6500);
}

dots.forEach((dot, i) => {
  dot.addEventListener('click', () => { goToSlide(i); clearInterval(slideTimer); startSlideshow(); });
});

if (slides.length > 0) {
  slides[0].classList.add('active');
  dots[0]?.classList.add('active');
  startSlideshow();
}

// ── Scroll Reveal ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger').forEach(el => {
  revealObserver.observe(el);
});

// ── SVG Line Draw ──
const lineObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('drawn');
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.line-deco').forEach(el => lineObserver.observe(el));

// ── Active nav link ──
const currentPath = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav__link').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPath || (currentPath === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ── Counter animation ──
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + (el.dataset.suffix || '');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target.querySelector('.stat__number[data-target]');
      if (el && !el.classList.contains('counted')) {
        el.classList.add('counted');
        animateCounter(el);
      }
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat').forEach(el => counterObserver.observe(el));

// ── Contact form ──
const form = document.querySelector('.contact-form form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    const data = {
      firstName: form.querySelector('#first-name').value.trim(),
      lastName:  form.querySelector('#last-name').value.trim(),
      email:     form.querySelector('#email').value.trim(),
      phone:     form.querySelector('#phone').value.trim(),
      enquiry:   form.querySelector('#enquiry').value,
      message:   form.querySelector('#message').value.trim(),
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        btn.textContent = 'Message Sent ✓';
        btn.style.background = '#6b7d3e';
        form.reset();
        setTimeout(() => {
          btn.textContent = 'Send Message';
          btn.style.background = '';
          btn.disabled = false;
        }, 4000);
      } else {
        const { error } = await res.json().catch(() => ({}));
        btn.textContent = error || 'Something went wrong — please try again.';
        btn.style.background = '#c0392b';
        setTimeout(() => {
          btn.textContent = 'Send Message';
          btn.style.background = '';
          btn.disabled = false;
        }, 4000);
      }
    } catch {
      btn.textContent = 'Network error — please try again.';
      btn.style.background = '#c0392b';
      setTimeout(() => {
        btn.textContent = 'Send Message';
        btn.style.background = '';
        btn.disabled = false;
      }, 4000);
    }
  });
}

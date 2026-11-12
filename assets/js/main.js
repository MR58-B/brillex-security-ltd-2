(() => {
  'use strict';

  document.documentElement.classList.add('js-ready');
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  const header = document.querySelector('[data-header]');
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  const closeNav = () => {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    nav.classList.remove('is-open');
    document.body.classList.remove('nav-open');
  };
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav?.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeNav();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 960) closeNav();
  });

  const typewriterParts = [...document.querySelectorAll('[data-typewriter]')];
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (typewriterParts.length && !motionPreference.matches) {
    const completeText = typewriterParts.map(part => part.textContent || '');
    typewriterParts.forEach(part => { part.textContent = ''; });
    let typeTimer;
    const typeNext = (partIndex, characterIndex) => {
      if (motionPreference.matches) {
        typewriterParts.forEach((part, index) => { part.textContent = completeText[index]; });
        return;
      }
      if (partIndex >= typewriterParts.length) return;
      const part = typewriterParts[partIndex];
      const text = completeText[partIndex];
      part.textContent = text.slice(0, characterIndex + 1);
      if (characterIndex + 1 < text.length) {
        typeTimer = window.setTimeout(() => typeNext(partIndex, characterIndex + 1), 38);
      } else {
        typeTimer = window.setTimeout(() => typeNext(partIndex + 1, 0), 150);
      }
    };
    typeTimer = window.setTimeout(() => typeNext(0, 0), 260);
    motionPreference.addEventListener?.('change', event => {
      if (event.matches) {
        window.clearTimeout(typeTimer);
        typewriterParts.forEach((part, index) => { part.textContent = completeText[index]; });
      }
    });
  }

  const hero = document.querySelector('[data-hero]');
  const slides = [...document.querySelectorAll('.hero-slide')];
  if (hero && slides.length > 1) {
    let current = 0;
    let timer;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const photoCredit = document.querySelector('[data-hero-credit]');
    const updatePhotoCredit = () => {
      const activeSlide = slides[current];
      if (!photoCredit || !activeSlide) return;
      photoCredit.textContent = `Photo: ${activeSlide.dataset.credit || 'Source'}`;
      photoCredit.href = activeSlide.dataset.creditUrl || '#';
    };
    const show = index => {
      slides[current].classList.remove('is-active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      updatePhotoCredit();
    };
    const stop = () => window.clearInterval(timer);
    const start = () => {
      stop();
      if (!reducedMotion.matches && document.visibilityState === 'visible') {
        timer = window.setInterval(() => show(current + 1), 6500);
      }
    };
    document.querySelector('[data-slide-next]')?.addEventListener('click', () => { show(current + 1); start(); });
    document.querySelector('[data-slide-prev]')?.addEventListener('click', () => { show(current - 1); start(); });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    hero.addEventListener('focusin', stop);
    hero.addEventListener('focusout', event => { if (!hero.contains(event.relatedTarget)) start(); });
    document.addEventListener('visibilitychange', start);
    reducedMotion.addEventListener?.('change', start);
    updatePhotoCredit();
    start();
  }

  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });
    reveals.forEach(item => observer.observe(item));
  } else {
    reveals.forEach(item => item.classList.add('is-visible'));
  }

  const form = document.querySelector('[data-contact-form]');
  const status = document.querySelector('[data-form-status]');
  const companyEmail = '';
  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const message = [
      `Name: ${values.get('name')}`,
      `Email: ${values.get('email')}`,
      `Organisation: ${values.get('organisation') || 'Not provided'}`,
      `Area of interest: ${values.get('interest')}`,
      `Message: ${values.get('message')}`
    ].join('\n');
    if (companyEmail) {
      const subject = encodeURIComponent(`Brillex website enquiry — ${values.get('interest')}`);
      window.location.href = `mailto:${companyEmail}?subject=${subject}&body=${encodeURIComponent(message)}`;
      return;
    }
    if (status) {
      status.textContent = 'Your enquiry is complete, but a verified Brillex email address has not been provided yet, so this website cannot send it. Please contact the company through its confirmed channel or ask the site administrator to connect the form.';
      status.classList.add('is-visible');
      status.focus();
    }
  });
})();

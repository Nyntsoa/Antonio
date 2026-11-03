const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-nav');
if (toggle && nav) {
  const closeMenu = (restoreFocus = false) => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Ouvrir le menu');
    nav.classList.remove('is-open');
    if (restoreFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.setAttribute('aria-label', open ? 'Ouvrir le menu' : 'Fermer le menu');
    nav.classList.toggle('is-open', !open);
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('#primary-nav, .menu-toggle')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
}

const themeToggle = document.querySelector('#theme-toggle');
const root = document.documentElement;

function syncThemeToggle(enabled) {
  themeToggle?.setAttribute('aria-checked', String(enabled));
}

if (themeToggle) syncThemeToggle(root.dataset.theme === 'dark');

themeToggle?.addEventListener('click', () => {
  const dark = root.dataset.theme !== 'dark';
  if (dark) root.dataset.theme = 'dark';
  else delete root.dataset.theme;
  syncThemeToggle(dark);
  try { localStorage.setItem('portfolio-theme', dark ? 'dark' : 'light'); } catch (_) {}
});

const motionAllowed = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
if (motionAllowed) {
  const intro = document.querySelector('.home-copy, .screen-heading, .contact-copy, .about-intro, .detail-heading');
  if (intro) {
    intro.classList.add('hero-enter');
    window.setTimeout(() => intro.classList.remove('hero-enter'), 1150);
  }

  if ('IntersectionObserver' in window) {
    root.classList.add('motion-ready');
    const revealSelector = [
      '.hero-stats', '.section-title', '.skills-card', '.explore-card', '.project-card',
      '.service-card', '.about-panel', '.contact-form', '.filter-panel', '.detail-cover', '.project-facts',
      '.detail-gallery figure', '.contact-strip', '.home-contact', '.legal-card', '.not-found'
    ].join(',');
    const revealObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target;
        element.classList.add('is-visible');
        revealObserver.unobserve(element);
        window.setTimeout(() => element.classList.remove('motion-reveal', 'motion-image', 'is-visible'), 1100);
      }
    }, { rootMargin: '0px', threshold: 0.01 });

    document.querySelectorAll(revealSelector).forEach((element, index) => {
      if (element.getBoundingClientRect().top <= window.innerHeight * 0.9) return;
      element.classList.add('motion-reveal');
      if (element.matches('.explore-card, .project-card, .service-card, .about-panel, .detail-cover, .detail-gallery figure, .legal-card')) {
        element.classList.add('motion-image');
      }
      const siblingIndex = Array.from(element.parentElement?.children || []).indexOf(element);
      element.style.setProperty('--motion-delay', `${Math.min(siblingIndex < 0 ? index : siblingIndex, 3) * 70}ms`);
      revealObserver.observe(element);
    });

  }
}

// Database-backed project carousel. Only enough inert copies are added to
// cover the viewport and make the wrap point visually indistinguishable.
document.querySelectorAll('[data-work-carousel]').forEach((carousel) => {
  const windowElement = carousel.querySelector('[data-work-window]');
  const track = carousel.querySelector('[data-work-track]');
  if (!windowElement || !track) return;

  const cards = Array.from(track.querySelectorAll('[data-work-card]'));
  if (!cards.length) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cycleWidth = 0;
  let offset = 0;
  let targetOffset = 0;
  let previousTime = 0;
  let insideViewport = false;
  let dragging = false;
  let dragStartX = 0;
  let dragStartOffset = 0;
  let moved = false;
  let suppressClickUntil = 0;
  let resizeFrame = 0;

  const normalize = (value) => {
    if (!cycleWidth) return 0;
    return ((value % cycleWidth) + cycleWidth) % cycleWidth;
  };

  const buildLoop = () => {
    const progress = cycleWidth ? normalize(offset) / cycleWidth : 0;
    track.replaceChildren(...cards);
    cards.forEach((card, index) => {
      const angles = [-3.2, 2.4, -1.8, 3.1, -2.6, 1.7];
      const lifts = [14, -12, 7, -18, 10, -6];
      card.style.setProperty('--work-tilt', `${angles[index % angles.length]}deg`);
      card.style.setProperty('--work-lift', `${lifts[index % lifts.length]}px`);
      card.style.setProperty('--work-depth', String(index % 2 ? 1 : 2));
    });

    const cloneCard = (card) => {
      const clone = card.cloneNode(true);
      clone.classList.add('home-work-clone');
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('inert', '');
      return clone;
    };
    const firstCopy = document.createDocumentFragment();
    cards.forEach((card) => firstCopy.append(cloneCard(card)));
    track.append(firstCopy);
    cycleWidth = track.children[cards.length].offsetLeft - cards[0].offsetLeft;
    if (!cycleWidth || !Number.isFinite(cycleWidth)) return;

    const copies = Math.max(2, Math.ceil((windowElement.clientWidth + cycleWidth) / cycleWidth));
    const fragment = document.createDocumentFragment();
    for (let cycle = 2; cycle < copies; cycle += 1) {
      cards.forEach((card) => {
        fragment.append(cloneCard(card));
      });
    }
    track.append(fragment);
    offset = targetOffset = progress * cycleWidth;
    track.style.transform = `translate3d(${-normalize(offset)}px, 0, 0)`;
  };

  const scheduleBuild = () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(buildLoop);
  };

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(([entry]) => { insideViewport = entry.isIntersecting; }, { threshold: 0 })
    : null;
  if (observer) observer.observe(carousel);
  else insideViewport = true;

  const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(scheduleBuild) : null;
  resizeObserver?.observe(windowElement);
  window.addEventListener('resize', scheduleBuild, { passive: true });
  buildLoop();

  const frame = (time) => {
    if (!previousTime) previousTime = time;
    const elapsed = Math.min(50, time - previousTime);
    previousTime = time;

    if (!dragging && insideViewport && !reducedMotion && !document.hidden &&
        !carousel.matches(':hover') && !carousel.contains(document.activeElement)) {
      targetOffset += elapsed * 0.009;
    }

    const difference = targetOffset - offset;
    if (!dragging && Math.abs(difference) > 0.1) {
      offset += reducedMotion ? difference : difference * Math.min(1, elapsed * 0.012);
    } else if (!dragging) {
      offset = targetOffset;
    }
    track.style.transform = `translate3d(${-normalize(offset)}px, 0, 0)`;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  carousel.querySelectorAll('[data-work-direction]').forEach((button) => {
    button.addEventListener('click', () => {
      const direction = Number(button.dataset.workDirection) || 1;
      const firstCard = cards[0];
      const step = firstCard.getBoundingClientRect().width + parseFloat(getComputedStyle(firstCard).marginRight || '0');
      targetOffset += direction * Math.max(160, step);
    });
  });

  windowElement.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragging = true;
    moved = false;
    dragStartX = event.clientX;
    dragStartOffset = offset;
    targetOffset = offset;
    windowElement.classList.add('is-dragging');
    windowElement.setPointerCapture?.(event.pointerId);
  });
  windowElement.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const distance = event.clientX - dragStartX;
    if (Math.abs(distance) > 5) moved = true;
    offset = dragStartOffset - distance;
    targetOffset = offset;
    track.style.transform = `translate3d(${-normalize(offset)}px, 0, 0)`;
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    windowElement.classList.remove('is-dragging');
    if (moved) suppressClickUntil = performance.now() + 250;
  };
  windowElement.addEventListener('pointerup', endDrag);
  windowElement.addEventListener('pointercancel', endDrag);
  windowElement.addEventListener('click', (event) => {
    if (performance.now() < suppressClickUntil) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
  windowElement.addEventListener('wheel', (event) => {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : (event.shiftKey ? event.deltaY : 0);
    if (!delta) return;
    event.preventDefault();
    targetOffset += delta;
  }, { passive: false });
});

// Warm the next same-origin document on deliberate link intent. This keeps
// normal browser navigation and form behaviour while hiding server latency.
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
const canWarmPages = !connection?.saveData && !['slow-2g', '2g'].includes(connection?.effectiveType);
const warmedPages = new Set();

function warmPageFrom(target, delay = 80) {
  if (!canWarmPages) return;
  const anchor = target instanceof Element ? target.closest('a[href]') : null;
  if (!anchor || (anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return;
  if (anchor.relList.contains('external') || anchor.relList.contains('nofollow') || anchor.dataset.noPrefetch !== undefined) return;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin || url.pathname.startsWith('/admin/')) return;
  if (url.pathname === window.location.pathname && url.search === window.location.search) return;
  if (warmedPages.has(url.href)) return;
  warmedPages.add(url.href);

  window.setTimeout(() => {
    const hint = document.createElement('link');
    hint.rel = 'prefetch';
    hint.as = 'document';
    hint.href = url.href;
    document.head.append(hint);
  }, delay);
}

document.addEventListener('pointerover', (event) => {
  if (event.pointerType === 'mouse') warmPageFrom(event.target);
});
document.addEventListener('focusin', (event) => warmPageFrom(event.target));
document.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'touch') warmPageFrom(event.target, 0);
});

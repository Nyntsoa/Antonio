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

const settingsToggles = [...document.querySelectorAll('.settings-toggle, .accessibility-toggle')];
const settingsPanel = document.querySelector('#display-settings');
const themeToggle = document.querySelector('#theme-toggle');
const motionToggle = document.querySelector('#motion-toggle');
const root = document.documentElement;

function syncSetting(button, enabled) {
  if (button?.getAttribute('role') === 'switch') {
    button.setAttribute('aria-checked', String(enabled));
    return;
  }
  button?.setAttribute('aria-pressed', String(enabled));
}

if (themeToggle) syncSetting(themeToggle, root.dataset.theme === 'dark');
if (motionToggle) syncSetting(motionToggle, root.dataset.motion === 'reduced');

let panelCloseTimer;
let activeSettingsTrigger = null;
function setSettingsOpen(open) {
  if (!settingsPanel) return;
  clearTimeout(panelCloseTimer);
  settingsToggles.forEach((toggle) => toggle.setAttribute('aria-expanded', String(open)));
  if (open) {
    settingsPanel.hidden = false;
    requestAnimationFrame(() => settingsPanel.classList.add('is-open'));
    return;
  }
  settingsPanel.classList.remove('is-open');
  const reduce = root.dataset.motion === 'reduced' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  panelCloseTimer = setTimeout(() => { settingsPanel.hidden = true; }, reduce ? 0 : 240);
}

settingsToggles.forEach((toggle) => toggle.addEventListener('click', () => {
  activeSettingsTrigger = toggle;
  setSettingsOpen(toggle.getAttribute('aria-expanded') !== 'true');
}));

themeToggle?.addEventListener('click', () => {
  const dark = root.dataset.theme !== 'dark';
  if (dark) root.dataset.theme = 'dark';
  else delete root.dataset.theme;
  syncSetting(themeToggle, dark);
  try { localStorage.setItem('portfolio-theme', dark ? 'dark' : 'light'); } catch (_) {}
});

motionToggle?.addEventListener('click', () => {
  const reduced = root.dataset.motion !== 'reduced';
  if (reduced) root.dataset.motion = 'reduced';
  else delete root.dataset.motion;
  syncSetting(motionToggle, reduced);
  try { localStorage.setItem('portfolio-motion', reduced ? 'reduced' : 'full'); } catch (_) {}
});

document.addEventListener('click', (event) => {
  if (!settingsPanel || settingsPanel.hidden || event.target.closest('.settings-panel, .settings-toggle, .accessibility-toggle')) return;
  setSettingsOpen(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && settingsPanel && !settingsPanel.hidden) {
    setSettingsOpen(false);
    activeSettingsTrigger?.focus();
  }
});

const motionAllowed = window.matchMedia('(prefers-reduced-motion: no-preference)').matches && root.dataset.motion !== 'reduced';
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

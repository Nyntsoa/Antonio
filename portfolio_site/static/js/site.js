const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open', !open);
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }
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

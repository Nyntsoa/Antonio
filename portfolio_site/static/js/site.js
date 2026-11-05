(() => {
  const root = document.documentElement;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
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
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      nav.classList.toggle('is-open', open);
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.site-header')) closeMenu();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
    });
    document.addEventListener('focusin', event => {
      if (!event.target.closest('.site-header')) closeMenu();
    });
    window.matchMedia('(max-width: 760px)').addEventListener('change', () => closeMenu());
    root.classList.add('nav-enhanced');
  }

  const themeToggle = document.querySelector('#theme-toggle');
  const syncTheme = () => {
    const dark = root.dataset.theme === 'dark';
    themeToggle?.setAttribute('aria-checked', String(dark));
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#101113' : '#ffffff');
  };
  syncTheme();
  themeToggle?.addEventListener('click', () => {
    const dark = root.dataset.theme !== 'dark';
    if (dark) root.dataset.theme = 'dark';
    else delete root.dataset.theme;
    syncTheme();
    try { localStorage.setItem('portfolio-theme', dark ? 'dark' : 'light'); } catch (_) {}
  });
  window.addEventListener('storage', event => {
    if (event.key !== 'portfolio-theme') return;
    if (event.newValue === 'dark') root.dataset.theme = 'dark';
    else delete root.dataset.theme;
    syncTheme();
  });

  document.querySelectorAll('[data-project-preview]').forEach(preview => {
    const slides = [...preview.querySelectorAll('[data-preview-slide]')];
    const buttons = [...preview.querySelectorAll('[data-preview-select]')];
    const controls = preview.querySelector('[data-preview-controls]');
    const address = preview.querySelector('[data-preview-address]');
    if (!slides.length || !controls) return;
    const select = index => {
      slides.forEach((slide, position) => { slide.hidden = position !== index; });
      buttons.forEach((button, position) => button.setAttribute('aria-pressed', String(position === index)));
      if (address) address.textContent = slides[index].dataset.title;
    };
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => select(index));
      button.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = buttons.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        select(next);
        buttons[next].focus();
      });
    });
    preview.classList.add('preview-enhanced');
    select(0);
    controls.hidden = buttons.length < 2;
  });

  // The content stays visible without JavaScript or if an observer never fires.
  if (!motion.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        if (!motion.matches) {
          element.classList.add('is-revealing');
          element.addEventListener('animationend', () => element.classList.remove('is-revealing'), { once: true });
        }
        observer.unobserve(element);
      });
    }, { threshold: .08 });
    document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
  }

  const form = document.querySelector('.contact-form');
  if (form) {
    const submit = form.querySelector('button[type="submit"]');
    const resetSubmit = () => {
      if (!submit) return;
      submit.disabled = false;
      submit.textContent = 'Envoyer mon message';
      form.removeAttribute('aria-busy');
    };
    form.querySelectorAll('.field-error').forEach(error => {
      const field = error.closest('.form-field')?.querySelector('input, textarea');
      if (!field) return;
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', [field.getAttribute('aria-describedby'), error.id].filter(Boolean).join(' '));
    });
    form.querySelector('.form-error-summary')?.focus();
    form.addEventListener('submit', () => {
      if (!submit) return;
      submit.disabled = true;
      submit.textContent = 'Envoi en cours…';
      form.setAttribute('aria-busy', 'true');
      window.setTimeout(resetSubmit, 15000);
    });
    window.addEventListener('pageshow', resetSubmit);
  }
})();

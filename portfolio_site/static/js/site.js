(() => {
  'use strict';
  const root = document.documentElement;
  const gsap = window.gsap;
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQuery = matchMedia('(max-width: 760px)');
  let userPaused = false;
  try { userPaused = localStorage.getItem('portfolio-motion') === 'reduced'; } catch (_) {}
  const reduced = () => motionQuery.matches || userPaused;
  const stack = document.querySelector('.screen-stack');
  const screens = [...document.querySelectorAll('[data-screen]')];
  const dockLinks = [...document.querySelectorAll('[data-dock-item]')];
  const routes = Object.fromEntries(dockLinks.map(link => [link.dataset.route, new URL(link.href).pathname]));
  const labels = Object.fromEntries(dockLinks.map(link => [link.dataset.route, link.getAttribute('aria-label')]));
  const order = dockLinks.map(link => link.dataset.route);
  const dialog = document.querySelector('#project-dialog');
  const announcement = document.querySelector('[data-screen-announcement]');
  const siteTitle = 'AMBININTSOA Antonio · Développeur web';
  let active = stack?.dataset.activeScreen || '';
  let transition;
  let projectTransition;
  let lastProjectLink;
  let projectRequest;
  let toastTimer;

  function toast(message) {
    const element = document.querySelector('.toast');
    if (!element) return;
    clearTimeout(toastTimer);
    element.textContent = message;
    element.hidden = false;
    toastTimer = setTimeout(() => { element.hidden = true; }, 4000);
  }

  function syncMotion() {
    root.dataset.motion = reduced() ? 'reduced' : 'full';
    const button = document.querySelector('.motion-toggle');
    button?.setAttribute('aria-pressed', String(reduced()));
    button?.setAttribute('aria-label', reduced() ? 'Activer les animations' : 'Réduire les animations');
    if (button) {
      button.disabled = motionQuery.matches;
      button.title = motionQuery.matches ? 'Animations réduites selon les préférences de votre appareil' : button.getAttribute('aria-label');
    }
    if (reduced()) {
      transition?.progress(1);
      projectTransition?.progress(1);
    }
  }
  document.querySelector('.motion-toggle')?.addEventListener('click', () => {
    userPaused = !userPaused;
    try { localStorage.setItem('portfolio-motion', userPaused ? 'reduced' : 'full'); } catch (_) {}
    syncMotion();
  });
  motionQuery.addEventListener('change', syncMotion);
  syncMotion();

  function enterScreen(screen) {
    if (!gsap || reduced()) return;
    gsap.fromTo(screen.querySelectorAll('[data-enter]'), { y: 16, opacity: 0 }, {
      y: 0, opacity: 1, duration: .65, stagger: .045, ease: 'power3.out',
      clearProps: 'transform,opacity', overwrite: true,
    });
  }

  function syncChrome(key) {
    dockLinks.forEach(link => {
      if (link.dataset.route === key) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    const counter = document.querySelector('[data-screen-number]');
    if (counter) counter.textContent = String(Math.max(0, order.indexOf(key)) + 1).padStart(2, '0');
    document.title = key === 'home' ? siteTitle : `${labels[key] || 'Portfolio'} — ${siteTitle}`;
    if (announcement) announcement.textContent = labels[key] || '';
  }

  function navigate(key, { mode = 'push', focus = true, animate = true } = {}) {
    const next = screens.find(screen => screen.dataset.screen === key);
    if (!next) return false;
    if (dialog?.open) dialog.close();
    projectRequest?.abort();
    if (mode !== 'none') {
      const method = mode === 'replace' ? 'replaceState' : 'pushState';
      if (location.pathname !== routes[key] || location.search) history[method]({ screen: key }, '', routes[key]);
    }
    if (key === active) {
      syncChrome(key);
      if (focus) next.querySelector('h1')?.focus({ preventScroll: true });
      return true;
    }
    transition?.kill();
    const previous = screens.find(screen => screen.dataset.screen === active);
    const direction = order.indexOf(key) >= order.indexOf(active) ? 1 : -1;
    if (gsap) {
      gsap.killTweensOf(screens.flatMap(screen => [screen, ...screen.querySelectorAll('[data-enter]')]));
      gsap.set(screens, { clearProps: 'transform,opacity,filter,visibility' });
      gsap.set(screens.flatMap(screen => [...screen.querySelectorAll('[data-enter]')]), { clearProps: 'transform,opacity' });
    }
    screens.forEach(screen => {
      screen.hidden = screen !== next && screen !== previous;
      screen.inert = screen !== next;
    });
    next.hidden = false;
    active = key;
    stack.dataset.activeScreen = key;
    syncChrome(key);
    const finish = () => {
      screens.forEach(screen => { screen.hidden = screen !== next; });
      if (gsap) gsap.set(screens, { clearProps: 'transform,opacity,filter,visibility' });
      if (focus) next.querySelector('h1')?.focus({ preventScroll: true });
    };
    if (!gsap || reduced() || !animate) finish();
    else {
      transition = gsap.timeline({ onComplete: finish });
      if (previous) transition.to(previous, { opacity: 0, scale: .97, x: -20 * direction, duration: .2, ease: 'power2.in' }, 0);
      transition.fromTo(next, { opacity: 0, scale: 1.025, x: 24 * direction }, {
        opacity: 1, scale: 1, x: 0, duration: .42, ease: 'power3.out',
      }, .12);
      // Blur only the title, keeping the glass windows on cheap transform layers.
      transition.fromTo(next.querySelector('h1'), { filter: 'blur(3px)' }, {
        filter: 'blur(0px)', duration: .35, clearProps: 'filter',
      }, .12);
    }
    return true;
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-route]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!screens.some(screen => screen.dataset.screen === link.dataset.route)) return;
    event.preventDefault();
    navigate(link.dataset.route);
  });

  function panelGroup(name) {
    const buttons = [...document.querySelectorAll(`[data-${name}-tab]`)];
    const panels = [...document.querySelectorAll(`[data-${name}-panel]`)];
    if (!buttons.length) return;
    const select = button => {
      const value = button.getAttribute(`data-${name}-tab`);
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      panels.forEach(panel => { panel.hidden = panel.getAttribute(`data-${name}-panel`) !== value; });
      const visible = panels.find(panel => !panel.hidden);
      if (visible && gsap && !reduced()) gsap.fromTo(visible, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .35, clearProps: 'opacity,transform', overwrite: true });
      if (mobileQuery.matches) button.scrollIntoView({ behavior: reduced() ? 'instant' : 'smooth', block: 'nearest', inline: 'nearest' });
    };
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => select(button));
      button.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % buttons.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + buttons.length) % buttons.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = buttons.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        event.stopPropagation();
        select(buttons[next]);
        buttons[next].focus({ preventScroll: true });
      });
    });
  }
  ['about', 'skill', 'experience'].forEach(panelGroup);

  const projectSlides = [...document.querySelectorAll('[data-project-slide]')];
  const projectChoices = [...document.querySelectorAll('[data-select-project]')];
  let projectIndex = Math.max(0, projectSlides.findIndex(slide => !slide.hidden));
  function selectProject(index, { updateUrl = true, animate = true } = {}) {
    if (!projectSlides.length) return;
    const nextIndex = (index + projectSlides.length) % projectSlides.length;
    const previous = projectSlides[projectIndex];
    const next = projectSlides[nextIndex];
    const direction = nextIndex >= projectIndex ? 1 : -1;
    projectTransition?.kill();
    if (gsap) gsap.set(projectSlides, { clearProps: 'opacity,transform,visibility' });
    projectSlides.forEach(slide => { slide.hidden = slide !== next && slide !== previous; slide.inert = slide !== next; });
    next.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
    const finish = () => {
      projectSlides.forEach(slide => { slide.hidden = slide !== next; });
      if (gsap) gsap.set(projectSlides, { clearProps: 'opacity,transform,visibility' });
    };
    if (gsap && !reduced() && animate && next !== previous) {
      projectTransition = gsap.timeline({ onComplete: finish });
      projectTransition.to(previous, { opacity: 0, x: -35 * direction, scale: .98, duration: .22 }, 0)
        .fromTo(next, { opacity: 0, x: 35 * direction, scale: 1.02 }, { opacity: 1, x: 0, scale: 1, duration: .42, ease: 'power3.out' }, .12);
    } else finish();
    projectIndex = nextIndex;
    projectChoices.forEach(choice => {
      if (choice.dataset.selectProject === next.dataset.projectSlide) choice.setAttribute('aria-current', 'true');
      else choice.removeAttribute('aria-current');
    });
    const counter = document.querySelector('[data-project-number]');
    if (counter) counter.textContent = String(nextIndex + 1).padStart(2, '0');
    if (announcement && active === 'project_list') announcement.textContent = `Projet ${nextIndex + 1} sur ${projectSlides.length} : ${next.dataset.projectName}`;
    if (updateUrl && active === 'project_list') {
      const url = new URL(routes.project_list, location.origin);
      const category = new URLSearchParams(location.search).get('category');
      if (category) url.searchParams.set('category', category);
      url.searchParams.set('project', next.dataset.projectSlide);
      history.replaceState({ screen: 'project_list' }, '', url);
    }
  }
  projectChoices.forEach((choice, index) => choice.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    selectProject(index);
  }));
  document.querySelectorAll('[data-project-step]').forEach(button => {
    button.disabled = projectSlides.length < 2;
    button.addEventListener('click', () => selectProject(projectIndex + Number(button.dataset.projectStep)));
  });
  selectProject(projectIndex, { updateUrl: false, animate: false });

  async function openProject(href, { push = true } = {}) {
    if (!dialog) return;
    const url = new URL(href, location.origin);
    if (url.origin !== location.origin || !url.pathname.startsWith(routes.project_list)) return;
    navigate('project_list', { mode: 'none', focus: false, animate: false });
    projectRequest = new AbortController();
    const signal = projectRequest.signal;
    const content = dialog.querySelector('[data-project-content]');
    content.textContent = 'Ouverture du projet…';
    dialog.showModal();
    try {
      const requestUrl = new URL(url);
      requestUrl.searchParams.set('fragment', '1');
      const response = await fetch(requestUrl, { signal });
      if (!response.ok) throw new Error('project-load');
      const html = await response.text();
      if (signal.aborted) return;
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      const article = parsed.querySelector('.project-case');
      if (!article) throw new Error('project-content');
      content.replaceChildren(document.importNode(article, true));
      content.scrollTop = 0;
      if (push) history.pushState({ screen: 'project_list', project: url.pathname, modal: true }, '', url.pathname);
      document.title = `${article.dataset.caseTitle} — ${siteTitle}`;
      content.querySelector('h1')?.focus({ preventScroll: true });
      if (gsap && !reduced()) gsap.fromTo(dialog, { opacity: 0, scale: .96, y: 18 }, { opacity: 1, scale: 1, y: 0, duration: .4, ease: 'power3.out', clearProps: 'opacity,transform' });
    } catch (error) {
      if (error.name === 'AbortError') return;
      content.textContent = 'Le projet n’a pas pu être chargé. ';
      const retry = document.createElement('a');
      retry.className = 'text-link';
      retry.href = url.pathname;
      retry.textContent = 'Ouvrir sa page';
      content.append(retry);
    }
  }
  function closeProject() {
    projectRequest?.abort();
    dialog?.close();
    if (history.state?.modal) history.back();
    else {
      history.replaceState({ screen: 'project_list' }, '', routes.project_list);
      syncChrome('project_list');
    }
    if (lastProjectLink?.isConnected) lastProjectLink.focus({ preventScroll: true });
    else document.querySelector('[data-screen="project_list"] h1')?.focus({ preventScroll: true });
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-project-link]');
    if (!link || !dialog || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    lastProjectLink = link;
    openProject(link.href);
  });
  dialog?.querySelector('[data-close-dialog]')?.addEventListener('click', event => { event.preventDefault(); closeProject(); });
  dialog?.addEventListener('cancel', event => { event.preventDefault(); closeProject(); });
  dialog?.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) closeProject();
  });

  window.addEventListener('popstate', () => {
    const key = Object.keys(routes).find(key => routes[key] === location.pathname);
    if (key) {
      navigate(key, { mode: 'none' });
      const slug = new URLSearchParams(location.search).get('project');
      const index = projectSlides.findIndex(slide => slide.dataset.projectSlide === slug);
      if (index >= 0) selectProject(index, { updateUrl: false, animate: false });
    } else if (location.pathname.startsWith(routes.project_list)) openProject(location.href, { push: false });
  });
  document.addEventListener('keydown', event => {
    if (dialog?.open && event.key === 'Escape') {
      event.preventDefault();
      closeProject();
      return;
    }
    if (!stack || dialog?.open || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    if (event.key === 'Escape') { event.preventDefault(); navigate('home'); return; }
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const step = event.key === 'ArrowRight' ? 1 : -1;
    if (active === 'project_list' && event.target.closest('.project-navigation,[data-project-stage]')) selectProject(projectIndex + step);
    else navigate(order[(order.indexOf(active) + step + order.length) % order.length]);
  });
  let touchStart;
  stack?.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || event.target.closest('input,textarea,button,a,.skill-navigation,.project-picker')) return;
    touchStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
  });
  stack?.addEventListener('pointerup', event => {
    if (!touchStart || touchStart.id !== event.pointerId) return;
    const dx = event.clientX - touchStart.x;
    const dy = event.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) < 55 || Math.abs(dy) > Math.abs(dx) * .6) return;
    const step = dx < 0 ? 1 : -1;
    if (active === 'project_list') selectProject(projectIndex + step);
    else navigate(order[(order.indexOf(active) + step + order.length) % order.length]);
  });
  stack?.addEventListener('pointercancel', () => { touchStart = null; });

  const form = document.querySelector('[data-contact-form]');
  if (form) {
    const steps = [...form.querySelectorAll('[data-form-step]')];
    const next = form.querySelector('[data-form-next]');
    const back = form.querySelector('[data-form-back]');
    const submit = form.querySelector('[type="submit"]');
    const feedback = form.querySelector('.form-feedback');
    const counter = form.querySelector('[data-form-counter]');
    const submitContent = submit.innerHTML;
    let formStep = 0;
    let sending = false;
    function syncForm({ focus = false } = {}) {
      const mobile = mobileQuery.matches;
      steps.forEach((step, index) => { step.hidden = mobile && index !== formStep; });
      next.hidden = !mobile || formStep === 1;
      back.hidden = !mobile || formStep === 0;
      submit.hidden = mobile && formStep === 0;
      if (counter) counter.textContent = `${formStep + 1} / 2`;
      if (focus) steps[formStep].querySelector('input,textarea')?.focus({ preventScroll: true });
    }
    function setFieldError(name, message = '') {
      const field = form.elements.namedItem(name);
      const target = document.getElementById(`${name}-error`);
      if (target) target.textContent = message;
      if (field && 'setAttribute' in field) {
        if (message) {
          field.setAttribute('aria-invalid', 'true');
          const ids = new Set((field.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
          if (target) ids.add(target.id);
          field.setAttribute('aria-describedby', [...ids].join(' '));
        } else field.removeAttribute('aria-invalid');
      }
    }
    function validateStep() {
      let firstInvalid;
      ['name', 'email'].forEach(name => {
        const field = form.elements.namedItem(name);
        let message = '';
        if (!field.value.trim()) message = 'Ce champ est obligatoire.';
        else if (!field.validity.valid) message = name === 'email' ? 'Saisissez une adresse e-mail valide.' : 'Vérifiez cette information.';
        setFieldError(name, message);
        if (message && !firstInvalid) firstInvalid = field;
      });
      firstInvalid?.focus({ preventScroll: true });
      return !firstInvalid;
    }
    next.addEventListener('click', () => {
      if (!validateStep()) return;
      formStep = 1;
      syncForm({ focus: true });
    });
    back.addEventListener('click', () => { formStep = 0; syncForm({ focus: true }); });
    mobileQuery.addEventListener('change', () => syncForm());
    if (form.querySelector('#message-error')?.textContent.trim() || form.querySelector('#subject-error')?.textContent.trim()) formStep = 1;
    ['name', 'email', 'subject', 'message'].forEach(name => {
      const error = document.getElementById(`${name}-error`);
      if (error?.textContent.trim()) setFieldError(name, error.textContent.trim());
    });
    syncForm();
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (sending) return;
      if (mobileQuery.matches && formStep === 0) {
        if (validateStep()) { formStep = 1; syncForm({ focus: true }); }
        return;
      }
      sending = true;
      submit.disabled = true;
      next.disabled = true;
      back.disabled = true;
      submit.textContent = 'Envoi en cours…';
      form.setAttribute('aria-busy', 'true');
      feedback.hidden = true;
      ['name', 'email', 'subject', 'message'].forEach(name => setFieldError(name));
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch(form.action, {
          method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' },
          credentials: 'same-origin', signal: controller.signal,
        });
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          if (response.status === 403) throw new Error('session');
          throw new Error('response');
        }
        const result = await response.json();
        feedback.classList.toggle('is-error', !result.ok);
        if (result.ok) {
          form.reset();
          formStep = 0;
          syncForm();
          feedback.textContent = result.message;
        } else if (result.errors) {
          const firstName = Object.keys(result.errors).find(name => ['name', 'email', 'subject', 'message'].includes(name));
          Object.entries(result.errors).forEach(([name, errors]) => setFieldError(name, errors.map(error => error.message).join(' ')));
          const nonField = result.errors.__all__ || result.errors.website;
          feedback.textContent = nonField ? nonField.map(error => error.message).join(' ') : 'Quelques informations sont à vérifier.';
          formStep = ['subject', 'message'].includes(firstName) ? 1 : 0;
          syncForm();
          if (firstName) form.elements.namedItem(firstName)?.focus({ preventScroll: true });
        } else feedback.textContent = result.message || 'Le message n’a pas pu être envoyé. Réessayez dans un instant.';
        feedback.hidden = false;
        if (result.ok || !result.errors) feedback.focus({ preventScroll: true });
      } catch (error) {
        feedback.classList.add('is-error');
        feedback.textContent = error.message === 'session'
          ? 'La session a expiré. Rechargez cette page avant de réessayer. Votre message reste affiché.'
          : 'La connexion a été interrompue. Votre message est conservé ici ; vous pouvez réessayer.';
        feedback.hidden = false;
        feedback.focus({ preventScroll: true });
      } finally {
        clearTimeout(timeout);
        sending = false;
        submit.disabled = false;
        next.disabled = false;
        back.disabled = false;
        submit.innerHTML = submitContent;
        form.removeAttribute('aria-busy');
      }
    });
  }

  document.querySelector('[data-copy-email]')?.addEventListener('click', async event => {
    const email = event.currentTarget.dataset.copyEmail;
    try {
      await navigator.clipboard.writeText(email);
      toast('Adresse e-mail copiée.');
    } catch (_) { toast(`Adresse e-mail : ${email}`); }
  });

  if (gsap) {
    document.querySelectorAll('.magnetic').forEach(button => {
      const moveX = gsap.quickTo(button, 'x', { duration: .3, ease: 'power3.out' });
      const moveY = gsap.quickTo(button, 'y', { duration: .3, ease: 'power3.out' });
      button.addEventListener('pointermove', event => {
        if (reduced() || event.pointerType !== 'mouse') return;
        const bounds = button.getBoundingClientRect();
        moveX((event.clientX - bounds.left - bounds.width / 2) * .06);
        moveY((event.clientY - bounds.top - bounds.height / 2) * .08);
      });
      button.addEventListener('pointerleave', () => { moveX(0); moveY(0); });
    });
  }
  document.addEventListener('visibilitychange', () => {
    root.classList.toggle('is-background', document.hidden);
    if (!document.hidden) syncMotion();
  });

  if (stack) {
    screens.forEach(screen => { screen.inert = screen.hidden; });
    const initialDialog = dialog?.open;
    history.replaceState({ screen: active, ...(initialDialog ? { project: location.pathname } : {}) }, '', location.href);
    syncChrome(active);
    const hashKey = location.hash.slice(1);
    if (order.includes(hashKey)) navigate(hashKey, { mode: 'replace', focus: false, animate: false });
    else enterScreen(screens.find(screen => screen.dataset.screen === active));
    if (initialDialog) {
      dialog.removeAttribute('open');
      dialog.showModal();
      const article = dialog.querySelector('[data-case-title]');
      if (article) document.title = `${article.dataset.caseTitle} — ${siteTitle}`;
      dialog.querySelector('h1')?.focus({ preventScroll: true });
    }
  }
  root.classList.add('has-js');
  syncMotion();
})();

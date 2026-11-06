(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('has-js');
  const page = document.querySelector('[data-active-screen]');
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let manualMotion = false;
  try { manualMotion = localStorage.getItem('antonio-reduced-motion') === 'true'; } catch (_) {}
  const reduced = () => manualMotion || motionQuery.matches;
  const gsap = window.gsap;
  const motionButton = document.querySelector('.motion-toggle');
  function syncMotion() {
    root.classList.toggle('motion-off', reduced());
    if (motionButton) {
      motionButton.textContent = reduced() ? 'Animations : réduites' : 'Animations : activées';
      motionButton.setAttribute('aria-pressed', String(reduced()));
    }
    if (reduced() && gsap) {
      gsap.killTweensOf('[data-reveal]');
      gsap.set('[data-reveal]', { clearProps: 'all' });
    }
  }
  motionButton?.addEventListener('click', () => {
    manualMotion = !reduced();
    try { localStorage.setItem('antonio-reduced-motion', String(manualMotion)); } catch (_) {}
    syncMotion();
  });
  motionQuery.addEventListener('change', syncMotion);
  syncMotion();

  const searchDialog = document.getElementById('portfolio-search');
  const searchInput = document.getElementById('portfolio-query');
  const searchResults = [...document.querySelectorAll('[data-search-result]')];
  const normalized = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr');
  function filterSearch() {
    const query = normalized(searchInput?.value || '').trim();
    let count = 0;
    searchResults.forEach(result => {
      result.hidden = !normalized(result.textContent).includes(query);
      if (!result.hidden) count++;
    });
    const status = document.querySelector('[data-search-status]');
    if (status) status.textContent = count ? `${count} résultat${count > 1 ? 's' : ''}` : 'Aucun résultat. Essayez un autre mot.';
  }
  function closeSearch() {
    if (searchDialog?.open) searchDialog.close();
  }
  function openSearch() {
    if (!searchDialog || document.querySelector('dialog:modal')) return;
    closeMenu();
    searchDialog.showModal();
    document.body.classList.add('modal-open');
    searchInput.value = '';
    filterSearch();
    searchInput.focus();
  }
  document.querySelectorAll('[data-open-search]').forEach(button => button.addEventListener('click', openSearch));
  document.querySelector('[data-close-search]')?.addEventListener('click', closeSearch);
  searchInput?.addEventListener('input', filterSearch);
  searchInput?.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); searchResults.find(result => !result.hidden)?.focus(); }
  });
  searchDialog?.addEventListener('close', () => {
    if (!document.querySelector('dialog:modal')) document.body.classList.remove('modal-open');
  });
  document.addEventListener('keydown', event => {
    if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input,textarea,select,[contenteditable=true]')) return;
    event.preventDefault(); openSearch();
  });

  document.querySelectorAll('[data-collection]').forEach(collection => {
    const controls = collection.querySelectorAll('[data-expand-collection]');
    controls.forEach(control => control.addEventListener('click', () => {
      const expanded = !collection.classList.contains('is-expanded');
      collection.classList.toggle('is-expanded', expanded);
      controls.forEach(button => {
        button.setAttribute('aria-expanded', String(expanded));
        if (button.dataset.collapsedLabel) button.textContent = expanded ? button.dataset.expandedLabel : button.dataset.collapsedLabel;
      });
    }));
  });

  const conceptDialog = document.getElementById('concept-dialog');
  const conceptContent = document.querySelector('[data-concept-content]');
  document.querySelectorAll('[data-concept]').forEach(button => button.addEventListener('click', () => {
    const template = document.getElementById(`concept-${button.dataset.concept}`);
    if (!conceptDialog || !template) return;
    closeSearch();
    conceptContent.replaceChildren(template.content.cloneNode(true));
    conceptDialog.showModal();
    conceptDialog.scrollTop = 0;
    document.body.classList.add('modal-open');
  }));
  document.querySelector('[data-close-concept]')?.addEventListener('click', () => conceptDialog.close());
  conceptDialog?.addEventListener('close', () => {
    if (!document.querySelector('dialog:modal')) document.body.classList.remove('modal-open');
    conceptContent.replaceChildren();
  });
  [searchDialog, conceptDialog].filter(Boolean).forEach(modal => modal.addEventListener('click', event => {
    if (event.target !== modal) return;
    const box = modal.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) modal.close();
  }));

  const methodTabs = [...document.querySelectorAll('[data-method]')];
  const methodPanels = [...document.querySelectorAll('.method-panel')];
  const narrowMethod = matchMedia('(max-width: 760px)');
  let selectedMethod = 'understand';
  function selectMethod(key, { scroll = false, focus = false } = {}) {
    selectedMethod = key;
    methodTabs.forEach(tab => {
      const active = tab.dataset.method === key;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus({ preventScroll: true });
    });
    methodPanels.forEach(panel => { panel.hidden = narrowMethod.matches && panel.id !== `method-${key}`; });
    if (scroll && !narrowMethod.matches) document.getElementById(`method-${key}`)?.scrollIntoView({ behavior: reduced() ? 'instant' : 'smooth', block: 'center' });
  }
  methodTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectMethod(tab.dataset.method, { scroll: true }));
    tab.addEventListener('keydown', event => {
      if (!['ArrowDown','ArrowUp','ArrowRight','ArrowLeft','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? methodTabs.length - 1 : (index + (['ArrowDown','ArrowRight'].includes(event.key) ? 1 : -1) + methodTabs.length) % methodTabs.length;
      selectMethod(methodTabs[next].dataset.method, { scroll: true, focus: true });
    });
  });
  narrowMethod.addEventListener('change', () => selectMethod(selectedMethod));
  if (methodTabs.length) selectMethod(selectedMethod);
  if ('IntersectionObserver' in window) {
    const methodObserver = new IntersectionObserver(entries => {
      if (narrowMethod.matches) return;
      const visible = entries.find(entry => entry.isIntersecting);
      if (visible) selectMethod(visible.target.id.replace('method-', ''));
    }, { rootMargin: '-30% 0px -35% 0px' });
    methodPanels.forEach(panel => methodObserver.observe(panel));
  }

  const menu = document.querySelector('.main-navigation');
  const menuToggle = document.querySelector('.menu-toggle');
  function closeMenu() {
    menu?.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Ouvrir le menu');
  }
  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    menu.classList.toggle('is-open', open);
  });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
      closeMenu(); menuToggle.focus();
    }
  });
  matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

  function scrollToSection(key, { focus = false, instant = false } = {}) {
    const section = document.getElementById(key);
    if (!section) return;
    section.scrollIntoView({ behavior: reduced() || instant ? 'instant' : 'smooth', block: 'start' });
    if (focus) {
      const heading = section.querySelector('h1,h2');
      heading?.setAttribute('tabindex', '-1');
      heading?.focus({ preventScroll: true });
    }
  }
  document.querySelectorAll('[data-section]').forEach(link => {
    link.addEventListener('click', event => {
      if (!page || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const key = link.dataset.section;
      if (!document.getElementById(key)) return;
      event.preventDefault();
      closeSearch();
      closeMenu();
      history.pushState({ section: key }, '', link.href);
      scrollToSection(key, { focus: true });
    });
  });
  if (page && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        menu.querySelectorAll('[data-section]').forEach(link => {
          if (link.dataset.section === entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    page.querySelectorAll('section[id]').forEach(section => sectionObserver.observe(section));
  }

  if (gsap && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach((entry, index) => {
        if (!entry.isIntersecting) return;
        revealObserver.unobserve(entry.target);
        if (!reduced()) gsap.fromTo(entry.target, { y: 22, opacity: .2 }, {
          y: 0, opacity: 1, duration: .8, delay: Math.min(index * .055, .22), ease: 'power3.out', clearProps: 'all',
        });
      });
    }, { threshold: .06 });
    document.querySelectorAll('[data-reveal]').forEach(element => revealObserver.observe(element));
  }

  const filters = document.querySelector('[data-project-filters]');
  if (filters) {
    filters.hidden = false;
    filters.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      const category = button.dataset.filter;
      filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      let count = 0;
      document.querySelectorAll('[data-project-card]').forEach(card => {
        card.hidden = category !== 'all' && card.dataset.category !== category;
        if (!card.hidden) count++;
      });
      document.querySelector('[data-filter-status]').textContent = `${count} projet${count > 1 ? 's' : ''} affiché${count > 1 ? 's' : ''}.`;
    }));
  }

  const dialog = document.getElementById('project-dialog');
  const content = dialog?.querySelector('[data-project-content]');
  let opener = null;
  let requestController;
  let dialogPushed = false;
  const siteTitle = document.title;
  function showDialog() {
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('modal-open');
  }
  function resetDialog() {
    requestController?.abort();
    if (dialog?.open) dialog.close();
    document.body.classList.remove('modal-open');
    document.title = siteTitle;
  }
  function closeDialog() {
    resetDialog();
    if (dialogPushed) {
      dialogPushed = false;
      history.back();
    } else if (dialog) {
      const returnLink = dialog.querySelector('[data-close-dialog]');
      history.replaceState({ section: 'project_list' }, '', returnLink.href);
    }
    opener?.focus({ preventScroll: true });
  }
  async function openProject(url, { push = true, trigger = null } = {}) {
    if (!dialog) return;
    requestController?.abort();
    requestController = new AbortController();
    const controller = requestController;
    opener = trigger;
    content.replaceChildren();
    const loading = document.createElement('p');
    loading.className = 'dialog-loading';
    loading.textContent = 'Ouverture du projet…';
    loading.setAttribute('role', 'status');
    content.append(loading);
    showDialog();
    if (push) {
      history.pushState({ project: url, section: 'project_list' }, '', url);
      dialogPushed = true;
    }
    const timeout = setTimeout(() => controller.abort('timeout'), 15000);
    try {
      const target = new URL(url, location.href);
      target.searchParams.set('fragment', '1');
      const response = await fetch(target, { signal: controller.signal, credentials: 'same-origin' });
      if (!response.ok) throw new Error('project');
      const html = await response.text();
      if (controller !== requestController) return;
      content.innerHTML = html;
      dialog.scrollTop = 0;
      const heading = content.querySelector('h1');
      heading?.focus({ preventScroll: true });
      document.title = `${content.querySelector('[data-case-title]')?.dataset.caseTitle || 'Projet'} — Antonio`;
    } catch (error) {
      if (controller !== requestController || (error.name === 'AbortError' && controller.signal.reason !== 'timeout')) return;
      loading.textContent = 'Le projet n’a pas pu être chargé. ';
      const retry = document.createElement('a');
      retry.href = url; retry.textContent = 'Ouvrir la page du projet'; retry.className = 'text-link';
      loading.append(retry);
    } finally { clearTimeout(timeout); }
  }
  document.querySelectorAll('[data-project-link]').forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0 || !dialog) return;
    event.preventDefault();
    closeSearch();
    openProject(link.href, { trigger: link });
  }));
  dialog?.querySelector('[data-close-dialog]').addEventListener('click', event => { event.preventDefault(); closeDialog(); });
  dialog?.addEventListener('cancel', event => { event.preventDefault(); closeDialog(); });
  dialog?.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeDialog();
  });
  window.addEventListener('popstate', event => {
    closeSearch();
    if (conceptDialog?.open) conceptDialog.close();
    if (event.state?.project) { dialogPushed = true; openProject(event.state.project, { push: false }); }
    else { dialogPushed = false; resetDialog(); scrollToSection(event.state?.section || location.hash.slice(1) || 'home', { instant: true }); }
  });
  if (page) {
    const initial = location.hash.slice(1) || page.dataset.activeScreen;
    const initiallyOpen = dialog?.open;
    history.replaceState({ section: initial, ...(initiallyOpen ? { project: location.pathname } : {}) }, '', location.href);
    if (initial !== 'home') requestAnimationFrame(() => scrollToSection(initial, { instant: true }));
    if (initiallyOpen) {
      dialog.removeAttribute('open'); showDialog();
      content.querySelector('h1')?.focus({ preventScroll: true });
    }
  }

  const form = document.querySelector('[data-contact-form]');
  if (form) {
    const fields = ['name', 'email', 'subject', 'message'];
    const submit = form.querySelector('[type=submit]');
    const feedback = form.querySelector('.form-feedback');
    const buttonMarkup = submit.innerHTML;
    let sending = false;
    function fieldError(name, message = '') {
      const input = form.elements.namedItem(name);
      const error = document.getElementById(`${name}-error`);
      if (error) error.textContent = message;
      if (!input) return;
      if (message) {
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', [name === 'message' ? 'message-help' : '', error?.id].filter(Boolean).join(' '));
      } else input.removeAttribute('aria-invalid');
    }
    fields.forEach(name => {
      const error = document.getElementById(`${name}-error`);
      if (error?.textContent.trim()) fieldError(name, error.textContent.trim());
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (sending) return;
      fields.forEach(name => fieldError(name));
      if (form.elements.message.value.trim().length < 15) {
        fieldError('message', 'Votre message doit contenir au moins 15 caractères.');
        form.elements.message.focus(); return;
      }
      sending = true; submit.disabled = true; submit.textContent = 'Envoi en cours…';
      feedback.hidden = true; form.setAttribute('aria-busy', 'true');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, credentials: 'same-origin', signal: controller.signal });
        if (!(response.headers.get('content-type') || '').includes('application/json')) throw new Error(response.status === 403 ? 'session' : 'response');
        const result = await response.json();
        if (result.ok) {
          form.reset(); feedback.textContent = result.message;
        } else if (result.errors) {
          Object.entries(result.errors).forEach(([name, errors]) => fieldError(name, errors.map(error => error.message).join(' ')));
          const general = result.errors.__all__ || result.errors.website;
          feedback.textContent = general ? general.map(error => error.message).join(' ') : 'Quelques informations sont à vérifier.';
          form.elements.namedItem(fields.find(name => result.errors[name]))?.focus();
        } else feedback.textContent = result.message || 'Le message n’a pas pu être envoyé. Réessayez dans un instant.';
        feedback.hidden = false;
        if (result.ok || !result.errors) feedback.focus();
      } catch (error) {
        feedback.textContent = error.message === 'session' ? 'La session a expiré. Rechargez la page avant de réessayer. Votre message reste affiché.' : 'La connexion a été interrompue. Votre message est conservé ici ; vous pouvez réessayer.';
        feedback.hidden = false; feedback.focus();
      } finally {
        clearTimeout(timeout); sending = false; submit.disabled = false; submit.innerHTML = buttonMarkup; form.removeAttribute('aria-busy');
      }
    });
  }
  let toastTimer;
  document.querySelector('[data-copy-email]')?.addEventListener('click', async event => {
    const email = event.currentTarget.dataset.copyEmail;
    const toast = document.querySelector('.toast');
    try { await navigator.clipboard.writeText(email); toast.textContent = 'Adresse e-mail copiée.'; }
    catch (_) { toast.textContent = `Adresse e-mail : ${email}`; }
    toast.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.hidden = true; }, 4500);
  });
})();

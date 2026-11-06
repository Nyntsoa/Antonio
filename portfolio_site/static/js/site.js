(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('has-js');
  const gsap = window.gsap;
  const main = document.getElementById('main');
  const legacySpaces = {laboratoire:'/explorations/',matieres:'/matieres/',interfaces:'/interfaces/',photographie:'/photographie/',project_list:'/projets/',skills:'/competences/',about:'/a-propos/',experience:'/a-propos/#experience',contact:'/contact/',faq:'/contact/#faq',methode:'/competences/#methode'};
  if (location.pathname === '/' && legacySpaces[location.hash.slice(1)]) {
    location.replace(legacySpaces[location.hash.slice(1)]);
    return;
  }
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let manualMotion = false;
  try { manualMotion = localStorage.getItem('antonio-reduced-motion') === 'true'; } catch (_) {}
  const reduced = () => manualMotion || motionQuery.matches;
  const motionButton = document.querySelector('.motion-toggle');
  function syncMotion() {
    root.classList.toggle('motion-off', reduced());
    if (motionButton) {
      motionButton.textContent = reduced() ? 'Animations : réduites' : 'Animations : activées';
      motionButton.setAttribute('aria-pressed', String(reduced()));
    }
    if (reduced() && gsap) {
      gsap.killTweensOf('[data-reveal], #main');
      gsap.set('[data-reveal], #main', {clearProps:'all'});
    }
    if (reduced()) stopStudyMotion();
  }
  motionButton?.addEventListener('click', () => {
    manualMotion = !reduced();
    try { localStorage.setItem('antonio-reduced-motion', String(manualMotion)); } catch (_) {}
    syncMotion();
  });
  motionQuery.addEventListener('change', syncMotion);

  // Real document navigation: the browser owns URLs, history and scroll restoration.
  let navigationPending = false;
  let navigationTimer;
  function restorePage() {
    navigationPending = false;
    clearTimeout(navigationTimer);
    main?.removeAttribute('aria-busy');
    if (gsap) { gsap.killTweensOf(main); gsap.set(main, {clearProps:'opacity,transform'}); }
  }
  window.addEventListener('pageshow', event => { if (event.persisted) restorePage(); });
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('download') || (link.target && link.target !== '_self') || link.hasAttribute('data-lightbox') || link.hasAttribute('data-open-photo')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !['http:','https:'].includes(url.protocol)) return;
    document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
    if (url.pathname === location.pathname && url.search === location.search) return;
    if (!gsap || reduced()) return;
    event.preventDefault();
    if (navigationPending) return;
    navigationPending = true;
    main?.setAttribute('aria-busy', 'true');
    try { sessionStorage.setItem('antonio-page-entry', event.detail === 0 ? 'keyboard' : 'pointer'); } catch (_) {}
    const navigate = () => { clearTimeout(navigationTimer); location.assign(url.href); };
    navigationTimer = setTimeout(navigate, 260);
    gsap.to(main, {opacity:.25, y:-8, duration:.16, ease:'power2.in', onComplete:navigate});
  });
  let entry = '';
  try { entry = sessionStorage.getItem('antonio-page-entry'); sessionStorage.removeItem('antonio-page-entry'); } catch (_) {}
  if (gsap && !reduced() && entry) gsap.fromTo(main, {opacity:.25, y:16}, {opacity:1, y:0, duration:.45, ease:'power3.out', clearProps:'opacity,transform'});
  if (entry === 'keyboard' && !location.hash) main?.focus({preventScroll:true});

  const rail = document.querySelector('.space-rail-track');
  const activeSpace = rail?.querySelector('[aria-current=page]');
  if (activeSpace) rail.scrollLeft = activeSpace.offsetLeft - rail.clientWidth / 2 + activeSpace.offsetWidth / 2;

  const menu = document.getElementById('universe-menu');
  const menuTrigger = document.querySelector('[data-open-menu]');
  const searchDialog = document.getElementById('portfolio-search');
  function showModal(modal) {
    if (!modal || modal.open) return;
    document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
    modal.showModal();
    document.body.classList.add('modal-open');
  }
  document.querySelectorAll('dialog').forEach(modal => {
    modal.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = [...modal.querySelectorAll('a[href],button,input,textarea,select,[tabindex]')]
        .filter(element => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length);
      const first = controls[0], last = controls[controls.length - 1];
      if (!first) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    modal.addEventListener('close', () => {
      if (!document.querySelector('dialog:modal')) document.body.classList.remove('modal-open');
      if (modal === menu) menuTrigger?.setAttribute('aria-expanded', 'false');
    });
    modal.addEventListener('click', event => {
      if (event.target !== modal) return;
      const box = modal.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) modal.close();
    });
  });
  menuTrigger?.addEventListener('click', () => {
    showModal(menu);
    menuTrigger.setAttribute('aria-expanded', 'true');
    if (gsap && !reduced()) gsap.fromTo(menu.querySelectorAll('.universe-intro, .universe-links a'), {y:18,opacity:0}, {y:0,opacity:1,duration:.45,stagger:.035,ease:'power3.out',clearProps:'all'});
  });
  document.querySelector('[data-close-menu]')?.addEventListener('click', () => menu.close());
  const menuLinks = [...document.querySelectorAll('.universe-links a')];
  menuLinks.forEach((link,index) => link.addEventListener('keydown', event => {
    if (!['ArrowDown','ArrowUp','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? menuLinks.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + menuLinks.length) % menuLinks.length;
    menuLinks[next].focus();
  }));

  const searchInput = document.getElementById('portfolio-query');
  const searchResults = [...document.querySelectorAll('[data-search-result]')];
  const normalized = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr');
  function filterSearch() {
    const query = normalized(searchInput?.value || '').trim();
    searchResults.forEach(result => { result.hidden = !normalized(result.textContent).includes(query); });
    const count = searchResults.filter(result => !result.hidden).length;
    const status = document.querySelector('[data-search-status]');
    if (status) status.textContent = count ? `${count} résultat${count > 1 ? 's' : ''}` : 'Aucun résultat. Essayez un autre mot.';
  }
  function openSearch() { showModal(searchDialog); searchInput.value = ''; filterSearch(); searchInput.focus(); }
  document.querySelectorAll('[data-open-search]').forEach(button => button.addEventListener('click', openSearch));
  document.querySelector('[data-close-search]')?.addEventListener('click', () => searchDialog.close());
  searchInput?.addEventListener('input', filterSearch);
  searchDialog?.addEventListener('keydown', event => {
    if (!['ArrowDown','ArrowUp'].includes(event.key)) return;
    const visible = searchResults.filter(result => !result.hidden);
    if (!visible.length) return;
    event.preventDefault();
    const index = visible.indexOf(document.activeElement);
    const next = index < 0 ? 0 : (index + (event.key === 'ArrowDown' ? 1 : -1) + visible.length) % visible.length;
    visible[next].focus();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input,textarea,select,[contenteditable=true]')) return;
    event.preventDefault(); openSearch();
  });

  // Same-page chapter links retain their native hashes and keyboard behavior.
  const chapters = [...document.querySelectorAll('.case-chapters a')];
  if (chapters.length && 'IntersectionObserver' in window) {
    const chapterObserver = new IntersectionObserver(entries => {
      const current = entries.find(entry => entry.isIntersecting);
      if (!current) return;
      chapters.forEach(link => {
        if (link.hash === `#${current.target.id}`) link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
    }, {rootMargin:'-25% 0px -55% 0px'});
    document.querySelectorAll('.case-section[id]').forEach(section => chapterObserver.observe(section));
  }
  const methodTabs = [...document.querySelectorAll('[data-method]')];
  const methodPanels = [...document.querySelectorAll('.method-panel')];
  function selectMethod(index, focus=false) {
    methodTabs.forEach((tab,i) => {
      tab.setAttribute('aria-selected',String(i===index)); tab.tabIndex=i===index?0:-1;
      if (i===index && focus) tab.focus();
    });
    methodPanels.forEach((panel,i) => {panel.hidden=i!==index;});
  }
  methodTabs.forEach((tab,index) => {
    tab.addEventListener('click',()=>selectMethod(index));
    tab.addEventListener('keydown',event=>{
      if (!['ArrowDown','ArrowUp','ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      selectMethod(event.key==='Home'?0:event.key==='End'?methodTabs.length-1:(index+(['ArrowDown','ArrowRight'].includes(event.key)?1:-1)+methodTabs.length)%methodTabs.length,true);
    });
  });
  if (methodTabs.length) selectMethod(0);

  const imageDialog = document.getElementById('image-view');
  document.querySelectorAll('[data-lightbox]').forEach(link=>link.addEventListener('click',event=>{
    if (event.button!==0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !imageDialog) return;
    event.preventDefault();
    const image = document.createElement('img');
    image.dataset.fullImage = '';
    image.src=link.href; image.alt=link.dataset.caption;
    imageDialog.querySelector('[data-image-canvas]').replaceChildren(image);
    imageDialog.querySelector('[data-image-caption]').textContent=link.dataset.caption;
    showModal(imageDialog);
  }));
  document.querySelector('[data-close-image]')?.addEventListener('click',()=>imageDialog.close());
  const photoDialog=document.getElementById('portrait-view');
  document.querySelector('[data-open-photo]')?.addEventListener('click',event=>{
    if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey) return;
    event.preventDefault();showModal(photoDialog);
  });
  document.querySelector('[data-close-photo]')?.addEventListener('click',()=>photoDialog.close());

  const artStage = document.querySelector('[data-art-stage]');
  const artButton = document.querySelector('[data-art-motion]');
  function stopStudyMotion() {
    document.querySelector('[data-art-stage]')?.classList.remove('is-playing');
    const button=document.querySelector('[data-art-motion]');
    if(button){button.setAttribute('aria-pressed','false');button.textContent='Animer l’étude ↗';}
  }
  artButton?.addEventListener('click',()=>{
    if(reduced()) { artButton.textContent='Animations réduites'; return; }
    const playing=artStage.classList.toggle('is-playing');
    artButton.setAttribute('aria-pressed',String(playing));
    artButton.textContent=playing?'Mettre en pause':'Animer l’étude ↗';
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopStudyMotion();});
  syncMotion();
  if (gsap && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        revealObserver.unobserve(entry.target);
        if (!reduced()) gsap.fromTo(entry.target,{y:18,opacity:.35},{y:0,opacity:1,duration:.65,ease:'power3.out',clearProps:'all'});
      });
    }, {threshold:.06});
    document.querySelectorAll('[data-reveal]').forEach(element=>revealObserver.observe(element));
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

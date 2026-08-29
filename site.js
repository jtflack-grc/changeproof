(() => {
  // Progressive enhancement contract: the static page is visible by default.
  // Only hide/reveal elements when this bootstrap script actually executes.
  document.documentElement.classList.add('js-enabled');

  const showModuleWarning = (src) => {
    if (document.querySelector('.module-load-warning')) return;
    const warning = document.createElement('div');
    warning.className = 'module-load-warning';
    warning.setAttribute('role','status');
    warning.textContent = `Interactive module blocked or unavailable (${src}). Static evidence links remain usable.`;
    document.body.prepend(warning);
  };

  const loadStyle = (href) => {
    if (document.querySelector(`link[href^="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${href}?v=20260829-1`;
    document.head.appendChild(link);
  };

  const loadScript = (src) => {
    if (document.querySelector(`script[src^="${src}"]`)) return;
    const script = document.createElement('script');
    script.src = `${src}?v=20260829-1`;
    script.defer = true;
    script.addEventListener('error',() => showModuleWarning(src),{once:true});
    document.head.appendChild(script);
  };

  loadStyle('portable-core.css');
  loadStyle('ironterm.css');
  loadStyle('review-workspace.css');
  loadStyle('reuse-proof.css');
  loadScript('portable-core.js');
  loadScript('orderpro-preview.js');
  loadScript('review-workspace.js');
  loadScript('reuse-proof.js');
  loadScript('ironterm-experience.js');

  let revealObserver = null;
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
  }

  const bindReveals = (root = document) => {
    const candidates = root.matches?.('.reveal') ? [root] : [...root.querySelectorAll?.('.reveal') || []];
    candidates.forEach((el) => {
      if (el.dataset.revealBound === '1') return;
      el.dataset.revealBound = '1';
      if (revealObserver) revealObserver.observe(el);
      else el.classList.add('is-visible');
    });
  };

  const setTextIfChanged = (element, value) => {
    if (element && element.textContent !== value) element.textContent = value;
  };

  const placeAfter = (anchor, element) => {
    if (anchor && element && anchor.nextElementSibling !== element) {
      anchor.insertAdjacentElement('afterend', element);
    }
  };

  const normalizeNavigation = () => {
    const nav = document.querySelector('.site-header nav');
    if (!nav) return;

    ['#problem','#proof','#evidence'].forEach((href) => {
      const link = nav.querySelector(`a[href="${href}"]`);
      if (link && link.style.display !== 'none') link.style.display = 'none';
    });

    const core = nav.querySelector('a[href="#portable-core"]');
    const reuse = nav.querySelector('a[href="#reuse-proof"]');
    const order = nav.querySelector('a[href="#orderpro-live"]');
    const review = nav.querySelector('a[href="#review"]');
    const ibmi = nav.querySelector('a[href="#ibmi"]');

    if (core && nav.firstElementChild !== core) nav.prepend(core);
    placeAfter(core, reuse);
    placeAfter(reuse || core, order);
    placeAfter(order || reuse || core, review);
    placeAfter(review || order || reuse || core, ibmi);
  };

  const normalizeExperience = () => {
    const portable = document.querySelector('#portable-core');
    const reuse = document.querySelector('#reuse-proof');
    const orderpro = document.querySelector('#orderpro-live');
    const review = document.querySelector('#review');

    // Judge-facing story: portable product first, independent reuse proof second,
    // brownfield reference workload third, then drill into its evidence lineage.
    placeAfter(portable, reuse);
    placeAfter(reuse || portable, orderpro);
    placeAfter(orderpro || reuse || portable, review);

    normalizeNavigation();

    const heroPrimary = document.querySelector('.hero-actions .button-primary');
    if (heroPrimary && portable) {
      if (heroPrimary.getAttribute('href') !== '#portable-core') heroPrimary.setAttribute('href','#portable-core');
      if (!heroPrimary.classList.contains('portable-hero-link')) heroPrimary.classList.add('portable-hero-link');
      heroPrimary.classList.remove('review-hero-link');
      if (heroPrimary.textContent.trim() !== 'See the portable core ↓') heroPrimary.innerHTML = 'See the portable core <span>↓</span>';
    }

    setTextIfChanged(reuse?.querySelector('.reuse-head .eyebrow'), 'Cross-workload / Reuse proof');
    setTextIfChanged(document.querySelector('#sessions .ironterm-intro .eyebrow'), 'IBM i / Evidence sessions');

    const discovered = document.querySelector('.thesis-card.active p');
    if (discovered && discovered.textContent.includes('fulfillment batch begins')) {
      discovered.textContent = 'The preserved CL schedule literal equals the new cutoff — a timing collision the ticket never mentions.';
    }

    const postProof = document.querySelector('.proof-panel.final .proof-list li:nth-child(2)');
    if (postProof && postProof.textContent.includes('Batch moved to 18:15')) {
      const marker = postProof.querySelector('.marker');
      postProof.textContent = 'CL schedule literal moved to 18:15';
      if (marker) postProof.prepend(marker);
    }
  };

  bindReveals();
  normalizeExperience();

  let normalizeQueued = false;
  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) bindReveals(node);
    }));

    if (!normalizeQueued) {
      normalizeQueued = true;
      requestAnimationFrame(() => {
        normalizeQueued = false;
        normalizeExperience();
      });
    }
  });
  mutationObserver.observe(document.body,{childList:true,subtree:true});

  const header = document.querySelector('.site-header');
  window.addEventListener('scroll',() => {
    if (!header) return;
    header.style.borderBottomColor = window.scrollY > 24 ? 'rgba(105,255,164,.22)' : 'rgba(105,255,164,.16)';
  },{passive:true});
})();
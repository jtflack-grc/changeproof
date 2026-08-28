(() => {
  const loadStyle = (href) => {
    if (document.querySelector(`link[href^="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${href}?v=20260828-3`;
    document.head.appendChild(link);
  };

  const loadScript = (src) => {
    if (document.querySelector(`script[src^="${src}"]`)) return;
    const script = document.createElement('script');
    script.src = `${src}?v=20260828-3`;
    document.head.appendChild(script);
  };

  loadStyle('ironterm.css');
  loadStyle('review-workspace.css');
  loadScript('orderpro-preview.js');
  loadScript('review-workspace.js');
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

  bindReveals();
  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) bindReveals(node);
    }));
  });
  mutationObserver.observe(document.body,{childList:true,subtree:true});

  const header = document.querySelector('.site-header');
  window.addEventListener('scroll',() => {
    if (!header) return;
    header.style.borderBottomColor = window.scrollY > 24 ? 'rgba(105,255,164,.22)' : 'rgba(105,255,164,.16)';
  },{passive:true});
})();
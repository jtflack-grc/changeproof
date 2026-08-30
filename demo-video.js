(() => {
  const VIDEO_URL = 'https://github.com/jtflack-grc/changeproof/releases/download/demo-final/changeproof_video.mp4';
  const RELEASE_URL = 'https://github.com/jtflack-grc/changeproof/releases/tag/demo-final';

  function addNav() {
    const nav = document.querySelector('.site-header nav');
    if (!nav || nav.querySelector('a[href="#demo-video"]')) return;
    const link = document.createElement('a');
    link.href = '#demo-video';
    link.textContent = 'Demo';
    nav.prepend(link);
  }

  function addHeroLink() {
    const actions = document.querySelector('.hero-actions');
    if (!actions || actions.querySelector('.demo-hero-link')) return;
    const link = document.createElement('a');
    link.className = 'button button-ghost demo-hero-link';
    link.href = '#demo-video';
    link.innerHTML = 'Watch 2:54 demo <span>↓</span>';
    actions.prepend(link);
  }

  function install() {
    if (document.querySelector('#demo-video')) return true;
    const strip = document.querySelector('.signal-strip');
    if (!strip) return false;

    addNav();
    addHeroLink();

    const section = document.createElement('section');
    section.className = 'section demo-video';
    section.id = 'demo-video';
    section.innerHTML = `
      <div class="demo-video-head reveal">
        <div>
          <p class="eyebrow">Official hackathon demo / 2:54</p>
          <h2>See the whole argument<br /><em>in under three minutes.</em></h2>
        </div>
        <p>
          The demo walks the reusable core, independent REPORT-GW proof, measured impact receipt, ORDERPRO brownfield stress test, evidence lineage, and the explicit IBM i validation boundary.
        </p>
      </div>

      <div class="demo-video-shell reveal">
        <div class="demo-video-frame">
          <video controls playsinline preload="metadata" aria-label="ChangeProof official hackathon demo video">
            <source src="${VIDEO_URL}" type="video/mp4" />
            Your browser cannot play this video inline. Use the direct video link below.
          </video>
        </div>
        <div class="demo-video-meta">
          <div><span>Runtime</span><strong>2:54</strong></div>
          <div><span>Source</span><strong>GitHub Release / demo-final</strong></div>
          <div><span>Format</span><strong>MP4 · public</strong></div>
        </div>
        <div class="demo-video-actions">
          <a class="button button-primary" href="${VIDEO_URL}" target="_blank" rel="noreferrer">Open video directly <span>↗</span></a>
          <a class="button button-ghost" href="${RELEASE_URL}" target="_blank" rel="noreferrer">View GitHub Release <span>↗</span></a>
        </div>
      </div>
    `;

    strip.insertAdjacentElement('afterend', section);
    return true;
  }

  if (!install()) {
    const observer = new MutationObserver(() => {
      if (install()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();

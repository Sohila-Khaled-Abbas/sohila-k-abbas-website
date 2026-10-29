'use strict';

// Animation stays optional and follows the visitor's operating-system preference.
const motionControl = document.querySelector('[data-motion-toggle]');
if (motionControl) {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  try { paused = localStorage.getItem('sohila-motion') === 'paused'; } catch { /* Session controls still work. */ }
  function setMotion() {
    const reduced = reduceMotion.matches;
    document.documentElement.classList.toggle('motion-ready', !reduced);
    document.documentElement.classList.toggle('motion-paused', paused || reduced);
    motionControl.disabled = reduced;
    motionControl.textContent = reduced ? 'Animation off · reduced motion' : paused ? 'Play animation' : 'Pause animation';
    motionControl.setAttribute('aria-pressed', String(paused || reduced));
  }
  motionControl.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('sohila-motion', paused ? 'paused' : 'playing'); } catch { /* Optional preference. */ }
    setMotion();
  });
  reduceMotion.addEventListener('change', setMotion);
  const art = document.querySelector('.hero-art');
  if ('IntersectionObserver' in window && art) new IntersectionObserver(entries => {
    art.classList.toggle('motion-idle', !entries[0].isIntersecting);
  }).observe(art);
  document.addEventListener('visibilitychange', () => art?.classList.toggle('motion-background', document.hidden));
  setMotion();
}

// Report search is URL-addressable so a filtered collection can be shared.
const reportQuery = document.querySelector('#dashboard-query');
if (reportQuery) {
  const cards = [...document.querySelectorAll('[data-report-card]')];
  const filters = [...document.querySelectorAll('[data-dashboard-filter]')];
  const params = new URLSearchParams(location.search);
  let filter = filters.some(b => b.dataset.dashboardFilter === params.get('view')) ? params.get('view') : 'all';
  reportQuery.value = params.get('q') || '';
  const normalize = text => text.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase();
  function filterReports(updateUrl = true) {
    const terms = normalize(reportQuery.value.trim()).split(/\s+/).filter(Boolean);
    let count = 0;
    cards.forEach(card => {
      const match = (filter === 'all' || (filter === 'screenshots' ? card.dataset.hasImages === 'true' : card.dataset.access === filter)) && terms.every(t => normalize(card.dataset.reportSearch).includes(t));
      card.hidden = !match;
      if (match) count++;
    });
    filters.forEach(button => {
      const active = button.dataset.dashboardFilter === filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelector('#dashboard-status').textContent = `Showing ${count} of ${cards.length} reporting projects`;
    document.querySelector('#dashboard-empty').hidden = count !== 0;
    if (updateUrl) {
      const p = new URLSearchParams();
      if (reportQuery.value) p.set('q', reportQuery.value);
      if (filter !== 'all') p.set('view', filter);
      history.replaceState(null, '', location.pathname + (p.size ? '?' + p : '') + location.hash);
    }
  }
  reportQuery.addEventListener('input', () => filterReports());
  filters.forEach(button => button.addEventListener('click', () => { filter = button.dataset.dashboardFilter; filterReports(); }));
  document.querySelector('[data-reset-dashboards]').addEventListener('click', () => { filter = 'all'; reportQuery.value = ''; filterReports(); reportQuery.focus(); });
  filterReports(false);
}

// Power BI is requested only after a deliberate click; authenticated shares are never embedded.
document.querySelectorAll('[data-load-report]').forEach(button => button.addEventListener('click', () => {
  const url = new URL(button.dataset.loadReport);
  if (url.origin !== 'https://app.powerbi.com' || url.pathname !== '/view' || !url.searchParams.get('r')) return;
  const frame = document.createElement('iframe');
  frame.src = url.href;
  frame.title = button.dataset.reportTitle + ' — interactive Power BI report';
  frame.allowFullscreen = true;
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.setAttribute('allow', 'fullscreen');
  const shell = button.closest('.report-embed-shell');
  shell.querySelector('.report-embed-host').append(frame);
  shell.querySelector('.report-load-prompt').hidden = true;
  frame.focus();
}));

// Native dialog provides focus containment and Escape; arrows navigate the screenshot group.
const screenshotDialog = document.querySelector('#preview-dialog');
if (screenshotDialog) {
  const triggers = [...document.querySelectorAll('[data-lightbox]')];
  const photo = document.querySelector('#preview-image');
  const previous = screenshotDialog.querySelector('[data-preview-prev]');
  const next = screenshotDialog.querySelector('[data-preview-next]');
  let group = [], index = 0, opener;
  function showPhoto() {
    const trigger = group[index];
    photo.src = trigger.href;
    photo.alt = trigger.querySelector('img')?.alt || trigger.dataset.caption;
    document.querySelector('#preview-title').textContent = trigger.dataset.caption;
    document.querySelector('#preview-position').textContent = `${index + 1} / ${group.length} · Screenshot`;
    previous.hidden = next.hidden = group.length < 2;
  }
  triggers.forEach(trigger => trigger.addEventListener('click', event => {
    event.preventDefault();
    opener = trigger;
    group = triggers.filter(t => t.dataset.lightbox === trigger.dataset.lightbox);
    index = group.indexOf(trigger);
    showPhoto();
    document.body.classList.add('preview-open');
    screenshotDialog.showModal();
    screenshotDialog.querySelector('[data-preview-close]').focus();
  }));
  const move = direction => { index = (index + direction + group.length) % group.length; showPhoto(); };
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  screenshotDialog.querySelector('[data-preview-close]').addEventListener('click', () => screenshotDialog.close());
  screenshotDialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
  });
  screenshotDialog.addEventListener('click', event => {
    const rect = screenshotDialog.getBoundingClientRect();
    if (event.target === screenshotDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) screenshotDialog.close();
  });
  screenshotDialog.addEventListener('close', () => {
    document.body.classList.remove('preview-open');
    photo.removeAttribute('src');
    opener?.focus({preventScroll: true});
  });
}

document.querySelectorAll('[data-copy-page]').forEach(button => button.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(location.origin + location.pathname); toast('Project link copied.'); }
  catch { toast('Copy this page’s address from your browser.'); }
}));

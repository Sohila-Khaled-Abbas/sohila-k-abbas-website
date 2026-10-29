'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const externalIcon = '<svg class="icon"><use href="#external"/></svg>';

// Store only the visitor's preferred color theme.
const themeButton = $('.theme-toggle');
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeButton.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
}
try { applyTheme(localStorage.getItem('sohila-theme') || 'light'); } catch { applyTheme('light'); }
themeButton.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(theme);
  try { localStorage.setItem('sohila-theme', theme); } catch { /* Theme still works for this visit. */ }
});

const menuButton = $('.menu-toggle');
function closeMenu() {
  $('#navigation').classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
}
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
  $('#navigation').classList.toggle('open', expanded);
  menuButton.setAttribute('aria-expanded', String(expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Close menu' : 'Open menu');
});
$$('#navigation a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

$$('.filter').forEach(button => button.addEventListener('click', () => {
  $$('.filter').forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  let count = 0;
  $$('.project').forEach(card => {
    const visible = button.dataset.filter === 'all' || card.dataset.categories.split(' ').includes(button.dataset.filter);
    card.hidden = !visible;
    if (visible) count++;
  });
  $('#filter-status').textContent = `Showing ${count} ${button.dataset.filter === 'all' ? '' : button.textContent.trim() + ' '}project${count === 1 ? '' : 's'}`;
}));

const processContent = {
  question: `<span class="demo-step">STEP 01 / THE QUESTION</span><h3 class="demo-title">What did we actually sell?</h3><p class="demo-description">A sales total needs a definition. Does it include pending orders, returns, or records without a valid amount?</p><div class="question-box"><strong>Define the metric before the chart.</strong><p>For this example: sum the EGP amount of completed orders with a valid amount. Keep pending orders separate.</p></div><p class="demo-note">Grain: one row per order. Currency: EGP.</p>`,
  quality: `<span class="demo-step">STEP 02 / THE CHECKS</span><h3 class="demo-title">A missing value tells a story.</h3><table class="demo-table"><thead><tr><th scope="col">ORDER</th><th scope="col">AMOUNT</th><th scope="col">STATUS</th><th scope="col">TREATMENT</th></tr></thead><tbody><tr><td>EG-101</td><td>850</td><td>Completed</td><td><span class="data-flag data-pass">Include</span></td></tr><tr><td>EG-102</td><td>620</td><td>Completed</td><td><span class="data-flag data-pass">Include</span></td></tr><tr><td>EG-103</td><td>NULL</td><td>Pending</td><td><span class="data-flag">Keep separate</span></td></tr></tbody></table><p class="demo-note">A pending order with no final amount is not zero revenue. Preserve the null and its business context.</p>`,
  insight: `<span class="demo-step">STEP 03 / THE ANSWER</span><h3 class="demo-title">A number you can explain.</h3><div class="demo-result"><strong>1,470 <small>EGP · COMPLETED ORDER VALUE</small></strong><span>2 completed orders<br>1 pending order excluded</span></div><p class="demo-description">850 + 620 = 1,470 EGP. The pending order stays visible for follow-up, without distorting the completed-order metric.</p><p class="demo-note">A clear definition makes the result reproducible.</p>`
};
function selectStep(button) {
  $$('.process-tab').forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
  });
  $('#process-panel').innerHTML = processContent[button.dataset.step];
  $('#process-panel').setAttribute('aria-labelledby', button.id);
}
$$('.process-tab').forEach((button, index, buttons) => {
  button.addEventListener('click', () => selectStep(button));
  button.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % buttons.length;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = buttons.length - 1;
    if (next !== undefined) { event.preventDefault(); selectStep(buttons[next]); buttons[next].focus(); }
  });
});
if ($('.process-tab')) selectStep($('.process-tab'));


// Case studies have permanent URLs that can be shared independently.
const caseRoutes = {cosmetics:'egyptian-cosmetics-market',pixelfed:'pixelfed-analytics-engineering',kickstarter:'kickstarter-analytics-engineering',n8n:'n8n-production-queue-setup'};
$$('[data-project]').forEach(button => button.addEventListener('click', () => {
  const slug=caseRoutes[button.dataset.project];
  if(slug) window.location.assign('/projects/'+slug+'/');
}));
let toastTimer;
function toast(message) {
  const el=$('#toast'); if(!el) return;
  el.textContent=message; el.classList.add('visible');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('visible'),3500);
}
$$('.copy-email').forEach(button=>button.addEventListener('click',async()=>{
  try { await navigator.clipboard.writeText('sohila.k.data@gmail.com'); toast('Email copied. Let’s connect!'); }
  catch { toast('Email: sohila.k.data@gmail.com'); }
}));
$$('[data-print]').forEach(button=>button.addEventListener('click',()=>window.print()));
if($('#year')) $('#year').textContent=String(new Date().getFullYear());

// Filter the pre-rendered collection; the full directory also works without JavaScript.
if ($('#repo-grid')) {
  const grid=$('#repo-grid'), cards=$$('.repo-card',grid);
  const query=$('#repo-query'),kind=$('#repo-kind'),sort=$('#repo-sort');
  const buttons=$$('.repo-filter'),more=$('#repo-more');
  let category='all',limit=12;
  const normalize=value=>value.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase();
  const params=new URLSearchParams(location.search);
  query.value=params.get('q')||'';
  if(['all','original','fork'].includes(params.get('kind')))kind.value=params.get('kind');
  if(['featured','recent','name'].includes(params.get('sort')))sort.value=params.get('sort');
  if(buttons.some(b=>b.dataset.repoFilter===params.get('category')))category=params.get('category');
  function render(updateUrl=true){
    const terms=normalize(query.value.trim()).split(/\s+/).filter(Boolean);
    const matches=cards.filter(card=>(category==='all'||card.dataset.category===category)&&(kind.value==='all'||card.dataset.kind===kind.value)&&terms.every(term=>normalize(card.dataset.search).includes(term)));
    matches.sort((a,b)=>{
      if(sort.value==='name')return a.dataset.name.localeCompare(b.dataset.name);
      if(sort.value==='featured'){const rank=Number(b.dataset.featured==='true')-Number(a.dataset.featured==='true');if(rank)return rank;}
      return Date.parse(b.dataset.updated)-Date.parse(a.dataset.updated);
    });
    cards.forEach(card=>card.hidden=true);
    matches.forEach((card,index)=>{grid.append(card);card.hidden=index>=limit;});
    buttons.forEach(button=>{const active=button.dataset.repoFilter===category;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
    const visible=Math.min(limit,matches.length);
    $('#repo-status').textContent=`Showing ${visible} of ${matches.length} ${matches.length===1?'repository':'repositories'}`;
    $('#repo-empty').hidden=matches.length!==0;
    more.hidden=matches.length<=limit;
    if(!more.hidden)more.firstChild.textContent=`Show ${Math.min(12,matches.length-limit)} more repositories `;
    $('#repo-reset').hidden=!query.value&&kind.value==='all'&&category==='all'&&sort.value==='featured';
    if(updateUrl){const p=new URLSearchParams();if(query.value)p.set('q',query.value);if(category!=='all')p.set('category',category);if(kind.value!=='all')p.set('kind',kind.value);if(sort.value!=='featured')p.set('sort',sort.value);history.replaceState(null,'',location.pathname+(p.size?'?'+p.toString():'')+location.hash);}
  }
  buttons.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.repoFilter;limit=12;render();}));
  [kind,sort].forEach(select=>select.addEventListener('change',()=>{limit=12;render();}));
  query.addEventListener('input',()=>{limit=12;render();});
  const reset=()=>{query.value='';kind.value='all';sort.value='featured';category='all';limit=12;render();query.focus();};
  $('#repo-reset').addEventListener('click',reset);
  $$('[data-reset-repos]').forEach(button=>button.addEventListener('click',reset));
  more.addEventListener('click',()=>{const oldLimit=limit;limit+=12;render();const visible=$$('.repo-card:not([hidden])',grid);const firstNew=visible[oldLimit]?.querySelector('.repo-name');firstNew?.focus();});
  window.addEventListener('pageshow',()=>render(false));
  render(false);
}

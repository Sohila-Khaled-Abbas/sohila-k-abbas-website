import {OWNER,publicRecord} from './project-catalog.mjs';
const grid=document.querySelector('#repo-grid');
const detail=document.querySelector('[data-github-project]');
const status=document.querySelector('#github-refresh-status');
const key='sohila-public-projects-v1',ttl=15*60*1000;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names={analytics:'BI & analytics',engineering:'Data engineering',automation:'Automation & AI',apps:'Apps & tools',learning:'Learning & resources'};
const date=v=>{const d=new Date(v);return Number.isNaN(d.getTime())?'Date unavailable':d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});};
function newCard(r){
  const article=document.createElement('article');
  article.className=`repo-card studio-project-card ${r.category}`;
  Object.assign(article.dataset,{name:r.name,category:r.category,kind:r.fork?'fork':'original',status:'portfolio',updated:r.pushed_at||r.updated_at,featured:'false',search:[r.name,r.description,r.language,...r.topics].join(' ').toLowerCase()});
  article.innerHTML=`<a href="${esc(r.url)}" class="studio-project-cover" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(r.name)} on GitHub"><div class="project-visual visual-source"><div class="source-window-top"><span aria-hidden="true">● ● ●</span><span>github / public project</span></div><div class="source-file-preview"><div><span class="source-line">01</span><span class="source-file">${esc(r.name)}</span></div><div><span class="source-line">02</span><span class="source-file">Code & documentation</span></div></div><div class="source-preview-bottom"><span>${esc(r.language||'Public repository')}</span><span>↗</span></div><span class="visual-type">New from GitHub</span></div></a><div class="studio-project-copy"><div class="project-card-meta"><span>${r.fork?'LEARNING FORK · SEE UPSTREAM ON GITHUB':esc(names[r.category])}${r.archived?' · ARCHIVED':''}</span></div><h3><a class="repo-name" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.name.replace(/[-_]/g,' '))}</a></h3><p>${esc(r.description||'Explore this public project and its documentation on GitHub.')}</p><div class="project-tool-list">${[r.language,...r.topics].filter(Boolean).slice(0,4).map(t=>`<span>${esc(t)}</span>`).join('')}</div><p class="github-activity" data-source-updated>Source updated ${esc(date(r.pushed_at||r.updated_at))}</p><div class="studio-card-bottom"><a class="text-link" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">Open source ↗</a>${r.homepage?`<a class="text-link" href="${esc(r.homepage)}" target="_blank" rel="noopener noreferrer">Open website ↗</a>`:''}</div></div>`;
  return article;
}
function apply(records,checkedAt){
  if(grid){
    const existing=new Map([...grid.querySelectorAll('.repo-card')].map(c=>[c.dataset.name,c]));
    const available=new Set(records.map(r=>r.name));
    for(const [name,card]of existing)if(!available.has(name))card.remove();
    for(const r of records){
      const card=existing.get(r.name);
      if(!card){grid.append(newCard(r));continue;}
      card.dataset.updated=r.pushed_at||r.updated_at;
      card.dataset.search=[card.dataset.search,r.description,r.language,...r.topics].join(' ').toLowerCase();
      let activity=card.querySelector('[data-source-updated]');
      if(!activity){activity=document.createElement('p');activity.className='github-activity';activity.dataset.sourceUpdated='';card.querySelector('.studio-card-bottom').before(activity);}
      activity.textContent=`Source updated ${date(r.pushed_at||r.updated_at)}`;
    }
    grid.dispatchEvent(new CustomEvent('portfolio:repos-updated',{bubbles:true}));
    document.querySelectorAll('[data-public-count]').forEach(el=>el.textContent=records.length);
  }
  if(detail){
    const r=records.find(r=>r.name===detail.dataset.githubProject);
    if(r){
      const time=detail.querySelector('time');if(time){time.dateTime=r.pushed_at||r.updated_at;time.textContent=date(r.pushed_at||r.updated_at);}
      const description=detail.querySelector('[data-current-description]');if(description)description.textContent=r.description||'See the current repository documentation.';
      const live=detail.querySelector('[data-current-website]');if(live){live.hidden=!r.homepage;if(r.homepage)live.href=r.homepage;}
    }
  }
  if(status)status.textContent=`Public GitHub metadata checked ${new Date(checkedAt).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'})}.`;
}
async function refresh(){
  if(!grid&&!detail)return;
  try{
    let cache;try{cache=JSON.parse(localStorage.getItem(key));}catch{}
    // Cached records came from the validated public endpoint; never execute repository content.
    if(cache?.version===1&&Array.isArray(cache.records)&&Date.now()-cache.at<ttl){apply(cache.records,cache.at);return;}
    const records=[],seen=new Set();
    for(let page=1;page<=50;page++){
      const response=await fetch(`https://api.github.com/users/${OWNER}/repos?per_page=100&sort=full_name&direction=asc&page=${page}`,{credentials:'omit',headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(12000)});
      if(!response.ok)throw new Error('GitHub refresh unavailable');
      const batch=await response.json();if(!Array.isArray(batch))throw new Error('Invalid response');
      for(const raw of batch){const r=publicRecord(raw);if(r&&!seen.has(r.id)){records.push(r);seen.add(r.id);}}
      if(batch.length<100){
        if(!records.length)throw new Error('Empty response');
        const at=Date.now();apply(records,at);try{localStorage.setItem(key,JSON.stringify({version:1,at,records}));}catch{}return;
      }
    }
    throw new Error('Incomplete response');
  }catch{if(status)status.textContent='Showing the latest published snapshot. Live GitHub refresh is temporarily unavailable.';}
}
refresh();

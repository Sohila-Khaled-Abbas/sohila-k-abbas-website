'use strict';

const finder = document.querySelector('#project-finder');
if (finder) {
  const index = JSON.parse(document.querySelector('#project-search-index').textContent);
  const query = finder.querySelector('#finder-query');
  const results = finder.querySelector('#finder-results');
  const status = finder.querySelector('#finder-status');
  let finderOpener;
  const normalize = text => String(text).normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase();
  function searchProjects() {
    const terms = normalize(query.value.trim()).split(/\s+/).filter(Boolean);
    const matches = index.filter(item => terms.every(term => normalize(item.title + ' ' + item.repo + ' ' + item.tags.join(' ')).includes(term)));
    matches.sort((a,b) => Number(normalize(b.title).startsWith(normalize(query.value))) - Number(normalize(a.title).startsWith(normalize(query.value))));
    results.replaceChildren();
    status.textContent = terms.length ? `${matches.length} ${matches.length===1?'project':'projects'} found` : 'Start with a project, a tool, or a topic.';
    matches.slice(0,12).forEach(item => {
      const anchor = document.createElement('a');
      anchor.className = 'finder-result';
      anchor.href = item.url;
      const title = document.createElement('strong');title.textContent = item.title;
      const tags = document.createElement('span');tags.textContent = item.tags.slice(0,5).join(' · ') || item.repo;
      anchor.append(title,tags);results.append(anchor);
    });
    if(!matches.length){const empty=document.createElement('p');empty.className='finder-empty';empty.textContent='No projects match. Try a shorter name or another tool.';results.append(empty);}
  }
  function openFinder(){
    if(document.querySelector('dialog[open]'))return;
    finderOpener=document.activeElement;
    query.value='';searchProjects();finder.showModal();query.focus();
  }
  document.querySelectorAll('[data-open-finder]').forEach(button=>button.addEventListener('click',openFinder));
  finder.querySelector('[data-finder-close]').addEventListener('click',()=>finder.close());
  query.addEventListener('input',searchProjects);
  finder.addEventListener('close',()=>finderOpener?.focus({preventScroll:true}));
  finder.addEventListener('keydown',event=>{
    const links=[...results.querySelectorAll('a')];
    const selected=links.indexOf(document.activeElement);
    if(event.key==='ArrowDown'){event.preventDefault();links[Math.min(selected+1,links.length-1)]?.focus();}
    if(event.key==='ArrowUp'){event.preventDefault();if(selected<=0)query.focus();else links[selected-1].focus();}
    if(event.key==='Enter'&&document.activeElement===query&&links[0]){event.preventDefault();links[0].click();}
  });
  finder.addEventListener('click',event=>{const r=finder.getBoundingClientRect();if(event.target===finder&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))finder.close();});
  document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();if(finder.open)finder.close();else openFinder();}});
}

const viewButtons=[...document.querySelectorAll('[data-project-view]')];
if(viewButtons.length){
  const grid=document.querySelector('#repo-grid');
  function setProjectView(view,updateUrl=true){
    const list=view==='list';grid.classList.toggle('list-view',list);grid.dataset.view=list?'list':'grid';
    viewButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.projectView===(list?'list':'grid'))));
    if(updateUrl){const p=new URLSearchParams(location.search);if(list)p.set('view','list');else p.delete('view');history.replaceState(null,'',location.pathname+(p.size?'?'+p:'')+location.hash);}
  }
  setProjectView(new URLSearchParams(location.search).get('view'),false);
  viewButtons.forEach(b=>b.addEventListener('click',()=>setProjectView(b.dataset.projectView)));
}

const navMore=document.querySelector('.nav-more');
if(navMore){
  document.addEventListener('click',event=>{if(!navMore.contains(event.target))navMore.open=false;});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')navMore.open=false;});
}

const brief=document.querySelector('#project-brief');
if(brief){
  brief.addEventListener('submit',event=>{
    event.preventDefault();
    if(!brief.reportValidity())return;
    const fields=new FormData(brief);
    const subject=`Portfolio enquiry · ${fields.get('focus')}`;
    const body=`Hello Sohila,\n\nMy name is ${fields.get('name')}.\nEmail: ${fields.get('email')}\nProject focus: ${fields.get('focus')}\n\n${fields.get('brief')}\n\nThank you.`;
    document.querySelector('#brief-email-link').href='mailto:sohila.k.data@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
    brief.querySelector('.brief-result').hidden=false;
    document.querySelector('#brief-email-link').focus();
  });
  brief.addEventListener('input',()=>brief.querySelector('.brief-result').hidden=true);
}

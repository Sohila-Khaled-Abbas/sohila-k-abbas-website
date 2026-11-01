(()=>{
  const input=document.querySelector('#course-query');if(!input)return;
  const cards=[...document.querySelectorAll('.course-card')],buttons=[...document.querySelectorAll('[data-course-filter]')];
  const status=document.querySelector('#course-results'),reset=document.querySelector('#course-reset'),empty=document.querySelector('#course-empty');
  const allowed=new Set(buttons.map(b=>b.dataset.courseFilter));let track='all';
  const normalize=s=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function readState(){const params=new URLSearchParams(location.search);input.value=(params.get('q')||'').slice(0,200);track=allowed.has(params.get('track'))?params.get('track'):'all';}
  function render(updateUrl=true){
    const terms=normalize(input.value.trim()).split(/\s+/).filter(Boolean);let visible=0;
    for(const card of cards){const search=normalize(card.dataset.courseSearch);const show=(track==='all'||track===card.dataset.courseTrack)&&terms.every(term=>search.includes(term));card.hidden=!show;if(show)visible++;}
    for(const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.courseFilter===track));
    const active=track!=='all'||terms.length>0;reset.hidden=!active;empty.hidden=visible!==0;
    status.textContent=visible+' enrolled '+(visible===1?'course':'courses')+(active?' matching your filters':'');
    if(updateUrl){const url=new URL(location.href);url.searchParams.delete('q');url.searchParams.delete('track');if(input.value.trim())url.searchParams.set('q',input.value.trim());if(track!=='all')url.searchParams.set('track',track);history.replaceState(null,'',url.pathname+url.search+url.hash);}
  }
  input.addEventListener('input',()=>render());
  for(const button of buttons)button.addEventListener('click',()=>{track=button.dataset.courseFilter;render();});
  function clear(){input.value='';track='all';render();input.focus();}
  reset.addEventListener('click',clear);document.querySelector('[data-course-reset]').addEventListener('click',clear);
  addEventListener('popstate',()=>{readState();render(false);});readState();render(false);
})();

(()=>{
 const root=document.querySelector('[data-project-story]');if(!root)return;
 const links=[...root.querySelectorAll('[data-story-chapter]')],panels=[...root.querySelectorAll('[data-story-panel]')];
 const previous=root.querySelector('[data-story-previous]'),next=root.querySelector('[data-story-next]'),view=root.querySelector('[data-story-view]');
 const ids=links.map(link=>link.dataset.storyChapter);let current=0,full=false;
 const aliases={problem:'question',approach:'build',explore:'result','project-files':'evidence',interactive:'result','report-preview':'result'};
 function fromHash(){let hash=location.hash.slice(1);try{hash=decodeURIComponent(hash);}catch{/* Keep malformed fragments harmless. */}if(!hash||hash==='project-story')return 0;return ids.indexOf(aliases[hash]||hash.replace(/^story-/,''));}
 function show(index,{navigate=false,scroll=false}={}){
  current=Math.max(0,Math.min(ids.length-1,index));
  panels.forEach((panel,i)=>{panel.hidden=!full&&i!==current;});
  links.forEach((link,i)=>{if(i===current)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
  root.querySelector('progress').value=current+1;
  root.querySelector('[data-story-position]').textContent=(full?'Full story · ':'')+'Chapter '+(current+1)+' of '+ids.length+' · '+links[current].querySelector('strong').textContent;
  root.querySelector('[data-story-page-label]').textContent=String(current+1).padStart(2,'0')+' / 04';
  previous.disabled=current===0;next.disabled=current===ids.length-1;
  if(navigate)history.pushState(null,'','#story-'+ids[current]);
  if(scroll){const target=full?panels[current]:root.querySelector('.story-chapters');target.scrollIntoView({block:'start',behavior:'instant'});links[current].focus({preventScroll:true});}
 }
 root.querySelectorAll('.story-reading-position,.story-paging,[data-story-view]').forEach(el=>{el.hidden=false;});
 for(const [index,link]of links.entries())link.addEventListener('click',event=>{event.preventDefault();show(index,{navigate:true,scroll:true});});
 previous.addEventListener('click',()=>show(current-1,{navigate:true,scroll:true}));next.addEventListener('click',()=>show(current+1,{navigate:true,scroll:true}));
 view.addEventListener('click',()=>{full=!full;view.setAttribute('aria-pressed',String(full));view.textContent=full?'Use the guided reader':'Read the full story';show(current);});
 const onHistory=()=>{const index=fromHash();if(index>=0)show(index);};addEventListener('hashchange',onHistory);addEventListener('popstate',onHistory);
 show(Math.max(0,fromHash()));
 const copy=root.querySelector('[data-story-copy]');copy.addEventListener('click',async()=>{const url=new URL(location.href);url.hash='story-'+ids[current];try{await navigator.clipboard.writeText(url.href);copy.textContent='Chapter link copied';}catch{copy.textContent='Copy this page address from your browser';}});
 const form=root.querySelector('.story-file-controls');if(!form)return;
 const input=form.querySelector('input'),filters=[...form.querySelectorAll('[data-story-file-filter]')],files=[...root.querySelectorAll('[data-story-file]')];let kind='all';
 const status=root.querySelector('.story-file-status'),empty=root.querySelector('.story-files-empty');
 function filter(){let count=0;const query=input.value.trim().toLowerCase();files.forEach(file=>{file.hidden=!(kind==='all'||file.dataset.storyFile===kind)||!file.dataset.fileName.includes(query);if(!file.hidden)count++;});filters.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.storyFileFilter===kind)));status.textContent=count+' of '+files.length+' linked source '+(files.length===1?'file':'files');empty.hidden=count>0;}
 form.addEventListener('submit',event=>event.preventDefault());input.addEventListener('input',filter);
 filters.forEach(button=>button.addEventListener('click',()=>{kind=button.dataset.storyFileFilter;filter();}));
 root.querySelector('[data-story-files-reset]').addEventListener('click',()=>{kind='all';input.value='';filter();input.focus();});
})();

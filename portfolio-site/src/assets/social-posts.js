(()=>{
 const cards=[...document.querySelectorAll('[data-post-group]')];if(!cards.length)return;
 const filters=[...document.querySelectorAll('[data-post-filter]')],status=document.querySelector('#social-post-status');
 const allowed=new Set(['all','latest','popular']);
 function filter(value,update=true){const group=allowed.has(value)?value:'all';let count=0;cards.forEach(card=>{card.hidden=group!=='all'&&card.dataset.postGroup!==group;if(!card.hidden)count++;});filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.postFilter===group)));status.textContent=count+' selected '+(count===1?'post':'posts');if(update){const url=new URL(location.href);url.searchParams.delete('view');if(group!=='all')url.searchParams.set('view',group);history.replaceState(null,'',url.pathname+url.search+url.hash);}}
 filters.forEach(b=>b.addEventListener('click',()=>filter(b.dataset.postFilter)));filter(new URLSearchParams(location.search).get('view'),false);
 addEventListener('popstate',()=>filter(new URLSearchParams(location.search).get('view'),false));
 for(const button of document.querySelectorAll('[data-load-linkedin]'))button.addEventListener('click',()=>{
  let url;try{url=new URL(button.dataset.loadLinkedin);if(url.origin!=='https://www.linkedin.com'||!/^\/embed\/feed\/update\/urn:li:(?:share|ugcPost):\d+$/.test(url.pathname))return;}catch{return;}
  const host=button.closest('.social-post-copy').querySelector('.social-embed-host'),frame=document.createElement('iframe');
  frame.src=url.href;frame.title='LinkedIn post: '+button.dataset.postTitle;frame.loading='lazy';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox');
  host.querySelector('.social-embed-frame').replaceChildren(frame);host.hidden=false;button.hidden=true;host.querySelector('[data-close-linkedin]').focus({preventScroll:true});
 });
 for(const close of document.querySelectorAll('[data-close-linkedin]'))close.addEventListener('click',()=>{const host=close.closest('.social-embed-host'),button=host.closest('.social-post-copy').querySelector('[data-load-linkedin]');host.querySelector('.social-embed-frame').replaceChildren();host.hidden=true;button.hidden=false;button.focus();});
})();

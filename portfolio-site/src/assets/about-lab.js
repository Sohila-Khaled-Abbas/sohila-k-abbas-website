(()=>{
 const controls=[...document.querySelectorAll('[data-about-mode]')],panels=[...document.querySelectorAll('.about-system-panel')];
 if(!controls.length)return;
 const status=document.querySelector('#about-mode-status');
 for(const control of controls)control.addEventListener('click',()=>{
   for(const button of controls)button.setAttribute('aria-pressed',String(button===control));
   for(const panel of panels)panel.hidden=panel.id!=='system-'+control.dataset.aboutMode;
   status.textContent=control.textContent+' workflow selected.';
 });
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const counts=[...document.querySelectorAll('[data-about-count]')];
 if(!('IntersectionObserver' in window)||reduced.matches)return;
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);
   if(document.documentElement.classList.contains('motion-paused'))continue;
   const target=Number(entry.target.dataset.aboutCount),start=performance.now();
   function tick(now){const progress=Math.min(1,(now-start)/650);entry.target.textContent=String(Math.round(target*(1-Math.pow(1-progress,3))));if(progress<1&&!reduced.matches&&!document.documentElement.classList.contains('motion-paused'))requestAnimationFrame(tick);else entry.target.textContent=String(target);}
   requestAnimationFrame(tick);
  }
 },{threshold:.5});
 counts.forEach(el=>observer.observe(el));
})();

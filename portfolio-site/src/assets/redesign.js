(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches || !('IntersectionObserver' in window)) return;
  const selectors = [
    '.signature-hero .hero-copy > *','.signature-hero .hero-art',
    '.studio-spotlight-grid > .studio-project-card','.home-testimonial-card',
    '.home-process-steps > li','.studio-story','.studio-community-links > a',
    '.services-teaser-grid > a','.service-list > article','.page-intro',
    '.credential-grid > article','.community-role-list > article'
  ];
  const targets=[...document.querySelectorAll(selectors.join(','))];
  if(!targets.length)return;
  document.documentElement.classList.add('reveal-ready');
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      entry.target.classList.add('is-visible');
      entry.target.classList.remove('reveal-pending');
      observer.unobserve(entry.target);
    }
  },{threshold:.12,rootMargin:'0px 0px -36px 0px'});
  targets.forEach((element,index)=>{
    element.setAttribute('data-reveal','');
    element.classList.add('reveal-pending');
    element.style.setProperty('--reveal-delay',`${Math.min(index%4,3)*75}ms`);
    observer.observe(element);
  });
  reduceMotion.addEventListener('change',event=>{
    if(!event.matches)return;
    observer.disconnect();
    targets.forEach(element=>element.classList.remove('reveal-pending'));
    document.documentElement.classList.remove('reveal-ready');
  });
})();

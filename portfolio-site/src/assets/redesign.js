(() => {
  'use strict';

  function announce(button,message){
    let status=button.parentElement.querySelector('[data-copy-page-status]');
    if(!status){
      status=document.createElement('span');
      status.className='copy-page-status';
      status.setAttribute('role','status');
      status.setAttribute('aria-live','polite');
      status.dataset.copyPageStatus='';
      button.insertAdjacentElement('afterend',status);
    }
    status.textContent=message;
  }

  document.addEventListener('click',async event=>{
    const button=event.target.closest('[data-copy-page]');
    if(!button)return;
    event.preventDefault();
    const pageUrl=window.location.origin+window.location.pathname;
    try{
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(pageUrl);
      const fallback=button.parentElement.querySelector('.copy-page-fallback');
      if(fallback)fallback.remove();
      button.textContent='Copied';
      button.setAttribute('aria-label','Page link copied');
      announce(button,'This page URL was copied to the clipboard.');
      window.setTimeout(()=>{
        button.textContent='Copy page link';
        button.setAttribute('aria-label','Copy this page URL');
      },2200);
    }catch{
      let field=button.parentElement.querySelector('.copy-page-fallback');
      if(!field){
        field=document.createElement('label');
        field.className='copy-page-fallback';
        const caption=document.createElement('span');
        caption.textContent='Copy this URL manually';
        const input=document.createElement('input');
        input.type='text';input.readOnly=true;input.autocomplete='off';
        field.append(caption,input);
        button.insertAdjacentElement('afterend',field);
      }
      const input=field.querySelector('input');
      input.value=pageUrl;input.focus();input.select();
      announce(button,'Clipboard access is unavailable. The page URL is selected; press Ctrl+C or Command+C to copy it.');
    }
  });

  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-print-resume]');
    if(button){event.preventDefault();window.print();}
  });

  const previewSelector=[
    '.editorial-case-visual img','.dashboard-cover img','.report-main-preview img',
    '.report-thumbnails img','.project-visual img','.story-preview img','.project-large-image img'
  ].join(',');
  document.querySelectorAll(previewSelector).forEach(img=>{
    img.addEventListener('error',()=>{
      img.hidden=true;
      let fallback=img.parentElement.querySelector('.image-fallback');
      if(!fallback){
        fallback=document.createElement('span');
        fallback.className='image-fallback';
        fallback.textContent='Preview unavailable. Use the report and source links below.';
        img.insertAdjacentElement('afterend',fallback);
      }
      fallback.hidden=false;
    },{once:true});
  });
})();

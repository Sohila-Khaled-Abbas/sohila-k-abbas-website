import {validateInquiry} from './inquiry-rules.mjs';

const form=document.querySelector('#project-brief');
if(form){
  const gate=document.querySelector('#business-access-gate'),status=document.querySelector('#business-access-status');
  const summary=form.querySelector('#inquiry-errors'),result=form.querySelector('.brief-result'),submit=form.querySelector('[type=submit]');
  let token='',business=null;
  function errors(messages={}){
    summary.hidden=Object.keys(messages).length===0;summary.querySelector('ul').replaceChildren();
    form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
    form.querySelectorAll('.inquiry-error').forEach(el=>{el.hidden=true;el.textContent='';});
    for(const [name,message]of Object.entries(messages)){
      const field=form.elements.namedItem(name),hint=document.querySelector('#inquiry-'+name+'-error');
      if(field?.setAttribute)field.setAttribute('aria-invalid','true');
      if(hint){hint.textContent=message;hint.hidden=false;}
      const item=document.createElement('li'),anchor=document.createElement('a');anchor.href=field?.id?'#'+field.id:'#project-brief';anchor.textContent=message;item.append(anchor);summary.querySelector('ul').append(item);
    }
  }
  async function api(action,fields){
    const response=await fetch('/api/business-inquiry',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-Inquiry-Client':'portfolio-v1'},body:JSON.stringify({action,token,...(fields?{fields}:{})}),signal:AbortSignal.timeout(12000)});
    let data;try{data=await response.json();}catch{throw new Error('Business access could not be checked. Try again or contact Sohila by email or LinkedIn.');}
    return {response,data};
  }
  async function unlock(){
    const fragment=new URLSearchParams(location.hash.slice(1));
    if(!fragment.has('business-invite'))return;
    token=fragment.get('business-invite')||'';
    history.replaceState(null,'',location.pathname+location.search+'#business-inquiry');
    status.textContent='Checking your approved business invitation…';
    document.querySelector('#business-inquiry').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    try{
      const {response,data}=await api('open');
      if(!response.ok||!data.ok){status.textContent=data.message||'This invitation could not be accepted.';token='';return;}
      business=data.business;
      form.elements.namedItem('name').value=business.contactName;
      form.elements.namedItem('company').value=business.legalName;
      form.elements.namedItem('email').value=business.email;
      document.querySelector('#approved-business-name').textContent=business.legalName;
      document.querySelector('#approved-business-expiry').textContent='Approved contact: '+business.contactName+'. Invitation expires '+new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(business.expiresAt))+'.';
      form.querySelectorAll('fieldset').forEach(el=>el.disabled=false);
      form.hidden=false;gate.hidden=true;form.elements.namedItem('role').focus({preventScroll:true});
    }catch{status.textContent='Business access could not be checked. Open your invitation again, or contact Sohila by email or LinkedIn.';token='';}
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();result.hidden=true;
    if(!business||!token)return;
    const fields=Object.fromEntries(new FormData(form));fields.professional=form.elements.namedItem('professional').checked;
    const validation=validateInquiry(fields,business);errors(validation.errors);
    if(!validation.ok){summary.focus();return;}
    submit.disabled=true;submit.textContent='Checking your inquiry…';
    try{
      const {response,data}=await api('prepare',fields);
      if(!response.ok||!data.ok){
        if(response.status===403){form.hidden=true;form.querySelectorAll('fieldset').forEach(el=>el.disabled=true);gate.hidden=false;status.textContent=data.message;business=null;token='';gate.scrollIntoView({behavior:'auto'});return;}
        errors(data.errors||{form:data.message||'The inquiry could not be accepted.'});summary.focus();return;
      }
      document.querySelector('#brief-email-link').href=data.draft.mailto;
      document.querySelector('#inquiry-draft').value='To: '+data.draft.to+'\nSubject: '+data.draft.subject+'\n\n'+data.draft.body;
      result.hidden=false;document.querySelector('#brief-email-link').focus();
    }catch{errors({form:'The inquiry could not be checked. Try again; no message has been sent.'});summary.focus();}
    finally{submit.disabled=false;submit.textContent='Validate & prepare inquiry';}
  });
  form.addEventListener('input',event=>{
    result.hidden=true;document.querySelector('#inquiry-copy-status').textContent='';
    const counter=form.querySelector('[data-inquiry-counter="'+event.target.name+'"]');
    if(counter)counter.textContent=event.target.value.length+' / '+event.target.maxLength;
  });
  form.elements.namedItem('kind').addEventListener('change',()=>{
    const unit=form.elements.namedItem('budgetUnit'),project=unit.querySelector('option[value=project]');project.disabled=form.elements.namedItem('kind').value==='employment';if(project.disabled&&unit.value==='project')unit.value='';
  });
  document.querySelector('#copy-inquiry-draft').addEventListener('click',async()=>{
    const draft=document.querySelector('#inquiry-draft');
    try{await navigator.clipboard.writeText(draft.value);document.querySelector('#inquiry-copy-status').textContent='Inquiry copied. Paste it into your email app.';}
    catch{draft.focus();draft.select();document.querySelector('#inquiry-copy-status').textContent='The draft is selected. Copy it and paste it into your email app.';}
  });
  unlock();
}

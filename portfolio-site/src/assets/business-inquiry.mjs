import {validateInquiry} from './inquiry-rules.mjs';

function newSubmissionId(){
  if(globalThis.crypto?.randomUUID)return globalThis.crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,char=>{
    const random=Math.random()*16|0;
    return (char==='x'?random:(random&3|8)).toString(16);
  });
}
function setChallenge(form){
  const started=form.elements.namedItem('formStartedAt');
  const submission=form.elements.namedItem('submissionId');
  if(started)started.value=String(Date.now());
  if(submission)submission.value=newSubmissionId();
}
async function postLead(payload){
  const response=await fetch('/api/lead',{
    method:'POST',
    credentials:'same-origin',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(payload),
    signal:AbortSignal.timeout(12000)
  });
  let data;
  try{data=await response.json();}catch{
    throw new Error('The inquiry service returned an unreadable response. Please try again.');
  }
  return {response,data};
}

const publicForm=document.querySelector('#simple-project-inquiry');
if(publicForm){
  const result=publicForm.querySelector('#simple-inquiry-result');
  const errorBox=publicForm.querySelector('#simple-inquiry-error');
  const errorMessage=errorBox.querySelector('.inquiry-error-message');
  const submit=publicForm.querySelector('#simple-inquiry-submit');
  let sent=false,failed=false;
  setChallenge(publicForm);

  function showError(message){
    errorMessage.textContent=message||'Your inquiry could not be sent. Please try again.';
    errorBox.hidden=false;
    result.hidden=true;
    failed=true;
    errorBox.focus({preventScroll:true});
  }

  publicForm.addEventListener('input',()=>{
    errorBox.hidden=true;
    result.hidden=true;
    if(sent||failed){
      setChallenge(publicForm);
      sent=false;
      failed=false;
      submit.disabled=false;
      submit.textContent='Send project inquiry';
    }
  });

  publicForm.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!publicForm.reportValidity())return;
    errorBox.hidden=true;
    result.hidden=true;
    submit.disabled=true;
    submit.textContent='Sending inquiry…';
    const fields=Object.fromEntries(new FormData(publicForm));
    const payload={
      type:'standard',
      name:fields.name,
      email:fields.email,
      description:fields.description,
      budgetRange:fields.budgetRange,
      websiteFax:fields.websiteFax,
      formStartedAt:Number(fields.formStartedAt),
      submissionId:fields.submissionId,
      sourcePage:location.pathname
    };
    try{
      const {response,data}=await postLead(payload);
      if(!response.ok||!data.ok){
        showError(data.message||'Your inquiry could not be sent. Please try again.');
        return;
      }
      result.querySelector('p').textContent='Your inquiry has been received. Thank you for reaching out.';
      result.hidden=false;
      sent=true;
      result.focus({preventScroll:true});
    }catch(error){
      showError(error.message||'The inquiry service is temporarily unavailable. Please try again.');
    }finally{
      submit.disabled=false;
      submit.textContent=sent?'Send another inquiry':'Send project inquiry';
    }
  });
}

const form=document.querySelector('#project-brief');
if(form){
  const gate=document.querySelector('#business-access-gate');
  const status=document.querySelector('#business-access-status');
  const summary=form.querySelector('#inquiry-errors');
  const result=form.querySelector('.brief-result');
  const submit=form.querySelector('[type=submit]');
  let token='',business=null,sent=false;

  function errors(messages={}){
    summary.hidden=Object.keys(messages).length===0;
    summary.querySelector('ul').replaceChildren();
    form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
    form.querySelectorAll('.inquiry-error').forEach(el=>{el.hidden=true;el.textContent='';});
    for(const [name,message] of Object.entries(messages)){
      const field=form.elements.namedItem(name);
      const hint=document.querySelector('#inquiry-'+name+'-error');
      if(field?.setAttribute)field.setAttribute('aria-invalid','true');
      if(hint){hint.textContent=message;hint.hidden=false;}
      const item=document.createElement('li');
      const anchor=document.createElement('a');
      anchor.href=field?.id?'#'+field.id:'#project-brief';
      anchor.textContent=message;
      item.append(anchor);
      summary.querySelector('ul').append(item);
    }
  }

  async function verifyInvitation(){
    const response=await fetch('/api/business-inquiry',{
      method:'POST',
      credentials:'same-origin',
      headers:{'Content-Type':'application/json','X-Inquiry-Client':'portfolio-v1'},
      body:JSON.stringify({action:'open',token}),
      signal:AbortSignal.timeout(12000)
    });
    let data;
    try{data=await response.json();}catch{
      throw new Error('Business access could not be checked. Try again or contact Sohila directly.');
    }
    return {response,data};
  }

  async function unlock(){
    const fragment=new URLSearchParams(location.hash.slice(1));
    if(!fragment.has('business-invite'))return;
    token=fragment.get('business-invite')||'';
    const enterpriseDetails=document.querySelector('#enterprise-verification');
    if(enterpriseDetails)enterpriseDetails.open=true;
    history.replaceState(null,'',location.pathname+location.search+'#enterprise-verification');
    status.textContent='Checking your approved business invitation…';
    document.querySelector('#business-inquiry').scrollIntoView({
      behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'
    });
    try{
      const {response,data}=await verifyInvitation();
      if(!response.ok||!data.ok){
        status.textContent=data.message||'This invitation could not be accepted.';
        token='';
        return;
      }
      business=data.business;
      form.elements.namedItem('name').value=business.contactName;
      form.elements.namedItem('company').value=business.legalName;
      form.elements.namedItem('email').value=business.email;
      document.querySelector('#approved-business-name').textContent=business.legalName;
      document.querySelector('#approved-business-expiry').textContent=
        'Approved contact: '+business.contactName+'. Invitation expires '+
        new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(business.expiresAt))+'.';
      form.querySelectorAll('fieldset').forEach(el=>el.disabled=false);
      setChallenge(form);
      form.hidden=false;
      gate.hidden=true;
      form.elements.namedItem('role').focus({preventScroll:true});
    }catch(error){
      status.textContent=error.message||'Business access could not be checked. Open your invitation again, or contact Sohila.';
      token='';
    }
  }

  form.addEventListener('submit',async event=>{
    event.preventDefault();
    result.hidden=true;
    if(!business||!token)return;

    const formData=Object.fromEntries(
      [...new FormData(form)].filter(([key])=>!['formStartedAt','submissionId'].includes(key))
    );
    formData.professional=form.elements.namedItem('professional').checked;
    const validation=validateInquiry(formData,business);
    errors(validation.errors);
    if(!validation.ok){
      summary.focus();
      return;
    }

    submit.disabled=true;
    submit.textContent='Sending enterprise inquiry…';
    try{
      const {response,data}=await postLead({
        type:'enterprise',
        token,
        fields:formData,
        formStartedAt:Number(form.elements.namedItem('formStartedAt').value),
        submissionId:form.elements.namedItem('submissionId').value,
        sourcePage:location.pathname
      });
      if(!response.ok||!data.ok){
        if(response.status===403){
          form.hidden=true;
          form.querySelectorAll('fieldset').forEach(el=>el.disabled=true);
          gate.hidden=false;
          status.textContent=data.message||'Your enterprise invitation is no longer valid. Request a new invitation.';
          business=null;
          token='';
          gate.scrollIntoView({behavior:'auto'});
          return;
        }
        errors(data.errors||{form:data.message||'The inquiry could not be sent.'});
        summary.focus();
        return;
      }
      result.querySelector('p').textContent='Your enterprise inquiry has been received. Thank you for reaching out.';
      result.hidden=false;
      sent=true;
      result.focus({preventScroll:true});
    }catch(error){
      errors({form:error.message||'The inquiry service is temporarily unavailable. Please try again.'});
      summary.focus();
    }finally{
      submit.disabled=false;
      submit.textContent=sent?'Send another enterprise inquiry':'Send enterprise inquiry';
    }
  });

  form.addEventListener('input',event=>{
    result.hidden=true;
    const counter=form.querySelector('[data-inquiry-counter="'+event.target.name+'"]');
    if(counter)counter.textContent=event.target.value.length+' / '+event.target.maxLength;
    if(sent){
      setChallenge(form);
      sent=false;
      submit.textContent='Send enterprise inquiry';
    }
  });
  form.elements.namedItem('kind').addEventListener('change',()=>{
    const unit=form.elements.namedItem('budgetUnit');
    const project=unit.querySelector('option[value=project]');
    project.disabled=form.elements.namedItem('kind').value==='employment';
    if(project.disabled&&unit.value==='project')unit.value='';
  });
  unlock();
}

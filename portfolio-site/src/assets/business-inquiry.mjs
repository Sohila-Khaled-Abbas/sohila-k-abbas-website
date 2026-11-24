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
  const fields={
    name:publicForm.querySelector('#simple-inquiry-name'),
    email:publicForm.querySelector('#simple-inquiry-email'),
    description:publicForm.querySelector('#simple-inquiry-description'),
    budgetRange:publicForm.querySelector('#simple-inquiry-budget')
  };
  let sent=false,failed=false;
  setChallenge(publicForm);

  function clearFieldErrors(){
    for(const [name,field] of Object.entries(fields)){
      field.removeAttribute('aria-invalid');
      const message=publicForm.querySelector('#simple-inquiry-'+name+'-error');
      if(message){message.hidden=true;message.textContent='';}
    }
  }
  function showInlineErrors(messages={}){
    clearFieldErrors();
    const entries=Object.entries(messages);
    if(!entries.length)return;
    errorMessage.textContent='Please correct the highlighted fields.';
    errorBox.hidden=false;
    result.hidden=true;
    for(const [name,message] of entries){
      const field=fields[name];
      const target=publicForm.querySelector('#simple-inquiry-'+name+'-error');
      if(field)field.setAttribute('aria-invalid','true');
      if(target){target.textContent=message;target.hidden=false;}
    }
    failed=true;
    fields[entries[0][0]]?.focus({preventScroll:true});
  }
  function showError(message){
    errorMessage.textContent=message||'Your inquiry could not be sent. Please try again.';
    errorBox.hidden=false;
    result.hidden=true;
    failed=true;
    errorBox.focus({preventScroll:true});
  }
  function validate(){
    const errors={};
    const name=fields.name.value.trim();
    const email=fields.email.value.trim();
    const description=fields.description.value.trim();
    const budget=fields.budgetRange.value;
    if(name.length<2||name.length>100)errors.name='Enter your name using 2–100 characters.';
    if(!email||!fields.email.checkValidity())errors.email='Enter a valid email address.';
    if(description.length<25||description.length>1800)errors.description='Describe the project in 25–1,800 characters.';
    if(!['500 - 2,000 EGP','2,000 - 5,000 EGP','5,000 - 10,000 EGP','10,000 - 25,000 EGP','25,000+ EGP','Not sure yet'].includes(budget))errors.budgetRange='Choose one of the listed EGP budget ranges (minimum 500 EGP).';
    return errors;
  }

  publicForm.addEventListener('input',event=>{
    errorBox.hidden=true;
    result.hidden=true;
    const field=event.target;
    const name=Object.keys(fields).find(key=>fields[key]===field);
    if(name){
      field.removeAttribute('aria-invalid');
      const message=publicForm.querySelector('#simple-inquiry-'+name+'-error');
      if(message){message.hidden=true;message.textContent='';}
    }
    if(sent||failed){
      setChallenge(publicForm);
      sent=false;
      failed=false;
      submit.disabled=false;
      submit.textContent='Send project inquiry';
    }
  });
  publicForm.addEventListener('change',event=>{
    const name=Object.keys(fields).find(key=>fields[key]===event.target);
    if(name){
      fields[name].removeAttribute('aria-invalid');
      const message=publicForm.querySelector('#simple-inquiry-'+name+'-error');
      if(message){message.hidden=true;message.textContent='';}
    }
  });

  publicForm.addEventListener('submit',async event=>{
    event.preventDefault();
    const errors=validate();
    if(Object.keys(errors).length){showInlineErrors(errors);return;}
    errorBox.hidden=true;
    result.hidden=true;
    clearFieldErrors();
    submit.disabled=true;
    submit.textContent='Sending inquiry…';
    publicForm.setAttribute('aria-busy','true');
    const controls=[...publicForm.querySelectorAll('input,textarea,select')];
    const fieldsData=Object.fromEntries(new FormData(publicForm));
    const payload={
      type:'standard',
      name:fieldsData.name,
      email:fieldsData.email,
      description:fieldsData.description,
      budgetRange:fieldsData.budgetRange,
      websiteFax:fieldsData.websiteFax,
      formStartedAt:Number(fieldsData.formStartedAt),
      submissionId:fieldsData.submissionId,
      sourcePage:location.pathname
    };
    controls.forEach(control=>control.disabled=true);
    try{
      const {response,data}=await postLead(payload);
      if(!response.ok||!data.ok){
        if(data.errors&&Object.keys(data.errors).length)showInlineErrors(data.errors);
        else showError(data.message||'Your inquiry could not be sent. Please try again.');
        return;
      }
      result.querySelector('p').textContent='Your inquiry has been received. Thank you for reaching out.';
      result.hidden=false;
      sent=true;
      setChallenge(publicForm);
      result.focus({preventScroll:true});
    }catch(error){
      showError(error.message||'The inquiry service is temporarily unavailable. Please try again.');
    }finally{
      controls.forEach(control=>control.disabled=false);
      submit.disabled=false;
      submit.textContent=sent?'Send another inquiry':'Send project inquiry';
      publicForm.removeAttribute('aria-busy');
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

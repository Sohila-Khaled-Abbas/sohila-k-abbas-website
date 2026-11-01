export const kinds = {employment:'Employment opportunity',contract:'Contract role',project:'Paid freelance project',consultation:'Paid technical consultation'};
export const focuses = {bi:'Power BI & business intelligence',engineering:'Data engineering & ETL/ELT',ml:'Machine learning & predictive modeling',automation:'Automation & AI workflows'};
export const currencies = ['EGP','USD','EUR','GBP','AED','SAR','CAD','AUD'];
export const units = {project:'Total project budget',hour:'Per hour',month:'Per month',year:'Per year'};
export const timelines = {soon:'Within two weeks',month:'Within one month',quarter:'Within three months',planning:'Planning the engagement'};
const freeDomains = new Set(['gmail.com','googlemail.com','yahoo.com','yahoo.co.uk','hotmail.com','outlook.com','live.com','msn.com','aol.com','icloud.com','me.com','proton.me','protonmail.com','yandex.com','gmx.com','mail.com','mailinator.com','guerrillamail.com','tempmail.com','10minutemail.com']);
const placeholder = /^(?:test(?:\s*user)?|demo|fake|anonymous|your\s*name|full\s*name|company\s*name|asdf+|qwerty+|n\/?a|null|undefined|none|unknown)$/iu;
const controls = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;
const nonWork = /(?:\b(?:date me|marry me|be my girlfriend|send (?:me )?nudes|buy backlinks|buy followers|promote my channel|win the lottery|guaranteed crypto returns)\b|رقمك الشخصي|نتعرف على بعض|اشتري متابعين)/iu;
export const normalize = value => typeof value === 'string' ? value.normalize('NFKC').replace(/\r\n/g,'\n').trim() : '';
export function validName(value){
  const name=normalize(value);
  return name.length>=2&&name.length<=100&&/^[\p{L}\p{M} .'’\-]+$/u.test(name)&&(name.match(/\p{L}/gu)||[]).length>=2&&!placeholder.test(name)&&!/(.)\1{4}/u.test(name);
}
export function normalizeBusinessEmail(value){
  const email=normalize(value).toLowerCase();
  if(email.length>254||/[\r\n\s]/u.test(email))return '';
  const parts=email.split('@');if(parts.length!==2)return '';
  const [local,domain]=parts;
  if(!local||local.length>64||local.startsWith('.')||local.endsWith('.')||local.includes('..')||!/^[a-z0-9.!#$%&'*+/=?^_`{|}~\-]+$/i.test(local))return '';
  if(domain.length>253||!domain.includes('.')||!domain.split('.').every(label=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label)))return '';
  if(freeDomains.has(domain)||/\.(?:invalid|test|localhost|local|example)$/i.test(domain)||/^(?:example\.(?:com|net|org)|localhost)$/i.test(domain))return '';
  return email;
}
export function publicHttps(value){
  try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&url.hostname.includes('.')&&!/^[\d.]+$/.test(url.hostname)&&!url.hostname.includes(':')&&!/\.(?:local|localhost|test|invalid)$/i.test(url.hostname);}catch{return false;}
}
export function businessHost(website){try{return new URL(website).hostname.toLowerCase().replace(/^www\./,'');}catch{return '';}}
export function emailMatchesBusiness(email,website){
  const domain=email.split('@')[1]||'',host=businessHost(website);
  return Boolean(host&&(domain===host||domain.endsWith('.'+host)));
}
function meaningful(value,min,max){
  const text=normalize(value),letters=text.match(/\p{L}/gu)||[];
  return text.length>=min&&text.length<=max&&!controls.test(text)&&!/<\/?[a-z][^>]*>/iu.test(text)&&!placeholder.test(text)&&!/(.)\1{7}/u.test(text)&&letters.length>=Math.min(30,Math.floor(min/2))&&new Set(letters.map(x=>x.toLowerCase())).size>=Math.min(7,Math.floor(min/3));
}
export function validateInquiry(raw,business){
  const errors={},value={};
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return {ok:false,errors:{form:'Use the professional inquiry form.'},value};
  const allowed=new Set(['name','company','email','role','phone','kind','focus','title','currency','budgetMin','budgetMax','budgetUnit','timeline','reference','brief','outcome','environment','professional','websiteFax']);
  if(Object.keys(raw).some(key=>!allowed.has(key)))errors.form='Unexpected inquiry fields. Reload the invitation and try again.';
  for(const key of allowed){
    if(key==='professional')continue;
    if(raw[key]!==undefined&&typeof raw[key]!=='string')errors[key]='Enter a text value.';
    value[key]=normalize(raw[key]);
  }
  if(value.websiteFax)errors.form='This inquiry could not be accepted.';
  if(!validName(value.name)||value.name!==business.contactName)errors.name='Use the contact named in your approved invitation.';
  if(value.company!==business.legalName)errors.company='Use the business named in your approved invitation.';
  if(!normalizeBusinessEmail(value.email)||value.email.toLowerCase()!==business.email)errors.email='Use the verified business email in your invitation.';
  if(!meaningful(value.role,2,100)||/[\r\n]/u.test(value.role))errors.role='Enter your actual professional role, using 2-100 characters.';
  if(!Object.hasOwn(kinds,value.kind))errors.kind='Choose an employment, contract, paid project, or paid consultation inquiry.';
  if(!Object.hasOwn(focuses,value.focus))errors.focus='Choose a relevant data, BI, machine learning, or automation focus.';
  if(!meaningful(value.title,5,140)||/[\r\n]/u.test(value.title))errors.title='Enter a clear role or project title, using 5-140 characters.';
  if(!currencies.includes(value.currency))errors.currency='Select the budget currency.';
  for(const key of ['budgetMin','budgetMax'])if(!/^\d{1,9}(?:\.\d{1,2})?$/.test(value[key])||Number(value[key])<=0)errors[key]='Enter a positive amount, with at most two decimal places.';
  if(!errors.budgetMin&&!errors.budgetMax&&Number(value.budgetMax)<Number(value.budgetMin))errors.budgetMax='The maximum amount must be at least the minimum.';
  if(!Object.hasOwn(units,value.budgetUnit))errors.budgetUnit='Select how the budget or compensation is measured.';
  if(value.kind==='employment'&&value.budgetUnit==='project')errors.budgetUnit='Use hourly, monthly, or annual compensation for employment.';
  if(!Object.hasOwn(timelines,value.timeline))errors.timeline='Select the expected start timeframe.';
  if(!meaningful(value.brief,100,1800))errors.brief='Describe the genuine role or business problem in 100-1800 characters.';
  if(!meaningful(value.outcome,40,900))errors.outcome='Describe the responsibilities, deliverables, or success criteria in 40-900 characters.';
  if(value.environment&&!meaningful(value.environment,10,600))errors.environment='Use 10-600 characters to describe the tools or data environment, or leave this optional field empty.';
  if(nonWork.test([value.title,value.brief,value.outcome,value.environment].join(' ')))errors.brief='Only genuine work inquiries are accepted. Personal messages, unsolicited sales pitches, and promotions are not accepted.';
  if((value.brief.match(/https?:\/\//gi)||[]).length>2)errors.brief='Use the reference field for a role or project link; do not add a list of promotional links.';
  if(value.reference){
    const host=publicHttps(value.reference)?businessHost(value.reference):'',businessDomain=businessHost(business.website);
    if(value.reference.length>400||!host||!(host===businessDomain||host.endsWith('.'+businessDomain)||host==='linkedin.com'||host==='github.com'))errors.reference='Use an HTTPS link on your approved business website, LinkedIn, or GitHub.';
  }
  if(value.phone){
    value.phone=value.phone.replace(/[٠-٩]/g,x=>String(x.charCodeAt(0)-1632)).replace(/[۰-۹]/g,x=>String(x.charCodeAt(0)-1776));
    if(!/^\+[\d ()-]{7,24}$/.test(value.phone)||/(\d)\1{6,}/.test(value.phone)||/1234567890/.test(value.phone))errors.phone='Enter a genuine international business number starting with + and its country code, or leave it empty.';
  }
  if(raw.professional!==true)errors.professional='Confirm that this is a genuine professional work inquiry.';
  value.professional=raw.professional===true;
  return {ok:Object.keys(errors).length===0,errors,value};
}

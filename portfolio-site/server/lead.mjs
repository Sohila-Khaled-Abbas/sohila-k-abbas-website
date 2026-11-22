import {createHmac,randomUUID} from 'node:crypto';
import {isIP} from 'node:net';
import {parsePhoneNumberWithError} from 'libphonenumber-js/max';
import {authorizeInvitation,loadApprovalRegistry} from './business-access.mjs';
import {validateInquiry,kinds,focuses,units} from '../src/assets/inquiry-rules.mjs';

export const allowedBudgets=Object.freeze([
  'Under $500',
  '$500–$1,000',
  '$1,000–$3,000',
  '$3,000–$5,000',
  '$5,000+',
  'Not sure yet'
]);
const MAX_BODY=16384;
const MIN_SUBMIT_MS=2000;
const MAX_FORM_AGE_MS=7*24*60*60*1000;
const headers={
  'Cache-Control':'private, no-store, max-age=0',
  'Content-Type':'application/json; charset=utf-8',
  'X-Content-Type-Options':'nosniff',
  'Vary':'Origin'
};
const respond=(status,data)=>new Response(JSON.stringify(data),{status,headers});
const clean=value=>typeof value==='string'?value.normalize('NFKC').replace(/\r\n?/g,'\n').trim():'';

async function readBody(request){
  const declared=Number(request.headers.get('content-length'));
  if(Number.isFinite(declared)&&declared>MAX_BODY)throw new RangeError('Payload too large');
  const reader=request.body?.getReader();
  if(!reader)throw new SyntaxError('Missing request body');
  const chunks=[];
  let length=0;
  try{
    while(true){
      const {done,value}=await reader.read();
      if(done)break;
      length+=value.byteLength;
      if(length>MAX_BODY){
        await reader.cancel();
        throw new RangeError('Payload too large');
      }
      chunks.push(value);
    }
  }finally{
    reader.releaseLock();
  }
  const bytes=new Uint8Array(length);
  let offset=0;
  for(const chunk of chunks){
    bytes.set(chunk,offset);
    offset+=chunk.byteLength;
  }
  return bytes;
}

function entriesToObject(entries){
  const value={};
  for(const [key,item] of entries){
    if(typeof item!=='string'||Object.hasOwn(value,key))throw new SyntaxError('Invalid form fields');
    value[key]=item;
  }
  return value;
}

async function parsePayload(request,bytes,contentType){
  const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
  if(contentType==='application/json'){
    const parsed=JSON.parse(text);
    if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new SyntaxError('Invalid JSON');
    return parsed;
  }
  if(contentType==='application/x-www-form-urlencoded'){
    return entriesToObject(new URLSearchParams(text).entries());
  }
  if(contentType==='multipart/form-data'){
    const copy=new Request(request.url,{
      method:'POST',
      headers:{'Content-Type':request.headers.get('content-type')},
      body:bytes
    });
    return entriesToObject((await copy.formData()).entries());
  }
  throw new TypeError('Unsupported content type');
}

const rootKeys=new Set([
  'type','token','fields','name','email','description','budgetRange','websiteFax',
  'formStartedAt','submissionId','sourcePage','company','role','phone','kind','focus',
  'title','currency','budgetMin','budgetMax','budgetUnit','timeline','reference',
  'brief','outcome','environment','professional'
]);
const enterpriseFieldNames=[
  'name','company','email','role','phone','kind','focus','title','currency',
  'budgetMin','budgetMax','budgetUnit','timeline','reference','brief','outcome',
  'environment','professional','websiteFax'
];

function extractFields(payload,type){
  if(payload.fields!==undefined){
    let fields=payload.fields;
    if(typeof fields==='string'){
      try{fields=JSON.parse(fields);}catch{return null;}
    }
    if(!fields||typeof fields!=='object'||Array.isArray(fields))return null;
    if(type==='standard'&&Object.keys(fields).some(key=>!['name','email','description','budgetRange','websiteFax'].includes(key)))return null;
    return {...fields};
  }
  if(type==='standard'){
    return {
      name:payload.name,
      email:payload.email,
      description:payload.description,
      budgetRange:payload.budgetRange,
      websiteFax:payload.websiteFax
    };
  }
  const output={};
  for(const key of enterpriseFieldNames){
    if(Object.hasOwn(payload,key))output[key]=payload[key];
  }
  return output;
}

function validName(value){
  if(value.length<2||value.length>100||/[\u0000-\u001f\u007f<>]/u.test(value))return false;
  if(!/^[\p{L}\p{M}][\p{L}\p{M} .'’\-]{1,99}$/u.test(value))return false;
  return (value.match(/\p{L}/gu)||[]).length>=2;
}
function validEmail(value){
  return value.length<=254&&
    /^[^\s@<>]+@[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(value)&&
    !value.includes('..')&&!/[\r\n\u0000-\u001f\u007f]/u.test(value);
}
function validSourcePage(value,origin){
  const candidate=clean(value||'/services/');
  try{
    const parsed=new URL(candidate,origin);
    return parsed.origin===origin&&
      (parsed.pathname==='/services/'||parsed.pathname==='/services')&&
      !parsed.search&&!parsed.hash?'/services/':'';
  }catch{return '';}
}
function clientIp(requestHeaders){
  const real=clean(requestHeaders.get('x-real-ip')||'');
  if(isIP(real))return real;
  const forwarded=clean((requestHeaders.get('x-forwarded-for')||'').split(',')[0]||'');
  return isIP(forwarded)?forwarded:'';
}
function timeError(value,now){
  const startedAt=Number(value);
  if(!Number.isFinite(startedAt)||startedAt<=0)return 'Reload the form and try again.';
  const elapsed=now-startedAt;
  if(elapsed<MIN_SUBMIT_MS||elapsed>MAX_FORM_AGE_MS||startedAt>now+30000){
    return 'Please wait a moment, then submit the form again.';
  }
  return '';
}
function safeSubmissionId(value){
  const candidate=clean(value);
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(candidate)
    ?candidate:randomUUID();
}
function enterpriseProject(value){
  return [
    'Business: '+value.company,
    'Opportunity: '+kinds[value.kind],
    'Focus: '+focuses[value.focus],
    'Role / project: '+value.title,
    'Work arrangement: Remote',
    '',
    'ROLE / BUSINESS PROBLEM',
    value.brief,
    '',
    'RESPONSIBILITIES / DELIVERABLES',
    value.outcome,
    ...(value.environment?['','TOOLS / DATA ENVIRONMENT',value.environment]:[]),
    ...(value.reference?['','REFERENCE',value.reference]:[])
  ].join('\n').slice(0,5000);
}

export async function handleLead(request,{
  env=process.env,
  fetchImpl=fetch,
  now=Date.now(),
  registry,
  registryLoader=loadApprovalRegistry
}={}){
  if(request.method!=='POST')return new Response(null,{status:405,headers:{...headers,Allow:'POST'}});
  let origin;
  try{origin=new URL(request.url).origin;}catch{return respond(400,{ok:false,message:'This inquiry could not be accepted.'});}
  if(request.headers.get('origin')!==origin||request.headers.get('sec-fetch-site')==='cross-site'){
    return respond(403,{ok:false,message:'Please submit the inquiry from this website.'});
  }

  let payload;
  const contentType=(request.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
  try{
    const bytes=await readBody(request);
    payload=await parsePayload(request,bytes,contentType);
  }catch(error){
    const status=error instanceof RangeError?413:error instanceof TypeError?415:400;
    return respond(status,{ok:false,message:'The inquiry is invalid or too large. Check the fields and try again.'});
  }

  if(Object.keys(payload).some(key=>!rootKeys.has(key))){
    return respond(400,{ok:false,message:'The inquiry contains unsupported fields. Reload the page and try again.'});
  }
  const type=clean(payload.type||'standard');
  if(!['standard','enterprise'].includes(type)){
    return respond(400,{ok:false,message:'Choose a valid inquiry form.'});
  }
  const fields=extractFields(payload,type);
  if(!fields)return respond(400,{ok:false,message:'The inquiry form data is invalid.'});

  if(clean(payload.websiteFax??fields.websiteFax??'')){
    return respond(200,{ok:true,message:'Your inquiry has been received.'});
  }
  const ageMessage=timeError(payload.formStartedAt,now);
  if(ageMessage)return respond(422,{ok:false,message:ageMessage,errors:{form:ageMessage}});

  const page=validSourcePage(payload.sourcePage,origin);
  if(!page)return respond(422,{ok:false,message:'Reload the inquiry form from the Work with me page.',errors:{form:'The source page is not valid.'}});

  const submission=safeSubmissionId(payload.submissionId);
  let lead;
  if(type==='standard'){
    const name=clean(fields.name);
    const email=clean(fields.email).toLowerCase();
    const project=clean(fields.description);
    const budget=clean(fields.budgetRange);
    const errors={};
    if(!validName(name))errors.name='Enter your name using 2-100 characters.';
    if(!validEmail(email))errors.email='Enter a valid email address.';
    if(project.length<25||project.length>1800||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(project)){
      errors.description='Describe the project in 25-1,800 characters.';
    }
    if(!allowedBudgets.includes(budget))errors.budgetRange='Choose one of the listed USD budget ranges.';
    if(Object.keys(errors).length)return respond(422,{ok:false,message:'Please correct the highlighted fields.',errors});
    lead={name,email,project,budget,sourcePage:page,type,submissionId:submission};
  }else{
    let approvals;
    try{approvals=registry??await registryLoader();}catch{
      return respond(503,{ok:false,message:'Enterprise access is temporarily unavailable. Please try again or email Sohila.'});
    }
    const business=authorizeInvitation(payload.token,approvals,{origin,now});
    if(!business){
      return respond(403,{ok:false,message:'Your enterprise invitation is invalid or expired. Request verification or ask for a new invitation.'});
    }
    const candidate={...fields};
    if(candidate.professional==='on'||candidate.professional==='true')candidate.professional=true;
    if(candidate.professional==='')candidate.professional=false;
    const checked=validateInquiry(candidate,business);
    const value=checked.value;
    const errors=checked.errors;
    if(value.phone&&!errors.phone){
      try{
        const number=parsePhoneNumberWithError(value.phone,{extract:false});
        if(!number.isValid()||number.ext)throw new Error('Invalid number');
        value.phone=number.number;
      }catch{
        errors.phone='This number does not match a valid international numbering plan. Include + and the country code, or leave it empty.';
      }
    }
    if(Object.keys(errors).length){
      return respond(422,{ok:false,message:'Please correct the highlighted fields.',errors});
    }
    lead={
      name:value.name,
      email:value.email,
      project:enterpriseProject(value),
      budget:value.budgetMin+'–'+value.budgetMax+' '+value.currency+' ('+units[value.budgetUnit]+')',
      sourcePage:page,
      type,
      submissionId:submission
    };
  }

  const webhookUrl=clean(env.LEAD_WEBHOOK_URL);
  const secret=typeof env.LEAD_WEBHOOK_SECRET==='string'?env.LEAD_WEBHOOK_SECRET:'';
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(webhookUrl)||secret.length<32){
    return respond(503,{ok:false,message:'The inquiry service is not configured yet. Please email Sohila or book a call instead.'});
  }
  const ip=clientIp(request.headers);
  if(!ip)return respond(503,{ok:false,message:'The inquiry service could not verify this request. Please email Sohila or book a call instead.'});
  const rateKey=createHmac('sha256',secret).update(ip).digest('hex');
  const outgoing={
    secret,
    submissionId:submission,
    rateKey,
    name:lead.name,
    email:lead.email,
    project:lead.project,
    budget:lead.budget,
    sourcePage:lead.sourcePage,
    type:lead.type,
    notes:''
  };

  try{
    const response=await fetchImpl(webhookUrl,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(outgoing),
      signal:AbortSignal.timeout(8000),
      redirect:'follow'
    });
    let result;
    try{result=await response.json();}catch{
      return respond(502,{ok:false,message:'The inquiry could not be delivered. Please try again or contact Sohila directly.'});
    }
    if(result?.code==='RATE_LIMITED'){
      return respond(429,{ok:false,message:'There have been several recent submissions. Please wait before trying again.'});
    }
    if(!response.ok||result?.ok!==true){
      return respond(502,{ok:false,message:'The inquiry could not be delivered. Please try again or contact Sohila directly.'});
    }
    return respond(200,{ok:true,message:'Your inquiry has been received.'});
  }catch{
    return respond(502,{ok:false,message:'The inquiry service is temporarily unavailable. Please try again or contact Sohila directly.'});
  }
}

import {parsePhoneNumberWithError} from 'libphonenumber-js/max';
import {authorizeInvitation,loadApprovalRegistry} from './business-access.mjs';
import {validateInquiry,kinds,focuses,units,timelines} from '../src/assets/inquiry-rules.mjs';

const replyTo='sohila.k.data@gmail.com';
const headers={'Cache-Control':'private, no-store, max-age=0','Content-Type':'application/json; charset=utf-8','X-Content-Type-Options':'nosniff','Vary':'Origin'};
const respond=(status,data)=>new Response(JSON.stringify(data),{status,headers});
async function readJson(request){
  if(Number(request.headers.get('content-length'))>16384)throw new RangeError('Payload too large');
  const reader=request.body?.getReader();if(!reader)throw new SyntaxError('Missing JSON');
  const chunks=[];let length=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>16384){await reader.cancel();throw new RangeError('Payload too large');}chunks.push(value);}}finally{reader.releaseLock();}
  const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
}
export async function handleBusinessInquiry(request,{registry,now=Date.now()}={}){
  if(request.method!=='POST')return new Response(null,{status:405,headers:{...headers,Allow:'POST'}});
  const origin=new URL(request.url).origin;
  if(request.headers.get('origin')!==origin||request.headers.get('x-inquiry-client')!=='portfolio-v1'||request.headers.get('sec-fetch-site')==='cross-site')return respond(403,{ok:false,message:'Open your approved invitation on this website.'});
  if(request.headers.get('content-type')?.split(';')[0].trim()!=='application/json')return respond(415,{ok:false,message:'Use the professional inquiry form.'});
  let payload;
  try{payload=await readJson(request);}catch(error){return respond(error instanceof RangeError?413:400,{ok:false,message:'The inquiry is invalid or too large. Check the field limits and try again.'});}
  if(!payload||typeof payload!=='object'||Array.isArray(payload)||Object.keys(payload).some(key=>!['action','token','fields'].includes(key))||!['open','prepare'].includes(payload.action))return respond(400,{ok:false,message:'Use the professional inquiry form.'});
  let approvals;
  try{approvals=registry??await loadApprovalRegistry();}catch{return respond(503,{ok:false,message:'Business access is temporarily unavailable. Please contact Sohila by email or LinkedIn.'});}
  const business=authorizeInvitation(payload.token,approvals,{origin,now});
  if(!business)return respond(403,{ok:false,message:'A current invitation for an approved business is required. Request verification or ask for a new invitation.'});
  if(payload.action==='open')return respond(200,{ok:true,business:{legalName:business.legalName,contactName:business.contactName,email:business.email,website:business.website,country:business.country,expiresAt:new Date(business.expiresAt).toISOString()}});
  const result=validateInquiry(payload.fields,business),{value,errors}=result;
  if(value.phone&&!errors.phone){
    try{const number=parsePhoneNumberWithError(value.phone,{extract:false});if(!number.isValid()||number.ext)throw new Error('Invalid number');value.phone=number.number;}catch{errors.phone='This number does not match a valid international numbering plan. Include + and the country code, or leave it empty.';}
  }
  if(Object.keys(errors).length)return respond(422,{ok:false,message:'Please correct the highlighted fields.',errors});
  const subject=`Verified business inquiry: ${kinds[value.kind]} - ${value.title}`;
  const body=[
    'Hello Sohila,','',`Business: ${business.legalName}`,`Business website: ${business.website}`,`Registration country: ${business.country}`,`Contact: ${business.contactName}`,`Verified work email: ${business.email}`,`Contact role: ${value.role}`,
    ...(value.phone?[`Business phone (context only): ${value.phone}`]:[]),'',`Inquiry: ${kinds[value.kind]}`,`Focus: ${focuses[value.focus]}`,`Role / project: ${value.title}`,'Work arrangement: Remote',`Budget / compensation: ${value.budgetMin} - ${value.budgetMax} ${value.currency} (${units[value.budgetUnit]})`,`Expected start: ${timelines[value.timeline]}`,
    ...(value.reference?[`Professional reference: ${value.reference}`]:[]),'','ROLE / BUSINESS PROBLEM',value.brief,'','RESPONSIBILITIES / DELIVERABLES',value.outcome,
    ...(value.environment?['','TOOLS / DATA ENVIRONMENT',value.environment]:[]),'',`Business approval reference: ${business.approvalId.slice(0,16)}`,'This is a genuine professional work inquiry. Please reply by email.','',`Thank you,`,business.contactName
  ].join('\n');
  return respond(200,{ok:true,draft:{to:replyTo,subject,body,mailto:'mailto:'+replyTo+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body)}});
}

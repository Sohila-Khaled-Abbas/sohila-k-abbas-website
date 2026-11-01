import {createHash,randomBytes,createCipheriv,createDecipheriv} from 'node:crypto';
import fs from 'node:fs/promises';
import {normalize,validName,normalizeBusinessEmail,publicHttps,emailMatchesBusiness} from '../src/assets/inquiry-rules.mjs';

export const productionOrigin='https://sohila-khaled-abbas.vercel.app';
const tokenKey=token=>typeof token==='string'&&/^[A-Za-z0-9_-]{43}$/.test(token)&&Buffer.from(token,'base64url').toString('base64url')===token?Buffer.from(token,'base64url'):null;
export const invitationId=token=>{const key=tokenKey(token);return key?createHash('sha256').update(key).digest('hex'):'';};
function validBusiness(raw){
  if(!raw||typeof raw!=='object')return false;
  const email=normalizeBusinessEmail(raw.email);
  return typeof raw.legalName==='string'&&raw.legalName.trim().length>=2&&raw.legalName.length<=160&&!/[<>\r\n\x00-\x1f]/.test(raw.legalName)&&validName(raw.contactName)&&Boolean(email)&&email===raw.email&&publicHttps(raw.website)&&emailMatchesBusiness(email,raw.website)&&/^[A-Z]{2}$/.test(raw.country||'')&&typeof raw.registrationReference==='string'&&raw.registrationReference.trim().length>=2&&raw.registrationReference.length<=160&&publicHttps(raw.registryUrl)&&raw.checks?.registryChecked===true&&raw.checks?.businessDomainChecked===true&&raw.checks?.workEmailConfirmed===true;
}
export function issueInvitation(raw,{hours=72,origin=productionOrigin,now=Date.now()}={}){
  const business={...raw,email:normalizeBusinessEmail(raw.email),legalName:normalize(raw.legalName),contactName:normalize(raw.contactName)};
  if(!validBusiness(business))throw new Error('A registry-checked business, matching business domain, named contact, and confirmed work email are required.');
  const audience=new URL(origin).origin;
  if(!audience.startsWith('https://')&&!['localhost','127.0.0.1','terminal.local'].includes(new URL(audience).hostname))throw new Error('Invitations require an HTTPS website origin.');
  if(!Number.isFinite(hours)||hours<1||hours>168)throw new Error('Invitation lifetime must be 1-168 hours.');
  const key=randomBytes(32),token=key.toString('base64url'),iv=randomBytes(12);
  const approval={...business,audience,issuedAt:now,expiresAt:now+hours*3600000};
  const cipher=createCipheriv('aes-256-gcm',key,iv);
  const data=Buffer.concat([cipher.update(JSON.stringify(approval),'utf8'),cipher.final()]);
  return {id:invitationId(token),token,approval,entry:{version:1,iv:iv.toString('base64url'),tag:cipher.getAuthTag().toString('base64url'),data:data.toString('base64url')},url:audience+'/services/#business-invite='+token};
}
export function authorizeInvitation(token,registry,{origin,now=Date.now()}={}){
  try{
    const key=tokenKey(token),id=invitationId(token);
    if(!key||registry?.version!==1||!Object.hasOwn(registry.approvals||{},id))return null;
    const entry=registry.approvals[id];if(entry.version!==1||typeof entry.data!=='string'||entry.data.length>12000)return null;
    const decipher=createDecipheriv('aes-256-gcm',key,Buffer.from(entry.iv,'base64url'));
    decipher.setAuthTag(Buffer.from(entry.tag,'base64url'));
    const business=JSON.parse(Buffer.concat([decipher.update(Buffer.from(entry.data,'base64url')),decipher.final()]).toString('utf8'));
    if(!validBusiness(business)||!Number.isFinite(business.issuedAt)||!Number.isFinite(business.expiresAt)||business.issuedAt>now+60000||business.expiresAt<=now||business.expiresAt-business.issuedAt>168*3600000||business.expiresAt<=business.issuedAt||business.audience!==origin)return null;
    return {...business,approvalId:id};
  }catch{return null;}
}
export async function loadApprovalRegistry(){
  const location=!process.env.VERCEL&&process.env.INQUIRY_APPROVALS_FILE?process.env.INQUIRY_APPROVALS_FILE:new URL('./business-approvals.json',import.meta.url);
  const registry=JSON.parse(await fs.readFile(location,'utf8'));
  if(registry.version!==1||!registry.approvals||Array.isArray(registry.approvals)||typeof registry.approvals!=='object')throw new Error('Invalid approval registry');
  return registry;
}

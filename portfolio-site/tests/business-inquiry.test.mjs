import test from 'node:test';
import assert from 'node:assert/strict';
import {issueInvitation,authorizeInvitation,productionOrigin} from '../server/business-access.mjs';
import {handleBusinessInquiry} from '../server/business-inquiry.mjs';
import {normalizeBusinessEmail,validateInquiry} from '../src/assets/inquiry-rules.mjs';

// Offline fixtures only. No business is approved by the deployed empty registry.
const now=Date.UTC(2026,10,1,12);
const business={legalName:'Fixture Analytics Limited (test only)',contactName:'Rana Hassan',email:'recruiting@contoso.com',website:'https://contoso.com',country:'GB',registrationReference:'TEST-ONLY-123',registryUrl:'https://find-and-update.company-information.service.gov.uk/',checks:{registryChecked:true,businessDomainChecked:true,workEmailConfirmed:true}};
const invitation=issueInvitation(business,{now});
const registry={version:1,approvals:{[invitation.id]:invitation.entry}};
const fields={name:business.contactName,company:business.legalName,email:business.email,role:'Recruitment manager',phone:'',kind:'project',focus:'bi',title:'Remote Power BI reporting project',currency:'USD',budgetMin:'1200',budgetMax:'2000',budgetUnit:'project',timeline:'month',reference:'https://contoso.com/careers',brief:'We need a remote Power BI developer to model our sales and inventory data, define consistent commercial metrics, and build a maintainable reporting workflow for the operations team.',outcome:'Deliver a documented semantic model, sales and inventory report pages, and a clear handover explaining refresh steps and metric definitions.',environment:'SQL Server source data and Power BI reporting, with scheduled refresh and documented data definitions.',professional:true,websiteFax:''};
const request=(payload,headers={})=>new Request(productionOrigin+'/api/business-inquiry',{method:'POST',headers:{Origin:productionOrigin,'Content-Type':'application/json','X-Inquiry-Client':'portfolio-v1',...headers},body:JSON.stringify(payload)});
const prepare=(overrides={},extra={})=>handleBusinessInquiry(request({action:'prepare',token:invitation.token,fields:{...fields,...overrides}}),{registry,now,...extra});

test('approval content is encrypted and cannot be opened without its private invitation',()=>{
  const published=JSON.stringify(registry);assert(!published.includes(business.email));assert(!published.includes(business.contactName));assert(!published.includes(invitation.token));
  assert.equal(authorizeInvitation(invitation.token,registry,{origin:productionOrigin,now}).email,business.email);
  assert.equal(authorizeInvitation('A'.repeat(43),registry,{origin:productionOrigin,now}),null);
});
test('an empty, missing, or revoked approval fails closed',async()=>{
  for(const approvals of [{version:1,approvals:{}},undefined])assert.equal(authorizeInvitation(invitation.token,approvals,{origin:productionOrigin,now}),null);
  const response=await prepare({}, {registry:{version:1,approvals:{}}});assert.equal(response.status,403);
});
test('expired, wrong-origin, or tampered invitations are rejected',()=>{
  assert.equal(authorizeInvitation(invitation.token,registry,{origin:productionOrigin,now:now+73*3600000}),null);
  assert.equal(authorizeInvitation(invitation.token,registry,{origin:'https://old-preview.vercel.app',now}),null);
  const changed=structuredClone(registry);changed.approvals[invitation.id].tag='A'.repeat(22);
  assert.equal(authorizeInvitation(invitation.token,changed,{origin:productionOrigin,now}),null);
  assert.equal(authorizeInvitation(invitation.token+'=',registry,{origin:productionOrigin,now}),null);
});
test('owner cannot issue an approval without all three verification attestations',()=>{
  for(const key of Object.keys(business.checks))assert.throws(()=>issueInvitation({...business,checks:{...business.checks,[key]:false}},{now}));
  assert.throws(()=>issueInvitation({...business,email:'fake@gmail.com'},{now}));
  assert.throws(()=>issueInvitation({...business,email:'person@unrelated-company.com'},{now}));
  assert.throws(()=>issueInvitation(business,{now,hours:169}));
});
test('opening a valid invitation returns only its approved identity',async()=>{
  const response=await handleBusinessInquiry(request({action:'open',token:invitation.token}),{registry,now});
  assert.equal(response.status,200);assert.match(response.headers.get('cache-control'),/no-store/);
  const data=await response.json();assert.equal(data.business.email,business.email);assert(!JSON.stringify(data).includes(business.registrationReference));assert(!JSON.stringify(data).includes(invitation.token));
});
test('valid business inquiry creates an email draft without sending it',async()=>{
  const response=await prepare();assert.equal(response.status,200);const {draft}=await response.json();
  assert.equal(draft.to,'sohila.k.data@gmail.com');assert.match(draft.body,/Fixture Analytics/);assert.match(draft.body,/Work arrangement: Remote/);assert(draft.mailto.startsWith('mailto:'));assert(!draft.body.includes(invitation.token));
});
test('format-valid international phone is normalized using the complete numbering metadata',async()=>{
  for(const phone of ['+1 (213) 373-4253','+١ ٢١٣ ٣٧٣ ٤٢٥٣']){
    const response=await prepare({phone});assert.equal(response.status,200);const data=await response.json();assert(data.draft.body.includes('+12133734253'));
  }
});
test('malformed, impossible, local-only, dummy, and extension phone inputs are rejected',async()=>{
  for(const phone of ['2133734253','+999123123123','+10000000000','+1 123 123 1234','+12133734253 ext 7','not a phone','+123']){
    const response=await prepare({phone});assert.equal(response.status,422,phone);assert((await response.json()).errors.phone);
  }
});
test('approved name, company, and work email cannot be replaced in a forged request',async()=>{
  for(const [key,value]of [['name','Test User'],['company','Unapproved company'],['email','someone@contoso.com'],['email','person@gmail.com'],['email','a\r\nBcc: spam@evil.com']]){
    const response=await prepare({[key]:value});assert.equal(response.status,422);assert((await response.json()).errors[key]);
  }
});
test('personal requests, placeholder scope, unsupported work types, and honeypots are rejected',async()=>{
  for(const patch of [{kind:'dating'},{focus:'marketing-spam'},{brief:'a'.repeat(160)},{brief:'Please date me. '+fields.brief},{websiteFax:'bot-filled'},{professional:false},{brief:'A short message'},{outcome:'none'}]){
    assert.equal((await prepare(patch)).status,422,JSON.stringify(patch));
  }
});
test('budget, reference URL, HTML, unknown fields, and wrong JSON types are checked on the server',async()=>{
  for(const patch of [{budgetMin:'0'},{budgetMin:'1e5'},{budgetMin:'5000',budgetMax:'100'},{budgetMax:'1.001'},{currency:'FAKE'},{kind:'employment',budgetUnit:'project'},{reference:'javascript:alert(1)'},{reference:'https://contoso.com.evil.com'},{reference:'https://contoso.com@evil.com'},{brief:'<script>alert(1)</script>'+fields.brief},{unexpected:'value'},{phone:['+12133734253']}]){
    assert.equal((await prepare(patch)).status,422,JSON.stringify(patch));
  }
});
test('cross-origin, wrong content type, missing invitation, and oversized requests cannot prepare a draft',async()=>{
  assert.equal((await handleBusinessInquiry(request({action:'prepare',token:invitation.token,fields},{Origin:'https://evil.com'}),{registry,now})).status,403);
  assert.equal((await handleBusinessInquiry(request({action:'prepare',token:invitation.token,fields},{'Content-Type':'text/plain'}),{registry,now})).status,415);
  assert.equal((await handleBusinessInquiry(request({action:'prepare',fields}),{registry,now})).status,403);
  assert.equal((await prepare({brief:'x'.repeat(18000)})).status,413);
  assert.equal((await handleBusinessInquiry(new Request(productionOrigin+'/api/business-inquiry'),{registry,now})).status,405);
});
test('business email grammar rejects placeholder, consumer, temporary, and malformed domains',()=>{
  for(const email of ['test@example.com','x@localhost','person@gmail.com','x@mailinator.com','.x@contoso.com','x..y@contoso.com','person@-company.com','person@company..com','x@contoso.com\nBcc:evil@bad.com'])assert.equal(normalizeBusinessEmail(email),'',email);
  assert.equal(normalizeBusinessEmail('Recruiting+Data@Contoso.com'),'recruiting+data@contoso.com');
});
test('Unicode contact names and genuine non-English business descriptions remain accepted',()=>{
  const arBusiness={...business,contactName:'رانا حسن'};
  const result=validateInquiry({...fields,name:arBusiness.contactName,role:'مديرة التوظيف',title:'مشروع تحليل بيانات المبيعات',brief:'نبحث عن متخصصة للعمل عن بعد على تحليل بيانات المبيعات والمخزون وبناء نموذج بيانات واضح وتقارير باستخدام باور بي آي لدعم فريق العمليات ومتابعة الأداء التجاري بشكل مستمر.',outcome:'المطلوب إعداد نموذج بيانات موثق ولوحات متابعة للمبيعات والمخزون مع شرح مؤشرات الأداء وخطوات تحديث البيانات.'},arBusiness);
  assert.equal(result.ok,true,JSON.stringify(result.errors));
});

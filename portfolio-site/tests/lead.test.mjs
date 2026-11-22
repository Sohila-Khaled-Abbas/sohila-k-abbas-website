import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {handleLead,allowedBudgets} from '../server/lead.mjs';
import {productionOrigin,issueInvitation} from '../server/business-access.mjs';

const now=Date.UTC(2026,10,22,12);
const secret='a'.repeat(64);
const env={
  LEAD_WEBHOOK_URL:'https://script.google.com/macros/s/TEST_DEPLOYMENT_ID/exec',
  LEAD_WEBHOOK_SECRET:secret
};
const base={
  type:'standard',
  name:'Test User',
  email:'test@example.com',
  description:'Dummy QA submission only. Please do not process this as a real project inquiry.',
  budgetRange:'Not sure yet',
  websiteFax:'',
  formStartedAt:String(now-4000),
  submissionId:'123e4567-e89b-42d3-a456-426614174000',
  sourcePage:'/services/'
};
function request(payload,options={}){
  const headers={
    Origin:productionOrigin,
    'Content-Type':'application/json',
    'X-Real-IP':'203.0.113.10',
    ...(options.headers||{})
  };
  return new Request(productionOrigin+'/api/lead',{
    method:options.method||'POST',
    headers,
    body:options.body===undefined?JSON.stringify(payload):options.body
  });
}
const mockFetch=async()=>new Response(JSON.stringify({ok:true,notificationSent:true}),{
  status:200,headers:{'Content-Type':'application/json'}
});

test('standard leads are validated and forwarded through the configured webhook',async()=>{
  let sent;
  const response=await handleLead(request(base),{
    env,now,fetchImpl:async(url,options)=>{
      sent={url,body:JSON.parse(options.body)};
      return mockFetch();
    }
  });
  assert.equal(response.status,200);
  assert.equal((await response.json()).ok,true);
  assert.equal(sent.url,env.LEAD_WEBHOOK_URL);
  assert.equal(sent.body.name,'Test User');
  assert.equal(sent.body.email,'test@example.com');
  assert.equal(sent.body.project,base.description);
  assert.equal(sent.body.budget,'Not sure yet');
  assert.equal(sent.body.type,'standard');
  assert.match(sent.body.rateKey,/^[0-9a-f]{64}$/);
  assert.notEqual(sent.body.rateKey,'203.0.113.10');
  assert.equal(sent.body.secret,secret);
});

test('all six public USD budget ranges are accepted; unlisted values are rejected',async()=>{
  assert.equal(allowedBudgets.length,6);
  for(const budgetRange of allowedBudgets){
    const response=await handleLead(request({...base,budgetRange}),{env,now,fetchImpl:mockFetch});
    assert.equal(response.status,200,budgetRange);
  }
  const response=await handleLead(request({...base,budgetRange:'$20,000'}),{env,now,fetchImpl:mockFetch});
  assert.equal(response.status,422);
  assert((await response.json()).errors.budgetRange);
});

test('invalid name, email, description, and missing values fail before webhook delivery',async()=>{
  const cases=[
    {name:'A'},
    {email:'not-an-email'},
    {description:'A short brief'},
    {budgetRange:'$9000'},
    {description:'x'.repeat(1801)}
  ];
  for(const patch of cases){
    let calls=0;
    const response=await handleLead(request({...base,...patch}),{
      env,now,fetchImpl:async()=>{calls++;return mockFetch();}
    });
    assert.equal(response.status,422,JSON.stringify(patch));
    assert.equal(calls,0);
  }
});

test('honeypot entries are silently acknowledged and never forwarded',async()=>{
  let calls=0;
  const response=await handleLead(request({...base,websiteFax:'bot-filled'}),{
    env,now,fetchImpl:async()=>{calls++;return mockFetch();}
  });
  assert.equal(response.status,200);
  assert.equal(calls,0);
});

test('minimum completion time, stale timestamps, and future timestamps are rejected',async()=>{
  for(const formStartedAt of [String(now-500),String(now-8*24*60*60*1000),String(now+60000)]){
    const response=await handleLead(request({...base,formStartedAt}),{env,now,fetchImpl:mockFetch});
    assert.equal(response.status,422);
  }
});

test('same-origin policy, HTTP method, content type, and body size are enforced',async()=>{
  assert.equal((await handleLead(request(base,{headers:{Origin:'https://example.com'}}),{env,now,fetchImpl:mockFetch})).status,403);
  assert.equal((await handleLead(request(base,{method:'GET'}),{env,now,fetchImpl:mockFetch})).status,405);
  const typeResponse=await handleLead(new Request(productionOrigin+'/api/lead',{
    method:'POST',headers:{Origin:productionOrigin,'Content-Type':'text/plain'},body:'no'
  }),{env,now,fetchImpl:mockFetch});
  assert.equal(typeResponse.status,415);
  const big=await handleLead(request({...base,description:'x'.repeat(20000)}),{env,now,fetchImpl:mockFetch});
  assert.equal(big.status,413);
});

test('URL-encoded form submissions are supported',async()=>{
  const form=new URLSearchParams(Object.entries(base));
  const response=await handleLead(new Request(productionOrigin+'/api/lead',{
    method:'POST',
    headers:{Origin:productionOrigin,'Content-Type':'application/x-www-form-urlencoded','X-Real-IP':'203.0.113.11'},
    body:form.toString()
  }),{env,now,fetchImpl:mockFetch});
  assert.equal(response.status,200);
});

test('multipart form submissions are supported',async()=>{
  const form=new FormData();
  for(const [key,value] of Object.entries(base))form.set(key,String(value));
  const response=await handleLead(new Request(productionOrigin+'/api/lead',{
    method:'POST',headers:{Origin:productionOrigin,'X-Real-IP':'203.0.113.12'},body:form
  }),{env,now,fetchImpl:mockFetch});
  assert.equal(response.status,200);
});

test('enterprise submissions re-check their invitation and existing field rules',async()=>{
  const business={
    legalName:'Fixture Analytics Limited (test only)',
    contactName:'Rana Hassan',
    email:'recruiting@contoso.com',
    website:'https://contoso.com',
    country:'GB',
    registrationReference:'TEST-ONLY-123',
    registryUrl:'https://find-and-update.company-information.service.gov.uk/',
    checks:{registryChecked:true,businessDomainChecked:true,workEmailConfirmed:true}
  };
  const invitation=issueInvitation(business,{now});
  const registry={version:1,approvals:{[invitation.id]:invitation.entry}};
  const fields={
    name:business.contactName,company:business.legalName,email:business.email,
    role:'Recruitment manager',phone:'',kind:'project',focus:'bi',
    title:'Remote Power BI reporting project',currency:'USD',budgetMin:'1200',
    budgetMax:'2000',budgetUnit:'project',timeline:'month',
    reference:'https://contoso.com/careers',
    brief:'We need a remote Power BI developer to model our sales and inventory data, define consistent commercial metrics, and build a maintainable reporting workflow for the operations team.',
    outcome:'Deliver a documented semantic model, sales and inventory report pages, and a clear handover explaining refresh steps and metric definitions.',
    environment:'SQL Server source data and Power BI reporting, with scheduled refresh and documented data definitions.',
    professional:true,websiteFax:''
  };
  let forwarded;
  const response=await handleLead(request({
    type:'enterprise',token:invitation.token,fields,
    formStartedAt:String(now-4000),submissionId:base.submissionId,sourcePage:'/services/'
  }),{
    env,now,registry,
    fetchImpl:async(_url,options)=>{forwarded=JSON.parse(options.body);return mockFetch();}
  });
  assert.equal(response.status,200);
  assert.equal(forwarded.type,'enterprise');
  assert.match(forwarded.project,/Business: Fixture Analytics Limited/);
  assert.match(forwarded.project,/RESPONSIBILITIES \/ DELIVERABLES/);
  assert.equal(forwarded.budget,'1200–2000 USD (Total project budget)');
  assert.equal(forwarded.email,business.email);
});

test('enterprise data without a valid invitation is rejected',async()=>{
  const response=await handleLead(request({
    type:'enterprise',token:'',fields:{name:'Test User'},
    formStartedAt:String(now-4000),sourcePage:'/services/'
  }),{
    env,now,registry:{version:1,approvals:{}},fetchImpl:mockFetch
  });
  assert.equal(response.status,403);
});

test('missing webhook configuration, missing source IP, and webhook failures fail safely',async()=>{
  assert.equal((await handleLead(request(base),{env:{},now,fetchImpl:mockFetch})).status,503);
  assert.equal((await handleLead(request(base,{headers:{'X-Real-IP':''}}),{env,now,fetchImpl:mockFetch})).status,503);
  const failed=await handleLead(request(base),{
    env,now,fetchImpl:async()=>new Response('not json',{status:500})
  });
  assert.equal(failed.status,502);
});

test('the Apps Script source enforces secret checks, locking, sheet schema, and owner-only notification',async()=>{
  const source=await fs.readFile(new URL('../scripts/google-apps-script/LeadWebhook.gs',import.meta.url),'utf8');
  assert(source.includes("getProperty('LEAD_WEBHOOK_SECRET')"));
  assert(source.includes('constantTimeEqual'));
  assert(source.includes('LockService.getScriptLock()'));
  assert(source.includes('CacheService.getScriptCache()'));
  for(const header of ['Timestamp','Name','Email','Project','Budget','Source page','Type','Status','Notes']){
    assert(source.includes("'" + header + "'"));
  }
  assert(source.includes("getSheetByName(SHEET_NAME)"));
  assert(source.includes('sheet.appendRow('));
  assert(source.includes("'New'"));
  assert(source.includes('replyTo: payload.email'));
  assert(source.includes('to: OWNER_EMAIL'));
  assert(!source.includes('to: payload.email'));
  assert(!source.includes('within 2 business days'));
});

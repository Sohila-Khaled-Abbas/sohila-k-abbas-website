import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
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
  const method=options.method||'POST';
  const headers={
    Origin:productionOrigin,
    'Content-Type':'application/json',
    'X-Real-IP':'203.0.113.10',
    ...(options.headers||{})
  };
  const init={method,headers};
  if(method!=='GET'&&method!=='HEAD'){
    init.body=options.body===undefined?JSON.stringify(payload):options.body;
  }
  return new Request(productionOrigin+'/api/lead',init);
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

test('the six exact EGP budget ranges are accepted and legacy or unlisted values are rejected',async()=>{
  assert.deepEqual(allowedBudgets,[
    '500 - 2,000 EGP',
    '2,000 - 5,000 EGP',
    '5,000 - 10,000 EGP',
    '10,000 - 25,000 EGP',
    '25,000+ EGP',
    'Not sure yet'
  ]);
  for(const budgetRange of allowedBudgets){
    const response=await handleLead(request({...base,budgetRange}),{env,now,fetchImpl:mockFetch});
    assert.equal(response.status,200,budgetRange);
  }
  for(const budgetRange of ['Under 500 EGP','500 - 2,000 USD','Under $500','$500–$1,000','500 - 2,000 EGP extra']){
    const response=await handleLead(request({...base,budgetRange}),{env,now,fetchImpl:mockFetch});
    assert.equal(response.status,422,budgetRange);
    assert((await response.json()).errors.budgetRange);
  }
});

test('invalid name, email, description, and missing values fail before webhook delivery',async()=>{
  const cases=[
    {name:'A'},
    {email:'not-an-email'},
    {description:'A short brief'},
    {budgetRange:'Under 500 EGP'},
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
    title:'Remote Power BI reporting project',currency:'EGP',budgetMin:'1200',
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
  assert.equal(forwarded.budget,'1200–2000 EGP (Total project budget)');
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

function createAppsScriptHarness(){
  const values=new Map();
  const rows=[];
  const emails=[];
  const secret='test-apps-script-secret';
  const sheet={
    getLastRow(){return rows.length;},
    appendRow(row){rows.push(row);},
    getRange(row,column){
      return {
        getValues(){return [rows[row-1]||[]];},
        setValue(value){if(rows[row-1])rows[row-1][column-1]=value;}
      };
    }
  };
  const context={
    PropertiesService:{getScriptProperties:()=>({getProperty:key=>key==='LEAD_WEBHOOK_SECRET'?secret:''})},
    LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},
    CacheService:{getScriptCache:()=>({
      get:key=>values.has(key)?values.get(key):null,
      put:(key,value)=>values.set(key,String(value))
    })},
    SpreadsheetApp:{getActiveSpreadsheet:()=>({getSheetByName:name=>name==='Leads'?sheet:null})},
    MailApp:{sendEmail:message=>emails.push(message)},
    ContentService:{
      MimeType:{JSON:'application/json'},
      createTextOutput:text=>({text,setMimeType(){return this;}})
    }
  };
  vm.runInNewContext(appsScriptSource,context);
  return {context,rows,emails,secret};
}
const appsScriptPath=new URL('../scripts/google-apps-script/LeadWebhook.gs',import.meta.url);
const appsScriptSource=await fs.readFile(appsScriptPath,'utf8');
function scriptPayload(secret,submissionId,rateKey='c'.repeat(64)){
  return {
    secret,submissionId,rateKey,
    name:'Test User',
    email:'test@example.com',
    project:'Dummy project inquiry used only by the isolated Apps Script test harness.',
    budget:'Not sure yet',
    sourcePage:'/services/',
    type:'standard',
    notes:''
  };
}
function callAppsScript(context,payload){
  const output=context.doPost({postData:{contents:JSON.stringify(payload)}});
  return JSON.parse(output.text);
}

test('Apps Script validates the secret, writes the exact row schema, and emails only the owner with the lead Reply-To',()=>{
  const {context,rows,emails,secret}=createAppsScriptHarness();
  const result=callAppsScript(context,scriptPayload(secret,'123e4567-e89b-42d3-a456-426614174000'));
  assert.equal(result.ok,true);
  assert.equal(result.notificationSent,true);
  assert.equal(rows.length,2);
  assert.deepEqual(Array.from(rows[0]),['Timestamp','Name','Email','Project','Budget','Source page','Type','Status','Notes']);
  assert.equal(rows[1][1],'Test User');
  assert.equal(rows[1][2],'test@example.com');
  assert.equal(rows[1][7],'New');
  assert.equal(emails.length,1);
  assert.equal(emails[0].to,'sohila.k.data@gmail.com');
  assert.equal(emails[0].replyTo,'test@example.com');
  assert.equal(emails[0].subject,'New lead: Test User - Not sure yet');
  assert(!('secret' in rows[1]));
});

test('Apps Script enforces the same exact EGP budget allow-list as the server',()=>{
  for(const [index,budget] of allowedBudgets.entries()){
    const {context,secret}=createAppsScriptHarness();
    const payload=scriptPayload(secret,'123e4567-e89b-42d3-a456-42661417400'+index);
    payload.budget=budget;
    assert.equal(callAppsScript(context,payload).ok,true,budget);
  }
  for(const budget of ['Under 500 EGP','500 - 2,000 USD','Under $500','$500–$1,000']){
    const {context,secret}=createAppsScriptHarness();
    const payload=scriptPayload(secret,'123e4567-e89b-42d3-a456-426614174000');
    payload.budget=budget;
    assert.equal(callAppsScript(context,payload).code,'INVALID_PAYLOAD',budget);
  }
  const enterpriseBudgets=[
    ['500–2000 EGP (Total project budget)',true],
    ['500–2000 EGP (Per hour)',true],
    ['499–2000 EGP (Total project budget)',false],
    ['500–499 EGP (Total project budget)',false],
    ['500–2000 USD (Total project budget)',false],
    ['500–2000 EGP (Invalid unit)',false]
  ];
  for(const [budget,accepted] of enterpriseBudgets){
    const {context,secret}=createAppsScriptHarness();
    const payload=scriptPayload(secret,'123e4567-e89b-42d3-a456-426614174001');
    payload.type='enterprise';
    payload.budget=budget;
    const response=callAppsScript(context,payload);
    assert.equal(response.ok,accepted,budget);
    if(!accepted)assert.equal(response.code,'INVALID_PAYLOAD',budget);
  }
});

test('Apps Script rejects invalid shared secrets before touching the Sheet or MailApp',()=>{
  const {context,rows,emails,secret}=createAppsScriptHarness();
  const result=callAppsScript(context,scriptPayload('wrong-secret','123e4567-e89b-42d3-a456-426614174000'));
  assert.equal(result.code,'UNAUTHORIZED');
  assert.equal(rows.length,0);
  assert.equal(emails.length,0);
  assert.equal(secret,'test-apps-script-secret');
});

test('Apps Script cache and lock enforce the per-IP limit and deduplicate retry submissions',()=>{
  const {context,rows,emails,secret}=createAppsScriptHarness();
  for(let index=0;index<5;index++){
    const result=callAppsScript(context,scriptPayload(
      secret,
      '123e4567-e89b-42d3-a456-42661417400'+index
    ));
    assert.equal(result.ok,true);
  }
  const limited=callAppsScript(context,scriptPayload(
    secret,
    '123e4567-e89b-42d3-a456-426614174099'
  ));
  assert.equal(limited.code,'RATE_LIMITED');
  assert.equal(rows.length,6);
  assert.equal(emails.length,5);

  const duplicateHarness=createAppsScriptHarness();
  const duplicatePayload=scriptPayload(
    duplicateHarness.secret,
    '123e4567-e89b-42d3-a456-426614174555'
  );
  const first=callAppsScript(duplicateHarness.context,duplicatePayload);
  const retry=callAppsScript(duplicateHarness.context,duplicatePayload);
  assert.equal(first.ok,true);
  assert.equal(retry.ok,true);
  assert.equal(retry.duplicate,true);
  assert.equal(duplicateHarness.rows.length,2);
  assert.equal(duplicateHarness.emails.length,1);
});

test('Apps Script records a notification failure in Notes without sending a respondent auto-reply',()=>{
  const {context,rows,emails,secret}=createAppsScriptHarness();
  context.MailApp.sendEmail=()=>{throw new Error('mock mail failure');};
  const result=callAppsScript(context,scriptPayload(secret,'123e4567-e89b-42d3-a456-426614174777'));
  assert.equal(result.ok,true);
  assert.equal(result.notificationSent,false);
  assert.match(rows[1][8],/notification could not be sent/i);
  assert.equal(emails.length,0);
  assert(!appsScriptSource.includes('within 2 business days'));
  assert(!appsScriptSource.includes('to: payload.email'));
});

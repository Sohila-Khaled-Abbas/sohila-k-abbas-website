import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import {chromium} from "playwright";

const baseUrl=process.env.BASE_URL;
if(!baseUrl)throw new Error("BASE_URL must point to the actual Vercel preview deployment.");
const base=new URL(baseUrl);
if(base.protocol!=="https:"||!base.hostname.endsWith(".vercel.app"))throw new Error("Visual tests only accept an HTTPS Vercel preview URL.");
const screenshotDir=path.resolve(process.cwd(),"..","screenshots");
await fs.mkdir(screenshotDir,{recursive:true});

const expectedFeatured=[
 "fmcg-sales-churn-drop-analysis-powerbi",
 "SMART-Supply-Chain-Insights-Dashboard",
 "Wuzzuf-Job-Market-Analysis"
];
const viewports=[
 {width:390,height:844},
 {width:768,height:1024},
 {width:1280,height:900}
];
const wideWorkViewports=[{width:1440,height:960},{width:1920,height:1080}];
const themes=["light","dark"];
const pages=[
 {route:"/",name:"home"},
 {route:"/work/",name:"work"},
 {route:"/dashboards/",name:"dashboards"},
 {route:"/projects/fmcg-sales-churn-drop-analysis-powerbi/",name:"b2b-retail-scenario"},
 {route:"/projects/SMART-Supply-Chain-Insights-Dashboard/",name:"smart-supply-chain"},
 {route:"/projects/Wuzzuf-Job-Market-Analysis/",name:"wuzzuf-job-market"},
 {route:"/about/",name:"about"},
 {route:"/resume/",name:"resume"},
 {route:"/contact/",name:"contact"},
 {route:"/services/",name:"services"}
];
const browser=await chromium.launch({headless:true});

async function addProtectionHeader(page){
 const bypass=process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
 if(bypass)await page.setExtraHTTPHeaders({"x-vercel-protection-bypass":bypass});
}
async function settlePage(page){
 await page.evaluate(async()=>{if(document.fonts?.ready)await document.fonts.ready;});
 const total=await page.evaluate(()=>document.documentElement.scrollHeight);
 const viewportHeight=page.viewportSize()?.height||844;
 const step=Math.max(420,Math.floor(viewportHeight*.72));
 for(let y=0;y<total;y+=step){
  await page.evaluate(scrollY=>window.scrollTo(0,scrollY),y);
  await page.waitForTimeout(45);
 }
 await page.evaluate(()=>window.scrollTo(0,0));
 await page.waitForTimeout(140);
}
async function inspectLayout(page){
 return page.evaluate(()=>{
  const width=window.innerWidth;
  const rootWidth=document.documentElement.scrollWidth;
  const bodyWidth=document.body.scrollWidth;
  const selectors=[
   ".editorial-hero h1",".editorial-hero-lead",".editorial-location",
   ".editorial-section-heading h2",".editorial-case-copy h3",".editorial-case-intro",
   ".pinned-case-card h3",".pinned-case-card .project-card-description",
   ".dashboard-card-copy h2",".dashboard-card-copy p",
   ".story-heading h2",".story-panel h3",".story-evidence-block p",".story-context p",
   ".editorial-about-copy h1",".editorial-about-lead",".resume-heading h1",".resume-summary",
   ".editorial-contact-main h2",".contact-email","button",".button","#navigation a"
  ];
  const clipped=[];
  for(const element of document.querySelectorAll(selectors.join(","))){
   if(element.closest("[hidden],[aria-hidden=true],details:not([open]),dialog:not([open]),.skip,.sr-only"))continue;
   const style=getComputedStyle(element);
   const rect=element.getBoundingClientRect();
   if(style.display==="none"||style.visibility==="hidden"||Number.parseFloat(style.opacity)<.05||rect.width===0||rect.height===0)continue;
   const clamp=Number.parseInt(style.webkitLineClamp,10);
   const clippedX=["hidden","clip"].includes(style.overflowX)&&element.scrollWidth>element.clientWidth+2;
   const clippedY=["hidden","clip"].includes(style.overflowY)&&element.scrollHeight>element.clientHeight+2;
   if(clippedX||clippedY||style.textOverflow==="ellipsis"||(Number.isFinite(clamp)&&clamp>0)){
    clipped.push({tag:element.tagName.toLowerCase(),className:typeof element.className==="string"?element.className:"",text:element.textContent.trim().replace(/\s+/g," ").slice(0,90),scrollWidth:element.scrollWidth,clientWidth:element.clientWidth,scrollHeight:element.scrollHeight,clientHeight:element.clientHeight,clamp:style.webkitLineClamp});
   }
  }
  const overflowCandidates=[...document.querySelectorAll("body *")].map(element=>{
   const rect=element.getBoundingClientRect();
   const style=getComputedStyle(element);
   return {tag:element.tagName.toLowerCase(),className:typeof element.className==="string"?element.className:"",text:element.textContent.trim().replace(/\\s+/g," ").slice(0,65),left:Math.round(rect.left),right:Math.round(rect.right),width:Math.round(rect.width),position:style.position,overflowX:style.overflowX};
  }).filter(item=>item.right>width+1&&item.left<width+1).sort((a,b)=>b.right-a.right).slice(0,16);
  return {width,rootWidth,bodyWidth,clipped,overflowCandidates,theme:document.documentElement.dataset.theme,background:getComputedStyle(document.body).backgroundColor};
 });
}
function assertLayout(audit,width,label){
 assert(audit.rootWidth<=width,"Horizontal overflow on "+label+": document.scrollWidth "+audit.rootWidth+"px > "+width+"px. Right-edge elements: "+JSON.stringify(audit.overflowCandidates));
 assert(audit.bodyWidth<=width,"Body overflow on "+label+": body.scrollWidth "+audit.bodyWidth+"px > "+width+"px");
 assert.equal(audit.clipped.length,0,"Clipped/ellipsized text on "+label+": "+JSON.stringify(audit.clipped));
}
async function captureRoute(route,width,height,theme,name){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 await page.emulateMedia({colorScheme:theme,reducedMotion:"reduce"});
 await addProtectionHeader(page);
 const response=await page.goto(new URL(route,base).href,{waitUntil:"domcontentloaded",timeout:60000});
 assert(response&&response.status()<400,route+" returned "+(response?.status()??"no response")+" at "+width+"px");
 await settlePage(page);
 const audit=await inspectLayout(page);
 const screenshot=path.join(screenshotDir,name+"-"+theme+"-"+width+".png");
 await page.screenshot({path:screenshot,fullPage:true,animations:"disabled"});
 assertLayout(audit,width,name+" "+theme+" "+width+"px");
 assert.equal(audit.theme,theme,"Theme does not match system preference for "+name+" "+width+"px");
 const h1=await page.locator("main h1").count();
 assert(h1>=1,name+" needs a visible main heading");
 if(name==="home"){
  assert.equal((await page.locator(".editorial-hero h1").innerText()).replace(/\s+/g," ").trim(),"Business questions. Clearer decisions.","Homepage headline has changed.");
  assert.equal((await page.locator(".editorial-hero .hero-actions a").nth(0).innerText()).trim(),"Explore case studies");
  assert.equal(await page.locator(".editorial-hero .hero-actions a").nth(0).getAttribute("href"),"/work/#case-studies");
  assert.equal((await page.locator(".editorial-hero .hero-actions a").nth(1).innerText()).trim(),"View resume");
  assert.equal(await page.locator(".editorial-hero .hero-actions a").nth(1).getAttribute("href"),"/resume/");
  assert((await page.locator(".editorial-location").innerText()).includes("Damietta, Egypt"));
  assert((await page.locator(".editorial-location").innerText()).includes("Open to remote employee roles"));
  const featured=await page.locator(".editorial-case-card[data-featured-case]").evaluateAll(cards=>cards.map(card=>card.dataset.featuredCase));
  assert.deepEqual(featured,expectedFeatured,"Homepage featured-case sequence changed.");
  assert.equal(await page.locator(".editorial-case-visual[data-lightbox]").count(),3,"Each featured case needs an enlargeable report preview.");
  assert.equal(await page.locator(".editorial-hero-portrait img").count(),1,"Keep the genuine owner portrait.");
  assert.equal(await page.locator(".editorial-home-contact").count(),0,"No stale freelance services section should return.");
 }
 if(name==="work"){
  const cards=await page.locator(".work-featured .pinned-case-card").evaluateAll(items=>items.map(card=>card.dataset.name));
  assert.deepEqual(cards,expectedFeatured,"Work page featured order changed.");
  const featureMetrics=await page.locator(".work-featured .pinned-case-card").first().evaluate(card=>{
   const rect=el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,top:r.top,bottom:r.bottom,height:r.height};};
   return {card:rect(card),media:rect(card.querySelector(".studio-project-cover")),visual:rect(card.querySelector(".project-visual")),image:rect(card.querySelector(".project-visual img")),copy:rect(card.querySelector(".studio-project-copy")),title:rect(card.querySelector("h3")),description:rect(card.querySelector(".project-card-description"))};
  });
  assert(featureMetrics.media.width>0&&featureMetrics.visual.width>0,"B2B preview frame must have a visible width.");
  assert(featureMetrics.media.right<=featureMetrics.card.right+1,"B2B preview frame must remain inside its card.");
  assert(featureMetrics.visual.right<=featureMetrics.media.right+1,"B2B report cover must remain inside its media column.");
  assert(featureMetrics.image.right<=featureMetrics.visual.right+1,"B2B cover image must remain inside its fixed-ratio frame.");
  assert(featureMetrics.title.width>0&&featureMetrics.title.height>0,"B2B card title must remain visible.");
  assert(featureMetrics.description.right<=featureMetrics.copy.right+1,"B2B description must fit within the padded text column.");
  if(width>=1000){
   assert(featureMetrics.media.right<=featureMetrics.copy.left+1,"B2B media and text columns must not overlap at desktop widths.");
   assert(featureMetrics.copy.right<=featureMetrics.card.right+1,"B2B title, description and tags must remain inside the card.");
  }
  if(width===390){
   const supply=await page.locator(".work-featured .pinned-case-card").nth(1).evaluate(card=>{
    const copy=card.querySelector(".studio-project-copy").getBoundingClientRect();
    const desc=card.querySelector(".project-card-description").getBoundingClientRect();
    const cardRect=card.getBoundingClientRect();
    return {cardRight:cardRect.right,copyRight:copy.right,descriptionRight:desc.right};
   });
   assert(supply.descriptionRight<=supply.copyRight-8,"SMART Supply Chain description must retain right padding on mobile.");
  }
  assert.equal(await page.locator("[data-repo-tools]").count(),1,"Full work collection and filters are missing.");
  await page.locator("[data-repo-tools] > summary").click();
  assert(await page.locator("#repo-grid .repo-card").count()>0,"Full project catalogue should remain discoverable.");
  assert.equal(await page.locator('#repo-grid .repo-card[data-kind="fork"]').count(),0,"Forked resources must not appear as original work.");
  assert.equal(await page.locator('#repo-grid .repo-card[data-category="learning"]').count(),0,"Learning resources must not appear as professional case studies.");
 }
 if(name==="b2b-retail-scenario"){
  assert((await page.locator("h1").first().innerText()).includes("Portfolio Scenario"),"B2B case title must be explicit portfolio scenario.");
  assert((await page.locator(".story-context").innerText()).toLowerCase().includes("not a client engagement"),"B2B page must not imply a Maxab client relationship.");
  assert.equal(await page.locator('[data-copy-page]').count(),1,"Case page needs a copy-page link control.");
  assert.equal(await page.locator(".story-evidence-block .eyebrow").filter({hasText:"DATASET & PROVENANCE"}).count(),1,"B2B scenario provenance should be labelled.");
  assert.equal(await page.locator(".story-evidence-block .eyebrow").filter({hasText:"MODEL & MEASURES"}).count(),1,"B2B model should be explained.");
  assert.equal(await page.locator(".story-outcome .eyebrow").innerText().then(t=>t.trim()),"DESIGNED DECISION SUPPORT");
  assert.equal(await page.locator(".story-evidence-block .eyebrow").filter({hasText:"FINDINGS / INTERPRETATION"}).count(),1);
  assert.equal(await page.getByText(/Maxab distribution network|Real-time insights into retailer behavior/i).count(),0,"Legacy claims about Maxab must not show.");
 }
 if(name==="wuzzuf-job-market"){
  const content=await page.locator("main").innerText();
  assert(content.includes("217 Wuzzuf job postings"),"Wuzzuf snapshot size must be visible.");
  assert(content.includes("January–March 2025"),"Wuzzuf collection dates must be visible.");
  assert(content.toLowerCase().includes("salary data is incomplete"),"Salary data limitation must be explicit.");
 }
 if(name==="dashboards"){
  assert(await page.locator(".dashboard-preview-figure").count()>0,"Dashboard gallery needs large previews with captions.");
  assert(await page.locator(".dashboard-cover[data-lightbox]").count()>0,"Dashboard screenshot needs full-size enlarge action.");
  assert(await page.locator("#preview-dialog").count()===1,"Native image dialog must be present.");
  assert((await page.locator("main").innerText()).includes("A screenshot is a saved report view"),"Static previews must be distinguished from interactive reports.");
 }
 if(name==="resume"){
  assert(await page.locator("[data-print-resume]").count()===1,"Resume should have print/save PDF action.");
  assert(await page.locator('a[href^="mailto:"]').count()===1,"Resume must retain its professional email.");
 }
 if(name==="about"){
  const aboutText=await page.locator("main").innerText();
  assert(aboutText.includes("Freelance BI Developer"),"Preserve verified freelance BI experience.");
  assert(aboutText.includes("Machine Learning Engineer Intern"),"Preserve the FlyRank internship.");
  assert(aboutText.includes("Damietta University"),"Preserve the verified degree.");
 }
 if(name==="contact"){
  assert(await page.locator('a[href^="mailto:"]').count()>=1,"Contact email link is missing.");
  assert(await page.locator(".copy-email").count()===1,"Existing copy-email behavior must remain.");
  assert(await page.locator('a[href="/services/#business-inquiry"]').count()===1,"Existing verified inquiry route must remain available without being the primary CTA.");
 }
 if(name==="services"){
  assert.equal(await page.locator("#simple-project-inquiry").getAttribute("method"),"post","Public inquiry method changed.");
  assert.equal(await page.locator("#simple-project-inquiry").getAttribute("action"),"/services/","Public inquiry action changed.");
  assert.equal(await page.locator("#project-brief").getAttribute("method"),"post","Protected inquiry method changed.");
  assert.equal(await page.locator("#project-brief").getAttribute("action"),"/services/","Protected inquiry action changed.");
 }
 if(name==="home"&&width===390){
  const menu=page.locator(".menu-toggle");
  assert.equal(await menu.getAttribute("aria-expanded"),"false");
  assert.equal(await menu.getAttribute("aria-label"),"Open menu");
  assert.equal(await menu.locator("svg.menu-icon").count(),1,"Mobile menu button must have a visible menu icon.");
  await menu.click();
  assert.equal(await menu.getAttribute("aria-expanded"),"true","Mobile navigation did not open.");
  assert(await page.locator("#navigation a[href='/contact/']").isVisible(),"Contact must appear in mobile navigation.");
  await page.keyboard.press("Escape");
  assert.equal(await menu.getAttribute("aria-expanded"),"false","Escape should close the mobile navigation.");
 }
 console.log("PASS "+name+" "+theme+" "+width+"px — HTTP "+response.status()+", theme resolved, no horizontal overflow/clipped text. Screenshot: "+path.basename(screenshot));
 await page.close();
 return {page:name,theme,width,status:"PASS",screenshot:path.basename(screenshot)};
}
async function testThemePersistence(){
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.emulateMedia({colorScheme:"light",reducedMotion:"reduce"});
 await addProtectionHeader(page);
 await page.goto(new URL("/",base).href,{waitUntil:"domcontentloaded"});
 await page.locator(".theme-toggle").click();
 assert.equal(await page.locator("html").getAttribute("data-theme"),"dark");
 assert.equal(await page.evaluate(()=>localStorage.getItem("sohila-theme")),"dark");
 await page.reload({waitUntil:"domcontentloaded"});
 assert.equal(await page.locator("html").getAttribute("data-theme"),"dark","Explicit dark choice must persist despite light system preference.");
 await page.close();
 console.log("PASS explicit dark-mode choice persists after reload.");
}
async function testPreviewDialog(){
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.emulateMedia({colorScheme:"light",reducedMotion:"reduce"});
 await addProtectionHeader(page);
 await page.goto(new URL("/dashboards/",base).href,{waitUntil:"domcontentloaded"});
 const trigger=page.locator(".dashboard-cover[data-lightbox]").first();
 await trigger.click();
 const dialog=page.locator("#preview-dialog");
 await dialog.waitFor({state:"visible"});
 assert.equal(await dialog.evaluate(el=>el.open),true,"Native image dialog did not open.");
 assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute("data-preview-close")),"","Focus should move to the dialog close control.");
 await page.keyboard.press("Escape");
 assert.equal(await dialog.evaluate(el=>el.open),false,"Escape must close image dialog.");
 assert(await trigger.evaluate(el=>el===document.activeElement),"Closing the image dialog should restore focus to its opener.");
 await page.close();
 console.log("PASS keyboard-accessible image enlargement and focus restoration.");
}
async function testClipboard(){
 const successPage=await browser.newPage({viewport:{width:1280,height:900}});
 await successPage.emulateMedia({colorScheme:"light",reducedMotion:"reduce"});
 await successPage.addInitScript(()=>Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async value=>{window.__copiedPage=value;}}}));
 await addProtectionHeader(successPage);
 const url=new URL("/projects/fmcg-sales-churn-drop-analysis-powerbi/",base).href;
 await successPage.goto(url,{waitUntil:"domcontentloaded"});
 await successPage.locator("[data-copy-page]").click();
 await successPage.waitForFunction(()=>Boolean(window.__copiedPage));
 assert.equal(await successPage.evaluate(()=>window.__copiedPage),url,"Copy page should copy the current case-study URL, not the homepage.");
 assert((await successPage.locator("[data-copy-page-status]").innerText()).includes("copied to the clipboard"));
 await successPage.waitForTimeout(2400);
 assert.equal((await successPage.locator("[data-copy-page-status]").innerText()).trim(),"","Copy success announcement should clear after approximately two seconds.");
 assert.equal((await successPage.locator("[data-copy-page]").innerText()).trim(),"Copy page link","Copy button label should return after the success state.");
 await successPage.close();

 const failurePage=await browser.newPage({viewport:{width:390,height:844}});
 await failurePage.emulateMedia({colorScheme:"light",reducedMotion:"reduce"});
 await failurePage.addInitScript(()=>Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async()=>{throw new Error("Mock clipboard denial");}}}));
 await addProtectionHeader(failurePage);
 await failurePage.goto(url,{waitUntil:"domcontentloaded"});
 await failurePage.locator("[data-copy-page]").click();
 const fallback=failurePage.locator(".copy-page-fallback input");
 await fallback.waitFor({state:"visible"});
 assert.equal(await fallback.inputValue(),url,"Manual fallback must contain this page's URL.");
 assert((await failurePage.locator("[data-copy-page-status]").innerText()).includes("Clipboard access is unavailable"));
 assert.equal(await fallback.evaluate(el=>el.selectionStart===0&&el.selectionEnd===el.value.length),true,"Manual fallback should select the URL.");
 await failurePage.close();
 console.log("PASS copy-page success announcement, correct URL, and manual selection fallback.");
}
async function testReportLoading(){
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 await page.emulateMedia({colorScheme:"light",reducedMotion:"reduce"});
 await addProtectionHeader(page);
 await page.goto(new URL("/dashboards/fmcg-sales-churn-drop-analysis-powerbi/",base).href,{waitUntil:"domcontentloaded"});
 const button=page.locator("[data-load-report]");
 assert.equal(await button.count(),1,"Public report needs an explicit load control.");
 assert.equal(await page.locator("iframe").count(),0,"Power BI iframe must not be created before visitor request.");
 const reportUrl=await button.getAttribute("data-load-report");
 assert(reportUrl?.startsWith("https://app.powerbi.com/view?r="),"Only the existing verified public Power BI report may be loaded.");
 await button.click();
 const frame=page.locator("iframe");
 await frame.waitFor({state:"attached"});
 assert((await frame.getAttribute("title")).includes("interactive Power BI report"),"Power BI frame needs a meaningful accessible title.");
 assert.equal(await frame.getAttribute("src"),reportUrl,"Loaded iframe should use the existing approved public URL.");
 assert(await page.locator('a[href*="github.com/Sohila-Khaled-Abbas/fmcg-sales-churn-drop-analysis-powerbi"]').count()>0,"Original report source link must remain visible.");
 await page.close();
 console.log("PASS click-to-load public Power BI embed, iframe title, and original source link.");
}
async function testResumePrint(){
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 await page.addInitScript(()=>{window.__printCalled=false;window.print=()=>{window.__printCalled=true;};});
 await addProtectionHeader(page);
 await page.goto(new URL("/resume/",base).href,{waitUntil:"domcontentloaded"});
 await page.locator("[data-print-resume]").click();
 assert.equal(await page.evaluate(()=>window.__printCalled),true,"Resume Print / save as PDF must invoke the browser print dialog.");
 await page.close();
 console.log("PASS resume print/save as PDF action.");
}
async function testInquirySafety(){
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.emulateMedia({colorScheme:"light",reducedMotion:"reduce"});
 await addProtectionHeader(page);
 await page.goto(new URL("/services/",base).href,{waitUntil:"domcontentloaded"});
 const leadCalls=[];
 let attempt=0;
 await page.route("**/api/lead",async route=>{
  assert.equal(route.request().method(),"POST","The public form must POST to /api/lead");
  leadCalls.push(route.request().postDataJSON());
  attempt++;
  if(attempt===1)await route.fulfill({status:502,contentType:"application/json",body:JSON.stringify({ok:false,message:"Mock delivery failure for QA."})});
  else await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({ok:true,message:"Your inquiry has been received."})});
 });
 await page.locator("#simple-inquiry-name").fill("Test User");
 await page.locator("#simple-inquiry-email").fill("not-an-email");
 await page.locator("#simple-inquiry-description").fill("Dummy QA only. This request must never reach a real webhook.");
 const expectedBudgetOptions=["500 - 2,000 EGP","2,000 - 5,000 EGP","5,000 - 10,000 EGP","10,000 - 25,000 EGP","25,000+ EGP","Not sure yet"];
 const budget=page.locator("#simple-inquiry-budget");
 assert.deepEqual(await budget.locator("option").evaluateAll(items=>items.slice(1).map(item=>item.textContent.trim())),expectedBudgetOptions);
 assert.equal(await page.locator('label[for="simple-inquiry-budget"]').innerText(),"Budget range (EGP) *");
 assert((await budget.evaluate(el=>el.parentElement.innerText)).includes("Minimum project budget: 500 EGP. Projects below 500 EGP are not offered."));
 await budget.selectOption({label:"500 - 2,000 EGP"});
 await page.locator("#simple-inquiry-submit").click();
 assert.equal(await page.locator("#simple-inquiry-email").evaluate(el=>el.validity.typeMismatch),true,"Native email validation must block invalid email.");
 await page.locator("#simple-inquiry-email").fill("test@example.com");
 await page.waitForTimeout(2200);
 await page.locator("#simple-inquiry-submit").click();
 await page.locator("#simple-inquiry-error").waitFor({state:"visible"});
 assert.equal(await page.locator("#simple-inquiry-name").inputValue(),"Test User");
 assert.equal(await page.locator("#simple-inquiry-email").inputValue(),"test@example.com");
 assert.equal(await page.locator("#simple-inquiry-error a[href^='mailto:']").count(),1);
 assert.equal(await page.locator("#simple-inquiry-error a[href*='cal.com']").count(),1);
 await page.locator("#simple-inquiry-submit").click();
 await page.locator("#simple-inquiry-result").waitFor({state:"visible"});
 assert.equal(leadCalls.length,2,"The mocked delivery should be retried once.");
 assert.equal(leadCalls[0].budgetRange,"500 - 2,000 EGP");
 assert.equal(leadCalls[0].submissionId,leadCalls[1].submissionId);
 const protectedApi=await page.evaluate(async()=>{
  const response=await fetch("/api/business-inquiry",{method:"POST",credentials:"same-origin",headers:{"X-Inquiry-Client":"portfolio-v1","Content-Type":"application/json"},body:JSON.stringify({action:"prepare",token:"",fields:{name:"Test User",email:"test@example.com"}})});
  return {status:response.status,data:await response.json()};
 });
 assert.equal(protectedApi.status,403,"Private inquiry endpoint must reject without invitation.");
 await page.close();
 console.log("PASS existing public form behavior with mocked /api/lead, exact EGP options, validation, retry, and protected API rejection.");
}

try{
 const matrix=[];
 for(const page of pages)for(const theme of themes){
  const pageViewports=page.name==="work"?[...viewports,...wideWorkViewports]:viewports;
  for(const viewport of pageViewports)matrix.push(await captureRoute(page.route,viewport.width,viewport.height,theme,page.name));
 }
 await testThemePersistence();
 await testPreviewDialog();
 await testClipboard();
 await testReportLoading();
 await testResumePrint();
 await testInquirySafety();
 await fs.writeFile(path.join(screenshotDir,"qa-matrix.json"),JSON.stringify(matrix,null,2));
 console.log("PASS visual QA — "+matrix.length+" page/theme/viewport screenshots across "+pages.length+" routes, "+themes.length+" themes, and "+viewports.length+" viewport widths.");
}finally{await browser.close();}

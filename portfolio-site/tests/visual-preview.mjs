import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import {chromium} from "playwright";

const baseUrl=process.env.BASE_URL;
if(!baseUrl)throw new Error("BASE_URL must point to the actual Vercel preview deployment.");
const parsedBase=new URL(baseUrl);
if(parsedBase.protocol!=="https:"||!parsedBase.hostname.endsWith(".vercel.app"))throw new Error("Visual tests only accept an HTTPS Vercel preview URL.");
const screenshotDir=path.resolve(process.cwd(),"..","screenshots");
await fs.mkdir(screenshotDir,{recursive:true});

const expectedFeatured=[
 "fmcg-sales-churn-drop-analysis-powerbi",
 "global-horizon-bank-dwh-project",
 "egyptian-cosmetics-market"
];
const viewports=[
 {width:360,height:900},
 {width:390,height:900},
 {width:768,height:1024},
 {width:1280,height:900},
 {width:1536,height:1000},
 {width:1905,height:1080}
];
const pages=[
 {route:"/",name:"home"},
 {route:"/work/",name:"work"},
 {route:"/services/",name:"services"},
 {route:"/projects/fmcg-sales-churn-drop-analysis-powerbi/",name:"b2b-retail"}
];
const browser=await chromium.launch({headless:true});

async function addProtectionHeader(page){
 const bypass=process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
 if(bypass)await page.setExtraHTTPHeaders({"x-vercel-protection-bypass":bypass});
}
async function settlePage(page){
 await page.evaluate(async()=>{if(document.fonts?.ready)await document.fonts.ready;});
 const metrics=await page.evaluate(()=>({height:document.documentElement.scrollHeight,step:Math.max(450,Math.floor(window.innerHeight*.72))}));
 for(let y=0;y<metrics.height;y+=metrics.step){
  await page.evaluate(scrollY=>window.scrollTo(0,scrollY),y);
  await page.waitForTimeout(60);
 }
 await page.evaluate(()=>window.scrollTo(0,0));
 await page.waitForTimeout(180);
}
async function inspectLayout(page){
 return page.evaluate(()=>{
  const width=window.innerWidth;
  const rootWidth=document.documentElement.scrollWidth;
  const bodyWidth=document.body.scrollWidth;
  const textSelector=[
   "h1","h2","h3","h4","button",".button",
   ".studio-project-card h3",".studio-project-card p",
   ".pinned-case-card h3",".pinned-case-card p",
   ".repo-card h3",".repo-card p",
   ".home-testimonial-card blockquote",".home-testimonial-card figcaption",
   ".recommendation-card blockquote",".recommendation-card figcaption",
   ".service-primary-card h2",".service-primary-card p",".service-primary-card li",
   ".service-secondary-list h3",".service-secondary-list p",".service-secondary-list li",
   ".project-story h3",".story-outcome p"
  ].join(",");
  const clipped=[];
  const hidden=[];
  for(const element of document.querySelectorAll(textSelector)){
   const text=element.textContent?.replace(/\s+/g," ").trim();
   if(!text)continue;
   if(element.closest("[hidden],[aria-hidden=true],details:not([open]),dialog:not([open]),.sr-only,.skip"))continue;
   const style=getComputedStyle(element);
   const rect=element.getBoundingClientRect();
   if(style.display==="none"||style.visibility==="hidden"||Number.parseFloat(style.opacity)<.05||rect.width===0||rect.height===0){
    hidden.push({tag:element.tagName.toLowerCase(),className:typeof element.className==="string"?element.className:"",text:text.slice(0,90)});
    continue;
   }
   const clamp=Number.parseInt(style.webkitLineClamp,10);
   const overflowX=["hidden","clip"].includes(style.overflowX);
   const overflowY=["hidden","clip"].includes(style.overflowY);
   const tooWide=overflowX&&element.scrollWidth>element.clientWidth+2;
   const tooTall=overflowY&&element.scrollHeight>element.clientHeight+2;
   const ellipsis=style.textOverflow==="ellipsis";
   if(tooWide||tooTall||ellipsis||(Number.isFinite(clamp)&&clamp>0)){
    clipped.push({tag:element.tagName.toLowerCase(),className:typeof element.className==="string"?element.className:"",text:text.slice(0,90),scrollWidth:element.scrollWidth,clientWidth:element.clientWidth,scrollHeight:element.scrollHeight,clientHeight:element.clientHeight,lineClamp:style.webkitLineClamp});
   }
  }
  const heading=document.querySelector(".signature-hero h1");
  function wordRect(word){
   if(!heading)return null;
   const walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT);
   while(walker.nextNode()){
    const node=walker.currentNode;
    const offset=node.nodeValue.indexOf(word);
    if(offset>=0){
     const range=document.createRange();
     range.setStart(node,offset);
     range.setEnd(node,offset+word.length);
     return range.getBoundingClientRect().toJSON();
    }
   }
   return null;
  }
  const better=wordRect("Better");
  const decisions=wordRect("decisions");
  const featured=[...document.querySelectorAll(".home-featured-work .studio-spotlight-grid>.studio-project-card")].map(card=>card.dataset.name).filter(Boolean);
  const workPinned=[...document.querySelectorAll(".work-featured .pinned-case-card")].map(card=>card.dataset.name);
  return {width,rootWidth,bodyWidth,clipped,hidden,better,decisions,featured,workPinned};
 });
}
function assertLayout(audit,width,label){
 assert(audit.rootWidth<=width,"Horizontal overflow on "+label+": document.scrollWidth "+audit.rootWidth+"px > window.innerWidth "+width+"px");
 assert(audit.bodyWidth<=width,"Body overflow on "+label+": body.scrollWidth "+audit.bodyWidth+"px > window.innerWidth "+width+"px");
 assert.equal(audit.clipped.length,0,"Clipped/ellipsized text on "+label+": "+JSON.stringify(audit.clipped));
 assert.equal(audit.hidden.length,0,"Unexpected hidden text on "+label+": "+JSON.stringify(audit.hidden));
}
async function captureRoute(route,width,height,name){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 await page.emulateMedia({reducedMotion:"reduce"});
 await addProtectionHeader(page);
 const response=await page.goto(new URL(route,parsedBase).href,{waitUntil:"domcontentloaded",timeout:60000});
 assert(response&&response.status()<400,route+" returned "+(response?.status()??"no response")+" at "+width+"px");
 await settlePage(page);
 const audit=await inspectLayout(page);
 assertLayout(audit,width,name+" "+width+"px");
 if(name==="home"){
  const cta=page.locator(".signature-hero .hero-ctas a").first();
  assert.equal((await cta.textContent()).trim(),"Work with me","Homepage hero CTA label changed");
  assert.equal(await cta.getAttribute("href"),"/services/","Homepage hero CTA destination changed");
  assert.deepEqual(audit.featured,expectedFeatured,"Homepage featured case-study order changed");
  if([1280,1536,1905].includes(width)){
   assert(audit.better&&audit.decisions,"The desktop hero headline words could not be measured.");
   assert(Math.abs(audit.better.top-audit.decisions.top)<=3,'"Better" is not on the same line as "decisions." at '+width+"px (Better top "+audit.better.top+", decisions top "+audit.decisions.top+").");
  }
 }
 if(name==="work"){
  assert.deepEqual(audit.workPinned,expectedFeatured,"Work page pinned case-study order changed");
  const disclosure=page.locator("[data-repo-tools]");
  assert.equal(await disclosure.count(),1,"Full repository search and filters are missing");
  assert.equal(await disclosure.evaluate(element=>element.open),width>=651,"Repository disclosure should be "+(width>=651?"open":"closed")+" at "+width+"px");
  assert.equal(await page.locator("#repo-grid .repo-card").count(),101,"The full searchable repository collection must remain intact");
 }
 if(name==="services"){
  const publicForm=page.locator("#simple-project-inquiry");
  const protectedForm=page.locator("#project-brief");
  assert.equal(await publicForm.getAttribute("method"),"post","Public inquiry form method changed");
  assert.equal(await publicForm.getAttribute("action"),"/services/","Public inquiry form action changed");
  assert.equal(await protectedForm.getAttribute("method"),"post","Protected inquiry form method changed");
  assert.equal(await protectedForm.getAttribute("action"),"/services/","Protected inquiry form action changed");
 }
 if(name==="b2b-retail"){
  assert.equal(await page.locator(".story-outcome .eyebrow").textContent().then(value=>value.trim()),"OUTCOME","B2B Retail case page is missing its Outcome label");
 }
 const screenshot=path.join(screenshotDir,name+"-"+width+".png");
 await page.screenshot({path:screenshot,fullPage:true,animations:"disabled"});
 console.log("PASS "+name+" "+width+"px — HTTP "+response.status()+", no horizontal overflow, clipped text, or hidden text. Screenshot: "+path.basename(screenshot));
 return {page,screenshot,audit};
}

try{
 const matrix=[];
 let service390=null;
 for(const item of pages){
  for(const viewport of viewports){
   const result=await captureRoute(item.route,viewport.width,viewport.height,item.name);
   matrix.push({page:item.name,width:viewport.width,status:"PASS",screenshot:path.basename(result.screenshot)});
   if(item.name==="services"&&viewport.width===390)service390=result.page;
   else await result.page.close();
  }
 }

 if(service390){
  const page=service390;
  const posts=[];
  page.on("request",request=>{
   if(request.method()==="POST")posts.push({method:request.method(),url:new URL(request.url()).pathname});
  });
  await page.locator("#simple-inquiry-name").fill("Test User");
  await page.locator("#simple-inquiry-email").fill("not-an-email");
  await page.locator("#simple-inquiry-description").fill("Dummy QA submission only. Please do not process this as a real project inquiry.");
  await page.locator("#simple-inquiry-budget").selectOption({label:"Not sure yet"});
  await page.locator("#simple-inquiry-submit").click();
  const invalid=await page.locator("#simple-inquiry-email").evaluate(element=>({valid:element.validity.valid,typeMismatch:element.validity.typeMismatch,message:element.validationMessage}));
  assert.equal(invalid.valid,false,"Invalid email should be blocked by native validation");
  assert.equal(invalid.typeMismatch,true,"Invalid email should show a type mismatch");
  assert(await page.locator("#simple-inquiry-result").evaluate(element=>element.hidden),"The success message must not show for an invalid email");
  await page.locator("#simple-inquiry-email").fill("test@example.com");
  await page.locator("#simple-inquiry-submit").click();
  const success=await page.locator("#simple-inquiry-result").innerText();
  assert(success.includes("Your message is ready to review. Open the email draft below and send it from your email app when you are happy with it."),"Public inquiry success state did not appear.");
  const mailto=await page.locator("#simple-inquiry-mailto").getAttribute("href");
  assert(mailto.startsWith("mailto:"),"Public inquiry did not create an email draft link.");
  assert(decodeURIComponent(mailto).includes("Test User")&&decodeURIComponent(mailto).includes("test@example.com"),"The generated draft does not contain the dummy contact details.");
  assert.equal(posts.length,0,"The public form prepares a mailto draft and must not send a POST from the browser.");
  console.log("PASS public dummy QA — invalid email blocked ("+invalid.message+"); valid details show draft-ready success; no POST request sent.");
  console.log("PASS public dummy draft — mailto target "+mailto.split("?")[0]+"; no email was sent.");

  const apiResponse=await page.request.post(new URL("/api/business-inquiry",parsedBase).href,{
   headers:{Origin:parsedBase.origin,"X-Inquiry-Client":"portfolio-v1","Content-Type":"application/json"},
   data:{action:"prepare",token:"",fields:{name:"Test User",email:"test@example.com"}}
  });
  const apiData=await apiResponse.json();
  assert.equal(apiResponse.status(),403,"Protected endpoint must reject a dummy submission without an approved invitation");
  assert.deepEqual(apiData,{ok:false,message:"A current invitation for an approved business is required. Request verification or ask for a new invitation."},"Protected endpoint response changed");
  console.log("PASS protected dummy POST — HTTP "+apiResponse.status()+" "+JSON.stringify(apiData));
  await page.close();
 }
 await fs.writeFile(path.join(screenshotDir,"qa-matrix.json"),JSON.stringify(matrix,null,2));
 console.log("PASS visual QA matrix — "+matrix.length+" page/viewport combinations, "+matrix.length+" full-page screenshots.");
}finally{await browser.close();}

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
 {width:360,height:800},
 {width:390,height:844},
 {width:768,height:1024},
 {width:1024,height:900},
 {width:1280,height:900}
];
const wideWorkViewports=[{width:1440,height:960},{width:1920,height:1080}];
const themes=["light","dark"];
const pages=[
 {route:"/",name:"home"},
 {route:"/work/",name:"work"},
 {route:"/dashboards/",name:"dashboards"},
 {route:"/about/",name:"about"},
 {route:"/resume/",name:"resume"},
 {route:"/contact/",name:"contact"},
 {route:"/services/",name:"services"},
 {route:"/projects/fmcg-sales-churn-drop-analysis-powerbi/",name:"b2b-retail-scenario"},
 {route:"/projects/SMART-Supply-Chain-Insights-Dashboard/",name:"smart-supply-chain"},
 {route:"/projects/Wuzzuf-Job-Market-Analysis/",name:"wuzzuf-job-market"}
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
  }).filter(item=>item.right>width+1).sort((a,b)=>b.right-a.right).slice(0,30);
  const overflowingScrollContainers=[...document.querySelectorAll("body *")].map(element=>{
   const style=getComputedStyle(element);
   return {tag:element.tagName.toLowerCase(),className:typeof element.className==="string"?element.className:"",id:element.id||"",text:element.textContent.trim().replace(/\\s+/g," ").slice(0,65),left:Math.round(element.getBoundingClientRect().left),right:Math.round(element.getBoundingClientRect().right),scrollWidth:element.scrollWidth,clientWidth:element.clientWidth,position:style.position,transform:style.transform,overflowX:style.overflowX};
  }).filter(item=>item.scrollWidth>item.clientWidth+2||item.left>width).slice(0,35);
  const pseudoOverflow=[...document.querySelectorAll("body *")].flatMap(element=>["::before","::after"].map(pseudo=>{
   const style=getComputedStyle(element,pseudo);
   if(style.content==="none"||style.display==="none"||style.position==="static")return null;
   const left=Number.parseFloat(style.left)||0,widthValue=Number.parseFloat(style.width)||0;
   return {parent:element.tagName.toLowerCase()+"."+String(element.className||""),pseudo,left,width:widthValue,position:style.position,transform:style.transform,content:style.content};
  })).filter(item=>item&&item.left+item.width>width).slice(0,20);
  const root=document.documentElement,body=document.body,scroll=document.scrollingElement;
  const rootMetrics={rootRect:Math.round(root.getBoundingClientRect().width),rootClient:root.clientWidth,rootScroll:root.scrollWidth,bodyRect:Math.round(body.getBoundingClientRect().width),bodyClient:body.clientWidth,bodyScroll:body.scrollWidth,scrollLeft:scroll?.scrollLeft,rootMargin:getComputedStyle(root).margin,bodyMargin:getComputedStyle(body).margin,rootPadding:getComputedStyle(root).padding,bodyPadding:getComputedStyle(body).padding};
  const bodyChildren=[...body.children].map(element=>{const r=element.getBoundingClientRect(),st=getComputedStyle(element);return {tag:element.tagName.toLowerCase(),id:element.id||"",className:typeof element.className==="string"?element.className:"",left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width),scrollWidth:element.scrollWidth,clientWidth:element.clientWidth,position:st.position,transform:st.transform,overflowX:st.overflowX};});
  return {width,rootWidth,bodyWidth,rootMetrics,bodyChildren,clipped,overflowCandidates,overflowingScrollContainers,pseudoOverflow,theme:document.documentElement.dataset.theme,background:getComputedStyle(document.body).backgroundColor};
 });
}
function assertLayout(audit,width,label){
 assert(audit.rootWidth<=width,"Horizontal overflow on "+label+": document.scrollWidth "+audit.rootWidth+"px > "+width+"px. Root: "+JSON.stringify(audit.rootMetrics)+" Body children: "+JSON.stringify(audit.bodyChildren)+" Scroll containers: "+JSON.stringify(audit.overflowingScrollContainers)+" Pseudo: "+JSON.stringify(audit.pseudoOverflow)+" Right-edge elements: "+JSON.stringify(audit.overflowCandidates));
 assert(audit.bodyWidth<=width,"Body overflow on "+label+": body.scrollWidth "+audit.bodyWidth+"px > "+width+"px");
 assert.equal(audit.clipped.length,0,"Clipped/ellipsized text on "+label+": "+JSON.stringify(audit.clipped));
}
async function captureRoute(route,width,height,theme,name){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 try{
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
 assert.equal(h1,1,name+" must have exactly one main H1.");
 const seo=await page.evaluate(()=>{
  const graph=[...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(node=>{try{const data=JSON.parse(node.textContent);return data['@graph']||[data];}catch{return [];}});
  return {title:document.title,description:document.querySelector('meta[name="description"]')?.content||'',canonical:document.querySelector('link[rel="canonical"]')?.href||'',lang:document.documentElement.lang,themeColor:document.querySelector('meta[name="theme-color"]')?.content||'',ogImage:document.querySelector('meta[property="og:image"]')?.content||'',ogWidth:document.querySelector('meta[property="og:image:width"]')?.content||'',ogHeight:document.querySelector('meta[property="og:image:height"]')?.content||'',twitter:document.querySelector('meta[name="twitter:card"]')?.content||'',robots:document.querySelector('meta[name="robots"]')?.content||'',types:graph.map(item=>item['@type'])};
 });
 assert(seo.title.length>0&&seo.title.length<60,name+" title must be under 60 characters: "+seo.title);
 assert(seo.description.length>0&&seo.description.length<160,name+" meta description must be under 160 characters.");
 assert.equal(seo.lang,"en",name+" document language must be English.");
 assert(seo.canonical.startsWith("https://sohila-khaled-abbas.vercel.app/"),name+" canonical must point to production.");
 assert.equal(seo.themeColor,"#f7f3ed",name+" theme-color metadata is missing.");
 assert(seo.ogImage.endsWith("/social-card.svg")&&seo.ogWidth==="1200"&&seo.ogHeight==="630",name+" must use the 1200x630 editorial social image.");
 assert.equal(seo.twitter,"summary_large_image",name+" Twitter card metadata is missing.");
 assert(seo.types.includes("Person")&&seo.types.includes("WebSite")&&seo.types.includes("BreadcrumbList"),name+" needs Person, WebSite and Breadcrumb structured data.");
 if(name==="b2b-retail-scenario"||name==="smart-supply-chain"||name==="wuzzuf-job-market")assert(seo.types.includes("CreativeWork"),name+" project page needs CreativeWork structured data.");
 assert(seo.robots.includes("noindex"),"Protected Vercel previews must remain noindex.");
 if(name==="home"){
  assert((await page.locator(".editorial-hero h1").innerText()).replace(/\s+/g," ").includes("BI Developer & Data Analyst"),"Homepage headline must identify the target role.");
  assert((await page.locator(".editorial-hero-proof").innerText()).includes("500K+ order lines"),"Homepage needs a quantified proof line.");
  assert.equal((await page.locator(".editorial-hero .hero-actions a").nth(0).innerText()).trim(),"View case studies");
  assert.equal(await page.locator(".editorial-hero .hero-actions a").nth(0).getAttribute("href"),"/work/#case-studies");
  assert.equal((await page.locator(".editorial-hero .hero-actions a").nth(1).innerText()).trim(),"Contact me");
  assert.equal(await page.locator(".editorial-hero .hero-actions a").nth(1).getAttribute("href"),"/contact/");
  const heroMeta=(await page.locator(".editorial-location").innerText()).toLowerCase();
  assert(heroMeta.includes("open to remote roles")&&heroMeta.includes("cairo, egypt · utc+2")&&heroMeta.includes("english: excellent"),"Remote status, Cairo timezone and English level must be visible.");
  assert((await page.locator(".editorial-role-line").innerText()).includes("Hire me for"),"Homepage must state what Sohila can be hired for.");
  assert(await page.locator(".editorial-trust-links a[href='/resume/']").count()===1&&await page.locator(".editorial-trust-links a[href*='linkedin.com']").count()===1&&await page.locator(".editorial-trust-links a[href*='github.com']").count()===1,"CV, LinkedIn and GitHub links must be visible.");
  assert(await page.locator(".editorial-trust-links .copy-email").count()===1,"Homepage needs a visible Copy email action.");
  const featured=await page.locator(".editorial-case-card[data-featured-case]").evaluateAll(cards=>cards.map(card=>card.dataset.featuredCase));
  assert.deepEqual(featured,expectedFeatured,"Homepage featured-case sequence changed.");
  assert.equal(await page.locator(".editorial-case-visual[data-lightbox]").count(),3,"Each featured case needs an enlargeable report preview.");
  const b2bCaption=await page.locator('[data-featured-case="fmcg-sales-churn-drop-analysis-powerbi"] figcaption').innerText();
  assert(b2bCaption.includes("Editorial cover")&&!b2bCaption.includes("Saved report image"),"B2B homepage visual must be described as a neutral cover, not a report screenshot.");
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
  const firstCover=page.locator(".work-featured .pinned-case-card").first().locator(".project-visual img");
  assert((await firstCover.getAttribute("src")).includes("fmcg-portfolio-cover.svg"),"B2B Work card must use its neutral portfolio cover, not the branded report screenshot.");
  assert((await firstCover.getAttribute("alt")).includes("Neutral editorial cover"),"B2B cover alternative text must identify the neutral scenario artwork.");
  assert.equal(await page.getByText(/MAXAB ANALYTICS|Built for Maxab Analytics|Welcome back, Sohila/i).count(),0,"The B2B Work card must not display client-branded report content.");
  const b2bCard=page.locator(".work-featured .pinned-case-card").first();
  const liveButton=b2bCard.locator(".work-card-live-preview [data-load-report]");
  assert.equal(await liveButton.count(),1,"B2B Work card must include a click-to-load Power BI preview.");
  assert.equal(await b2bCard.locator(".work-card-live-preview iframe").count(),0,"B2B Work-card iframe must not load before a click.");
  assert.equal((await b2bCard.locator(".work-card-live-preview .report-scenario-disclaimer").innerText()).trim(),"Portfolio scenario. Report branding is from the practice dataset.");
  assert(await b2bCard.locator(".work-card-live-preview a[href^='https://app.powerbi.com/view?r=']").count()===1,"B2B Work card needs a visible full-report fallback link.");
  const cardEmbed=await b2bCard.locator(".work-card-embed-shell").evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,ratio:r.width/r.height,cardRight:el.closest(".pinned-case-card").getBoundingClientRect().right};});
  assert(cardEmbed.width>0&&cardEmbed.right<=cardEmbed.cardRight+1,"B2B Work-card embed must remain within the card.");
  assert(Math.abs(cardEmbed.ratio-(width<=760?4/3:16/9))<.04,"B2B Work-card embed aspect ratio changed at "+width+"px.");

  assert.equal(await page.locator("[data-repo-tools]").count(),1,"Full work collection and filters are missing.");
  await page.locator("[data-repo-tools] > summary").click();
  assert(await page.locator("#repo-grid .repo-card").count()>0,"Full project catalogue should remain discoverable.");
  assert.equal(await page.locator('#repo-grid .repo-card[data-kind="fork"]').count(),0,"Forked resources must not appear as original work.");
  assert.equal(await page.locator('#repo-grid .repo-card[data-category="learning"]').count(),0,"Learning resources must not appear as professional case studies.");
  const visibleRepoText=(await page.locator("#repo-grid").innerText()).toLowerCase();
  assert(!visibleRepoText.includes("maxab wallet recharge optimization")&&!visibleRepoText.includes("flyrank-ml-internship-starter"),"Removed employer-work repos must not appear in the Work project directory.");
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
  const liveCards=page.locator('.dashboard-card[data-access="live"]');
  assert(await liveCards.count()>0,"Published Power BI reports must remain listed.");
  assert.equal(await page.locator(".dashboard-live-preview [data-load-report]").count(),await liveCards.count(),"Every public Power BI report needs its own lazy-load preview.");
  assert.equal(await page.locator(".dashboard-live-preview iframe").count(),0,"Dashboard iframes must stay unloaded until the visitor clicks.");
  const cardData=await liveCards.evaluateAll(items=>items.map(card=>({title:card.querySelector("h2")?.innerText.trim(),url:card.querySelector("[data-load-report]")?.dataset.loadReport,full:card.querySelector('a[href^="https://app.powerbi.com/view?r="]')?.getAttribute("href"),source:card.dataset.sourceUrl,github:card.querySelector('a[href^="https://github.com/"]')?.getAttribute("href")})));
  assert(cardData.every(card=>card.title&&card.url?.startsWith("https://app.powerbi.com/view?r=")&&card.full===card.url),"Each live card must expose its matching full-report URL.");
  for(const card of cardData)if(card.source.startsWith("https://github.com/"))assert.equal(card.github,card.source,"Repository-backed live dashboards must include their GitHub link.");
  for(const card of await page.locator('.dashboard-card:not([data-access="live"])').all()){
   assert.equal(await card.locator("[data-load-report]").count(),0,"Reports without public live links must not show an embed control.");
   const source=await card.getAttribute("data-source-url");
   if(source?.startsWith("https://github.com/"))assert.equal(await card.locator('a[href^="https://github.com/"]').getAttribute("href"),source,"Static reports must keep their GitHub link.");
  }
  assert.equal(await page.getByText(/MaxAB Wallet Recharge Optimization/i).count(),0,"The removed wallet project must not appear in Dashboards.");
 }
 if(name==="resume"){
  assert(await page.locator("[data-print-resume]").count()===1,"Resume should have print/save PDF action.");
  assert.equal(await page.locator(".resume-contact-line a[href^='mailto:']").count(),1,"Resume must retain one professional email in its contact row.");
 assert(await page.locator(".resume-contact-line a[href^='mailto:']").isVisible(),"Resume email must remain visible.");
 }
 if(name==="about"){
  const aboutText=await page.locator("main").innerText();
  assert(aboutText.includes("Freelance BI Developer"),"Preserve verified freelance BI experience.");
  assert(aboutText.includes("Machine Learning Engineer Intern"),"Preserve the FlyRank internship.");
  assert(aboutText.includes("Damietta University"),"Preserve the verified degree.");
 }
 if(name==="contact"){
  assert(await page.locator('a[href^="mailto:"]').count()>=1,"Contact email link is missing.");
  assert(await page.locator('a[href*="linkedin.com/in/sohilakabbas"]').count()>=1,"Contact LinkedIn link is missing.");
  assert(await page.locator('a[href="https://github.com/Sohila-Khaled-Abbas"]').count()>=1,"Contact GitHub link is missing.");
  assert(await page.locator(".copy-email").count()===1,"Existing copy-email behavior must remain.");
  assert(await page.locator('a[href="/services/#business-inquiry"]').count()===1,"Existing verified inquiry route must remain available without being the primary CTA.");
  const form=page.locator("#simple-project-inquiry");
  assert.equal(await form.count(),1,"Contact must restore the public project inquiry form.");
  assert.equal(await form.getAttribute("method"),"post");
  assert.equal(await form.getAttribute("action"),"/contact/");
  assert.equal(await form.locator('[name="budgetRange"]').count(),1,"Contact EGP budget field is missing.");
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
  const firstNav=page.locator("#navigation a[href]").first();
  assert(await firstNav.evaluate(el=>el===document.activeElement),"Opening the mobile menu should move focus into navigation.");
  await page.keyboard.press("Shift+Tab");
  assert(await menu.evaluate(el=>el===document.activeElement),"Shift+Tab from the first menu item should wrap to the menu toggle.");
  await page.keyboard.press("Tab");
  assert(await firstNav.evaluate(el=>el===document.activeElement),"Tab from the menu toggle should wrap to the first navigation link.");
  await page.keyboard.press("Escape");
  assert.equal(await menu.getAttribute("aria-expanded"),"false","Escape should close the mobile navigation.");
  assert(await menu.evaluate(el=>el===document.activeElement),"Closing the menu with Escape should restore focus to the toggle.");
 }
 console.log("PASS "+name+" "+theme+" "+width+"px — HTTP "+response.status()+", theme resolved, no horizontal overflow/clipped text. Screenshot: "+path.basename(screenshot));
 return {page:name,theme,width,status:"PASS",title:seo.title,screenshot:path.basename(screenshot)};
 }finally{await page.close();}
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
 // Public report is intentionally inside the guided story's third chapter.
 const reportChapter=page.locator('[data-story-chapter="result"]');
 assert.equal(await reportChapter.count(),1,"Project story must provide an Explore the work / report chapter.");
 await reportChapter.click();
 await page.locator("#story-result").waitFor({state:"visible"});
 const disclaimer=page.locator(".report-scenario-disclaimer");
 assert.equal(await disclaimer.count(),1,"The public B2B report embed must be preceded by a practice-dataset disclaimer.");
 assert.equal((await disclaimer.innerText()).replace(/\\s+/g," ").trim(),"Portfolio scenario. Report branding is from the practice dataset.");
 const reportCover=page.locator(".report-main-preview img");
 assert((await reportCover.getAttribute("src")).includes("fmcg-portfolio-cover.svg"),"B2B report detail must use the neutral portfolio cover.");
 assert((await reportCover.getAttribute("alt")).includes("Neutral editorial cover"),"B2B cover must not claim to be a report screenshot.");
 const button=page.locator("[data-load-report]");
 assert.equal(await button.count(),1,"Public report needs an explicit load control.");
 assert(await button.isVisible(),"Load interactive report control must be visible after selecting the report chapter.");
 assert.equal(await page.locator("iframe").count(),0,"Power BI iframe must not be created before visitor request.");
 const reportUrl=await button.getAttribute("data-load-report");
 assert(reportUrl?.startsWith("https://app.powerbi.com/view?r="),"Only the existing verified public Power BI report may be loaded.");
 const visibilityDiagnostics=await button.evaluate(element=>{
  const chain=[];
  for(let node=element;node&&node instanceof HTMLElement;node=node.parentElement){
   const style=getComputedStyle(node),rect=node.getBoundingClientRect();
   chain.push({tag:node.tagName.toLowerCase(),className:typeof node.className==="string"?node.className:"",id:node.id,hidden:node.hidden,ariaHidden:node.getAttribute("aria-hidden"),display:style.display,visibility:style.visibility,opacity:style.opacity,width:Math.round(rect.width),height:Math.round(rect.height),left:Math.round(rect.left),top:Math.round(rect.top),overflow:style.overflow});
   if(node.tagName==="MAIN")break;
  }
  const rect=element.getBoundingClientRect();
  const hit=rect.width&&rect.height?document.elementFromPoint(rect.left+Math.min(rect.width/2,10),rect.top+Math.min(rect.height/2,10)):null;
  return {chain,rect:{width:rect.width,height:rect.height,left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom},hit:hit?{tag:hit.tagName.toLowerCase(),className:typeof hit.className==="string"?hit.className:"",id:hit.id}:null};
 });
 console.log("REPORT LOAD CONTROL VISIBILITY "+JSON.stringify(visibilityDiagnostics));
 await button.click();
 const frame=page.locator("iframe");
 await frame.waitFor({state:"attached"});
 assert((await frame.getAttribute("title")).includes("interactive Power BI report"),"Power BI frame needs a meaningful accessible title.");
 assert.equal(await frame.getAttribute("src"),reportUrl,"Loaded iframe should use the existing approved public URL.");
 assert(await page.locator('a[href*="github.com/Sohila-Khaled-Abbas/fmcg-sales-churn-drop-analysis-powerbi"]').count()>0,"Original report source link must remain visible.");
 await page.close();
 console.log("PASS click-to-load public Power BI embed, iframe title, and original source link.");
}
async function testB2BProjectPageEmbed(){
 for(const width of [360,390,768,1024,1280,1920]){
  const page=await browser.newPage({viewport:{width,height:900}});
  await page.emulateMedia({colorScheme:"light",reducedMotion:"reduce"});
  await page.route("https://app.powerbi.com/**",route=>route.abort());
  await addProtectionHeader(page);
  await page.goto(new URL("/projects/fmcg-sales-churn-drop-analysis-powerbi/",base).href,{waitUntil:"domcontentloaded"});
  const chapter=page.locator('[data-story-chapter="result"]');
  assert.equal(await chapter.count(),1,"B2B case page must show its result chapter.");
  await chapter.click();
  await page.locator("#story-result").waitFor({state:"visible"});
  const note=page.locator("#story-result .report-scenario-disclaimer");
  assert.equal(await note.count(),1,"B2B case page must show one practice-dataset disclaimer.");
  assert.equal((await note.innerText()).replace(/\\s+/g," ").trim(),"Portfolio scenario. Report branding is from the practice dataset.");
  const button=page.locator("#story-result [data-load-report]");
  assert.equal(await button.count(),1,"B2B project page needs a click-to-load live report.");
  assert.equal(await page.locator("#story-result iframe").count(),0,"B2B iframe must remain absent before the user clicks.");
  const url=await button.getAttribute("data-load-report");
  assert(url?.startsWith("https://app.powerbi.com/view?r="),"B2B iframe must use the existing published URL.");
  await button.click();
  const frame=page.locator("#story-result iframe");
  await frame.waitFor({state:"attached"});
  assert((await frame.getAttribute("title")).includes("interactive Power BI report"),"B2B iframe needs an accessible title.");
  assert.equal(await frame.getAttribute("src"),url);
  const geometry=await frame.evaluate(el=>{const a=el.getBoundingClientRect(),b=el.closest(".report-embed-shell").getBoundingClientRect();return {left:a.left,right:a.right,width:a.width,shellLeft:b.left,shellRight:b.right,shellWidth:b.width};});
  assert(geometry.width>0&&geometry.left>=geometry.shellLeft-1&&geometry.right<=geometry.shellRight+1,"B2B iframe overflows at "+width+"px: "+JSON.stringify(geometry));
  assert(await page.locator('#story-result a[href^="https://github.com/"]').count()>0,"B2B GitHub source link must remain.");
  await page.close();
  console.log("PASS B2B project-page iframe and disclaimer at "+width+"px.");
 }
}
async function testDashboardCardEmbeds(){
 const loadPage=await browser.newPage({viewport:{width:1280,height:900}});
 await loadPage.emulateMedia({colorScheme:"light",reducedMotion:"reduce"});
 await addProtectionHeader(loadPage);
 await loadPage.goto(new URL("/dashboards/",base).href,{waitUntil:"domcontentloaded"});
 const cards=loadPage.locator('.dashboard-card[data-access="live"]');
 const count=await cards.count();
 assert(count>=11,"All public Power BI reports must remain listed; found "+count+".");
 const loadedTitles=[];
 for(let i=0;i<count;i++){
  const card=cards.nth(i),button=card.locator("[data-load-report]");
  assert.equal(await card.locator("iframe").count(),0,"Dashboard iframes must stay unloaded until clicked.");
  const title=(await card.locator(".dashboard-card-copy h2").innerText()).trim();
  const url=await button.getAttribute("data-load-report");
  assert(url?.startsWith("https://app.powerbi.com/view?r="),"Dashboard button must use the published URL for "+title+".");
  assert.equal(await button.getAttribute("data-report-title"),title,"Embed button needs an accessible report title.");
  assert.equal(await card.locator('a[href^="https://app.powerbi.com/view?r="]').getAttribute("href"),url,"Open full report link should match the embed URL.");
  const source=await card.getAttribute("data-source-url");
  if(source?.startsWith("https://github.com/"))assert.equal(await card.locator('a[href^="https://github.com/"]').getAttribute("href"),source,"GitHub source link must match for "+title+".");
  await button.click();
  const frame=card.locator("iframe");
  await frame.waitFor({state:"attached"});
  assert((await frame.getAttribute("title")).includes("interactive Power BI report"),"Dashboard iframe title is required for "+title+".");
  assert.equal(await frame.getAttribute("src"),url,"Dashboard iframe src changed for "+title+".");
  const contentFrame=await frame.contentFrame();
  assert(contentFrame,"Power BI iframe browsing context was not created for "+title+".");
  await contentFrame.waitForLoadState("domcontentloaded",{timeout:45000});
  assert(contentFrame.url().startsWith("https://app.powerbi.com/"),"Published Power BI report did not navigate for "+title+": "+contentFrame.url());
  loadedTitles.push(title);
  console.log("PASS live Power BI report loaded: "+title);
 }
 await loadPage.close();
 assert.equal(new Set(loadedTitles).size,count,"Every public report should be unique and loaded exactly once.");
 console.log("PASS all "+count+" published Power BI reports loaded through their own click-to-load controls.");

 for(const width of [360,390,768,1024,1280,1920]){
  const page=await browser.newPage({viewport:{width,height:900}});
  await page.emulateMedia({colorScheme:"light",reducedMotion:"reduce"});
  await page.route("https://app.powerbi.com/**",route=>route.abort());
  await addProtectionHeader(page);
  await page.goto(new URL("/dashboards/",base).href,{waitUntil:"domcontentloaded"});
  const first=page.locator('.dashboard-card[data-access="live"]').first();
  await first.locator("[data-load-report]").click();
  const frame=first.locator("iframe");
  await frame.waitFor({state:"attached"});
  const geometry=await frame.evaluate(el=>{
   const f=el.getBoundingClientRect(),shell=el.closest(".report-embed-shell").getBoundingClientRect();
   return {left:f.left,right:f.right,width:f.width,shellLeft:shell.left,shellRight:shell.right,shellWidth:shell.width,ratio:shell.width/shell.height};
  });
  assert(geometry.width>0&&geometry.left>=geometry.shellLeft-1&&geometry.right<=geometry.shellRight+1,"Dashboard iframe overflows at "+width+"px: "+JSON.stringify(geometry));
  assert(Math.abs(geometry.ratio-(width<=760?4/3:16/9))<.04,"Dashboard embed aspect ratio changed at "+width+"px.");
  await page.close();
  console.log("PASS responsive Dashboard iframe frame at "+width+"px.");
 }
}
async function testB2BWorkCardEmbed(){
 for(const width of [360,390,768,1024,1280,1920]){
  const page=await browser.newPage({viewport:{width,height:900}});
  await page.emulateMedia({colorScheme:"light",reducedMotion:"reduce"});
  await page.route("https://app.powerbi.com/**",route=>route.abort());
  await addProtectionHeader(page);
  await page.goto(new URL("/work/",base).href,{waitUntil:"domcontentloaded"});
  const card=page.locator(".work-featured .pinned-case-card").first();
  const button=card.locator(".work-card-live-preview [data-load-report]");
  const url=await button.getAttribute("data-load-report");
  await button.click();
  const frame=card.locator(".work-card-live-preview iframe");
  await frame.waitFor({state:"attached"});
  assert.equal(await frame.getAttribute("src"),url);
  assert((await frame.getAttribute("title")).includes("interactive Power BI report"));
  const geometry=await frame.evaluate(el=>{const f=el.getBoundingClientRect(),shell=el.closest(".report-embed-shell").getBoundingClientRect();return {left:f.left,right:f.right,width:f.width,shellLeft:shell.left,shellRight:shell.right,ratio:shell.width/shell.height};});
  assert(geometry.width>0&&geometry.left>=geometry.shellLeft-1&&geometry.right<=geometry.shellRight+1,"B2B Work-card iframe overflow at "+width+"px: "+JSON.stringify(geometry));
  assert(Math.abs(geometry.ratio-(width<=760?4/3:16/9))<.04,"B2B Work-card aspect ratio changed at "+width+"px.");
  assert.equal((await card.locator(".report-scenario-disclaimer").innerText()).trim(),"Portfolio scenario. Report branding is from the practice dataset.");
  await page.close();
  console.log("PASS B2B Work-card click-to-load embed at "+width+"px.");
 }
}

async function testSitewideSEO(){
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 await addProtectionHeader(page);
 const bypass=process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
 const headers=bypass?{"x-vercel-protection-bypass":bypass}:{};
 const sitemap=await page.request.get(new URL("/sitemap.xml",base).href,{headers});
 assert.equal(sitemap.status(),200,"sitemap.xml must be served on the preview.");
 const sitemapText=await sitemap.text();
 assert(sitemapText.includes("https://sohila-khaled-abbas.vercel.app/"),"Sitemap must use production canonical URLs.");
 assert(!sitemapText.includes(base.hostname),"Sitemap must never contain preview URLs.");
 assert(!/MaxAB_B2B_Retail_Wallet_Optimization|maxab-b2b-retail-wallet-optimization|AI_tools_nontechnical|AnshLambaYoutube|awesome-data-engineering|flyrank-ml-internship-starter/i.test(sitemapText),"Removed or work-linked routes must not appear in the sitemap.");
 const robots=await page.request.get(new URL("/robots.txt",base).href,{headers});
 assert.equal(robots.status(),200,"robots.txt must be served on the preview.");
 const robotsText=await robots.text();
 assert(/User-agent:\\s*\\*/i.test(robotsText)&&/Allow:\\s*\\//i.test(robotsText),"robots.txt must allow public crawling.");
 assert(robotsText.includes("https://sohila-khaled-abbas.vercel.app/sitemap.xml"),"robots.txt must point to the production sitemap.");
 assert(!robotsText.includes(base.hostname),"robots.txt must not publish a preview URL.");
 const removed=await page.request.get(new URL("/projects/MaxAB_B2B_Retail_Wallet_Optimization",base).href,{headers,maxRedirects:0});
 assert.equal(removed.status(),301,"Removed MaxAB project route must issue a 301 redirect.");
 assert.equal(new URL(removed.headers().location,base).pathname,"/work/","Removed project must redirect to Work.");
 const notFound=await page.goto(new URL("/404.html",base).href,{waitUntil:"domcontentloaded"});
 assert(notFound&&notFound.status()<400,"Custom 404 page must render.");
 assert(await page.locator('main a[href="/work/"]').count()>0&&await page.locator('main a[href="/contact/"]').count()>0,"Custom 404 must link back to Work and Contact.");
 await page.close();
 console.log("PASS sitemap, robots, removed-project 301, preview protection and custom 404.");
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

async function testContactInquiryPayload(){
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.emulateMedia({colorScheme:"light",reducedMotion:"reduce"});
 await addProtectionHeader(page);
 await page.goto(new URL("/contact/",base).href,{waitUntil:"domcontentloaded"});
 const captured=[];
 let releaseRequest;
 await page.route("**/api/lead",async route=>{
  assert.equal(route.request().method(),"POST","Contact form must keep its existing /api/lead POST.");
  captured.push(route.request().postDataJSON());
  await new Promise(resolve=>{releaseRequest=resolve;});
  await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({ok:true,message:"Mock Contact QA success."})});
 });
 const name=page.locator("#simple-inquiry-name");
 const email=page.locator("#simple-inquiry-email");
 const description=page.locator("#simple-inquiry-description");
 const budget=page.locator("#simple-inquiry-budget");
 const submit=page.locator("#simple-inquiry-submit");
 await name.fill("Q");
 await email.fill("not-an-email");
 await description.fill("Too short");
 await submit.click();
 for(const field of ["name","email","description","budgetRange"])assert(await page.locator("#simple-inquiry-"+field+"-error").isVisible(),"Inline validation is missing for "+field+".");
 assert.equal(captured.length,0,"Invalid form data must not be sent.");
 await name.fill("QA Contact");
 await email.fill("qa.contact@example.com");
 await description.fill("QA only: verify the Contact form payload without sending to the live Apps Script endpoint.");
 assert.deepEqual(await budget.locator("option").evaluateAll(items=>items.slice(1).map(x=>x.textContent.trim())),["500 - 2,000 EGP","2,000 - 5,000 EGP","5,000 - 10,000 EGP","10,000 - 25,000 EGP","25,000+ EGP","Not sure yet"]);
 assert((await budget.evaluate(el=>el.parentElement.innerText)).includes("Minimum project budget: 500 EGP"));
 await budget.selectOption({label:"500 - 2,000 EGP"});
 await page.waitForTimeout(2200);
 await submit.click();
 await page.waitForFunction(()=>document.querySelector("#simple-project-inquiry")?.getAttribute("aria-busy")==="true");
 assert(await submit.isDisabled(),"Submit button must be disabled while sending.");
 assert(await name.isDisabled()&&await email.isDisabled()&&await description.isDisabled()&&await budget.isDisabled(),"All form fields must be disabled while sending.");
 assert.equal(captured.length,1,"One mocked request should be sent.");
 releaseRequest();
 await page.locator("#simple-inquiry-result").waitFor({state:"visible"});
 assert.equal(await page.locator("#simple-inquiry-result").getAttribute("role"),"status","Success must be announced to assistive technology.");
 assert.equal(await submit.isDisabled(),false);
 assert.equal(await name.isDisabled(),false);
 const payload=captured[0];
 assert.deepEqual(Object.keys(payload).sort(),["budgetRange","description","email","formStartedAt","name","sourcePage","submissionId","type","websiteFax"].sort(),"Apps Script request field names must remain unchanged.");
 assert.equal(payload.type,"standard");
 assert.equal(payload.name,"QA Contact");
 assert.equal(payload.email,"qa.contact@example.com");
 assert.equal(payload.budgetRange,"500 - 2,000 EGP");
 assert.equal(payload.sourcePage,"/contact/");
 assert.equal(typeof payload.formStartedAt,"number");
 assert.equal(typeof payload.submissionId,"string");
 assert.equal(payload.websiteFax,"");
 await page.close();
 console.log("PASS Contact inline validation, disabled-while-sending, EGP validation and unchanged /api/lead payload. Mocked request only; no real Apps Script submission.");
}

try{
 const matrix=[];
 const routeFailures=[];
 for(const page of pages)for(const theme of themes){
  const pageViewports=page.name==="work"?[...viewports,...wideWorkViewports]:viewports;
  for(const viewport of pageViewports){
   try{matrix.push(await captureRoute(page.route,viewport.width,viewport.height,theme,page.name));}
   catch(error){
    const failure={page:page.name,theme,width:viewport.width,message:error?.message||String(error)};
    routeFailures.push(failure);
    console.error("FAIL "+page.name+" "+theme+" "+viewport.width+"px — "+failure.message);
   }
  }
 }
 const routeTitles=matrix.filter(item=>item.theme==="light"&&item.width===390);
 assert.equal(new Set(routeTitles.map(item=>item.title)).size,pages.length,"Every generated page must have a unique title under 60 characters.");
 await testThemePersistence();
 await testPreviewDialog();
 await testClipboard();
 await testReportLoading();
 await testB2BProjectPageEmbed();
 await testB2BWorkCardEmbed();
 await testDashboardCardEmbeds();
 await testSitewideSEO();
 await testContactInquiryPayload();
 await testResumePrint();
 await testInquirySafety();
 await fs.writeFile(path.join(screenshotDir,"qa-matrix.json"),JSON.stringify({passed:matrix,failures:routeFailures},null,2));
 if(routeFailures.length)throw new Error("Responsive page QA recorded "+routeFailures.length+" failure(s): "+JSON.stringify(routeFailures));
 console.log("PASS visual QA — "+matrix.length+" page/theme/viewport screenshots across "+pages.length+" routes, "+themes.length+" themes, and "+viewports.length+" viewport widths.");
}finally{await browser.close();}

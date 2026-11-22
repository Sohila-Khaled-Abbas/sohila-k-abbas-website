import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';

const baseUrl=process.env.BASE_URL;
if(!baseUrl)throw new Error('BASE_URL must point to the actual Vercel preview deployment.');
const parsedBase=new URL(baseUrl);
if(parsedBase.protocol!=='https:'||!parsedBase.hostname.endsWith('.vercel.app'))throw new Error('Visual tests only accept an HTTPS Vercel preview URL.');
const screenshotDir=path.resolve(process.cwd(),'..','screenshots');
await fs.mkdir(screenshotDir,{recursive:true});

const viewports=[
 {width:360,height:900},
 {width:390,height:900},
 {width:768,height:1024},
 {width:1280,height:900},
 {width:1536,height:1000}
];
const browser=await chromium.launch({headless:true});
try{
 for(const viewport of viewports){
  const page=await browser.newPage({viewport,deviceScaleFactor:1});
  const response=await page.goto(new URL('/',parsedBase).href,{waitUntil:'domcontentloaded',timeout:60000});
  assert(response&&response.status()<400,`Homepage returned ${response?.status()??'no response'} at ${viewport.width}px`);
  await page.evaluate(async()=>{if(document.fonts?.ready)await document.fonts.ready;});

  // Traverse the full document so in-view reveals and lazy images are ready for capture.
  const height=await page.evaluate(()=>document.documentElement.scrollHeight);
  for(let y=0;y<height;y+=Math.max(450,Math.floor(viewport.height*.72))){
   await page.evaluate(scrollY=>window.scrollTo(0,scrollY),y);
   await page.waitForTimeout(90);
  }
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForTimeout(250);

  const audit=await page.evaluate(()=>{
   const width=document.documentElement.clientWidth;
   const rootWidth=document.documentElement.scrollWidth;
   const bodyWidth=document.body.scrollWidth;
   const clipped=[...document.querySelectorAll('h1,h2,h3,p,a,button,label,li,dt,dd,figcaption')].filter(element=>{
    if(!element.textContent.trim()||element.closest('[aria-hidden="true"],.source-map-card,.project-visual,.signature-stage'))return false;
    const style=getComputedStyle(element);
    if(style.display==='none'||style.visibility==='hidden')return false;
    const clipsX=['hidden','clip'].includes(style.overflowX);
    const clipsY=['hidden','clip'].includes(style.overflowY);
    if(!clipsX&&!clipsY)return false;
    if(style.textOverflow==='ellipsis'||Number.parseInt(style.webkitLineClamp,10)>0)return false;
    return (clipsX&&element.scrollWidth>element.clientWidth+2)||(clipsY&&element.scrollHeight>element.clientHeight+2);
   }).slice(0,12).map(element=>({tag:element.tagName.toLowerCase(),className:typeof element.className==='string'?element.className:'',text:element.textContent.trim().slice(0,90)}));
   const cta=document.querySelector('.signature-hero .hero-ctas a');
   const featured=[...document.querySelectorAll('.studio-spotlight-grid>.studio-project-card')].map(card=>card.dataset.name).filter(Boolean);
   return {width,rootWidth,bodyWidth,clipped,ctaText:cta?.textContent.trim()??'',ctaHref:cta?.getAttribute('href')??'',featured};
  });
  assert(audit.rootWidth<=viewport.width&&audit.bodyWidth<=viewport.width,`Horizontal overflow at ${viewport.width}px: document ${audit.rootWidth}px, body ${audit.bodyWidth}px`);
  assert.equal(audit.clipped.length,0,`Clipped text at ${viewport.width}px: ${JSON.stringify(audit.clipped)}`);
  assert.equal(audit.ctaText,'Work with me',`Hero CTA label changed at ${viewport.width}px`);
  assert.equal(audit.ctaHref,'/services/',`Hero CTA destination changed at ${viewport.width}px`);
  const expected=['fmcg-sales-churn-drop-analysis-powerbi','global-horizon-bank-dwh-project','egyptian-cosmetics-market'];
  if(audit.featured.length>=3)assert.deepEqual(audit.featured.slice(0,3),expected,'Featured project order changed');

  if(viewport.width===390){
   await page.locator('.theme-toggle').click();
   const dark=await page.evaluate(()=>({theme:document.documentElement.dataset.theme,bg:getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(),scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));
   assert.equal(dark.theme,'dark','Dark mode toggle did not activate');
   assert.equal(dark.bg,'#211916','Dark mode must use the designed cocoa-black surface');
   assert(dark.scroll<=dark.width,'Dark mode introduced horizontal overflow');
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:path.join(screenshotDir,'homepage-390-dark.png'),fullPage:true,animations:'disabled'});
   await page.locator('.theme-toggle').click();
  }
  if([390,1280].includes(viewport.width)){
   const filename=path.join(screenshotDir,`homepage-${viewport.width}.png`);
   await page.screenshot({path:filename,fullPage:true,animations:'disabled'});
   console.log(`Screenshot saved: ${filename}`);
  }
  console.log(`PASS ${viewport.width}px — no horizontal overflow, no clipped editorial text, hero CTA and featured order verified.`);
  await page.close();
 }

 for(const route of ['/services/','/work/','/dashboards/']){
  const page=await browser.newPage({viewport:{width:390,height:900}});
  const response=await page.goto(new URL(route,parsedBase).href,{waitUntil:'domcontentloaded',timeout:60000});
  assert(response&&response.status()<400,`${route} returned ${response?.status()??'no response'}`);
  if(route==='/services/'){
   assert.equal(await page.locator('#simple-project-inquiry').count(),1,'Public project inquiry form is missing');
   assert.equal(await page.locator('#project-brief').count(),1,'Protected enterprise inquiry form is missing');
  }
  const dims=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  assert(dims.scroll<=dims.width,`Horizontal overflow on ${route}: ${JSON.stringify(dims)}`);
  console.log(`PASS route ${route} — HTTP ${response.status()}, no horizontal overflow.`);
  await page.close();
 }
}finally{await browser.close();}

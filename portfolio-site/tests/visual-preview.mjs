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

const expectedFeatured=[
  'fmcg-sales-churn-drop-analysis-powerbi',
  'global-horizon-bank-dwh-project',
  'egyptian-cosmetics-market'
];
const viewports=[
 {width:360,height:900},
 {width:390,height:900},
 {width:768,height:1024},
 {width:1280,height:900},
 {width:1536,height:1000},
 {width:1905,height:1080}
];
const browser=await chromium.launch({headless:true});

async function addProtectionHeader(page){
 if(process.env.VERCEL_AUTOMATION_BYPASS_SECRET){
  await page.setExtraHTTPHeaders({'x-vercel-protection-bypass':process.env.VERCEL_AUTOMATION_BYPASS_SECRET});
 }
}
async function inspectLayout(page){
 return page.evaluate(()=>{
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
  }).slice(0,12).map(element=>({
   tag:element.tagName.toLowerCase(),
   className:typeof element.className==='string'?element.className:'',
   text:element.textContent.trim().slice(0,90)
  }));
  const cta=document.querySelector('.signature-hero .hero-ctas a');
  const heading=document.querySelector('.signature-hero h1');
  const lineHeight=heading?Number.parseFloat(getComputedStyle(heading).lineHeight):0;
  const headlineLines=heading&&lineHeight?heading.getBoundingClientRect().height/lineHeight:0;
  const featured=[...document.querySelectorAll('.home-featured-work .studio-spotlight-grid>.studio-project-card')].map(card=>card.dataset.name).filter(Boolean);
  return {
   width,rootWidth,bodyWidth,clipped,
   ctaText:cta?.textContent.trim()??'',
   ctaHref:cta?.getAttribute('href')??'',
   headlineLines,featured
  };
 });
}
function assertLayout(audit,width,label){
 assert(audit.rootWidth<=width&&audit.bodyWidth<=width,
  \`Horizontal overflow on \${label} at \${width}px: document \${audit.rootWidth}px, body \${audit.bodyWidth}px\`);
 assert.equal(audit.clipped.length,0,
  \`Clipped text on \${label} at \${width}px: \${JSON.stringify(audit.clipped)}\`);
}

try{
 for(const viewport of viewports){
  const page=await browser.newPage({viewport,deviceScaleFactor:1});
  await addProtectionHeader(page);
  const response=await page.goto(new URL('/',parsedBase).href,{waitUntil:'domcontentloaded',timeout:60000});
  assert(response&&response.status()<400,\`Homepage returned \${response?.status()??'no response'} at \${viewport.width}px\`);
  await page.evaluate(async()=>{if(document.fonts?.ready)await document.fonts.ready;});

  // Traverse the whole page so reveal animations and lazy images are settled before audit and capture.
  const height=await page.evaluate(()=>document.documentElement.scrollHeight);
  for(let y=0;y<height;y+=Math.max(450,Math.floor(viewport.height*.72))){
   await page.evaluate(scrollY=>window.scrollTo(0,scrollY),y);
   await page.waitForTimeout(90);
  }
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForTimeout(250);

  const audit=await inspectLayout(page);
  assertLayout(audit,viewport.width,'homepage');
  assert.equal(audit.ctaText,'Work with me',\`Hero CTA label changed at \${viewport.width}px\`);
  assert.equal(audit.ctaHref,'/services/',\`Hero CTA destination changed at \${viewport.width}px\`);
  assert.deepEqual(audit.featured,expectedFeatured,'Homepage featured case-study order changed');
  if(viewport.width>=1280){
   assert(audit.headlineLines<=2.2,
    \`Desktop hero headline wrapped into too many lines at \${viewport.width}px: \${audit.headlineLines.toFixed(2)}\`);
  }

  if(viewport.width===390){
   await page.locator('.theme-toggle').click();
   const dark=await page.evaluate(()=>({
    theme:document.documentElement.dataset.theme,
    bg:getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(),
    scroll:document.documentElement.scrollWidth,
    width:document.documentElement.clientWidth
   }));
   assert.equal(dark.theme,'dark','Dark mode toggle did not activate');
   assert.equal(dark.bg,'#211916','Dark mode must use the designed cocoa-black surface');
   assert(dark.scroll<=dark.width,'Dark mode introduced horizontal overflow');
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:path.join(screenshotDir,'homepage-390-dark.png'),fullPage:true,animations:'disabled'});
   await page.locator('.theme-toggle').click();
  }
  if([390,1280].includes(viewport.width)){
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:path.join(screenshotDir,\`homepage-\${viewport.width}.png\`),fullPage:true,animations:'disabled'});
  }
  console.log(\`PASS homepage \${viewport.width}px — no horizontal overflow or clipped text; hero CTA, balanced headline, and featured order verified.\`);
  await page.close();
 }

 const routes=[
  '/services/',
  '/work/',
  '/dashboards/',
  '/projects/fmcg-sales-churn-drop-analysis-powerbi/'
 ];
 for(const route of routes){
  for(const width of [390,1280]){
   const page=await browser.newPage({viewport:{width,height:900}});
   await addProtectionHeader(page);
   const response=await page.goto(new URL(route,parsedBase).href,{waitUntil:'domcontentloaded',timeout:60000});
   assert(response&&response.status()<400,\`\${route} returned \${response?.status()??'no response'} at \${width}px\`);
   await page.evaluate(async()=>{if(document.fonts?.ready)await document.fonts.ready;});
   const audit=await inspectLayout(page);
   assertLayout(audit,width,route);

   if(route==='/services/'){
    assert.equal(await page.locator('#simple-project-inquiry').count(),1,'Public project inquiry form is missing');
    assert.equal(await page.locator('#project-brief').count(),1,'Protected enterprise inquiry form is missing');
    assert.equal(await page.locator('#simple-project-inquiry').getAttribute('method'),'post','Public inquiry POST method changed');
    assert.equal(await page.locator('#simple-project-inquiry').getAttribute('action'),'/services/','Public inquiry POST action changed');
    assert.equal(await page.locator('#project-brief').getAttribute('method'),'post','Enterprise inquiry POST method changed');
    const startProject=page.locator('a[href="#simple-project-inquiry"]').first();
    assert.equal(await startProject.textContent().then(value=>value.trim().startsWith('Start a project')),true,'Start a project CTA is missing');
    await startProject.click();
    assert.equal(new URL(page.url()).hash,'#simple-project-inquiry','Start a project CTA must scroll to the public inquiry form');
   }

   if(route==='/work/'){
    const pinned=await page.locator('.work-featured .pinned-case-card').evaluateAll(cards=>cards.map(card=>card.dataset.name));
    assert.deepEqual(pinned,expectedFeatured,'Work page pinned case-study order changed');
    const disclosure=page.locator('[data-repo-tools]');
    assert.equal(await disclosure.count(),1,'Full repository search and filters are missing');
    assert.equal(await disclosure.evaluate(element=>element.open),width>=651,
     \`Repository search disclosure should be \${width>=651?'open':'closed'} at \${width}px\`);
    assert.equal(await page.locator('#repo-grid .repo-card').count(),101,
     'The full searchable repository collection must remain intact');
   }

   if(route==='/projects/fmcg-sales-churn-drop-analysis-powerbi/'){
    assert.equal(await page.locator('.story-outcome .eyebrow').textContent().then(value=>value.trim()),'OUTCOME',
     'B2B Retail case study needs a clearly labeled Outcome block');
   }
   console.log(\`PASS \${route} at \${width}px — HTTP \${response.status()}, no overflow or clipped text.\`);
   await page.close();
  }
 }
}finally{
 await browser.close();
}

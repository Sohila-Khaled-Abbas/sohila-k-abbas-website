import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import path from 'node:path';

const baseURL=(process.env.BASE_URL||'').replace(/\/$/,'');
const screenshotRoot=path.resolve(process.cwd(),'../screenshots');

async function waitForVisualReady(page){
  await page.evaluate(async()=>{
    await Promise.race([document.fonts?.ready||Promise.resolve(),new Promise(resolve=>setTimeout(resolve,5000))]);
    await Promise.race([Promise.all([...document.images].map(image=>image.decode?.().catch(()=>undefined))),new Promise(resolve=>setTimeout(resolve,2500))]);
  });
}
async function revealFullPage(page){
  await page.evaluate(async()=>{
    const step=Math.max(260,Math.floor(window.innerHeight*.7));
    document.documentElement.style.scrollBehavior='auto';
    for(let y=0;y<document.documentElement.scrollHeight;y+=step){
      window.scrollTo({top:y,behavior:'instant'});
      await new Promise(resolve=>setTimeout(resolve,45));
    }
    window.scrollTo(0,0);
  });
}
async function layoutIssues(page){
  return page.evaluate(()=>{
    const width={viewport:window.innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth};
    const selectors='h1,h2,h3,p,.project-card-description,.project-card-outcome,.home-testimonial-quote,.home-testimonial-card figcaption,.home-process-steps h3';
    const clipped=[...document.querySelectorAll(selectors)].filter(element=>{
      const style=getComputedStyle(element);
      if(style.display==='none'||style.visibility==='hidden'||!element.getClientRects().length)return false;
      const verticallyClipped=['hidden','clip'].includes(style.overflowY)&&element.scrollHeight>element.clientHeight+1;
      const clamped=Number.parseInt(style.webkitLineClamp,10)>0&&element.scrollHeight>element.clientHeight+1;
      return verticallyClipped||clamped;
    }).map(element=>({tag:element.tagName,selector:element.className?.toString?.()||element.id,text:(element.innerText||'').slice(0,100)}));
    return {width,clipped};
  });
}

test('homepage is responsive, legible, and free of clipped content at all target widths',async({page})=>{
  test.setTimeout(180000);
  if(!baseURL)throw new Error('Set BASE_URL to the deployed Vercel preview URL.');
  await mkdir(screenshotRoot,{recursive:true});
  await page.setViewportSize({width:1280,height:900});
  const response=await page.goto(baseURL+'/',{waitUntil:'domcontentloaded'});
  expect(response?.status(), 'Homepage should return HTTP 200').toBe(200);
  const hero=page.locator('.signature-hero');
  await expect(hero.locator('h1')).toBeVisible();
  await expect(hero.locator('.hero-ctas .button.primary')).toHaveText('Work with me');
  await expect(hero.locator('.hero-ctas .button.primary')).toHaveCount(1);
  await waitForVisualReady(page);

  const expected=['B2B Retail Analytics & Churn Diagnostic','Global Horizon Bank','Egyptian Cosmetics'];
  const featured=await page.locator('.studio-spotlight-grid .studio-project-card h3').allInnerTexts();
  expect(featured).toHaveLength(3);
  expected.forEach((name,index)=>expect(featured[index]).toContain(name));
  await expect(page.locator('.home-testimonial-card')).toHaveCount(3);
  await expect(page.getByText('Pricing follows the scope.',{exact:true})).toBeVisible();
  await expect(page.getByText('A fixed quote comes after reviewing your data, deliverables, and timeline.',{exact:true})).toBeVisible();

  for(const width of [360,390,768,1280,1536]){
    await page.setViewportSize({width,height:900});
    await waitForVisualReady(page);
    await revealFullPage(page);
    const issues=await layoutIssues(page);
    expect(issues.width.document, `document overflow at ${width}px: ${JSON.stringify(issues.width)}`).toBeLessThanOrEqual(width);
    expect(issues.width.body, `body overflow at ${width}px`).toBeLessThanOrEqual(width);
    expect(issues.clipped, `clipped text at ${width}px`).toEqual([]);
    await page.screenshot({path:path.join(screenshotRoot,`home-${width}.png`),fullPage:true,animations:'disabled'});
  }
});

test('dark theme has its own palette and remains responsive on mobile',async({page})=>{
  test.setTimeout(90000);
  if(!baseURL)throw new Error('Set BASE_URL to the deployed Vercel preview URL.');
  await mkdir(screenshotRoot,{recursive:true});
  await page.setViewportSize({width:390,height:844});
  await page.goto(baseURL+'/',{waitUntil:'domcontentloaded'});
  await waitForVisualReady(page);
  await page.locator('.theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  const bg=await page.locator('body').evaluate(element=>getComputedStyle(element).backgroundColor);
  expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  await revealFullPage(page);
  const issues=await layoutIssues(page);
  expect(issues.width.document).toBeLessThanOrEqual(390);
  expect(issues.clipped).toEqual([]);
  await page.screenshot({path:path.join(screenshotRoot,'home-390-dark.png'),fullPage:true,animations:'disabled'});
});

test('primary portfolio routes load without horizontal scrolling on mobile',async({page})=>{
  test.setTimeout(120000);
  if(!baseURL)throw new Error('Set BASE_URL to the deployed Vercel preview URL.');
  await page.setViewportSize({width:390,height:844});
  for(const route of ['/','/work/','/dashboards/','/about/','/services/','/community/','/credentials/']){
    const response=await page.goto(baseURL+route,{waitUntil:'domcontentloaded'});
    expect(response?.status(), `${route} should return HTTP 200`).toBe(200);
    await expect(page.locator('main h1')).toHaveCount(1);
    const width=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}));
    expect(width.document, `${route} overflows at 390px`).toBeLessThanOrEqual(width.viewport);
  }
});

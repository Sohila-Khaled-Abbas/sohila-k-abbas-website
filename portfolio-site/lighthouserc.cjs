const base=process.env.BASE_URL;
if(!base)throw new Error('BASE_URL must point to the actual Vercel preview.');
const origin=new URL(base);
if(origin.protocol!=='https:'||!origin.hostname.endsWith('.vercel.app'))throw new Error('Lighthouse only accepts the HTTPS Vercel preview.');
const extraHeaders=process.env.VERCEL_AUTOMATION_BYPASS_SECRET?{'x-vercel-protection-bypass':process.env.VERCEL_AUTOMATION_BYPASS_SECRET}:{};
module.exports={
 ci:{
  collect:{
   url:[new URL('/',origin).href,new URL('/services/',origin).href],
   numberOfRuns:3,
   chromePath:process.env.CHROME_PATH,
   settings:{chromeFlags:'--no-sandbox --headless',extraHeaders}
  },
  assert:{
   assertions:{
    'categories:performance':['warn',{minScore:0.90}],
    'categories:accessibility':['error',{minScore:0.90}],
    'categories:best-practices':['warn',{minScore:0.90}],
    'categories:seo':['error',{minScore:0.90}],
    'largest-contentful-paint':['warn',{maxNumericValue:2500}],
    'cumulative-layout-shift':['warn',{maxNumericValue:0.10}]
   }
  },
  upload:{target:'filesystem',outputDir:'./lighthouse-reports'}
 }
};

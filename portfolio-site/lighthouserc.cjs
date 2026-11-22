const base=process.env.BASE_URL;
if(!base)throw new Error('BASE_URL must point to the actual Vercel preview.');
const origin=new URL(base);
if(origin.protocol!=='https:'||!origin.hostname.endsWith('.vercel.app'))throw new Error('Lighthouse only accepts the HTTPS Vercel preview.');
const bypass=process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const extraHeaders=bypass?{'x-vercel-protection-bypass':bypass}:{};
const preset=process.env.LIGHTHOUSE_PRESET==='desktop'?'desktop':'mobile';
const screenEmulation=preset==='desktop'
 ?{mobile:false,width:1280,height:900,deviceScaleFactor:1,disabled:false}
 :{mobile:true,width:390,height:844,deviceScaleFactor:2,disabled:false};
const settings={
 chromeFlags:'--no-sandbox --headless',
 extraHeaders
};
if(preset==='desktop'){
 settings.preset='desktop';
 settings.screenEmulation=screenEmulation;
}else{
 settings.formFactor='mobile';
 settings.screenEmulation=screenEmulation;
}
module.exports={
 ci:{
  collect:{
   url:[new URL('/',origin).href],
   numberOfRuns:3,
   chromePath:process.env.CHROME_PATH,
   settings
  },
  assert:{
   assertions:{
    'categories:performance':['warn',{minScore:0.90}],
    'categories:accessibility':['warn',{minScore:0.95}],
    'categories:best-practices':['warn',{minScore:0.90}],
    'categories:seo':['warn',{minScore:0.90}],
    'largest-contentful-paint':['warn',{maxNumericValue:2500}],
    'cumulative-layout-shift':['warn',{maxNumericValue:0.10}]
   }
  },
  upload:{target:'filesystem',outputDir:'./lighthouse-reports/'+preset}
 }
};

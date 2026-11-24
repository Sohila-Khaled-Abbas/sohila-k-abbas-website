const base=process.env.BASE_URL;
if(!base)throw new Error('BASE_URL must point to the actual Vercel preview.');
const origin=new URL(base);
if(origin.protocol!=='http:'||!['127.0.0.1','localhost'].includes(origin.hostname))throw new Error('Lighthouse must run against the local production-indexable build.');
const preset=process.env.LIGHTHOUSE_PRESET==='desktop'?'desktop':'mobile';
const screenEmulation=preset==='desktop'
 ?{mobile:false,width:1280,height:900,deviceScaleFactor:1,disabled:false}
 :{mobile:true,width:390,height:844,deviceScaleFactor:2,disabled:false};
const settings={chromeFlags:'--no-sandbox --headless'};
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
   url:['/','/work/','/projects/fmcg-sales-churn-drop-analysis-powerbi/','/dashboards/','/contact/','/resume/'].map(route=>new URL(route,origin).href),
   numberOfRuns:1,
   chromePath:process.env.CHROME_PATH,
   settings
  },
  assert:{
   assertions:{
    'categories:performance':['warn',{minScore:0.90}],
    'categories:accessibility':['warn',{minScore:0.95}],
    'categories:best-practices':['warn',{minScore:0.90}],
    'categories:seo':['error',{minScore:0.90}],
    'largest-contentful-paint':['warn',{maxNumericValue:2500}],
    'cumulative-layout-shift':['warn',{maxNumericValue:0.10}]
   }
  },
  upload:{target:'filesystem',outputDir:'./lighthouse-reports/'+preset}
 }
};

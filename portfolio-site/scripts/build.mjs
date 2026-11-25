import {category,isClientWorkRepository} from '../src/assets/project-catalog.mjs';
import {recruiterPage} from './growth.mjs';
import {projectStory,storyPage} from './project-story.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {escape as e,icon,intro,link,cta,about,contact,resumePage,casePage} from './pages.mjs';
import {reportRoute,progressBadge,dashboardGallery,reportPage,inlineReport,imageViewer} from './previews.mjs';
import {directoryCard,projectPage,projectPreview,caseExtras,studioHome,servicesPage,searchDialog} from './studio.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=async file=>JSON.parse(await fs.readFile(path.join(root,file),'utf8'));
const profile=await read('content/profile.json');
const sourceCases={...await read('content/cases.json'),...await read('content/additional-cases.json')};
const sourceCatalog=await read('content/repositories.json');
const sourceReports=(await read('content/project-previews.json')).reports;
const hiddenReportRepos=new Set(sourceReports.filter(report=>report.hidden===true).map(report=>report.repo));
const projectStatus=await read('content/project-status.json');
const projectDetailsData=await read('content/project-details.json');
const allProjectDetails=projectDetailsData.projects||[];
const sourceProjectDetailsByRepo=new Map(allProjectDetails.map(project=>[project.repo,project]));
const sourceReportsByRepo=new Map(sourceReports.map(report=>[report.repo,report]));
const sourceCaseByRepo=new Map(Object.values(sourceCases).map(item=>[item.repo,item]));
const workRepositories=sourceCatalog.repositories.filter(repository=>
  isClientWorkRepository(repository,sourceProjectDetailsByRepo.get(repository.name),sourceCaseByRepo.get(repository.name))
);
const workRepoNames=new Set(workRepositories.map(repository=>repository.name));
const cases=Object.fromEntries(Object.entries(sourceCases).filter(([,item])=>workRepoNames.has(item.repo)));
const catalog={...sourceCatalog,repositories:workRepositories};
const legacyDashboardOnlyRepos=new Set(['mobile-technical-support-analytics']);
const reports=sourceReports.filter(report=>!report.hidden&&(workRepoNames.has(report.repo)||legacyDashboardOnlyRepos.has(report.repo)));
const projectDetails=allProjectDetails.filter(project=>workRepoNames.has(project.repo));
const homeSections=projectDetailsData.home_sections||{};
const reportByRepo=new Map(reports.map(report=>[report.repo,report]));
const professionalEvidence=await read('content/professional-evidence.json');
const recruiterGuide=await read('content/recruiter-guide.json');
// The profile project links to its source; professional positioning is owner-maintained here.
for(const project of projectDetails)if(project.repo==='Sohila-Khaled-Abbas'&&project.github)project.github.readme_excerpt='';
const projectDetailsByRepo=new Map(projectDetails.map(p=>[p.repo,p]));
const rawHome=await fs.readFile(path.join(root,'src/home.html'),'utf8');
const symbols=rawHome.slice(rawHome.indexOf('<svg class="icon-library"'),rawHome.indexOf('</svg>')+6);
const title=profile.name;
const urlArg=process.argv.indexOf('--site-url');
const origin=(urlArg>=0?process.argv[urlArg+1]:process.env.SITE_URL||(process.env.VERCEL_PROJECT_PRODUCTION_URL?'https://'+process.env.VERCEL_PROJECT_PRODUCTION_URL:profile.website||''))?.replace(/\/$/,'');
if(origin&&!/^https?:\/\/[^\s]+$/.test(origin))throw new Error('SITE_URL must be an absolute HTTP(S) origin');
const out=path.join(root,'dist');
await fs.rm(out,{recursive:true,force:true});await fs.mkdir(out,{recursive:true});
await fs.cp(path.join(root,'src/assets'),out,{recursive:true});
const categories={all:'All work',analytics:'BI & analytics',engineering:'Data engineering',automation:'Automation & AI',apps:'Apps & tools'};

const descriptions={
 'regional-sales-dashboard':'Power BI reporting for regional sales trends, profitability analysis, and growth opportunities.',
 'sohila-k-abbas-website':'A personal data portfolio website built with React and TypeScript.',
 'flyrank-ml-internship-starter':'Applied ML and search-intelligence notebooks, evaluation scripts, research writing, and an automation-agent showcase.',
 'fmcg-sales-churn-drop-analysis-powerbi':'Power BI portfolio exploring retailer lifecycle, delivery performance, and commercial metrics in an Egyptian B2B scenario.',
 'marketing_campaigns_analysis':'A data-engineering and analytics project connecting campaign inputs to modeled reporting and investment questions.',
 'ecommerce-flash-sale-analysis':'A data-engineering investigation of flash-sale behavior, margin questions, and potential bot-related patterns.',
 'apple-stock-market-analysis':'Historical AAPL market-data analysis with a Python and BI workflow.',
 'customer-360-banking-etl':'A diploma capstone using Informatica IICS to integrate banking data, apply exception rules, and produce a customer view.',
 'novatel-big-data-ecosystem':'A telecom data-engineering scenario exploring high-write-velocity architecture.',
 'enterprise-hr-analytics':'A multi-source HR and client-delivery portfolio scenario using a Kimball galaxy model.',
 'Sohila-Khaled-Abbas':'The source and assets behind my GitHub profile.',
 'Social-Media-Advertising-Dashboard':'A social-media advertising analysis and dashboard repository.',
 'airbnb-amsterdam-analysis':'An Airbnb Amsterdam exploratory analysis repository.',
 'Customer-Churn-Analysis':'A customer-churn analysis project.',
 'marketing-campaign-dashboard':'A marketing-campaign analytics and dashboard project.',
 'Machine-Learning-and-Data-Science-Resourses':'A forked collection of machine-learning and data-science resources.',
 'data-engineering-roadmap':'A forked data-engineering learning roadmap.',
 'AnshLambaYoutube':'A forked collection of tutorial materials.',
 'AI_tools_nontechnical':'A forked collection of AI tools for nontechnical learners.',
 'Obsidian-Vault-Roadmap':'A forked learning-roadmap vault.',
 'tidytuesday':'A fork of the TidyTuesday data-practice resource repository.'
};
const byRepo=new Map(Object.values(cases).map(c=>[c.repo,c]));
const casesByRepo=Object.fromEntries(byRepo);
const ordered=workRepositories.map(r=>({...r,category:category(r)})).sort((a,b)=>Number(byRepo.has(b.name))-Number(byRepo.has(a.name))||Date.parse(b.updated_at)-Date.parse(a.updated_at));
const repoCard=r=>directoryCard(r,projectDetailsByRepo.get(r.name),reportByRepo.get(r.name),projectStatus,categories,byRepo.has(r.name));
function work(){
 const featuredRepos=(homeSections.featured||[]).filter(repo=>ordered.some(item=>item.name===repo)).slice(0,3);
 const pinnedCards=featuredRepos.map(repo=>{
  const r=ordered.find(item=>item.name===repo),p=projectDetailsByRepo.get(repo);
  if(!r||!p)return '';
  return directoryCard(r,p,reportByRepo.get(repo),projectStatus,categories,byRepo.has(repo),true).replace('class="repo-card studio-project-card','class="pinned-case-card studio-project-card');
 }).join('');
 const pinned='<section id="case-studies" class="wrap page-section work-featured" aria-labelledby="work-featured-title"><div class="section-label"><span>SELECTED / CASE STUDIES</span><span class="mono muted">CURATED FIRST</span></div><div class="section-heading"><h2 id="work-featured-title">Start with the <em>evidence.</em></h2><p>Numbered business and analytics projects, with report previews and source links. The full collection remains searchable below.</p></div><div class="studio-spotlight-grid">'+pinnedCards+'</div></section>';
 const browser='<section id="repositories" class="wrap page-section repository-section"><details class="repo-tools-disclosure" data-repo-tools><summary><span>Browse the full project collection</span><span class="repo-tools-count">'+ordered.length+' projects</span></summary><div class="repo-tools-content"><div class="section-label"><span>WORK / ALL ORIGINAL PROJECTS</span><span class="mono muted">SOURCE SNAPSHOT '+e(catalog.checked_on)+'</span></div><form class="repo-controls" role="search" onsubmit="return false"><label class="repo-search">Search projects<span class="repo-search-field"><span aria-hidden="true">⌕</span><input id="repo-query" type="search" placeholder="Try Power BI, SQL, Python, DAX, or a project name…" autocomplete="off"></span></label><label>Project status<select id="repo-status-filter"><option value="all">All projects</option><option value="progress">In progress</option></select></label><label>Sort by<select id="repo-sort"><option value="featured">Case studies first</option><option value="recent">Recently updated</option><option value="name">Name · A to Z</option></select></label></form><div class="repo-filters" role="group" aria-label="Filter projects by subject">'+Object.entries(categories).map(([key,label])=>'<button class="repo-filter'+(key==='all'?' active':'')+'" data-repo-filter="'+key+'" aria-pressed="'+(key==='all')+'">'+label+'<span>'+(key==='all'?ordered.length:ordered.filter(r=>r.category===key).length)+'</span></button>').join('')+'</div><div class="repo-view-tools"><p>Open a project to inspect the available report, implementation notes, and source evidence.</p><div class="project-view-buttons" role="group" aria-label="Project display"><button data-project-view="grid" aria-pressed="true">Gallery</button><button data-project-view="list" aria-pressed="false">List</button></div></div><div class="repo-results-bar"><p id="repo-status" role="status" aria-live="polite">'+ordered.length+' projects</p><button id="repo-reset" class="text-link" hidden>Clear filters ×</button></div><div id="repo-grid" class="repo-grid">'+ordered.map(repoCard).join('')+'</div><div id="repo-empty" class="repo-empty" hidden><h3>No projects match that search.</h3><p>Try a shorter name, a tool, or another subject.</p><button class="button primary" data-reset-repos>Show all work</button></div><div class="load-more-row"><button id="repo-more" class="button primary" hidden>Show more projects <svg class="icon"><use href="#arrow"/></svg></button></div><p class="repo-footnote" id="github-refresh-status" role="status">Public source snapshot: '+e(catalog.checked_on)+'. Repository metadata is from the verified build snapshot.</p><noscript><p>All projects are shown below. Enable JavaScript to search, filter, and sort the collection.</p></noscript></div></details></section>';
 return intro('WORK / CURATED CASE STUDIES','Business questions.<br><em>Inspectable work.</em>','A selected route through BI reporting, SQL and data modeling, analytics engineering, and automation. Browse the full original project collection after the featured stories.')+pinned+browser+cta();
}

const pages=[];
const navItems=[['/','Home'],['/work/','Work'],['/dashboards/','Dashboards'],['/about/','About / résumé'],['/contact/','Contact']];
function header(route){const navLink=([url,label])=>`<a href="${url}"${route===url||(url==='/about/'&&route==='/resume/')?' aria-current="page"':''}>${label}</a>`;return `<header class="header"><div class="nav-shell wrap"><a class="brand" href="/" aria-label="Sohila home"><span class="brand-word">sohila</span><span class="brand-dot">.</span></a><nav id="navigation" aria-label="Main navigation">${navItems.map(navLink).join('')}</nav><div class="nav-actions"><button class="project-search-button" data-open-finder aria-label="Search projects" aria-keyshortcuts="Control+K Meta+K" title="Search projects · Ctrl / ⌘ K"><svg class="icon" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg></button><button class="theme-toggle" type="button" aria-label="Switch color theme" title="Switch color theme"><svg class="icon"><use href="#sun"/></svg></button><button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="navigation"><svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button></div></div></header>`;}
function footer(){return `<footer class="site-footer"><div class="wrap"><div class="footer-main"><div><a class="brand" href="/">sohila<span class="brand-dot">.</span></a><p>Data analysis · Business intelligence · Analytics engineering</p><span class="mono muted">DAMIETTA, EGYPT · OPEN TO REMOTE EMPLOYEE ROLES</span></div><div class="footer-pages">${navItems.map(([url,label])=>`<a href="${url}">${label}</a>`).join('')}<a href="/recruiters/">For hiring teams</a></div><div class="footer-social">${link(profile.github,'GitHub')}${link(profile.linkedin,'LinkedIn')}<a href="mailto:${e(profile.email)}">${e(profile.email)}</a></div></div><div class="footer-bottom"><span>© <span id="year">2026</span> ${e(profile.name)}</span><span>Built around questions worth answering.</span><a href="#main">Back to top ↑</a></div></div></footer><div id="toast" class="toast" role="status" aria-live="polite"></div>`;}

async function write(route,pageTitle,description,body){
  const titleOverrides={
    '/':'Sohila Khaled Abbas | BI Developer',
    '/work/':'Power BI & SQL Case Studies | Sohila',
    '/dashboards/':'Power BI Dashboards | Sohila',
    '/about/':'About Sohila | BI Developer & Data Analyst',
    '/resume/':'BI Developer Resume | Sohila Khaled Abbas',
    '/contact/':'Contact Sohila | Remote BI & Data Analyst',
    '/services/':'How I work | Sohila',
    '/recruiters/':'Hire Sohila | BI Developer & Data Analyst',
    '/404.html':'Page not found | Sohila'
  };
  const seoBaseTitle=pageTitle.replace(/\\s+[—–-]\\s+(?:Portfolio Scenario|Dashboard)$/i,'').trim();
  const seoFallbackTitle=(seoBaseTitle.length<=43?seoBaseTitle:seoBaseTitle.slice(0,43).replace(/\\s+\\S*$/,'').trimEnd())+' | Sohila';
  const seoTitle=titleOverrides[route]||seoFallbackTitle;
  const seoDescription=description.length<=159?description:description.slice(0,156).trimEnd()+'…';
  const robotsMeta=process.env.VERCEL_ENV==='preview'?'<meta name="robots" content="noindex,nofollow">':'';
  const personId=origin?origin+'/#person':'#person';
  const graph=[
    {'@type':'WebSite','@id':origin?origin+'/#website':'#website',url:origin?origin+'/':profile.website,name:profile.name,alternateName:'Sohila — BI Developer & Data Analyst',inLanguage:'en',publisher:{'@id':personId}},
    {'@type':'Person','@id':personId,name:profile.name,url:origin?origin+'/':profile.website,jobTitle:profile.role,sameAs:[profile.linkedin,profile.github],knowsAbout:[...new Set((profile.skill_groups||[]).flatMap(group=>group.items||[]))].slice(0,30)}
  ];
  if(origin){
    const crumbParts=[{name:'Home',item:origin+'/'}];
    if(route!=='/')crumbParts.push({name:pageTitle,item:origin+route});
    graph.push({'@type':'BreadcrumbList','@id':origin+route+'#breadcrumbs',itemListElement:crumbParts.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.name,item:item.item}))});
    if(route.startsWith('/projects/')){
      const slug=route.split('/').filter(Boolean)[1];
      const project=projectDetailsByRepo.get(slug);
      const caseStudy=casesByRepo[slug];
      if(project)graph.push({'@type':'CreativeWork','@id':origin+route+'#case-study',name:project.title,description:caseStudy?.intro||project.summary,url:origin+route,author:{'@id':personId},creator:{'@id':personId},genre:'Portfolio case study',keywords:(project.technologies||[]).join(', '),isPartOf:{'@id':origin+'/#website'}});
    }
    if(route==='/about/')graph.push({'@type':'ProfilePage','@id':origin+route+'#profile',url:origin+route,name:'About '+profile.name,mainEntity:{'@id':personId}});
  }
  const jsonLd=`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c')}</script>`;
  const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f7f3ed"><script>(function(){try{var saved=localStorage.getItem('sohila-theme');var dark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=(saved==='light'||saved==='dark')?saved:(dark?'dark':'light');}catch(e){document.documentElement.dataset.theme='light';}})();</script><title>${e(seoTitle)}</title><meta name="description" content="${e(seoDescription)}">${robotsMeta}<meta property="og:title" content="${e(seoTitle)}"><meta property="og:description" content="${e(seoDescription)}"><meta property="og:type" content="${route.startsWith('/projects/')?'article':'website'}"><meta property="og:locale" content="en_EG"><meta property="og:site_name" content="${e(profile.name)}"><meta name="author" content="${e(profile.name)}">${jsonLd}${origin?`<link rel="canonical" href="${origin}${route}"><meta property="og:url" content="${origin}${route}"><meta property="og:image" content="${origin}/social-card.png"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Sohila Khaled Abbas — BI Developer and Data Analyst"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${e(seoTitle)}"><meta name="twitter:description" content="${e(seoDescription)}"><meta name="twitter:image" content="${origin}/social-card.png">`:''}<link rel="icon" href="/favicon.ico?v=warm-grid-1" sizes="16x16 32x32 48x48"><link rel="icon" href="/favicon-32.png?v=warm-grid-1" type="image/png" sizes="32x32"><link rel="icon" href="/favicon.svg?v=warm-grid-1" type="image/svg+xml" sizes="any"><link rel="apple-touch-icon" href="/apple-touch-icon.png?v=warm-grid-1" sizes="180x180">${route==='/'?'<link rel="preload" as="image" href="/sohila-portrait.webp" fetchpriority="high">':''}<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="preload" as="font" href="https://fonts.gstatic.com/s/cormorantgaramond/v21/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtKky2F7g.woff2" type="font/woff2" crossorigin><link rel="preload" as="font" href="https://fonts.gstatic.com/s/cormorantgaramond/v21/co3ZmX5slCNuHLi8bLeY9MK7whWMhyjYrEtImSqn7B6D.woff2" type="font/woff2" crossorigin><link rel="preload" as="font" href="https://fonts.gstatic.com/s/dmsans/v17/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K6z9mXg.woff2" type="font/woff2" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/pages.css"><link rel="stylesheet" href="/enhancements.css"><link rel="stylesheet" href="/studio.css"><link rel="stylesheet" href="/theme.css">${route.startsWith('/projects/')||route.startsWith('/dashboards/')&&route!=='/dashboards/'?'<link rel="stylesheet" href="/project-story.css"><script src="/project-story.js" defer></script>':''}${['/services/','/contact/'].includes(route)?'<link rel="stylesheet" href="/business-inquiry.css"><script type="module" src="/business-inquiry.mjs"></script>':''}<link rel="stylesheet" href="/redesign.css"><link rel="stylesheet" href="/editorial.css"><script src="/app.js" defer></script><script src="/enhancements.js" defer></script><script src="/redesign.js" defer></script><script src="/studio.js" defer></script><script src="/github-live.mjs" type="module"></script></head><body><a class="skip" href="#main">Skip to content</a>${symbols}${header(route)}<main id="main">${body}</main>${footer()}${imageViewer()}${searchDialog(projectDetails.filter(p=>!hiddenReportRepos.has(p.repo)).map(p=>({repo:p.repo,title:p.title,tags:p.technologies,url:'/projects/'+p.repo+'/'})).concat([{repo:'mobile-technical-support-analytics',title:'Mobile Technical Support Analytics',tags:['Power BI','DAX','Customer support'],url:'/dashboards/mobile-technical-support-analytics/'}]))}</body></html>`;const target=route==='/404.html'?path.join(out,'404.html'):path.join(out,route,'index.html');await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,html);if(route!=='/404.html')pages.push(route);}
const home=studioHome(profile,cases,ordered,projectDetails,reports,projectStatus,homeSections,professionalEvidence);
await write('/','Sohila Khaled Abbas | BI Developer | Data Analyst | Analytics Engineer','Sohila Khaled Abbas is a BI Developer and Data Analyst in Damietta, Egypt, open to remote roles. Explore Power BI case studies, SQL, DAX, data modeling, reporting, and analytics engineering work.',home);
await write('/work/','Work & GitHub repositories','Browse Sohila’s public GitHub repositories, detailed project case studies, BI dashboards, data pipelines, and automation workflows.',work());
await write('/dashboards/','Power BI dashboards & report previews','Explore Sohila’s Power BI reports, public interactive dashboards, repository screenshots, and report project files.',dashboardGallery(reports,projectStatus));
for(const report of reports){
 const p=projectDetailsByRepo.get(report.repo)||{repo:report.repo,title:report.title,summary:report.description,technologies:['Power BI'],methods:[],files:[],source:report.source,readme:report.readme,live:null};
 const repo=ordered.find(r=>r.name===report.repo)||{description:report.description};
 const original=reportPage(report,projectStatus),headEnd=original.indexOf('</section>')+10;
 const remaining=original.slice(headEnd),resourcesStart=remaining.indexOf('<section class="wrap page-section report-resources">');
 const experience='<span id="report-preview" class="story-anchor"></span>'+remaining.slice(0,resourcesStart);
 const body=original.slice(0,headEnd)+projectStory(p,repo,byRepo.get(report.repo),report,projectStatus,true,experience)+cta();
 await write(reportRoute(report.repo),report.title+' — Dashboard',report.description,body);
}
await write('/about/','About Sohila | BI Developer | Data Analyst | Analytics Engineer','Sohila Khaled Abbas is a BI Developer and Data Analyst based in Damietta, Egypt, open to remote employee roles. Explore her experience, skills, and BI reporting projects.',about(profile));
await write('/resume/','Resume | Sohila Khaled Abbas','Resume for Sohila Khaled Abbas: BI Developer, Data Analyst, Power BI reporting, SQL, DAX, data modeling, applied analytics experience, education, and technical skills.',resumePage(profile));
await write('/recruiters/','For hiring teams — skills & project evidence','A concise overview of Sohila Khaled Abbas’s BI development experience, reporting projects, analytics engineering work, and remote collaboration details.',recruiterPage(profile,recruiterGuide,projectDetails));
await write('/services/','How I work | Sohila','A structured BI workflow: business question, data review, modeling, Power BI reporting, and team handover for remote roles.',servicesPage(profile));
await write('/contact/','Contact Sohila | Remote Data Analyst & BI Developer Roles','Contact Sohila Khaled Abbas about remote Data Analyst and BI Developer roles, Power BI reporting, SQL, DAX, and analytics engineering.',contact(profile));
for(const project of projectDetails){
 const repo=ordered.find(r=>r.name===project.repo),caseStudy=byRepo.get(project.repo);
 await write('/projects/'+project.repo+'/',project.title,caseStudy?.intro||project.summary,storyPage(project,repo,caseStudy,reportByRepo.get(project.repo),projectStatus,categories,projectDetails,ordered,casesByRepo));
}
await write('/404.html','Page not found','This page could not be found.',`${intro('404 / LET’S FIND YOUR WAY BACK','A missing page.<br><em>A better next step.</em>','That address doesn’t point to a page here. Explore the project collection or head back home.')}<div class="wrap error-actions">${link('/work/','Explore my work','button primary')}${link('/contact/','Contact me')}${link('/','Back to home')}</div>`);
await fs.writeFile(path.join(out,'robots.txt'),'User-agent: *\nAllow: /\n'+(origin?'Sitemap: '+origin+'/sitemap.xml\n':''));
if(origin)await fs.writeFile(path.join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.map(route=>'<url><loc>'+e(origin+route)+'</loc></url>').join('')+'</urlset>');
await fs.writeFile(path.join(out,'site-manifest.json'),JSON.stringify({pages,projectCount:ordered.length,caseStudyCount:Object.keys(cases).length,dashboardCount:reports.length,visualPreviewCount:reports.filter(report=>Array.isArray(report.images)&&report.images.length>0).length,updated:catalog.checked_on},null,2));
console.log(`Built ${pages.length} pages, ${ordered.length} work projects, ${Object.keys(cases).length} case studies, ${reports.length} dashboards, and ${reports.filter(report=>Array.isArray(report.images)&&report.images.length>0).length} visual previews.`);

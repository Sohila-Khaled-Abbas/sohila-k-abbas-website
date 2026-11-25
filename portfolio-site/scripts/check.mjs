import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {category,isClientWorkRepository} from '../src/assets/project-catalog.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist');
const read=async file=>JSON.parse(await fs.readFile(path.join(root,file),'utf8'));
async function walk(folder){
  const entries=await fs.readdir(folder,{withFileTypes:true});
  return (await Promise.all(entries.map(entry=>entry.isDirectory()?walk(path.join(folder,entry.name)):[path.join(folder,entry.name)]))).flat();
}
const [
  catalog,details,casesSource,additionalCases,previewSource,status,profile,evidence,recruiter,policy,config,firebase
]=await Promise.all([
  read('content/repositories.json'),
  read('content/project-details.json'),
  read('content/cases.json'),
  read('content/additional-cases.json'),
  read('content/project-previews.json'),
  read('content/project-status.json'),
  read('content/profile.json'),
  read('content/professional-evidence.json'),
  read('content/recruiter-guide.json'),
  read('content/sync-policy.json'),
  read('vercel.json'),
  read('firebase.json')
]);
const sourceCases={...casesSource,...additionalCases};
const detailsByRepo=new Map(details.projects.map(project=>[project.repo,project]));
const casesByRepo=new Map(Object.values(sourceCases).map(item=>[item.repo,item]));
const workRepositories=catalog.repositories.filter(repository=>
  isClientWorkRepository(repository,detailsByRepo.get(repository.name),casesByRepo.get(repository.name))
);
const workNames=new Set(workRepositories.map(repository=>repository.name));
const workProjects=details.projects.filter(project=>workNames.has(project.repo));
const workCases=Object.values(sourceCases).filter(item=>workNames.has(item.repo));
const hiddenDashboardRepos=new Set(["world-economy-bi-project","O-List-E-Commerce-Data-Analytics","S-OP_Dashboard","marketing_campaigns_analysis","streampulse","pixelfed-analytics-engineering","kickstarter-analytics-engineering","egyptian-cosmetics-market"]);
const hiddenDashboardRecords=previewSource.reports.filter(report=>report.hidden===true);
assert.deepEqual(hiddenDashboardRecords.map(report=>report.repo).sort(),[...hiddenDashboardRepos].sort(),'Only the eight explicitly in-progress dashboard records should be hidden');
assert(hiddenDashboardRecords.every(report=>Array.isArray(report.files)&&report.files.length>0),'Hidden dashboard records must retain their repository files and source links');
const legacyDashboardOnlyRepos=new Set(['mobile-technical-support-analytics']);
const reports=previewSource.reports.filter(report=>!report.hidden&&(workNames.has(report.repo)||legacyDashboardOnlyRepos.has(report.repo)));
assert.equal(reports.length,12,'Only the 12 completed dashboards should remain visible');
const originalCount=workRepositories.filter(repository=>!repository.fork).length;
assert(workRepositories.length>0,'The work-only catalogue must contain projects');
assert.equal(workRepositories.length,originalCount,'Forked resources must not enter the client-work catalogue');
assert(workRepositories.every(repository=>!repository.fork),'Forked resources must be excluded from public client-work listings');
const explicitlyExcludedRepos=['docker-hadoop','enterprise-hr-analytics','sql-server-data-platform'];
assert(explicitlyExcludedRepos.every(repo=>!workNames.has(repo)),'Course, training-lab, and employer/client-delivery repositories must be excluded from Work');
const confirmedForkExclusions=['Machine-Learning-and-Data-Science-Resourses','linux','data-engineering-roadmap','awesome-public-datasets','tidytuesday','AnshLambaYoutube','awesome','awesome-vba','awesome-postgres','awesome-github','AI_tools_nontechnical','awesome-data-engineering','Obsidian-Vault-Roadmap','bootdev','dbt-datacamp-course-note','udemy-networking-fundamentals'];
const unavailableRepositoryExclusions=['n8n-workflows'];
for(const name of [...confirmedForkExclusions,...unavailableRepositoryExclusions])assert.equal(isClientWorkRepository({name,fork:false,description:'Excluded repository'}),false,'A forked or unavailable resource must stay excluded from Work: '+name);
assert([...confirmedForkExclusions,...unavailableRepositoryExclusions].every(name=>!workNames.has(name)),'Forked and unavailable repositories must not be published in Work');
assert.equal(reports.filter(report=>report.live?.access==='public').length,12,'All 12 public Power BI reports must remain available, including the legacy dashboard-only report');
assert(workRepositories.every(repository=>['analytics','engineering','automation','apps'].includes(category(repository))),'Only work-focused categories may be published');
assert.equal(workProjects.length,workRepositories.length,'Every published work repository needs a project detail record');

const files=await walk(out);
const htmlFiles=files.filter(file=>file.endsWith('.html'));
const documents=new Map(await Promise.all(htmlFiles.map(async file=>[file,await fs.readFile(file,'utf8')])));
const manifest=JSON.parse(await fs.readFile(path.join(out,'site-manifest.json'),'utf8'));
assert.equal(manifest.dashboardCount,reports.length,'Generated site manifest must count only visible dashboards');
for(const repo of hiddenDashboardRepos){
  assert(!manifest.pages.includes('/dashboards/'+repo+'/'),'Hidden dashboard route must not enter the generated route manifest: '+repo);
  assert(!documents.has(path.join(out,'dashboards',repo,'index.html')),'Hidden dashboard detail page must not be generated: '+repo);
}
try{
  const sitemap=await fs.readFile(path.join(out,'sitemap.xml'),'utf8');
  for(const repo of hiddenDashboardRepos)assert(!sitemap.includes('/dashboards/'+repo+'/'),'Hidden dashboard route must not enter the sitemap: '+repo);
}catch(error){if(error.code!=='ENOENT')throw error;}

for(const [file,html] of documents){
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(ids.length,new Set(ids).size,'Duplicate id: '+file);
  assert.equal([...html.matchAll(/<h1\b/g)].length,1,'One H1 is required: '+file);
  assert(html.includes('name="description"'),'Missing description: '+file);
  assert(html.includes('family=Cormorant+Garamond'),'Instrument Serif must load on every generated page: '+file);
  for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
    const value=match[1];
    if(/^(https?:|mailto:|tel:|data:)/.test(value))continue;
    const url=new URL(value,'https://local.invalid/'+path.relative(out,file).replaceAll(path.sep,'/'));
    let target=path.join(out,decodeURIComponent(url.pathname));
    try{
      if((await fs.stat(target)).isDirectory())target=path.join(target,'index.html');
      await fs.access(target);
    }catch{
      assert.fail('Broken local link '+value+' in '+file);
    }
    if(url.hash){
      const targetHtml=documents.get(target);
      if(targetHtml)assert(targetHtml.includes('id="'+decodeURIComponent(url.hash.slice(1))+'"'),'Missing anchor '+value+' in '+file);
    }
  }
}
const requiredRoutes=['index.html','work/index.html','dashboards/index.html','about/index.html','resume/index.html','recruiters/index.html','services/index.html','contact/index.html','404.html'];
for(const route of requiredRoutes)assert(documents.has(path.join(out,route)),'Missing required work-focused route: '+route);
const notFoundHtml=documents.get(path.join(out,'404.html'));
assert(notFoundHtml.includes('href="/work/"')&&notFoundHtml.includes('href="/contact/"'),'Custom 404 must link back to Work and Contact.');
for(const route of ['learning/index.html','learn/index.html','posts/index.html','community/index.html','credentials/index.html','templates/index.html']){
  assert(!documents.has(path.join(out,route)),'Retired public route must not be generated: '+route);
}
const allHtml=[...documents.values()];
const retiredLinks=['/learning/','/learn/','/community/','/credentials/','/posts/','/templates/'];
for(const html of allHtml)for(const route of retiredLinks)assert(!html.includes('href="'+route),'Generated pages must not link to retired route '+route);

const work=documents.get(path.join(out,'work/index.html'));
const repoCards=[...work.matchAll(/<article class="repo-card\b[^"]*" data-name="([^"]+)" data-category="([^"]+)"/g)];
assert.equal(repoCards.length,workRepositories.length,'Work page must contain only the filtered client-work catalogue');
assert(repoCards.every(match=>workNames.has(match[1])),'A non-work repository appeared in the Work grid');
assert(repoCards.every(match=>['analytics','engineering','automation','apps'].includes(match[2])),'A retired learning category appeared in the Work grid');
for(const repository of catalog.repositories.filter(item=>!workNames.has(item.name))){
  assert(!work.includes('data-name="'+repository.name+'"'),'A filtered resource appeared in the Work grid: '+repository.name);
}
const featuredRepos=(details.home_sections?.featured||[
  'fmcg-sales-churn-drop-analysis-powerbi',
  'global-horizon-bank-dwh-project',
  'egyptian-cosmetics-market'
]).filter(repo=>workNames.has(repo)).slice(0,3);
const pinnedOrder=[...work.matchAll(/<article class="pinned-case-card studio-project-card[^"]*" data-name="([^"]+)"/g)].map(match=>match[1]);
assert.deepEqual(pinnedOrder,featuredRepos,'Work page must pin the current featured case studies in homepage order');
assert(work.indexOf('work-featured')<work.indexOf('id="repositories"'),'Featured case studies must appear before the searchable project collection');
assert(work.includes('<details class="repo-tools-disclosure" data-repo-tools>'),'The project browser must remain available inside an accessible disclosure');
assert(!/<details class="repo-tools-disclosure" data-repo-tools open>/.test(work),'The project browser must remain collapsed by default');
assert(work.includes('class="repo-tools-count">'+workRepositories.length+' projects</span>'),'Work page project count must be derived from filtered client work');
assert(!work.includes('data-category="learning"'),'Learning is not a public work category');
assert(!work.includes('Power BI diploma'),'The retired diploma card must not return');
assert(!work.includes('Data Tea')&&!work.includes('roadmap'),'Retired learning/community resources must not appear in Work');

const home=documents.get(path.join(out,'index.html'));

// The current Home layout intentionally has no dashboard-count strip; do not add one or alter its copy.
for(const report of hiddenDashboardRecords){
  assert(!home.includes('href="/dashboards/'+report.repo+'/'),'Homepage must not link to a hidden dashboard route: '+report.repo);
  assert(!work.includes('href="/dashboards/'+report.repo+'/'),'Work page must not link to a hidden dashboard route: '+report.repo);
}
assert(home.includes('href="/projects/pixelfed-analytics-engineering/"'),'Preserve PixelFed in the existing homepage Currently Building feature until the owner approves a change');

assert(home.includes('BI Developer &amp; Data Analyst.')&&home.includes('Clearer decisions from data.'),'Homepage must lead with the recruiter-focused BI Developer and Data Analyst proposition.');
assert(home.includes('500K+ order lines')&&home.includes('47K+ orders')&&home.includes('70K+ retailers'),'Homepage must show verified B2B retail proof.');
assert(home.includes('Role focus: BI reporting')&&home.includes('Power BI')&&home.includes('Data modeling'),'Homepage must explain the services recruiters can hire for.');
assert(home.includes('Open to remote roles')&&home.includes('Cairo, Egypt · UTC+2')&&home.includes('ET overlap')&&home.includes('English: Excellent'),'Homepage must show remote availability, Cairo timezone, ET overlap, and English level.');
assert(home.includes('Copy email')&&home.includes('href="/resume/"')&&home.includes('href="mailto:'+profile.email+'"')&&home.includes('Email me')&&home.includes('LinkedIn')&&home.includes('GitHub'),'Homepage must expose resume, direct email, and professional proof links.');
const heroButtonPosition=home.indexOf('class="hero-actions editorial-hero-actions"');
const heroLeadPosition=home.indexOf('class="editorial-hero-lead"');
assert(heroButtonPosition>home.indexOf('id="hero-title"')&&heroLeadPosition>heroButtonPosition,'Resume, case-study, and email buttons must sit directly below the homepage headline and before the intro.');
const homeOrder=['id="hero-title"','id="capabilities"','id="case-studies"','id="approach"','id="experience-summary"','id="home-contact"'].map(marker=>home.indexOf(marker));
assert(homeOrder.every(position=>position>=0)&&homeOrder.every((position,index)=>index===0||homeOrder[index-1]<position),'Homepage must follow identity → disciplines → case studies → approach → experience → contact.');
assert(home.includes('Damietta, Egypt')&&home.includes('Open to remote roles'),'Homepage must identify location and remote availability.');
assert(home.includes('See case studies')&&home.includes('href="/work/#case-studies"'),'Homepage must offer the case-study CTA directly below the headline.');
assert(home.includes('href="/contact/"'),'Homepage must retain a direct Contact route.');
assert(home.includes('View resume')&&home.includes('href="/resume/"'),'Homepage must offer a direct resume button.');
for(const term of ['Power BI','SQL','DAX','data modeling','Power Query','Analytics Engineer'])assert(home.includes(term),'Homepage is missing the verified discipline '+term);
assert(!home.includes('Work with me')&&!home.includes('Fixed quote')&&!home.includes('You send your data or problem.'),'Homepage must not read as a freelance-services funnel.');
assert(!home.includes('Data Tea')&&!home.includes('LEARNING IN PUBLIC')&&!home.includes('roadmap'),'Retired learning/community material must not appear on the homepage.');
assert(!home.includes('class="home-testimonial-card"')&&!home.includes('data-motion-toggle'),'Decorative testimonial counters and obsolete motion controls must not be reintroduced.');
assert(home.includes('Cormorant+Garamond')&&home.includes('DM+Sans'),'Homepage must use the Instrument Serif and DM Sans editorial pairing.');
assert(home.includes('href="/editorial.css"'),'Editorial presentation layer must load.');
const themeBootPosition=home.indexOf('document.documentElement.dataset.theme=');
const firstStylePosition=home.indexOf('rel="stylesheet"');
assert(themeBootPosition>=0&&firstStylePosition>=0&&themeBootPosition<firstStylePosition,'Explicit/system theme must be applied before CSS to prevent flash.');
assert(home.includes('<meta name="theme-color" content="#f7f3ed">'),'Browser chrome must match the restored warm ivory canvas.');
const caseTitles=[
 'B2B Retail Analytics &amp; Churn Diagnostic — Portfolio Scenario',
 'SMART Supply Chain Insights',
 'Wuzzuf Job Market Analysis'
];
for(const title of caseTitles)assert(home.includes(title),'Homepage is missing selected evidence-backed project '+title);
for(const proofText of ['47K+ orders analyzed','65,752 orders analyzed','217 postings; Data Analyst was the most common title'])assert(home.includes(proofText),'Homepage is missing source-backed featured case proof: '+proofText);
assert(home.includes('featured-case-proof')&&work.includes('featured-case-proof'),'Home and Work must both show a question, tool, and result proof line on every featured case study.');
assert(work.includes('/previews/fmcg-portfolio-cover.svg')&&work.includes('fetchpriority="high"'),'Keep the original B2B Retail preview and prioritize its initial load on Work.');
const b2bCoverPath=path.join(out,'previews','fmcg-portfolio-cover.svg');
const b2bCoverArtwork=await fs.readFile(b2bCoverPath,'utf8');
assert(b2bCoverArtwork.includes('<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900"'),'B2B cover must be copied to the exact lowercase /previews path with its intrinsic dimensions.');
const firstPinnedStart=work.indexOf('<article class="pinned-case-card');
const firstPinnedEnd=work.indexOf('</article>',firstPinnedStart);
const firstPinned=work.slice(firstPinnedStart,firstPinnedEnd);
const b2bImage=firstPinned.match(/<img src="\/previews\/fmcg-portfolio-cover\.svg"[^>]+>/)?.[0]||'';
assert(b2bImage.includes('width="1440"')&&b2bImage.includes('height="900"')&&b2bImage.includes('loading="eager"')&&b2bImage.includes('fetchpriority="high"'),'First B2B Work card must reserve the correct image size and prioritize the committed preview.');
assert(!home.includes('Maxab distribution network')&&!home.includes('Real-time insights into retailer behavior'),'B2B scenario must not imply a Maxab engagement.');

const styles=await fs.readFile(path.join(out,'enhancements.css'),'utf8');
const studioStyles=await fs.readFile(path.join(out,'studio.css'),'utf8');
const redesignStyles=await fs.readFile(path.join(out,'redesign.css'),'utf8');
assert(styles.includes('prefers-reduced-motion:reduce'),'Motion preference support is required');
assert(redesignStyles.includes('prefers-reduced-motion:reduce'),'The redesign must respect reduced-motion settings');
assert(!/\.studio-project-card \.project-card-description\{[^}]*-webkit-line-clamp/.test(studioStyles),'Project card descriptions must not be clipped');

const serviceHtml=documents.get(path.join(out,'services/index.html'));
assert(serviceHtml.includes('<h1>How I work</h1>'),'Services route must be retitled How I work.');
for(const marker of ['01 / BUSINESS QUESTION','02 / DATA REVIEW','03 / MODEL & METRICS','04 / REPORT','05 / HANDOVER'])assert(serviceHtml.includes(marker),'How I work is missing process stage: '+marker);
assert(serviceHtml.includes('href="mailto:'+profile.email+'"')&&serviceHtml.includes('Email me'),'How I work must offer direct email contact.');
assert(serviceHtml.includes('id="business-inquiry"'),'Preserve the existing business-inquiry anchor as a simple contact destination.');
assert(serviceHtml.includes('id="simple-project-inquiry" class="public-project-inquiry-form" method="post" action="/services/"'),'How I work must retain the original public inquiry form and POST action.');
assert(serviceHtml.includes('id="project-brief" class="business-inquiry-form" method="post" action="/services/"'),'How I work must retain the protected inquiry form and POST action.');
assert(serviceHtml.includes('<option value="Not sure yet" selected>Not sure yet</option>'),'Keep the existing budget field valid for the backend while its pricing UI is hidden.');
const howIWorkCss=await fs.readFile(path.join(root,'src/assets/editorial.css'),'utf8');
assert(howIWorkCss.includes('.how-i-work-inquiry .public-inquiry-layout .inquiry-field:has(#simple-inquiry-budget){display:none!important}'),'Hide only the visible EGP budget field on How I work; preserve its form and backend markup.');
const inquiryTemplate=await fs.readFile(path.join(root,'scripts/business-inquiry-template.mjs'),'utf8');
assert(inquiryTemplate.includes('id="simple-project-inquiry"')&&inquiryTemplate.includes('id="project-brief"'),'Keep existing public and invitation-only form templates in the codebase.');
const contactHtml=documents.get(path.join(out,'contact/index.html'));
assert(contactHtml.includes('CONTACT / REMOTE ROLE OPPORTUNITIES')&&contactHtml.includes('href="/resume/"'),'Contact page must prioritize recruiter conversations and the resume.');
assert(contactHtml.includes('href="/contact/#simple-project-inquiry"')&&contactHtml.includes('Email about a role or project'),'Contact page must direct role inquiries to the real Contact form anchor.');
for(const html of documents.values())assert(!html.includes('href="/services/#business-inquiry"'),'Generated pages must not link to the removed Services inquiry anchor.');
for(const html of documents.values())assert(!/href="\/services\/#service-\d+"/.test(html),'Generated pages must not link to retired service-card anchors.');
assert(contactHtml.includes('id="simple-project-inquiry" class="public-project-inquiry-form" method="post" action="/contact/"'),'Keep the working public contact form on the Contact page.');

const inquiryScript=await fs.readFile(path.join(root,'src/assets/business-inquiry.mjs'),'utf8');
const leadRoute=await fs.readFile(path.join(root,'api/lead.mjs'),'utf8');
const leadHandler=await fs.readFile(path.join(root,'server/lead.mjs'),'utf8');
assert(inquiryScript.includes("fetch('/api/lead'"),'The public project form must submit through /api/lead');
assert(leadRoute.includes('handleLead'),'The /api/lead route must invoke the server handler');
assert(leadHandler.includes('LEAD_WEBHOOK_URL')&&leadHandler.includes('LEAD_WEBHOOK_SECRET'),'The lead handler must retain its protected webhook environment variables');
assert(config.functions?.['api/lead.mjs']?.maxDuration,'Vercel must configure the protected lead endpoint');
assert(config.outputDirectory==='dist'&&firebase.hosting.public==='dist','Both hosting configurations must publish the static build');
const redirects=new Map((config.redirects||[]).map(item=>[item.source,item]));
for(const route of ['/learning','/learning/:path*','/community','/community/:path*','/credentials','/credentials/:path*','/posts','/posts/:path*','/templates','/templates/:path*']){
  const redirect=redirects.get(route);
  assert(redirect&&redirect.destination==='/work/'&&redirect.permanent===true,'Retired URL must permanently redirect to Work: '+route);
}
for(const repo of ['docker-hadoop','enterprise-hr-analytics','sql-server-data-platform','MaxAB_B2B_Retail_Wallet_Optimization','maxab-b2b-retail-wallet-optimization'])for(const suffix of ['', '/', '/:path*']){
  const route='/projects/'+repo+suffix;
  const redirect=redirects.get(route);
  assert(redirect&&redirect.destination==='/work/'&&redirect.statusCode===301,'Removed project URL must permanently redirect to Work: '+route);
}
assert([...documents.values()].every(html=>!html.includes('href="tel:')),'Do not expose personal telephone links');

assert.equal(new Set(reports.map(report=>report.repo)).size,reports.length,'Duplicate report projects');
for(const report of reports){
  assert(workNames.has(report.repo)||legacyDashboardOnlyRepos.has(report.repo),'A retired resource has a dashboard page: '+report.repo);
  if(legacyDashboardOnlyRepos.has(report.repo))assert.equal(report.source_kind,'legacy-portfolio','Dashboard-only report must remain an owner-maintained legacy asset');
  const html=documents.get(path.join(out,'dashboards',report.repo,'index.html'));
  assert(html,'Missing permanent report page: '+report.repo);
  assert(!/<iframe\b/.test(html),'Reports must not load third parties before visitor interaction');
  assert.equal(html.includes('data-load-report='),report.live?.access==='public','Only public reports may be embedded');
  if(report.live){
    const url=new URL(report.live.url);
    assert.equal(url.origin,'https://app.powerbi.com');
    assert.equal(url.pathname.startsWith('/view'),report.live.access==='public');
  }
  for(const file of report.files)assert(file.url.startsWith(report.source+'/blob/'),'Report file must belong to its repository');
  for(const image of report.images){
    assert(image.alt&&image.caption);
    await fs.access(path.join(out,image.src));
  }
}
for(const repo of Object.keys(status))assert(workNames.has(repo),'In-progress status belongs to a filtered resource: '+repo);
assert.equal([...work.matchAll(/data-status="progress"/g)].length,Object.keys(status).filter(repo=>workNames.has(repo)).length,'In-progress labels must use explicit editorial status');

const featuredOutcomeCopy={
 'fmcg-sales-churn-drop-analysis-powerbi':'A portfolio scenario for examining retailer retention, delivery performance, sales movement, and category mix.',
 'SMART-Supply-Chain-Insights-Dashboard':'A structured view of order fulfillment, customer and market patterns, product profitability, and shipping operations.',
 'Wuzzuf-Job-Market-Analysis':'Explores role demand, requested skills, hiring locations, company activity, and limits in the available salary data.'
};
for(const [repo,copy] of Object.entries(featuredOutcomeCopy)){
  const project=workProjects.find(item=>item.repo===repo);
  assert(project,'Missing featured project: '+repo);
  assert.equal(project.decision_support,copy,'Keep the approved evidence-led decision-support copy: '+repo);
  assert(work.includes(project.title.replaceAll('&','&amp;')),'Work page must include the featured project title: '+repo);
}
const featuredPositions=Object.keys(featuredOutcomeCopy).map(repo=>home.indexOf('data-featured-case="'+repo+'"'));
assert(featuredPositions.every(position=>position>=0)&&featuredPositions[0]<featuredPositions[1]&&featuredPositions[1]<featuredPositions[2],'Keep the requested homepage featured-card order.');
assert(work.indexOf('work-featured')<work.indexOf('id="repositories"'),'Featured case studies must precede the full project collection.');

const b2bRepo='fmcg-sales-churn-drop-analysis-powerbi';
const b2bProject=workProjects.find(project=>project.repo===b2bRepo);
const b2bReport=reports.find(report=>report.repo===b2bRepo);
const b2bCase=workCases.find(item=>item.repo===b2bRepo);
const b2bHtml=documents.get(path.join(out,'projects',b2bRepo,'index.html'));
assert(b2bProject&&b2bProject.title.includes('Portfolio Scenario'),'B2B project title must clearly identify the portfolio scenario.');
assert(b2bReport&&b2bReport.title.includes('Portfolio Scenario'),'B2B report title must clearly identify the portfolio scenario.');
assert(b2bCase&&b2bCase.caveat.includes('not a client engagement'),'B2B case-study limitations must state that no client engagement is claimed.');
assert(b2bHtml.includes('Portfolio Scenario'),'B2B project page must display the scenario label.');
assert(b2bHtml.includes('DATASET &amp; PROVENANCE')&&b2bHtml.includes('MY CONTRIBUTION')&&b2bHtml.includes('MODEL &amp; MEASURES')&&b2bHtml.includes('FINDINGS / INTERPRETATION'),'Case study must present supported provenance, contribution, model, and findings sections.');
assert(!b2bHtml.includes('Maxab distribution network')&&!b2bHtml.includes('Real-time insights into retailer behavior'),'B2B project page must not imply Maxab employment or a client engagement.');
assert(!b2bHtml.includes('OUTCOME</span>'),'B2B portfolio scenario must not imply a measured business outcome.');
assert(b2bHtml.includes('Copy page link')&&b2bHtml.includes('button-secondary')&&b2bHtml.includes('data-copy-page'),'Copy page action must be styled as a secondary button.');
const wuzzufHtml=documents.get(path.join(out,'projects','Wuzzuf-Job-Market-Analysis','index.html'));
assert(wuzzufHtml&&wuzzufHtml.includes('217 Wuzzuf job postings')&&wuzzufHtml.includes('January–March 2025'),'Wuzzuf story must preserve its source sample and collection period.');
assert(wuzzufHtml.includes('Salary data is incomplete'),'Wuzzuf story must state its salary-data limitation.');
const resumeHtml=documents.get(path.join(out,'resume/index.html'));
assert(resumeHtml&&resumeHtml.includes('Print / save as PDF'),'Public resume route must offer browser print/save.');
assert(resumeHtml.includes(profile.email)&&resumeHtml.includes(profile.linkedin)&&resumeHtml.includes(profile.github),'Resume must retain approved professional contact links.');
assert(resumeHtml.includes('Open to remote employee roles'),'Resume must indicate target work arrangement.');
const dashboardHtml=documents.get(path.join(out,'dashboards/index.html'));
assert(dashboardHtml.includes(reports.length+' reporting projects'),'Dashboard gallery count must match the visible report set');
for(const report of hiddenDashboardRecords)assert(!dashboardHtml.includes(report.title),'Hidden project must not appear in the dashboard gallery or global search: '+report.repo);
assert(dashboardHtml.includes('dashboard-preview-figure')&&dashboardHtml.includes('data-lightbox'),'Dashboard gallery must have captions and full-size, accessible preview links.');
assert(dashboardHtml.includes('Saved report view'),'Dashboard preview must distinguish a screenshot from a live report.');
assert(dashboardHtml.includes('Interactive public reports load only when requested'),'Dashboard gallery must explain click-to-load report behavior.');
const dashboardCoverTags=[...dashboardHtml.matchAll(/<a class="dashboard-cover"[^>]*>[\s\S]*?<img[^>]+>/g)].map(match=>match[0]);
assert(dashboardCoverTags.length>=2,'Dashboard gallery must keep its existing first-row report previews.');
for(const imageTag of dashboardCoverTags.slice(0,2)){
  assert(imageTag.includes('loading="eager"')&&imageTag.includes('fetchpriority="high"'),'The first Dashboard row must eagerly load its existing preview images.');
  assert(imageTag.includes('width="')&&imageTag.includes('height="'),'Dashboard card previews must reserve their layout dimensions.');
}
for(const imageTag of dashboardCoverTags.slice(2))assert(imageTag.includes('loading="lazy"')&&imageTag.includes('width="')&&imageTag.includes('height="'),'Below-the-fold Dashboard previews must remain lazy while reserving their dimensions.');

const aboutHtml=documents.get(path.join(out,'about/index.html'));
for(const report of hiddenDashboardRecords)assert(!aboutHtml.includes('href="/dashboards/'+report.repo+'/'),'About page must not link to hidden dashboard route: '+report.repo);
assert(!aboutHtml.includes('20 reports')&&!aboutHtml.includes('20 dashboards'),'About page must not retain an outdated dashboard total');

assert(aboutHtml.includes(profile.headline.replaceAll('&','&amp;')),'About must show the owner’s current professional headline');
assert.equal(policy.automatic_experience_import,false,'Experience changes require owner confirmation');
assert.equal(createHash('sha256').update(JSON.stringify(profile.experience)).digest('hex'),policy.experience_sha256,'Owner-selected experience changed without an approved revision');

for(const lane of recruiter.lanes)for(const repo of lane.projects)if(workNames.has(repo))assert(workNames.has(repo),'Recruiter evidence must use client-work repositories');
for(const [file,html] of documents){
  for(const match of html.matchAll(/\b(?:href|src)="(https?:[^\"]+)"/g)){
    assert(!policy.excluded_public_link_hosts.includes(new URL(match[1]).hostname),'Excluded community link appeared: '+file);
  }
}
for(const project of workProjects){
  const html=documents.get(path.join(out,'projects',project.repo,'index.html'));
  assert(html,'Missing project preview page: '+project.repo);
  assert(html.includes('<h1>'+project.title.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')+'</h1>'),'Project heading must use its canonical title: '+project.repo);
  assert(!/^(?:Windows:|Edit \.env|\d+\. Clone repo)/i.test(project.title),'A setup instruction was imported as a project title');
  assert.equal([...html.matchAll(/data-story-panel="/g)].length,4,'Every work project needs four story chapters');
  assert(!/<iframe\b/.test(html),'Project stories must not load external embeds automatically');
  for(const file of project.files)assert(html.includes(file.url.replaceAll('&','&amp;')),'Story lost a source file: '+project.repo);
}
for(const report of reports){
  const html=documents.get(path.join(out,'dashboards',report.repo,'index.html'));
  assert.equal([...html.matchAll(/data-story-panel="/g)].length,4,'Every report needs the guided story');
}
assert.equal(workProjects.find(project=>project.repo==='kickstarter-analytics-engineering')?.title,'Kickstarter Analytics Engineering Platform');
assert(work.includes('Kickstarter Analytics Engineering Platform'));
const contactInquiryHtml=documents.get(path.join(out,'contact/index.html'));
assert(/<form[^>]*id="simple-project-inquiry"[^>]*novalidate/.test(contactInquiryHtml),'Contact form must route invalid data through the inline validator.');
for(const field of ['name','email','description','budgetRange'])assert(contactInquiryHtml.includes('id="simple-inquiry-'+field+'-error"'),'Contact field is missing its inline error target: '+field);
const paletteLiterals=new Set(["#000","#00000008","#0002","#0004","#0005","#0006","#050811","#111","#160d0a28","#160d0a40","#160d0a55","#160d0a66","#181415","#211814d9","#211916","#211a1d","#211b1d","#222","#231914","#24181d","#241b169c","#251a14cc","#261713d9","#26191d","#261d18","#261f1b","#271c16","#291a2014","#291a2020","#291e19","#2a211d","#2a2225","#2b2420","#2c231f","#2d1b23","#30252a","#302824","#333","#342724","#362d29","#372c2714","#372d28","#382724","#3827240a","#3827240b","#382724ed","#382a2f","#382a30","#382b31","#382f2a","#38312e","#392c25","#392c2510","#392c2512","#392c25eb","#392e29","#392f2a","#3a2a2222","#3b302b","#3b3128","#3c222a","#3c332f","#3e332e","#403530","#403733","#41342e","#413a37","#42312920","#42372e","#423b24","#43383b","#443731","#444","#463d38","#463d39","#48403c","#49353b","#4b3630","#4b3b35","#4b3d36","#4c403a","#4e4536","#4f413a","#514044","#51452c","#514844","#524741","#533c33","#544239","#554a45","#563d47","#574137","#59463d12","#5a5337","#5b4f49","#5b5031","#5e3a2a","#60454e","#614e45","#625047","#634f3d","#644b37","#647066","#654f44","#655046","#665146","#665d42","#687b78","#69594c08","#69594c09","#6a5b4f","#6c4841","#6c5d5a","#70563e","#70675f","#713549","#743348","#74635b","#756558","#756c65","#7951430a","#795513","#7a65411c","#7b6a5c","#7c7066","#7e68560a","#7e6a5a","#7e7772","#7f78724a","#80653a","#827870","#837064","#837a73","#857c74","#887a6e","#887c73","#897c71","#8a7564","#8a7a6c","#8b2e3f","#8b6f5c","#8b7f76","#8b8077","#8d5d6d","#8d8075","#8d8455","#8e4b61","#94867b","#958272","#95887d","#958a81","#988f87","#9a8d82","#9a907a","#9b907b","#9c604f","#9d8877","#9d8d6c","#9e8f82","#a08352","#a26745","#a29a94","#a4978d","#a56e50","#a57070","#a6938330","#a693833b","#a79b91","#a79d95","#a89687","#a89a8f","#a99b6c","#ab9d92","#ab9e93","#ac9a8b","#ac9a8b1c","#ac9a8c","#ad6f61","#ada6a0","#b3aba5","#b4a294","#b4a9a0","#b5863c","#b6a394","#b6ada55c","#b77e6c","#b78b7e18","#b78e7c","#b7aba1","#b89479","#bbada2","#bbaea3","#bbb6b2","#bca9a5","#bdafa4","#be7f6e","#bea48b66","#beb2a945","#bfa58b","#bfb7b0","#c09e94","#c1b4a9","#c1bcb8","#c2b5aa","#c39a7930","#c39a793b","#c4705a","#c4a084","#c5a18f","#c6aa67","#c7beb6","#c8c2be","#c9a84c","#c9b7b2","#c9bcb1","#c9c1ba","#cba88a05","#cba88a08","#cba88a20","#cbbda4","#ccc1b8","#ccc3bb","#cdbbb0","#cfb4ad","#cfc1b6","#d1ad8e55","#d1c4b9","#d2c7be","#d2cac4","#d4cec9","#d5b69f","#d6cdc60a","#d6cfc9","#d7c6b8","#d7c6be","#d7cbc1","#d7d0ca","#d8a38c","#d8b1bc","#d9b3bf","#d9c5aa","#d9c9bd","#d9d0c9","#dbc5b5","#dcd3cb","#dcd8d4","#ddd","#ddd4cd0d","#ddd9d6","#ded6d0","#dfcfc2","#dfd9d5","#e0cfb9","#e0d7c7","#e0d7cf","#e0d8d2","#e0d9d3","#e1bdca","#e1d5d0","#e1d7ce","#e2dcd7","#e3ded9","#e6c98e","#e6cc99","#e6dfd9","#e6e0db","#e6e1dc","#e6e2df","#e6e3e1","#e7e3df","#e8d7ac","#e8d7d1","#e8e1dc","#e8e2de","#e9cc86","#e9ded6","#e9e0da","#e9e1d4","#e9e6d9","#ead6c80c","#ead6dc","#ead9ca","#eadde0","#eadfd7","#eae6e3","#eae7e4","#ebe6e1","#ebe6e2","#ece1c6","#ece1ca","#ece6e2","#ece8d9","#ede3d8","#ede7e2","#ede8d6","#edeae7","#eee4dc","#eee5d7","#eee9e4","#eeeae7","#eeebdf","#efe2df","#efe7de","#efebe7","#f0d6b4","#f0d9c70d","#f0efe7","#f1e1d3","#f2b7bf","#f2ede8","#f2efed","#f4efeb","#f4f2f1","#f4f3e9","#f5eee8","#f6efe9","#f6f3e7","#f6f4eb","#f7edcf","#f7f3ed","#f7f6ed","#f8f0e7","#f8f3e8","#f8f4f1","#f8f7ed","#f8f7ef","#f8f7f2","#f9f7ec","#f9f7edee","#f9f8f4","#f9f8f7","#faf2e9","#fcf6f1","#fcf9f0","#fff","#fff8f0f2","#fff8f1","#fff9f5","#fffaf4","#fffdf9","#fffef9","#fffef9f0"]);
for(const cssFile of files.filter(file=>file.endsWith('.css'))){
 const css=await fs.readFile(cssFile,'utf8');
 for(const match of css.matchAll(/#[0-9a-f]{3,8}\b/gi))assert(paletteLiterals.has(match[0].toLowerCase()),'Off-palette CSS literal '+match[0]+' found in '+cssFile);
}
const paletteTheme=await fs.readFile(path.join(out,'theme.css'),'utf8');
assert(paletteTheme.includes('--bg:#f7f3ed')&&paletteTheme.includes('--brand:#713549')&&paletteTheme.includes('--accent:#b78e7c')&&paletteTheme.includes('--display:"Cormorant Garamond"'),'The restored warm ivory and burgundy palette must remain the source of theme colors.');
assert(paletteTheme.includes('--display:"Cormorant Garamond"'),'Cormorant Garamond must remain the site display font.');

const brandArtworkFiles=[
 path.join(root,'src/assets/favicon.svg'),
 path.join(root,'src/assets/social-card.svg'),
 path.join(root,'src/assets/previews/fmcg-portfolio-cover.svg'),
 path.resolve(root,'../public/favicon.svg')
];
for(const artworkFile of brandArtworkFiles){
 const artwork=await fs.readFile(artworkFile,'utf8');
 for(const match of artwork.matchAll(/#[0-9a-f]{3,8}\b/gi))assert(paletteLiterals.has(match[0].toLowerCase()),'Off-palette brand artwork color '+match[0]+' found in '+artworkFile);
}

const socialCard=await fs.readFile(path.join(out,'social-card.png'));
assert.equal(socialCard.subarray(0,8).toString('hex'),'89504e470d0a1a0a','Social sharing image must be a PNG.');
assert.equal(socialCard.readUInt32BE(16),1200,'Social image width must be 1200px.');
assert.equal(socialCard.readUInt32BE(20),630,'Social image height must be 630px.');
for(const [file,html] of documents){
  assert(html.includes('/social-card.png'),'Generated page must reference the PNG social image: '+file);
  assert(html.includes('<meta property="og:image:type" content="image/png">'),'Generated page must declare PNG image type: '+file);
  assert(html.includes('<meta property="og:image:width" content="1200">')&&html.includes('<meta property="og:image:height" content="630">'),'Generated page must declare 1200x630 social image size: '+file);
}

console.log('PASS: '+htmlFiles.length+' generated HTML documents, valid local links and anchors, and the work-only route set.');
console.log('PASS: '+workRepositories.length+' original client-work projects, '+workCases.length+' relevant case studies, '+reports.length+' dashboards, and no learning/community resources.');
console.log('PASS: lead API, protected webhook configuration, inquiry forms, redirects, recommendation evidence, project stories, and reduced-motion support.');

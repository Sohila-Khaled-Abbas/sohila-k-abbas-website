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
const reports=previewSource.reports.filter(report=>workNames.has(report.repo));
const originalCount=workRepositories.filter(repository=>!repository.fork).length;
assert(workRepositories.length>0,'The work-only catalogue must contain projects');
assert.equal(workRepositories.length,originalCount,'Forked resources must not enter the client-work catalogue');
assert(workRepositories.every(repository=>!repository.fork),'Forked resources must be excluded from public client-work listings');
assert(workRepositories.every(repository=>['analytics','engineering','automation','apps'].includes(category(repository))),'Only work-focused categories may be published');
assert.equal(workProjects.length,workRepositories.length,'Every published work repository needs a project detail record');

const files=await walk(out);
const htmlFiles=files.filter(file=>file.endsWith('.html'));
const documents=new Map(await Promise.all(htmlFiles.map(async file=>[file,await fs.readFile(file,'utf8')])));
for(const [file,html] of documents){
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(ids.length,new Set(ids).size,'Duplicate id: '+file);
  assert.equal([...html.matchAll(/<h1\b/g)].length,1,'One H1 is required: '+file);
  assert(html.includes('name="description"'),'Missing description: '+file);
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
const requiredRoutes=['index.html','work/index.html','dashboards/index.html','about/index.html','recruiters/index.html','services/index.html','contact/index.html','404.html'];
for(const route of requiredRoutes)assert(documents.has(path.join(out,route)),'Missing required work-focused route: '+route);
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
assert(work.includes(workRepositories.length+'</strong> projects'),'Work page project count must be derived from filtered client work');
assert(!work.includes('data-category="learning"'),'Learning is not a public work category');
assert(!work.includes('Power BI diploma'),'The retired diploma card must not return');
assert(!work.includes('Data Tea')&&!work.includes('roadmap'),'Retired learning/community resources must not appear in Work');

const home=documents.get(path.join(out,'index.html'));
assert(home.includes('Good data.')&&home.includes('Better <em>decisions.</em>'),'Keep the approved homepage headline');
const homeOrder=['id="hero-title"','home-proof-band','home-featured-work','id="home-process-title"','id="client-notes-title"','id="home-contact"'].map(marker=>home.indexOf(marker));
assert(homeOrder.every(position=>position>=0)&&homeOrder.every((position,index)=>index===0||homeOrder[index-1]<position),'Homepage must follow hero → proof → featured work → process → recommendations → contact');
assert(!home.includes('THE DATA TEA')&&!home.includes('Data Tea')&&!home.includes('LEARNING IN PUBLIC'),'Retired homepage sections must not return');
assert(!home.includes('Learning & resources')&&!home.includes('learning roadmap')&&!home.includes('roadmap'),'Retired learning copy must not appear on the homepage');
assert(home.includes('Power BI dashboards and reporting for growing businesses, from messy data to decisions you can defend.'),'Homepage hero must state the Power BI offer and audience');
assert(home.includes('Data Analyst')&&home.includes('Analytics Engineer')&&home.includes('hero-discipline-line'),'Secondary disciplines must remain beneath the BI offer');
const clientRecommendations=evidence.recommendations.filter(item=>/client recommendation/i.test(item.context||''));
assert.equal([...home.matchAll(/class="home-testimonial-card"/g)].length,clientRecommendations.length,'Show the published client recommendations only');
for(const item of clientRecommendations){
  assert(item.author&&item.quote&&item.published_on&&item.summary&&item.profile,'A client recommendation is missing attribution or context');
  assert(home.includes(item.author)&&home.includes(item.quote)&&home.includes(item.profile)&&home.includes(item.summary),'Homepage recommendation must retain the approved source excerpt: '+item.author);
  assert.equal(new URL(item.profile).hostname,'www.linkedin.com');
}
assert(!home.includes('COMMUNITY RECOMMENDATION')&&!home.includes('/community/'),'Community recommendations must not be promoted as client evidence');
assert(home.includes('You send your data or problem.')&&home.includes('I scope it and give a fixed quote.')&&home.includes('You get a dashboard or report you can defend.'),'Show the agreed three-step project process');
assert(home.includes('Pricing follows the scope.')&&home.includes('A fixed quote comes after reviewing your data, deliverables, and timeline.'),'Describe scope-based pricing without inventing a starting rate');
assert(!home.includes('[Add an approved quote')&&!home.includes('[Client name]')&&!home.includes('$X')&&!home.includes('REPLACE X BEFORE PUBLICATION'),'Remove visible testimonial and price placeholders');
assert(home.includes('FEATURED WORK / SMART SUPPLY CHAIN')&&home.includes('/projects/SMART-Supply-Chain-Insights-Dashboard/')&&!home.includes('IN THE STUDIO / PIXELFED'),'Keep the approved completed project in the hero card');
assert(home.includes('data-motion-toggle'),'Keep the existing pause-animation control');
assert(home.includes('class="button primary" href="/services/">Work with me'),'The homepage hero must prioritize the services inquiry');
assert(home.includes('fonts.googleapis.com/css2?family=Instrument+Serif')&&home.includes('family=Inter'),'Keep the existing approved font system');
assert(home.includes('href="/redesign.css"'),'The existing visual layer must continue to load');
assert(home.includes('<meta name="theme-color" content="#faf6ef">'),'Initial browser chrome must match the current warm canvas');

const styles=await fs.readFile(path.join(out,'enhancements.css'),'utf8');
const studioStyles=await fs.readFile(path.join(out,'studio.css'),'utf8');
const redesignStyles=await fs.readFile(path.join(out,'redesign.css'),'utf8');
assert(styles.includes('prefers-reduced-motion:reduce'),'Motion preference support is required');
assert(redesignStyles.includes('prefers-reduced-motion:reduce'),'The redesign must respect reduced-motion settings');
assert(!/\.studio-project-card \.project-card-description\{[^}]*-webkit-line-clamp/.test(studioStyles),'Project card descriptions must not be clipped');

const serviceHtml=documents.get(path.join(out,'services/index.html'));
assert(serviceHtml.includes('id="simple-project-inquiry" class="public-project-inquiry-form" method="post" action="/services/"'),'Public inquiry form must retain the POST fallback');
assert(serviceHtml.includes('id="project-brief" class="business-inquiry-form" method="post" action="/services/" hidden'),'Verified enterprise inquiry form must retain its POST fallback');
assert(serviceHtml.indexOf('Power BI dashboards')<serviceHtml.indexOf('ALSO AVAILABLE'),'Power BI reporting must lead the Services page');
assert(serviceHtml.includes('href="#simple-project-inquiry"')&&serviceHtml.includes('Start a project'),'Services page must offer a clear project-inquiry action');
for(const id of ['service-0','service-1','service-2'])assert(serviceHtml.includes('id="'+id+'"'),'A work-focused service section was removed: '+id);
assert(serviceHtml.indexOf('ALSO AVAILABLE')<serviceHtml.indexOf('Data engineering'),'Data engineering must remain a supporting service');
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
assert([...documents.values()].every(html=>!html.includes('href="tel:')),'Do not expose personal telephone links');

assert.equal(new Set(reports.map(report=>report.repo)).size,reports.length,'Duplicate report projects');
for(const report of reports){
  assert(workNames.has(report.repo),'A retired resource has a dashboard page: '+report.repo);
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
  'fmcg-sales-churn-drop-analysis-powerbi':'Helps a sales manager spot retailers showing early churn signals and prioritize follow-up.',
  'global-horizon-bank-dwh-project':'Helps bank managers compare transaction activity, account balances, and loan exposure across branches.',
  'egyptian-cosmetics-market':'Helps commercial teams compare product performance, sales trends, and inventory health across channels.'
};
for(const [repo,copy] of Object.entries(featuredOutcomeCopy)){
  const project=workProjects.find(item=>item.repo===repo);
  assert(project,'Missing featured project: '+repo);
  assert.equal(project.decision_support,copy,'Keep the approved decision-support copy: '+repo);
  assert(copy.startsWith('Helps ')&&copy.trim().split(/\s+/).length<=20,'Featured outcome must start with Helps and stay within 20 words: '+repo);
  assert(home.includes('<p class="project-card-outcome">'+copy+'</p>'),'Homepage must show the approved decision-support copy: '+repo);
}
const featuredPositions=Object.keys(featuredOutcomeCopy).map(repo=>home.indexOf('data-name="'+repo+'"'));
assert(featuredPositions.every(position=>position>=0)&&featuredPositions[0]<featuredPositions[1]&&featuredPositions[1]<featuredPositions[2],'Keep the requested featured-card order');
assert.equal(workProjects.find(project=>project.repo==='global-horizon-bank-dwh-project').summary,'Turns transactional banking data into a dimensional warehouse. Its interactive app explores transactions, account balances, active accounts, and loan portfolios.','Global Horizon Bank card copy must stay at two complete sentences');

const aboutHtml=documents.get(path.join(out,'about/index.html'));
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
await fs.access(path.join(out,'social-card.png'));

console.log('PASS: '+htmlFiles.length+' generated HTML documents, valid local links and anchors, and the work-only route set.');
console.log('PASS: '+workRepositories.length+' original client-work projects, '+workCases.length+' relevant case studies, '+reports.length+' dashboards, and no learning/community resources.');
console.log('PASS: lead API, protected webhook configuration, inquiry forms, redirects, recommendation evidence, project stories, and reduced-motion support.');

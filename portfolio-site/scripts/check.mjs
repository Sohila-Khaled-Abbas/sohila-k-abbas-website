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
const legacyDashboardOnlyRepos=new Set(['mobile-technical-support-analytics']);
const reports=previewSource.reports.filter(report=>workNames.has(report.repo)||legacyDashboardOnlyRepos.has(report.repo));
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
for(const [file,html] of documents){
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(ids.length,new Set(ids).size,'Duplicate id: '+file);
  assert.equal([...html.matchAll(/<h1\b/g)].length,1,'One H1 is required: '+file);
  assert(html.includes('name="description"'),'Missing description: '+file);
  assert(html.includes('family=Instrument+Serif'),'Instrument Serif must load on every generated page: '+file);
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
assert(home.includes('BI Developer &amp; Data Analyst.')&&home.includes('Clearer decisions from data.'),'Homepage must lead with the recruiter-focused BI Developer and Data Analyst proposition.');
assert(home.includes('500K+ order lines')&&home.includes('47K+ orders')&&home.includes('70K+ retailers'),'Homepage must show verified B2B retail proof.');
assert(home.includes('Hire me for: BI reporting')&&home.includes('Power BI')&&home.includes('Data modeling'),'Homepage must explain the services recruiters can hire for.');
assert(home.includes('Open to remote roles')&&home.includes('Cairo, Egypt · UTC+2')&&home.includes('English: Excellent'),'Homepage must show remote availability, Cairo timezone, and English level.');
assert(home.includes('Copy email')&&home.includes('href="/resume/"')&&home.includes('LinkedIn')&&home.includes('GitHub'),'Homepage must expose direct contact and professional proof links.');
const homeOrder=['id="hero-title"','id="capabilities"','id="case-studies"','id="approach"','id="experience-summary"','id="home-contact"'].map(marker=>home.indexOf(marker));
assert(homeOrder.every(position=>position>=0)&&homeOrder.every((position,index)=>index===0||homeOrder[index-1]<position),'Homepage must follow identity → disciplines → case studies → approach → experience → contact.');
assert(home.includes('Damietta, Egypt')&&home.includes('Open to remote roles'),'Homepage must identify location and remote availability.');
assert(home.includes('View case studies')&&home.includes('href="/work/#case-studies"'),'Homepage must offer the primary case-study CTA.');
assert(home.includes('Contact me')&&home.includes('href="/contact/"'),'Homepage must offer the primary contact CTA.');
assert(home.includes('View CV')&&home.includes('href="/resume/"'),'Homepage must offer a direct CV link.');
for(const term of ['Power BI','SQL','DAX','data modeling','Power Query','Analytics Engineer'])assert(home.includes(term),'Homepage is missing the verified discipline '+term);
assert(!home.includes('Work with me')&&!home.includes('Fixed quote')&&!home.includes('You send your data or problem.'),'Homepage must not read as a freelance-services funnel.');
assert(!home.includes('Data Tea')&&!home.includes('LEARNING IN PUBLIC')&&!home.includes('roadmap'),'Retired learning/community material must not appear on the homepage.');
assert(!home.includes('class="home-testimonial-card"')&&!home.includes('data-motion-toggle'),'Decorative testimonial counters and obsolete motion controls must not be reintroduced.');
assert(home.includes('Instrument+Serif')&&home.includes('DM+Sans'),'Homepage must use the Instrument Serif and DM Sans editorial pairing.');
assert(home.includes('href="/editorial.css"'),'Editorial presentation layer must load.');
const themeBootPosition=home.indexOf('document.documentElement.dataset.theme=');
const firstStylePosition=home.indexOf('rel="stylesheet"');
assert(themeBootPosition>=0&&firstStylePosition>=0&&themeBootPosition<firstStylePosition,'Explicit/system theme must be applied before CSS to prevent flash.');
assert(home.includes('<meta name="theme-color" content="#FAF6EF">'),'Browser chrome must match the approved ivory canvas.');
const caseTitles=[
 'B2B Retail Analytics &amp; Churn Diagnostic — Portfolio Scenario',
 'SMART Supply Chain Insights',
 'Wuzzuf Job Market Analysis'
];
for(const title of caseTitles)assert(home.includes(title),'Homepage is missing selected evidence-backed project '+title);
assert(!home.includes('Maxab distribution network')&&!home.includes('Real-time insights into retailer behavior'),'B2B scenario must not imply a Maxab engagement.');

const styles=await fs.readFile(path.join(out,'enhancements.css'),'utf8');
const studioStyles=await fs.readFile(path.join(out,'studio.css'),'utf8');
const redesignStyles=await fs.readFile(path.join(out,'redesign.css'),'utf8');
assert(styles.includes('prefers-reduced-motion:reduce'),'Motion preference support is required');
assert(redesignStyles.includes('prefers-reduced-motion:reduce'),'The redesign must respect reduced-motion settings');
assert(!/\.studio-project-card \.project-card-description\{[^}]*-webkit-line-clamp/.test(studioStyles),'Project card descriptions must not be clipped');

const serviceHtml=documents.get(path.join(out,'services/index.html'));
assert(serviceHtml.includes('id="simple-project-inquiry" class="public-project-inquiry-form" method="post" action="/services/"'),'Public inquiry form must retain the POST fallback');
assert(serviceHtml.includes('id="project-brief" class="business-inquiry-form" method="post" action="/services/" hidden'),'Verified enterprise inquiry form must retain its POST fallback');
assert(serviceHtml.includes('<label for="simple-inquiry-budget">Budget range (EGP) *</label>'),'Public project budget label must use EGP');
const expectedPublicBudgets=[
  '500 - 2,000 EGP',
  '2,000 - 5,000 EGP',
  '5,000 - 10,000 EGP',
  '10,000 - 25,000 EGP',
  '25,000+ EGP',
  'Not sure yet'
];
for(const budget of expectedPublicBudgets)assert(serviceHtml.includes('<option value="'+budget+'">'+budget+'</option>'),'Missing exact public EGP budget option: '+budget);
assert(serviceHtml.includes('Minimum project budget: 500 EGP. Projects below 500 EGP are not offered.'),'Public budget helper must explain the 500 EGP minimum');
assert(!serviceHtml.includes('USD')&&!serviceHtml.includes('Under $500')&&!serviceHtml.includes('$500–'),'Services page must not display legacy USD pricing');
assert(serviceHtml.includes('Currency (EGP) *')&&serviceHtml.includes('Minimum budget or compensation (EGP) *')&&serviceHtml.includes('Maximum budget or compensation (EGP) *'),'Invitation-only budgets must identify EGP');
assert((serviceHtml.match(/min="500"/g)||[]).length>=2,'Both invitation-only budget amounts must enforce the 500 EGP HTML minimum');
const inquiryRules=await fs.readFile(path.join(root,'src/assets/inquiry-rules.mjs'),'utf8');
assert(inquiryRules.includes("export const currencies = ['EGP'];"),'Invitation-only inquiries must accept EGP only');
assert(inquiryRules.includes("Number(value[key])<500"),'Invitation-only server validation must enforce the 500 EGP minimum');
const contactHtml=documents.get(path.join(out,'contact/index.html'));
assert(contactHtml.includes('CONTACT / REMOTE ROLE OPPORTUNITIES')&&contactHtml.includes('href="/resume/"'),'Contact page must prioritize recruiter conversations and the resume.');
assert(contactHtml.includes('href="/services/#business-inquiry"'),'Preserve the existing verified business inquiry path as a secondary contact option.');
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
assert(dashboardHtml.includes('dashboard-preview-figure')&&dashboardHtml.includes('data-lightbox'),'Dashboard gallery must have captions and full-size, accessible preview links.');
assert(dashboardHtml.includes('Saved report view'),'Dashboard preview must distinguish a screenshot from a live report.');
assert(dashboardHtml.includes('Interactive public reports load only when requested'),'Dashboard gallery must explain click-to-load report behavior.');

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
const contactInquiryHtml=documents.get(path.join(out,'contact/index.html'));
assert(/<form[^>]*id="simple-project-inquiry"[^>]*novalidate/.test(contactInquiryHtml),'Contact form must route invalid data through the inline validator.');
for(const field of ['name','email','description','budgetRange'])assert(contactInquiryHtml.includes('id="simple-inquiry-'+field+'-error"'),'Contact field is missing its inline error target: '+field);
const paletteLiterals=new Set(['#faf6ef','#382724','#a66e51']);
for(const cssFile of files.filter(file=>file.endsWith('.css'))){
 const css=await fs.readFile(cssFile,'utf8');
 for(const match of css.matchAll(/#[0-9a-f]{3,8}\b/gi))assert(paletteLiterals.has(match[0].toLowerCase()),'Off-palette CSS literal '+match[0]+' found in '+cssFile);
}
const paletteTheme=await fs.readFile(path.join(out,'theme.css'),'utf8');
assert(paletteTheme.includes('--ivory:#FAF6EF')&&paletteTheme.includes('--espresso:#382724')&&paletteTheme.includes('--copper:#A66E51'),'The exact approved brand palette must remain the source of theme colors.');
assert(paletteTheme.includes('--display:"Instrument Serif"'),'Instrument Serif must be the site display font.');

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

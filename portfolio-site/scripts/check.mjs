import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist');
async function walk(folder){const entries=await fs.readdir(folder,{withFileTypes:true});return(await Promise.all(entries.map(x=>x.isDirectory()?walk(path.join(folder,x.name)):[path.join(folder,x.name)]))).flat();}
const files=await walk(out),htmlFiles=files.filter(x=>x.endsWith('.html'));
const documents=new Map(await Promise.all(htmlFiles.map(async file=>[file,await fs.readFile(file,'utf8')])));
for(const [file,html]of documents){
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(ids.length,new Set(ids).size,'Duplicate id: '+file);
 assert.equal([...html.matchAll(/<h1\b/g)].length,1,'One H1 is required: '+file);
 assert(html.includes('name="description"'),'Missing description: '+file);
 for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
  const value=match[1];if(/^(https?:|mailto:|tel:|data:)/.test(value))continue;
  const url=new URL(value,'https://local.invalid/'+path.relative(out,file).replaceAll(path.sep,'/'));
  let target=path.join(out,decodeURIComponent(url.pathname));
  try{if((await fs.stat(target)).isDirectory())target=path.join(target,'index.html');await fs.access(target);}catch{assert.fail('Broken local link '+value+' in '+file);}
  if(url.hash){const text=documents.get(target);if(text)assert(text.includes('id="'+decodeURIComponent(url.hash.slice(1))+'"'),'Missing anchor '+value+' in '+file);}
 }
}
const data=JSON.parse(await fs.readFile(path.join(root,'content/repositories.json'),'utf8'));
assert.equal(new Set(data.repositories.map(r=>r.id)).size,data.repositories.length,'Duplicate repositories');
assert(data.repositories.every(r=>r.url.startsWith('https://github.com/Sohila-Khaled-Abbas/')),'Unexpected repository owner');
const work=documents.get(path.join(out,'work/index.html'));
assert.equal([...work.matchAll(/class="repo-card(?: |")/g)].length,data.repositories.length,'Catalog lost repository entries');
assert(!work.includes('Data-Analyst-PM-App')&&!work.includes('fx-rate-analytics'),'Private metadata leaked');
const config=JSON.parse(await fs.readFile(path.join(root,'vercel.json'),'utf8'));
const firebase=JSON.parse(await fs.readFile(path.join(root,'firebase.json'),'utf8'));
assert.equal(config.outputDirectory,'dist');assert.equal(firebase.hosting.public,'dist');
const {reports}=JSON.parse(await fs.readFile(path.join(root,'content/project-previews.json'),'utf8'));
const status=JSON.parse(await fs.readFile(path.join(root,'content/project-status.json'),'utf8'));
assert.equal(new Set(reports.map(r=>r.repo)).size,reports.length,'Duplicate report projects');
for(const report of reports){
 assert(report.source_kind==='legacy-portfolio'||data.repositories.some(r=>r.name===report.repo&&!r.fork),'Report must have a public repository or an explicit original-portfolio source');
 const html=documents.get(path.join(out,'dashboards',report.repo,'index.html'));
 assert(html,'Missing permanent report page: '+report.repo);
 assert(!/<iframe\b/.test(html),'Reports must not load third parties before visitor interaction');
 assert.equal(html.includes('data-load-report='),report.live?.access==='public','Only public reports may be embedded');
 if(report.live){const url=new URL(report.live.url);assert.equal(url.origin,'https://app.powerbi.com');assert.equal(url.pathname.startsWith('/view'),report.live.access==='public');}
 for(const file of report.files){assert(file.url.startsWith(report.source+'/blob/'),'Report file must belong to its repository');}
 for(const image of report.images){assert(image.alt&&image.caption);await fs.access(path.join(out,image.src));}
}
for(const repo of Object.keys(status))assert(data.repositories.some(r=>r.name===repo&&!r.fork),'Unknown current project');
assert.equal([...work.matchAll(/data-status="progress"/g)].length,Object.keys(status).length,'In-progress labels must use explicit editorial status');
const home=documents.get(path.join(out,'index.html'));
assert(home.includes('data-motion-toggle')&&home.includes('Good data.'),'Keep the original hero and provide a motion control');
const styles=await fs.readFile(path.join(out,'enhancements.css'),'utf8');assert(styles.includes('prefers-reduced-motion:reduce'),'Motion preference support is required');
await fs.access(path.join(out,'social-card.png'));
console.log(`PASS: ${htmlFiles.length} HTML documents, local links and anchors, ${data.repositories.length} public repositories, and both hosting configurations.`);
const {projects}=JSON.parse(await fs.readFile(path.join(root,'content/project-details.json'),'utf8'));
assert.equal(projects.length,data.repositories.filter(r=>!r.fork).length,'All original repositories need project previews');
for(const p of projects){const html=documents.get(path.join(out,'projects',p.repo,'index.html'));assert(html,'Missing project preview page: '+p.repo);for(const file of p.files)assert(file.url.startsWith(p.source+'/blob/'),'Unexpected project file owner');}
for(const page of ['services','community','credentials'])assert(documents.has(path.join(out,page,'index.html')));
assert(documents.get(path.join(out,'services/index.html')).includes('id="project-brief"'));
console.log(`PASS: ${projects.length} project previews, service brief, community, and credential pages.`);
console.log(`PASS: ${reports.length} report pages, explicit in-progress status, click-to-load public embeds, screenshot assets, and reduced-motion support.`);
const learning=JSON.parse(await fs.readFile(path.join(root,'content/learning.json'),'utf8'));
const evidence=JSON.parse(await fs.readFile(path.join(root,'content/professional-evidence.json'),'utf8'));
const recruiter=JSON.parse(await fs.readFile(path.join(root,'content/recruiter-guide.json'),'utf8'));
const originals=new Set(data.repositories.filter(r=>!r.fork).map(r=>r.name));
assert.equal(new Set(learning.courses.map(c=>c.id)).size,learning.courses.length,'Duplicate course IDs');
for(const course of learning.courses){
 assert.equal(course.status,'enrolled','Course completion needs its own supporting record');
 const url=new URL(course.url);assert.equal(url.origin,'https://www.udemy.com');assert(/^\/course\/[^/]+\/$/.test(url.pathname),'Use public course pages, not personal lecture URLs');
 assert(course.topics.length&&course.instructor&&course.purpose&&course.practice,'Incomplete course context');
 for(const connection of course.connections)assert(originals.has(connection.repo),'Course connection must be a public original project');
}
const learningHtml=documents.get(path.join(out,'learning/index.html'));
assert.equal([...learningHtml.matchAll(/class="course-card"/g)].length,learning.courses.length,'Learning page lost enrolled courses');
const courseSchema=JSON.parse(learningHtml.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'].find(x=>x['@type']==='ItemList');
assert.equal(courseSchema.itemListElement.length,learning.courses.length);
assert(courseSchema.itemListElement.every(x=>x.item['@type']==='Course'&&!x.item.educationalCredentialAwarded),'Enrollment must not imply an earned credential');
assert.equal(evidence.recognition.status,'historical-reported','Historical rankings must retain their context');
assert(evidence.recognition.period&&evidence.recognition.publisher&&evidence.recognition.url,'Recognition needs a period and source');
for(const item of evidence.recommendations){assert(item.author&&item.quote&&item.published_on&&item.summary);assert.equal(new URL(item.profile).hostname,'www.linkedin.com');}
for(const lane of recruiter.lanes)for(const repo of lane.projects)assert(originals.has(repo),'Recruiter evidence must be a public original project');
const serviceHtml=documents.get(path.join(out,'services/index.html'));
assert(serviceHtml.includes('id="project-brief" class="business-inquiry-form" hidden'),'Business inquiries must remain closed without an approved invitation');
assert([...documents.values()].every(html=>!html.includes('href="tel:')),'Do not expose personal telephone links');
console.log(`PASS: ${learning.courses.length} enrolled courses with public sources, project connections, Course metadata, attributed recommendations, and historical ranking context.`);
const profile=JSON.parse(await fs.readFile(path.join(root,'content/profile.json'),'utf8'));
const policy=JSON.parse(await fs.readFile(path.join(root,'content/sync-policy.json'),'utf8'));
assert.equal(policy.automatic_experience_import,false,'Experience changes require owner confirmation');
assert.equal(createHash('sha256').update(JSON.stringify(profile.experience)).digest('hex'),policy.experience_sha256,'Owner-selected experience changed without an approved revision');
for(const [file,html]of documents){
 for(const match of html.matchAll(/\b(?:href|src)="(https?:[^\"]+)"/g))assert(!policy.excluded_public_link_hosts.includes(new URL(match[1]).hostname),'Excluded community link appeared: '+file);
}
const aboutHtml=documents.get(path.join(out,'about/index.html'));
assert(aboutHtml.includes(profile.headline.replaceAll('&','&amp;')),'About must show the owner’s current professional headline');
const systems=JSON.parse(await fs.readFile(path.join(root,'content/about-systems.json'),'utf8'));
assert.equal(new Set(systems.modes.map(mode=>mode.id)).size,4,'The About explorer needs four distinct workflows');
for(const mode of systems.modes){assert(mode.nodes.length>=3&&mode.nodes.length<=5,'Keep workflow diagrams readable');for(const project of mode.projects)assert(originals.has(project.repo),'Workflow evidence must be a public original project');}
const expectedCounts=[originals.size,Object.keys({...JSON.parse(await fs.readFile(path.join(root,'content/cases.json'),'utf8')),...JSON.parse(await fs.readFile(path.join(root,'content/additional-cases.json'),'utf8'))}).length,reports.length,learning.courses.length];
assert.deepEqual([...aboutHtml.matchAll(/data-about-count="(\d+)"/g)].map(match=>Number(match[1])),expectedCounts,'About counters must derive from the published source records');
const posts=JSON.parse(await fs.readFile(path.join(root,'content/linkedin-posts.json'),'utf8'));
const postsHtml=documents.get(path.join(out,'posts/index.html'));
assert.equal(new Set(posts.posts.map(post=>post.id)).size,posts.posts.length,'Duplicate post identifiers');
assert(!/<iframe\b/.test(postsHtml),'LinkedIn embeds must load only after visitor interaction');
assert.equal([...postsHtml.matchAll(/class="social-post-card"/g)].length,posts.posts.length);
for(const post of posts.posts){
 assert.equal(new URL(post.url).origin,'https://www.linkedin.com');
 assert(Number.isInteger(post.reactions)&&Number.isInteger(post.comments)&&post.reactions>=0&&post.comments>=0,'Engagement snapshots must be public nonnegative counts');
 if(post.embed_url){const url=new URL(post.embed_url);assert.equal(url.origin,'https://www.linkedin.com');assert(/^\/embed\/feed\/update\/urn:li:(?:share|ugcPost):\d+$/.test(url.pathname),'Use verified official embed addresses');}
}
assert(policy.publish_private_analytics===false&&policy.allow_personal_phone===false&&policy.enrollment_is_not_completion===true);
assert.deepEqual(JSON.parse(await fs.readFile(path.join(root,'server/business-approvals.json'),'utf8')),{version:1,approvals:{}},'Do not publish local approval fixtures');
console.log(`PASS: source-derived About metrics, four project-backed workflows, ${posts.posts.length} public LinkedIn posts, current headline, and owner content exclusions.`);
for(const project of projects){
 const html=documents.get(path.join(out,'projects',project.repo,'index.html'));
 assert(html.includes('<h1>'+project.title.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')+'</h1>'),'Project heading must use its canonical title: '+project.repo);
 assert(!/^(?:Windows:|Edit \.env|\d+\. Clone repo)/i.test(project.title),'A setup instruction was imported as a project title');
 assert.equal([...html.matchAll(/data-story-panel="/g)].length,4,'Every original project needs four story chapters');
 assert(!/<iframe\b/.test(html),'Project stories must not load external embeds automatically');
 for(const file of project.files)assert(html.includes(file.url.replaceAll('&','&amp;')),'Story lost a source file: '+project.repo);
}
for(const report of reports){
 const html=documents.get(path.join(out,'dashboards',report.repo,'index.html'));
 assert.equal([...html.matchAll(/data-story-panel="/g)].length,4,'Every report needs the guided story');
}
assert.equal(projects.find(project=>project.repo==='kickstarter-analytics-engineering').title,'Kickstarter Analytics Engineering Platform');
assert(work.includes('Kickstarter Analytics Engineering Platform'));
console.log(`PASS: canonical project names, ${projects.length} original project stories, ${reports.length} report stories, complete linked evidence, and click-to-load embed boundaries.`);

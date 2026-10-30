import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
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

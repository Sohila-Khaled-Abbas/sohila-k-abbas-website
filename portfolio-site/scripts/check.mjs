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
assert.equal([...work.matchAll(/class="repo-card"/g)].length,data.repositories.length,'Catalog lost repository entries');
assert(!work.includes('Data-Analyst-PM-App')&&!work.includes('fx-rate-analytics'),'Private metadata leaked');
const config=JSON.parse(await fs.readFile(path.join(root,'vercel.json'),'utf8'));
const firebase=JSON.parse(await fs.readFile(path.join(root,'firebase.json'),'utf8'));
assert.equal(config.outputDirectory,'dist');assert.equal(firebase.hosting.public,'dist');
console.log(`PASS: ${htmlFiles.length} HTML documents, local links and anchors, ${data.repositories.length} public repositories, and both hosting configurations.`);

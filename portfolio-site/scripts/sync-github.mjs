import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const OWNER='Sohila-Khaled-Abbas';
const SELF='sohila-k-abbas-website';
export const SYNC_MESSAGE='chore(portfolio): sync public GitHub projects';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function safeHomepage(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}}
export function excerpt(markdown=''){
  const plain=markdown.replace(/```[\s\S]*?```/g,'').replace(/<!--[\s\S]*?-->/g,'').replace(/<[^>]*>/g,'').replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/^[#>|].*$/gm,'').replace(/[*_`]/g,'');
  const paragraph=plain.split(/\n\s*\n/).map(s=>s.replace(/\s+/g,' ').trim()).find(s=>s.length>=65&&!/^(MIT License|Copyright|License|\[!|---|https?:)/i.test(s));
  return paragraph?paragraph.slice(0,550):'';
}
export async function listPublicRepositories(request){
  const all=[];const seen=new Set();
  for(let page=1;page<=50;page++){
    const batch=await request(`/users/${OWNER}/repos?per_page=100&sort=full_name&direction=asc&page=${page}`);
    if(!Array.isArray(batch))throw new Error('Invalid GitHub repository response; previous snapshot retained.');
    for(const r of batch){
      if(r.private!==false||r.owner?.login?.toLowerCase()!==OWNER.toLowerCase())continue;
      if(!Number.isInteger(r.id)||!r.name||!r.default_branch||r.html_url!==`https://github.com/${OWNER}/${r.name}`)throw new Error('Invalid public repository metadata.');
      if(seen.has(r.id))throw new Error('Duplicate repository across pages; retry a consistent snapshot.');
      seen.add(r.id);all.push(r);
    }
    if(batch.length<100){if(!all.length)throw new Error('Empty catalog; previous snapshot retained.');return all;}
  }
  throw new Error('Pagination limit reached; refusing a partial snapshot.');
}
export function repositoryRecord(r,old={}){
  return {id:r.id,name:r.name,url:r.html_url,description:r.description||'',language:r.language||null,topics:[...(r.topics||[])].sort(),fork:Boolean(r.fork),archived:Boolean(r.archived),private:false,updated_at:r.updated_at,pushed_at:r.pushed_at,default_branch:r.default_branch,homepage:safeHomepage(r.homepage),parent_url:r.parent?.html_url||old.parent_url||null,parent_name:r.parent?.full_name||old.parent_name||null};
}
export function projectRecord(r,old,readme){
  const generated=!old||old.auto_generated===true;
  const title=readme?.title||old?.title||r.name.replace(/[-_]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  const p=old?structuredClone(old):{repo:r.name,title,summary:r.description||readme?.excerpt||'Explore the source and documentation for this public project.',technologies:[r.language,...r.topics].filter(Boolean).slice(0,8),methods:[],flow:null,media:null,live:r.homepage,presentation:null,files:[],empty:false,source:r.url,readme:`${r.url}/blob/${encodeURIComponent(r.default_branch)}/README.md`,old_portfolio:false,auto_generated:true};
  if(generated){p.live=r.homepage;p.title=title;p.summary=r.description||readme?.excerpt||p.summary;p.technologies=[r.language,...r.topics].filter(Boolean).slice(0,8);}
  if(r.homepage)p.live=r.homepage;
  p.source=r.url;
  if(readme?.path){p.readme=`${r.url}/blob/${encodeURIComponent(r.default_branch)}/${readme.path.split('/').map(encodeURIComponent).join('/')}`;if(generated)p.files=[{path:readme.path,size:readme.size||0,url:p.readme}];}
  p.github={description:r.description,updated_at:r.updated_at,pushed_at:r.pushed_at,homepage:r.homepage,default_branch:r.default_branch,readme_excerpt:readme?.excerpt??p.github?.readme_excerpt??'',readme_sha:readme?.sha??p.github?.readme_sha??null,fingerprint:readme?r.pushed_at:p.github?.fingerprint||null};
  return p;
}
export async function sync({request,readmeLimit=150}={}){
  const headers={'Accept':'application/vnd.github+json','User-Agent':'Sohila-Public-Portfolio-Sync','X-GitHub-Api-Version':'2022-11-28'};
  if(process.env.GITHUB_TOKEN)headers.Authorization=`Bearer ${process.env.GITHUB_TOKEN}`;
  request||=async endpoint=>{
    const response=await fetch('https://api.github.com'+endpoint,{headers,signal:AbortSignal.timeout(20000)});
    if(response.status===404)return null;
    if(response.status===451)return {unavailable:true};
    if(!response.ok)throw new Error(`GitHub HTTP ${response.status}; no snapshot files were replaced.`);
    return response.json();
  };
  const catalogPath=path.join(root,'content/repositories.json'),detailsPath=path.join(root,'content/project-details.json');
  const oldCatalog=JSON.parse(await fs.readFile(catalogPath,'utf8'));
  const oldDetails=JSON.parse(await fs.readFile(detailsPath,'utf8'));
  const oldByName=new Map(oldCatalog.repositories.map(r=>[r.name,r]));
  const detailsByName=new Map(oldDetails.projects.map(p=>[p.repo,p]));
  const remote=await listPublicRepositories(request);
  // Ignore our own synchronization commits when measuring the portfolio repo's activity.
  const self=remote.find(r=>r.name===SELF);
  if(self){
    const commits=await request(`/repos/${OWNER}/${SELF}/commits?per_page=30`);
    const meaningful=Array.isArray(commits)&&commits.find(c=>!c.commit?.message?.startsWith(SYNC_MESSAGE));
    if(meaningful){self.pushed_at=meaningful.commit.committer.date;self.updated_at=self.pushed_at;}
  }
  const records=[],projects=[];let readmes=0;
  // Discover new repositories first; process all public repos before writing either file.
  remote.sort((a,b)=>Number(!oldByName.has(b.name))-Number(!oldByName.has(a.name))||a.name.localeCompare(b.name));
  for(const raw of remote){
    const old=oldByName.get(raw.name);
    if(raw.fork&&!old?.parent_url){const meta=await request(`/repos/${OWNER}/${encodeURIComponent(raw.name)}`);if(meta?.parent)raw.parent=meta.parent;}
    const r=repositoryRecord(raw,old);records.push(r);
    if(r.fork)continue;
    const prev=detailsByName.get(r.name);let readme;
    if(readmes<readmeLimit&&prev?.github?.fingerprint!==r.pushed_at){
      readmes++;
      const response=await request(`/repos/${OWNER}/${encodeURIComponent(r.name)}/readme`);
      if(response?.encoding==='base64'&&response.size<=500000){
        const text=Buffer.from(response.content,'base64').toString('utf8');
        readme={sha:response.sha,path:response.path,size:response.size,excerpt:excerpt(text),title:text.match(/^#\s+([^\n]+)/m)?.[1]?.replace(/[*_`]/g,'').trim()};
      }else readme={excerpt:'',sha:null};
    }
    projects.push(projectRecord(r,prev,readme));
  }
  records.sort((a,b)=>a.name.localeCompare(b.name));projects.sort((a,b)=>a.repo.localeCompare(b.repo));
  const catalog={...oldCatalog,checked_on:new Date().toISOString().slice(0,10),repositories:records};
  const details={...oldDetails,checked_on:catalog.checked_on,projects};
  // Writes occur only after all pagination and requested reads have succeeded.
  await fs.writeFile(catalogPath,JSON.stringify(catalog,null,2)+'\n');
  await fs.writeFile(detailsPath,JSON.stringify(details,null,2)+'\n');
  console.log(`Synced ${records.length} public repositories, ${projects.length} original project pages, and ${readmes} README updates.`);
  return {repositories:records.length,projects:projects.length,readmes};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const defaultLimit=process.env.GITHUB_TOKEN?150:20;
  sync({readmeLimit:Number(process.env.README_SYNC_LIMIT||defaultLimit)}).catch(err=>{console.error(err.message);process.exitCode=1;});
}

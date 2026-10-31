import test from 'node:test';
import assert from 'node:assert/strict';
import {OWNER,listPublicRepositories,repositoryRecord,projectRecord,excerpt,safeHomepage} from '../scripts/sync-github.mjs';
const repo=(i,extra={})=>({id:i,name:'project-'+i,private:false,owner:{login:OWNER},html_url:`https://github.com/${OWNER}/project-${i}`,default_branch:'main',description:'A public data integration project.',pushed_at:'2026-10-31T12:00:00Z',updated_at:'2026-10-31T12:00:00Z',language:'Python',topics:['sql'],...extra});
test('pagination includes a new repo after page 1 and excludes private/foreign records',async()=>{
  const pages=[Array.from({length:100},(_,i)=>repo(i)),[repo(100),repo(101,{private:true}),repo(102,{owner:{login:'elsewhere'}})]];
  let calls=0;const result=await listPublicRepositories(async()=>pages[calls++]);
  assert.equal(calls,2);assert.equal(result.length,101);assert.equal(result.at(-1).id,100);
});
test('a failed second page rejects the whole refresh; empty and duplicate catalogs are rejected',async()=>{
  let calls=0;
  await assert.rejects(()=>listPublicRepositories(async()=>{if(calls++)throw Error('rate limit');return Array.from({length:100},(_,i)=>repo(i));}));
  await assert.rejects(()=>listPublicRepositories(async()=>[]));
  await assert.rejects(()=>listPublicRepositories(async()=>[repo(1),repo(1)]));
});
test('new originals get project pages, current website links, and source files',()=>{
  const r=repositoryRecord(repo(1,{homepage:'https://example.com'}));
  const p=projectRecord(r,null,{title:'A better project title',path:'README.md',sha:'abc',size:99,excerpt:'Current source summary.'});
  assert.equal(p.repo,'project-1');assert.equal(p.auto_generated,true);assert.equal(p.live,'https://example.com/');
  assert.equal(p.files[0].url,`https://github.com/${OWNER}/project-1/blob/main/README.md`);assert.equal(p.github.readme_sha,'abc');
});
test('updates preserve editorial summaries, methods, media, and case-study fields',()=>{
  const old={repo:'project-2',title:'Curated title',summary:'Carefully written case study.',methods:['Verified method'],media:{src:'/existing.webp'},files:[],live:'https://old.example/'};
  const r=repositoryRecord(repo(2,{description:'New GitHub summary',homepage:'https://new.example'}));
  const p=projectRecord(r,old,{sha:'new',excerpt:'README has changed.',path:'README.md'});
  assert.equal(p.title,old.title);assert.equal(p.summary,old.summary);assert.deepEqual(p.methods,old.methods);assert.deepEqual(p.media,old.media);
  assert.equal(p.github.description,'New GitHub summary');assert.equal(p.github.readme_excerpt,'README has changed.');assert.equal(p.live,'https://new.example/');
  assert.equal(old.live,'https://old.example/');
});
test('unsafe website schemes and credential-bearing URLs are excluded',()=>{
  for(const value of ['javascript:alert(1)','data:text/html,hello','https://user:secret@example.com',null])assert.equal(safeHomepage(value),null);
  assert.equal(safeHomepage('https://example.com/project'),'https://example.com/project');
});
test('README summaries discard badges, code, and HTML without executing source content',()=>{
  const md='# Project\n\n![badge](https://example.com)\n\n```sh\necho do-not-run\n```\n\nA sufficiently descriptive paragraph that explains the public project and its intended learning purpose.\n\nOther content.';
  assert.match(excerpt(md),/^A sufficiently/);assert.ok(!excerpt(md).includes('echo'));
});

test('unchanged generated projects keep their README title between refreshes',()=>{
  const r=repositoryRecord(repo(4));
  const first=projectRecord(r,null,{title:'README-authored title',excerpt:'A useful project description.'});
  const second=projectRecord(r,first,undefined);
  assert.equal(second.title,'README-authored title');assert.deepEqual(second,first);
});

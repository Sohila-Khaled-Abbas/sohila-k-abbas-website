export const OWNER='Sohila-Khaled-Abbas';
export function category(repo){const n=repo.name.toLowerCase();if(repo.fork||/roadmap|second.brain|course|diploma|fundamentals|workshop|^linux$|bootdev|awesome|tidytuesday|anshlamba|forage|job.simulation/.test(n))return 'learning';if(/n8n|nl2sql|sentiment|gpt-oss|eur-egp|rate-monitor/.test(n))return 'automation';if(/portfolio|website|showcase|deep.clean|local_data_aggregator|^the-data-tea$|hr-analytics-hub|data-career-roadmap-generator/.test(n))return 'apps';if(/pipeline|dwh|warehouse|etl|kafka|hadoop|streampulse|employee-directory|pixelfed|cosmetics|kickstarter|enterprise-hr|sql-server-data-platform|novatel/.test(n))return 'engineering';return 'analytics';}
export function safeHomepage(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}}
const excludedPortfolioRepositories=new Set(['MaxAB_B2B_Retail_Wallet_Optimization','flyrank-ml-internship-starter','docker-hadoop','enterprise-hr-analytics','sql-server-data-platform']);
const nonWorkTitlePattern=/\b(?:learning roadmap|learning repository|learning in public|tutorial|course(?:work)?|diploma|workshop|bootcamp|job simulation|virtual experience|data tea|second brain|mentor|mentoring|community resource|community hub|forked resource|roadmap)\b/i;
export function isClientWorkRepository(repository,project={},caseStudy=null){
  if(!repository||repository.fork||excludedPortfolioRepositories.has(repository.name)||category(repository)==='learning')return false;
  const identity=[repository.name,project.title,caseStudy?.title].filter(Boolean).join(' ');
  if(nonWorkTitlePattern.test(identity))return false;
  if(/diploma|virtual experience|job simulation/i.test(caseStudy?.type||''))return false;
  if(project.empty)return false;
  if(/^python[_-]eda[_-]case[_-]study$/i.test(repository.name||''))return false;
  return true;
}
export function publicRecord(r){if(r.private!==false||r.owner?.login?.toLowerCase()!==OWNER.toLowerCase()||r.html_url!==`https://github.com/${OWNER}/${r.name}`)return null;const candidate={name:r.name,fork:Boolean(r.fork),description:r.description||''};if(!isClientWorkRepository(candidate))return null;return {id:r.id,name:r.name,url:r.html_url,description:r.description||'',language:r.language||'',topics:r.topics||[],fork:Boolean(r.fork),archived:Boolean(r.archived),updated_at:r.updated_at,pushed_at:r.pushed_at,homepage:safeHomepage(r.homepage),category:category(r)};}

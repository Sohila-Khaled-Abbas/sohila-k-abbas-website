import {businessInquiry} from './business-inquiry-template.mjs';
import {escape as e, icon, link, intro, cta, skills, timeline} from './pages.mjs';
import {progressBadge, reportRoute, homeReports, currentWork, toolkit} from './previews.mjs';

const route = repo => '/projects/' + repo + '/';
const featuredCaseProof={
 'fmcg-sales-churn-drop-analysis-powerbi':{
  question:'What explains sales movement across retailer retention, delivery performance, and category mix?',
  tool:'Power BI · DAX · SQL Server',
  result:'47K+ orders analyzed; retention, delivery, and commercial signals separated for review.'
 },
 'SMART-Supply-Chain-Insights-Dashboard':{
  question:'Where do fulfillment, customer, product, and shipping patterns diverge?',
  tool:'Python · Pandas · Excel · Power BI · DAX',
  result:'65,752 orders analyzed in a five-page Power BI report.'
 },
 'Wuzzuf-Job-Market-Analysis':{
  question:'Which roles, skills, and hiring cities appear in Egypt’s job-posting sample?',
  tool:'Power BI · DAX',
  result:'217 postings; Data Analyst was the most common title, and salary records were incomplete.'
 }
};
function featuredProofMarkup(repo){
 const proof=featuredCaseProof[repo];
 if(!proof)return '';
 return '<p class="featured-case-proof"><span><strong>Business question:</strong> '+e(proof.question)+'</span><span class="proof-divider"> · </span><span><strong>Tool:</strong> '+e(proof.tool)+'</span><span class="proof-divider"> · </span><span><strong>Result:</strong> '+e(proof.result)+'</span></p>';
}

const sourceTitle = p => p.empty ? 'Repository overview' : p.flow ? 'Workflow overview' : 'Source preview';
const visualInfo = (p,report) => report?.images?.length ? {src:report.images[0].src,width:report.images[0].width,height:report.images[0].height,kind:report.preview_kind==='diagram'?'Architecture diagram':report.preview_kind==='cover'?'Editorial portfolio cover':'Dashboard preview',caption:report.images[0].caption,alt:report.images[0].alt,source_label:report.preview_kind==='diagram'?'Original SVG from the GitHub README.':report.preview_kind==='cover'?'Original editorial portfolio cover; not a report screenshot.':report.images[0].source_url?'Captured from the published Power BI report.':'From the public project repository.'} : p?.media ? {...p.media,aspectRatio:p.media.width&&p.media.height?p.media.width/p.media.height:null,alt:p.title+' — '+p.media.kind} : null;

const wrapPreviewText = (value,limit=30,maxLines=3) => {
  const words=String(value||'').trim().split(/\s+/).filter(Boolean);
  const lines=[];
  let line='';
  for(const word of words){
    const next=line?line+' '+word:word;
    if(next.length>limit&&line){lines.push(line);line=word;}
    else line=next;
    if(lines.length===maxLines-1&&line.length>limit){
      line=line.slice(0,Math.max(1,limit-1)).trimEnd()+'…';
      break;
    }
  }
  if(line&&lines.length<maxLines)lines.push(line);
  if(lines.length===maxLines&&words.join(' ').length>lines.join(' ').length&&!lines.at(-1).endsWith('…'))lines[lines.length-1]=lines.at(-1).slice(0,Math.max(1,limit-1))+'…';
  return lines;
};
const projectPreviewSvg = (p,meta={}) => {
  const repo=String(p.repo||'project').slice(0,72);
  const title=String(p.title||repo).trim();
  const category=String(meta.category||p.category||'analytics').replace(/[^a-z0-9 &+.-]/gi,' ').toUpperCase().slice(0,28);
  const summary=String(p.summary||'An original project built around a practical data workflow.').replace(/\s+/g,' ').trim();
  const titleLines=wrapPreviewText(title,25,3);
  const summaryLines=wrapPreviewText(summary,52,3);
  const listedTools=Array.isArray(p.technologies)&&p.technologies.length?p.technologies:[meta.language,...(meta.topics||[])].filter(Boolean);
  const tools=[...new Set(listedTools.map(tool=>String(tool).trim()).filter(Boolean))].slice(0,4);
  const flow=Array.isArray(p.flow)?p.flow.slice(0,4).map(step=>String(step).slice(0,25)):[];
  const titleMarkup=titleLines.map((line,index)=>'<tspan x="92" dy="'+(index===0?0:57)+'">'+e(line)+'</tspan>').join('');
  const summaryMarkup=summaryLines.map((line,index)=>'<tspan x="94" dy="'+(index===0?0:30)+'">'+e(line)+'</tspan>').join('');
  const tags=tools.map((tool,index)=>'<g transform="translate('+(94+index*160)+',575)"><rect width="144" height="36" rx="6" fill="#f0e9e2" stroke="#ded3cd"/><text x="72" y="23" text-anchor="middle" font-family="DM Sans,Arial,sans-serif" font-size="14" fill="#713549">'+e(tool.slice(0,18))+'</text></g>').join('');
  const rightVisual=flow.length
    ? '<text x="765" y="216" font-family="DM Sans,Arial,sans-serif" font-size="15" font-weight="700" letter-spacing="2.2" fill="#786b68">WORKFLOW OVERVIEW</text><path d="M800 265V485" stroke="#b78e7c" stroke-width="3" stroke-linecap="round"/>'+flow.map((step,index)=>'<g transform="translate(0,'+(254+index*69)+')"><circle cx="800" cy="0" r="18" fill="#713549"/><text x="800" y="6" text-anchor="middle" font-family="DM Sans,Arial,sans-serif" font-size="15" font-weight="700" fill="#f7f3ed">'+(index+1)+'</text><rect x="838" y="-24" width="244" height="48" rx="8" fill="#fffdf9" stroke="#ded3cd"/><text x="858" y="6" font-family="DM Sans,Arial,sans-serif" font-size="16" fill="#2d2026">'+e(step)+'</text></g>').join('')
    : '<text x="765" y="216" font-family="DM Sans,Arial,sans-serif" font-size="15" font-weight="700" letter-spacing="2.2" fill="#786b68">PROJECT SNAPSHOT</text><path d="M768 490H1090" stroke="#c9b9b2" stroke-width="2"/>'+[74,122,95,174,145,208].map((height,index)=>'<rect x="'+(785+index*48)+'" y="'+(490-height)+'" width="25" height="'+height+'" rx="4" fill="'+(index===5?'#713549':'#b78e7c')+'" opacity="'+(index===5?'1':'.78')+'"/>').join('')+'<path d="M775 330L1084 330" stroke="#ded3cd" stroke-dasharray="5 7"/><text x="775" y="525" font-family="DM Sans,Arial,sans-serif" font-size="13" fill="#786b68">PREPARE · MODEL · ANALYZE · REPORT</text>';
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-label="'+e(title)+' project preview"><rect width="1200" height="675" fill="#f7f3ed"/><rect x="38" y="38" width="1124" height="599" rx="18" fill="#fffdf9" stroke="#ded3cd" stroke-width="2"/><rect x="38" y="38" width="10" height="599" rx="5" fill="#713549"/><text x="94" y="112" font-family="DM Sans,Arial,sans-serif" font-size="16" font-weight="700" letter-spacing="3" fill="#713549">'+e(category)+'</text><text x="94" y="155" font-family="DM Sans,Arial,sans-serif" font-size="12" letter-spacing="2" fill="#786b68">PROJECT PREVIEW  /  '+e(repo)+'</text><text x="92" y="252" font-family="DM Sans,Arial,sans-serif" font-size="49" font-weight="600" letter-spacing="-1.5" fill="#2d2026">'+titleMarkup+'</text><text x="94" y="440" font-family="DM Sans,Arial,sans-serif" font-size="19" fill="#786b68">'+summaryMarkup+'</text><rect x="735" y="165" width="382" height="378" rx="14" fill="#f7f3ed" stroke="#ded3cd" stroke-width="2"/>'+rightVisual+tags+'<text x="94" y="615" font-family="DM Sans,Arial,sans-serif" font-size="11" letter-spacing="2" fill="#786b68">SOURCE-LED EDITORIAL VISUAL  ·  NOT A REPORT SCREENSHOT</text></svg>';
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
};
export function githubUpdate(p){
  if(!p.github)return '';
  const g=p.github,d=new Date(g.pushed_at||g.updated_at),when=Number.isNaN(d.getTime())?'Date unavailable':d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
  const scenario=p.repo==='fmcg-sales-churn-drop-analysis-powerbi';
  const description=scenario?'This page describes an independent Egyptian B2B retail portfolio scenario. No client relationship, private company data access, or measured operational impact is claimed.':(g.description||'See the current repository documentation.');
  const excerpt=scenario?'A portfolio analytics scenario exploring retailer sales, delivery performance, retention, and category movement in an Egyptian B2B distribution context.':g.readme_excerpt;
  return `<section class="github-source-update" data-github-project="${e(p.repo)}"><span class="eyebrow">SOURCE REPOSITORY</span><h2>Inspect the<br><em>implementation.</em></h2><p class="github-activity">Source updated <time datetime="${e(g.pushed_at||g.updated_at)}">${e(when)}</time></p><p data-current-description>${e(description)}</p>${excerpt?`<details><summary>Repository context</summary><p>${e(excerpt)}</p><p class="github-activity">Source documentation, not an independently verified business outcome.</p></details>`:''}<div class="project-detail-actions">${link(p.source+'/commits/'+encodeURIComponent(g.default_branch),'Explore source changes')}${link(p.source,'View original repository')}</div></section>`;
}
export function projectVisual(p,report,detail=false,meta={}){
  const image=visualInfo(p,report);
  if(image){const portrait=detail&&image.aspectRatio&&image.aspectRatio<1;return `<div class="project-visual visual-image${report?.preview_kind==='diagram'?' diagram-preview':''}${portrait?' portrait-preview':''}"><img src="${e(image.src)}" alt="${e(image.alt)}" width="${e(image.width||1440)}" height="${e(image.height||850)}" loading="${meta.eager?'eager':'lazy'}" decoding="async"${meta.eager?' fetchpriority="high"':''}><span class="image-fallback" hidden>Preview unavailable. Use the report and source links below.</span><span class="visual-type">${e(image.kind)}</span></div>`;}
  const generated=projectPreviewSvg(p,meta);
  return `<div class="project-visual visual-image visual-generated" data-preview-kind="generated-project-image"><img src="${e(generated)}" alt="${e((p.title||p.repo)+' — generated editorial project preview from the public project metadata; not a report screenshot.')}" width="1200" height="675" loading="${meta.eager?'eager':'lazy'}" decoding="async"${meta.eager?' fetchpriority="high"':''}><span class="visual-type">Project preview</span></div>`;
}
export function directoryCard(r,p,report,status,categories,isCase,showOutcome=false){
  p=p||{repo:r.name,title:r.name,summary:r.description||'A public project and its implementation details.',technologies:[r.language].filter(Boolean),files:[],empty:false};
  const target=r.fork?r.url:route(r.name),title=p.title||r.name;
  const summary=(p.summary||r.description||'Explore the repository documentation.').replace(/production[- ](?:ready|grade)\s*/gi,'');
  const cardLivePreview=showOutcome&&r.name==='fmcg-sales-churn-drop-analysis-powerbi'&&report?.live?.access==='public'?'<section class="work-card-live-preview" aria-label="B2B Retail live Power BI preview"><div class="report-embed-shell work-card-embed-shell"><div class="report-load-prompt"><img src="/logos/powerbi.svg" width="28" height="28" alt=""><h4>Explore the live report</h4><p>Load the published Power BI report to inspect the retail analytics and churn views.</p><button class="button primary" type="button" data-load-report="'+e(report.live.url)+'" data-report-title="'+e(report.title)+'">Load live preview</button></div><div class="report-embed-host" aria-live="polite"></div></div><p class="report-scenario-disclaimer" role="note">Portfolio scenario. Report branding is from the practice dataset.</p><p class="embed-fallback">Prefer a separate tab? '+link(report.live.url,'Open full report')+'</p></section>':'';
  return `<article class="repo-card studio-project-card ${r.category}" data-name="${e(r.name)}" data-category="${r.category}" data-kind="${r.fork?'fork':'original'}" data-status="${status[r.name]?'progress':'portfolio'}" data-updated="${e(r.updated_at)}" data-featured="${isCase||p.old_portfolio||p.featured===true?'true':'false'}" data-search="${e([r.name,title,summary,r.language,...(r.topics||[]),...(p.technologies||[])].join(' ').toLowerCase())}"><a href="${target}" class="studio-project-cover"${r.fork?' target="_blank" rel="noopener noreferrer"':''}>${projectVisual(p,report,false,{category:r.category,fork:r.fork,language:r.language,topics:r.topics||[],eager:showOutcome})}<span class="project-cover-open">${r.fork?'Upstream & source':'Open project'} ${icon}</span></a><div class="studio-project-copy"><div class="project-card-meta"><span>${r.fork?'UPSTREAM REPOSITORY':e(categories[r.category]||'PROJECT')}${r.archived?' · ARCHIVED':''}</span>${progressBadge(r.name,status)}</div><h3><a class="repo-name" href="${target}">${e(title)}</a></h3><p class="project-card-description">${e(summary)}</p>${showOutcome&&featuredCaseProof[r.name]?featuredProofMarkup(r.name):showOutcome&&p.decision_support?`<p class="project-card-outcome">${e(p.decision_support)}</p>`:''}<div class="project-tool-list">${(p.technologies?.length?p.technologies:[r.language].filter(Boolean)).slice(0,4).map(t=>`<span>${e(t)}</span>`).join('')}</div>${cardLivePreview}<div class="studio-card-bottom">${link(target,r.fork?'Explore resource':isCase?'Follow the story':'Explore project story')}${!r.fork?link(r.url,'GitHub'):''}</div>${r.fork&&r.parent_url?`<a class="repo-parent" href="${e(r.parent_url)}" target="_blank" rel="noopener noreferrer">Forked from ${e(r.parent_name)}</a>`:''}</div></article>`;
}
export function projectPreview(p,report,meta={}){
  const image=visualInfo(p,report);
  const title=String(p.title||p.repo||'Project').trim();
  const generatedCaption=title+' — editorial project preview generated from public project metadata; not a report screenshot.';
  const previewLabel=image?.kind||'Editorial project preview';
  const previewNote=image
    ? e(image.caption)+' · '+e(image.source_label||'From the public project repository.')
    : 'Generated from the project title, summary, category, and documented tools. This is a visual project preview, not a screenshot of a live application or report.';
  return `<section class="wrap project-preview-shell" aria-label="Project preview"><div class="preview-shell-top"><span>${e(previewLabel)}</span><span class="mono muted">${e(p.repo)}</span></div><a class="project-large-image" href="${e(image?.src||projectPreviewSvg(p,meta))}" data-lightbox="${e(p.repo)}" data-caption="${e(image?.caption||generatedCaption)}" aria-label="Enlarge ${e(image?.alt||generatedCaption)}">${projectVisual(p,report,true,meta)}<span class="preview-enlarge">Enlarge preview ↗</span></a><p class="project-preview-note">${previewNote}</p></section>`;
}
export function projectPage(p,r,report,status,categories){
  const related=p.technologies||[];
  return `<section class="wrap project-detail-head"><a class="text-link" href="/work/">← All work</a><div class="project-detail-kicker"><span class="eyebrow">${e(categories[r.category]||'PROJECT')} / LOOK INSIDE</span>${progressBadge(p.repo,status)}</div><h1>${e(p.title)}</h1><p>${e(p.summary)}</p><div class="project-detail-actions">${link(p.source,'View source on GitHub','button primary')}${p.live&&!p.live.includes('app.powerbi.com')?link(p.live,'Open project website'):''}${report?link(reportRoute(report.repo),report.live?'Open dashboard preview':'Report preview & files'):''}<button type="button" class="button button-secondary copy-page-button" data-copy-page aria-label="Copy this project page URL">Copy page link</button></div></section>${p.live?.includes('streamlit.app')?'<p class="wrap project-app-note">The Streamlit app may need a moment to wake after inactivity.</p>':''}${projectPreview(p,report,{category:r.category,language:r.language})}<section class="wrap project-detail-grid page-section"><aside><span class="eyebrow">PROJECT TOOLKIT</span><div class="project-detail-tools">${related.map(t=>`<a href="/work/?q=${encodeURIComponent(t)}">${e(t)}</a>`).join('')||'<span>Repository documentation</span>'}</div><dl class="project-facts"><div><dt>Repository</dt><dd>${p.empty?'Empty source repository':'Public · original work'}</dd></div><div><dt>Primary language</dt><dd>${e(r.language||'Mixed / not detected')}</dd></div><div><dt>Explore</dt><dd>Implementation and available project files</dd></div></dl></aside><div class="project-detail-body">${githubUpdate(p)}${p.methods.length?`<section><span class="eyebrow">THE IMPLEMENTATION</span><h2>What connects<br><em>the pieces.</em></h2><ul class="implementation-list">${p.methods.map(m=>`<li>${e(m)}</li>`).join('')}</ul></section>`:`<section><span class="eyebrow">A CLOSER LOOK</span><h2>Follow the work.<br><em>Explore the source.</em></h2><p>${e(p.summary)}</p><p>The repository contains the implementation, documentation, and available project artifacts. Use the files below to find a starting point.</p></section>`}<section id="project-files"><div class="section-label"><span>FILES / START HERE</span></div><div class="project-file-browser">${p.files.map(f=>`<a href="${e(f.url)}" target="_blank" rel="noopener noreferrer"><span class="file-extension">${e(f.path.split('.').at(-1).toUpperCase().slice(0,5))}</span><span>${e(f.path)}</span>${icon}</a>`).join('')||'<p>No source files are available in this repository yet.</p>'}</div>${p.readme?link(p.readme,'Read the repository documentation'):''}</section>${p.presentation?`<section class="project-presentation"><span class="eyebrow">THE STORY BEHIND IT</span><h2>See the<br><em>presentation.</em></h2>${link(p.presentation,'Open project presentation','button primary')}</section>`:''}</div></section>${cta()}`;
}
export function caseExtras(p,report){return `<div class="wrap">${githubUpdate(p)}</div><div class="wrap case-extra-links">${p.live&&!p.live.includes('app.powerbi.com')?link(p.live,'Open project website'):''}${p.presentation?link(p.presentation,'Project presentation'):''}${link('/work/?q='+encodeURIComponent(p.technologies?.[0]||p.repo),'Explore related work')}<button type="button" class="button button-secondary copy-page-button" data-copy-page aria-label="Copy this project page URL">Copy page link</button></div>`;}

export function signatureHero(profile){return `<section class="signature-hero hero wrap" aria-labelledby="hero-title"><div class="hero-copy"><div class="signature-byline"><span class="signature-rule"></span>${e(profile.name)}</div><div class="eyebrow">POWER BI DASHBOARDS &amp; REPORTING</div><h1 id="hero-title">Good data.<br><span class="hero-decision-line">Better <em>decisions.</em></span></h1><p class="hero-intro">Power BI dashboards and reporting for growing businesses, from messy data to decisions you can defend.</p><p class="hero-discipline-line">Data Analyst <span aria-hidden="true">·</span> Analytics Engineer</p><div class="hero-ctas">${link('/services/','Work with me','button primary')}${link('/work/','Explore my work')}</div><div class="hero-location"><span class="location-symbol">◎</span>Damietta, Egypt <span class="separator">/</span> Open to remote collaboration</div><button class="hero-motion-toggle" data-motion-toggle aria-pressed="false">Pause animation</button></div><div class="hero-art signature-stage" aria-label="Sohila’s portrait and a preview of the completed Smart Supply Chain dashboard"><div class="signature-stage-grid"></div><span class="signature-stage-number" aria-hidden="true">SKA</span><div class="signature-portrait"><img src="/sohila-portrait.webp" alt="Sohila Khaled Abbas" width="681" height="1024" fetchpriority="high"><span>THE PERSON BEHIND THE QUERIES</span></div><span class="signature-tool tool-python"><img src="/logos/python.svg" width="23" height="23" alt="">Python</span><span class="signature-tool tool-dbt"><img src="/logos/dbt.svg" width="23" height="23" alt="">dbt</span><span class="signature-tool tool-powerbi"><img src="/logos/powerbi.svg" width="23" height="23" alt="">Power BI</span><a class="signature-project" href="/projects/SMART-Supply-Chain-Insights-Dashboard/"><span><i aria-hidden="true"></i> FEATURED WORK / SMART SUPPLY CHAIN ${icon}</span><img src="/previews/supply-chain.webp" width="600" height="340" alt="Smart Supply Chain — Order fulfillment" loading="lazy" decoding="async"></a><span class="signature-stage-caption">STRUCTURE. CONTEXT. CLARITY.</span></div></section>`;}
const categoryNames={analytics:'BI & analytics',engineering:'Data engineering',automation:'Automation & AI',apps:'Apps & tools'};

function homeProofBand(repositories,reports,cases){
 const previewCount=reports.filter(report=>Array.isArray(report.images)&&report.images.length>0).length;
 return '<section class="wrap home-proof-band" aria-label="Work portfolio snapshot">'
  +'<div class="home-proof-metric"><strong>'+Object.keys(cases).length+'</strong><span>case studies</span></div>'
  +'<div class="home-proof-metric"><strong>'+reports.length+'</strong><span>dashboards</span></div>'
  +'<div class="home-proof-metric"><strong>'+previewCount+'</strong><span>visual previews</span></div>'
  +'</section>';
}
export function homeProcessSection(){
  return '<section class="wrap section home-process-section" aria-labelledby="home-process-title">'
    +'<div class="section-label"><span>PROJECT DELIVERY / THREE STEPS</span><span class="mono muted">CLEAR SCOPE. USEFUL OUTPUT.</span></div>'
    +'<div class="home-process-heading"><h2 id="home-process-title">How we’ll work.</h2><p>A straightforward path from the first question to a practical deliverable.</p></div>'
    +'<ol class="home-process-steps"><li><span class="home-process-number">01</span><h3>You send your data or problem.</h3></li><li><span class="home-process-number">02</span><h3>I scope it and give a fixed quote.</h3></li><li><span class="home-process-number">03</span><h3>You get a dashboard or report you can defend.</h3></li></ol>'
    +'<div class="home-price-anchor"><p>Pricing follows the scope.</p><span class="home-price-note">A fixed quote comes after reviewing your data, deliverables, and timeline.</span></div>'
    +'</section>';
}
export function homeRecommendationsSection(evidence={}){
 const items=(Array.isArray(evidence.recommendations)?[...evidence.recommendations]:[])
  .filter(item=>/client recommendation/i.test(item.context||''))
  .sort((a,b)=>Date.parse(b.published_on||0)-Date.parse(a.published_on||0));
 const date=value=>{
  const d=new Date(value+'T00:00:00Z');
  return Number.isNaN(d.getTime())?value:d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
 };
 const cards=items.map(item=>{
  const context=(item.context||'').replace(/\s*·\s*Client recommendation/i,'');
  return '<figure class="home-testimonial-card"><span class="recommendation-kind">CLIENT RECOMMENDATION</span><blockquote class="home-testimonial-quote"><p>“'+e(item.quote)+'”</p></blockquote><figcaption><a href="'+e(item.profile)+'" target="_blank" rel="noopener noreferrer">'+e(item.author)+' '+icon+'</a><span>'+e(context)+'</span><time datetime="'+e(item.published_on)+'">'+e(date(item.published_on))+'</time></figcaption><p class="recommendation-summary">'+e(item.summary)+'</p></figure>';
 }).join('');
 return '<section class="wrap section home-proof-section" aria-labelledby="client-notes-title"><div class="section-label"><span>CLIENT RECOMMENDATIONS / IN THEIR WORDS</span><span class="mono muted">PUBLIC LINKEDIN EXCERPTS</span></div><div class="home-proof-heading"><h2 id="client-notes-title">Good work starts<br><em>with good people.</em></h2><p>Selected recommendations from professional project collaborations. The original wording links to each author’s LinkedIn profile.</p></div><div class="home-testimonial-grid">'+cards+'</div><div class="home-testimonial-footer"><a href="https://www.linkedin.com/in/sohilakabbas/details/recommendations/" target="_blank" rel="noopener noreferrer">View LinkedIn recommendations '+icon+'</a></div></section>';
}
export function studioHome(profile,cases,repositories,projects,reports,status,homeSections={},professionalEvidence={}){
 const featuredRepos=(homeSections.featured||[
  'fmcg-sales-churn-drop-analysis-powerbi',
  'SMART-Supply-Chain-Insights-Dashboard',
  'Wuzzuf-Job-Market-Analysis'
 ]).filter(repo=>repositories.some(item=>item.name===repo)).slice(0,3);
 const cards=featuredRepos.map((repo,index)=>{
  const project=projects.find(item=>item.repo===repo);
  const repository=repositories.find(item=>item.name===repo);
  const report=reports.find(item=>item.repo===repo);
  const caseStudy=Object.values(cases).find(item=>item.repo===repo);
  if(!project||!repository)return '';
  const image=report?.images?.[0]||project.media;
  const caption=image?.caption||image?.kind||'Project preview';
  const visualCaption=report?.preview_kind==='cover'?'Editorial cover':report?.preview_kind==='diagram'?'Source diagram':'Saved report image';
  const visual=image?'<figure class="editorial-case-figure"><a class="editorial-case-visual" href="'+e(image.src)+'" data-lightbox="'+e(repo)+'" data-caption="'+e(caption)+'"><img src="'+e(image.src)+'" alt="'+e(image.alt||project.title+' — '+caption)+'" width="'+(image.width||1440)+'" height="'+(image.height||850)+'" loading="'+(index===0?'eager':'lazy')+'"'+(index===0?' fetchpriority="high"':'')+' decoding="async"><span class="image-fallback" hidden>Saved preview unavailable. Use the report and source links below.</span><span class="editorial-image-action">Enlarge image ↗</span></a><figcaption>'+e(caption)+' · '+visualCaption+'</figcaption></figure>':'<div class="editorial-case-no-image">Project materials and source documentation</div>';
  const tags=(project.technologies||[]).slice(0,4).map(tool=>'<span>'+e(tool)+'</span>').join('');
  return '<article class="editorial-case-card" data-featured-case="'+e(repo)+'" data-name="'+e(repo)+'"><div class="editorial-case-media"><span class="editorial-case-index">0'+(index+1)+' / '+e(caseStudy?.type||'CASE STUDY')+'</span>'+visual+'</div><div class="editorial-case-copy"><div class="editorial-case-meta"><span>SELECTED CASE STUDY</span>'+(status[repo]?'<span>IN PROGRESS</span>':'')+'</div><h3><a href="'+route(repo)+'">'+e(project.title)+'</a></h3><p class="editorial-case-intro">'+e(caseStudy?.intro||project.summary)+'</p>'+featuredProofMarkup(repo)+(caseStudy?.problem&&!featuredCaseProof[repo]?'<div class="editorial-business-question"><span>THE BUSINESS QUESTION</span><p>'+e(caseStudy.problem)+'</p></div>':'')+'<div class="editorial-case-tags">'+tags+'</div><div class="editorial-case-actions">'+link(route(repo),'Read the case study')+(report?link(reportRoute(repo),'Report & preview'):link(project.source,'Source on GitHub'))+'</div></div></article>';
 }).join('');
 const experience=(profile.experience||[]).map((job,index)=>'<article class="editorial-experience-item"><span>0'+(index+1)+' / '+e(job.organization)+'</span><h3>'+e(job.role)+'</h3><p>'+e(job.dates)+' · '+e(job.mode)+'</p></article>').join('');
 return '<div class="editorial-home">'
  +'<section class="wrap editorial-hero" aria-labelledby="hero-title"><div class="editorial-hero-copy"><span class="eyebrow">REMOTE DATA ANALYST / BI DEVELOPER</span><h1 id="hero-title">BI Developer &amp; Data Analyst.<br><em>Clearer decisions from data.</em></h1><div class="hero-actions editorial-hero-actions">'+link('/resume/','View resume','button primary')+link('/work/#case-studies','See case studies','button button-secondary')+'</div><p class="editorial-hero-lead">I turn business data into reliable Power BI reporting through SQL, data modeling, DAX, and clear KPI definitions—from source validation to decision-ready dashboards.</p><p class="editorial-hero-proof">500K+ order lines · 47K+ orders · 70K+ retailers analyzed in an independent B2B retail case study.</p><p class="editorial-role-line">Role focus: BI reporting <span>·</span> SQL <span>·</span> Power BI <span>·</span> Data modeling</p><p class="editorial-location"><span>Open to remote roles</span><span>Cairo, Egypt · UTC+2</span><span>ET overlap</span><span>English: Excellent</span></p><div class="editorial-trust-links">'+link('mailto:'+profile.email,'Email me','button button-secondary')+link('/contact/','Contact details')+link(profile.linkedin,'LinkedIn')+link(profile.github,'GitHub')+'<button class="copy-email text-link" type="button">Copy email</button></div></div><figure class="editorial-hero-portrait"><img src="/sohila-portrait.webp" alt="Sohila Khaled Abbas" width="681" height="1024" fetchpriority="high"><figcaption><strong>'+e(profile.name)+'</strong><span>BI DEVELOPER · DATA ANALYST · DAMIETTA, EGYPT</span></figcaption></figure></section>'
  +'<section id="capabilities" class="wrap editorial-evidence-strip" aria-label="Core capabilities"><span class="eyebrow">CORE DISCIPLINES</span><ul><li>Power BI &amp; DAX</li><li>SQL &amp; data modeling</li><li>Power Query &amp; validation</li><li>Analytics engineering</li><li>Reporting automation</li></ul></section>'
  +'<section id="case-studies" class="wrap page-section home-featured-work editorial-featured-work" aria-labelledby="home-featured-title"><div class="section-label"><span>SELECTED WORK / CASE STUDIES</span><span class="mono muted">START HERE</span></div><div class="editorial-section-heading"><h2 id="home-featured-title">A closer look at<br><em>the decisions behind the report.</em></h2><p>Each case study connects the question, data preparation, modeling choices, report, and limits of the available evidence.</p></div><div class="editorial-case-list">'+cards+'</div><div class="editorial-section-footer">'+link('/work/','Explore the full project collection')+link('/dashboards/','Browse dashboard previews')+'</div></section>'
  +'<section id="approach" class="wrap page-section editorial-method-section"><div class="section-label"><span>HOW I APPROACH ANALYTICAL WORK</span><span class="mono muted">QUESTION → EVIDENCE → REPORT</span></div><div class="editorial-section-heading"><h2>Build the answer<br><em>before decorating the chart.</em></h2><p>A report is only useful when its definitions, transformations, and limits can be explained.</p></div><div class="editorial-method-grid"><article><span>01 / FRAME</span><h3>Start with the decision.</h3><p>Clarify the business question, the metric definition, and the grain the report needs to represent.</p></article><article><span>02 / VALIDATE</span><h3>Check the source.</h3><p>Inspect keys, types, missing values, duplicates, and the rules behind each transformation.</p></article><article><span>03 / MODEL</span><h3>Make measures traceable.</h3><p>Structure facts and dimensions, define relationships, and document KPI logic in SQL and DAX.</p></article><article><span>04 / EXPLAIN</span><h3>Report with context.</h3><p>Use focused visuals, practical navigation, source notes, and clear limitations to support interpretation.</p></article></div></section>'
  +'<section id="experience-summary" class="wrap page-section editorial-experience-section"><div class="section-label"><span>EXPERIENCE / APPLIED WORK</span><span class="mono muted">VERIFIED ROLES</span></div><div class="editorial-experience-heading"><h2>Experience across<br><em>BI and applied analytics.</em></h2><p>My professional experience includes remote freelance BI development and an applied machine-learning internship. Independent case studies provide additional evidence of my reporting and data-work methods.</p></div><div class="editorial-experience-list">'+experience+'</div><div class="editorial-section-footer">'+link('/about/#experience','About & experience')+link('/resume/','View full resume')+'</div></section>'
  +'<section id="home-contact" class="wrap editorial-contact-section"><span class="eyebrow">CONTACT / REMOTE ROLE OPPORTUNITIES</span><h2>Have a Data or BI role<br><em>in mind?</em></h2><p>I’m based in Damietta, Egypt, and open to remote Data Analyst and BI Developer opportunities.</p>'+link('/contact/','Contact me about a role','button primary')+'</section>'
  +'</div>';
}
const serviceAreas=[
 ['BI & reporting','A clearer view of the business.','Power BI reports, DAX measures, Power Query transformations, and dimensional models.', ['KPI definitions & reporting logic','Report design & semantic models','Documentation & handover'],'Power BI'],
 ['Data engineering','A foundation you can trace.','SQL and Python workflows that connect source data, quality checks, and warehouse-ready models.', ['ETL / ELT workflows','Data quality & validation','Star and galaxy schema modeling'],'SQL'],
 ['Automation & AI','Make the repeatable work repeatable.','n8n integrations, document and knowledge pipelines, and practical AI-assisted workflows.', ['API & application integrations','RAG and document workflows','Operational notes & runbooks'],'n8n'],
];
export function servicesTeaser(){return `<section class="services-teaser"><div class="wrap"><span class="eyebrow">WORKING APPROACH</span><h2>Clear questions.<br><em>Traceable reporting.</em></h2><div class="services-teaser-grid">${serviceAreas.slice(0,3).map((s,i)=>`<a href="/services/#how-i-work-capabilities-title"><span>0${i+1} / ${s[0]}</span><p>${s[1]}</p>${icon}</a>`).join('')}</div>${link('/services/','How I work','button cream')}</div></section>`;}

export function servicesPage(profile){
  const steps=[
    ['01 / BUSINESS QUESTION','Frame the decision','Clarify the business context, the stakeholder, the KPI definitions, and the decision the report needs to support.'],
    ['02 / DATA REVIEW','Understand the source','Review source structure, data grain, keys, missing values, duplicates, refresh cadence, and known limitations.'],
    ['03 / MODEL & METRICS','Build a traceable foundation','Prepare and validate the data, structure facts and dimensions, define relationships, and make KPI logic clear in SQL and DAX.'],
    ['04 / REPORT','Make the answer usable','Build focused Power BI views with clear navigation, useful filters, metric context, and practical ways to explore the results.'],
    ['05 / HANDOVER','Leave the work understandable','Document transformations, metric definitions, refresh assumptions, known limitations, and the steps the team needs to maintain the report.']
  ];
  const stepsMarkup=steps.map(step=>'<li class="how-i-work-step"><span class="eyebrow">'+step[0]+'</span><h2>'+step[1]+'</h2><p>'+step[2]+'</p></li>').join('');
  const capabilitiesMarkup=serviceAreas.map((service,index)=>'<article><span class="eyebrow">0'+(index+1)+' / '+service[0]+'</span><h3>'+service[1]+'</h3><p>'+service[2]+'</p><ul>'+service[3].map(item=>'<li>'+item+'</li>').join('')+'</ul></article>').join('');
  const inquiryMarkup=businessInquiry()
    .replace('id="business-inquiry" class="wrap page-section business-inquiry-section"','id="how-i-work-inquiry" class="wrap page-section business-inquiry-section how-i-work-inquiry"')
    .replace('PROJECT INQUIRY / START HERE','REMOTE ROLE / BI CONVERSATION')
    .replace('Tell me about the<br><em>work you have in mind.</em>','Tell me about the<br><em>role or BI challenge.</em>')
    .replace('Share the question, the data or tools involved, and the outcome you are working towards. You do not need a business verification invitation to get in touch.','Share the business question, reporting context, or remote role you would like to discuss. The existing inquiry workflow remains available for a straightforward follow-up.')
    .replace('Project description *','Role or BI challenge *')
    .replace('What are you trying to solve? Include any useful context about the data, tools, deliverables, or timeline.','What decision, reporting need, or remote role should we discuss? Include the data, tools, team context, or responsibilities.')
    .replace('Send project inquiry','Send inquiry')
    .replace('<option value="Not sure yet">Not sure yet</option>','<option value="Not sure yet" selected>Not sure yet</option>');
  return intro('WORKING APPROACH / BUSINESS INTELLIGENCE','How I work','I approach BI work as a collaborative team process: understand the decision, validate the data, shape a traceable model, deliver a useful report, and document the handover.')
    +'<section class="wrap page-section how-i-work-process" aria-labelledby="how-i-work-process-title"><div class="section-label"><span>FROM BUSINESS QUESTION TO HANDOVER</span><span class="mono muted">A CLEAR, REVIEWABLE PROCESS</span></div><div class="editorial-section-heading"><h2 id="how-i-work-process-title">Make every step<br><em>clear and traceable.</em></h2><p>The report is the visible output. The definitions, validation, and handover behind it are just as important.</p></div><ol class="how-i-work-steps">'+stepsMarkup+'</ol></section>'
    +'<section class="wrap page-section how-i-work-capabilities" aria-labelledby="how-i-work-capabilities-title"><div class="section-label"><span>TOOLS &amp; CONTRIBUTION</span></div><div class="editorial-section-heading"><h2 id="how-i-work-capabilities-title">The work around<br><em>the report.</em></h2><p>Depending on the team and data environment, I can contribute across reporting, data foundations, and practical automation.</p></div><div class="how-i-work-capability-grid">'+capabilitiesMarkup+'</div></section>'
    +inquiryMarkup
    +'<section id="business-inquiry" class="wrap page-section how-i-work-contact" aria-labelledby="how-i-work-contact-title"><div><span class="eyebrow">CONTACT / REMOTE ROLE OPPORTUNITIES</span><h2 id="how-i-work-contact-title">Have a BI role<br><em>in mind?</em></h2><p>I’m open to remote Data Analyst and BI Developer roles. Email is the simplest way to discuss a team, role, or reporting problem.</p><div class="service-primary-actions">'+link('mailto:'+profile.email,'Email me','button primary')+link('/contact/','Contact details')+'</div></div></section>';
}

export function searchDialog(index){return `<dialog id="project-finder" class="project-finder" aria-labelledby="finder-title"><div class="finder-top"><h2 id="finder-title">Find a project</h2><button data-finder-close aria-label="Close project search">×</button></div><label class="finder-field"><span class="sr-only">Search project titles, tools, and topics</span><input id="finder-query" type="search" placeholder="Try Python, Power BI, n8n, or a project name…" autocomplete="off"></label><p id="finder-status" role="status" aria-live="polite"></p><div id="finder-results"></div><div class="finder-help"><span>↑ ↓ to navigate · Enter to open · Esc to close</span><a href="/work/">Browse all work ↗</a></div></dialog><script type="application/json" id="project-search-index">${JSON.stringify(index).replaceAll('<','\\u003c')}</script>`;}

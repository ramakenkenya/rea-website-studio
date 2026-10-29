import {escapeHtml as e,snapshot} from './project.js';
import {createStudio,navigationHtml,brandCss} from './site-model.js';
import {shopSection} from './shop-model.js';
import {sectionHasContent} from './document-model.js';
const para=value=>String(value||'').split(/\n\s*\n/).filter(Boolean).map(t=>`<p>${e(t).replaceAll('\n','<br>')}</p>`).join('');
const button=b=>b?`<a class="site-button" href="${e(b.href)}">${e(b.label)}</a>`:'';
const image=a=>a?`<img src="${e(a.src)}" alt="${e(a.alt||'')}" loading="lazy">`:'';
// Raw selectors must use selectorsAdd. Selector model strings represent class
// names, so passing '.site-nav nav' there escapes it into a different selector.
const style=(selector,properties,media)=>({selectors:[],selectorsAdd:selector,style:properties,...(media?{mediaText:media,atRuleType:'media'}:{})});
export const DOCUMENT_STYLES=[
 style('body',{margin:'0','font-family':'Arial, sans-serif','line-height':'1.65'}),
 style('.site-nav',{display:'flex','justify-content':'space-between','align-items':'center',gap:'24px',padding:'24px'}),
 style('.site-nav nav',{display:'flex',gap:'20px','align-items':'center'}),
 style('a',{color:'inherit'}),style('.site-brand',{'font-weight':'700','text-decoration':'none'}),
 style('.site-hero',{padding:'72px 24px',display:'grid',gap:'28px','align-items':'center'}),
 style('.site-hero h1',{'font-size':'clamp(32px, 5vw, 60px)','line-height':'1.1',margin:'0 0 24px'}),
 style('.studio-block',{padding:'44px 24px'}),style('.doc-cards',{display:'grid','grid-template-columns':'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',gap:'20px'}),
 style('.doc-card',{padding:'22px',border:'1px solid currentColor','border-radius':'12px'}),
 style('.site-button',{display:'inline-block',padding:'12px 22px','text-decoration':'none','margin-top':'12px'}),
 style('img',{'max-width':'100%',height:'auto','border-radius':'12px'}),
 style('.doc-gallery',{display:'grid','grid-template-columns':'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',gap:'20px'}),
 style('.doc-gallery figure',{margin:'0'}),style('.doc-gallery img',{width:'100%','aspect-ratio':'4/3','object-fit':'cover'}),
 style('.doc-faq details',{padding:'16px 0','border-bottom':'1px solid currentColor'}),style('.doc-faq summary',{cursor:'pointer','font-weight':'700'}),
 style('.site-footer',{padding:'36px 24px','border-top':'1px solid currentColor'}),
 style('.site-footer nav',{display:'flex',gap:'18px','flex-wrap':'wrap'}),
 style('.site-hero',{padding:'40px 20px'},'(max-width: 640px)'),style('.site-nav',{padding:'20px'},'(max-width: 640px)')
 ,style('*, *::before, *::after',{'box-sizing':'border-box'})
 ,style('.site-nav nav a',{'text-decoration':'none','font-weight':'600'})
 ,style('.site-hero:has(> img)',{'grid-template-columns':'minmax(0, 1fr) minmax(0, 1fr)'},'(min-width: 760px)')
 ,style('.site-hero > img',{width:'100%','aspect-ratio':'4/3','object-fit':'cover'})
 ,style('.site-footer a',{'text-decoration':'none'})
 ,style('.site-nav nav',{'flex-wrap':'wrap',gap:'16px'},'(max-width: 640px)')
];
function sectionHtml(s,draft){
 if(!sectionHasContent(s,draft))return '';
 const open=`<section id="${e(s.id)}" class="studio-block" data-section="${e(s.type)}">`;
 const heading=s.heading?`<h2>${e(s.heading)}</h2>`:'';
 let content='';
 if(s.type==='shop')return `<div id="${e(s.id)}" data-section="Shop">${heading||s.body?`<section class="studio-block">${heading}${para(s.body)}${button(s.button)}</section>`:button(s.button)}${shopSection(draft.shop,draft.brief.name)}</div>`;
 if(s.type==='gallery'){
  const g=draft.galleries.find(g=>g.section===s.id);if(!g?.images.length)return '';
  content=`<div class="doc-gallery">${g.images.map(a=>`<figure>${image(a)}${a.caption?`<figcaption>${e(a.caption)}</figcaption>`:''}${a.sourceUrl?`<figcaption><a href="${e(a.sourceUrl)}" target="_blank" rel="noopener noreferrer">Photo source</a>${a.artist?' · '+e(a.artist):''}${a.license?' · '+e(a.license):''}</figcaption>`:''}</figure>`).join('')}</div>`;
 }else if(s.type==='faq'){
  const f=draft.faqs.find(f=>f.section===s.id);if(!f?.items.length)return '';
  content=`<div class="doc-faq">${f.items.map(item=>`<details><summary>${e(item.q)}</summary>${para(item.a)}</details>`).join('')}</div>`;
 }else if(s.type==='contact'){
  content=contactHtml(draft);
 }else if(s.type==='hours'){
  content=draft.contact.hours.map(([day,hours])=>`<p>${e(day)}${hours?' · '+e(hours):''}</p>`).join('');
 }else if(s.items.length){
  content=`<div class="doc-cards">${s.items.map(item=>`<article class="doc-card">${item.title?`<h3>${e(item.title)}</h3>`:''}${para(item.body)}${item.value?`<p><strong>${e(item.value)}</strong></p>`:''}${item.href?`<a href="${e(item.href)}">${e(item.title||'Learn more')}</a>`:''}</article>`).join('')}</div>`;
 }
 if(!heading&&!s.body&&!content&&!s.button)return '';
 return open+heading+para(s.body)+content+button(s.button)+'</section>';
}
function contactHtml(d){return [d.brief.email?`<p><a href="mailto:${e(d.brief.email)}">${e(d.brief.email)}</a></p>`:'',d.shop.phone?`<p><a href="tel:+${e(d.shop.phone)}">+${e(d.shop.phone)}</a></p>`:'',para(d.contact.address),...d.contact.socials.map(s=>`<p><a href="${e(s.href)}" target="_blank" rel="noopener noreferrer">${e(s.label)}</a></p>`)].join('');}
export function documentSite(draft){
 const {brief}=draft;const pages=draft.pages.map(p=>({id:p.id,name:p.name,component:{tagName:'body',attributes:{lang:draft.site.language,dir:draft.site.direction},components:[]}}));
 const assets=[];const seen=new Map();
 const asset=a=>{if(!a)return;const existing=seen.get(a.src);const licenseUrl=a.license==='CC0'?'https://creativecommons.org/publicdomain/zero/1.0/':'';if(existing){for(const key of ['artist','license','sourceUrl'])if(a[key])existing[key]=a[key];if(licenseUrl)existing.licenseUrl=licenseUrl;return;}const record={id:'import-photo-'+assets.length,name:a.alt||'Imported photo',src:a.src,alt:a.alt||'',artist:a.artist||'',license:a.license||'',sourceUrl:a.sourceUrl||'',licenseUrl};seen.set(a.src,record);assets.push(record);};
 for(const p of draft.pages)asset(p.hero.image);for(const g of draft.galleries)g.images.forEach(asset);for(const p of draft.shop.products)if(p.image)asset({src:p.image,alt:p.alt});
 const project={pages,styles:DOCUMENT_STYLES};
 const studio=createStudio(project,brief,{version:2,homeId:draft.homeId,pages:draft.pages.map(p=>({id:p.id,name:p.name,slug:p.slug,title:p.title,description:p.description,nav:true,noindex:false})),site:draft.site,shop:draft.shop,assets,autosave:false});
 for(const [i,p] of draft.pages.entries()){
  const h=p.hero;const hero=`<section id="${e(h.id)}" class="site-hero" data-section="Hero"><div><h1>${e(h.heading)}</h1>${para(h.body)}${button(h.button)}</div>${image(h.image)}</section>`;
  const own=draft.sections.filter(s=>s.page===p.id);
  const ordered=[...p.sectionIds.filter(key=>key!==h.id).map(key=>own.find(s=>s.id===key)),...own.filter(s=>!p.sectionIds.includes(s.id))].filter(Boolean);
  let sections=ordered.map(s=>sectionHtml(s,draft)).join('');
  if(draft.productPages.includes(p.id)&&!own.some(s=>s.type==='shop'))sections+=shopSection(draft.shop,brief.name);
  const footer=`<footer class="site-footer" data-section="Footer">${para(draft.footer)}${contactHtml(draft)}${para(draft.notice)}<nav aria-label="Footer navigation">${studio.pages.map(p=>`<a href="${p.id===studio.homeId?'index.html':e(p.slug)+'.html'}">${e(p.name)}</a>`).join('')}</nav></footer>`;
  project.pages[i].component.components=navigationHtml(studio,p.id)+hero+sections+footer;
 }
 // GrapesJS receives portable rule objects; shared branding is applied by Studio init.
 return snapshot(brief,project,studio);
}

import {normalizeBrief} from './project.js';
import {assertSafeValue,validateSlug,SYSTEM_FONTS} from './site-model.js';
import {normalizeShop} from './shop-model.js';
import {remoteImageUrl} from './images.js';
const types=new Set(['text','services','gallery','faq','shop','pricing','team','statistics','hours','contact','cta']);
const palettes={editorial:{paper:'#f5f1e9',ink:'#202c2d',accent:'#ad462e'},coastal:{paper:'#eff6f4',ink:'#143b3b',accent:'#12675d'},midnight:{paper:'#1b2530',ink:'#f5f0e8',accent:'#e7b78c'}};
const clean=v=>String(v??'').trim();
const lines=v=>clean(v).split(/\r?\n/).map(clean).filter(Boolean);
const columns=v=>String(v).split('|').map(clean);
const id=v=>{const s=clean(v);if(!/^[a-z][a-z0-9-]{0,63}$/.test(s))throw Error('Use IDs with lowercase letters, numbers and hyphens.');return s;};
export function importLink(value,pageFiles){
 const s=clean(value);if(!s)return '';
 if(/[\u0000-\u0020<>"'\\]/.test(s))throw Error('Invalid link destination.');
 if(s.startsWith('#')){if(!/^#[a-z][a-z0-9-]*$/.test(s))throw Error('Invalid section link.');return s;}
 if(/^[a-z0-9-]+\.html(?:#[a-z][a-z0-9-]*)?$/.test(s)){if(!pageFiles.has(s.split('#')[0]))throw Error('Link points to an unknown page: '+s);return s;}
 let u;try{u=new URL(s);}catch{throw Error('Use a page filename, section anchor or complete HTTPS link.');}
 if(u.protocol==='https:'){remoteImageUrl(s.split('#')[0]);return s;}
 if(u.protocol==='mailto:'&&/^mailto:[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(s))return s;
 if(u.protocol==='tel:'&&/^tel:\+?[\d()-]{6,30}$/.test(s))return s;
 throw Error('Use a safe HTTPS, email, phone or page link.');
}
export function reviewDocument(raw,overrides={}){
 const issues=[],warnings=[];const draft={};
 const attempt=(label,fn,fallback)=>{try{return fn();}catch(e){issues.push(label+': '+e.message);return fallback;}};
 const f=raw.fields||{},r=raw.records||{};
 attempt('Document',()=>assertSafeValue(raw));
 const text=(value,max=5000)=>{const s=clean(value);if(s.length>max)throw Error('Use at most '+max+' characters.');return s;};
 const initial={name:f['business.name'],description:f['business.description'],email:f['business.email'],services:f['business.services'],title:f['business.name'],theme:f['brand.style']||'editorial',cta:'Explore'};
 for(const k of ['name','description','email','services','title','theme','cta'])if(Object.hasOwn(overrides,k))initial[k]=overrides[k];
 draft.brief=attempt('Business details',()=>{for(const [key,v] of Object.entries(initial))text(v,key==='description'?320:180);return normalizeBrief(initial);},{name:clean(initial.name),description:'',email:'',theme:'editorial'});
 const pageRecords=r.page||[],sectionRecords=r.section||[],productRecords=r.product||[];
 if(pageRecords.length>20||lines(f['site.pages']).length>20)issues.push('Use at most 20 pages.');
 if(sectionRecords.length>100)issues.push('Use at most 100 additional sections.');
 if(productRecords.length>40)issues.push('Use at most 40 products.');
 const pageMap=new Map();for(const p of pageRecords){const key=clean(p['page.id']);if(!key){issues.push('A page record needs a Page ID.');continue;}if(pageMap.has(key))issues.push('Duplicate page ID: '+key);pageMap.set(key,p);}
 let definitions=lines(f['site.pages']).map(row=>{const [key,name,file,...extra]=columns(row);if(extra.length)issues.push('Page navigation rows need ID | name | address.');return {id:key,name,file};});
 if(!definitions.length)definitions=(pageRecords.length?pageRecords:[{'page.id':'home'}]).map(p=>({id:p['page.id'],name:p['page.id']==='home'?'Home':p['page.id'],file:''}));
 const home=clean(f['site.home'])||definitions.find(p=>p.file==='index.html')?.id||definitions[0]?.id;
 const used=new Set();draft.pages=definitions.slice(0,20).map(p=>attempt('Page '+p.id,()=>{
  const key=id(p.id);if(used.has(key))throw Error('Duplicate page ID.');used.add(key);
  const slug=validateSlug(p.file&&p.file!=='index.html'?p.file.replace(/\.html$/,''):key,[]);
  if(p.file&&(!/^[a-z0-9-]+\.html$/.test(p.file)||p.id===home&&p.file!=='index.html'||p.id!==home&&p.file==='index.html'))throw Error('Use index.html for Home and unique .html addresses for other pages.');
  const record=pageMap.get(key)||{};
  return {id:key,name:text(p.name||key,180),slug,title:text(record['page.title']||draft.brief.name,180),description:text(record['page.description']||draft.brief.description,320),record,sectionIds:clean(record['page.sections']).split(/[\s,]+/).filter(Boolean)};
 },null)).filter(Boolean);
 if(!draft.pages.some(p=>p.id===home))issues.push('Home page ID must match a listed page.');
 for(const key of pageMap.keys())if(!used.has(key))issues.push('Page record is not listed in navigation: '+key);
 const files=new Set(draft.pages.map(p=>p.id===home?'index.html':p.slug+'.html'));
 if(files.size!==draft.pages.length)issues.push('Page addresses must be unique.');
 const button=value=>{const [label,href,...extra]=columns(value||'');if(!label&&!href)return null;if(!label||!href||extra.length)throw Error('Use button text | destination.');return {label:text(label,180),href:importLink(href,files)};};
 const image=value=>{const [src,alt,...extra]=columns(value||'');if(!src)return null;if(extra.length)throw Error('Use image URL | description.');if(!alt)warnings.push('An image has no alternative text. Add a description in Assets.');return {src:remoteImageUrl(src),alt:text(alt,320)};};
 const sectionIds=new Set();const uniqueSection=value=>{const key=id(value);if(sectionIds.has(key))throw Error('Duplicate section ID: '+key);sectionIds.add(key);return key;};
 for(const p of draft.pages)p.hero=attempt('Hero on '+p.name,()=>({id:uniqueSection(p.record['page.hero.id']||p.id+'-hero'),heading:text(p.record['page.hero.heading']||(p.id===home?draft.brief.name:p.name),180),body:text(p.record['page.hero.body']|| (p.id===home?draft.brief.description:'')),button:button(p.record['page.hero.button']),image:image(p.record['page.hero.image'])}),{id:p.id+'-hero',heading:p.name,body:''});
 draft.sections=sectionRecords.slice(0,100).map(s=>attempt('Section '+(s['section.id']||'without an ID'),()=>{
  const page=clean(s['section.page']);if(!used.has(page))throw Error('Unknown page ID: '+page);
  const key=uniqueSection(s['section.id']),type=clean(s['section.type']);if(!types.has(type))throw Error('Choose a supported section type.');
  const items=lines(s['section.items']);if(items.length>40)throw Error('Use at most 40 items per section.');
  return {page,id:key,type,heading:text(s['section.heading'],180),body:text(s['section.body']),button:button(s['section.button']),items:items.map(line=>{const [title,body,value,href,...extra]=columns(line);if(extra.length)throw Error('Item rows need title | description | value | destination.');return {title:text(title,180),body:text(body),value:text(value,180),href:importLink(href,files)};})};
 },null)).filter(Boolean);
 for(const p of draft.pages){const valid=new Set([p.hero.id,...draft.sections.filter(s=>s.page===p.id).map(s=>s.id)]);for(const key of p.sectionIds)if(!valid.has(key))issues.push('Unknown section '+key+' on '+p.name);if(new Set(p.sectionIds).size!==p.sectionIds.length)issues.push('Repeated section in display order on '+p.name);if(p.sectionIds.includes(p.hero.id)&&p.sectionIds[0]!==p.hero.id)issues.push('Keep the hero first on '+p.name);}
 const rawProducts=[];const currencies=new Set();draft.productPages=[];
 for(const p of productRecords.slice(0,40))attempt('Product '+(p['product.name']||p['product.code']||'without a name'),()=>{
  const page=clean(p['product.page']);if(!used.has(page))throw Error('Unknown Shop page ID: '+page);draft.productPages.push(page);
  const [price,currency='KES',...extra]=columns(p['product.price']||'');if(!price||extra.length)throw Error('Enter a price and currency, for example 48000 | KES.');currencies.add(currency.toUpperCase());
  const opts={};for(const pair of clean(p['product.options']).split(';').filter(Boolean)){const match=/^(Size|Colour|Color)\s*:\s*(.+)$/i.exec(pair.trim());if(!match)throw Error('Use Size: values; Colour: values.');const k=match[1].toLowerCase()==='size'?'sizes':'colours';if(opts[k])throw Error('Options are listed more than once.');opts[k]=match[2].split(',').map(clean);}
  const available=clean(p['product.available']).toLowerCase();if(available&&!['available','unavailable'].includes(available))throw Error('Availability must be available or unavailable.');
  const pic=image(p['product.image']);const product={code:p['product.code'],name:p['product.name'],price,category:p['product.category'],description:p['product.description'],image:pic?.src||'',alt:pic?.alt||'',available:available!=='unavailable',...opts};
  normalizeShop({currency,products:[product]});rawProducts.push(product);
 });
 if(currencies.size>1)issues.push('All products must use the same currency.');
 draft.shop=attempt('Shop',()=>normalizeShop({phone:f['business.phone']||'',currency:[...currencies][0]||'KES',products:rawProducts}),{currency:'KES',phone:'',products:[]});
 const findSection=(key,type)=>draft.sections.find(s=>s.id===key&&s.type===type);
 const credits=new Map();for(const g of r.gallery||[])for(const line of lines(g['gallery.credits']))attempt('Photo credit',()=>{const [src,artist,sourceUrl,license,...extra]=columns(line);if(extra.length)throw Error('Use image URL | creator | source URL | licence.');credits.set(remoteImageUrl(src),{artist:text(artist,180),sourceUrl:sourceUrl?remoteImageUrl(sourceUrl):'',license:text(license,80)});});
 const linked=new Set();draft.galleries=(r.gallery||[]).map(g=>attempt('Gallery '+g['gallery.section'],()=>{
  const section=clean(g['gallery.section']);if(!findSection(section,'gallery'))throw Error('Match an existing gallery section ID.');if(linked.has(section))throw Error('Duplicate gallery record.');linked.add(section);
  const images=lines(g['gallery.images']);if(images.length>12)throw Error('Use at most 12 pictures in each gallery.');
  return {section,images:images.map(line=>{const [src,alt,caption,...extra]=columns(line);if(extra.length)throw Error('Use image URL | description | caption.');const url=remoteImageUrl(src);return {src:url,alt:text(alt,320),caption:text(caption,500),...credits.get(url)};})};
 },null)).filter(Boolean);
 const faqKeys=new Set();draft.faqs=(r.faq||[]).map(faq=>attempt('FAQ '+faq['faq.section'],()=>{const section=clean(faq['faq.section']);if(!findSection(section,'faq'))throw Error('Match an existing faq section ID.');if(faqKeys.has(section))throw Error('Duplicate FAQ record.');faqKeys.add(section);const rows=lines(faq['faq.items']);if(rows.length>40)throw Error('Use at most 40 questions per FAQ.');return {section,items:rows.map(line=>{const [q,a,...extra]=columns(line);if(!q||!a||extra.length)throw Error('Use question | answer.');return {q:text(q,300),a:text(a)};})};},null)).filter(Boolean);
 const theme=draft.brief.theme||'editorial';const brand={...palettes[theme],font:clean(f['brand.font'])||'serif',width:1160,radius:12};
 if(!Object.hasOwn(SYSTEM_FONTS,brand.font))issues.push('Choose a supported font: serif, sans, modern or mono.');
 if(clean(f['brand.colors']))attempt('Brand colours',()=>{const colors=clean(f['brand.colors']).match(/#[a-f\d]{6}\b/gi)||[];if(colors.length!==3)throw Error('Provide three hex colours: background, text, buttons.');[brand.paper,brand.ink,brand.accent]=colors;});
 const lang=clean(f['site.language']).toLowerCase();let language=lang.split(',')[0].trim()||'en';language=({english:'en',swahili:'sw',kiswahili:'sw'})[language]||language;
 if(!/^[a-z]{2,8}(?:-[a-z0-9]{1,8})*$/i.test(language))issues.push('Use a language code such as en, sw or en-GB.');
 draft.homeId=home;draft.site={name:draft.brief.name,language,direction:/right to left|\brtl\b/.test(lang)?'rtl':'ltr',brand,logo:attempt('Logo',()=>clean(f['brand.logo'])?remoteImageUrl(f['brand.logo']):'','')};
 draft.footer=text(f['footer.text']);draft.notice=text(f['site.notice']);draft.contact={address:text(f['contact.address']),hours:lines(f['contact.hours']).map(columns),socials:lines(f['contact.socials']).map(row=>attempt('Social link',()=>{const [label,href,...extra]=columns(row);if(!label||!href||extra.length)throw Error('Use platform name | HTTPS profile URL.');return {label:text(label,100),href:remoteImageUrl(href)};},null)).filter(Boolean)};
 if(!draft.brief.email)warnings.push('No public email supplied. You can add one above or leave it empty.');
 if(!pageRecords.length)warnings.push('No page content records found. A Home page will use your brief.');
 if(!draft.shop.phone&&draft.shop.products.length)warnings.push('No WhatsApp number supplied. The shop will offer the copy-list option.');
 for(const s of draft.sections){if(s.type==='gallery'&&!draft.galleries.some(g=>g.section===s.id&&g.images.length))warnings.push('Empty gallery '+s.id+' will be omitted.');if(s.type==='faq'&&!draft.faqs.some(f=>f.section===s.id&&f.items.length))warnings.push('Empty FAQ '+s.id+' will be omitted.');}
 return {ok:issues.length===0,issues,warnings,draft};
}

import {validateSnapshot} from './project.js';

const e=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
const RESERVED=new Set(['index','404','styles','studio','robots','sitemap','readme']);
const PALETTES={editorial:{paper:'#f5f1e9',ink:'#202c2d',accent:'#ad462e'},coastal:{paper:'#eff6f4',ink:'#143b3b',accent:'#12675d'},midnight:{paper:'#1b2530',ink:'#f5f0e8',accent:'#e7b78c'}};
export const SYSTEM_FONTS={serif:{body:'Arial,Helvetica,sans-serif',heading:'Georgia,"Times New Roman",serif'},editorial:{body:'Arial,Helvetica,sans-serif',heading:'Georgia,"Times New Roman",serif'},sans:{body:'Arial,Helvetica,sans-serif',heading:'Arial,Helvetica,sans-serif'},modern:{body:'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',heading:'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'},mono:{body:'Arial,Helvetica,sans-serif',heading:'"Courier New",monospace'}};
const clean=value=>String(value??'').trim();
function text(value,fallback='',max=320){const result=clean(value??fallback);if(result.length>max)throw new Error('Invalid studio text: too long.');return result;}
function decodeEntities(value){return value.replace(/&#(x[\da-f]+|\d+);?/gi,(_,code)=>{const n=code[0].toLowerCase()==='x'?parseInt(code.slice(1),16):Number(code);return n<=0x10ffff?String.fromCodePoint(n):'';}).replace(/&(colon|tab|newline|amp);/gi,(_,name)=>({colon:':',tab:'\t',newline:'\n',amp:'&'}[name.toLowerCase()]));}
function inspectString(value){
 const decoded=decodeEntities(value),flat=decoded.replace(/[\u0000-\u0020\u007f-\u009f]/g,'');
 if(/(?:javascript|vbscript):|data:(?!image\/(?:png|jpe?g|gif|webp|avif|bmp|x-icon|vnd\.microsoft\.icon|svg\+xml)(?:;|,))/i.test(flat)||/<\s*\/?\s*(?:script|iframe|object|embed|meta|link|foreignobject)\b|\bon[a-z]+\s*=|expression\s*\(|@import\b|-moz-binding\s*:|(?<![\w-])behavior\s*:/i.test(decoded))throw new Error('Unsafe content in project file.');
 // SVG data URLs are encoded in original templates and uploads. Inspect the payload,
 // rather than treating percent/base64 encoding as a sanitizer.
 const svgPattern=/data:image\/svg\+xml((?:;[a-z0-9=.-]+)*),([^\s"'<>]*)/gi;
 for(const match of decoded.matchAll(svgPattern)){
  let svg;try{svg=/;base64/i.test(match[1])?atob(match[2]):decodeURIComponent(match[2]);}catch{throw new Error('Unsafe or invalid SVG image.');}
  if(!/^\s*(?:<\?xml[^>]*>\s*)?<svg\b/i.test(svg)||/<!\s*(?:DOCTYPE|ENTITY)/i.test(svg))throw new Error('Unsafe SVG image.');
  // Nested data images are unnecessary for original artwork and complicate limits.
  if(/data:/i.test(svg))throw new Error('Unsafe nested image in SVG.');
  inspectString(svg);
  const svgDecoded=decodeEntities(svg).replace(/[\u0000-\u0020\u007f-\u009f]/g,'');
  if(/(?:javascript|vbscript):|<\/?(?:script|iframe|object|embed|meta|link|foreignobject)\b|\bon[a-z]+=/i.test(svgDecoded)||/expression\s*\(|@import\b|<!/i.test(svg))throw new Error('Unsafe SVG image.');
 }
}
export function assertSafeValue(value){
 let count=0;
 function walk(child,depth=0){
  if(depth>80||++count>250000)throw new Error('Unsupported project complexity.');
  if(typeof child==='string')inspectString(child);
  if(child&&typeof child==='object')for(const [key,next] of Object.entries(child)){
   if(['__proto__','prototype','constructor','srcdoc'].includes(key)||(/^script(?:-|$)/i.test(key)&&next)||/^on[a-z]+$/i.test(key)||key==='tagName'&&/^(script|iframe|object|embed|meta|link|foreignobject)$/i.test(next)||key==='type'&&/^(script|iframe|object|embed|meta|foreignobject)$/i.test(next))throw new Error('Unsafe component in project file.');
   walk(next,depth+1);
  }
 }
 walk(value);return value;
}
export function validateSlug(value,pages=[],excludeId){
 const slug=clean(value).toLowerCase();
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||slug.length>80)throw new Error('Invalid page slug. Use letters, numbers and single hyphens.');
 if(RESERVED.has(slug))throw new Error('This page slug is reserved.');
 if(pages.some(page=>page.id!==excludeId&&clean(page.slug).toLowerCase()===slug))throw new Error('This page slug is already used by another page.');
 return slug;
}
export function validateSiteUrl(value){
 const raw=clean(value);if(!raw)return '';
 let url;try{url=new URL(raw);}catch{throw new Error('Enter a valid public http or https site URL.');}
 const host=url.hostname.toLowerCase().replace(/\.$/,'');
 const ipv4=/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(host);
 const privateIpv4=ipv4&&(Number(ipv4[1])===10||Number(ipv4[1])===127||Number(ipv4[1])===0||Number(ipv4[1])>=224||Number(ipv4[1])===169&&Number(ipv4[2])===254||Number(ipv4[1])===172&&Number(ipv4[2])>=16&&Number(ipv4[2])<=31||Number(ipv4[1])===192&&Number(ipv4[2])===168||Number(ipv4[1])===100&&Number(ipv4[2])>=64&&Number(ipv4[2])<=127);
 if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.search||url.hash||/[?#\\\s]/.test(raw)||privateIpv4||host.includes(':')||!host.includes('.')||/\.(?:localhost|local|internal|test|invalid)$/.test(host))throw new Error('Enter a public http or https site URL without credentials, query or fragment.');
 return url.href.replace(/\/+$/,'');
}
function image(value){
 const src=text(value,'',12*1024*1024);if(!src)return '';
 inspectString(src);
 if(/^data:image\/(?:png|jpe?g|gif|webp|avif|bmp|x-icon|vnd\.microsoft\.icon)(?:;[\w=.-]+)*;base64,[a-z0-9+/=\s]+$/i.test(src)||/^data:image\/svg\+xml(?:;[\w=.-]+)*,/i.test(src))return src;
 let url;try{url=new URL(src);}catch{throw new Error('Invalid image URL. Use an uploaded image or an http/https image URL.');}
 if(!['http:','https:'].includes(url.protocol)||url.username||url.password||/[\u0000-\u0020<>"']/g.test(src))throw new Error('Unsafe image URL.');
 return src;
}
function creditUrl(value){const raw=text(value,'',2048);if(!raw)return '';let url;try{url=new URL(raw);}catch{throw Error('Invalid image credit URL.');}if(url.protocol!=='https:'||url.username||url.password)throw Error('Invalid image credit URL.');validateSiteUrl(url.origin);return url.href;}
function list(value,name,max){if(value===undefined)return [];if(!Array.isArray(value)||value.length>max)throw new Error(`Invalid ${name} list or limit exceeded.`);return value;}
function id(value,fallback){const result=text(value,fallback,160);if(!result||/[\u0000-\u0020<>"']/.test(result))throw new Error('Invalid studio ID.');return result;}
function number(value,fallback,min,max){const n=value===undefined?fallback:Number(value);if(!Number.isFinite(n)||n<min||n>max)throw new Error('Invalid brand size.');return n;}
function bool(value,fallback){if(value===undefined)return fallback;if(typeof value!=='boolean')throw new Error('Invalid studio boolean setting.');return value;}
function unique(items,name){const ids=new Set();for(const item of items){if(ids.has(item.id))throw new Error(`Invalid duplicate ${name} ID.`);ids.add(item.id);}return items;}
export function createStudio(project,brief={},input={}){
 if(!object(input))throw new Error('Invalid studio metadata.');assertSafeValue(input);
 if(input.version!==undefined&&input.version!==2)throw new Error('Unsupported studio metadata version.');
 const source=list(project?.pages,'project pages',100);if(!source.length)throw new Error('Project must contain a page.');
 const actual=unique(source.map((p,i)=>({id:id(p.id??p.getId?.(),`page-${i+1}`),name:p.name??p.get?.('name')})),'page');
 const provided=list(input.pages,'studio pages',100);for(const p of provided)if(!object(p)||!p.id)throw new Error('Invalid studio page metadata.');
 unique(provided,'page');
 const order=[...provided.filter(p=>actual.some(a=>a.id===p.id)),...actual.filter(a=>!provided.some(p=>p.id===a.id))];
 const pages=[];
 for(const candidate of order){
  const raw=provided.find(p=>p.id===candidate.id)||{},original=actual.find(p=>p.id===candidate.id);
  const name=text(raw.name,original.name||(pages.length===0?'Home':`Page ${pages.length+1}`),180)||`Page ${pages.length+1}`;
  let slug;if(raw.slug!==undefined)slug=validateSlug(raw.slug,pages,raw.id);else{
   let base=name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,65)||'page';if(RESERVED.has(base))base+='-page';
   slug=base;let n=2;while(pages.some(p=>p.slug===slug)||provided.some(p=>p.id!==candidate.id&&clean(p.slug).toLowerCase()===slug))slug=`${base}-${n++}`;
  }
  pages.push({id:original.id,name,slug,title:text(raw.title,pages.length===0?brief.title||brief.name:name,180),description:text(raw.description,brief.description||'',320),nav:bool(raw.nav,true),noindex:bool(raw.noindex,false)});
 }
 let homeId=input.homeId;if(!pages.some(p=>p.id===homeId))homeId=pages[0].id;
 if(input.site!==undefined&&!object(input.site))throw new Error('Invalid site metadata.');
 const siteInput=input.site||{},brandInput=siteInput.brand||{};if(!object(brandInput))throw new Error('Invalid brand settings.');
 const palette=PALETTES[brief.theme]||PALETTES.editorial,brand={};
 for(const key of ['paper','ink','accent']){brand[key]=text(brandInput[key],palette[key],9);if(!/^#[a-f0-9]{6}$/i.test(brand[key]))throw new Error('Invalid brand color. Use a six-digit hex color.');}
 brand.font=text(brandInput.font,'serif',30);if(!Object.hasOwn(SYSTEM_FONTS,brand.font))throw new Error('Invalid brand font preset.');
 brand.width=number(brandInput.width,1200,640,1800);brand.radius=number(brandInput.radius,0,0,48);
 const language=text(siteInput.language,'en',35);if(!/^[a-z]{2,8}(?:-[a-z0-9]{1,8})*$/i.test(language))throw new Error('Invalid site language.');
 const direction=text(siteInput.direction,'ltr',3);if(!['ltr','rtl'].includes(direction))throw new Error('Invalid text direction.');
 const site={name:text(siteInput.name,brief.name||'My website',180),url:validateSiteUrl(siteInput.url),language,direction,socialImage:image(siteInput.socialImage),favicon:image(siteInput.favicon),logo:image(siteInput.logo),brand};
 const assets=unique(list(input.assets,'assets',200).map((a,i)=>{if(!object(a))throw new Error('Invalid asset.');const src=image(a.src);if(!src)throw new Error('Invalid empty image asset.');return {id:id(a.id,`asset-${i+1}`),name:text(a.name,`Image ${i+1}`,180),src,alt:text(a.alt,'',320),artist:text(a.artist,'',180),license:text(a.license,'',80),sourceUrl:creditUrl(a.sourceUrl),licenseUrl:creditUrl(a.licenseUrl)};}),'asset');
 const sections=unique(list(input.sections,'saved sections',100).map((s,i)=>{if(!object(s)||s.css!==undefined&&typeof s.css!=='string')throw new Error('Invalid saved section.');return {id:id(s.id,`section-${i+1}`),name:text(s.name,`Section ${i+1}`,180),html:text(s.html,'',1024*1024),css:text(s.css,'',1024*1024)};}),'section');
 const checkpoints=unique(list(input.checkpoints,'checkpoints',100).slice(0,5).map((c,i)=>{
  if(!object(c)||!object(c.snapshot))throw new Error('Invalid restore point.');
  const savedAt=text(c.savedAt,c.snapshot.savedAt,40);if(!savedAt||!Number.isFinite(Date.parse(savedAt)))throw new Error('Invalid restore point date.');
  const snap={...c.snapshot};if(snap.studio)snap.studio={...snap.studio,checkpoints:[]};
  return {id:id(c.id,`checkpoint-${i+1}`),name:text(c.name,`Restore point ${i+1}`,180),savedAt,snapshot:validateSnapshot(snap)};
 }),'checkpoint');
 return {version:2,homeId,pages,site,assets,sections,checkpoints,autosave:bool(input.autosave,false)};
}
export function pageFile(meta,studio){return meta.id===studio.homeId?'index.html':validateSlug(meta.slug,studio.pages,meta.id)+'.html';}
export function brandCss(studio){
 const b=studio.site.brand,font=SYSTEM_FONTS[b.font]||SYSTEM_FONTS.serif;
 return `:root{--studio-paper:${b.paper};--studio-ink:${b.ink};--studio-accent:${b.accent};--studio-width:${b.width}px;--studio-radius:${b.radius}px}body{background:${b.paper}!important;color:${b.ink}!important;font-family:${font.body}!important}h1,h2,h3,h4,h5,h6{font-family:${font.heading}!important}.site-nav,.site-hero,.site-section,.site-footer,.image-section,.studio-block{max-width:${b.width}px;margin-inline:auto}.site-button{background:${b.accent}!important;color:${contrast(b.accent)}!important}.hero-dot,.service-number{color:${b.accent}!important}.site-button,.service-card,.hero-art img,.image-section img,.studio-block img,.studio-card{border-radius:${b.radius}px!important}.about-section{background:color-mix(in srgb,${b.paper} 88%,${b.ink})!important}.site-brand img{max-width:180px;max-height:56px;object-fit:contain}.site-nav nav{flex-wrap:wrap}.site-nav [aria-current="page"]{text-decoration:underline;text-underline-offset:5px}@media(min-width:641px){[data-hide-desktop="true"],.studio-hide-desktop{display:none!important}}@media(max-width:640px){[data-hide-phone="true"],.studio-hide-phone{display:none!important}.site-nav{flex-wrap:wrap}.site-nav nav{width:100%;gap:16px}}`;
}
function contrast(hex){const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));return r*.299+g*.587+b*.114>160?'#111111':'#ffffff';}
export function navigationHtml(studio,currentId){
 const home=studio.pages.find(p=>p.id===studio.homeId)||studio.pages[0],name=studio.site.name||home.name;
 const brand=studio.site.logo?`<img src="${e(studio.site.logo)}" alt="${e(name)}">`:e(name);
 return `<header class="site-nav" data-studio-nav="true"><a class="site-brand" href="${e(pageFile(home,studio))}">${brand}</a><nav aria-label="Website navigation">${studio.pages.filter(p=>p.nav).map(p=>`<a href="${e(pageFile(p,studio))}"${p.id===currentId?' aria-current="page"':''}>${e(p.name)}</a>`).join('')}</nav></header>`;
}
// A small HTML token scan is sufficient here: replacement needs element ranges,
// not a browser DOM, and must ignore angle brackets inside quoted attributes.
function scanAttributes(raw){
 const attrs=new Map();let pos=/^<\/?[\w:-]+/.exec(raw)?.[0].length||0;
 while(pos<raw.length){
  while(/\s/.test(raw[pos]||'')&&pos<raw.length)pos++;
  if(!raw[pos]||raw[pos]==='>'||raw[pos]==='/')break;
  const start=pos;while(pos<raw.length&&!/[\s=/>]/.test(raw[pos]))pos++;
  const name=raw.slice(start,pos).toLowerCase();if(!name){pos++;continue;}
  while(/\s/.test(raw[pos]||'')&&pos<raw.length)pos++;
  let value='';
  if(raw[pos]==='='){
   pos++;while(/\s/.test(raw[pos]||'')&&pos<raw.length)pos++;
   const quote=raw[pos];
   if(quote==='"'||quote==="'"){pos++;const begin=pos;while(pos<raw.length&&raw[pos]!==quote)pos++;value=raw.slice(begin,pos);if(raw[pos]===quote)pos++;}
   else{const begin=pos;while(pos<raw.length&&!/[\s>]/.test(raw[pos]))pos++;value=raw.slice(begin,pos);}
  }
  // Keep all attribute ranges so authoritative links can replace duplicates too.
  const attr={name,value:decodeEntities(value),start,end:pos};
  if(!attrs.has(name))attrs.set(name,[]);attrs.get(name).push(attr);
 }
 return attrs;
}
const attribute=(node,name)=>node?.attrs.get(name)?.[0]?.value;
function scanElements(html){
 const nodes=[],stack=[],voids=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
 let pos=0;
 while(pos<html.length){
  const start=html.indexOf('<',pos);if(start<0)break;
  if(html.startsWith('<!--',start)){const end=html.indexOf('-->',start+4);pos=end<0?html.length:end+3;continue;}
  if(html.startsWith('<![CDATA[',start)){const end=html.indexOf(']]>',start+9);pos=end<0?html.length:end+3;continue;}
  let end=start+1,quote='';
  for(;end<html.length;end++){const char=html[end];if(quote){if(char===quote)quote='';}else if(char==='"'||char==="'")quote=char;else if(char==='>')break;}
  if(end===html.length)break;
  const raw=html.slice(start,end+1),match=/^<(\/?)\s*([a-z][\w:-]*)\b/i.exec(raw);pos=end+1;
  if(!match)continue;
  const tag=match[2].toLowerCase();
  if(match[1]){
   let index=stack.length-1;while(index>=0&&stack[index].tag!==tag)index--;
   if(index>=0){const node=stack[index];node.closeStart=start;node.end=pos;stack.length=index;}
   continue;
  }
  const node={tag,start,openEnd:pos,raw,attrs:scanAttributes(raw)};nodes.push(node);
  if(voids.has(tag)||/\/\s*>$/.test(raw)){node.end=pos;node.closeStart=pos;continue;}
  if(['script','style','textarea','title'].includes(tag)){
   const closing=new RegExp('</'+tag+'\\s*>','ig');closing.lastIndex=pos;const close=closing.exec(html);
   if(close){node.closeStart=close.index;node.end=closing.lastIndex;pos=node.end;}else pos=html.length;
   continue;
  }
  stack.push(node);
 }
 return nodes;
}
function updatedOpening(node,changes){
 let raw=node.raw;const removals=[],additions=[];
 for(const [name,value] of Object.entries(changes)){
  const existing=node.attrs.get(name)||[];
  if(existing.length===1&&existing[0].value===value)continue;
  removals.push(...existing);if(value!==undefined)additions.push(` ${name}="${e(value)}"`);
 }
 for(const attr of removals.sort((a,b)=>b.start-a.start))raw=raw.slice(0,attr.start)+raw.slice(attr.end);
 return raw.slice(0,-1)+additions.join('')+'>';
}
function descendantNodes(nodes,parent,tag){return nodes.filter(n=>n.tag===tag&&n.start>=parent.openEnd&&n.end<=parent.closeStart);}
function regeneratedNavigation(html,nodes,node,studio,currentId){
 const generated=navigationHtml(studio,currentId),generatedNodes=scanElements(generated),header=generatedNodes[0];
 const nav=node.tag==='nav'?node:descendantNodes(nodes,node,'nav')[0];
 const generatedNav=descendantNodes(generatedNodes,header,'nav')[0];
 const sourceAnchors=nav?descendantNodes(nodes,nav,'a'):[];
 const targetAnchors=descendantNodes(generatedNodes,generatedNav,'a');
 const label=n=>decodeEntities(html.slice(n.openEnd,n.closeStart).replace(/<[^>]*>/g,'')).trim();
 const used=new Set(),identities=targetAnchors.map(target=>{
  const href=attribute(target,'href'),targetLabel=decodeEntities(generated.slice(target.openEnd,target.closeStart));
  const match=sourceAnchors.find(source=>!used.has(source)&&attribute(source,'href')===href&&label(source)===targetLabel)||sourceAnchors.find(source=>!used.has(source)&&label(source)===targetLabel)||sourceAnchors.find(source=>!used.has(source)&&attribute(source,'href')===href);
  if(match)used.add(match);return match;
 });
 for(let i=0;i<identities.length;i++)if(!identities[i]){identities[i]=sourceAnchors.find(source=>!used.has(source));if(identities[i])used.add(identities[i]);}
 const links=targetAnchors.map((target,i)=>{
  const identity=identities[i];if(!identity)return generated.slice(target.start,target.end);
  return updatedOpening(identity,{href:attribute(target,'href'),'aria-current':attribute(target,'aria-current')})+generated.slice(target.openEnd,target.closeStart)+html.slice(identity.closeStart,identity.end);
 }).join('');
 const navMarkup=(nav?nav.raw:generatedNav.raw)+links+(nav?html.slice(nav.closeStart,nav.end):'</nav>');
 if(node.tag==='nav')return navMarkup;
 const brand=descendantNodes(nodes,node,'a').find(anchor=>(attribute(anchor,'class')||'').split(/\s+/).includes('site-brand'));
 const generatedBrand=descendantNodes(generatedNodes,header,'a')[0];
 const brandMarkup=brand?updatedOpening(brand,{href:attribute(generatedBrand,'href')})+generated.slice(generatedBrand.openEnd,generatedBrand.closeStart)+html.slice(brand.closeStart,brand.end):generated.slice(generatedBrand.start,generatedBrand.end);
 return updatedOpening(node,{'data-studio-nav':'true'})+brandMarkup+navMarkup+html.slice(node.closeStart,node.end);
}
export function rewriteNavigation(html,studio,currentId){
 html=String(html);const nodes=scanElements(html),matches=[];let lastEnd=-1;
 for(const node of nodes){
  if(!['header','nav'].includes(node.tag)||!node.end||node.start<lastEnd)continue;
  const marked=attribute(node,'data-studio-nav')==='true';
  const legacy=node.tag==='header'&&(attribute(node,'class')||'').split(/\s+/).includes('site-nav');
  if(marked||legacy){matches.push(node);lastEnd=node.end;}
 }
 if(matches.length){let result='',pos=0;for(const node of matches){result+=html.slice(pos,node.start)+regeneratedNavigation(html,nodes,node,studio,currentId);pos=node.end;}return result+html.slice(pos);}
 if(studio.pages.length<=1)return html;
 const position=nodes.find(node=>node.tag==='body')?.openEnd||0;
 return html.slice(0,position)+navigationHtml(studio,currentId)+html.slice(position);
}

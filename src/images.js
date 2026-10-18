import {validateSiteUrl} from './site-model.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain=v=>String(v??'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim();
export function remoteImageUrl(value){
 let url;try{url=new URL(String(value).trim());}catch{throw Error('Enter a complete HTTPS image URL.');}
 if(url.protocol!=='https:'||url.username||url.password||url.hash||/[\u0000-\u0020<>"']/.test(String(value)))throw Error('Use a public HTTPS image URL without credentials or fragments.');
 validateSiteUrl(url.origin);return url.href;
}
export function commonsPhotos(data){
 const pages=data?.query?.pages||[];
 return (Array.isArray(pages)?pages:Object.values(pages)).sort((a,b)=>(a.index||0)-(b.index||0)).flatMap(p=>{
  const i=p.imageinfo?.[0],m=i?.extmetadata||{},value=k=>plain(m[k]?.value||'');
  if(!i||value('LicenseShortName')!=='CC0'||value('AttributionRequired')!=='false'||value('Restrictions')||!['image/jpeg','image/png','image/webp'].includes(i.mime))return [];
  try{const src=remoteImageUrl(i.thumburl||i.url),sourceUrl=remoteImageUrl(i.descriptionurl),licenseUrl='https://creativecommons.org/publicdomain/zero/1.0/';return [{id:'commons-'+p.pageid,name:plain(p.title.replace(/^File:/,'')).slice(0,180),src,alt:(value('ImageDescription')||p.title.replace(/^File:/,'')).slice(0,320),artist:value('Artist').slice(0,180),sourceUrl,license:'CC0',licenseUrl}];}catch{return [];}
 });
}
const cache=new Map();
export async function searchPhotos(query){
 const q=String(query).trim().slice(0,80);if(!q)throw Error('Enter a photo topic.');if(cache.has(q))return cache.get(q);
 const params=new URLSearchParams({action:'query',format:'json',formatversion:'2',generator:'search',gsrsearch:q.replace(/[^\p{L}\p{N}\s-]/gu,' ')+' filetype:bitmap incategory:CC-Zero',gsrnamespace:'6',gsrlimit:'18',prop:'imageinfo',iiprop:'url|extmetadata|mime',iiurlwidth:'1280',origin:'*',maxlag:'5'});
 const response=await fetch('https://commons.wikimedia.org/w/api.php?'+params,{credentials:'omit',signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error(response.status===429?'Photo search is busy. Try again later or use the ready-to-use photos.':'Photo search is unavailable. Use the ready-to-use photos or paste an image URL.');
 const data=await response.json();if(data.error)throw Error('Photo search is temporarily busy. Try another topic later.');const photos=commonsPhotos(data);cache.set(q,photos);if(cache.size>12)cache.delete(cache.keys().next().value);return photos;
}
export function verifyImage(value){
 const src=remoteImageUrl(value);return new Promise((resolve,reject)=>{const image=new Image(),timer=setTimeout(()=>{image.src='';reject(Error('The image took too long to load. Check its URL or try another picture.'));},12000);image.onload=()=>{clearTimeout(timer);resolve(src);};image.onerror=()=>{clearTimeout(timer);reject(Error('That URL did not load as an image. Use a direct image link.'));};image.src=src;});
}
export function gallerySection(assets,title='Our gallery'){
 if(!assets.length||assets.length>12)throw Error('Choose between 1 and 12 saved pictures for your gallery.');
 return `<section class="studio-block remote-gallery" data-section="Photo gallery"><h2>${esc(title||'Our gallery')}</h2><div class="remote-gallery-grid">${assets.map(a=>`<figure><img src="${esc(a.src)}" alt="${esc(a.alt||a.name)}" loading="lazy" decoding="async"/>${a.sourceUrl?`<figcaption><a href="${esc(a.sourceUrl)}" target="_blank" rel="noopener noreferrer">Photo source</a>${a.artist?' · '+esc(a.artist):''}${a.license?' · '+esc(a.license):''}</figcaption>`:''}</figure>`).join('')}</div></section>`;
}
export const GALLERY_CSS='.remote-gallery-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}.remote-gallery figure{margin:0}.remote-gallery img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}.remote-gallery figcaption{font-size:11px;line-height:1.5;margin-top:8px}@media(max-width:800px){.remote-gallery-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:480px){.remote-gallery-grid{grid-template-columns:1fr}}';

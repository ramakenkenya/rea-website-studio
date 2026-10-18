export function audit(editor,brief){
 const doc=new DOMParser().parseFromString(editor.getHtml(),'text/html');const css=editor.getCss();
 const links=[...doc.querySelectorAll('a')];
 const broken=links.filter(a=>{const v=a.getAttribute('href')||'';return !v||v==='#'||v.startsWith('#')&&!doc.getElementById(v.slice(1));});
 const images=[...doc.querySelectorAll('img')];
 return [
 {label:'Page title',ok:!!brief.title&&brief.title.length<=70,detail:brief.title?`${brief.title.length} characters. Aim for a clear, descriptive title.`:'Add a page title in the Brief panel.'},
 {label:'Search description',ok:brief.description.length>=30&&brief.description.length<=160,detail:`${brief.description.length} characters. Aim for 30–160 useful characters.`},
 {label:'One main heading',ok:doc.querySelectorAll('h1').length===1,detail:`${doc.querySelectorAll('h1').length} H1 headings found.`},
 {label:'Image descriptions',ok:images.every(i=>(i.getAttribute('alt')||'').trim()),detail:`${images.filter(i=>!(i.getAttribute('alt')||'').trim()).length} images need descriptive alt text.`},
 {label:'Contact email',ok:!!brief.email,detail:brief.email||'Add a real contact email before publishing.'},
 {label:'Link destinations',ok:broken.length===0,detail:`${broken.length} empty or missing anchor destinations. Check external links manually.`},
 {label:'Responsive styles',ok:css.includes('@media'),detail:'Responsive CSS is included. Check the phone preview and your actual devices.'},
 {label:'Standalone export',ok:!!doc.querySelector('main,section'),detail:'Export contains page HTML and CSS; no editor account or runtime is required.'}
 ];
}

export function auditSite(editor,brief,studio){
 if(!studio)return audit(editor,brief);
 const pages=editor.Pages.getAll().map(p=>({model:p,meta:studio.pages.find(m=>m.id===p.id),doc:new DOMParser().parseFromString(editor.getHtml({component:p.getMainComponent()}),'text/html')})).filter(p=>p.meta);
 const filenames=new Map(pages.map(p=>[p.meta.id===studio.homeId?'index.html':p.meta.slug+'.html',p]));
 const results=[];
 for(const p of pages){
  const prefix=p.meta.name+' · ',images=[...p.doc.querySelectorAll('img')],links=[...p.doc.querySelectorAll('a')];
  const emptyLabels=links.filter(a=>!a.textContent.trim()&&!a.getAttribute('aria-label')&&!a.querySelector('img[alt]'));
  const badLinks=links.filter(a=>{const href=a.getAttribute('href')||'';if(!href||href==='#')return true;if(/^(https?:|mailto:|tel:)/i.test(href))return false;let [file,hash]=href.split('#');file=file.replace(/^\.\//,'');const target=file?filenames.get(file):p;if(!target)return true;if(!hash)return false;try{return !target.doc.getElementById(decodeURIComponent(hash));}catch{return true;}});
  results.push(
   {label:prefix+'Page title',ok:!!p.meta.title&&p.meta.title.length<=70,detail:`${p.meta.title.length} characters. Use a specific title for this page.`},
   {label:prefix+'Search description',ok:p.meta.description.length>=30&&p.meta.description.length<=160,detail:`${p.meta.description.length} characters. Aim for 30–160 useful characters.`},
   {label:prefix+'One main heading',ok:p.doc.querySelectorAll('h1').length===1,detail:`${p.doc.querySelectorAll('h1').length} H1 headings found.`},
   {label:prefix+'Image descriptions',ok:images.every(i=>i.hasAttribute('alt')),detail:`${images.filter(i=>!i.hasAttribute('alt')).length} images lack an alt attribute. Use empty alt only for decorative images.`},
   {label:prefix+'Accessible link labels',ok:!emptyLabels.length,detail:`${emptyLabels.length} links have no readable label.`},
   {label:prefix+'Internal link destinations',ok:!badLinks.length,detail:`${badLinks.length} empty, missing page or missing anchor destinations. External links need manual checking.`}
  );
 }
 return [...results,{label:'Public site URL and sitemap',ok:!!studio.site.url,detail:studio.site.url?'A sitemap and canonical URLs will be generated.':'Add a public URL in Studio tools → Site when you know your hosting address.'},{label:'Contact email',ok:!!brief.email,detail:brief.email||'Add a real contact email in the Brief panel.'},{label:'Portable multipage export',ok:pages.length>0,detail:`${pages.length} HTML page(s), shared brand styles, robots.txt, 404.html and a publishing guide.`}];
}

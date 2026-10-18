import JSZip from 'jszip';
import {escapeHtml as e,fileSlug} from './project.js';
import {createStudio,pageFile,brandCss,rewriteNavigation} from './site-model.js';
export function buildDocument({html,brief,page,studio,cssFile='styles.css'}){
 const bodyHtml=studio?rewriteNavigation(html,studio,page?.id):html;
 const body=/^\s*<body[\s>]/i.test(bodyHtml)?bodyHtml:`<body>${bodyHtml}</body>`;
 const title=page?.title||brief.title||brief.name,description=page?.description??brief.description??'';
 const language=studio?.site.language||'en',direction=studio?` dir="${e(studio.site.direction)}"`:'';
 let extra='';
 if(studio){
  const site=studio.site,canonical=site.url&&page?`${site.url}/${pageFile(page,studio)}`:'';
  extra='<link rel="stylesheet" href="studio.css">';
  if(page?.noindex)extra+='<meta name="robots" content="noindex,follow">';
  if(site.favicon)extra+=`<link rel="icon" href="${e(site.favicon)}">`;
  if(canonical)extra+=`<link rel="canonical" href="${e(canonical)}"><meta property="og:url" content="${e(canonical)}">`;
  if(site.socialImage)extra+=`<meta property="og:image" content="${e(site.socialImage)}">`;
 }
 return `<!doctype html>\n<html lang="${e(language)}"${direction}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(title)}</title><meta name="description" content="${e(description)}"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(description)}"><meta property="og:type" content="website"><link rel="stylesheet" href="${e(cssFile)}">${extra}</head>${body}</html>`;
}
const LEGACY_README=`Created with REA Studio.\n\nOpen index.html beside styles.css to preview your website. Upload both files to a static host, including GitHub Pages. Embedded uploaded images are included in the HTML.\n\nCheck your business copy, contact links, image descriptions and licensing before publishing. This package is a static website; it does not include a form backend or analytics.\n\nKeep a separate REA project JSON backup if you want to edit this design later.\n`;
export function exportFiles(editor,brief,studio){
 if(studio===undefined)return {'index.html':buildDocument({html:editor.getHtml({cleanId:true}),brief}),'styles.css':editor.getCss(),'README.txt':LEGACY_README};
 const editorPages=Array.from(editor.Pages.getAll()),actual=editorPages.map((p,i)=>({id:String(p.getId?.()??p.id??p.get?.('id')??`page-${i+1}`),name:p.get?.('name')??p.name}));
 const state=createStudio({pages:actual},brief,studio),files={};
 for(const page of state.pages){
  const item=editorPages[actual.findIndex(p=>p.id===page.id)],component=item.getMainComponent();
  if(!component)throw new Error(`Page "${page.name}" has no exportable content.`);
  const filename=pageFile(page,state),cssFile=page.id===state.homeId?'styles.css':page.slug+'.css';
  files[filename]=buildDocument({html:editor.getHtml({component,cleanId:true}),brief,page,studio:state,cssFile});
  files[cssFile]=editor.getCss({component});
 }
 files['studio.css']=brandCss(state);
 const home=state.pages.find(p=>p.id===state.homeId);
 files['404.html']=buildDocument({html:`<main class="site-section"><h1>Page not found</h1><p>This address does not lead to a page on ${e(state.site.name)}.</p><a class="site-button" href="${e(pageFile(home,state))}">Return home</a></main>`,brief,page:{id:'__404',title:`Page not found — ${state.site.name}`,description:'The page could not be found.',noindex:true},studio:{...state,site:{...state.site,url:''}},cssFile:'styles.css'});
 // Hosts can serve this document at any missing URL, including nested paths.
 // Give only the error page absolute navigation/style destinations when the
 // public deployment base is known; normal pages keep portable relative links.
 if(state.site.url)for(const filename of [...state.pages.map(p=>pageFile(p,state)),'styles.css','studio.css'])files['404.html']=files['404.html'].replaceAll(`href="${e(filename)}"`,`href="${e(state.site.url+'/'+filename)}"`);
 const basePath=state.site.url?new URL(state.site.url).pathname.replace(/\/$/,''):'';
 let robots='User-agent: *\nAllow: /\n';
 for(const page of state.pages.filter(p=>p.noindex))robots+=`Disallow: ${basePath}/${pageFile(page,state)}\n`;
 robots+=`Disallow: ${basePath}/404.html\n`;
 if(state.site.url){
  const locations=state.pages.filter(p=>!p.noindex).map(p=>`  <url><loc>${e(`${state.site.url}/${pageFile(p,state)}`)}</loc></url>`).join('\n');
  files['sitemap.xml']=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locations}\n</urlset>\n`;
  robots+=`Sitemap: ${state.site.url}/sitemap.xml\n`;
 }
 files['robots.txt']=robots;
 files['README.txt']=`Created with REA Studio.\n\nPUBLISHING GUIDE\n1. Keep all files in this ZIP together in one folder.\n2. Open index.html to preview locally. Page links and styles work without a build step.\n3. Upload the complete folder contents to a static host, such as GitHub Pages.\n4. Set the public site URL in Studio before exporting if canonical links and a sitemap are needed.\n5. Configure the host to serve 404.html for missing pages. The host controls this behavior.\n\nPAGES\n${state.pages.map(p=>`- ${p.name}: ${pageFile(p,state)} (${p.id===state.homeId?'styles.css':p.slug+'.css'})${p.nav?'':' [hidden from navigation]'}${p.noindex?' [noindex]':''}`).join('\n')}\n\nSHARED FILES\nstudio.css: palette, typography, sizing and responsive visibility.\nrobots.txt: crawler guidance.${state.site.url?'\nsitemap.xml: public, indexable page URLs.':''}\n404.html: missing-page content with a link home.\nUploaded data images are embedded. External image URLs require their source host to remain available.\n\nPRE-PUBLISH CHECKLIST\n[ ] Review all business copy, sample offers and sample figures.\n[ ] Check navigation, contact destinations, internal links and fragment links.\n[ ] Check image descriptions, headings, link labels, contrast and phone layout.\n[ ] Confirm image, font and content licensing. System font presets need no remote font service.\n[ ] Review page titles, descriptions, social sharing image and search visibility.\n[ ] Verify your public URL and re-export if your host or path changes.\n[ ] Test 404 handling on your static host.\n[ ] Keep a separate REA project JSON backup for future edits.\n\nThis is a static website package. It includes no form backend, analytics or payment service. REA Studio project code is MIT licensed; GrapesJS and JSZip retain their respective BSD-3-Clause and MIT licenses.\n`;
 return files;
}
export async function siteZip(editor,brief,studio){const z=new JSZip();for(const [name,content] of Object.entries(exportFiles(editor,brief,studio)))z.file(name,content);return z.generateAsync({type:'blob'});}
export function download(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);}
export const exportName=brief=>fileSlug(brief.name)+'-website.zip';

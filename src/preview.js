import {escapeHtml} from './project.js';

const scriptValue=value=>JSON.stringify(value).replace(/</g,'\\u003c');
const sandbox='allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox';

function previewBridge(channel,current,fragment,standalone){
 function scrollToFragment(hash){if(hash)try{document.getElementById(decodeURIComponent(hash))?.scrollIntoView();}catch{}}
 document.addEventListener('click',event=>{
  const anchor=event.target.closest('a');
  if(!anchor)return;
  const href=anchor.getAttribute('href')||'';
  if(href.startsWith('#')){
   if(standalone){event.preventDefault();scrollToFragment(href.slice(1));}
   return;
  }
  if(/^(?:https?:|mailto:|tel:)/i.test(href))return;
  event.preventDefault();
  const [file,hash='']=href.split('#');
  parent.postMessage({channel,kind:'page',file:file.replace(/^\.\//,'')||current,hash},'*');
 });
 if(standalone){
  window.addEventListener('message',event=>{
   if(event.source===parent&&event.data?.channel===channel&&event.data.kind==='scroll')scrollToFragment(event.data.hash);
  });
 }else{
  document.addEventListener('keydown',event=>{if(event.key==='Escape')parent.postMessage({channel,kind:'escape'},'*');});
 }
 scrollToFragment(fragment);
}

export function previewDocument({files,name,channel,hash='',base=''}){
 let html=files[name];if(!html)return '';
 if(base)html=html.replace('<head>',`<head><base href="${escapeHtml(base)}">`);
 html=html.replace(/<link\b[^>]*rel="stylesheet"[^>]*>/g,tag=>{const path=tag.match(/href="([^"]+)"/)?.[1];return files[path]?`<style>${files[path].replace(/<\/style/gi,'<\\/style')}</style>`:tag;});
 // Defer has no effect on inline scripts. Mount only after the body is parsed.
 html=html.replace('<script src="rea-shop.js" defer></script>','');
 const shop=files['rea-shop.js']?`<script>${files['rea-shop.js'].replace(/<\/script/gi,'<\\/script')}</script>`:'';
 return html.replace('</body>',`${shop}<script>(${previewBridge.toString()})(${scriptValue(channel)},${scriptValue(name)},${scriptValue(hash)},${Boolean(base)});</script></body>`);
}

function runPreviewTab(pages,name,channel,hash){
 const frame=document.querySelector('iframe');
 function render(file,fragment=''){
  if(!Object.hasOwn(pages,file))return;
  hash=fragment;
  frame.srcdoc=pages[file];
 }
 frame.addEventListener('load',()=>{if(hash)frame.contentWindow.postMessage({channel,kind:'scroll',hash},'*');});
 window.addEventListener('message',event=>{
  const data=event.data;
  if(event.source===frame.contentWindow&&data?.channel===channel&&data.kind==='page')render(data.file,data.hash);
 });
 render(name,hash);
}

export function previewTabDocument({files,name,channel,base,hash=''}){
 const pages=Object.fromEntries(Object.keys(files).filter(file=>file.endsWith('.html')).map(file=>[
  file,previewDocument({files,name:file,channel,base}),
 ]));
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Website preview</title><style>html,body{margin:0;width:100%;height:100%}iframe{display:block;width:100%;height:100%;border:0}</style></head><body><iframe title="Website preview" sandbox="${sandbox}"></iframe><script>(${runPreviewTab.toString()})(${scriptValue(pages)},${scriptValue(name)},${scriptValue(channel)},${scriptValue(hash)});</script></body></html>`;
}

function previewBridge(channel,current,fragment){
 document.addEventListener('click',event=>{const anchor=event.target.closest('a');if(!anchor)return;const href=anchor.getAttribute('href')||'';if(href.startsWith('#')||/^(?:https?:|mailto:|tel:)/i.test(href))return;event.preventDefault();const [file,hash='']=href.split('#');parent.postMessage({channel,kind:'page',file:file.replace(/^\.\//,'')||current,hash},'*');});
 document.addEventListener('keydown',event=>{if(event.key==='Escape')parent.postMessage({channel,kind:'escape'},'*');});
 if(fragment)try{document.getElementById(decodeURIComponent(fragment))?.scrollIntoView();}catch{}
}
export function previewDocument({files,name,channel,hash=''}){
 let html=files[name];if(!html)return '';
 html=html.replace(/<link\b[^>]*rel="stylesheet"[^>]*>/g,tag=>{const path=tag.match(/href="([^"]+)"/)?.[1];return files[path]?`<style>${files[path].replace(/<\/style/gi,'<\\/style')}</style>`:tag;});
 // Defer has no effect on inline scripts. Mount only after the body is parsed.
 html=html.replace('<script src="rea-shop.js" defer></script>','');
 const shop=files['rea-shop.js']?`<script>${files['rea-shop.js'].replace(/<\/script/gi,'<\\/script')}</script>`:'';
 const json=value=>JSON.stringify(value).replace(/</g,'\\u003c');
 return html.replace('</body>',`${shop}<script>(${previewBridge.toString()})(${json(channel)},${json(name)},${json(hash)});</script></body>`);
}

// A non-modal editor surface: the page remains available to pointer and keyboard.
export function studioDrawer({dialog,trigger,editor}){
 const doc=dialog.ownerDocument,compact=matchMedia('(max-width:1100px)'),canvas=doc.querySelector('.canvas-area');
 let opener=trigger,refreshFrame;
 trigger.setAttribute('aria-controls',dialog.id);
 trigger.setAttribute('aria-haspopup','dialog');
 trigger.setAttribute('aria-expanded','false');
 dialog.setAttribute('aria-modal','false');
 function refresh(){cancelAnimationFrame(refreshFrame);refreshFrame=requestAnimationFrame(()=>editor.refresh());}
 function alignCanvas(){if(compact.matches)canvas.scrollIntoView({block:'start',behavior:'instant'});refresh();}
 function close(){if(dialog.open)dialog.close();}
 function escape(e){if(e.key!=='Escape'||!dialog.open||doc.querySelector('dialog:modal'))return;e.preventDefault();e.stopPropagation();close();}
 doc.addEventListener('keydown',escape);
 const frames=new WeakSet();
 function bindFrame(){const frameDoc=editor.Canvas.getDocument();if(frameDoc&&!frames.has(frameDoc)){frames.add(frameDoc);frameDoc.addEventListener('keydown',escape,true);}}
 editor.on('canvas:frame:load',bindFrame);bindFrame();
 dialog.addEventListener('close',()=>{
  doc.body.classList.remove('studio-drawer-open');trigger.setAttribute('aria-expanded','false');refresh();
  if(opener?.isConnected)opener.focus({preventScroll:true});
 });
 compact.addEventListener('change',()=>{if(dialog.open)alignCanvas();});
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(refresh).observe(canvas);
 return {
  open(){if(dialog.open)return;opener=doc.activeElement===doc.body?trigger:doc.activeElement;doc.body.classList.add('studio-drawer-open');dialog.show();trigger.setAttribute('aria-expanded','true');dialog.querySelector('[aria-selected="true"]')?.focus({preventScroll:true});alignCanvas();},
  close,
  reveal(component){if(!component)return;editor.select(component);requestAnimationFrame(()=>{component.getEl()?.scrollIntoView({block:'start',inline:'nearest',behavior:'instant'});if(dialog.open)alignCanvas();});}
 };
}

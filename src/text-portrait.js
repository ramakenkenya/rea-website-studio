import {escapeHtml as e} from './project.js';

const GLYPHS=' .:-=+*#%@';
export function pixelsToPortrait(rgba,width,height,{dark=true}={}){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>200||height>140||rgba.length!==width*height*4)throw Error('Invalid portrait pixel grid.');
 const rows=[];
 for(let y=0;y<height;y++){
  let line='';
  for(let x=0;x<width;x++){
   const i=(y*width+x)*4,alpha=rgba[i+3]/255;
   const light=(.2126*rgba[i]+.7152*rgba[i+1]+.0722*rgba[i+2])/255;
   const density=alpha*(dark?1-light:light);
   line+=GLYPHS[Math.round(density*(GLYPHS.length-1))];
  }
  rows.push(line);
 }
 return rows.join('\n');
}
export function portraitMarkup(text,label='Portrait rendered in text characters'){
 return `<pre class="tp-art" data-text-portrait="true" role="img" aria-label="${e(label)}">${e(text)}</pre>`;
}

// Decode only user-selected files. The source picture never leaves this browser.
export async function portraitFromFile(file){
 if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Choose a JPEG, PNG or WebP portrait.');
 if(file.size>8*1024*1024)throw Error('Choose a portrait smaller than 8 MB.');
 let bitmap;
 try{bitmap=await createImageBitmap(file);}catch{throw Error('This picture could not be read. Try another JPEG, PNG or WebP.');}
 try{
  if(!bitmap.width||!bitmap.height||bitmap.width*bitmap.height>24000000)throw Error('Choose a picture with at most 24 megapixels.');
  const width=120,height=88,ratio=width*.6/height;
  const sw=Math.min(bitmap.width,bitmap.height*ratio),sh=sw/ratio;
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('Picture conversion is unavailable in this browser.');
  ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);
  ctx.drawImage(bitmap,(bitmap.width-sw)/2,(bitmap.height-sh)/2,sw,sh,0,0,width,height);
  return pixelsToPortrait(ctx.getImageData(0,0,width,height).data,width,height);
 }finally{bitmap.close();}
}

export function registerTextPortrait(editor){
 editor.DomComponents.addType('text-portrait',{
  isComponent:el=>el.tagName==='PRE'&&el.hasAttribute('data-text-portrait')?{type:'text-portrait'}:false,
  model:{defaults:{tagName:'pre',name:'Text portrait',droppable:false,editable:false,highlightable:true}},
 });
}

export function mountPortraitControls({editor,toast,markDirty}){
 const panel=document.createElement('div');panel.id='portrait-controls';panel.className='hide';
 panel.innerHTML='<div class="field-title">TEXT PORTRAIT</div><label class="field">Portrait description<input id="portrait-description" maxlength="240"/></label><label class="field">Replace portrait photo<input id="portrait-file" type="file" accept="image/jpeg,image/png,image/webp"/></label><p class="inspector-note">Choose a head-and-shoulders photo on a plain background. Converted on this device; only the characters are saved. JPEG, PNG or WebP · up to 8 MB.</p>';
 document.querySelector('#selected-controls').append(panel);
 const description=panel.querySelector('#portrait-description'),fileInput=panel.querySelector('#portrait-file');
 let selected=null,request=0;
 const clear=()=>{request++;selected=null;panel.classList.add('hide');fileInput.value='';};
 editor.on('component:selected',c=>{
  request++;selected=c.getAttributes()['data-text-portrait']==='true'?c:null;
  panel.classList.toggle('hide',!selected);fileInput.value='';description.value=selected?.getAttributes()['aria-label']||'';
 });
 editor.on('component:deselected page:select',clear);
 description.onchange=()=>{if(selected){selected.addAttributes({'aria-label':description.value.trim()||'Portrait rendered in text characters'});markDirty();}};
 fileInput.onchange=async()=>{
  const file=fileInput.files[0],target=selected,ticket=++request;if(!file||!target)return;
  fileInput.disabled=true;
  try{
   const text=await portraitFromFile(file);
   // A late decode must not change another page, restored project or selection.
   if(ticket!==request||selected!==target||!target.getEl()?.isConnected)return;
   target.components(e(text));target.addAttributes({'aria-label':description.value.trim()||'Portrait rendered in text characters'});
   markDirty();toast('Text portrait updated. Your original photo stays on this device.');
  }catch(error){if(ticket===request)toast(error.message);}
  finally{fileInput.disabled=false;fileInput.value='';}
 };
}

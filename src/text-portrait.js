import {escapeHtml as e} from './project.js';

const GLYPHS=' .:-=+*#%@';
const CHARACTERS={classic:GLYPHS,minimal:' .:+#',dense:' .:+=xX%#@'};
export function pixelsToPortrait(rgba,width,height,{dark=true,characters='classic'}={}){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>200||height>140||rgba.length!==width*height*4)throw Error('Invalid portrait pixel grid.');
 const glyphs=CHARACTERS[characters]||GLYPHS;
 const rows=[];
 for(let y=0;y<height;y++){
  let line='';
  for(let x=0;x<width;x++){
   const i=(y*width+x)*4,alpha=rgba[i+3]/255;
   const light=(.2126*rgba[i]+.7152*rgba[i+1]+.0722*rgba[i+2])/255;
   const density=alpha*(dark?1-light:light);
   line+=glyphs[Math.round(density*(glyphs.length-1))];
  }
  rows.push(line);
 }
 return rows.join('\n');
}
export function portraitMarkup(text,label='Portrait rendered in text characters'){
 return `<pre class="tp-art" data-text-portrait="true" role="img" aria-label="${e(label)}">${e(text)}</pre>`;
}
export function replacePortraitText(component,text){
 // A model textnode bypasses the HTML fragment parser, which trims blank rows.
 // Textnode handles HTML escaping on export; keep its content unencoded.
 component.components([{type:'textnode',content:text}]);
}

// Decode only user-selected files. The source picture never leaves this browser.
export async function portraitFromFile(file,{width=120,height=Math.round(width*88/120),crop='center',dark=true,characters='classic'}={}){
 if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Choose a JPEG, PNG or WebP portrait.');
 if(file.size>8*1024*1024)throw Error('Choose a portrait smaller than 8 MB.');
 let bitmap;
 try{bitmap=await createImageBitmap(file);}catch{throw Error('This picture could not be read. Try another JPEG, PNG or WebP.');}
 try{
  if(!bitmap.width||!bitmap.height||bitmap.width*bitmap.height>24000000)throw Error('Choose a picture with at most 24 megapixels.');
  const ratio=width*.6/height;
  const sw=Math.min(bitmap.width,bitmap.height*ratio),sh=sw/ratio;
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('Picture conversion is unavailable in this browser.');
  ctx.fillStyle=dark?'#fff':'#000';ctx.fillRect(0,0,width,height);
  if(crop==='fit'){
   const scale=Math.min(width*.6/bitmap.width,height/bitmap.height);
   const dw=bitmap.width*scale/.6,dh=bitmap.height*scale;
   ctx.drawImage(bitmap,(width-dw)/2,(height-dh)/2,dw,dh);
  }else{
   const zoom=crop==='close'?.74:1;
   ctx.drawImage(bitmap,(bitmap.width-sw*zoom)/2,(bitmap.height-sh*zoom)/2,sw*zoom,sh*zoom,0,0,width,height);
  }
  const text=pixelsToPortrait(ctx.getImageData(0,0,width,height).data,width,height,{dark,characters});
  if(!text.trim())throw Error('No portrait detail found. Choose a clearer photo on a plain background.');
  return text;
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
 panel.innerHTML='<div class="field-title">TEXT PORTRAIT</div><label class="field">Portrait description<input id="portrait-description" maxlength="240"/></label><label class="field">Replace portrait photo<input id="portrait-file" type="file" accept="image/jpeg,image/png,image/webp"/></label><p class="inspector-note">Choose a head-and-shoulders photo on a plain background. Converted on this device; only the characters are saved. JPEG, PNG or WebP · up to 8 MB.</p><div id="picture-options" hidden><label class="field">Crop<select id="picture-crop"><option value="center">Center crop</option><option value="fit">Fit whole picture</option><option value="close">Tight center crop</option></select></label><label class="field">Density<select id="picture-density"><option value="48">Low</option><option value="72" selected>Medium</option><option value="120">High</option></select></label><label class="field">Characters<select id="picture-glyphs"><option value="classic">Classic</option><option value="minimal">Simple</option><option value="dense">Dense</option></select></label><label class="field">Contrast<select id="picture-contrast"><option value="normal">Normal</option><option value="invert">Invert</option></select></label><div class="picture-preview" hidden><pre aria-label="Picture to Text preview" role="img"></pre></div><button type="button" id="apply-picture-text" class="btn sm text-wide" disabled>Apply text artwork</button></div>';
 const description=panel.querySelector('#portrait-description'),fileInput=panel.querySelector('#portrait-file');
 const options=panel.querySelector('#picture-options'),preview=options.querySelector('.picture-preview');
 const apply=options.querySelector('button'),title=panel.querySelector('.field-title'),note=panel.querySelector('.inspector-note');
 let selected=null,request=0,file=null,draft=null;
 function resetPreview(){
  request++;draft=null;file=null;fileInput.value='';fileInput.disabled=false;
  preview.hidden=true;preview.firstElementChild.textContent='';apply.disabled=true;
 }
 const isPicture=()=>selected?.getAttributes()['data-picture-to-text']==='true';
 const label=()=>description.value.trim()||'Picture rendered in text characters';
 const clear=()=>{resetPreview();selected=null;panel.remove();};
 editor.on('component:selected',c=>{
  resetPreview();selected=c.getAttributes()['data-text-portrait']==='true'?c:null;
  if(!selected){panel.remove();return;}
  options.hidden=!isPicture();
  title.textContent=isPicture()?'PICTURE TO TEXT':'TEXT PORTRAIT';
  note.textContent=isPicture()
   ?'Choose a JPEG, PNG or WebP up to 8 MB. Preview the result before applying it. Only the text is saved.'
   :'Choose a head-and-shoulders photo on a plain background. Converted on this device; only the characters are saved. JPEG, PNG or WebP · up to 8 MB.';
  document.querySelector('#selected-controls').append(panel);panel.classList.remove('hide');
  description.value=selected.getAttributes()['aria-label']||'';
 });
 editor.on('component:deselected page:select',clear);
 description.onchange=()=>{if(selected&&!file){selected.addAttributes({'aria-label':label()});markDirty();}};
 function commit(target,text,width){
  replacePortraitText(target,text);
  target.addAttributes({'aria-label':label()});
  if(width)target.addStyle({'--picture-columns':String(width)});
  markDirty();
  toast(width?'Text artwork applied.':'Text portrait updated. Your original photo stays on this device.');
 }
 async function convert(){
  const target=selected,ticket=++request,picture=isPicture();
  if(!file||!target)return;
  draft=null;preview.hidden=true;apply.disabled=true;
  const width=Number(options.querySelector('#picture-density').value);
  try{
   const text=await portraitFromFile(file,picture?{
    width,crop:options.querySelector('#picture-crop').value,
    characters:options.querySelector('#picture-glyphs').value,
    dark:options.querySelector('#picture-contrast').value==='normal',
   }:undefined);
   if(ticket!==request||selected!==target||!target.getEl()?.isConnected)return;
   if(!picture){commit(target,text);file=null;return;}
   draft={text,width};
   preview.style.setProperty('--picture-columns',width);
   preview.firstElementChild.textContent=text;preview.hidden=false;apply.disabled=false;
  }catch(error){if(ticket===request)toast(error.message);}
 }
 fileInput.onchange=()=>{if(!fileInput.files.length)return;file=fileInput.files[0];fileInput.value='';convert();};
 options.querySelectorAll('select').forEach(control=>control.onchange=convert);
 apply.onclick=()=>{if(!selected||!draft)return;commit(selected,draft.text,draft.width);resetPreview();};
}

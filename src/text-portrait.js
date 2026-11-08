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

const MAX_FILE_SIZE=8*1024*1024;

function drawablePortrait(image,{width=120,height=Math.round(width*88/120),crop='center',dark=true,characters='classic'}={}){
 const imageWidth=image.naturalWidth||image.width,imageHeight=image.naturalHeight||image.height;
 if(!imageWidth||!imageHeight||imageWidth*imageHeight>24000000)throw Error('Choose a picture with at most 24 megapixels.');
 const ratio=width*.6/height;
 const sw=Math.min(imageWidth,imageHeight*ratio),sh=sw/ratio;
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('Picture conversion is unavailable in this browser.');
 ctx.fillStyle=dark?'#fff':'#000';ctx.fillRect(0,0,width,height);
 if(crop==='fit'){
  const scale=Math.min(width*.6/imageWidth,height/imageHeight);
  const dw=imageWidth*scale/.6,dh=imageHeight*scale;
  ctx.drawImage(image,(width-dw)/2,(height-dh)/2,dw,dh);
 }else{
  const zoom=crop==='close'?.74:1;
  ctx.drawImage(image,(imageWidth-sw*zoom)/2,(imageHeight-sh*zoom)/2,sw*zoom,sh*zoom,0,0,width,height);
 }
 const text=pixelsToPortrait(ctx.getImageData(0,0,width,height).data,width,height,{dark,characters});
 if(!text.trim())throw Error('No portrait detail found. Try inverting the contrast or choosing a clearer picture.');
 return text;
}

// Image decoding and conversion stay in the browser.
export async function portraitFromFile(file,options){
 if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Choose a JPEG, PNG or WebP portrait.');
 if(file.size>MAX_FILE_SIZE)throw Error('Choose a portrait smaller than 8 MB.');
 let bitmap;
 try{bitmap=await createImageBitmap(file);}catch{throw Error('This picture could not be read. Try another JPEG, PNG or WebP.');}
 try{return drawablePortrait(bitmap,options);}finally{bitmap.close();}
}

async function portraitFromSelected(image,options,signal){
 signal.throwIfAborted();
 if(image.complete&&image.naturalWidth){
  try{return drawablePortrait(image,options);}
  catch(error){if(error.name!=='SecurityError')throw error;}
 }
 let blob;
 try{
  const response=await fetch(image.currentSrc||image.src,{signal,credentials:'same-origin'});
  if(!response.ok||Number(response.headers.get('content-length'))>MAX_FILE_SIZE)throw Error();
  blob=await response.blob();
  if(blob.size>MAX_FILE_SIZE)throw Error();
 }catch{
  throw Error('The image could not be read directly. Choose a local copy to continue.');
 }
 const url=URL.createObjectURL(blob);
 try{
  const decoded=new Image();decoded.src=url;
  try{await decoded.decode();}catch{throw Error('This image format could not be read. Choose a local JPEG, PNG or WebP copy.');}
  signal.throwIfAborted();
  return drawablePortrait(decoded,options);
 }finally{URL.revokeObjectURL(url);}
}

export const TEXTUAL_IMAGE_CSS=`
.textual-image{display:block;box-sizing:border-box;width:100%;max-width:100%;min-width:0;container-type:inline-size;overflow:hidden;background-color:var(--type-paper,var(--studio-paper,#faf8f2));color:var(--type-ink,var(--studio-ink,#20211d))}
.textual-image>.tp-art{display:block;margin:0;padding:0;width:100%;white-space:pre;overflow:hidden;text-align:center;font-family:'Courier New',monospace!important;font-weight:400;line-height:1;letter-spacing:0;font-size:calc(166.667cqw / var(--picture-columns,72));font-variant-ligatures:none;color:inherit;background-color:transparent}
`;

export function textualizeImage(component,{text,width,description,ratio}){
 const image=component.getEl(),view=image?.ownerDocument.defaultView;
 const computed=image&&view?.getComputedStyle(image);
 const original=component.getAttributes();
 const attributes=Object.fromEntries(Object.entries(original).filter(([key])=>['id','title','lang','dir'].includes(key)||key.startsWith('data-')));
 if((original['data-photo-source']||original['data-photo-license'])&&/^https?:\/\//i.test(original.src))attributes['data-textual-source']=original.src;
 const style={...component.getStyle()};
 for(const key of ['object-fit','object-position'])delete style[key];
 style['aspect-ratio']=String(ratio);
 if(!style.width&&/^\d+$/.test(original.width||''))style.width=original.width+'px';
 if(computed){
  style['border-radius']??=computed.borderRadius;
  if(computed.display==='inline'||computed.display==='inline-block'){
   style.display??='inline-block';
   style['vertical-align']??=computed.verticalAlign;
   if(!style.width&&image.offsetWidth)style.width=`min(100%, ${image.offsetWidth}px)`;
  }
 }
 const [replacement]=component.replaceWith({
  tagName:'div',name:'Textualized image',classes:[...component.getClasses(),'textual-image'],
  attributes:{...attributes,'data-textual-image':'true'},style,
  components:[{type:'text-portrait',classes:['tp-art'],
   attributes:{'data-text-portrait':'true','data-picture-to-text':'true',role:'img','aria-label':description},
   style:{'--picture-columns':String(width)},components:[{type:'textnode',content:text}]}],
 },{cloneRules:true});
 return replacement.components().at(0);
}

export function registerTextPortrait(editor){
 editor.DomComponents.addType('text-portrait',{
  isComponent:el=>el.tagName==='PRE'&&el.hasAttribute('data-text-portrait')?{type:'text-portrait'}:false,
  model:{defaults:{tagName:'pre',name:'Text portrait',droppable:false,editable:false,highlightable:true}},
 });
}

export function mountPortraitControls({editor,getBrief,toast,markDirty}){
 const panel=document.createElement('div');panel.id='portrait-controls';panel.className='hide';
 panel.innerHTML='<div class="field-title">TEXT PORTRAIT</div><button class="btn sm text-wide" id="textualize-image" type="button" hidden>Textualize image</button><p class="inspector-note" id="textualize-status" role="status" hidden></p><div id="portrait-inputs"><label class="field"><span id="portrait-description-label">Portrait description</span><input id="portrait-description" maxlength="240"/></label><label class="field"><span id="portrait-file-label">Replace portrait photo</span><input id="portrait-file" type="file" accept="image/jpeg,image/png,image/webp"/></label><p class="inspector-note">Choose a head-and-shoulders photo on a plain background. Converted on this device; only the characters are saved. JPEG, PNG or WebP · up to 8 MB.</p><div id="picture-options" hidden><label class="field">Crop<select id="picture-crop"><option value="center">Center crop</option><option value="fit">Fit whole picture</option><option value="close">Tight center crop</option></select></label><label class="field">Density<select id="picture-density"><option value="48">Low</option><option value="72" selected>Medium</option><option value="120">High</option></select></label><label class="field">Characters<select id="picture-glyphs"><option value="classic">Classic</option><option value="minimal">Simple</option><option value="dense">Dense</option></select></label><label class="field">Contrast<select id="picture-contrast"><option value="normal">Normal</option><option value="invert">Invert</option></select></label><div class="picture-preview" hidden><pre aria-label="Picture to Text preview" role="img"></pre></div><button type="button" id="apply-picture-text" class="btn sm text-wide" disabled>Apply text artwork</button></div></div>';
 const description=panel.querySelector('#portrait-description'),fileInput=panel.querySelector('#portrait-file');
 const options=panel.querySelector('#picture-options'),preview=options.querySelector('.picture-preview');
 const apply=options.querySelector('button'),title=panel.querySelector('.field-title'),note=panel.querySelector('.inspector-note');
 const inputs=panel.querySelector('#portrait-inputs'),descriptionLabel=panel.querySelector('#portrait-description-label');
 const start=panel.querySelector('#textualize-image'),status=panel.querySelector('#textualize-status');
 let selected=null,request=0,file=null,draft=null,fetching;
 const imageSelected=()=>selected?.is('image');
 const isPicture=()=>imageSelected()||selected?.getAttributes()['data-picture-to-text']==='true';
 const source=()=>selected?.getEl()?.currentSrc||selected?.getEl()?.src;
 const label=()=>description.value.trim()||'Picture rendered in text characters';
 function showStatus(message=''){status.textContent=message;status.hidden=!message;}
 function resetPreview(){
  request++;fetching?.abort();draft=null;file=null;fileInput.value='';
  preview.hidden=true;preview.firstElementChild.textContent='';apply.disabled=true;
  start.disabled=false;
  showStatus();
 }
 const clear=()=>{resetPreview();selected=null;panel.remove();};
 editor.on('component:selected',c=>{
  clear();
  const photo=getBrief().theme==='text'&&c.is('image');
  if(!photo&&c.getAttributes()['data-text-portrait']!=='true')return;
  selected=c;
  const picture=isPicture();
  start.hidden=!photo;inputs.hidden=photo;options.hidden=!picture;
  const element=c.getEl();
  options.querySelector('#picture-crop').value=photo&&element?.ownerDocument.defaultView.getComputedStyle(element).objectFit!=='cover'?'fit':'center';
  title.textContent=picture?'PICTURE TO TEXT':'TEXT PORTRAIT';
  descriptionLabel.textContent=photo?'Artwork description':'Portrait description';
  panel.querySelector('#portrait-file-label').textContent=photo?'Choose a local copy':picture?'Choose a picture':'Replace portrait photo';
  note.textContent=photo?'Adjust the preview, then apply it to replace the selected image.':
   picture?'Choose a JPEG, PNG or WebP up to 8 MB. Preview the result before applying it. Only the text is saved.':
   'Choose a head-and-shoulders photo on a plain background. Converted on this device. JPEG, PNG or WebP up to 8 MB.';
  const inspector=document.querySelector('#selected-controls');
  if(photo)document.querySelector('#image-controls').prepend(panel);
  else if(picture)inspector.prepend(panel);
  else inspector.append(panel);
  panel.classList.remove('hide');
  description.value=c.getAttributes()[photo?'alt':'aria-label']||'';
 });
 editor.on('component:deselected page:select',clear);
 editor.on('undo redo',()=>{if(selected&&!selected.getEl()?.isConnected)clear();});
 description.onchange=()=>{if(selected&&!imageSelected()&&!file){selected.addAttributes({'aria-label':label()});markDirty();}};
 function commit(target,text,width){
  replacePortraitText(target,text);
  target.addAttributes({'aria-label':label()});
  if(width){target.removeAttributes('data-picture-empty');target.addStyle({'--picture-columns':String(width)});}
  markDirty();
  toast(width?'Text artwork applied.':'Text portrait updated. Your original photo stays on this device.');
 }
 async function convert(){
  const target=selected,photo=imageSelected(),picture=isPicture();
  if(!target||(!file&&!photo))return;
  fetching?.abort();
  const controller=new AbortController();fetching=controller;
  const ticket=++request,src=photo?source():undefined;
  draft=null;preview.hidden=true;apply.disabled=true;
  if(photo){start.disabled=true;showStatus('Preparing text preview…');}
  const width=Number(options.querySelector('#picture-density').value);
  const element=target.getEl();
  const ratio=photo?(element.offsetWidth||element.naturalWidth||1)/(element.offsetHeight||element.naturalHeight||1):1;
  const config=picture?{
   width,crop:options.querySelector('#picture-crop').value,
   characters:options.querySelector('#picture-glyphs').value,
   dark:options.querySelector('#picture-contrast').value==='normal',
   ...(photo?{height:Math.max(1,Math.min(140,Math.round(width*.6/ratio)))}:{}),
  }:undefined;
  try{
   const text=file?await portraitFromFile(file,config):await portraitFromSelected(element,config,AbortSignal.any([controller.signal,AbortSignal.timeout(12000)]));
   if(ticket!==request||selected!==target||!target.getEl()?.isConnected)return;
   if(!picture){commit(target,text);file=null;return;}
   draft={text,width,ratio,src};
   preview.style.setProperty('--picture-columns',width);
   preview.firstElementChild.textContent=text;preview.hidden=false;apply.disabled=false;
   showStatus();
  }catch(error){
   if(ticket===request){if(photo)showStatus(error.message);else toast(error.message);}
  }finally{if(ticket===request)start.disabled=false;}
 }
 start.onclick=()=>{inputs.hidden=false;convert();};
 fileInput.onchange=()=>{if(!fileInput.files.length)return;file=fileInput.files[0];fileInput.value='';convert();};
 options.querySelectorAll('select').forEach(control=>control.onchange=convert);
 apply.onclick=()=>{
  if(!selected||!draft)return;
  if(imageSelected()){
   if(draft.src!==source()){convert();return;}
   const artwork=textualizeImage(selected,{...draft,description:label()});
   editor.select(artwork);markDirty();toast('Image textualized. Use Undo to restore the picture.');
  }else{commit(selected,draft.text,draft.width);resetPreview();}
 };
}

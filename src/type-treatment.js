import {escapeHtml as esc} from './project.js';

const styles=[
 {id:'inset',label:'Inset text',example:'WORK',small:'THE'},
 {id:'outline',label:'Outline',example:'KEN'},
 {id:'contrast',label:'Reverse contrast',example:'WHAT IF?'},
 {id:'editorial',label:'Editorial serif',example:'Field notes'},
 {id:'echo',label:'Outline echo',example:'Future'},
 {id:'reflection',label:'Reflection',example:'Clarity'},
 {id:'vertical',label:'Vertical label',example:'PROCESS'},
 {id:'display',label:'Oversized display',example:'03'},
 {id:'mono',label:'Mono caption',example:'01 / SYSTEM'},
];

export const TYPE_TREATMENT_CSS=`
body [data-type-treatment]:is([data-type-treatment="inset"]){font-weight:900;font-size:clamp(2.25rem,8vw,7rem)!important;line-height:1!important;letter-spacing:-.065em!important}
.type-treatment-lockup{position:relative;display:inline-block;max-width:100%;vertical-align:top}
.type-treatment-main{display:block;overflow-wrap:anywhere}
.type-treatment-small{position:absolute;top:.2em;left:.28em;z-index:1;padding:.1em .18em;color:var(--tb-type-paper,var(--type-paper,var(--studio-paper,#0b0b0b)));background-color:var(--tb-type-ink,var(--type-ink,var(--studio-ink,#f3f1e9)));font-family:Arial,sans-serif;font-size:.16em;font-weight:900;line-height:1;letter-spacing:0}
[data-type-treatment="outline"]{color:transparent!important;-webkit-text-stroke-width:1px;-webkit-text-stroke-color:var(--tb-type-ink,var(--type-ink,var(--studio-ink,#f3f1e9)))}
[data-type-treatment="contrast"]{display:inline-block;padding:.12em .23em;color:var(--tb-type-paper,var(--type-paper,var(--studio-paper,#0b0b0b)))!important;background-color:var(--tb-type-ink,var(--type-ink,var(--studio-ink,#f3f1e9)));font-weight:900}
body [data-type-treatment]:is([data-type-treatment="editorial"]){font-family:Georgia,serif!important;font-style:italic;font-weight:400;letter-spacing:-.035em}
body [data-type-treatment]:is([data-type-treatment="echo"]){text-shadow:.08em -.2em color-mix(in srgb,currentColor 27%,transparent)}
[data-type-treatment="reflection"]{display:inline-block;margin-bottom:.65em;-webkit-box-reflect:below -.3em linear-gradient(transparent 70%,#0005)}
[data-type-treatment="vertical"]{writing-mode:vertical-rl;transform:rotate(180deg);max-height:100%;text-transform:uppercase;overflow-wrap:anywhere}
body [data-type-treatment]:is([data-type-treatment="display"]){font:900 clamp(2.5rem,10vw,8rem)/.9 Arial,sans-serif!important;letter-spacing:-.07em;overflow-wrap:anywhere}
body [data-type-treatment]:is([data-type-treatment="mono"]){font:700 .8rem/1.4 'Courier New',monospace!important;letter-spacing:.12em;text-transform:uppercase}
@media(max-width:600px){[data-type-treatment="vertical"]{writing-mode:horizontal-tb;transform:none}}
`;

function insetParts(component){
 for(let current=component;current;current=current.parent()){
  if(current.getClasses().includes('tp-inset-heading'))return {root:current,small:current.find('.tp-inset-small')[0],large:current.find('.tp-inset-large')[0],fixed:true};
  if(current.getClasses().includes('tb-title')&&current.find('.tb-inset')[0])return {root:current,small:current.find('.tb-inset')[0],large:current.find('.tb-word')[0],fixed:true};
  if(current.getAttributes()['data-type-treatment']==='inset')return {root:current,small:current.find('.type-treatment-small')[0],large:current.find('.type-treatment-main')[0]};
 }
}

function plainText(component){
 return component&&/^(h[1-6]|p|span|a|strong|em)$/.test(component.get('tagName'))&&
  component.components().every(child=>child.is('textnode'))&&component.getEl()?.textContent.trim();
}

export function mountTypeTreatment({editor,markDirty,toast,onChange}){
 const panel=document.querySelector('#style-panel');
 panel.innerHTML=`<p class="block-help" id="type-style-help"></p><div class="type-style-options">${styles.map(({id,label,example,small})=>`
 <button type="button" class="type-style-card" data-treatment="${id}" aria-pressed="false"><span class="type-style-preview type-style-${id}" aria-hidden="true"><b>${example}${small?`<i>${small}</i>`:''}</b></span><span>${label}</span></button>`).join('')}</div>
 <div class="type-style-fields" hidden><label class="field">Small text<input id="inset-small" maxlength="80"></label><label class="field">Large text<input id="inset-large" maxlength="160"></label><button class="btn sm" type="button" id="update-inset">Update inset text</button></div>`;
 const help=panel.querySelector('#type-style-help'),fields=panel.querySelector('.type-style-fields');
 const smallInput=panel.querySelector('#inset-small'),largeInput=panel.querySelector('#inset-large');
 const buttons=[...panel.querySelectorAll('[data-treatment]')];
 let target,parts;
 function select(component){
  parts=insetParts(component);
  target=parts?.root||(plainText(component)?component:null);
  const original=parts?.fixed;
  const current=original?'inset':target?.getAttributes()['data-type-treatment'];
  help.textContent=target?'Choose a style for the selected text.':'Select a heading or paragraph on the page.';
  for(const button of buttons){
   button.disabled=!target||(original&&button.dataset.treatment!=='inset');
   button.setAttribute('aria-pressed',String(current===button.dataset.treatment));
  }
  fields.hidden=!parts?.small||!parts.large;
  smallInput.value=parts?.small?.getEl()?.textContent||'';
  largeInput.value=parts?.large?.getEl()?.textContent||'';
 }
 for(const button of buttons)button.onclick=()=>{
  if(!target)return;
  const id=button.dataset.treatment;
  if(id==='inset'&&parts){smallInput.focus();return;}
  const value=(parts?.large||target).getEl().textContent.trim();
  const small=parts?.small?.getEl()?.textContent.trim();
  if(id==='inset'){
   target.components(`<span class="type-treatment-lockup"><span class="type-treatment-small">THE</span><span class="type-treatment-main">${esc(value)}</span></span>`);
  }else if(parts){
   target.components(esc([small,value].filter(Boolean).join(' ')));
  }
  target.addAttributes({'data-type-treatment':id});
  onChange(editor.getSelected());
  markDirty();
  toast(`${button.lastElementChild.textContent} applied.`);
 };
 panel.querySelector('#update-inset').onclick=()=>{
  if(!parts?.small||!parts.large)return;
  parts.small.components(esc(smallInput.value));
  parts.large.components(esc(largeInput.value));
  markDirty();
  toast('Inset text updated.');
 };
 editor.on('undo redo',()=>select(editor.getSelected()));
 select(null);
 return {select};
}

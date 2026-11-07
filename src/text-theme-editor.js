import {escapeHtml as e} from './project.js';
import {TEXT_SECTIONS,TEXT_STYLES,TEXT_TONES,textAppearance,textSection,textSectionConfig,textArtwork,updateTextSection} from './text-theme.js';

const singleton=new Set(['header','hero','footer']);

export function mountTextSections({editor,getBrief,toast,markDirty}){
 const picker=document.querySelector('#text-section-picker');
 const category=picker.querySelector('select');
 const controls=document.querySelector('#text-section-controls');
 const standard=document.querySelector('#standard-quick-add');
 const help=document.querySelector('.block-help');
 category.innerHTML=TEXT_SECTIONS.map(({id,name})=>`<option value="${id}">${e(name)}</option>`).join('');
 category.value='hero';

 function add(block,id,name){
  const wrapper=editor.getWrapper();
  const previous=singleton.has(id)&&wrapper.find(`[data-text-section="${id}"]`)[0];
  if(previous){
   editor.select(previous);
   previous.getEl()?.scrollIntoView({block:'center'});
   toast(`Use Section layout to change the existing ${name}.`);
   return;
  }
  const children=wrapper.components();
  const footer=children.find(c=>c.get('tagName')==='footer');
  const header=children.find(c=>c.get('tagName')==='header');
  const at=id==='header'?0:id==='hero'?(header?children.indexOf(header)+1:0):id==='footer'?children.length:footer?children.indexOf(footer):children.length;
  const [component]=wrapper.append(block.get('content'),{at});
  editor.select(component);
  component.getEl()?.scrollIntoView({block:'center'});
  toast(`${name} added.`);
 }

 function register(){
  const active=getBrief().theme==='text';
  picker.hidden=!active;
  standard.hidden=active;
  help.textContent=active?'Choose a category. Click a layout to add it, or drag it onto the canvas.':'Drag a section onto your page. Or use a quick-add button below.';
  if(!active)return false;
  const {id,name,layouts}=textSectionConfig(category.value);
  for(const {value,label} of layouts){
   const art=`<span class="text-block-sample text-block-${value}" aria-hidden="true"><i></i><i></i><i></i></span>`;
   editor.Blocks.add('text-'+id+'-'+value,{
    label,media:art,select:true,
    attributes:{class:'text-section-block',role:'button',tabindex:0,'aria-label':'Add '+label},
    content:textSection(id,getBrief(),{layout:value}),
    onClick:block=>add(block,id,name),
   });
  }
  return true;
 }

 function select(component){
  let section=component;
  while(section&&!section.getAttributes()['data-text-section'])section=section.parent();
  const id=section?.getAttributes()['data-text-section'];
  const config=textSectionConfig(id);
  controls.hidden=!config||getBrief().theme!=='text';
  controls.replaceChildren();
  if(controls.hidden)return;
  const current=textAppearance(section);
  const options=[['layout','Section layout',config.layouts],['style','Type style',TEXT_STYLES],['tone','Section colors',TEXT_TONES]];
  for(const [key,label,choices] of options){
   const field=document.createElement('label');
   field.className='field';
   field.textContent=label;
   const input=document.createElement('select');
   for(const choice of choices)input.add(new Option(choice.label,choice.value,false,choice.value===current[key]));
   input.onchange=()=>{updateTextSection(section,{[key]:input.value});markDirty();};
   field.append(input);
   controls.append(field);
  }
  if(id==='about'&&!section.find('[data-picture-to-text]').length){
   const button=document.createElement('button');
   button.type='button';button.className='btn sm text-wide';button.textContent='Add picture to text';
   button.onclick=()=>{
    const [artwork]=section.find('.type-content')[0].append(textArtwork());
    editor.select(artwork.find('[data-picture-to-text]')[0]);
    markDirty();
   };
   controls.append(button);
  }
 }

 editor.on('block:drag:stop',component=>{
  const id=component?.getAttributes()['data-text-section'];
  if(!singleton.has(id))return;
  const wrapper=editor.getWrapper();
  const previous=wrapper.find(`[data-text-section="${id}"]`).find(section=>section!==component);
  if(previous){
   component.remove();
   editor.select(previous);
   toast('Use Section layout to change the existing section.');
   return;
  }
  const children=wrapper.components();
  const header=children.find(c=>c.get('tagName')==='header');
  component.move(wrapper,{at:id==='header'?0:id==='hero'?(header?children.indexOf(header)+1:0):children.length});
 });
 document.querySelector('#blocks').addEventListener('keydown',event=>{
  const block=event.target.closest('.text-section-block');
  if(block&&['Enter',' '].includes(event.key)){event.preventDefault();block.click();}
 });
 return {category,register,select};
}

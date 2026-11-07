import {escapeHtml as e} from './project.js';
import {referencePage,referenceContent,referencePresets} from './portfolio-reference.js';
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
 let showingReference=false;

 function add(block,id,name,layout){
  const wrapper=editor.getWrapper();
  const page=referencePage(wrapper);
  const referenceSelector={header:'header',hero:'.tp-hero',footer:'footer'}[id];
  const previous=singleton.has(id)&&(wrapper.find(`[data-text-section="${id}"]`)[0]||page?.find(referenceSelector)[0]);
  if(previous){
   if(!previous.getAttributes()['data-text-section']){
    editor.select(previous);previous.getEl()?.scrollIntoView({block:'center'});
    toast(`Editing the portfolio’s ${name}.`);return;
   }
   updateTextSection(previous,{layout});
   editor.select(previous);
   select(previous);
   previous.getEl()?.scrollIntoView({block:'center'});
   toast(`${name} layout updated.`);
   return;
  }
  const container=(['header','footer'].includes(id)?page:referenceContent(page))||wrapper;
  const children=container.components();
  const footer=children.find(c=>c.get('tagName')==='footer');
  const header=children.find(c=>c.get('tagName')==='header');
  const at=id==='header'?0:id==='hero'?(header?children.indexOf(header)+1:0):id==='footer'?children.length:footer?children.indexOf(footer):children.length;
  const [component]=container.append(block.get('content'),{at});
  editor.select(id==='picture'?component.find('[data-picture-to-text]')[0]:component);
  component.getEl()?.scrollIntoView({block:'center'});
  toast(`${name} added.`);
 }

 function register(){
  const active=getBrief().theme==='text';
  picker.hidden=!active;
  standard.hidden=active;
  help.textContent=active?'Choose a section, then add a layout. Header, Hero and Footer choices restyle the section already on this page.':'Drag a section onto your page. Or use a quick-add button below.';
  const page=active&&referencePage(editor.getWrapper());
  if(Boolean(page)!==showingReference){
   showingReference=Boolean(page);
   if(page){category.prepend(new Option('Portfolio styles','portfolio-reference'));category.value='portfolio-reference';}
   else{category.querySelector('[value="portfolio-reference"]')?.remove();category.value='hero';}
  }
  if(!active)return false;
  if(page&&category.value==='portfolio-reference'){
   help.textContent='Add a styled section from this portfolio.';
   for(const {id,name,html} of referencePresets(page.getAttributes()['lang'])){
    editor.Blocks.add('portfolio-reference-'+id,{
     label:name,media:'<span class="text-block-sample text-block-rows" aria-hidden="true"><i></i><i></i><i></i></span>',select:true,
     attributes:{class:'text-section-block',role:'button',tabindex:0,'aria-label':'Add '+name},
     content:html,onClick:()=>{
      const [added]=referenceContent(page).append(html);
      editor.select(added);added.getEl()?.scrollIntoView({block:'center'});toast(`${name} added.`);
     },
    });
   }
   return true;
  }
  const {id,name,layouts}=textSectionConfig(category.value);
  for(const {value,label} of layouts){
   const art=`<span class="text-block-sample text-block-${value}" aria-hidden="true"><i></i><i></i><i></i></span>`;
   editor.Blocks.add('text-'+id+'-'+value,{
    label,media:art,select:true,
    attributes:{class:'text-section-block',role:'button',tabindex:0,'aria-label':'Add '+label},
    content:textSection(id,getBrief(),{layout:value}),
    onClick:block=>add(block,id,name,value),
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
  const title=document.createElement('div');title.className='field-title';title.textContent=config.name;controls.append(title);
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
  const artwork=section.find('[data-picture-to-text]')[0];
  if(artwork&&component!==artwork&&(id!=='hero'||current.layout==='split')){
   const button=document.createElement('button');
   button.type='button';button.className='btn sm text-wide';button.textContent='Edit picture to text';
   button.onclick=()=>editor.select(artwork);controls.append(button);
  }
  if(id==='about'&&!artwork){
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

 editor.on('block:drag:stop',(component,block)=>{
  if(component&&block?.getId().startsWith('portfolio-reference-')){
   const main=referenceContent(referencePage(editor.getWrapper()));
   if(main&&component.parent()!==main)component.move(main,{at:main.components().length});
   return;
  }
  const id=component?.getAttributes()['data-text-section'];
  if(id==='picture'){editor.select(component.find('[data-picture-to-text]')[0]);return;}
  if(!singleton.has(id))return;
  const wrapper=editor.getWrapper();
  const previous=wrapper.find(`[data-text-section="${id}"]`).find(section=>section!==component);
  if(previous){
   updateTextSection(previous,{layout:textAppearance(component).layout});
   component.remove();
   editor.select(previous);
   select(previous);
   toast('Section layout updated.');
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

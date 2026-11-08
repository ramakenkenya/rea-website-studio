import {TEXT_BLOCK_ANCHORS,TEXT_BLOCK_PRESETS,textBlockMarkup} from './text-blocks.js';
import {TEXT_BLOCK_CSS} from './text-block-style.js';
import {TEXT_CATALOG_CSS} from './text-catalog-style.js';
import {REFERENCE_SECTION_CSS,referencePage,referenceContent,referencePresets} from './portfolio-reference.js';
import {TEXT_STYLES,TEXT_TONES,textAppearance,textSection,textSectionConfig,textArtwork,updateTextSection} from './text-theme.js';

export function mountTextSections({editor,getBrief,toast,markDirty}){
 const controls=document.querySelector('#text-section-controls');
 const standard=document.querySelector('#standard-quick-add');
 const help=document.querySelector('.block-help');
 const stylesheet=document.createElement('style');
 stylesheet.textContent=TEXT_BLOCK_CSS+TEXT_CATALOG_CSS;
 document.head.append(stylesheet);

 function containerFor(position){
  const wrapper=editor.getWrapper();
  const portfolio=referencePage(wrapper);
  return (position?portfolio:referenceContent(portfolio))||wrapper;
 }

 function insertAt(container,position){
  const children=container.components();
  if(position==='header')return children.at(0)?.getClasses().includes('tp-skip')?1:0;
  const footer=children.find(child=>child.get('tagName')==='footer'||child.getAttributes()['data-portfolio-part']==='footer');
  return position==='footer'?children.length:footer?.index()??children.length;
 }

 function finish(component,{name,anchor,position,primary,picture,original},dragged=false){
  const wrapper=editor.getWrapper();
  if(original&&!editor.Css.getRule('.mm-section .mm-stage'))editor.addStyle(REFERENCE_SECTION_CSS);
  const container=containerFor(position);
  if(dragged&&(position||component.parent()!==container)){
   let near=component;
   while(near?.parent()&&near.parent()!==container)near=near.parent();
   const at=!position&&near?.parent()===container?near.index()+1:insertAt(container,position);
   component.move(container,{at});
  }
  if(anchor&&!wrapper.find(`[id="${anchor}"]`).length)component.addAttributes({id:anchor});
  if(primary&&!wrapper.find('h1').length)component.find('h2')[0]?.set('tagName','h1');
  if(component.find('.tp-hero').length||component.getClasses().includes('tp-hero')){
   const heading=component.find('h1')[0];
   if(heading&&wrapper.find('h1').length>1){heading.set('tagName','h2');heading.addAttributes({'data-copied-hero-title':'true'});}
  }
  const target=picture?component.find('[data-picture-to-text]')[0]:component;
  editor.select(target||component);
  if(matchMedia('(max-width:760px)').matches)document.querySelector(`[data-mobile="${picture?'inspector':'canvas'}"]`).click();
  component.getEl()?.scrollIntoView({block:'center'});
  toast(`${name} added.`);
 }

 const cards=new Map();
 const catalog=document.querySelector('#blocks');
 const groups=[
  ['start','Start here'],['portfolio','Original portfolio'],['opening','Header & opening'],
  ['about','About & statements'],['features','Services & features'],['work','Work & results'],
  ['process','Process'],['people','Team & testimonials'],['faq','FAQ'],['closing','Calls to action & footers'],
 ].map(([id,label],order)=>({id:'text-catalog-'+id,label,order,open:order===0}));
 const groupFor={Header:'opening',Headline:'opening',Statement:'about',Reasons:'about',About:'about',Features:'features','Case Study':'work','Work List':'work',Process:'process',Team:'people',Testimonials:'people',FAQ:'faq',Callout:'closing',Footer:'closing'};

 function addCard({id,name,group,content,preview,position,primary,anchor,picture,original,label=name}){
  const details={name,position,primary,anchor,picture,original};
  cards.set(id,details);
  editor.Blocks.add(id,{
   category:groups.find(item=>item.id==='text-catalog-'+group),
   label,media:preview,
   attributes:{class:'text-section-block styled-text-preset',role:'button',tabindex:0,'aria-label':'Add '+name},
   content,select:false,
   onClick:()=>{
    const container=containerFor(position);
    const [added]=container.append(content,{at:insertAt(container,position)});
    finish(added,details);
   },
  });
 }

 const preview=(label,mark='Aa',dark=false)=>`<div class="text-card-sample${dark?' is-dark':''}" aria-hidden="true"><strong>${mark}</strong><span>${label}</span></div>`;
 const variants={header:'RAMA /',hero:'RAMA KEN.',work:'THE WORK',motion:'BLACK / WHITE',about:'ALWAYS ASKING',notes:'FIELD NOTES',contact:'LET’S MAKE',footer:'BACK TO TOP ↑'};
 function register(){
  const active=getBrief().theme==='text';
  standard.hidden=active;
  cards.clear();
  catalog.classList.toggle('styled-text-palette',active);
  if(!active){help.textContent='Drag a section onto your page, or use a quick-add button.';return false;}
  help.textContent='Open a group, then click or drag a block onto the page.';
  addCard({id:'text-basic',name:'Text',group:'start',primary:true,preview:preview('Heading and paragraph'),content:'<section class="tb-block" data-section="Text"><h2 class="tb-title">Your heading</h2><p class="tb-copy">Write something here.</p></section>'});
  addCard({id:'text-columns',name:'Text columns',group:'start',primary:true,preview:preview('Two editable columns','Aa / Bb'),content:'<section class="tb-block" data-section="Text columns"><h2 class="tb-title">Your heading</h2><div class="tb-editorial-columns"><p class="tb-copy">Write your first column.</p><p class="tb-copy">Write your second column.</p></div></section>'});
  addCard({id:'text-picture',name:'Picture to Text',group:'start',picture:true,preview:preview('Upload a picture','▒▓█▓▒',true),content:textSection('picture',getBrief(),{layout:'split'})});
  const page=referencePage(editor.getWrapper());
  for(const {id,name,html,portable,anchor} of referencePresets(page?.getAttributes().lang||'en')){
   addCard({id:'portfolio-reference-'+id,name,group:'portfolio',content:page?html:portable,original:true,
    position:id==='header'||id==='footer'?id:undefined,anchor,preview:preview(name,variants[id],true)});
  }
  for(const group of groups){
   for(const preset of TEXT_BLOCK_PRESETS.filter(item=>group.id==='text-catalog-'+groupFor[item.block])){
    const {id,block,style}=preset;
    const content=textBlockMarkup(preset,{brief:getBrief()});
    addCard({id:'styled-text-'+id,name:`${block} · ${style}`,group:groupFor[block],content,
     label:`<strong>${block}</strong><span>${style}</span>`,
     preview:`<div class="text-preset-preview" inert aria-hidden="true">${content}</div>`,
     anchor:TEXT_BLOCK_ANCHORS[id],position:preset.tag|| (id==='utility-footer'?'footer':undefined),primary:block==='Headline'});
   }
  }
  return true;
 }

 function select(component){
  let section=component;
  while(section&&!section.getAttributes()['data-text-section']&&!section.getAttributes()['data-styled-text-block']&&!section.getClasses().includes('tb-block'))section=section.parent();
  const id=section?.getAttributes()['data-text-section'];
  const config=textSectionConfig(id);
  const styled=section?.getClasses().includes('tb-block');
  controls.hidden=(!config&&!styled)||getBrief().theme!=='text';
  controls.replaceChildren();
  if(controls.hidden)return;
  if(styled){
   const field=document.createElement('label');
   field.className='field';field.textContent='Section colors';
   const input=document.createElement('select');
   const current=section.getAttributes()['data-text-tone']||'';
   for(const [value,label] of [['','Preset colors'],['light','Light'],['dark','Dark'],['grid','Light grid paper']])input.add(new Option(label,value,false,value===current));
   input.onchange=()=>{
    if(input.value)section.addAttributes({'data-text-tone':input.value});else section.removeAttributes('data-text-tone');
    markDirty();
   };
   field.append(input);controls.append(field);
   return;
  }
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
  const details=cards.get(block?.getId());
  if(component&&details)finish(component,details,true);
 });
 // Keep the native block category toggles usable by keyboard and screen readers.
 const syncGroups=()=>{
  for(const title of catalog.querySelectorAll('.gjs-block-category > [data-title]')){
   title.setAttribute('role','button');
   title.tabIndex=0;
   title.firstElementChild?.setAttribute('aria-hidden','true');
   title.setAttribute('aria-expanded',String(title.parentElement.classList.contains('gjs-open')));
  }
 };
 new MutationObserver(syncGroups).observe(catalog,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
 catalog.addEventListener('keydown',event=>{
  const button=event.target.closest('.text-section-block,.gjs-block-category > [data-title]');
  if(button&&['Enter',' '].includes(event.key)){event.preventDefault();button.click();}
 });
 return {register,select};
}

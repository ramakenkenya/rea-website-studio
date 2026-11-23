import {REFERENCE_PORTFOLIO_CSS as sourceCss,REFERENCE_PORTFOLIO_PAGES} from './portfolio-reference-data.js';
import {TEXT_SAMPLE_PAGES} from './text-portfolio.js';
import {createStudio} from './site-model.js';
import {textPageLocale} from './text-languages.js';

// CSSOM cannot expand a variable in these shorthands when GrapesJS parses the sheet.
export const REFERENCE_PAINT_SELECTOR='.tp-page[data-portfolio-reference] .tp-outline';
export const REFERENCE_PAINT_CSS=`
${REFERENCE_PAINT_SELECTOR}{-webkit-text-stroke-width:1px;-webkit-text-stroke-color:var(--tp-ink)}
.tp-page[data-portfolio-reference] .tp-project-num{-webkit-text-stroke-width:1px;-webkit-text-stroke-color:var(--tp-muted)}
.tp-page[data-portfolio-reference] .tp-inset-small,.tp-page[data-portfolio-reference] .tp-skip,.tp-page[data-portfolio-reference] .tp-language-switch a[aria-current="page"]{background-color:var(--tp-ink)}
`;
export const REFERENCE_PORTFOLIO_CSS=sourceCss+REFERENCE_PAINT_CSS;

export const REFERENCE_SECTION_CSS=sourceCss.replace(/^\*\{box-sizing:border-box\}html[^\n]+/m,'')+REFERENCE_PAINT_CSS;
export const PORTFOLIO_PART_CSS=`
.tp-page[data-portfolio-part],.tp-page[data-portfolio-part] *{box-sizing:border-box}
.tp-page[data-portfolio-part] .tp-outline{-webkit-text-stroke-width:1px;-webkit-text-stroke-color:var(--tp-ink)}
.tp-page[data-portfolio-part] .tp-project-num{-webkit-text-stroke-width:1px;-webkit-text-stroke-color:var(--tp-muted)}
.tp-page[data-portfolio-part] .tp-inset-small{background-color:var(--tp-ink)}
.tp-hero [data-copied-hero-title]{font-size:clamp(70px,12vw,166px);font-weight:900;line-height:.84;letter-spacing:-.085em;margin:0 0 32px;text-transform:uppercase;max-width:100%;overflow-wrap:anywhere}
@media(max-width:600px){.tp-hero [data-copied-hero-title]{font-size:clamp(68px,21vw,132px)}}
`;

const presets=[
 ['header','Portfolio navigation','header'],
 ['hero','Portfolio introduction','.tp-hero'],
 ['work','Selected work'],
 ['about','About'],
 ['notes','Editorial notes'],
 ['contact','Contact'],
 ['footer','Portfolio footer','footer'],
];

export function referencePortfolioProject(){
 return {
  pages:TEXT_SAMPLE_PAGES.map((page,i)=>({id:page.id,name:page.name,component:REFERENCE_PORTFOLIO_PAGES[i?'ko':'en']})),
  styles:[],
 };
}

export function referencePage(wrapper){
 return wrapper?.findType(component=>component.getAttributes()['data-portfolio-reference']==='true',{max:1})?.[0];
}

// Early Text Only projects were created as one ordinary Home page even though
// the supplied header advertised two languages. Add the missing bundled page;
// never replace the author's existing page, content, styles or site settings.
export function repairLegacyPortfolioLanguages(editor,studio){
 const pages=Array.from(editor.Pages.getAll());
 const references=pages.map(page=>({page,root:referencePage(page.getMainComponent())})).filter(item=>item.root);
 const english=references.find(({page,root})=>textPageLocale(page.getMainComponent())==='en'&&
  page.id!=='text-en'&&!root.getAttributes()['data-language-pair-version']&&
  root.findType(component=>component.getClasses().includes('tp-hero'),{max:1}).length&&
  root.findType(component=>component.getAttributes()['data-language-target']==='ko',{max:1}).length);
 const hasKorean=pages.some(page=>textPageLocale(page.getMainComponent())==='ko');
 let added=0;
 if(english&&!hasKorean&&pages.length<20){
  const preset=TEXT_SAMPLE_PAGES[1];
  let id=preset.id,n=2;while(editor.Pages.get(id))id=`${preset.id}-${n++}`;
  let slug=preset.slug;n=2;while(studio.pages.some(page=>page.slug===slug))slug=`${preset.slug}-${n++}`;
  editor.Pages.add({id,name:preset.name,component:REFERENCE_PORTFOLIO_PAGES.ko});
  studio=createStudio(editor.getProjectData(),{}, {...studio,pages:[...studio.pages,{...preset,id,slug}]});
  added=1;
 }
 // Persist provenance so deliberately deleting a language later is respected.
 for(const page of editor.Pages.getAll())referencePage(page.getMainComponent())?.addAttributes({'data-language-pair-version':'1'});
 return {studio,added};
}

export function referenceContent(page){return page?.find('main')[0]||page;}

const cachedPresets=new Map();
export function referencePresets(locale){
 if(!cachedPresets.has(locale)){
  const markup=REFERENCE_PORTFOLIO_PAGES[locale]||REFERENCE_PORTFOLIO_PAGES.en;
  const document=new DOMParser().parseFromString(markup,'text/html');
  cachedPresets.set(locale,presets.map(([id,name,selector])=>{
   const section=document.querySelector(selector||`section#${locale==='ko'?'ko-':''}${id}`);
   const anchor=section.id;
   section.removeAttribute('id');
   section.setAttribute('data-section',name);
   const html=section.outerHTML;
   section.querySelector('.tp-language-switch')?.remove();
   const portable=`<div class="tp-page" data-portfolio-part="${id}" data-section="${name}" lang="${locale==='ko'?'ko':'en'}">${section.outerHTML}</div>`;
   return {id,name,html,portable,anchor};
  }));
 }
 return cachedPresets.get(locale);
}

// Older projects can contain the retired block directly or inside its portable wrapper.
export function removeRetiredPortfolioMotion(editor,studio){
 for(const page of editor.Pages.getAll()){
  const wrapper=page.getMainComponent();
  for(const section of wrapper.findType(component=>component.getClasses().includes('mm-section'))){
   const parent=section.parent();
   section.remove();
   if(parent?.getAttributes()['data-portfolio-part']==='motion'&&!parent.components().length)parent.remove();
  }
 }
 const retiredRules=editor.Css.getRules().filter(rule=>rule.getAtRule()==='@keyframes mm-travel'||
  rule.selectorsToString().split(',').every(selector=>/^\s*\.mm-section(?![\w-])/.test(selector)));
 editor.Css.remove(retiredRules);
 if(studio){
  studio.sections=studio.sections.flatMap(section=>{
   if(!section.html.includes('mm-section'))return [section];
   const {body}=new DOMParser().parseFromString(section.html,'text/html');
   body.querySelectorAll('.mm-section').forEach(block=>block.remove());
   body.querySelectorAll('[data-portfolio-part="motion"]:empty').forEach(block=>block.remove());
   return body.innerHTML.trim()?[{...section,html:body.innerHTML}]:[];
  });
 }
}

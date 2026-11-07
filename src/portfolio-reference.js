import {REFERENCE_PORTFOLIO_CSS as sourceCss,REFERENCE_PORTFOLIO_PAGES} from './portfolio-reference-data.js';
import {TEXT_SAMPLE_PAGES} from './text-portfolio.js';

// CSSOM cannot expand a variable in these shorthands when GrapesJS parses the sheet.
export const REFERENCE_PAINT_SELECTOR='.tp-page[data-portfolio-reference] .tp-outline';
export const REFERENCE_PAINT_CSS=`
${REFERENCE_PAINT_SELECTOR}{-webkit-text-stroke-width:1px;-webkit-text-stroke-color:var(--tp-ink)}
.tp-page[data-portfolio-reference] .tp-project-num{-webkit-text-stroke-width:1px;-webkit-text-stroke-color:var(--tp-muted)}
.tp-page[data-portfolio-reference] .tp-inset-small,.tp-page[data-portfolio-reference] .tp-skip,.tp-page[data-portfolio-reference] .tp-language-switch a[aria-current="page"]{background-color:var(--tp-ink)}
`;
export const REFERENCE_PORTFOLIO_CSS=sourceCss+REFERENCE_PAINT_CSS;

const presets=[
 ['work','Selected work'],
 ['motion','Monochrome motion'],
 ['about','About'],
 ['notes','Editorial notes'],
 ['contact','Contact'],
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

export function referenceContent(page){return page?.find('main')[0]||page;}

const cachedPresets=new Map();
export function referencePresets(locale){
 if(!cachedPresets.has(locale)){
  const markup=REFERENCE_PORTFOLIO_PAGES[locale]||REFERENCE_PORTFOLIO_PAGES.en;
  const document=new DOMParser().parseFromString(markup,'text/html');
  cachedPresets.set(locale,presets.map(([id,name])=>{
   const section=document.querySelector(id==='motion'?'.mm-section':`section#${locale==='ko'?'ko-':''}${id}`);
   // The starter keeps its navigation anchors when a second copy is inserted.
   section.removeAttribute('id');
   return {id,name,html:section.outerHTML};
  }));
 }
 return cachedPresets.get(locale);
}

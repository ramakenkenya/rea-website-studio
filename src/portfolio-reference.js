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
 ['motion','Monochrome motion'],
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

export function referenceContent(page){return page?.find('main')[0]||page;}

const cachedPresets=new Map();
export function referencePresets(locale){
 if(!cachedPresets.has(locale)){
  const markup=REFERENCE_PORTFOLIO_PAGES[locale]||REFERENCE_PORTFOLIO_PAGES.en;
  const document=new DOMParser().parseFromString(markup,'text/html');
  cachedPresets.set(locale,presets.map(([id,name,selector])=>{
   const section=document.querySelector(selector||(id==='motion'?'.mm-section':`section#${locale==='ko'?'ko-':''}${id}`));
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

import {escapeHtml as e} from './project.js';
import {portraitMarkup} from './text-portrait.js';
import {TEXT_THEME_CSS} from './text-theme-style.js';
import {TEXT_BLOCK_CSS} from './text-block-style.js';

const options=entries=>entries.map(([value,label])=>({value,label}));
export const TEXT_SECTIONS=[
 {id:'header',name:'Header & Navigation',layouts:options([['inline','Inline navigation'],['stacked','Stacked navigation']])},
 {id:'hero',name:'Hero',layouts:options([['stacked','Editorial headline'],['split','Headline with picture to text']])},
 {id:'about',name:'About & Notes',layouts:options([['split','Split editorial'],['stacked','Stacked editorial']])},
 {id:'services',name:'Services & Features',layouts:options([['grid','Numbered columns'],['stagger','Staggered features'],['rows','Feature rows']])},
 {id:'work',name:'Work & Results',layouts:options([['rows','Project rows'],['grid','Project grid'],['split','Featured case study']])},
 {id:'process',name:'Process',layouts:options([['timeline','Horizontal timeline'],['rows','Vertical steps']])},
 {id:'people',name:'Team & Testimonials',layouts:options([['grid','People & quotes grid'],['rows','People & quotes list']])},
 {id:'faq',name:'FAQ',layouts:options([['rows','Ruled questions'],['split','Split questions']])},
 {id:'cta',name:'Call to Action',layouts:options([['stacked','Centered invitation'],['split','Split invitation']])},
 {id:'footer',name:'Footer',layouts:options([['inline','Utility columns'],['stacked','Stacked index']])},
 {id:'picture',name:'Picture to Text',layouts:options([['split','Artwork with caption'],['stacked','Centered artwork']])},
];
export const TEXT_STYLES=options([['solid','Solid display'],['outline','Outline display'],['serif','Editorial serif']]);
export const TEXT_TONES=options([['inherit','Site colors'],['light','Light'],['dark','Dark']]);
export const textSectionConfig=id=>TEXT_SECTIONS.find(section=>section.id===id);

export function textArtwork(){
 const art=portraitMarkup('ADD A PICTURE','Picture to Text placeholder')
  .replace('<pre ','<pre data-picture-to-text="true" data-picture-empty="true" ');
 return `<figure class="type-art"><div class="type-art-surface">${art}</div><figcaption class="type-label">Picture to Text</figcaption></figure>`;
}

function panel(label,title,content){
 return `<div class="type-heading"><span class="type-label">${label}</span><h2 class="type-title">${title}</h2></div><div class="type-content">${content}</div>`;
}

function item(n,title,copy,classes=''){
 return `<article class="type-item ${classes}"><span class="type-number" aria-hidden="true">${String(n).padStart(2,'0')}</span><div><h3>${e(title)}</h3><p>${e(copy)}</p></div></article>`;
}

export function textSection(id,brief,{layout,style='serif',tone='inherit',starter=false,headline}={}){
 const config=textSectionConfig(id);
 if(!config)throw Error('Unknown text section.');
 const chosen=config.layouts.find(option=>option.value===layout)?.value||config.layouts[0].value;
 const name=e(brief.name||'Your website');
 const description=e(brief.description||'Use this space to introduce yourself and the work you do.');
 const email=brief.email?e(brief.email):'';
 const contact=email?`<a class="type-action" href="mailto:${email}">${e(brief.cta||'Get in touch')} <span aria-hidden="true">↗</span></a>`:'';
 let tag='section',body='';
 switch(id){
 case 'header':
  tag='header';
  body=`<a class="site-brand type-brand" href="${starter?'#text-header':'./'}">${name}<span aria-hidden="true"> /</span></a><nav aria-label="Website navigation">${starter?'<a href="#text-services">Services</a><a href="#text-work">Work</a><a href="#text-about">About</a><a href="#text-cta">Contact</a>':'<a href="./">Home</a>'}</nav>`;
  break;
 case 'hero':
  body=`<div class="type-heading"><span class="type-label">01 / INTRODUCTION</span><h1 class="type-title">${e(headline||brief.name||'Your website')}</h1><div class="type-hero-meta"><p class="type-intro">${description}</p>${contact||(starter?'<a class="type-action" href="#text-work">Explore the work <span aria-hidden="true">↓</span></a>':'')}</div></div>${chosen==='split'?textArtwork():''}`;
  break;
 case 'about':
  body=panel('04 / BACKGROUND','About',`<p>${description}</p><p>Add a note about what shaped your approach or what you are working on next.</p>`);
  break;
 case 'services': {
  const names=(brief.services||'Service one, Service two, Service three').split(',').map(s=>s.trim()).filter(Boolean).slice(0,6);
  body=panel('02 / OFFERINGS','What we do',`<div class="type-items">${names.map((title,i)=>item(i+1,title,'Describe what this includes and who it helps.')).join('')}</div>`);
  break;
 }
 case 'work':
  body=panel('03 / SELECTED WORK','The work',`<div class="type-items">${[1,2,3].map(i=>item(i,'Your project 0'+i,'Describe the challenge, your role, and what came out of the work.','tp-project')).join('')}</div>`);
  break;
 case 'process':
  body=panel('METHOD / SEQUENCE','How we work',`<ol class="type-items type-steps">${[['Discover','Define the question and gather what you need.'],['Develop','Shape the idea and test how it works.'],['Deliver','Review the result and share the next steps.']].map(([title,copy])=>`<li class="type-item"><h3>${title}</h3><p>${copy}</p></li>`).join('')}</ol>`);
  break;
 case 'people':
  body=panel('PEOPLE / VOICES','People behind the work',`<div class="type-items">${item(1,'Team member name','Add their role and what they bring to the work.')}<figure class="type-item type-quote"><blockquote><p>Add a quote you have permission to share.</p></blockquote><figcaption>Speaker name and role</figcaption></figure></div>`);
  break;
 case 'faq':
  body=panel('COMMON QUESTIONS','Good to know',`<div class="type-questions"><details open><summary>What should I know before getting started?</summary><p>Use this space to explain what someone should bring or prepare.</p></details><details><summary>How does the process work?</summary><p>Describe what happens after someone gets in touch.</p></details></div>`);
  break;
 case 'cta':
  body=panel('05 / NEXT STEP','Let’s talk',contact||(starter?'<p>Add your contact email in the Brief to give visitors a way to reach you.</p><a class="type-action" href="#text-header">Back to top ↑</a>':'<p>Tell visitors what to do next and how to reach you.</p>'));
  break;
 case 'footer':
  tag='footer';
  body=`<strong class="type-brand">${name} /</strong>${email?`<a href="mailto:${email}">${email}</a>`:''}${starter?'<a href="#text-header">Back to top ↑</a>':'<a href="./">Home ↑</a>'}`;
  break;
 case 'picture':
  body=panel('MEDIA / GLYPH ART','Picture to Text',textArtwork());
  break;
 }
 const classes=`type-section type-${id} type-layout-${chosen} type-style-${style} type-tone-${tone}`;
 return `<${tag} class="${classes}" data-text-section="${id}" data-section="${e(config.name)}"${starter?` id="text-${id}"`:''}>${body}</${tag}>`;
}

export function textAppearance(section){
 const classes=section.getClasses();
 const value=(prefix,fallback)=>classes.find(name=>name.startsWith(prefix))?.slice(prefix.length)||fallback;
 return {layout:value('type-layout-',''),style:value('type-style-','solid'),tone:value('type-tone-','inherit')};
}

export function updateTextSection(section,appearance){
 const config=textSectionConfig(section.getAttributes()['data-text-section']);
 if(!config)return;
 const current=textAppearance(section);
 for(const [key,choices] of Object.entries({layout:config.layouts,style:TEXT_STYLES,tone:TEXT_TONES})){
  const value=appearance[key];
  if(current[key]===value||!choices.some(option=>option.value===value))continue;
  section.removeClass(`type-${key}-${current[key]}`);
  section.addClass(`type-${key}-${value}`);
 }
 if(config.id==='hero'&&appearance.layout==='split'&&!section.find('[data-picture-to-text]').length)section.append(textArtwork());
}

export function createTextTheme(){
 return {html:'',css:TEXT_THEME_CSS+TEXT_BLOCK_CSS};
}

export function createTextThemePage(brief,name,kind){
 if(kind==='blank')return createTextTheme();
 const ids={blank:[],about:['about','people'],products:['services','work'],contact:['cta','faq']}[kind]||[];
 return {html:['header','hero',...ids,'footer'].map(id=>textSection(id,brief,{headline:name})).join(''),css:TEXT_THEME_CSS};
}

import {monochromeMotion} from './monochrome-motion.js';
import {escapeHtml as e} from './project.js';
import {portraitMarkup} from './text-portrait.js';
import {RAMA_PORTRAIT} from './rama-portrait.js';
import {TEXT_PORTFOLIO_CSS} from './text-portfolio-style.js';
import {PORTFOLIO_COPY} from './text-portfolio-copy.js';

export const TEXT_SAMPLE_BRIEF={name:'Rama Ken',description:'I build games, useful tools and creative experiments with AI — and share what I learn along the way.',services:'Games, Useful tools, Creative experiments',email:'',title:'Rama Ken — Ideas into working things',cta:'Find me on GitHub',theme:'text'};
const PROJECT_URLS=['https://gorillavs100.com','https://mvuakenya.com','https://ramakenkenya.github.io/rea-website-studio/'];
const genericProjects=[1,2,3].map((n)=>({name:`Your project ${String(n).padStart(2,'0')}`,type:`0${n} / SELECTED WORK`,description:'Introduce the problem, the idea and what you made. Replace this entry with your own work.',detail:'Your contribution: describe your role and what you learned.',href:'#contact',action:'Discuss this project',note:'PROJECT / DETAILS'}));
const placeholder=Array.from({length:88},(_,y)=>Array.from({length:120},(_,x)=>{
 const dx=(x-60)/33,dy=(y-32)/25;
 return dx*dx+dy*dy<1?(Math.abs(dx)<.65&&dy>-.3&&dy<-.1?' ':'.'):(y>57&&y<83&&Math.abs(x-60)<(y-50)*1.8?':':' ');
}).join('')).join('\n');

export const TEXT_SAMPLE_PAGES=[{id:'text-en',name:'English',slug:'english',title:TEXT_SAMPLE_BRIEF.title,description:TEXT_SAMPLE_BRIEF.description,nav:false},{id:'text-ko',name:'한국어',slug:'ko',title:'라마 켄 — 아이디어를 실제로 만드는 일',description:PORTFOLIO_COPY.ko.intro,nav:false}];
export function textSampleMetadata(){return {homeId:'text-en',pages:TEXT_SAMPLE_PAGES.map(p=>({...p})),autosave:false};}
export function textSampleProject(){
 return {pages:TEXT_SAMPLE_PAGES.map((p,i)=>{const html=createTextPortfolio(TEXT_SAMPLE_BRIEF,{sample:true,language:i?'ko':'en'}).html;return {id:p.id,name:p.name,component:i?prefixTextPortfolioIds(html):html};}),styles:[]};
}
export function prefixTextPortfolioIds(html){
 return html.replace(/\bid="([^"]+)"/g,(_,id)=>`id="ko-${id}"`).replace(/href="#([^"]+)"/g,(_,id)=>`href="#${['en','ko'].includes(id)?id:'ko-'+id}"`);
}

export function createTextPortfolio(brief,{sample=false,language='en',languageLinks={en:'index.html',ko:'ko.html'}}={}){
 const locale=language==='ko'?'ko':'en',t=PORTFOLIO_COPY[locale];
 const name=sample?t.name:(brief.name||'Your name'),words=name.trim().split(/\s+/),first=sample?t.first:words.shift(),rest=sample?t.rest:words.join(' ');
 const projects=sample?t.projects.map((p,i)=>({...p,href:PROJECT_URLS[i]})):genericProjects;
 const contact=brief.email?`mailto:${e(brief.email)}`:sample?'https://github.com/ramakenkenya':'#work';
 const action=brief.email?(brief.cta||t.conversation):sample?t.contactAction:t.explore;
 const portrait=portraitMarkup(sample?RAMA_PORTRAIT:placeholder,sample?t.portrait:'Sample character portrait. Replace with your own photo in the editor.');
 const lines=a=>a.map(e).join('<br>');
 const outlined=a=>`${e(a[0])}<br>${e(a[1])}<br><span class="tp-outline">${e(a[2])}</span>`;
 const switcher=sample?`<div class="tp-language-switch" role="group" aria-label="Language / 언어"><a href="${e(languageLinks.en)}" lang="en" hreflang="en" data-language-target="en"${locale==='en'?' aria-current="page"':''}>English</a><a href="${e(languageLinks.ko)}" lang="ko" hreflang="ko" data-language-target="ko"${locale==='ko'?' aria-current="page"':''}>한국어</a></div>`:`<span class="tp-mono tp-index">${e(t.status)}</span>`;
 const html=`<div class="tp-page"${sample?` lang="${locale}" data-text-locale="${locale}"`:''}>
 <a class="tp-skip" href="#main">${e(t.skip)}</a>
 <header class="tp-nav" id="top"><a class="tp-brand" href="#top">${e(name.toUpperCase())}<span aria-hidden="true"> /</span></a><nav aria-label="${e(t.navLabel)}">${['work','about','notes','contact'].map((id,i)=>`<a href="#${id}">${e(t.nav[i])}</a>`).join('')}</nav>${switcher}</header>
 <main id="main">
 <section class="tp-hero" data-section="Introduction"><div class="tp-kicker tp-mono"><span>${e(sample?t.kicker:t.genericKicker)}</span><span>${e(sample?t.background:t.genericBackground)}</span></div>
 <div class="tp-hero-grid"><div><h1><span class="tp-name-line">${e(first)}</span>${rest?`<span class="tp-name-line tp-outline">${e(rest)}<span aria-hidden="true">.</span></span>`:''}</h1><p class="tp-intro">${e(sample?t.intro:(brief.description||'I turn questions into ideas, and ideas into things people can use.'))}</p><a class="tp-link" href="#work">${e(t.explore)} <span aria-hidden="true">↓</span></a></div>
 <figure class="tp-portrait">${portrait}<figcaption class="tp-mono"><span>${e(t.portraitCaption)}</span><span>${e(t.portraitGrid)}</span></figcaption></figure></div>
 <div class="tp-hero-foot tp-mono"><span>${e(t.heroFoot)}</span><span>${e(t.scroll)}</span></div></section>
 <section class="tp-section" id="work" data-section="Selected work"><div class="tp-section-head tp-work-head"><div><span class="tp-mono tp-muted">${e(t.workLabel)}</span><h2 class="tp-inset-heading"><span class="tp-inset-tab"><span class="tp-inset-small">${e(t.workInset[0])}</span></span> <span class="tp-inset-large">${e(t.workInset[1])}</span></h2></div><span class="tp-section-tag tp-mono">${lines(t.workNote)}</span></div>
 ${projects.map((p,i)=>`<article class="tp-project"><span class="tp-project-num" aria-hidden="true">0${i+1}</span><div><span class="tp-project-type tp-mono">${e(p.type)}</span><h3><a href="${e(p.href)}">${e(p.name)}</a></h3><p>${e(p.description)}</p><span class="tp-muted tp-mono" style="letter-spacing:0;text-transform:none">${e(p.detail)}</span></div><div class="tp-project-side"><a class="tp-link" href="${e(p.href)}">${e(p.action)} <span aria-hidden="true">↗</span></a><span class="tp-project-note tp-mono">${e(p.note)}</span></div></article>`).join('')}</section>
 ${sample?monochromeMotion({sample:true,language:locale}):''}
 <section class="tp-section" id="about" data-section="About"><div class="tp-about-grid"><div><span class="tp-mono tp-muted">${e(t.aboutLabel)}</span><h2>${outlined(t.aboutHeading)}</h2></div><div class="tp-about-copy"><p>${e(sample?t.about[0]:'Introduce yourself here. Tell people where your curiosity takes you and what connects the projects you choose to make.')}</p><p>${e(sample?t.about[1]:'Explain how you work, what you care about and the contribution you bring to a project.')}</p><p><strong>${e(sample?t.aboutStrong:'Make this space your own.')}</strong> ${e(sample?t.aboutEnd:'Use your own experience and words to help people understand the work.')}</p></div></div>
 <div class="tp-principles">${t.principles.map(([n,h,p])=>`<div class="tp-principle"><span class="tp-mono tp-muted">${e(n)}</span><h3>${e(h)}</h3><p>${e(p)}</p></div>`).join('')}</div></section>
 <section class="tp-section tp-notes" id="notes" data-section="Notes"><div><span class="tp-mono tp-muted">${e(t.notesLabel)}</span><h2>${outlined(t.notesHeading)}</h2></div><div class="tp-note-list">${t.notes.map(([label,title,copy],i)=>`<article class="tp-note"><span class="tp-mono tp-muted">${e(label)}</span><h3>${e(title)}</h3><p>${e(sample?copy:i?'Write about what you are studying, testing or working on next.':'Share the questions, experiments and lessons behind your projects.')}</p></article>`).join('')}<a class="tp-link" href="${sample?'https://github.com/ramakenkenya':'#contact'}">${e(sample?t.follow:t.conversation)} <span aria-hidden="true">↗</span></a></div></section>
 <section class="tp-contact" id="contact" data-section="Connect"><span class="tp-mono tp-muted">${e(t.contactLabel)}</span><h2>${outlined(t.contactHeading)}</h2><p>${e(t.contactCopy)}</p><a class="tp-link" href="${contact}">${e(action)} <span aria-hidden="true">↗</span></a></section>
 </main><footer class="tp-footer tp-mono"><a class="tp-brand" href="#top">${e(name.toUpperCase())} /</a><span>${e(t.footer)}</span><a href="#top">${e(t.back)}</a></footer></div>`;
 return {html,css:TEXT_PORTFOLIO_CSS};
}

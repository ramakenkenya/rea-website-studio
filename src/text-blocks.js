import {escapeHtml as e} from './project.js';
import {KOREAN_BLOCK_COPY} from './text-block-copy.js';

function createPresets(language='en'){
 const t=text=>language==='ko'?(KOREAN_BLOCK_COPY[text]??text):text;

const title=(copy,tag='h2')=>`<${tag} class="tb-title">${e(copy)}</${tag}>`;
const eyebrow=copy=>`<p class="tb-kicker">${e(copy)}</p>`;
const copy=text=>`<p class="tb-copy">${e(text)}</p>`;
const link=(text,href)=>`<a class="tb-action" href="${e(href)}">${e(text)} <span aria-hidden="true">↗</span></a>`;
const action=brief=>link(brief.cta||t('Get in touch'),brief.email?`mailto:${brief.email}`:'#contact');
const steps=[['Discover','Define the question.'],['Develop','Give the idea shape.'],['Deliver','Test it and share the result.']];
const projects=[['First project','Introduce the work.'],['Second project','Explain what you made.'],['Third project','Describe what you learned.']];
const questions=[['What should I prepare?','Bring a brief description of your idea.'],['How does the work start?','Describe what happens in the first conversation.'],['What happens next?','Explain when a visitor can expect an update.']];
const people=[['First team member','Role and contribution.'],['Second team member','Role and contribution.'],['Third team member','Role and contribution.']];
const answers=()=>`<div class="tb-answers">${questions.map(([q,a])=>`<article><h3>${e(t(q))}</h3>${copy(t(a))}</article>`).join('')}</div>`;
const quote=(text,credit)=>`<figure class="tb-quote"><blockquote>${copy(t(text))}</blockquote><figcaption>${e(t(credit))}</figcaption></figure>`;
const poster=(brief,tag,words)=>`<div class="tb-poster-type" aria-hidden="true">${words.map(word=>`<span>${e(t(word))}</span>`).join('')}</div><div class="tb-poster-copy">${eyebrow(t('A CLEAR DIRECTION'))}${title(brief.name||t('Crafted futures'),tag)}${copy(brief.description||t('Introduce your idea in a few lines.'))}</div>`;
const numbered=(entries,tag='div',translate=true)=>`<${tag} class="tb-numbered">${entries.map(([heading,description],i)=>`
 <${tag==='ol'?'li':'article'} class="tb-item"><span class="tb-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><div><h3>${e(translate?t(heading):heading)}</h3>${copy(translate?t(description):description)}</div></${tag==='ol'?'li':'article'}>`).join('')}</${tag}>`;

return [
 {id:'outline-echo',block:'Headline',style:'Outline Echo',group:'headline',render:({brief,tag})=>eyebrow(t('01 / INTRODUCTION'))+title(brief.name&&brief.name!=='Text website'?brief.name:t('Future design system'),tag)+copy(brief.description||t('Introduce the idea behind your work.'))},
 {id:'bold-stack',block:'Headline',style:'Bold Stack',group:'headline',render:({tag})=>eyebrow(t('A CLEAR DIRECTION'))+`<${tag} class="tb-title"><span>${e(t('Future /'))}</span><span>${e(t('Design'))}</span><span>${e(t('System.'))}</span></${tag}>`+copy(t('Give a big idea a few well-chosen words.'))},
 {id:'inset-label',block:'Headline',style:'Inset Label',group:'headline',render:({tag})=>eyebrow(t('01 / SELECTED WORK'))+`<${tag} class="tb-title"><span class="tb-inset">${e(t('The'))}</span><span class="tb-word">${e(t('Work.'))}</span></${tag}>`},
 {id:'split-contrast',block:'Statement',style:'Split Contrast',group:'headline',render:()=>title(t('How I work'))+`<div class="tb-split-copy"><article>${eyebrow(t('01 / RESEARCH'))}<h3>${e(t('Start with evidence.'))}</h3>${copy(t('Ask a question worth investigating.'))}</article><article>${eyebrow(t('02 / TEST'))}<h3>${e(t('Test the details.'))}</h3>${copy(t('Refine the idea through practice.'))}</article></div>`},
 {id:'staggered-reasons',block:'Reasons',style:'Staggered Serif',group:'content',render:()=>title(t('Why us'))+numbered([['Expertise','What you know well.'],['Quality','What you pay attention to.'],['Commitment','How you follow through.']])},
 {id:'offset-features',block:'Features',style:'Oversized Numbers',group:'content',render:()=>title(t('Features'))+numbered([['Type and hierarchy','Make the reading order clear.'],['Active white space','Give each idea room.'],['Grid systems','Use a consistent structure.'],['Baseline rhythm','Keep spacing deliberate.']])},
 {id:'numbered-grid',block:'Features',style:'Numbered Grid',group:'content',render:({brief})=>{
  const services=(brief.services||t('Design, Planning, Development, Support')).split(',').map(value=>value.trim()).filter(Boolean).slice(0,4);
  return title(t('Features'))+numbered(services.map(service=>[service,t('Describe the benefit.')]),'div',false);
 }},
 {id:'feature-result',block:'Case Study',style:'Result Spotlight',group:'content',render:()=>eyebrow(t('SELECTED CASE STUDY'))+title(t('What changed'))+`<div class="tb-result"><div><h3>${e(t('Project title'))}</h3>${copy(t('Describe the challenge and the outcome.'))}</div><div><p class="tb-metric">+00%</p>${eyebrow(t('EXAMPLE RESULT'))}</div></div>`},
 {id:'process-rail',block:'Process',style:'Numbered Rail',group:'content',render:()=>title(t('Process'))+numbered([['Research','Understand the problem.'],['Strategy','Choose a direction.'],['Design','Make it tangible.'],['Build','Test the details.'],['Launch','Share the result.']],'ol')},
 {id:'vertical-index',block:'Work List',style:'Vertical Index',group:'content',render:()=>title(t('Case studies'))+`<div class="tb-index-rows">${numbered(projects)}</div>`},
 {id:'team-voices',block:'Team',style:'Numbered Profiles',group:'content',render:()=>title(t('Team / Voices'))+numbered([['Team member','Role and what they bring.'],['Team member','Role and what they bring.'],['Team member','Role and what they bring.']])},
 {id:'ruled-faq',block:'FAQ',style:'Ruled Questions',group:'content',render:()=>title(t('FAQ'))+`<div class="tb-questions"><details open><summary>${e(t('How do we get started?'))}</summary>${copy(t('Explain what a visitor should prepare.'))}</details><details><summary>${e(t('What happens next?'))}</summary>${copy(t('Describe the next step.'))}</details></div>`},
 {id:'reflected-callout',block:'Callout',style:'Reflected Type',group:'closing',render:({brief})=>eyebrow(t('THE NEXT STEP'))+title(t('Build with clarity.'))+copy(t('Tell your visitors what they can do next.'))+action(brief)},
 {id:'utility-footer',block:'Footer',style:'Editorial Columns',group:'closing',render:({brief})=>`<div><h2>${e(brief.name||t('Your name'))}</h2>${copy(t('Describe what you do in one line.'))}</div><div>${eyebrow(t('CONTACT'))}${brief.email?`<a href="mailto:${e(brief.email)}">${e(brief.email)}</a>`:copy(t('Add your contact details.'))}<nav aria-label="${e(t('Quick links'))}"><a href="./">${e(t('Home'))}</a><a href="#about">${e(t('About'))}</a><a href="#work">${e(t('Work'))}</a></nav></div><p class="tb-footer-line">${e(t('Made with care.'))}</p>`},
 {id:'inline-masthead',block:'Header',style:'Inline Wordmark',group:'headline',tag:'header',render:({brief})=>`<a class="tb-wordmark" href="./">${e(brief.name||t('Your website'))}</a><nav aria-label="${e(t('Website navigation'))}"><a href="./">${e(t('Home'))}</a><a href="#about">${e(t('About'))}</a><a href="#work">${e(t('Work'))}</a><a href="#contact">${e(t('Contact'))}</a></nav>`},
 {id:'outline-poster',block:'Headline',style:'Outline Poster',group:'headline',render:({brief,tag})=>poster(brief,tag,['DES','IGN'])},
 {id:'framed-hero',block:'Headline',style:'Framed Editorial',group:'headline',render:({brief,tag})=>poster(brief,tag,['DESIGN'])},
 {id:'editorial-philosophy',block:'About',style:'Editorial Philosophy',group:'content',render:()=>title(t('Our philosophy'))+`<div class="tb-editorial-columns">${copy(t('Explain the idea that guides your work.'))}${copy(t('Describe how that idea shows up in practice.'))}</div>`+quote('Good design is a language.', 'Your philosophy')},
 {id:'editorial-spread',block:'About',style:'Framed Editorial Spread',group:'content',render:()=>`<div>${eyebrow(t('01 / PHILOSOPHY'))}${title(t('Ideas in practice'))}${copy(t('Introduce the principle behind the work.'))}${quote('Give a central idea its own line.','Your philosophy')}</div><div><h3>${e(t('What we do'))}</h3>${numbered([['Strategy','Define the problem.'],['Creation','Shape a direction.'],['Development','Make it work.']])}<h3>${e(t('How we do it'))}</h3>${copy(t('Describe what someone can expect when working with you.'))}</div>`},
 {id:'utility-features',block:'Features',style:'Dark Feature Columns',group:'content',render:()=>eyebrow(t('FEATURES / SYSTEM'))+title(t('What makes it work'))+numbered([['Hierarchy','Make each idea easy to scan.'],['Structure','Arrange the details in order.'],['Rhythm','Repeat a useful pattern.'],['Utility','Make the result easy to use.']])},
 {id:'case-list',block:'Work List',style:'Editorial Case Rows',group:'content',render:()=>title(t('Textual studies'))+`<div class="tb-case-rows">${projects.map(([name,description])=>`<article><div><h3>${e(t(name))}</h3>${copy(t(description))}</div><span class="tb-kicker">${e(t('Result'))}</span></article>`).join('')}</div>`},
 {id:'vertical-process',block:'Process',style:'Vertical Steps',group:'content',render:()=>title(t('Process'))+numbered(steps,'ol')},
 {id:'side-process',block:'Process',style:'Side Label',group:'content',render:()=>title(t('Process'))+numbered(steps,'ol')},
 {id:'milestone-circles',block:'Process',style:'Milestone Circles',group:'content',render:()=>title(t('How we work'))+numbered(steps,'ol')},
 {id:'dark-profiles',block:'Team',style:'Dark Profile Columns',group:'content',render:()=>eyebrow(t('TEAM / VOICES'))+title(t('The people'))+`<div class="tb-editorial-columns">${people.map(([name,description])=>`<article><h3>${e(t(name))}</h3>${copy(t(description))}</article>`).join('')}</div>`},
 {id:'quote-grid',block:'Testimonials',style:'Quote Columns',group:'content',render:()=>title(t('Testimonials'))+`<div class="tb-editorial-columns">${['First speaker','Second speaker','Third speaker'].map(name=>quote(t('Add a short quote that you have permission to share.'),t(name))).join('')}</div>`},
 {id:'pull-quote',block:'Statement',style:'Pull Quote',group:'content',render:()=>eyebrow(t('IN THEIR WORDS'))+quote('Add a sentence worth giving its own space.','Name / role')},
 {id:'offset-faq',block:'FAQ',style:'Offset Answers',group:'content',render:()=>title(t('FAQ'))+answers()},
 {id:'vertical-faq',block:'FAQ',style:'Vertical Label',group:'content',render:()=>title(t('FAQs'))+answers()},
 {id:'stacked-invitation',block:'Callout',style:'Stacked Invitation',group:'closing',render:({brief})=>eyebrow(t('THE NEXT STEP'))+`<h2 class="tb-title"><span>${e(t('Build'))}</span> <span>${e(t('with'))}</span> <span>${e(t('clarity.'))}</span></h2>`+action(brief)},
 {id:'index-footer',block:'Footer',style:'Three-column Index',group:'closing',tag:'footer',render:({brief})=>`<div><h2>${e(brief.name||t('Your name'))}</h2>${copy(t('Add a line about your work.'))}</div><div>${eyebrow(t('INDEX'))}<a href="./">${e(t('Home'))}</a><a href="#work">${e(t('Work'))}</a></div><div>${eyebrow(t('CONTACT'))}${brief.email?link(brief.email,'mailto:'+brief.email):copy(t('Add your contact details.'))}</div>`},

];
}

export const TEXT_BLOCK_PRESETS=createPresets();
const KOREAN_PRESETS=createPresets('ko');

export const TEXT_BLOCK_ANCHORS={"editorial-philosophy":"about","feature-result":"work","case-list":"work","vertical-index":"work"};

export function textBlockMarkup(preset,{brief={},primary=false,language='en',anchorPrefix=''}={}){
 const localized=language==='ko'?KOREAN_PRESETS.find(item=>item.id===preset.id):preset;
 const tag=preset.tag||(preset.id==='utility-footer'?'footer':'section');
 let html=`<${tag} class="tb-block tb-${preset.id}" data-styled-text-block="${preset.id}" lang="${language==='ko'?'ko':'en'}" data-section="${preset.block} · ${preset.style}">${localized.render({brief,tag:primary&&preset.block==='Headline'?'h1':'h2'})}</${tag}>`;
 if(anchorPrefix)html=html.replace(/href="#(about|work|contact)"/g,(_,id)=>`href="#${e(anchorPrefix+id)}"`);
 return html;
}

import {escapeHtml as e} from './project.js';

const title=(copy,tag='h2')=>`<${tag} class="tb-title">${e(copy)}</${tag}>`;
const eyebrow=copy=>`<p class="tb-kicker">${e(copy)}</p>`;
const copy=text=>`<p class="tb-copy">${e(text)}</p>`;
const link=(text,href)=>`<a class="tb-action" href="${e(href)}">${e(text)} <span aria-hidden="true">↗</span></a>`;
const action=brief=>link(brief.cta||'Get in touch',brief.email?`mailto:${brief.email}`:'#contact');
const steps=[['Discover','Define the question.'],['Develop','Give the idea shape.'],['Deliver','Test it and share the result.']];
const projects=[['First project','Introduce the work.'],['Second project','Explain what you made.'],['Third project','Describe what you learned.']];
const questions=[['What should I prepare?','Bring a brief description of your idea.'],['How does the work start?','Describe what happens in the first conversation.'],['What happens next?','Explain when a visitor can expect an update.']];
const people=[['First team member','Role and contribution.'],['Second team member','Role and contribution.'],['Third team member','Role and contribution.']];
const answers=()=>`<div class="tb-answers">${questions.map(([q,a])=>`<article><h3>${e(q)}</h3>${copy(a)}</article>`).join('')}</div>`;
const quote=(text,credit)=>`<figure class="tb-quote"><blockquote>${copy(text)}</blockquote><figcaption>${e(credit)}</figcaption></figure>`;
const poster=(brief,tag,words)=>`<div class="tb-poster-type" aria-hidden="true">${words.map(word=>`<span>${word}</span>`).join('')}</div><div class="tb-poster-copy">${eyebrow('A CLEAR DIRECTION')}${title(brief.name||'Crafted futures',tag)}${copy(brief.description||'Introduce your idea in a few lines.')}</div>`;
const numbered=(entries,tag='div')=>`<${tag} class="tb-numbered">${entries.map(([heading,description],i)=>`
 <${tag==='ol'?'li':'article'} class="tb-item"><span class="tb-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><div><h3>${e(heading)}</h3>${copy(description)}</div></${tag==='ol'?'li':'article'}>`).join('')}</${tag}>`;

export const TEXT_BLOCK_PRESETS=[
 {id:'outline-echo',block:'Headline',style:'Outline Echo',group:'headline',render:({brief,tag})=>eyebrow('01 / INTRODUCTION')+title(brief.name&&brief.name!=='Text website'?brief.name:'Future design system',tag)+copy(brief.description||'Introduce the idea behind your work.')},
 {id:'bold-stack',block:'Headline',style:'Bold Stack',group:'headline',render:({tag})=>eyebrow('A CLEAR DIRECTION')+`<${tag} class="tb-title"><span>Future /</span><span>Design</span><span>System.</span></${tag}>`+copy('Give a big idea a few well-chosen words.')},
 {id:'inset-label',block:'Headline',style:'Inset Label',group:'headline',render:({tag})=>eyebrow('01 / SELECTED WORK')+`<${tag} class="tb-title"><span class="tb-inset">The</span><span class="tb-word">Work.</span></${tag}>`},
 {id:'split-contrast',block:'Statement',style:'Split Contrast',group:'headline',render:()=>title('How I work')+`<div class="tb-split-copy"><article>${eyebrow('01 / RESEARCH')}<h3>Start with evidence.</h3>${copy('Ask a question worth investigating.')}</article><article>${eyebrow('02 / TEST')}<h3>Test the details.</h3>${copy('Refine the idea through practice.')}</article></div>`},
 {id:'staggered-reasons',block:'Reasons',style:'Staggered Serif',group:'content',render:()=>title('Why us')+numbered([['Expertise','What you know well.'],['Quality','What you pay attention to.'],['Commitment','How you follow through.']])},
 {id:'offset-features',block:'Features',style:'Oversized Numbers',group:'content',render:()=>title('Features')+numbered([['Type and hierarchy','Make the reading order clear.'],['Active white space','Give each idea room.'],['Grid systems','Use a consistent structure.'],['Baseline rhythm','Keep spacing deliberate.']])},
 {id:'numbered-grid',block:'Features',style:'Numbered Grid',group:'content',render:({brief})=>{
  const services=(brief.services||'Design, Planning, Development, Support').split(',').map(value=>value.trim()).filter(Boolean).slice(0,4);
  return title('Features')+numbered(services.map(service=>[service,'Describe the benefit.']));
 }},
 {id:'feature-result',block:'Case Study',style:'Result Spotlight',group:'content',render:()=>eyebrow('SELECTED CASE STUDY')+title('What changed')+`<div class="tb-result"><div><h3>Project title</h3>${copy('Describe the challenge and the outcome.')}</div><div><p class="tb-metric">+00%</p>${eyebrow('EXAMPLE RESULT')}</div></div>`},
 {id:'process-rail',block:'Process',style:'Numbered Rail',group:'content',render:()=>title('Process')+numbered([['Research','Understand the problem.'],['Strategy','Choose a direction.'],['Design','Make it tangible.'],['Build','Test the details.'],['Launch','Share the result.']],'ol')},
 {id:'vertical-index',block:'Work List',style:'Vertical Index',group:'content',render:()=>title('Case studies')+`<div class="tb-index-rows">${numbered(projects)}</div>`},
 {id:'team-voices',block:'Team',style:'Numbered Profiles',group:'content',render:()=>title('Team / Voices')+numbered([['Team member','Role and what they bring.'],['Team member','Role and what they bring.'],['Team member','Role and what they bring.']])},
 {id:'ruled-faq',block:'FAQ',style:'Ruled Questions',group:'content',render:()=>title('FAQ')+`<div class="tb-questions"><details open><summary>How do we get started?</summary>${copy('Explain what a visitor should prepare.')}</details><details><summary>What happens next?</summary>${copy('Describe the next step.')}</details></div>`},
 {id:'reflected-callout',block:'Callout',style:'Reflected Type',group:'closing',render:({brief})=>eyebrow('THE NEXT STEP')+title('Build with clarity.')+copy('Tell your visitors what they can do next.')+action(brief)},
 {id:'utility-footer',block:'Footer',style:'Editorial Columns',group:'closing',render:({brief})=>`<div><h2>${e(brief.name||'Your name')}</h2>${copy('Describe what you do in one line.')}</div><div>${eyebrow('CONTACT')}${brief.email?`<a href="mailto:${e(brief.email)}">${e(brief.email)}</a>`:copy('Add your contact details.')}<nav aria-label="Quick links"><a href="./">Home</a><a href="#about">About</a><a href="#work">Work</a></nav></div><p class="tb-footer-line">Made with care.</p>`},
 {id:'inline-masthead',block:'Header',style:'Inline Wordmark',group:'headline',tag:'header',render:({brief})=>`<a class="tb-wordmark" href="./">${e(brief.name||'Your website')}</a><nav aria-label="Website navigation"><a href="./">Home</a><a href="#about">About</a><a href="#work">Work</a><a href="#contact">Contact</a></nav>`},
 {id:'outline-poster',block:'Headline',style:'Outline Poster',group:'headline',render:({brief,tag})=>poster(brief,tag,['DES','IGN'])},
 {id:'framed-hero',block:'Headline',style:'Framed Editorial',group:'headline',render:({brief,tag})=>poster(brief,tag,['DESIGN'])},
 {id:'editorial-philosophy',block:'About',style:'Editorial Philosophy',group:'content',render:()=>title('Our philosophy')+`<div class="tb-editorial-columns">${copy('Explain the idea that guides your work.')}${copy('Describe how that idea shows up in practice.')}</div>`+quote('Good design is a language.', 'Your philosophy')},
 {id:'editorial-spread',block:'About',style:'Framed Editorial Spread',group:'content',render:()=>`<div>${eyebrow('01 / PHILOSOPHY')}${title('Ideas in practice')}${copy('Introduce the principle behind the work.')}${quote('Give a central idea its own line.','Your philosophy')}</div><div><h3>What we do</h3>${numbered([['Strategy','Define the problem.'],['Creation','Shape a direction.'],['Development','Make it work.']])}<h3>How we do it</h3>${copy('Describe what someone can expect when working with you.')}</div>`},
 {id:'utility-features',block:'Features',style:'Dark Feature Columns',group:'content',render:()=>eyebrow('FEATURES / SYSTEM')+title('What makes it work')+numbered([['Hierarchy','Make each idea easy to scan.'],['Structure','Arrange the details in order.'],['Rhythm','Repeat a useful pattern.'],['Utility','Make the result easy to use.']])},
 {id:'case-list',block:'Work List',style:'Editorial Case Rows',group:'content',render:()=>title('Textual studies')+`<div class="tb-case-rows">${projects.map(([name,description])=>`<article><div><h3>${e(name)}</h3>${copy(description)}</div><span class="tb-kicker">Result</span></article>`).join('')}</div>`},
 {id:'vertical-process',block:'Process',style:'Vertical Steps',group:'content',render:()=>title('Process')+numbered(steps,'ol')},
 {id:'side-process',block:'Process',style:'Side Label',group:'content',render:()=>title('Process')+numbered(steps,'ol')},
 {id:'milestone-circles',block:'Process',style:'Milestone Circles',group:'content',render:()=>title('How we work')+numbered(steps,'ol')},
 {id:'dark-profiles',block:'Team',style:'Dark Profile Columns',group:'content',render:()=>eyebrow('TEAM / VOICES')+title('The people')+`<div class="tb-editorial-columns">${people.map(([name,description])=>`<article><h3>${e(name)}</h3>${copy(description)}</article>`).join('')}</div>`},
 {id:'quote-grid',block:'Testimonials',style:'Quote Columns',group:'content',render:()=>title('Testimonials')+`<div class="tb-editorial-columns">${['First speaker','Second speaker','Third speaker'].map(name=>quote('Add a short quote that you have permission to share.',name)).join('')}</div>`},
 {id:'pull-quote',block:'Statement',style:'Pull Quote',group:'content',render:()=>eyebrow('IN THEIR WORDS')+quote('Add a sentence worth giving its own space.','Name / role')},
 {id:'offset-faq',block:'FAQ',style:'Offset Answers',group:'content',render:()=>title('FAQ')+answers()},
 {id:'vertical-faq',block:'FAQ',style:'Vertical Label',group:'content',render:()=>title('FAQs')+answers()},
 {id:'stacked-invitation',block:'Callout',style:'Stacked Invitation',group:'closing',render:({brief})=>eyebrow('THE NEXT STEP')+`<h2 class="tb-title"><span>Build</span> <span>with</span> <span>clarity.</span></h2>`+action(brief)},
 {id:'index-footer',block:'Footer',style:'Three-column Index',group:'closing',tag:'footer',render:({brief})=>`<div><h2>${e(brief.name||'Your name')}</h2>${copy('Add a line about your work.')}</div><div>${eyebrow('INDEX')}<a href="./">Home</a><a href="#work">Work</a></div><div>${eyebrow('CONTACT')}${brief.email?link(brief.email,'mailto:'+brief.email):copy('Add your contact details.')}</div>`},

];

export const TEXT_BLOCK_ANCHORS={"editorial-philosophy":"about","feature-result":"work","case-list":"work","vertical-index":"work"};

export function textBlockMarkup(preset,{brief={},primary=false}={}){
 const tag=preset.tag||(preset.id==='utility-footer'?'footer':'section');
 return `<${tag} class="tb-block tb-${preset.id}" data-styled-text-block="${preset.id}" data-section="${preset.block} · ${preset.style}">${preset.render({brief,tag:primary&&preset.block==='Headline'?'h1':'h2'})}</${tag}>`;
}

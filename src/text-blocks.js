import {escapeHtml as e} from './project.js';

const title=(copy,tag='h2')=>`<${tag} class="tb-title">${e(copy)}</${tag}>`;
const eyebrow=copy=>`<p class="tb-kicker">${e(copy)}</p>`;
const copy=text=>`<p class="tb-copy">${e(text)}</p>`;
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
 {id:'vertical-index',block:'Work List',style:'Vertical Index',group:'content',render:()=>title('Case studies')+`<div class="tb-index-rows">${numbered([['First project','Introduce the work.'],['Second project','Explain what you made.'],['Third project','Describe what you learned.']])}</div>`},
 {id:'team-voices',block:'Team',style:'Numbered Profiles',group:'content',render:()=>title('Team / Voices')+numbered([['Team member','Role and what they bring.'],['Team member','Role and what they bring.'],['Team member','Role and what they bring.']])},
 {id:'ruled-faq',block:'FAQ',style:'Ruled Questions',group:'content',render:()=>title('FAQ')+`<div class="tb-questions"><details open><summary>How do we get started?</summary>${copy('Explain what a visitor should prepare.')}</details><details><summary>What happens next?</summary>${copy('Describe the next step.')}</details></div>`},
 {id:'reflected-callout',block:'Callout',style:'Reflected Type',group:'closing',render:()=>eyebrow('THE NEXT STEP')+title('Build with clarity.')+copy('Tell your visitors what they can do next.')},
 {id:'utility-footer',block:'Footer',style:'Editorial Columns',group:'closing',render:({brief})=>`<div><h2>${e(brief.name||'Your name')}</h2>${copy('Describe what you do in one line.')}</div><div>${eyebrow('CONTACT')}${brief.email?`<a href="mailto:${e(brief.email)}">${e(brief.email)}</a>`:copy('Add your contact details.')}</div><p class="tb-footer-line">Made with care.</p>`},
];

export function textBlockMarkup(preset,{brief={},primary=false}={}){
 const tag=preset.id==='utility-footer'?'footer':'section';
 return `<${tag} class="tb-block tb-${preset.id}" data-styled-text-block="${preset.id}" data-section="${preset.block} · ${preset.style}">${preset.render({brief,tag:primary&&preset.block==='Headline'?'h1':'h2'})}</${tag}>`;
}

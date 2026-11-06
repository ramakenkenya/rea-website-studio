import test from 'node:test';
import assert from 'node:assert/strict';
import {createTextPortfolio,TEXT_SAMPLE_BRIEF,textSampleProject,textSampleMetadata} from '../src/text-portfolio.js';
import {textSampleFiles,bilingualSampleDocument} from '../scripts/text-sample.mjs';
import {assertSafeValue,createStudio} from '../src/site-model.js';
import {buildDocument} from '../src/export.js';
import {textLanguageTargets,rewriteTextLanguageLinks} from '../src/text-languages.js';
import grapesjs from 'grapesjs';
import {DOMParser} from '@xmldom/xmldom';

test('English identity describes past study and life in South Korea without a current-location claim',()=>{
 const {html}=createTextPortfolio(TEXT_SAMPLE_BRIEF,{sample:true});
 assert.match(html,/LIVED &amp; STUDIED IN SOUTH KOREA/);
 assert.match(html,/lived and studied in South Korea/);
 assert.doesNotMatch(html,/based in Kenya/i);
});

test('Korean sample localizes the complete interface, copy, portrait label and language state',()=>{
 const sample=createTextPortfolio(TEXT_SAMPLE_BRIEF,{sample:true,language:'ko'});
 for(const text of ['라마','켄','작업','소개','기록','연락','한국에서 생활하며 공부','고릴라 램페이지','라마 스튜디오','함께','가요.'])assert.ok(sample.html.includes(text),text);
 assert.match(sample.html,/data-text-locale="ko"/);assert.match(sample.html,/lang="ko"/);
 assert.match(sample.html,/href="ko.html"[^>]*aria-current="page"/);
 assert.doesNotMatch(sample.html,/based in Kenya|BASED IN KENYA|A PORTRAIT, WRITTEN|The work behind|My work:/);
 assert.doesNotThrow(()=>assertSafeValue(sample));assert.equal((sample.html.match(/<h1\b/g)||[]).length,1);
 assert.match(buildDocument({html:sample.html,brief:TEXT_SAMPLE_BRIEF}),/<html lang="ko"/);
});

test('bilingual editor starter has independent editable pages and portable language links',()=>{
 const project=textSampleProject();assert.equal(project.pages.length,2);
 const state=createStudio(project,TEXT_SAMPLE_BRIEF,textSampleMetadata());
 assert.equal(state.pages[1].slug,'ko');assert.equal(state.autosave,false);
 assert.match(project.pages[0].component,/href="ko.html"/);
 assert.match(project.pages[1].component,/href="index.html"/);
 assert.doesNotThrow(()=>assertSafeValue(project));
});

test('static pages and self-contained bilingual preview support both languages without scripts',()=>{
 const files=textSampleFiles();assert.ok(files['samples/rama-ken/ko.html']);
 assert.match(files['samples/rama-ken/ko.html'],/<html lang="ko"/);
 const html=bilingualSampleDocument();
 for(const id of ['en','ko','ko-work','ko-about','ko-notes','ko-contact'])assert.ok(html.includes(`id="${id}"`));
 assert.match(html,/href="#ko"/);assert.match(html,/href="#en"/);
 assert.match(html,/:has\(/);assert.doesNotMatch(html,/<script\b|href="styles.css"|href="ko.html"/);
});

test('language links follow renamed pages and a Korean homepage, and disable a deleted language',()=>{
 const metadata=textSampleMetadata(),project=textSampleProject();metadata.homeId='text-ko';metadata.pages[0].slug='english-version';
 const studio=createStudio(project,TEXT_SAMPLE_BRIEF,metadata);
 const models=['en','ko'].map(locale=>({id:`text-${locale}`,getMainComponent:()=>({find:()=>[{getAttributes:()=>({'data-text-locale':locale})}]})}));
 const targets=textLanguageTargets(models,studio);assert.deepEqual(targets,{en:'english-version.html',ko:'index.html'});
 const html=createTextPortfolio(TEXT_SAMPLE_BRIEF,{sample:true}).html;
 const updated=rewriteTextLanguageLinks(html,targets);assert.match(updated,/data-language-target="en"[^>]*href="english-version.html"/);assert.match(updated,/data-language-target="ko"[^>]*href="index.html"/);
 const removed=rewriteTextLanguageLinks(html,{en:'index.html'});assert.match(removed,/data-language-target="ko"[^>]*aria-disabled="true"/);
 assert.doesNotMatch(removed,/href="ko.html"/);
});

test('real editor loading preserves both languages internal links and exports one localized header',()=>{
 const editor=grapesjs.init({headless:true,storageManager:false,parser:{parserHtml:s=>new DOMParser().parseFromString(`<div xmlns="http://www.w3.org/1999/xhtml">${s.replaceAll('<br>','<br/>')}</div>`,'application/xml').documentElement}});
 editor.loadProjectData(textSampleProject());
 const studio=createStudio(editor.getProjectData(),TEXT_SAMPLE_BRIEF,textSampleMetadata());
 for(const page of editor.Pages.getAll()){
  const html=page.getMainComponent().toHTML();
  for(const [,id] of html.matchAll(/href="#([^"]+)"/g))assert.ok(html.includes(`id="${id}"`),`${page.id}: missing ${id}`);
  const out=buildDocument({html,brief:TEXT_SAMPLE_BRIEF,page:studio.pages.find(p=>p.id===page.id),studio});
  assert.equal((out.match(/<header\b/g)||[]).length,1);
 }
 editor.destroy();
});

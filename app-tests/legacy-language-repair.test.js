import test from 'node:test';
import assert from 'node:assert/strict';
import grapesjs from 'grapesjs';
import {DOMParser} from '@xmldom/xmldom';
import {referencePortfolioProject,repairLegacyPortfolioLanguages} from '../src/portfolio-reference.js';
import {TEXT_SAMPLE_BRIEF,textSampleMetadata} from '../src/text-portfolio.js';
import {createStudio} from '../src/site-model.js';
import {textLanguageTargets} from '../src/text-languages.js';
const editorFor=project=>{
 const editor=grapesjs.init({headless:true,storageManager:false,parser:{parserHtml:s=>new DOMParser().parseFromString(`<div xmlns="http://www.w3.org/1999/xhtml">${s.replaceAll('<br>','<br/>')}</div>`,'application/xml').documentElement}});
 editor.loadProjectData(project);return editor;
};
test('old single-page portfolio gains its missing Korean page without replacing edits or metadata',()=>{
 const original=referencePortfolioProject().pages[0];
 const editor=editorFor({pages:[{...original,id:'legacy-home',name:'My edited home',component:original.component.replace('RAMA</span>','MY EDITED NAME</span>')}],styles:[]});
 try{
  const state=createStudio(editor.getProjectData(),TEXT_SAMPLE_BRIEF,{homeId:'legacy-home',pages:[{id:'legacy-home',name:'My edited home',slug:'custom-home',title:'My title',nav:false}],autosave:true});
  const before=editor.Pages.getSelected().getMainComponent().toHTML();
  const repaired=repairLegacyPortfolioLanguages(editor,state);
  assert.equal(repaired.added,1);assert.equal(repaired.studio.homeId,'legacy-home');assert.equal(repaired.studio.autosave,true);
  assert.equal(repaired.studio.pages[0].title,'My title');assert.equal(repaired.studio.pages[0].slug,'custom-home');
  assert.ok(editor.Pages.get('legacy-home').getMainComponent().toHTML().includes('MY EDITED NAME'));
  assert.ok(before.includes('MY EDITED NAME'));
  assert.deepEqual(textLanguageTargets(Array.from(editor.Pages.getAll()),repaired.studio),{en:'index.html',ko:'ko.html'});
  assert.equal(repairLegacyPortfolioLanguages(editor,repaired.studio).added,0);
  editor.Pages.remove('text-ko');
  const deleted=createStudio(editor.getProjectData(),TEXT_SAMPLE_BRIEF,repaired.studio);
  assert.equal(repairLegacyPortfolioLanguages(editor,deleted).added,0,'an intentional later deletion stays deleted');
 }finally{editor.destroy();}
});
test('repair leaves complete starters, intentionally removed starter pages and ordinary pages alone',()=>{
 for(const project of [referencePortfolioProject(),{...referencePortfolioProject(),pages:[referencePortfolioProject().pages[0]]},{pages:[{id:'plain',component:'<main><h1>My site</h1></main>'}],styles:[]}]){
  const editor=editorFor(project);try{
   const state=createStudio(editor.getProjectData(),TEXT_SAMPLE_BRIEF,textSampleMetadata());
   assert.equal(repairLegacyPortfolioLanguages(editor,state).added,0);
  }finally{editor.destroy();}
 }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import grapesjs from 'grapesjs';
import {createStarter} from '../src/templates.js';
import {normalizeBrief, snapshot, validateSnapshot} from '../src/project.js';
import {assertSafeValue, createStudio, rewriteNavigation} from '../src/site-model.js';
import {TEXT_SECTIONS, textSection, updateTextSection} from '../src/text-theme.js';
import {registerTextPortrait} from '../src/text-portrait.js';

const brief=normalizeBrief({name:'North & Finch',description:'We make useful things.',services:'Research, Design',email:'hello@example.com',theme:'text'});

test('Text only starts with brief-driven, independently editable sections',()=>{
 const starter=createStarter(brief);
 for(const key of ['header','hero','services','work','about','cta','footer']){
  assert.match(starter.html,new RegExp('data-text-section="'+key+'"'));
 }
 assert.match(starter.html,/North &amp; Finch/);
 assert.match(starter.html,/>Research</);
 assert.match(starter.html,/>Design</);
 assert.match(starter.html,/mailto:hello@example.com/);
 assert.equal((starter.html.match(/<h1\b/g)||[]).length,1);
 assert.doesNotMatch(starter.html,/<(?:img|canvas|script)\b|Rama Ken/);
 for(const [,anchor] of starter.html.matchAll(/href="#([^"]+)"/g))assert.ok(starter.html.includes('id="'+anchor+'"'));
 assert.doesNotThrow(()=>assertSafeValue(starter));
 const studio=createStudio({pages:[{id:'home',name:'Home'}]},brief);
 assert.match(rewriteNavigation(starter.html,studio,'home'),/href="#text-work"/);
});

test('each catalog preset is insertable, and switching appearance preserves model content through backup',()=>{
 const editor=grapesjs.init({headless:true,storageManager:false});
 registerTextPortrait(editor);
 try{
  assert.equal(TEXT_SECTIONS.length,11);
  editor.setStyle(createStarter(brief).css);
  for(const {id,layouts} of TEXT_SECTIONS){
   for(const {value} of layouts){
    const html=textSection(id,brief,{layout:value});
    assert.ok(html.includes('data-text-section="'+id+'"'));
    assert.ok(html.includes('type-layout-'+value));
    assert.doesNotThrow(()=>assertSafeValue({html}));
   }
  }
  const [section]=editor.addComponents({tagName:'section',classes:['type-layout-rows','type-style-solid','type-tone-inherit'],attributes:{'data-text-section':'work'},components:[{tagName:'h2',components:[{type:'textnode',content:'My edited headline'}]}]});
  const title=section.components().at(0);
  updateTextSection(section,{layout:'grid',style:'outline',tone:'light'});
  assert.equal(section.components().at(0),title);
  assert.match(section.toHTML(),/My edited headline/);
  assert.ok(section.getClasses().includes('type-layout-grid'));
  assert.ok(!section.getClasses().includes('type-layout-rows'));
  const backup=validateSnapshot(snapshot(brief,editor.getProjectData()));
  editor.loadProjectData(backup.project);
  assert.match(editor.getHtml(),/My edited headline/);
  assert.match(editor.getHtml(),/type-style-outline/);
 }finally{editor.destroy();}
});

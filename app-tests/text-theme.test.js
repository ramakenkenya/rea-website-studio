import {TEXT_BLOCK_PRESETS,textBlockMarkup} from '../src/text-blocks.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import grapesjs from 'grapesjs';
import {createStarter} from '../src/templates.js';
import {normalizeBrief, snapshot, validateSnapshot} from '../src/project.js';
import {assertSafeValue} from '../src/site-model.js';
import {TEXT_SECTIONS, textSection, updateTextSection} from '../src/text-theme.js';
import {registerTextPortrait} from '../src/text-portrait.js';

const brief=normalizeBrief({name:'North & Finch',description:'We make useful things.',services:'Research, Design',email:'hello@example.com',theme:'text'});

test('Text Only starts empty so authors can choose individual blocks',()=>{
 const starter=createStarter(brief);
 assert.equal(starter.html,'');
 assert.doesNotThrow(()=>assertSafeValue(starter));
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

test('each styled preset creates one independent section of editable text',()=>{
 const ids=new Set();
 for(const preset of TEXT_BLOCK_PRESETS){
  assert.ok(!ids.has(preset.id));ids.add(preset.id);
  const html=textBlockMarkup(preset,{brief,primary:true});
  assert.ok(html.includes(`data-styled-text-block="${preset.id}"`));
  assert.ok(html.includes(`${preset.block} · ${preset.style}`));
  assert.equal((html.match(/data-styled-text-block=/g)||[]).length,1);
  assert.doesNotMatch(html,/<(?:img|canvas|script|svg|iframe)\b/);
  assert.doesNotThrow(()=>assertSafeValue({html}));
 }
 assert.ok(TEXT_BLOCK_PRESETS.filter(p=>p.block==='Headline').length>=3);
});

test('the inspiration catalog includes both editorial layouts and distinct dark variations',()=>{
 const presets=Object.fromEntries(TEXT_BLOCK_PRESETS.map(p=>[p.id,p]));
 for(const id of ['inline-masthead','outline-poster','framed-hero','editorial-philosophy','utility-features','case-list','vertical-process','side-process','milestone-circles','dark-profiles','quote-grid','pull-quote','offset-faq','vertical-faq','stacked-invitation','index-footer']){
  assert.ok(presets[id],`Missing editable preset: ${id}`);
  assert.match(textBlockMarkup(presets[id],{brief}),/<(?:h[1-6]|blockquote|nav)\b/);
 }
});

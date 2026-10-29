import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewDocument} from '../src/document-model.js';
import {documentSite} from '../src/document-site.js';
import {replaceImportedProject} from '../src/import-transaction.js';
import {validateSnapshot} from '../src/project.js';
import {exportFiles} from '../src/export.js';
import {sampleRaw} from './import-fixture.js';
test('four-page import exports supplied copy, catalogue runtime, photos, FAQs and portable links',()=>{
 const next=documentSite(reviewDocument(sampleRaw()).draft);validateSnapshot(next);
 // Export's adapter API can run without a browser; real GrapesJS parsing is covered in the browser journey.
 const pages=next.project.pages.map(p=>({id:p.id,getMainComponent:()=>({html:p.component.components,findType:()=>[]})}));
 const editor={Pages:{getAll:()=>pages},getHtml:({component})=>component.html,getCss:()=>''};
 const files=exportFiles(editor,next.brief,next.studio);
 assert.equal(editor.Pages.getAll().length,4);assert.match(files['shop.html'],/Nia Sofa/);assert.match(files['shop.html'],/rea-shop\.js/);assert.match(files['lookbook.html'],/A comfortable living room/);assert.match(files['about.html'],/Can I pay here/);assert.match(files['IMAGE-CREDITS.txt'],/Demo Photographer/);
 for(const name of ['index.html','shop.html','lookbook.html','about.html']){assert.equal((files[name].match(/<h1\b/g)||[]).length,1);assert.match(files[name],/href="shop.html"/);assert.doesNotMatch(files[name],/Your answer|Additional content notes/);}
});
test('plain document text stays text and review name overrides shared navigation',()=>{
 const raw=sampleRaw();raw.records.section[3]['section.body']='We sell <strong>comfortable</strong> furniture.';
 const next=documentSite(reviewDocument(raw,{name:'My Furniture'}).draft);
 assert.match(next.project.pages[0].component.components,/&lt;strong&gt;comfortable/);assert.match(next.project.pages[0].component.components,/My Furniture/);
});
test('transaction rolls back an application failure and never leaves old autosave active',async()=>{
 let current={id:'original'},paused=false;const log=[];
 await assert.rejects(replaceImportedProject({capture:()=>current,pause:()=>{paused=true;log.push('pause');},apply:next=>{current=next;if(next.id==='new')throw Error('apply failed');},resume:success=>{paused=false;log.push(success);}}, {id:'new'}),/apply failed/);
 assert.equal(current.id,'original');assert.equal(paused,false);assert.deepEqual(log,['pause',false]);
});
test('successful transaction validates first and leaves imported project for explicit save',async()=>{
 let current={id:'old'},resumed;await replaceImportedProject({capture:()=>current,pause:()=>{},apply:next=>{current=next;},resume:success=>{resumed=success;}},{id:'new'});assert.equal(current.id,'new');assert.equal(resumed,true);
});

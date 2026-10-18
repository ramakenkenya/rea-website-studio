import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBrief,snapshot,validateSnapshot,readSaved,writeSaved,escapeHtml} from '../src/project.js';
import {createStarter} from '../src/templates.js';
import {buildDocument} from '../src/export.js';
const brief={name:'Malaba Studio',description:'Spaces made for everyday life.',services:'Architecture, Interiors',email:'hello@example.com',title:'Malaba Studio — spaces for life',theme:'editorial'};
test('brief requires a name and rejects an unsafe contact URL',()=>{
 assert.throws(()=>normalizeBrief({...brief,name:'  '}),/name/i);
 assert.throws(()=>normalizeBrief({...brief,email:'javascript:alert(1)'}),/email/i);
});
test('starter text is escaped and uses the supplied business content',()=>{
 const result=createStarter(normalizeBrief({...brief,name:'<img src=x onerror=alert(1)>'}));
 assert.ok(result.html.includes('&lt;img'));assert.ok(!result.html.includes('<img src=x'));
 assert.equal(escapeHtml('"<&'), '&quot;&lt;&amp;');
 assert.ok(result.html.includes('Spaces made for everyday life.'));
});
test('snapshot round trips project JSON separately from site export',()=>{
 const p=snapshot(brief,{pages:[{component:{tagName:'body',components:[{type:'text',content:'My page'}]}}],styles:[]});
 const loaded=validateSnapshot(JSON.parse(JSON.stringify(p)));
 assert.equal(loaded.project.pages[0].component.components[0].content,'My page');assert.equal(loaded.brief.name,'Malaba Studio');
});
test('corrupted and executable project backups are rejected',()=>{
 assert.throws(()=>validateSnapshot({schema:99}),/project/i);
 for(const component of [{script:'alert(1)'},{tagName:'iframe'},{attributes:{onclick:'alert(1)'}},{content:'<img src=x onerror=alert(1)>'},{attributes:{href:'javascript:alert(1)'}}]){
  assert.throws(()=>validateSnapshot(snapshot(brief,{pages:[{component}],styles:[]})),/unsafe|unsupported/i);
 }
});
test('quota and corrupt saved data do not report a successful save',()=>{
 const store={setItem(){throw new Error('QuotaExceededError')},getItem(){return '{broken'}};
 assert.equal(writeSaved(store,snapshot(brief,{pages:[],styles:[]})).ok,false);
 assert.equal(readSaved(store).ok,false);
});
test('export is a complete standalone HTML document with escaped metadata',()=>{
 const html=buildDocument({html:'<body><main><h1>Real website</h1></main></body>',brief:{...brief,title:'A "great" <site>'}});
 assert.ok(html.startsWith('<!doctype html>'));assert.ok(html.includes('<meta name="viewport"'));
 assert.ok(html.includes('A &quot;great&quot; &lt;site&gt;'));assert.ok(html.includes('href="styles.css"'));
 assert.equal((html.match(/<body/g)||[]).length,1);assert.ok(!html.includes('rea-website-studio/assets'));
});
test('valid image-heavy backups use the same size contract as restore',async()=>{
 const {serializeBackup,MAX_BACKUP_BYTES}=await import('../src/project.js');
 const data=snapshot(brief,{pages:[{component:{type:'image',attributes:{src:'data:image/png;base64,'+'a'.repeat(7*1024*1024)}}}],styles:[]});
 const serialized=serializeBackup(data);assert.ok(serialized.length>6*1024*1024);
 assert.equal(validateSnapshot(JSON.parse(serialized)).brief.name,'Malaba Studio');
 assert.throws(()=>serializeBackup(snapshot(brief,{pages:[{component:{content:'a'.repeat(MAX_BACKUP_BYTES)}}],styles:[]})),/large|size|MB/i);
});
test('malformed page or frame structures are rejected before replacing a website',()=>{
 for(const pages of [[null],[{frames:[null]}],[{frames:[{component:null}]}],[]]){
  assert.throws(()=>validateSnapshot(snapshot(brief,{pages,styles:[]})),/project|page|frame|component/i);
 }
});
test('browser-normalized executable URL schemes are rejected in backups',()=>{
 for(const href of ['java\nscript:alert(1)','java\tscript:alert(1)','\u0000javascript:alert(1)','data:\ntext/html,hello']){
  assert.throws(()=>validateSnapshot(snapshot(brief,{pages:[{component:{tagName:'a',attributes:{href}}}],styles:[]})),/unsafe/i);
 }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import grapesjs from 'grapesjs';
import {duplicateElement,duplicateEditorPage,captureReusableSection,studioNavigation,studioShortcut} from '../src/editor-actions.js';
const make=()=>grapesjs.init({headless:true,storageManager:false,components:[{tagName:'main',components:[{tagName:'section',components:[{tagName:'h1',type:'text',content:'Keep the nested heading',style:{color:'red'}}]},{tagName:'section',components:[{tagName:'p',type:'text',content:'Another section'}]}]}]});
test('duplicating elements keeps nested content and independent ID styles',()=>{
 const editor=make();try{const source=editor.getWrapper().components().at(0).components().at(0);const clone=duplicateElement(editor,source);assert.match(clone.toHTML(),/Keep the nested heading/);assert.equal(clone.components().at(0).getStyle().color,'red');assert.notEqual(clone.components().at(0).getId(),source.components().at(0).getId());clone.components().at(0).addStyle({color:'blue'});assert.equal(source.components().at(0).getStyle().color,'red');}finally{editor.destroy();}
});
test('duplicating a page keeps all sections and their component-specific styles',()=>{
 const editor=make();try{const page=duplicateEditorPage(editor,editor.Pages.getSelected(),{id:'copy',name:'Copy'});const root=page.getMainComponent();assert.match(root.toHTML(),/Keep the nested heading/);assert.match(root.toHTML(),/Another section/);assert.equal(root.components().at(0).components().at(0).components().at(0).getStyle().color,'red');}finally{editor.destroy();}
});
test('saving a section captures only its nearest section and detached CSS identities',()=>{
 const editor=make();try{const source=editor.getWrapper().components().at(0).components().at(0),heading=source.components().at(0);const saved=captureReusableSection(editor,heading);assert.match(saved.html,/Keep the nested heading/);assert.doesNotMatch(saved.html,/Another section|<main/);assert.match(saved.css,/color:red/);assert.ok(!saved.html.includes(heading.getId()));}finally{editor.destroy();}
});

test('navigation discovery finds unrendered page headers instead of inserting extras',()=>{
 const editor=grapesjs.init({headless:true,storageManager:false,components:[{tagName:'header',classes:['site-nav'],components:[{tagName:'nav'}]}]});
 try{const wrapper=editor.getWrapper();assert.equal(studioNavigation(wrapper),wrapper.components().at(0));const other=editor.Pages.add({id:'unseen',component:{tagName:'header',attributes:{'data-studio-nav':'true'}}});assert.equal(studioNavigation(other.getMainComponent()),other.getMainComponent().components().at(0));}finally{editor.destroy();}
});
test('forwarded canvas shortcuts run once and honor original typing target',()=>{
 const calls={save:0,undo:0,redo:0,prevent:0};const editor={UndoManager:{undo:()=>calls.undo++,redo:()=>calls.redo++}};
 const event=(key,typing=false)=>({key,ctrlKey:true,target:{},preventDefault:()=>calls.prevent++,_parentEvent:{target:{closest:()=>typing},preventDefault:()=>calls.prevent++}});
 studioShortcut(event('s'),editor,()=>calls.save++);studioShortcut(event('z'),editor,()=>calls.save++);studioShortcut(event('y'),editor,()=>calls.save++);studioShortcut(event('z',true),editor,()=>calls.save++);
 assert.deepEqual(calls,{save:1,undo:1,redo:1,prevent:6});
});

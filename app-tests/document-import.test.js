import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import JSZip from 'jszip';
import {PDFDocument} from 'pdf-lib';
import {DOMParser,XMLSerializer} from '@xmldom/xmldom';
import {readWebsiteDocument,MAX_DOCUMENT_BYTES} from '../src/document-reader.js';
import {reviewDocument} from '../src/document-model.js';
import {sampleRaw,completedDocx,completedPdf} from './import-fixture.js';
test('completed Word template retains four page records and six product records',async()=>{
 const raw=await readWebsiteDocument(await completedDocx(),'Rama Living.docx');const result=reviewDocument(raw);
 assert.deepEqual(result.issues,[]);assert.equal(result.draft.pages.length,4);assert.equal(result.draft.shop.products.length,6);assert.equal(result.draft.shop.products[0].priceCents,4800000);
});
test('filled PDF reads canonical form values and supports its fixed records',async()=>{
 const raw=await readWebsiteDocument(await completedPdf(),'completed.pdf');const r=reviewDocument(raw);
 assert.deepEqual(r.issues,[]);assert.equal(r.draft.brief.name,'Rama Living PDF');assert.equal(r.draft.pages.length,1);assert.equal(r.draft.shop.products.length,1);
});
test('untouched downloadable templates omit example placeholders and can be completed in review',async()=>{
 for(const ext of ['docx','pdf']){
 const bytes=await fs.readFile(new URL('../public/templates/Rama_Studio_Website_Template_v1.'+ext,import.meta.url));const raw=await readWebsiteDocument(bytes,'blank.'+ext);assert.equal(raw.fields['business.name']||'','');assert.equal(raw.records.product.length,0);
 const r=reviewDocument(raw,{name:'My business',description:'My actual copy'});assert.deepEqual(r.issues,[]);assert.equal(r.draft.pages.length,1);assert.equal(r.draft.brief.description,'My actual copy');}
});
test('labelled Word paragraphs remain readable if an editor removes content controls',async()=>{
 const raw=await readWebsiteDocument(await completedDocx(sampleRaw(),{plain:true}),'plain.docx');const r=reviewDocument(raw);assert.deepEqual(r.issues,[]);assert.equal(r.draft.pages.length,4);assert.equal(r.draft.shop.products.length,6);
});
test('removing controls from the real template skips guidance and reads the actual answers',async()=>{
 const z=await JSZip.loadAsync(await fs.readFile(new URL('../public/templates/Rama_Studio_Website_Template_v1.docx',import.meta.url)));const W='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
 const x=new DOMParser().parseFromString(await z.file('word/document.xml').async('string'),'application/xml');
 for(const tag of [...x.getElementsByTagNameNS(W,'tag')]){const control=tag.parentNode.parentNode;const content=control.getElementsByTagNameNS(W,'sdtContent')[0];if(tag.getAttributeNS(W,'val')==='business.name')content.getElementsByTagNameNS(W,'t')[0].textContent='My real answer';while(content.firstChild)control.parentNode.insertBefore(content.firstChild,control);control.parentNode.removeChild(control);}
 z.file('word/document.xml',new XMLSerializer().serializeToString(x));const raw=await readWebsiteDocument(await z.generateAsync({type:'uint8array'}),'stripped.docx');assert.equal(raw.fields['business.name'],'My real answer');assert.equal(raw.records.product.length,0);
});
test('invalid, unsupported, flattened and oversized documents fail clearly',async()=>{
 await assert.rejects(readWebsiteDocument(new Uint8Array(MAX_DOCUMENT_BYTES+1),'large.docx'),/5 MB/);
 await assert.rejects(readWebsiteDocument(new Uint8Array([1,2]),'old.doc'),/Word.*PDF|docx/i);
 await assert.rejects(readWebsiteDocument(new Uint8Array([1,2]),'broken.docx'),/valid|read/i);
 const d=await PDFDocument.create();d.addPage();await assert.rejects(readWebsiteDocument(await d.save(),'scan.pdf'),/fillable|form/i);
 const z=new JSZip();z.file('word/document.xml','<!DOCTYPE x [<!ENTITY bad "oops">]><x/>');await assert.rejects(readWebsiteDocument(await z.generateAsync({type:'uint8array'}),'bad.docx'),/unsafe|DOCTYPE|template/i);
 z.file('word/document.xml','<x>'.repeat(200));await assert.rejects(readWebsiteDocument(await z.generateAsync({type:'uint8array'}),'malformed.docx'),/valid|XML|template/i);
});
test('review edits take precedence without mutating the parsed document',()=>{
 const raw=sampleRaw();const r=reviewDocument(raw,{name:'My furniture shop',email:'hello@example.com',theme:'coastal'});assert.equal(r.draft.brief.name,'My furniture shop');assert.equal(r.draft.brief.email,'hello@example.com');assert.equal(raw.fields['business.name'],'Rama Living');
});
test('missing prices, duplicate IDs, invalid references and mixed currencies block creation',()=>{
 for(const edit of [r=>r.records.product[0]['product.price']='',r=>r.records.page[1]['page.id']='home',r=>r.records.section[0]['section.page']='missing',r=>r.records.product[0]['product.price']='20 | USD',r=>r.records.page[0]['page.sections']='missing']){
 const raw=sampleRaw();edit(raw);assert.equal(reviewDocument(raw).ok,false);}
 const raw=sampleRaw();raw.records.product[0]['product.price']='';assert.match(reviewDocument(raw).issues.join(' '),/Nia Sofa.*price/i);
});
test('unsafe destinations, local images and page limits block creation',()=>{
 for(const [key,value] of [['page.hero.button','Go | javascript:alert(1)'],['page.hero.image','http://localhost/x | Unsafe']]){const r=sampleRaw();r.records.page[0][key]=value;assert.equal(reviewDocument(r).ok,false);}
 const r=sampleRaw();r.fields['site.pages']=Array.from({length:21},(_,i)=>'p'+i+' | Page | p'+i+'.html').join('\n');assert.equal(reviewDocument(r).ok,false);
});
test('broken fragment references and reserved shop fragment IDs fail before creation',()=>{
 for(const change of [r=>r.records.page[0]['page.hero.button']='Go | shop.html#missing',r=>r.records.page[0]['page.hero.button']='Go | #missing',r=>r.records.section[0]['section.id']='shopping-list']){const r=sampleRaw();change(r);assert.equal(reviewDocument(r).ok,false);}
});
test('Word multiline answers keep every paragraph after controls are removed',async()=>{
 const z=await JSZip.loadAsync(await completedDocx(sampleRaw(),{plain:true}));let xml=await z.file('word/document.xml').async('string');xml=xml.replace('<w:t>Considered furniture and useful spaces.</w:t></w:r></w:p>','<w:t>Considered furniture and useful spaces.</w:t></w:r></w:p><w:p><w:r><w:t>A second paragraph that must survive.</w:t></w:r></w:p>');z.file('word/document.xml',xml);const raw=await readWebsiteDocument(await z.generateAsync({type:'uint8array'}),'multiline.docx');assert.match(raw.records.page[0]['page.hero.body'],/second paragraph/);
});
test('fragment links to omitted empty optional sections fail clearly',()=>{
 const raw=sampleRaw();raw.records.gallery=[];raw.records.page[0]['page.hero.button']='See rooms | lookbook.html#rooms';assert.equal(reviewDocument(raw).ok,false);
});

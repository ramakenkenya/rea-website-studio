import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {PDFDocument} from 'pdf-lib';
import {readWebsiteDocument} from '../src/document-reader.js';
import {reviewDocument} from '../src/document-model.js';
import {documentSite} from '../src/document-site.js';
for(const ext of ['docx','pdf'])test(`published ${ext} example includes four pages, six photographed products and credited photos`,async()=>{
 const bytes=await fs.readFile(new URL(`../public/templates/Rama_Living_Completed_Example.${ext}`,import.meta.url));
 const raw=await readWebsiteDocument(bytes,'example.'+ext),review=reviewDocument(raw);
 assert.deepEqual(review.issues,[]);assert.equal(review.draft.pages.length,4);assert.equal(review.draft.shop.products.length,6);
 assert.ok(review.draft.pages.every(p=>p.hero.image));assert.ok(review.draft.shop.products.every(p=>p.image));
 assert.ok(review.draft.galleries.flatMap(g=>g.images).length>=6);
 const project=documentSite(review.draft);assert.ok(project.studio.assets.every(a=>a.license==='CC0'&&a.artist&&a.sourceUrl));
 assert.doesNotMatch(JSON.stringify(raw),/images\.example|Demo Photographer/);
 for(const a of project.studio.assets){const name=new URL(a.src).pathname.split('/').at(-1);const data=await fs.readFile(new URL('../public/example-photos/'+name,import.meta.url));assert.ok(data.length>5000);assert.equal(data[0],255);assert.equal(data[1],216);}
});
test('PDF repeat fields are grouped numerically even when stored out of order',async()=>{
 const pdf=await PDFDocument.create();pdf.addPage();const f=pdf.getForm();
 for(const [key,value] of [['business.name','Test'],['site.pages','home | Home | index.html\nabout | About | about.html'],['site.home','home'],['page.hero.heading__2','About us'],['page.id__2','about'],['page.hero.heading','Welcome'],['page.id','home']])f.createTextField(key).setText(value);
 const raw=await readWebsiteDocument(await pdf.save(),'test.pdf');assert.equal(raw.records.page.length,2);assert.equal(raw.records.page[0]['page.id'],'home');assert.equal(raw.records.page[1]['page.hero.heading'],'About us');
});
test('import rules preserve literal CSS selectors instead of escaping them as class names',async()=>{
 const raw=await readWebsiteDocument(await fs.readFile(new URL('../public/templates/Rama_Living_Completed_Example.docx',import.meta.url)),'test.docx');
 const project=documentSite(reviewDocument(raw).draft);const rule=project.project.styles.find(r=>r.selectorsAdd==='.site-nav nav');assert.equal(rule?.style.display,'flex');
 assert.ok(project.project.styles.every(r=>!r.selectors?.some(s=>typeof s==='string'&&s.startsWith('.'))));
});

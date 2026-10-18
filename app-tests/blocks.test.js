import test from 'node:test';
import assert from 'node:assert/strict';
import {EXTRA_BLOCKS,EXTRA_CSS,extraSection,PAGE_PRESETS,pagePreset,STARTER_PACKS,starterBrief,starterPage} from '../src/blocks.js';
import {normalizeBrief} from '../src/project.js';
import {assertSafeValue} from '../src/site-model.js';

const brief=normalizeBrief({name:'Juniper & Stone',description:'Objects made for everyday rituals.',services:'Ceramics, Textiles, Lighting',email:'hello@example.com'});
const h1Count=html=>(html.match(/<h1(?:\s|>)/g)||[]).length;
const fragments=html=>[...html.matchAll(/href="#([^"]+)"/g)].map(m=>m[1]);
function assertPage(page){
 assert.equal(h1Count(page.html),1);
 assert.ok(page.css.includes('box-sizing'));
 assert.ok(page.css.includes('.extra-grid'));
 assert.doesNotThrow(()=>assertSafeValue(page));
 assert.doesNotMatch(page.html,/<(?:script|form|iframe)\b/i);
 for(const id of fragments(page.html))assert.ok(page.html.includes(`id="${id}"`),`Missing target #${id}`);
}

test('all ten insertable blocks are portable safe sections with independent styling',()=>{
 assert.deepEqual(EXTRA_BLOCKS.map(x=>x.id),['products','gallery','faq','testimonials','team','pricing','stats','cta','hours','social']);
 assert.ok(EXTRA_CSS.includes('@media'));
 for(const {id} of EXTRA_BLOCKS){
  const html=extraSection(id,brief);
  assert.match(html,/^<section\b/);
  assert.match(html,/data-section="[^"]+"/);
  assert.equal(h1Count(html),0);
  assert.doesNotThrow(()=>assertSafeValue({html,css:EXTRA_CSS}));
  assert.doesNotMatch(html,/<(?:script|form|iframe)\b|\son[a-z]+\s*=/i);
 }
 assert.match(extraSection('products',brief),/data-section="Products"/);
 assert.equal((extraSection('faq',brief).match(/<details\b/g)||[]).length,3);
 assert.equal((extraSection('faq',brief).match(/<summary>/g)||[]).length,3);
 for(const id of ['testimonials','pricing','stats'])assert.match(extraSection(id,brief),/sample|demo/i);
 assert.match(extraSection('social',brief),/edit|replace/i);
});

test('blocks escape brief text and never promote supplied content to markup',()=>{
 const hostile={...brief,name:'<img src=x>',description:'A <b>bold</b> idea',services:'<svg>, "Quoted", A & B'};
 const html=EXTRA_BLOCKS.map(({id})=>extraSection(id,hostile)).join('');
 assert.ok(html.includes('&lt;img src=x&gt;'));
 assert.ok(html.includes('&lt;svg&gt;'));
 assert.doesNotMatch(html,/<img src=x>|<b>bold<\/b>|<svg>/);
 assert.doesNotThrow(()=>assertSafeValue(html));
});

test('page presets provide their own content, single main heading and contact targets',()=>{
 assert.deepEqual(PAGE_PRESETS.map(x=>x.id),['about','products','contact']);
 for(const {id} of PAGE_PRESETS){
  const page=pagePreset(id,brief);assertPage(page);
  assert.match(page.html,/Juniper &amp; Stone/);
  assert.match(page.html,/id="contact"/);
 }
 assert.match(pagePreset('about',brief).html,/data-section="Team"/);
 assert.match(pagePreset('products',brief).html,/data-section="Products"/);
 assert.match(pagePreset('products',brief).html,/Ceramics/);
 assert.match(pagePreset('contact',brief).html,/mailto:hello@example.com/);
 assert.match(pagePreset('contact',{...brief,email:''}).html,/Add your contact email/);
});

test('starter packs have relevant copy and original embedded artwork without architecture imagery',()=>{
 assert.deepEqual(STARTER_PACKS.map(x=>x.id),['coffee','furniture','portfolio']);
 const expected={coffee:/coffee|espresso/i,furniture:/furniture|chair/i,portfolio:/portfolio|selected work/i};
 const art=new Set();
 for(const {id} of STARTER_PACKS){
  const next=starterBrief(id);assert.deepEqual(normalizeBrief(next),next);
  const page=starterPage(id,next);assertPage(page);
  assert.match(page.html,expected[id]);
  assert.doesNotMatch(page.html,/Architectural illustration|arched doorway|INDEPENDENT IDEAS|SPACE FOR SOMETHING NEW/);
  const images=[...page.html.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*>/g)];
  assert.ok(images.length>=2);
  for(const [,src] of images){assert.ok(src.startsWith('data:image/svg+xml;'));art.add(src);}
  assert.doesNotMatch(page.html,/<img\b[^>]*src="https?:/);
 }
 assert.ok(art.size>=6,'Business packs should use distinct contextual artwork');
});

test('starter pages preserve supplied brief text and reject unknown layouts',()=>{
 const page=starterPage('coffee',{...brief,name:'Custom <Cafe>',description:'A quiet corner for our neighbours.'});
 assert.match(page.html,/Custom &lt;Cafe&gt;/);assert.match(page.html,/A quiet corner for our neighbours\./);
 assert.throws(()=>extraSection('missing',brief),/unknown/i);
 assert.throws(()=>pagePreset('missing',brief),/unknown/i);
 assert.throws(()=>starterBrief('missing'),/unknown/i);
 assert.throws(()=>starterPage('missing',brief),/unknown/i);
});

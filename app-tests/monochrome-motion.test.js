import test from 'node:test';
import assert from 'node:assert/strict';
import {monochromeMotion} from '../src/monochrome-motion.js';
import {createTextPortfolio,TEXT_SAMPLE_BRIEF,textSampleProject} from '../src/text-portfolio.js';
import {extraSection,EXTRA_CSS} from '../src/blocks.js';
import {assertSafeValue} from '../src/site-model.js';

test('both authored samples include the contrast experiment, one accessible portrait and native motion control',()=>{
 for(const language of ['en','ko']){
  const {html,css}=createTextPortfolio(TEXT_SAMPLE_BRIEF,{sample:true,language});
  assert.match(html,/data-section="Monochrome motion"/);
  const images=[...html.matchAll(/<img[^>]+src="([^"]+)"[^>]+alt="([^"]*)"/g)];
  assert.equal(images.length,2);assert.equal(images[0][1],images[1][1]);
  assert.ok(images[0][1].startsWith('data:image/jpeg;base64,'));
  assert.ok(images[0][2]);assert.equal(images[1][2],'');
  assert.match(html,/type="checkbox"/);assert.doesNotMatch(html,/<script\b/);
  assert.match(css,/@keyframes mm-travel/);
  assert.doesNotThrow(()=>assertSafeValue({html,css}));
 }
 assert.match(monochromeMotion({sample:true,language:'ko'}),/계속 만들다/);
 assert.equal(textSampleProject().pages.length,2);
});

test('insertable motion block is self-contained and does not reuse personal images or biography',()=>{
 const html=extraSection('monochrome-motion',{name:'A <maker>',theme:'text'});
 assert.match(html,/A &lt;maker&gt;/);assert.doesNotMatch(html,/Rama Ken|<img\b|South Korea/);
 assert.match(EXTRA_CSS,/@keyframes mm-travel/);
 assert.doesNotThrow(()=>assertSafeValue({html,css:EXTRA_CSS}));
});

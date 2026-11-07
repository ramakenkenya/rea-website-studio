import test from 'node:test';
import assert from 'node:assert/strict';
import {createTextPortfolio,TEXT_SAMPLE_BRIEF} from '../src/text-portfolio.js';
import {extraSection,EXTRA_CSS} from '../src/blocks.js';
import {assertSafeValue} from '../src/site-model.js';

test('both sample languages present two process examples without photos or motion controls', () => {
 for (const language of ['en', 'ko']) {
  const {html,css} = createTextPortfolio(TEXT_SAMPLE_BRIEF,{sample:true,language});
  const section = html.match(/<section class="bw-section"[\s\S]*?<\/section>/)?.[0];
  assert.ok(section);
  assert.match(section,/MvuaKenya/);
  assert.match(section,language === 'en' ? /Gorilla Rampage/ : /고릴라 램페이지/);
  assert.equal((section.match(/<article\b/g) || []).length,2);
  assert.doesNotMatch(section,/<(?:img|input|button|script)\b/);
  assert.doesNotMatch(css,/@keyframes mm-travel/);
  assert.doesNotThrow(() => assertSafeValue({html,css}));
 }
});

test('the insertable process section uses general copy and portable styling', () => {
 const html = extraSection('split-process',{name:'Your site',theme:'text'});
 assert.match(html,/How I/);
 assert.doesNotMatch(html,/Rama Ken|MvuaKenya|Gorilla Rampage|<img\b/);
 assert.doesNotThrow(() => assertSafeValue({html,css:EXTRA_CSS}));
});

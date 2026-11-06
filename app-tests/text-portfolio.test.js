import test from 'node:test';
import assert from 'node:assert/strict';
import {pixelsToPortrait,portraitMarkup} from '../src/text-portrait.js';
import {createTextPortfolio,TEXT_SAMPLE_BRIEF} from '../src/text-portfolio.js';
import {normalizeBrief,snapshot,validateSnapshot} from '../src/project.js';
import {createStarter,THEMES} from '../src/templates.js';
import {createStudio,brandCss,assertSafeValue,rewriteNavigation} from '../src/site-model.js';

test('bounded portrait conversion preserves rows, alpha and light/dark polarity',()=>{
 const rgba=new Uint8ClampedArray([0,0,0,255,255,255,255,255,90,90,90,0,127,127,127,255]);
 assert.equal(pixelsToPortrait(rgba,2,2), '@ \n +');
 assert.equal(pixelsToPortrait(rgba,2,2,{dark:false}), ' @\n =');
 for(const [w,h] of [[0,2],[2,0],[2.5,2],[201,2],[2,141]])assert.throws(()=>pixelsToPortrait(rgba,w,h));
 assert.throws(()=>pixelsToPortrait(rgba,3,2));
 const html=portraitMarkup(' <&\n@@ ', 'A "portrait"');
 assert.match(html,/role="img"/);assert.match(html,/aria-label="A &quot;portrait&quot;"/);
 assert.match(html,/ &lt;&amp;\n@@ /);assert.doesNotThrow(()=>assertSafeValue({html}));
});

test('text theme survives normalization, studio branding and backup validation',()=>{
 const b=normalizeBrief({...TEXT_SAMPLE_BRIEF});assert.equal(b.theme,'text');assert.ok(THEMES.text);
 const p={pages:[{id:'home',component:{tagName:'div'}}],styles:[]};
 const s=createStudio(p,b);assert.equal(s.site.brand.paper,'#0b0b0b');assert.equal(s.site.brand.font,'sans');
 assert.match(brandCss(s),/Arial/);assert.equal(validateSnapshot(snapshot(b,p,s)).brief.theme,'text');
});

test('generic text template uses the brief and avoids personal claims',()=>{
 const b=normalizeBrief({name:'A <B> & C',description:'Independent <maker>.',theme:'text',email:'maker@example.com'});
 const p=createStarter(b);assert.match(p.html,/A &lt;B&gt; &amp; C/);assert.match(p.html,/Independent &lt;maker&gt;/);
 assert.match(p.html,/mailto:maker@example.com/);assert.match(p.html,/data-text-portrait/);
 assert.doesNotMatch(p.html,/Gorilla|MvuaKenya|Rama Ken|<img\b|<canvas\b|<script\b/);
 assert.doesNotThrow(()=>assertSafeValue(p));
});

test('completed sample has real projects, portable artwork and intact section navigation',()=>{
 const p=createTextPortfolio(TEXT_SAMPLE_BRIEF,{sample:true});
 assert.equal((p.html.match(/<h1\b/g)||[]).length,1);
 for(const name of ['Gorilla Rampage','MvuaKenya','Rama Studio'])assert.ok(p.html.includes(name));
 for(const [,id] of p.html.matchAll(/href="#([^"]+)"/g))assert.ok(p.html.includes(`id="${id}"`));
 assert.match(p.html,/Portrait of Rama Ken/);assert.doesNotMatch(p.html,/<(?:img|canvas|script)\b/);
 assert.match(p.css,/prefers-reduced-motion/);assert.match(p.css,/white-space:pre/);
 const s=createStudio({pages:[{id:'home'}]},TEXT_SAMPLE_BRIEF);
 assert.match(rewriteNavigation(p.html,s,'home'),/href="#work"/);
 assert.doesNotThrow(()=>assertSafeValue(p));
});

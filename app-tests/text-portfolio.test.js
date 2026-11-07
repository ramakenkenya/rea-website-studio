import {TEXT_BLOCK_PRESETS,textBlockMarkup} from '../src/text-blocks.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {pixelsToPortrait,portraitMarkup,portraitFromFile,replacePortraitText,registerTextPortrait} from '../src/text-portrait.js';
import grapesjs from 'grapesjs';
import {createTextPortfolio,TEXT_SAMPLE_BRIEF} from '../src/text-portfolio.js';
import {normalizeBrief,snapshot,validateSnapshot} from '../src/project.js';
import {THEMES} from '../src/templates.js';
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
 const s=createStudio(p,b);assert.equal(s.site.brand.paper,'#faf8f2');assert.equal(s.site.brand.font,'sans');
 assert.match(brandCss(s),/Arial/);assert.equal(validateSnapshot(snapshot(b,p,s)).brief.theme,'text');
});

test('generic text blocks escape brief copy and contain editable text',()=>{
 const b=normalizeBrief({name:'A <B> & C',description:'Independent <maker>.',theme:'text',email:'maker@example.com'});
 const headline=textBlockMarkup(TEXT_BLOCK_PRESETS.find(p=>p.id==='outline-echo'),{brief:b});
 assert.match(headline,/A &lt;B&gt; &amp; C/);assert.match(headline,/Independent &lt;maker&gt;/);
 const footer=textBlockMarkup(TEXT_BLOCK_PRESETS.find(p=>p.id==='utility-footer'),{brief:b});
 assert.match(footer,/mailto:maker@example.com/);
 assert.doesNotMatch(headline,/Gorilla|MvuaKenya|Rama Ken|<img\b|<canvas\b|<script\b/);
 assert.doesNotThrow(()=>assertSafeValue({headline,footer}));
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

test('blank or oversized photos are rejected without storing an empty portrait',async()=>{
 await assert.rejects(portraitFromFile({type:'image/png',size:8*1024*1024+1}),/smaller than 8 MB/);
 await assert.rejects(portraitFromFile({type:'image/svg+xml',size:40}),/JPEG, PNG or WebP/);
 const bitmap=globalThis.createImageBitmap,doc=globalThis.document;let closed=false;
 globalThis.createImageBitmap=async()=>({width:120,height:88,close(){closed=true;}});
 globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},drawImage(){},getImageData:()=>({data:new Uint8ClampedArray(120*88*4).fill(255)})})})};
 try{await assert.rejects(portraitFromFile({type:'image/png',size:100}),/No portrait detail/);assert.ok(closed);}
 finally{if(bitmap===undefined)delete globalThis.createImageBitmap;else globalThis.createImageBitmap=bitmap;if(doc===undefined)delete globalThis.document;else globalThis.document=doc;}
});

test('uploaded character grids keep blank margins and escape markup through model restore and export',()=>{
 const editor=grapesjs.init({headless:true,storageManager:false});registerTextPortrait(editor);
 const portrait=editor.addComponents({type:'text-portrait',attributes:{'data-text-portrait':'true',class:'tp-art'}})[0];
 const text=Array(5).fill(' '.repeat(120)).concat([' '.repeat(45)+'<&>'],Array(82).fill(' '.repeat(120))).join('\n');
 replacePortraitText(portrait,text);
 assert.equal(portrait.components().at(0).get('content'),text);assert.match(portrait.toHTML(),/&lt;&amp;&gt;/);assert.doesNotMatch(portrait.toHTML(),/&amp;lt;/);
 const data=JSON.parse(JSON.stringify(editor.getProjectData()));editor.loadProjectData(data);
 assert.equal(editor.getWrapper().components().at(0).components().at(0).get('content'),text);
 editor.destroy();
});

import test from 'node:test';
import assert from 'node:assert/strict';
import * as model from '../src/site-model.js';
import {snapshot,validateSnapshot} from '../src/project.js';
import {ART_URL,createStarter} from '../src/templates.js';
const brief={name:'Studio & Co',description:'Original work',theme:'editorial'};
const project={pages:[{id:'home',name:'Home',component:{}},{id:'about',name:'About',component:{}}],styles:[]};
const create=(input={})=>model.createStudio(project,brief,input);
test('reconciles pages and preserves explicit metadata order and home identity',()=>{
 const studio=create({homeId:'about',pages:[{id:'about',name:'About us',slug:'about',nav:false},{id:'home',slug:'home'},{id:'gone',slug:'old'}]});
 assert.equal(studio.version,2);assert.deepEqual(studio.pages.map(p=>p.id),['about','home']);
 assert.equal(model.pageFile(studio.pages[0],studio),'index.html');assert.equal(model.pageFile(studio.pages[1],studio),'home.html');assert.equal(studio.pages[0].nav,false);
 assert.equal(create().pages[0].title,brief.name);assert.equal(create().checkpoints.length,0);
});
test('rejects unsafe reserved and duplicate slugs but returns normalized valid slugs',()=>{
 const pages=[{id:'a',slug:'about'}];
 assert.equal(model.validateSlug(' About ',pages,'a'),'about');
 for(const slug of ['../secret','index','404','styles','studio','robots','sitemap','README','about','a/b','x.html','a b','a'.repeat(81)])assert.throws(()=>model.validateSlug(slug,pages),/slug|reserved|duplicate|used/i);
 assert.notEqual(create({pages:[{id:'home',name:'Same'},{id:'about',name:'Same'}]}).pages[0].slug,create({pages:[{id:'home',name:'Same'},{id:'about',name:'Same'}]}).pages[1].slug);
});
test('public URLs reject credentials queries fragments local and unsafe schemes',()=>{
 assert.equal(model.validateSiteUrl(' https://example.com/site/ '),'https://example.com/site');assert.equal(model.validateSiteUrl(''),'');
 for(const url of ['javascript:alert(1)','https://u:p@example.com','https://example.com?q=x','https://example.com/#x','http://localhost','http://127.0.0.1','http://[::1]','https://192.168.1.1','https://example.local'])assert.throws(()=>model.validateSiteUrl(url),/URL|public/i);
});
test('generated navigation uses home links and escaping and preserves arbitrary navigation',()=>{
 const studio=create({homeId:'about',pages:[{id:'home',name:'A & B',slug:'hello'},{id:'about',name:'<About>',slug:'about'}]});
 const nav=model.navigationHtml(studio,'about');assert.match(nav,/data-studio-nav/);assert.match(nav,/href="hello.html"/);assert.match(nav,/href="index.html"/);assert.match(nav,/aria-current="page"/);assert.match(nav,/&lt;About&gt;/);
 const html='<nav id="personal"><a href="#x">Keep</a></nav>'+model.navigationHtml(studio,'home')+'<main>Hello</main>';
 const changed=model.rewriteNavigation(html,studio,'about');assert.match(changed,/<nav id="personal"><a href="#x">Keep<\/a><\/nav>/);assert.equal((changed.match(/data-studio-nav/g)||[]).length,1);assert.match(changed,/<main>Hello<\/main>/);
 assert.match(model.rewriteNavigation('<nav>Keep</nav>',studio,'home'),/<nav>Keep<\/nav>/);
 assert.match(model.rewriteNavigation('<header class="site-nav">Legacy</header>',studio,'home'),/data-studio-nav/);
 assert.equal(model.rewriteNavigation('<nav>Keep</nav>',model.createStudio({pages:[{id:'one',component:{}}],styles:[]},brief),'one'),'<nav>Keep</nav>');
});
test('brand rules are portable constrained and override page styles',()=>{
 const css=model.brandCss(create({site:{brand:{paper:'#ffffff',ink:'#111111',accent:'#123456',font:'serif',width:1100,radius:12}}}));
 assert.match(css,/#123456/);assert.match(css,/1100px/);assert.match(css,/12px/);assert.match(css,/important/);assert.doesNotMatch(css,/@import|https:/);assert.match(css,/@media/);
 assert.throws(()=>create({site:{brand:{accent:'red; background:url(javascript:x)'}}}),/brand|color|unsafe/i);
});
test('schema 2 preserves studio and validates assets sections metadata and nested checkpoints',()=>{
 const studio=create({assets:[{id:'art',name:'Original',src:ART_URL,alt:'Artwork'}],sections:[{id:'s',name:'Intro',html:'<section><h2>Hello</h2></section>'}]});
 const saved=snapshot(brief,project,studio);assert.equal(saved.schema,2);assert.deepEqual(validateSnapshot(JSON.parse(JSON.stringify(saved))).studio,studio);
 assert.equal(snapshot(brief,project).schema,1);
 const cp=snapshot(brief,project,studio);const many=create({checkpoints:Array.from({length:8},(_,i)=>({id:'c'+i,name:'Version '+i,savedAt:new Date().toISOString(),snapshot:cp}))});
 assert.equal(many.checkpoints.length,5);assert.ok(many.checkpoints.every(c=>!c.snapshot.studio?.checkpoints.length));
 for(const extra of [{assets:[{id:'x',src:'javascript:alert(1)'}]},{assets:[{id:'x',src:'data:image/svg+xml,'+encodeURIComponent('<svg onload="alert(1)"/>')}]},{sections:[{id:'s',html:'<img src=x onerror=alert(1)>'}]},{site:{logo:'data:text/html,hello'}},{site:{language:'en" onload="evil'}},{pages:[{id:'home',description:'<script>alert(1)</script>'}]}])assert.throws(()=>validateSnapshot({...saved,studio:{...studio,...extra}}),/unsafe|invalid/i);
});
test('safe encoded inline SVG and raster images restore but encoded executable images do not',()=>{
 const good=snapshot(brief,{pages:[{id:'home',component:{attributes:{src:ART_URL}}}],styles:[]});assert.equal(validateSnapshot(good).schema,1);
 for(const svg of ['<svg><script>alert(1)</script></svg>','<svg><image href="javascript:alert(1)"/></svg>','<svg><foreignObject>hello</foreignObject></svg>'])assert.throws(()=>validateSnapshot(snapshot(brief,{pages:[{component:{attributes:{src:'data:image/svg+xml,'+encodeURIComponent(svg)}}}],styles:[]})),/unsafe/i);
});
test('navigation replacement matches exact legacy classes and ignores comments',()=>{
 const studio=create();
 const own='<header class="other site-nav more"><nav>Old links</nav></header>';
 assert.match(model.rewriteNavigation(own,studio,'home'),/data-studio-nav/);
 const custom='<header class="my-site-nav"><nav>Keep custom</nav></header>';
 assert.ok(model.rewriteNavigation(custom,studio,'home').includes(custom));
 const comment='<!-- <header class="site-nav">Preserve comment</header> -->';
 assert.ok(model.rewriteNavigation(comment,studio,'home').includes(comment));
});
test('restore rejects executable component types unsafe srcdoc and encoded schemes',()=>{
 for(const component of [{type:'script',content:'alert(1)'},{tagName:'a',attributes:{href:'java&#x73;cript:alert(1)'}},{tagName:'div',attributes:{srcdoc:'<h1>Unsafe document</h1>'}}])assert.throws(()=>validateSnapshot(snapshot(brief,{pages:[{component}],styles:[]})),/unsafe/i);
});
test('malformed studio values and duplicate IDs fail before restore',()=>{
 for(const input of [{pages:[{id:'home',slug:'about'},{id:'about',slug:'about'}]},{assets:[{id:'same',src:ART_URL},{id:'same',src:ART_URL}]},{site:{brand:{font:'toString'}}},{site:{brand:{width:0}}},{autosave:'true'},{checkpoints:[{id:'bad',name:'Invalid',savedAt:new Date().toISOString(),snapshot:{schema:2}}]}])assert.throws(()=>create(input),/invalid|unsupported|used/i);
});
test('ordinary GrapesJS link components remain valid portable project content',()=>{
 const data=snapshot(brief,{pages:[{id:'home',component:{tagName:'body',components:[{type:'link',tagName:'a',attributes:{href:'https://example.com'},content:'Visit'}]}}],styles:[]});
 assert.equal(validateSnapshot(data).project.pages[0].component.components[0].type,'link');
});
test('nested generated nav refreshes inside a custom header without nesting another header',()=>{
 const studio=create();
 const html='<header id="custom-header" class="custom"><a href="#brand">Custom brand</a><div><nav id="generated-links" data-studio-nav="true" aria-label="My pages"><a href="old.html">Stale links</a></nav></div><p>Keep this</p></header><main>Content</main>';
 const result=model.rewriteNavigation(html,studio,'about');
 assert.ok(result.startsWith('<header id="custom-header" class="custom">'));
 assert.ok(result.includes('<a href="#brand">Custom brand</a><div><nav id="generated-links" data-studio-nav="true" aria-label="My pages">'));
 assert.ok(result.includes('</nav></div><p>Keep this</p></header><main>Content</main>'));
 assert.equal((result.match(/<header\b/g)||[]).length,1);
 assert.equal((result.match(/<nav\b/g)||[]).length,1);
 assert.doesNotMatch(result,/old.html|Stale links/);assert.match(result,/about.html/);assert.match(result,/aria-current="page"/);
});
test('navigation scanning honors quoted angle brackets and preserves styled generated header attributes',()=>{
 const studio=create();
 const opener='<header title="Use > to move" id="styled-header" data-studio-nav="true" class="site-nav custom" style="padding: 7px">';
 const result=model.rewriteNavigation(opener+'<nav><a href="old.html">Old</a></nav></header><aside>Keep</aside>',studio,'home');
 assert.ok(result.startsWith(opener));assert.ok(result.endsWith('</header><aside>Keep</aside>'));assert.doesNotMatch(result,/old.html/);assert.match(result,/about.html/);
 const body='<body title="x > y"><main>Keep</main></body>';
 assert.ok(model.rewriteNavigation(body,studio,'home').startsWith('<body title="x > y"><header'));
});
test('navigation scanner ignores marker text inside unrelated attributes and raw text',()=>{
 const studio=create();
 const custom='<header title="data-studio-nav=\'true\'" class="custom"><nav>Keep links</nav></header>';
 const style='<style>.example::before{content:"<header class=\'site-nav\'>Fake</header>"}</style>';
 const result=model.rewriteNavigation(custom+style,studio,'home');
 assert.ok(result.includes(custom));assert.ok(result.includes(style));
 assert.equal((result.match(/data-studio-nav="true"/g)||[]).length,1);
});
test('navigation refresh keeps CSS component IDs and visual attributes while updating links and labels',()=>{
 const studio=create({pages:[{id:'home',slug:'welcome',name:'New home'},{id:'about',slug:'our-story',name:'About'}]});
 const html='<header id="user-header" class="site-nav custom"><a id="user-brand" class="site-brand" style="font-size: 33px" href="#top">Old business</a><nav id="user-nav" aria-label="Site pages"><a id="about-link" class="fancy" href="about.html">About</a><a id="home-link" title="Welcome" href="index.html">Home</a></nav></header>';
 const result=model.rewriteNavigation(html,studio,'about');
 assert.match(result,/<header id="user-header"/);assert.match(result,/<a id="user-brand"[^>]*style="font-size: 33px"[^>]*href="index.html"/);assert.match(result,/<nav id="user-nav" aria-label="Site pages">/);
 assert.match(result,/<a id="home-link"[^>]*href="index.html"[^>]*>New home<\/a>/);assert.match(result,/<a id="about-link" class="fancy"[^>]*href="our-story.html"[^>]*aria-current="page"[^>]*>About<\/a>/);
 assert.ok(result.indexOf('id="home-link"')<result.indexOf('id="about-link"'));assert.doesNotMatch(result,/Old business|about.html/);
});
test('link identities follow page labels when changing home reuses another page URL',()=>{
 const studio=create({homeId:'about',pages:[{id:'about',name:'About',slug:'about'},{id:'home',name:'Home',slug:'welcome'}]});
 const html='<header class="site-nav"><a class="site-brand" href="index.html">Studio</a><nav><a id="home-link" href="index.html">Home</a><a id="about-link" href="about.html">About</a></nav></header>';
 const result=model.rewriteNavigation(html,studio,'about');
 assert.match(result,/<a id="about-link"[^>]*href="index.html"[^>]*>About<\/a>/);assert.match(result,/<a id="home-link"[^>]*href="welcome.html"[^>]*>Home<\/a>/);
});
test('safe scroll-behavior CSS is accepted while executable legacy behavior is rejected',()=>{
 assert.doesNotThrow(()=>model.assertSafeValue('html{scroll-behavior:smooth}'));
 assert.throws(()=>model.assertSafeValue('body{behavior:url(foo)}'),/unsafe/i);
});
test('saved sections preserve portable CSS with schema round trips and validate CSS',()=>{
 const css='#custom-section{padding:47px;color:#123456}html{scroll-behavior:smooth}';
 const studio=create({sections:[{id:'s',name:'Custom section',html:'<section id="custom-section">Hello</section>',css}]});
 assert.equal(studio.sections[0].css,css);
 assert.equal(validateSnapshot(snapshot(brief,project,studio)).studio.sections[0].css,css);
 assert.equal(create({sections:[{id:'old',html:'<section>Legacy</section>'}]}).sections[0].css,'');
 for(const unsafe of ['a{background:url(javascript:alert(1))}','body{behavior:url(foo)}','@import "https://example.com/style.css"'])assert.throws(()=>create({sections:[{id:'s',html:'<section>Hello</section>',css:unsafe}]}),/unsafe/i);
 assert.throws(()=>create({sections:[{id:'s',html:'<section>Hello</section>',css:'a'.repeat(1024*1024+1)}]}),/long|limit/i);
 assert.throws(()=>create({sections:[{id:'s',html:'<section>Hello</section>',css:{color:'red'}}]}),/invalid/i);
});
test('five substantial original-template checkpoints fit the bounded restore traversal budget',()=>{
 const starter=createStarter(brief);
 const components=Array.from({length:800},(_,i)=>({tagName:'article',attributes:{id:'card-'+i,class:'service-card'},components:[{type:'text',tagName:'p',content:'Original sample copy '+i}]}));
 const styles=Array.from({length:800},(_,i)=>({selectors:['#card-'+i],style:{color:'#123456',padding:'12px'}}));
 const largeProject={pages:[{id:'home',component:{tagName:'body',components:[{type:'text',content:starter.html},...components]}}],styles:[...styles,{selectors:['body'],style:{'font-family':'Arial,Helvetica,sans-serif'}},{selectors:['.original-template'],style:{'custom-css':starter.css}}]};
 const cp=snapshot(brief,largeProject);assert.equal(validateSnapshot(cp).schema,1);
 const studio=model.createStudio(largeProject,brief,{checkpoints:Array.from({length:5},(_,i)=>({id:'large-'+i,name:'Version '+i,savedAt:cp.savedAt,snapshot:cp}))});
 assert.equal(studio.checkpoints.length,5);assert.equal(validateSnapshot(snapshot(brief,largeProject,studio)).studio.checkpoints.length,5);
 assert.throws(()=>model.assertSafeValue(Array(250001).fill(null)),/complexity/i);
});

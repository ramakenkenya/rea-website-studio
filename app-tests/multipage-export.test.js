import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {createStudio,navigationHtml} from '../src/site-model.js';
import {buildDocument,exportFiles,siteZip} from '../src/export.js';
const brief={name:'Studio',description:'Default description',title:'Studio title'};
const project={pages:[{id:'a',name:'Home',component:{}},{id:'b',name:'About',component:{}}],styles:[]};
const studio=createStudio(project,brief,{homeId:'b',pages:[{id:'a',slug:'welcome',title:'Welcome title'},{id:'b',slug:'about',title:'About title',description:'Our story',noindex:true}],site:{url:'https://example.com/site',language:'fr',direction:'rtl',favicon:'data:image/png;base64,YQ==',socialImage:'https://example.com/og.png'}});
const pages=project.pages.map(p=>({id:p.id,getId(){return this.id},getMainComponent(){return {page:this.id}}}));
const editor={Pages:{getAll:()=>pages,select(){assert.fail('Export must not select pages')}},getHtml:({component}={})=>navigationHtml(studio,component?.page||'a')+`<main id="${component?.page||'a'}">${component?.page||'a'}</main>`,getCss:({component}={})=>`.page-${component?.page||'a'}{color:red}`};
test('multipage export reads each page component and independent style files without selection',()=>{
 const files=exportFiles(editor,brief,studio);assert.ok(files['index.html']);assert.ok(files['welcome.html']);assert.equal(files['styles.css'],'.page-b{color:red}');assert.equal(files['welcome.css'],'.page-a{color:red}');assert.ok(files['studio.css']);
 assert.match(files['index.html'],/id="b"/);assert.match(files['welcome.html'],/id="a"/);assert.match(files['welcome.html'],/href="welcome.css"/);assert.match(files['index.html'],/href="welcome.html"/);
 assert.match(files['index.html'],/<html lang="fr" dir="rtl">/);assert.match(files['index.html'],/<title>About title<\/title>/);assert.match(files['index.html'],/name="robots" content="noindex/);assert.match(files['index.html'],/rel="canonical" href="https:\/\/example.com\/site\/index.html"/);assert.match(files['index.html'],/property="og:image"/);assert.match(files['index.html'],/rel="icon"/);
 assert.match(files['sitemap.xml'],/welcome.html/);assert.doesNotMatch(files['sitemap.xml'],/index.html/);assert.match(files['robots.txt'],/Disallow: \/site\/index.html/);assert.match(files['404.html'],/href="https:\/\/example.com\/site\/index.html"/);assert.match(files['README.txt'],/welcome.html/);
});
test('home and slug changes refresh generated navigation in every page',()=>{
 const changed={...studio,homeId:'a',pages:studio.pages.map(p=>({...p,slug:p.id==='b'?'our-story':p.slug}))};
 const files=exportFiles(editor,brief,changed);assert.ok(files['our-story.html']);assert.match(files['index.html'],/href="our-story.html"/);assert.match(files['our-story.html'],/href="index.html"/);assert.doesNotMatch(files['index.html'],/welcome.html/);
});
test('legacy export retains one page API and no studio stylesheet',()=>{
 const files=exportFiles(editor,brief);assert.deepEqual(Object.keys(files),['index.html','styles.css','README.txt']);assert.doesNotMatch(files['index.html'],/studio.css/);
 assert.match(buildDocument({html:'<h1>Hello</h1>',brief}),/href="styles.css"/);
});
test('ZIP contains all independently linked files and hidden navigation pages',async()=>{
 const hidden={...studio,pages:studio.pages.map(p=>({...p,nav:p.id!=='a'}))};const files=exportFiles(editor,brief,hidden);assert.ok(files['welcome.html']);assert.doesNotMatch(files['index.html'],/>Home<\/a>/);
 const blob=await siteZip(editor,brief,hidden);const zip=await JSZip.loadAsync(await blob.arrayBuffer());assert.deepEqual(Object.keys(zip.files).sort(),Object.keys(files).sort());assert.equal(await zip.file('welcome.css').async('string'),files['welcome.css']);
});
test('exported generated navigation retains component IDs referenced by page CSS',()=>{
 const html='<header id="user-header" class="site-nav"><a id="user-brand" class="site-brand" href="#top">Studio</a><nav id="user-nav"><a id="user-home" href="index.html">Home</a><a id="user-about" href="about.html">About</a></nav></header>';
 const css='#user-nav{gap:37px}#user-brand{font-size:39px}';
 const files=exportFiles({...editor,getHtml:()=>html,getCss:()=>css},brief,studio);
 for(const name of ['index.html','welcome.html']){assert.match(files[name],/id="user-nav"/);assert.match(files[name],/id="user-brand"/);assert.match(files[name],/id="user-about"/);}
 assert.equal(files['styles.css'],css);assert.equal(files['welcome.css'],css);
});
test('404 uses public base URLs for home navigation and styles on nested missing routes',()=>{
 const configured={...studio,site:{...studio.site,url:'https://example.com/site/'}};
 const files=exportFiles(editor,brief,configured),notFound=files['404.html'];
 for(const filename of ['index.html','welcome.html','styles.css','studio.css'])assert.ok(notFound.includes('href="https://example.com/site/'+filename+'"'));
 assert.match(notFound,/href="https:\/\/example.com\/site\/index.html">Return home/);
 assert.match(files['welcome.html'],/href="welcome.css"/);assert.match(files['index.html'],/href="welcome.html"/);
 assert.doesNotMatch(notFound,/rel="canonical"/);
 const noUrl=exportFiles(editor,brief,{...studio,site:{...studio.site,url:''}});
 assert.match(noUrl['404.html'],/href="styles.css"/);assert.match(noUrl['404.html'],/href="index.html">Return home/);
});

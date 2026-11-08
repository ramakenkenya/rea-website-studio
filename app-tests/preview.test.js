import test from 'node:test';
import assert from 'node:assert/strict';
import {previewDocument} from '../src/preview.js';
test('preview runs trusted shop code after the catalog exists and keeps page bridge isolated',()=>{
 const files={'index.html':'<html><head><link rel="stylesheet" href="rea-shop.css"><script src="rea-shop.js" defer></script></head><body><section data-rea-shop="true">Catalog</section></body></html>','rea-shop.js':'window.shopStarted=true;','rea-shop.css':'.rea-shop{color:red}'};
 const html=previewDocument({files,name:'index.html',channel:'nonce',hash:'</script><script>bad()'});
 assert.ok(html.indexOf('window.shopStarted')>html.indexOf('Catalog'));assert.doesNotMatch(html,/src="rea-shop.js"/);assert.match(html,/<style>.rea-shop/);assert.match(html,/postMessage/);assert.doesNotMatch(html,/<script>bad/);
});

test('a separate preview embeds only sandboxed pages and keeps script payloads escaped',async()=>{
 const {previewTabDocument}=await import('../src/preview.js');
 assert.equal(typeof previewTabDocument,'function');
 const files={
  'index.html':'<html><head></head><body><h1>Unsaved draft</h1></body></html>',
  'about.html':'<html><head></head><body><h1>About</h1></body></html>',
  'README.txt':'UNRELATED DOWNLOAD DATA',
 };
 const html=previewTabDocument({files,name:'about.html',channel:'nonce',base:'https://example.com/studio/',hash:'</script><script>bad()'});
 assert.match(html,/<iframe[^>]+sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"/);
 assert.doesNotMatch(html,/allow-same-origin|<script>bad|UNRELATED DOWNLOAD DATA/);
 assert.match(html,/Unsaved draft/);
 assert.match(html,/https:\/\/example\.com\/studio\//);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {previewDocument} from '../src/preview.js';
test('preview runs trusted shop code after the catalog exists and keeps page bridge isolated',()=>{
 const files={'index.html':'<html><head><link rel="stylesheet" href="rea-shop.css"><script src="rea-shop.js" defer></script></head><body><section data-rea-shop="true">Catalog</section></body></html>','rea-shop.js':'window.shopStarted=true;','rea-shop.css':'.rea-shop{color:red}'};
 const html=previewDocument({files,name:'index.html',channel:'nonce',hash:'</script><script>bad()'});
 assert.ok(html.indexOf('window.shopStarted')>html.indexOf('Catalog'));assert.doesNotMatch(html,/src="rea-shop.js"/);assert.match(html,/<style>.rea-shop/);assert.match(html,/postMessage/);assert.doesNotMatch(html,/<script>bad/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {createStudio} from '../src/site-model.js';
const project={pages:[{id:'home',name:'Home'}]};
test('legacy projects receive an empty shop with no recipient',()=>{const s=createStudio(project);assert.deepEqual(s.shop,{phone:'',currency:'KES',delivery:'',products:[]});});
import {normalizeShop,shopSection} from '../src/shop-model.js';
import {shopEngine} from '../src/shop-engine.js';
const product={id:'p1',code:'CUP01',name:'Coffee & cup',price:'10.10',sizes:['Small','Large'],colours:['Black'],available:true};
const raw={phone:'+254 712 345 678',currency:'KES',delivery:'Delivery confirmed in chat',products:[product,{id:'p2',code:'TEA',name:'Tea',price:'0.20'}]};
const E=shopEngine();
test('shop normalizes decimals and international phone, rejects duplicate codes and unsafe photos',()=>{
 const s=normalizeShop(raw);assert.equal(s.phone,'254712345678');assert.equal(s.products[0].priceCents,1010);
 assert.throws(()=>normalizeShop({...raw,products:[product,{...product,id:'p3'}]}),/unique/i);
 for(const image of ['javascript:alert(1)','https://a.test/a','http://example.com/a.jpg'])assert.throws(()=>normalizeShop({...raw,products:[{...product,image}]}),/image/i);
 for(const price of ['1e3','-1','3.999','abc'])assert.throws(()=>normalizeShop({...raw,products:[{...product,price}]}),/price/i);
});
test('cart merges identical variants and keeps other variants separate with exact cents',()=>{
 const s=normalizeShop(raw);let cart=[];
 cart=E.add(s,cart,{id:'p1',size:'Small',colour:'Black',quantity:2});cart=E.add(s,cart,{id:'p1',size:'Small',colour:'Black',quantity:1});
 cart=E.add(s,cart,{id:'p1',size:'Large',colour:'Black',quantity:1});cart=E.add(s,cart,{id:'p2',quantity:3});
 assert.equal(cart.length,3);assert.equal(cart[0].quantity,3);assert.equal(E.summary(s,cart).totalCents,4100);
 assert.throws(()=>E.add(s,cart,{id:'p1',size:'Small',colour:'Black',quantity:99}),/99/);
 assert.throws(()=>E.add(s,cart,{id:'p1',size:'Unknown',colour:'Black',quantity:1}),/size/i);
 assert.throws(()=>E.add(s,cart,{id:'missing',quantity:1}),/available/i);
 assert.throws(()=>E.add(normalizeShop({...raw,products:[{...product,available:false}]}),[],{id:'p1',size:'Small',colour:'Black',quantity:1}),/available/i);
});
test('order handoff encodes the exact recipient and reviewed list, never claims it was sent',()=>{
 const s=normalizeShop(raw),cart=E.add(s,[],{id:'p1',size:'Large',colour:'Black',quantity:2});
 const result=E.order(s,cart,{name:'Anne & José',phone:'+254700000000',method:'Delivery',location:'Main street #2',notes:'Call first & ask'},'Rama Studio');
 const url=new URL(result.url);assert.equal(url.origin,'https://wa.me');assert.equal(url.pathname,'/254712345678');assert.equal(url.searchParams.get('text'),result.message);
 assert.match(result.message,/Coffee & cup/);assert.match(result.message,/Large/);assert.match(result.message,/20.20/);assert.match(result.message,/Anne & José/);assert.match(result.message,/not included/);
 assert.throws(()=>E.order(s,[],{name:'A',phone:'123',method:'Pickup'}),/empty/i);
 assert.throws(()=>E.order(s,cart,{name:'A',phone:'123',method:'Delivery'}),/location/i);
 const noPhone=E.order({...s,phone:''},cart,{name:'A',phone:'123',method:'Pickup'});assert.equal(noPhone.url,'');assert.ok(noPhone.message);
});
test('shop markup escapes product content and contains no executable project scripts',()=>{
 const s=normalizeShop({...raw,products:[{...product,name:'<img src=x>',description:'A "quoted" cup'}]});const html=shopSection(s);
 assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<script'));assert.ok(html.includes('data-rea-shop'));
});

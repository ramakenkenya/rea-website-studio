import test from 'node:test';
import assert from 'node:assert/strict';
const images=await import('../src/images.js').catch(()=>({}));
test('remote image URLs reject executable, local, credentialed and non-HTTPS addresses',()=>{
 assert.equal(typeof images.remoteImageUrl,'function','URL image workflow must exist');
 assert.equal(images.remoteImageUrl('https://upload.wikimedia.org/a.jpg?width=1280'),'https://upload.wikimedia.org/a.jpg?width=1280');
 for(const u of ['data:image/png;base64,YQ==','javascript:alert(1)','http://example.com/a.jpg','https://user:secret@example.com/a.jpg','https://127.0.0.1/a','https://10.0.0.1/a','https://localhost/a','https://[::1]/a'])assert.throws(()=>images.remoteImageUrl(u));
});
test('Commons search results retain only CC0 raster images and preserve source/license credit',()=>{
 assert.equal(typeof images.commonsPhotos,'function','Free-license filtering must exist');
 const photo=(license='CC0',changes={})=>({pageid:123,title:'File:Coffee.jpg',imageinfo:[{url:'https://upload.wikimedia.org/coffee.jpg',thumburl:'https://thumb.wikimedia.org/coffee.jpg',mime:'image/jpeg',descriptionurl:'https://commons.wikimedia.org/wiki/File:Coffee.jpg',extmetadata:{LicenseShortName:{value:license},LicenseUrl:{value:'https://creativecommons.org/publicdomain/zero/1.0/'},Artist:{value:'<a>Photographer</a>'},ImageDescription:{value:'A cup of coffee'},AttributionRequired:{value:'false'},...changes}}]});
 const result=images.commonsPhotos({query:{pages:[photo(),photo('CC BY-SA 4.0'),photo('CC0',{Restrictions:{value:'Non-commercial only'}})]}});
 assert.equal(result.length,1);assert.equal(result[0].license,'CC0');assert.equal(result[0].artist,'Photographer');assert.match(result[0].sourceUrl,/commons.wikimedia.org/);assert.equal(result[0].alt,'A cup of coffee');
});
test('gallery output is responsive, escaped and carries visible source credits',()=>{
 assert.equal(typeof images.gallerySection,'function','Real gallery generation must exist');
 const a={src:'https://example.com/a.jpg',name:'A <photo>',alt:'Coffee & cake',license:'CC0',sourceUrl:'https://commons.wikimedia.org/wiki/File:A.jpg',artist:'Rama'};
 const html=images.gallerySection([a,a],'Our <gallery>');assert.equal((html.match(/<img /g)||[]).length,2);assert.match(html,/loading="lazy"/);assert.match(html,/Our &lt;gallery&gt;/);assert.match(html,/Coffee &amp; cake/);assert.match(html,/CC0/);assert.match(html,/Photo source/);assert.throws(()=>images.gallerySection([]));
});

test('ready photos have verified CC0 records and public image/source URLs',async()=>{
 const {READY_PHOTOS}=await import('../src/ready-photos.js');assert.ok(READY_PHOTOS.length>=6);
 for(const photo of READY_PHOTOS){assert.equal(photo.license,'CC0');assert.match(photo.sourceUrl,/^https:\/\/commons.wikimedia.org\//);assert.ok(images.remoteImageUrl(photo.src));}
});

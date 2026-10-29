import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import photos from '../docs/example-photos.json' with {type:'json'};
const url=process.env.STUDIO_URL;
assert(url,'STUDIO_URL must be set');
async function check(){
 const response=await fetch(url,{cache:'no-store'});
 assert(response.ok,`Site returned ${response.status}`);
 const html=await response.text();
 assert(!html.includes('/src/main.js'),'Source HTML was published instead of the production build');
 const assets=[...html.matchAll(/(?:src|href)="([^"?#]+\.(?:js|css))"/g)].map(match=>match[1]);
 assert(assets.some(asset=>asset.includes('assets/')&&asset.endsWith('.js')),'Missing bundled application');
 for(const asset of assets){
  const resource=await fetch(new URL(asset,url),{cache:'no-store'});
  assert(resource.ok,`${asset} returned ${resource.status}`);
  assert(/javascript|text\/css/.test(resource.headers.get('content-type')||''),`${asset} returned an unexpected content type`);
 }
 const downloads=['templates/Rama_Living_Completed_Example.docx','templates/Rama_Living_Completed_Example.pdf','templates/Rama_Living_Completed_Examples.zip',...photos.map(p=>'example-photos/'+p.file)];
 for(const path of downloads){
  const resource=await fetch(new URL(path,url),{cache:'no-store'});
  assert(resource.ok,`${path} returned ${resource.status}`);
  const published=new Uint8Array(await resource.arrayBuffer());
  const expected=await readFile(new URL('../public/'+path,import.meta.url));
  const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
  assert.equal(hash(published),hash(expected),`${path} does not match the tested download`);
 }
 console.log(`Verified production HTML, ${assets.length} bundled assets and ${downloads.length} photo/example files at ${url}`);
}
for(let attempt=1;;attempt++){
 try{await check();break;}catch(error){
  if(attempt===12)throw error;
  console.log(`Waiting for Pages to serve the tested build (${attempt}/12): ${error.message}`);
  await new Promise(resolve=>setTimeout(resolve,10000));
 }
}

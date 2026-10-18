import assert from 'node:assert/strict';
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
 console.log(`Verified production HTML and ${assets.length} bundled assets at ${url}`);
}
for(let attempt=1;;attempt++){
 try{await check();break;}catch(error){
  if(attempt===12)throw error;
  console.log(`Waiting for Pages to serve the tested build (${attempt}/12): ${error.message}`);
  await new Promise(resolve=>setTimeout(resolve,10000));
 }
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {waitForLegacyPages} from '../scripts/wait-for-legacy-pages.mjs';
const legacy=status=>({name:'pages build and deployment',head_branch:'main',status});
test('publishing waits for an active legacy deployment to finish',async()=>{
 let checks=0,pauses=0;
 await waitForLegacyPages({listRuns:async()=>[legacy(++checks===1?'in_progress':'completed')],pause:async()=>{pauses++;}});
 assert.equal(checks,2);assert.equal(pauses,1);
});
test('publishing fails closed if the legacy deployment never finishes',async()=>{
 await assert.rejects(waitForLegacyPages({listRuns:async()=>[legacy('queued')],pause:async()=>{},attempts:2}),/refusing to race/);
});
test('Actions-only publishing proceeds without waiting for its own run',async()=>{
 await waitForLegacyPages({listRuns:async()=>[{name:'Studio - test, record and deploy',head_branch:'main',status:'in_progress'}],pause:async()=>assert.fail('No legacy run to wait for')});
});

test('branch publishing waits for the current push even if its run registers late',async()=>{
 let checks=0;
 await waitForLegacyPages({headSha:'current',requiresLegacy:true,listRuns:async()=>++checks===1?[]:[{...legacy('completed'),head_sha:'current'}],pause:async()=>{}});
 assert.equal(checks,2);
});

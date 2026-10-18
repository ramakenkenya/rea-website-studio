import {pathToFileURL} from 'node:url';
export async function waitForLegacyPages({listRuns,pause=ms=>new Promise(resolve=>setTimeout(resolve,ms)),attempts=60,headSha,requiresLegacy=false}){
 for(let attempt=0;attempt<attempts;attempt++){
  const runs=await listRuns();
  const pending=runs.filter(run=>run.name==='pages build and deployment'&&run.head_branch==='main'&&run.status!=='completed');
  const currentFinished=!requiresLegacy||runs.some(run=>run.name==='pages build and deployment'&&run.head_branch==='main'&&run.head_sha===headSha&&run.status==='completed');
  if(!pending.length&&currentFinished)return;
  if(attempt===attempts-1)throw new Error('Legacy Pages publisher did not finish; refusing to race its deployment.');
  console.log('Waiting for the current branch publisher and any earlier active Pages runs before publishing the compiled app.');
  await pause(10000);
 }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const {GITHUB_REPOSITORY,GITHUB_TOKEN,GITHUB_SHA}=process.env;
 async function getJson(path){
  const response=await fetch(`https://api.github.com/repos/${GITHUB_REPOSITORY}/${path}`,{headers:{Authorization:`Bearer ${GITHUB_TOKEN}`,Accept:'application/vnd.github+json'}});
  if(!response.ok)throw new Error(`Could not check Pages publishers: ${response.status}`);
  return response.json();
 }
 const pages=await getJson('pages');
 await waitForLegacyPages({headSha:GITHUB_SHA,requiresLegacy:pages.build_type!=='workflow',listRuns:async()=>(await getJson('actions/runs?per_page=100')).workflow_runs});
}

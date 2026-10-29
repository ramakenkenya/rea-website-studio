import {escapeHtml as e} from './project.js';
import {reviewDocument} from './document-model.js';
import {documentSite} from './document-site.js';
import './brief-import.css';
export function mountBriefImport({dialog,form,backup,needsReplacement,apply,onImported}){
 let mode='manual',raw=null,request=0,busy=false,manualSubmit='',manualDetailsHidden=true;
 const $=s=>dialog.querySelector(s);
 const block=document.createElement('div');block.className='brief-import';block.innerHTML=`<div class="brief-source-options" aria-label="Start your website"><button type="button" class="brief-source" data-brief-source="manual" aria-label="Fill in manually" aria-pressed="true"><strong>Fill in manually</strong><span>Start with a short business brief.</span></button><button type="button" class="brief-source" data-brief-source="upload" aria-label="Upload completed template" aria-pressed="false"><strong>Upload completed template</strong><span>Create pages and products from your document.</span></button></div><section id="document-import-pane" hidden aria-label="Document import"><label class="field">Website template document<input id="document-import-file" type="file" accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"/></label><p class="import-help">Use a completed Rama Studio Word template or our filled PDF. Maximum 5 MB. Documents are read on your device. Scans and flattened PDFs are not supported.</p><div class="import-template-links"><a href="./templates/Rama_Studio_Website_Template_v1.docx" download>Word template</a><a href="./templates/Rama_Studio_Website_Template_v1.pdf" download>Fillable PDF</a><a href="./templates/Rama_Studio_Website_Templates_v1.zip" download>Download both</a></div><details class="import-examples"><summary>Try a completed example</summary><a href="./templates/Rama_Living_Completed_Example.docx" download>Rama Living Word example</a><a href="./templates/Rama_Living_Completed_Example.pdf" download>Rama Living PDF example</a></details><p id="document-import-message" role="status" aria-live="polite"></p><div id="document-import-summary" hidden></div><ul id="document-import-issues" class="import-issues" role="alert"></ul><ul id="document-import-warnings" class="import-warnings"></ul><div id="document-import-replace" hidden><p>This document will replace the open website. Download a backup if you want a separate copy.</p><button type="button" class="btn" id="document-import-backup">Download current project backup</button><label class="import-replace-choice"><input type="checkbox" id="document-import-consent"/>Replace the open website with this document</label></div><p class="import-help">Review or complete the business details below. Your edits take precedence over the document.</p></section>`;
 $('.dialog-body').prepend(block);
 const submit=$('#brief-submit'),details=$('#brief-details');
 const values=()=>Object.fromEntries(new FormData(form));
 function review(){
  if(mode!=='upload')return;
  const r=raw?reviewDocument(raw,values()):null;
  $('#document-import-summary').hidden=!r;
  if(r){const d=r.draft,n=d.pages.length,p=d.shop.products.length;$('#document-import-summary').innerHTML=`<strong>${n} ${n===1?'page':'pages'} · ${p} ${p===1?'product':'products'}</strong><span>${e(d.pages.map(p=>p.name).join(' · '))}</span><small>Page content, section order and product settings will be imported.</small>`;}
  $('#document-import-issues').innerHTML=(r?.issues||[]).map(t=>`<li>${e(t)}</li>`).join('');
  $('#document-import-warnings').innerHTML=(r?.warnings||[]).map(t=>`<li>${e(t)}</li>`).join('');
  const replace=!!r&&needsReplacement();$('#document-import-replace').hidden=!replace;
  submit.disabled=busy||!r?.ok||replace&&!$('#document-import-consent').checked;
 }
 function select(next){
  if(busy)return;
  mode=next;block.querySelectorAll('[data-brief-source]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.briefSource===mode)));
  $('#document-import-pane').hidden=mode!=='upload';
  if(mode==='upload'){submit.textContent='Create website from document';details.classList.add('hide');review();}
  else{request++;submit.innerHTML=manualSubmit;submit.disabled=false;details.classList.toggle('hide',manualDetailsHidden);}
 }
 block.querySelectorAll('[data-brief-source]').forEach(b=>b.onclick=()=>select(b.dataset.briefSource));
 $('#document-import-backup').onclick=backup;
 $('#document-import-consent').onchange=review;
 form.addEventListener('input',()=>{try{review();}catch(err){$('#document-import-message').textContent=err.message;submit.disabled=true;}});
 $('#document-import-file').onchange=async event=>{
  const file=event.target.files[0];if(!file)return;const token=++request;raw=null;$('#document-import-consent').checked=false;
  $('#document-import-message').textContent='Reading document…';submit.disabled=true;review();
  try{
   if(file.size>5*1024*1024)throw Error('Choose a document under 5 MB.');
   const {readWebsiteDocument}=await import('./document-reader.js');const data=await readWebsiteDocument(new Uint8Array(await file.arrayBuffer()),file.name);
   if(token!==request||!dialog.open||mode!=='upload')return;
   raw=data;
   const b=reviewDocument(raw).draft.brief;
   for(const key of ['name','description','services','email','title','theme','cta'])if(form.elements[key])form.elements[key].value=b[key]||'';
   $('#document-import-message').textContent=file.name+' is ready to review.';review();
  }catch(err){if(token!==request||!dialog.open)return;raw=null;$('#document-import-message').textContent=err.message;review();}
  finally{event.target.value='';}
 };
 dialog.addEventListener('close',()=>{request++;raw=null;busy=false;});
 return {
  active:()=>mode==='upload',
  reset(){request++;raw=null;busy=false;manualSubmit=submit.innerHTML;manualDetailsHidden=details.classList.contains('hide');$('#document-import-message').textContent='';$('#document-import-consent').checked=false;select('manual');},
  async create(){
   if(busy||!raw)return;
   const r=reviewDocument(raw,values());if(!r.ok){review();return;}
   if(needsReplacement()&&!$('#document-import-consent').checked){review();return;}
   busy=true;submit.disabled=true;$('#document-import-message').textContent='Creating your website…';
   try{const next=documentSite(r.draft);await apply(next);onImported();dialog.close();}
   catch(err){$('#document-import-message').textContent='Could not create the website. '+err.message;}
   finally{busy=false;review();}
  }
 };
}

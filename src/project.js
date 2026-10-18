import {createStudio,assertSafeValue} from './site-model.js';
export const STORAGE_KEY='rea-studio.project.v1';
export const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function normalizeBrief(input={}){
 const brief={};
 for(const key of ['name','description','services','email','title','cta','theme']) brief[key]=String(input[key]??'').trim().slice(0,key==='description'?320:180);
 if(!brief.name)throw new Error('Enter a business name.');
 if(brief.email&&!/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(brief.email))throw new Error('Enter a valid contact email.');
 brief.title ||= brief.name;brief.cta ||= 'Let’s talk';brief.theme=['editorial','coastal','midnight'].includes(brief.theme)?brief.theme:'editorial';
 return brief;
}
export function snapshot(brief,project,studio){const normalized=normalizeBrief(brief);return {schema:studio===undefined?1:2,app:'REA Studio',savedAt:new Date().toISOString(),brief:normalized,project,...(studio===undefined?{}:{studio:createStudio(project,normalized,studio)})};}
export function validateSnapshot(data){
 if(![1,2].includes(data?.schema)||data.app!=='REA Studio'||!Array.isArray(data.project?.pages)||!Array.isArray(data.project?.styles))throw new Error('Unsupported project file. Choose a REA Studio project backup.');
 const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
 if(!data.project.pages.length)throw new Error('Project must contain a page.');
 for(const page of data.project.pages){
  if(!object(page))throw new Error('Invalid project page.');
  if('frames' in page){
   if(!Array.isArray(page.frames)||!page.frames.length||page.frames.some(frame=>!object(frame)||!object(frame.component)))throw new Error('Invalid project frame or component.');
  }else if(!object(page.component))throw new Error('Invalid project component.');
 }
 assertSafeValue(data.project);
 const brief=normalizeBrief(data.brief);
 if(data.schema===2){if(!object(data.studio))throw new Error('Invalid studio metadata.');assertSafeValue(data.studio);return {...data,brief,studio:createStudio(data.project,brief,data.studio)};}
 return {...data,brief};
}
export function writeSaved(storage,data){try{storage.setItem(STORAGE_KEY,JSON.stringify(data));return {ok:true};}catch{return {ok:false,error:'Could not save on this device. Download a project backup to keep your work.'};}}
export function readSaved(storage){try{const raw=storage.getItem(STORAGE_KEY);return {ok:true,data:raw?validateSnapshot(JSON.parse(raw)):null};}catch{return {ok:false,error:'The saved project could not be opened. You can restore a project backup.'};}}
export const fileSlug=name=>name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'my-website';
export const MAX_BACKUP_BYTES=32*1024*1024;
export function serializeBackup(data){const text=JSON.stringify(data,null,2);if(new TextEncoder().encode(text).length>MAX_BACKUP_BYTES)throw new Error('This project is too large for a 32 MB backup. Reduce the number or size of images.');return text;}

// Upgrade the original bundled sample while preserving its canvas edits.
export function migrateBundledSample(data){
 const valid=validateSnapshot(data);
 const previousName=String.fromCharCode(77,97,108,97,98,97)+' Studio';
 if(valid.brief.name!==previousName)return valid;
 const replace=value=>{
  if(typeof value==='string')return value.replaceAll(previousName,'Rama Studio');
  if(Array.isArray(value))return value.map(replace);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,child])=>[key,replace(child)]));
  return value;
 };
 return validateSnapshot({...valid,brief:replace(valid.brief),project:replace(valid.project)});
}

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
export function snapshot(brief,project){return {schema:1,app:'REA Studio',savedAt:new Date().toISOString(),brief:normalizeBrief(brief),project};}
export function validateSnapshot(data){
 if(data?.schema!==1||data.app!=='REA Studio'||!Array.isArray(data.project?.pages)||!Array.isArray(data.project?.styles))throw new Error('Unsupported project file. Choose a REA Studio project backup.');
 const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
 if(!data.project.pages.length)throw new Error('Project must contain a page.');
 for(const page of data.project.pages){
  if(!object(page))throw new Error('Invalid project page.');
  if('frames' in page){
   if(!Array.isArray(page.frames)||!page.frames.length||page.frames.some(frame=>!object(frame)||!object(frame.component)))throw new Error('Invalid project frame or component.');
  }else if(!object(page.component))throw new Error('Invalid project component.');
 }
 let count=0;
 function inspect(value,depth=0){
  if(depth>80||++count>25000)throw new Error('Unsupported project complexity.');
  if(typeof value==='string'&&/(?:javascript|vbscript):|data:text\/html/i.test(value.replace(/[\u0000-\u0020\u007f-\u009f]/g,'')))throw new Error('Unsafe URL in project file.');
  if(typeof value==='string'&&/(<\s*(script|iframe|object|embed|meta|link)\b|\bon[a-z]+\s*=|javascript\s*:|vbscript\s*:|data\s*:\s*text\/html|expression\s*\()/i.test(value))throw new Error('Unsafe content in project file.');
  if(value&&typeof value==='object')for(const [key,child] of Object.entries(value)){
   if(['__proto__','prototype','constructor'].includes(key)||(/^script(?:-|$)/i.test(key)&&child)||(/^on[a-z]+$/i.test(key))||key==='tagName'&&/^(script|iframe|object|embed|meta|link)$/i.test(child))throw new Error('Unsafe component in project file.');
   inspect(child,depth+1);
  }
 }
 inspect(data.project);return {...data,brief:normalizeBrief(data.brief)};
}
export function writeSaved(storage,data){try{storage.setItem(STORAGE_KEY,JSON.stringify(data));return {ok:true};}catch{return {ok:false,error:'Could not save on this device. Download a project backup to keep your work.'};}}
export function readSaved(storage){try{const raw=storage.getItem(STORAGE_KEY);return {ok:true,data:raw?validateSnapshot(JSON.parse(raw)):null};}catch{return {ok:false,error:'The saved project could not be opened. You can restore a project backup.'};}}
export const fileSlug=name=>name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'my-website';
export const MAX_BACKUP_BYTES=32*1024*1024;
export function serializeBackup(data){const text=JSON.stringify(data,null,2);if(new TextEncoder().encode(text).length>MAX_BACKUP_BYTES)throw new Error('This project is too large for a 32 MB backup. Reduce the number or size of images.');return text;}

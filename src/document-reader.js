import JSZip from 'jszip';
import {DOMParser} from '@xmldom/xmldom';
import {PDFDocument,PDFTextField} from 'pdf-lib';
import spec from '../docs/website-template-fields.json' with {type:'json'};
export const MAX_DOCUMENT_BYTES=5*1024*1024;
const W='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const known=new Map(spec.fields.map(f=>[f.key,f]));
const recordStart={page:'page.id',section:'section.page',product:'product.page',gallery:'gallery.section',faq:'faq.section'};
const clean=v=>String(v??'').trim().replace(/^\[Your answer\]$/i,'');
function assemble(entries,source){
 const result={fields:{},records:{page:[],section:[],product:[],gallery:[],faq:[]},source};
 const current={};let recognized=0;
 for(const [key,input] of entries){
  if(!known.has(key))continue;recognized++;
  const value=clean(input);if(value.length>12000)throw Error('A document field is too long. Use at most 12000 characters per field.');
  const group=key.split('.')[0];
  if(recordStart[group]){
   if(key===recordStart[group]||!current[group]){current[group]={};result.records[group].push(current[group]);}
   if(Object.hasOwn(current[group],key))throw Error('Duplicate field in a record: '+known.get(key).label);
   current[group][key]=value;
  }else{
   if(Object.hasOwn(result.fields,key)&&value&&result.fields[key]!==value)throw Error('Duplicate business or site field: '+known.get(key).label);
   result.fields[key]=value;
  }
 }
 if(recognized<4)throw Error('Choose a completed Rama Studio template. This document has no recognised template fields.');
 for(const group of Object.keys(result.records))result.records[group]=result.records[group].filter(r=>Object.values(r).some(Boolean));
 return result;
}
function wordEntries(xml){
 if(/<!DOCTYPE|<!ENTITY/i.test(xml))throw Error('Unsafe XML declarations in document.');
 let malformed=false;
 const doc=new DOMParser({onError:()=>{malformed=true;}}).parseFromString(xml,'application/xml');
 if(malformed||!doc.getElementsByTagNameNS(W,'body').length)throw Error('Choose a valid Word template. Its XML could not be read.');
 const all=[...doc.getElementsByTagNameNS(W,'p')];const entries=[];
 const hasControls=doc.getElementsByTagNameNS(W,'tag').length>0;
 const headings={'Website content template':1,'Appearance and pages':2,'Page content':3,'Section content':4,'Product record':5,'Photos and questions':6,'Contact and final checks':7};
 let group=1;
 const text=node=>{
  const visit=n=>n.nodeType===3?n.nodeValue:n.nodeType===1&&['br','cr'].includes(n.localName)?'\n':n.nodeType===1&&n.localName==='tab'?'\t':[...n.childNodes].map(visit).join('');
  return visit(node).trim();
 };
 for(let i=0;i<all.length;i++){
  const p=all[i];if(p.parentNode?.localName==='sdtContent')continue;
  const tags=[...p.getElementsByTagNameNS(W,'tag')];
  if(tags.length){for(const tag of tags){const key=tag.getAttributeNS(W,'val');let control=tag.parentNode;while(control&&control.localName!=='sdt')control=control.parentNode;const content=control?.getElementsByTagNameNS(W,'sdtContent')[0];if(content)entries.push([key,text(content)]);}continue;}
  if(hasControls)continue;
  const value=text(p);if(headings[value]){group=headings[value];continue;}
  const field=spec.fields.find(f=>f.page===group&&f.label===value)||spec.fields.find(f=>f.page<=2&&f.label===value);
  if(field){const next=all[++i];if(!next)throw Error('Missing answer after '+field.label);entries.push([field.key,text(next)]);}
 }
 return entries;
}
export async function readWebsiteDocument(input,filename){
 const bytes=input instanceof Uint8Array?input:new Uint8Array(input);
 if(!bytes.length)throw Error('Choose a completed document. This file is empty.');
 if(bytes.byteLength>MAX_DOCUMENT_BYTES)throw Error('Choose a document under 5 MB.');
 const format=String(filename).split('.').pop().toLowerCase();
 if(!['docx','pdf'].includes(format))throw Error('Choose a Word .docx document or our filled PDF template.');
 let entries;
 if(format==='docx'){
  let zip;try{zip=await JSZip.loadAsync(bytes);}catch{throw Error('Could not read this file. Choose a valid Word .docx template.');}
  const files=Object.values(zip.files);if(files.length>300)throw Error('This Word file is too complex. Use the website template.');
  const expanded=files.reduce((sum,f)=>sum+(f._data?.uncompressedSize||0),0);
  if(expanded>25*1024*1024)throw Error('Expanded document exceeds 25 MB. Remove embedded images and use image URLs.');
  if(files.some(f=>/vbaProject|activeX|embeddings\//i.test(f.name)))throw Error('Active or embedded document content is not supported. Use a clean template.');
  const file=zip.file('word/document.xml');if(!file)throw Error('This is not a Word website template.');
  const xml=await file.async('string');if(xml.length>2*1024*1024)throw Error('This document has too much text. Use a smaller website brief.');
  try{entries=wordEntries(xml);}catch(e){throw Error('Could not read the Word template. '+e.message);}
 }else{
  let pdf;try{pdf=await PDFDocument.load(bytes,{throwOnInvalidObject:true});}catch{throw Error('Could not read this PDF. Use an unencrypted fillable template.');}
  if(pdf.getPageCount()>30)throw Error('Use a PDF template with at most 30 pages.');
  const form=pdf.getForm();if(form.hasXFA())throw Error('Use our fillable PDF template; XFA forms are not supported.');
  const fields=form.getFields();if(fields.length>150)throw Error('This PDF has too many form fields. Use our template.');
  if(!fields.some(f=>known.has(f.getName())))throw Error('Use our fillable PDF with saved form fields. Scans and flattened PDFs cannot be imported.');
  entries=fields.filter(f=>f instanceof PDFTextField).map(f=>[f.getName(),f.getText()||'']);
 }
 return assemble(entries,{filename:String(filename).slice(0,180),format});
}

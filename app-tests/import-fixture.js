import fs from 'node:fs/promises';
import JSZip from 'jszip';
import {PDFDocument} from 'pdf-lib';
import {DOMParser,XMLSerializer} from '@xmldom/xmldom';
const W='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
export const sampleRaw=()=>({fields:{'business.name':'Rama Living','business.description':'Furniture for everyday life.','business.services':'Living room, Office','brand.colors':'#F6F1E8, #2C2520, #244638','brand.font':'serif','site.home':'home','site.pages':'home | Home | index.html\nshop | Shop | shop.html\nlookbook | Lookbook | lookbook.html\nabout | About & Help | about.html','footer.text':'Made for everyday living.','site.notice':'Fictional showroom. Prices are illustrative.'},records:{
 page:[['home','Make room for everyday living.'],['shop','Choose your next favourite piece.'],['lookbook','See the room before you choose.'],['about','Good furniture should fit your life.']].map(([id,heading])=>({'page.id':id,'page.title':id==='home'?'Rama Living | Furniture':id,'page.hero.id':id+'-hero','page.hero.heading':heading,'page.hero.body':'Considered furniture and useful spaces.','page.hero.button':'Browse furniture | shop.html'})),
 section:[{'section.page':'shop','section.id':'catalogue','section.type':'shop','section.heading':'Our collection'},{'section.page':'lookbook','section.id':'rooms','section.type':'gallery','section.heading':'Room inspiration'},{'section.page':'about','section.id':'help','section.type':'faq','section.heading':'Ordering questions'},{'section.page':'home','section.id':'values','section.type':'services','section.heading':'Choose with purpose','section.items':'Comfort | A place to settle in.\nPracticality | Room for everyday life.'}],
 product:[['RL-SOF-001','Nia Sofa','48000'],['RL-DIN-002','Pamoja Dining Table','32000'],['RL-OFF-003','Kazi Office Desk','18500'],['RL-BED-004','Tulivu Bed','38500'],['RL-STO-005','Nyumba TV Stand','15000'],['RL-STO-006','Soma Bookshelf','8500']].map(([code,name,price])=>({'product.page':'shop','product.code':code,'product.name':name,'product.price':price+' | KES','product.description':'Illustrative furniture for your home.','product.category':'Furniture','product.options':'Size: Standard; Colour: Sand, Charcoal','product.available':'available'})),
 gallery:[{'gallery.section':'rooms','gallery.images':'https://images.example/room.jpg | A comfortable living room | Room to relax','gallery.credits':'https://images.example/room.jpg | Demo Photographer | https://example.com/photo | CC0'}],
 faq:[{'faq.section':'help','faq.items':'Can I pay here? | No payments are taken on this demonstration.\nHow do I order? | Prepare a shopping list.'}]
 },source:{filename:'Rama Living.docx',format:'docx'}});
export async function completedDocx(raw=sampleRaw(),{plain=false}={}){
 const z=await JSZip.loadAsync(await fs.readFile(new URL('../public/templates/Rama_Studio_Website_Template_v1.docx',import.meta.url)));
 const x=new DOMParser().parseFromString(await z.file('word/document.xml').async('string'),'application/xml');
 const body=x.getElementsByTagNameNS(W,'body')[0];while(body.firstChild)body.removeChild(body.firstChild);
 const p=text=>{const a=x.createElementNS(W,'w:p'),r=x.createElementNS(W,'w:r'),t=x.createElementNS(W,'w:t');t.appendChild(x.createTextNode(text));r.appendChild(t);a.appendChild(r);return a;};
 const headings={page:'Page content',section:'Section content',product:'Product record',gallery:'Photos and questions',faq:'Photos and questions'};
 const spec=JSON.parse(await fs.readFile(new URL('../docs/website-template-fields.json',import.meta.url)));
 const add=(key,value)=>{if(plain){body.appendChild(p(spec.fields.find(f=>f.key===key).label));body.appendChild(p(value));return;}
 const a=p(''),control=x.createElementNS(W,'w:sdt'),props=x.createElementNS(W,'w:sdtPr'),tag=x.createElementNS(W,'w:tag'),content=x.createElementNS(W,'w:sdtContent');tag.setAttributeNS(W,'w:val',key);props.appendChild(tag);const answer=p(value);while(answer.firstChild)content.appendChild(answer.firstChild);control.appendChild(props);control.appendChild(content);a.appendChild(control);body.appendChild(a);};
 body.appendChild(p('Website content template'));for(const [key,value] of Object.entries(raw.fields))add(key,value);
 for(const [kind,records] of Object.entries(raw.records))for(const record of records){body.appendChild(p(headings[kind]));for(const [key,value] of Object.entries(record))add(key,value);}
 z.file('word/document.xml',new XMLSerializer().serializeToString(x));return z.generateAsync({type:'uint8array',compression:'DEFLATE'});
}
export async function completedPdf(){
 const d=await PDFDocument.load(await fs.readFile(new URL('../public/templates/Rama_Studio_Website_Template_v1.pdf',import.meta.url)));
 const form=d.getForm();const values={'business.name':'Rama Living PDF','business.description':'Furniture for everyday life.','site.pages':'home | Home | index.html','site.home':'home','page.id':'home','page.hero.id':'welcome','page.hero.heading':'Welcome home','section.page':'home','section.id':'catalogue','section.type':'shop','product.page':'home','product.code':'PDF-001','product.name':'Nia Sofa','product.price':'48000 | KES'};
 for(const [key,value] of Object.entries(values))form.getTextField(key).setText(value);return d.save();
}

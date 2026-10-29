"""Rebuild the matched, photo-backed Word and interactive PDF upload examples.

Input: reviewed docs/rama-living-example.json plus locally hosted CC0 JPEGs.
No network required. Requires python-docx, reportlab and pypdf.
"""
import json
from io import BytesIO
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit, ImageReader
from PIL import Image
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, DictionaryObject, DecodedStreamObject, ArrayObject, FloatObject, NumberObject

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/templates'
STEM='Rama_Living_Completed_Example'
DATA=json.loads((ROOT/'docs/rama-living-example.json').read_text())
FIELDS={f['key']:f for f in json.loads((ROOT/'docs/website-template-fields.json').read_text())['fields']}
PHOTOS=json.loads((ROOT/'docs/example-photos.json').read_text())
INK=HexColor('#243b32'); GRAY=HexColor('#53625a')
pdfmetrics.registerFont(TTFont('ExampleSans','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('ExampleBold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
doc=Document();sec=doc.sections[0]
sec.page_width=Inches(8.5);sec.page_height=Inches(11)
sec.left_margin=sec.right_margin=Inches(.65);sec.top_margin=sec.bottom_margin=Inches(.55)
for name in ['Normal','Title','Heading 1','Heading 2']:
 st=doc.styles[name];st.font.name='Arial';st.font.color.rgb=RGBColor.from_string('243B32')
for st in doc.styles:
 for border in list(st.element.iter(qn('w:pBdr'))):border.getparent().remove(border)
doc.styles['Normal'].font.size=Pt(9)
doc.styles['Normal'].paragraph_format.space_after=Pt(4)
doc.styles['Title'].font.size=Pt(28);doc.styles['Heading 1'].font.size=Pt(20)
c=canvas.Canvas(str(OUT/(STEM+'.pdf')),pagesize=(612,792))
c.setTitle('Rama Living - Completed website example');c.setAuthor('Rama Studio')
page=0;y=0;expected={};appearances=[]

def start(title,subtitle=''):
 global page,y
 if page:c.showPage();doc.add_page_break()
 page+=1;y=690
 c.setFillColor(INK);c.setFont('ExampleSans',8);c.drawString(46,754,'RAMA STUDIO  /  COMPLETED WEBSITE EXAMPLE')
 c.setFont('ExampleBold',23);c.drawString(46,720,title)
 if subtitle:
  c.setFont('ExampleSans',9);c.drawString(46,700,subtitle);y=678
 c.setFont('ExampleSans',8);c.drawString(46,28,'Rama Living  |  Upload in Brief > Upload completed template');c.drawRightString(566,28,str(page))
 doc.add_paragraph(title,'Title' if page==1 else 'Heading 1')
 if subtitle:doc.add_paragraph(subtitle)

def paragraph(text):
 global y
 doc.add_paragraph(text)
 c.setFillColor(INK);c.setFont('ExampleSans',10)
 for line in simpleSplit(text,'ExampleSans',10,520):c.drawString(46,y,line);y-=14
 y-=9

def picture(path,height=170):
 global y
 im=Image.open(path);w,h=im.size;scale=min(520/w,height/h);ww,hh=w*scale,h*scale
 c.drawImage(str(path),46,y-hh,width=ww,height=hh);y-=hh+14
 doc.add_picture(str(path),width=Inches(ww/72))

def field(key,value,index=1):
 global y
 value=str(value);label=FIELDS[key]['label']
 # Field font and height track actual wrapped content, including long URL rows.
 lines=[]
 for row in value.split('\n'):
  # Split long unbroken URLs at the character level; keep canonical form values intact.
  current=''
  for char in row:
   if pdfmetrics.stringWidth(current+char,'ExampleSans',8)>502:lines.append(current);current=''
   current+=char
  lines.append(current)
 height=max(23,len(lines)*10+10)
 if y-height-20<50: start('Continued',label)
 c.setFillColor(INK);c.setFont('ExampleBold',9);c.drawString(46,y,label);y-=height+6
 name=key if index==1 else key+'__'+str(index)
 c.acroForm.textfield(name=name,tooltip=label,value=value,x=46,y=y,width=520,height=height,fontName='Helvetica',fontSize=8,textColor=INK,fillColor=HexColor('#F1F5EF'),borderWidth=.4,borderColor=HexColor('#BBC9BF'),forceBorder=True,fieldFlags='multiline',maxlen=12000)
 expected[name]=value;y-=13
 appearances.append((name,height,lines))
 p=doc.add_paragraph();p.paragraph_format.keep_with_next=True;p.add_run(label).bold=True
 p=doc.add_paragraph();sdt=OxmlElement('w:sdt');pr=OxmlElement('w:sdtPr')
 for tag,val in [('w:alias',label),('w:tag',key)]:
  el=OxmlElement(tag);el.set(qn('w:val'),val);pr.append(el)
 text=OxmlElement('w:text');text.set(qn('w:multiLine'),'1');pr.append(text);sdt.append(pr)
 content=OxmlElement('w:sdtContent')
 for i,line in enumerate(value.split('\n')):
  r=OxmlElement('w:r')
  if i:r.append(OxmlElement('w:br'))
  t=OxmlElement('w:t');t.text=line;r.append(t);content.append(r)
 sdt.append(content);p._p.append(sdt)

start('Rama Living','A complete website from one document')
picture(ROOT/'public/example-photos/living.jpg',240)
paragraph('Download this Word or PDF example, then open Rama Studio > Brief > Upload completed template. Review the details and choose Create website from document.')
paragraph('Both formats create the same four pages: Home, Shop, Lookbook and About & Help. Six example products include photographs, prices and options. The lookbook includes nine credited CC0 photographs.')
paragraph('Photos are embedded here as previews. The website reads the direct HTTPS image links in the fields. Copies are hosted with Rama Studio, so it does not depend on the original photo sites loading.')
paragraph('This is a fictional showroom. Prices are illustrative. Room photographs provide inspiration and do not represent exact products for sale. Keep the PDF interactive when saving: printing to PDF removes its import fields.')
start('Your business','Shared business details, appearance and navigation')
for key,value in DATA['fields'].items():field(key,value)
titles={'page':'Page content','section':'Section content','product':'Product record','gallery':'Photos and questions','faq':'Photos and questions'}
for kind,records in DATA['records'].items():
 for i,record in enumerate(records,1):
  start(titles[kind],record.get('page.id') or record.get('section.id') or record.get('product.name') or record.get('gallery.section') or record.get('faq.section'))
  src=record.get('page.hero.image') or record.get('product.image')
  if src:picture(ROOT/'public/example-photos'/src.split(' | ')[0].split('/')[-1],145)
  for key,value in record.items():field(key,value,i)
start('Photo sources','CC0 1.0 Universal - original creators and source pages')
paragraph('All nine images were checked against the source pages and CC0 licence on 29 October 2026. The two original Wikimedia images are included alongside furniture and room photographs from ISO Republic. Copies were resized and compressed for the example.')
paragraph('Licence: https://creativecommons.org/publicdomain/zero/1.0/\nISO Republic licence: https://isorepublic.com/license/')
for i,p in enumerate(PHOTOS):
 if i and i%3==0:start('Photo sources','Continued')
 picture(ROOT/'public/example-photos'/p['file'],100)
 paragraph(p['alt']+'\n'+p['artist']+' | CC0\n'+p['source'])
c.save();doc.save(OUT/(STEM+'.docx'))
# Embed a real font in every field appearance. Canonical field values remain
# interactive, while PDF viewers do not have to substitute unembedded Helvetica.
buffer=BytesIO();ac=canvas.Canvas(buffer,pagesize=(520,100))
for name,height,lines in appearances:
 ac.setPageSize((520,height));ac.setFillColor(INK);ac.setFont('ExampleSans',8)
 for i,line in enumerate(lines):ac.drawString(8,height-12-i*10,line)
 ac.showPage()
ac.save();appearance_reader=PdfReader(buffer)
writer=PdfWriter();writer.clone_document_from_reader(PdfReader(OUT/(STEM+'.pdf')))
widgets={a.get_object()['/T']:a.get_object() for p in writer.pages for a in p.get('/Annots',[]) if a.get_object().get('/Subtype')=='/Widget'}
for (name,height,lines),p in zip(appearances,appearance_reader.pages):
 stream=DecodedStreamObject();stream.set_data(p.get_contents().get_data())
 stream.update({NameObject('/Type'):NameObject('/XObject'),NameObject('/Subtype'):NameObject('/Form'),NameObject('/FormType'):NumberObject(1),NameObject('/BBox'):ArrayObject([FloatObject(v) for v in [0,0,520,height]]),NameObject('/Resources'):p['/Resources'].clone(writer)})
 widgets[name][NameObject('/AP')]=DictionaryObject({NameObject('/N'):writer._add_object(stream)})
writer.write(OUT/(STEM+'.pdf'))
reader=PdfReader(OUT/(STEM+'.pdf'));fields=reader.get_fields()
assert len(reader.pages)<=30 and len(fields)<=150,(len(reader.pages),len(fields))
assert all(fields[k].get('/V')==v for k,v in expected.items())
assert all(a.get_object().get('/AP',{}).get('/N') for p in reader.pages for a in p.get('/Annots',[]) if a.get_object().get('/Subtype')=='/Widget')
with ZipFile(OUT/'Rama_Living_Completed_Examples.zip','w',ZIP_DEFLATED) as z:
 for ext in ['docx','pdf']:z.write(OUT/(STEM+'.'+ext),STEM+'.'+ext)
credits='RAMA LIVING EXAMPLE PHOTOS\n\nAll photographs: CC0 1.0 Universal. Checked 2026-10-29. Resized/compressed copies.\nRoom inspiration only; fictional products.\n\n'
credits+='\n\n'.join(p['file']+'\nCreator: '+p['artist']+'\nSource: '+p['source']+'\nOriginal download: '+p['download']+'\nLicense: '+p['licenseUrl'] for p in PHOTOS)
(ROOT/'public/example-photos/CREDITS.txt').write_text(credits+'\n')
print(f'Created matching examples: {len(reader.pages)} PDF pages; {len(fields)} interactive fields.')

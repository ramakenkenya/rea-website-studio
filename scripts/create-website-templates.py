"""Build matching editable DOCX and fillable PDF website briefs.

Run with python-docx, reportlab and pypdf installed. No website runtime dependency.
The field manifest is the draft contract for the future document importer.
"""
from pathlib import Path
import json
from zipfile import ZipFile, ZIP_DEFLATED
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, black
from reportlab.lib.utils import simpleSplit

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/templates'
NAME = 'Rama_Studio_Website_Template_v1'

# key, visible label, example or guidance, PDF response height
PAGES = [
 ('Your business', 'Start here', [
  ('business.name', 'Business name', 'Example: Rama Living', 25),
  ('business.description', 'What your business does', 'Describe your offer and who it helps in two or three sentences.', 54),
  ('business.audience', 'Who the website is for', 'Example: People furnishing their first home.', 36),
  ('business.goal', 'Main website goal', 'Example: Browse products and prepare a WhatsApp shopping list.', 36),
  ('business.services', 'Services or categories', 'Separate entries with commas. Example: Living room, Dining, Office', 25),
  ('business.email', 'Public email', 'Only include an address you want visitors to see.', 25),
  ('business.phone', 'Public phone or WhatsApp number', 'Include country code. Example: +2547XXXXXXXX', 25),
 ]),
 ('Appearance and pages', 'Set the direction', [
  ('brand.style', 'Visual style', 'Choose: editorial, coastal or midnight. Leave blank for editorial.', 25),
  ('brand.colors', 'Brand colours', 'Optional hex colours for background, text and buttons. Example: #F6F1E8', 25),
  ('brand.font', 'Font direction', 'Choose: serif, sans, modern or mono. Leave blank for serif.', 25),
  ('brand.logo', 'Logo image URL', 'Optional public HTTPS image address. A text business name is fine.', 25),
  ('site.language', 'Website language and direction', 'Example: English, left to right', 25),
  ('site.pages', 'Pages in navigation order', 'One per line: page ID | navigation name | address. Example: home | Home | index.html', 80),
  ('site.home', 'Home page ID', 'Use an ID from the list above. Example: home', 25),
  ('site.description', 'Website summary', 'A short description for search and sharing.', 36),
 ]),
 ('Page content', 'Repeat this record for each page', [
  ('page.id', 'Page ID', 'Match a page ID from your navigation list. Example: home', 25),
  ('page.title', 'Page title for search', 'Example: Rama Living | Furniture for Everyday Life', 25),
  ('page.description', 'Page description for search', 'Explain what visitors can find on this page.', 36),
  ('page.sections', 'Sections in display order', 'List section IDs. Example: home-hero, home-services, home-faq', 25),
  ('page.hero.id', 'Hero section ID', 'Example: home-hero', 25),
  ('page.hero.heading', 'Hero heading', 'Example: Make room for everyday living.', 25),
  ('page.hero.body', 'Hero paragraph', 'Write the exact introduction visitors should read.', 54),
  ('page.hero.button', 'Hero button text and destination', 'Example: Explore the collection | shop.html', 25),
  ('page.hero.image', 'Hero image URL and description', 'Optional HTTPS image URL | alternative text describing the image', 36),
 ]),
 ('Section content', 'Repeat this record for each additional section', [
  ('section.page', 'Page ID', 'Which page contains this section? Example: home', 25),
  ('section.id', 'Section ID', 'Unique within the website. Example: home-services', 25),
  ('section.type', 'Section type', 'Choose: text, services, gallery, faq, shop, pricing, team, statistics, hours, contact or cta.', 25),
  ('section.heading', 'Section heading', 'Write the exact heading visitors should see.', 25),
  ('section.body', 'Section text', 'Write the final copy. Use short paragraphs.', 90),
  ('section.items', 'Cards or repeated items', 'One per line: title | description | optional price or value | optional destination', 80),
  ('section.button', 'Section button text and destination', 'Optional. Example: Browse furniture | shop.html', 25),
 ]),
 ('Product record', 'Optional for shops', [
  ('product.page', 'Shop page ID', 'Example: shop. Repeat this record for every product.', 25),
  ('product.code', 'Product code', 'A unique code. Example: RL-SOF-001', 25),
  ('product.name', 'Product name', 'Example: Nia Sofa', 25),
  ('product.category', 'Category', 'Example: Living room', 25),
  ('product.description', 'Product description', 'Describe the product and what is included.', 54),
  ('product.price', 'Price and currency', 'Numbers without thousands separators. Example: 48000 | KES', 25),
  ('product.options', 'Size and colour options', 'Example: Size: Three-seater; Colour: Sand, Charcoal, Olive', 36),
  ('product.available', 'Availability', 'Choose: available or unavailable.', 25),
  ('product.image', 'Product image URL and description', 'Public HTTPS image URL | alternative text', 36),
 ]),
 ('Photos and questions', 'Optional records to repeat as needed', [
  ('gallery.section', 'Gallery section ID', 'Match a gallery section listed on a page. Example: room-gallery', 25),
  ('gallery.images', 'Gallery photos', 'One per line: HTTPS image URL | alternative text | optional caption', 90),
  ('gallery.credits', 'Photo credits and licence information', 'One per line: image URL | creator | source page URL | licence', 72),
  ('faq.section', 'FAQ section ID', 'Match a faq section listed on a page. Example: home-faq', 25),
  ('faq.items', 'Questions and answers', 'One per line: question | answer. Use the final wording.', 130),
 ]),
 ('Contact and final checks', 'Finish your website brief', [
  ('contact.address', 'Public location or service area', 'Optional. Do not include a private home address.', 36),
  ('contact.hours', 'Opening hours', 'One per line: day or day range | hours', 54),
  ('contact.socials', 'Public social links', 'One per line: platform name | HTTPS profile URL', 54),
  ('footer.text', 'Footer text', 'Example: Rama Living. Furniture for everyday life.', 36),
  ('site.notice', 'Business or demonstration notice', 'Optional. Example: Fictional showroom. Products and prices are illustrative.', 54),
  ('site.notes', 'Additional content notes', 'Optional notes for a person reviewing the brief. These are not public page copy.', 54),
 ])
]
INTRO = [
 'Fill in this brief to plan your website. Keep the labels and template version unchanged. Examples are guidance only; enter your own answers in the response areas.',
 'Word: replace each [Your answer] entry. Copy the full Page content and Section content records for more pages or sections. Copy optional product and photo records as needed.',
 'PDF: type into the shaded fields and save a copy, or print and write. This PDF contains one of each record; use Word when you need additional records or more writing space.',
 'Use stable IDs such as home and home-hero to connect pages and sections. Leave optional fields empty. Only include images you have permission to publish.',
 'Document upload is not available yet. These templates prepare your content for the planned feature. Do not put passwords, payment details or private customer data in this brief.'
]

def run():
 OUT.mkdir(parents=True, exist_ok=True)
 doc = Document()
 sec = doc.sections[0]
 sec.page_width, sec.page_height = Inches(8.5), Inches(11)
 sec.top_margin, sec.bottom_margin = Inches(.65), Inches(.6)
 sec.left_margin = sec.right_margin = Inches(.75)
 for name in ['Normal', 'Title', 'Heading 1', 'Heading 2']:
  st=doc.styles[name]; st.font.name='Arial'; st.font.color.rgb=RGBColor(0,0,0)
 for st in doc.styles:
  for border in list(st.element.iter(qn('w:pBdr'))): border.getparent().remove(border)
 doc.styles['Normal'].font.size=Pt(10)
 doc.styles['Normal'].paragraph_format.space_after=Pt(5)
 doc.styles['Title'].font.size=Pt(24)
 doc.styles['Heading 1'].font.size=Pt(21)
 header=sec.header.paragraphs[0]; header.text='RAMA STUDIO   /   WEBSITE CONTENT TEMPLATE'
 header.runs[0].font.size=Pt(8)
 footer=sec.footer.paragraphs[0]; footer.text='Template version 1.0   |   Keep field labels unchanged   |   '
 fld=OxmlElement('w:fldSimple'); fld.set(qn('w:instr'),'PAGE'); footer._p.append(fld)
 footer.runs[0].font.size=Pt(8)
 pdfmetrics.registerFont(TTFont('TemplateSans', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
 pdfmetrics.registerFont(TTFont('TemplateSans-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
 c=canvas.Canvas(str(OUT/(NAME+'.pdf')),pagesize=(612,792))
 c.setTitle('Rama Studio Website Content Template'); c.setAuthor('Rama Studio')
 form=c.acroForm
 manifest=[]
 for i,(title,sub,fields) in enumerate(PAGES):
  if i: doc.add_page_break()
  doc.add_paragraph('Website content template' if i==0 else title, 'Title' if i==0 else 'Heading 1')
  doc.add_paragraph(('Your business  /  ' if i==0 else '')+sub)
  c.setFillColor(black); c.setFont('TemplateSans',8)
  c.drawString(54,756,'RAMA STUDIO   /   WEBSITE CONTENT TEMPLATE')
  c.setFont('TemplateSans-Bold',23); c.drawString(54,720,'Website content template' if i==0 else title)
  c.setFont('TemplateSans',10); c.drawString(54,697,('Your business  /  ' if i==0 else '')+sub)
  y=674
  if i==0:
   # Full instructions in Word and a compact PDF introduction fit above the fields.
   intro='Keep labels unchanged. Replace examples with your own details. Upload is coming next. Read the use instructions on the final page.'
   p=doc.add_paragraph(intro); p.runs[0].font.size=Pt(9)
   for line in simpleSplit(intro,'TemplateSans',9,504):
    c.setFont('TemplateSans',9); c.drawString(54,y,line); y-=12
   y-=7
  for key,label,hint,height in fields:
   manifest.append({'key':key,'label':label,'page':i+1,'guidance':hint,'multiline':height>25})
   p=doc.add_paragraph(); p.paragraph_format.keep_with_next=True
   r=p.add_run(label); r.bold=True
   p=doc.add_paragraph(hint); p.paragraph_format.keep_with_next=True
   p.runs[0].font.size=Pt(8); p.runs[0].font.color.rgb=RGBColor.from_string('555555')
   # Tagged Word content controls retain a stable key for future import.
   p=doc.add_paragraph(); p.paragraph_format.space_after=Pt(7)
   sdt=OxmlElement('w:sdt'); props=OxmlElement('w:sdtPr')
   for tag,val in [('w:alias',label),('w:tag',key)]:
    el=OxmlElement(tag); el.set(qn('w:val'),val); props.append(el)
   text_props=OxmlElement('w:text'); text_props.set(qn('w:multiLine'), '1'); props.append(text_props); sdt.append(props)
   content=OxmlElement('w:sdtContent'); run=OxmlElement('w:r'); t=OxmlElement('w:t'); t.text='[Your answer]'; run.append(t); content.append(run); sdt.append(content); p._p.append(sdt)
   c.setFillColor(black); c.setFont('TemplateSans-Bold',10); c.drawString(54,y,label); y-=12
   for line in simpleSplit(hint,'TemplateSans',8,504):
    c.setFont('TemplateSans',8); c.setFillColor(HexColor('#555555')); c.drawString(54,y,line); y-=9
   y-=height+4
   form.textfield(name=key,tooltip=label,value='',x=54,y=y,width=504,height=height,
       fontName='Helvetica',fontSize=10,textColor=black,fillColor=HexColor('#F3F6F5'),
       borderColor=HexColor('#B9C8C3'),borderWidth=.6,borderStyle='solid',forceBorder=True,
       fieldFlags='multiline' if height>25 else '',maxlen=12000 if height>25 else 600)
   y-=9
  if y<48: raise ValueError(f'PDF page {i+1} overflows: {y}')
  c.setFillColor(black); c.setFont('TemplateSans',8)
  c.drawString(54,32,'Template version 1.0   |   Keep field labels unchanged')
  c.drawRightString(558,32,f'{i+1} / 8'); c.showPage()
 doc.add_page_break()
 doc.add_paragraph('How to use this template', 'Heading 1')
 for para in INTRO: doc.add_paragraph(para)
 doc.add_paragraph('Before sharing: review page IDs, button destinations, product prices, image permissions and public contact details. Remove unused records and save a copy.')
 # Separate instructions page is included in both formats.
 # Word may paginate its final explanatory text naturally; it remains editable.
 c.setFont('TemplateSans-Bold',23); c.drawString(54,720,'How to use this template')
 y=678
 for para in INTRO:
  for line in simpleSplit(para,'TemplateSans',11,504):
   c.setFont('TemplateSans',11); c.drawString(54,y,line); y-=16
  y-=17
 for line in simpleSplit('Before sharing: review page IDs, button destinations, product prices, image permissions and public contact details. Remove unused records and save a copy.','TemplateSans',11,504):
  c.drawString(54,y,line); y-=16
 c.setFont('TemplateSans',8); c.drawString(54,32,'Template version 1.0   |   ramakenkenya.github.io/rea-website-studio/'); c.drawRightString(558,32,'8 / 8')
 c.save()
 doc.save(OUT/(NAME+'.docx'))
 (ROOT/'docs/website-template-fields.json').write_text(json.dumps({'version':'1.0','status':'draft-import-format','fields':manifest},indent=2)+'\n')
 with ZipFile(OUT/'Rama_Studio_Website_Templates_v1.zip','w',ZIP_DEFLATED) as z:
  for ext in ['docx','pdf']: z.write(OUT/(NAME+'.'+ext),NAME+'.'+ext)
 print(f'Created Word, fillable PDF and ZIP with {len(manifest)} matching fields.')

if __name__=='__main__': run()

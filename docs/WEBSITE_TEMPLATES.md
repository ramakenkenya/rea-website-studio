# Website content templates

The studio provides an editable Word document and a fillable PDF with matching version 1.0 field labels. Download both in one ZIP, or choose an individual format. Files live in `public/templates/` and Vite copies them to the published site.

This release provides downloads only. There is no document upload or automatic site generation from these documents yet. Existing project backup restore is unchanged.

## Editing

Replace the Word response text, keeping labels and version unchanged. Page, section, product, gallery and FAQ records can be copied when more entries are needed. PDF fields can be completed and saved in a compatible PDF reader. Use Word for additional records or longer text. Examples are guidance rather than prefilled business information.

Both documents cover business identity, visual direction, page order, page copy, section copy, shop products, hosted images, image credits, FAQs, contact details and footer copy. Blank optional content is intended to be omitted. The PDF has a fixed set of 51 fields; the Word document can expand.

## Future importer contract

`website-template-fields.json` records stable keys shared by Word content control tags and PDF AcroForm names. It is a draft content format, separate from the existing REA Studio project backup schema. Repeatable Word records reuse field tags and will need to be grouped by record and identified by page/section/product IDs. The future importer must validate content, links, image URLs, duplicate IDs, prices and record limits; it must preserve existing work and never interpret document content as executable code. Additional notes are review guidance rather than public page copy. Gallery credit records associate with image URLs. PDF support needs separate handling of fixed records and form values; scans are not structured input.

## Regenerating

Run `python scripts/create-website-templates.py` with python-docx, reportlab and pypdf available. It regenerates both documents, their ZIP and the field manifest. Keep all outputs together when changing the format. Render and inspect every page before publishing, verify the Word tags and PDF fields match the manifest, and check ZIP entries against the individual files.

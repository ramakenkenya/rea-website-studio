# Website content templates

The studio provides an editable Word document and a fillable PDF with matching version 1.0 field labels. Download both in one ZIP, or choose an individual format. Files live in `public/templates/` and Vite copies them to the published site.

Open Brief or New website, choose Upload completed template and select the completed Word document or filled PDF. Review the imported details and create the website. Document processing stays on your device. Existing JSON project backup restore remains separate.

## Editing

Replace the Word response text, keeping labels and version unchanged. Page, section, product, gallery and FAQ records can be copied when more entries are needed. PDF fields can be completed and saved in a compatible PDF reader. Use Word for additional records or longer text. Examples are guidance rather than prefilled business information.

Both documents cover business identity, visual direction, page order, page copy, section copy, shop products, hosted images, image credits, FAQs, contact details and footer copy. Blank optional content is intended to be omitted. The PDF has a fixed set of 51 fields; the Word document can expand.

## Import format

`website-template-fields.json` records stable keys shared by Word content control tags and PDF AcroForm names. It is the version 1 content format, separate from the existing REA Studio project backup schema. Repeatable Word records reuse field tags and are grouped by record and identified by page/section/product IDs. The importer validates content, links, image URLs, duplicate IDs, prices and record limits. Reading a document does not change the open website. Creating a website requires an explicit replacement choice when work is open; failed application rolls back the canvas. Document content is treated as data. Additional notes are review guidance rather than public page copy. Gallery credit records associate with image URLs. PDF support reads saved form values from its fixed records; scans and flattened PDFs are not supported.

## Regenerating

Run `python scripts/create-website-templates.py` with python-docx, reportlab and pypdf available. It regenerates both documents, their ZIP and the field manifest. Keep all outputs together when changing the format. Render and inspect every page before publishing, verify the Word tags and PDF fields match the manifest, and check ZIP entries against the individual files.

## Limits and behaviour

Inputs are limited to 5 MiB. Expanded Word files are limited to 25 MiB and main document XML to 2 MiB. Imports support 20 pages, 100 additional sections and the studio catalogue limit of 40 products. Word file labels and field keys are recognised, including labels left after editors remove controls. Unknown documents fail clearly. Optional blanks are omitted. Mixed currencies, missing prices, duplicate IDs, unsafe destinations and dangling references block creation.

The review screen edits the short business brief. Page and product records can be edited in the source document before upload or in the visual editor after creation. When adding pages, include them in the navigation list. Buttons use exported filenames such as `shop.html` or real section anchors. Set a unique page or section ID for each repeated record. The shop catalogue is shared across inserted shop sections.

Creating a website does not publish it and does not automatically save over a previous saved project. The downloaded current-project backup is the independent recovery copy. Imported projects start with autosave disabled. Save the new project explicitly when ready.

## Completed examples

Both `public/templates/Rama_Living_Completed_Example.docx` and `.pdf` create the same four-page fictional showroom with six photographed products, nine gallery photographs and FAQs. Both contain visible photo previews, real HTTPS photo URLs and creator/source/CC0 credits. The 21-page PDF retains 115 interactive fields; do not print it to PDF before importing. The Word file retains tagged editable content controls. Download both in `Rama_Living_Completed_Examples.zip`.

The checked-in JPEGs live in `public/example-photos/`; originals, creators, licence URLs and acquisition URLs are recorded in `docs/example-photos.json` and `public/example-photos/CREDITS.txt`. Two photos come from the original Rama Living project (Carlos ZGZ and Lo, Wikimedia Commons); seven come from ISO Republic. All source pages declare CC0. The photos illustrate room ideas, not exact fictional products.

Regenerate both examples and the ZIP without a network connection: `python3 scripts/create-completed-example.py`. Dependencies: python-docx, reportlab, pypdf and Pillow. The shared source of website content is `docs/rama-living-example.json`. PDF repeated record names use `key__2`, `key__3`, etc.; the reader orders them by numeric record index and the template field order. Blank templates and existing PDFs retain their original field names.

Published examples are tested directly by `app-tests/completed-example.test.js` and `app-tests/completed-example.spec.js`. Browser tests download the actual documents through the UI, serve the exact checked-in JPEG bytes, assert `naturalWidth`, inspect computed layout styles, save/reload, export and exercise the shopping list. The old synthetic fixtures remain for parser edge cases only.

## Verification

Node tests cover both readers, actual template fields, labels without controls, record validation, generation and transactional rollback. Browser tests cover the four-page Word journey, one-page PDF journey, manual corrections, rejected documents, cancellation, replacement choice, saved-state preservation, phone layout, project restore, ZIP navigation and the KES 83500 example shopping list.

# Text-only portfolio — first sample

Approved direction: Rama Ken's mobile-first personal portfolio, using the supplied black typographic references and his supplied photograph. Live text, a real character portrait, oversized sans-serif headings, outlined accents, fine rules, and numbered project entries. No invented results, testimonials, contact details or people.

Add a selectable `text` theme alongside the existing three palettes. A generic starter uses the brief's identity and editable project placeholders; a separate completed Rama example uses Gorilla Rampage, MvuaKenya and Rama Studio. The example is available as a standalone static page and can be opened in the editor without overwriting an existing locally saved project.

Convert uploaded portraits locally in the browser to a bounded, static, monospaced text grid. Preserve whitespace and proportions; give the artwork an accessible description. Store only the resulting text in the project and export. Accept JPEG/PNG/WebP up to 8 MiB, reject malformed/oversized decoded images, and never upload photos to a remote service.

Exports need no portrait JavaScript, remote fonts, image service or editor runtime. Existing theme, brand, save/restore and export behavior must continue to work. At 320, 390, 768 and 1440 pixels: readable text, usable navigation and no horizontal overflow. Reduced-motion preferences are respected.

The first sample is reviewable before merging the feature branch. Keep the existing default starter unchanged.

## Approved bilingual enhancement

Replace Rama's current-location statement with the factual statement that he lived and studied in South Korea. Do not claim that he currently lives there. Kenya remains relevant to the MvuaKenya project, but is not presented as Rama's base.

Add a clearly labeled English / 한국어 language control, complete authored Korean copy and Hangul-aware typography. Preserve the black visual identity, character portrait and official project destinations. Use real static English/Korean pages in Studio and in exports, with the appropriate document language and working language links after page renaming or home changes. Never overwrite the previously saved project simply by opening the sample.

The single-file downloadable preview changes languages offline using native fragment navigation and CSS. Each region declares its language; inactive content is hidden. It requires no scripts, translation API, remote fonts or internet connection. Korean navigation must remain in the Korean view, and both layouts must work at 320, 390, 768 and 1440 pixels.

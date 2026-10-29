# Document import verification

The importer was tested with the published version 1 Word and PDF templates and completed Rama Living examples. Both completed examples now create the same four linked pages, six photographed products and nine credited CC0 gallery photos. The smaller synthetic PDF fixture still exercises the fixed blank-template form separately.

The photo-backed example rebuild and browser run passed 41 functional tests (the main-only release recording is skipped on feature branches): https://github.com/ramakenkenya/rea-website-studio/actions/runs/40954467233

## Automated coverage

87 Node tests pass, including published-artifact checks for photo URLs, complete PDF records, credit metadata and selector handling. Seven Python evidence tests pass. The production build passes. Word and PDF templates have 51 matching keys, and the combined ZIP contains the exact two downloadable files. Updated instructions were rendered and visually checked. Both completed examples have embedded photo previews; the 21-page PDF retains 115 canonical interactive fields with matching visible appearances. The completed-examples ZIP contains the exact two downloads.

Seven browser journeys exercise Word import, PDF import, manual review edits, invalid documents, missing prices, cancellation, replacement choice, saved-state preservation, delayed reader cancellation, autosave isolation, phone layout, backup restore and the portable website export. The exported shop calculates KES 83500 for one sofa, one desk and two bookshelves.

Two additional browser journeys download the real Word/PDF examples through the UI, load the exact checked-in JPEGs, check natural image dimensions and computed navigation/gallery/shop styles, save/reload, export, exercise the shopping list and check phone overflow. A test-only image host is never substituted in these journeys. Release verification compares SHA-256 for all nine published photos and all three example download files.

The screenshot-reported failures came from public files generated from synthetic fixtures (no hero/product images and a placeholder gallery host) and literal CSS selectors being treated as escaped class names. The replacement examples use one shared source dataset; raw CSS selectors now use GrapesJS selectorsAdd and Studio loads shop CSS during initialization. The previous mock-based test remains only for edge cases. A fresh independent review confirmed exact Word/PDF data parity, CSS serialization and all 87 Node tests.

Earlier independent review found and prompted regressions for multiline Word answers, empty catalogue editor guidance, omitted-section anchors and reused-image attribution. Each regression failed before its correction and passes afterward. The missing Brief controller connection was also caught by browser testing and corrected before release.

## Scope

Only completed Rama Studio templates are supported. PDF imports require saved interactive form fields; scans, handwritten copies and flattened PDFs are unsupported. Word can repeat page/section/product records. User-supplied photos remain externally hosted. The completed examples use checked-in JPEG copies hosted with the builder, with original CC0 creator/source/licence details retained. The built-in catalogue supports a single currency and shared products across shop sections.

The existing external Wikimedia live-search test can fail with a temporary provider busy response; this occurred during verification and was retried without changing or weakening that test. Browser traces, screenshots and videos are retained in GitHub Actions evidence artifacts.

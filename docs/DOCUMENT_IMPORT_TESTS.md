# Document import verification

The importer was tested with the published version 1 Word and PDF templates and completed Rama Living examples. Word creates four linked pages and six catalogue products; PDF creates one page and one product from its fixed form records.

The complete branch browser run passed 39 tests on its successful retry: https://github.com/ramakenkenya/rea-website-studio/actions/runs/40947360618

## Automated coverage

83 Node tests pass, including 19 document reader, validator, generator and transaction checks. Seven Python evidence tests pass. The production build passes. Word and PDF templates have 51 matching keys, and the combined ZIP contains the exact two downloadable files. Updated instructions were rendered and visually checked.

Seven browser journeys exercise Word import, PDF import, manual review edits, invalid documents, missing prices, cancellation, replacement choice, saved-state preservation, delayed reader cancellation, autosave isolation, phone layout, backup restore and the portable website export. The exported shop calculates KES 83500 for one sofa, one desk and two bookshelves.

Independent review found and prompted regressions for multiline Word answers, empty catalogue editor guidance, omitted-section anchors and reused-image attribution. Each regression failed before its correction and passes afterward. The missing Brief controller connection was also caught by browser testing and corrected before release.

## Scope

Only completed Rama Studio templates are supported. PDF imports require saved interactive form fields; scans, handwritten copies and flattened PDFs are unsupported. Word can repeat page/section/product records. Photos remain externally hosted and their availability depends on the source. The built-in catalogue supports a single currency and shared products across shop sections.

The existing external Wikimedia live-search test can fail with a temporary provider busy response; this occurred during verification and was retried without changing or weakening that test. Browser traces, screenshots and videos are retained in GitHub Actions evidence artifacts.

# Document Import Implementation Plan

> **For agentic workers:** Use executing-plans to implement this plan task by task. Steps use checkbox syntax for tracking.

**Goal:** Create complete editable websites from completed Word and PDF templates in Brief.

**Architecture:** Separate bounded document parsing, normalized content validation and portable component generation from the Brief controller. The controller stages content and uses a transactional replacement adapter.

**Tech Stack:** Existing vanilla JS, GrapesJS and JSZip, plus pinned pdf-lib and xmldom dependencies.

**Spec:** `docs/superpowers/specs/2026-10-29-document-import-design.md`

## Global Constraints

5 MiB compressed input, 25 MiB expanded DOCX, 20 pages, 100 additional sections, 40 products. No paid API or remote document processing. Preserve existing manual Brief and project restore behavior.

## Review Focus

- Word editors may remove content controls; labelled paragraphs must remain readable or fail clearly.
- Blank repeated records and guidance must never become public content.
- Late parsing completion after closing or selecting another file must not alter review state.
- The existing project's autosave must not overwrite saved data during a failed replacement.
- Broken IDs, mixed currencies and unsafe destinations must fail before canvas mutation.

### Task 1 Document parsing and validation

**Files:** `src/document-reader.js`, `src/document-model.js`, `app-tests/document-import.test.js`, `app-tests/import-fixture.js`.

**Interfaces:** `readWebsiteDocument(bytes,filename)` returns `{fields,records,source}`; `reviewDocument(raw,overrides)` returns `{ok,issues,warnings,draft}`. Draft contains validated brief, pages, sections, products, galleries and FAQs.

- [ ] Write tests for real DOCX/PDF fields, repeated records, malformed input, limits and invalid content; observe RED.
- [ ] Implement readers and review normalization; run Node tests to GREEN.
- [ ] Commit the tested parsing unit.

### Task 2 Portable website generation and transactional replacement

**Files:** `src/document-site.js`, `src/import-transaction.js`, `app-tests/document-site.test.js`.

**Interfaces:** `documentSite(draft)` returns `{brief,project,studio}`; `replaceImportedProject(adapter,next)` captures, applies and rolls back through adapter methods.

- [ ] Write failing tests for four-page catalogue generation, content preservation, exported navigation, injection escaping and rollback.
- [ ] Implement component generation and transactional application, integrating existing brand/navigation/shop/export helpers.
- [ ] Run targeted tests and the existing Node suite to GREEN; commit.

### Task 3 Brief UI and complete journeys

**Files:** `src/brief-import.js`, `src/brief-import.css`, `src/main.js`, `app-tests/document-import.spec.js`, documentation and templates.

**Interfaces:** `mountBriefImport({dialog,form,capture,apply,backup,onImported})` mounts manual/upload paths and review. Close invalidates pending reads. Main routes imported creation separately from manual starter submission.

- [ ] Write browser tests for Word and PDF upload, manual precedence, invalid files, missing prices, cancel, replacing a saved project, backup restore, ZIP shop flow and phone layout; observe RED.
- [ ] Implement the UI/controller and integration; update template guidance to active upload instructions.
- [ ] Run Node and Python checks, production build and browser suite. Verify document renders and round trips.
- [ ] Request one fresh whole-change review, fix important findings with regression tests, publish and verify live behavior.

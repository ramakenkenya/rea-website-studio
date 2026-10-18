# REA Studio Implementation Plan

> **For agentic workers:** Use executing-plans to implement each task and verify its acceptance evidence.

**Goal:** Deploy a usable, evidence-backed static website studio.
**Architecture:** Vanilla JS modules wrap a pinned GrapesJS editor. Editable project snapshots remain separate from HTML/CSS exports. GitHub Actions tests and publishes the static bundle.
**Tech Stack:** Vite, GrapesJS 0.23.8, JSZip, Node tests, Playwright.
**Spec:** docs/superpowers/specs/2026-10-18-static-studio.md

## Global Constraints
- Device-local save status, no fake backend or AI claims.
- Preserve real REA evidence and source notices.
- Portable exported website, escaped input, safe backup import.
- Responsive controls and insertion/reordering alternatives to dragging.

## Review Focus
Storage quota failures; malicious/corrupt backup import; exported assets outside the builder; editing at phone widths; unsaved changes when creating another project.

### Task 1: Project and export contracts
Files: src/project.js, src/templates.js, src/export.js, app-tests/core.test.js, package.json.
Interfaces: normalizeBrief(input), createStarter(brief,theme), snapshot(brief,project), readSaved(storage), writeSaved(storage,data), validateSnapshot(data), buildDocument({html,css,brief}), exportFiles(editor,brief).
- [ ] Write failing tests for escaped copy, validation, backup corruption/unsafe content, quota failure and portable HTML.
- [ ] Run node --test app-tests/core.test.js; observe missing implementation failures.
- [ ] Implement modules and run the full unit suite; expect all passing.

### Task 2: Responsive editor journey
Files: index.html, src/main.js, src/style.css, src/quality.js, app-tests/studio.spec.js.
Consumes: Task 1 project/export contracts. Produces the real browser editing/saving/export journey.
- [ ] Write browser acceptance tests before wiring the application.
- [ ] Observe missing application behavior, then implement UI and editor integration.
- [ ] Verify editing, real drag/insertion, reorder, undo, save/reload, backup restore, export reopen and mobile layout.

### Task 3: Cloud tests, recording and deployment
Files: .github/workflows/studio-pages.yml, playwright.config.js, README.md, docs/CLOUD_LOG.md.
Consumes: working npm test, npm run test:e2e and npm run build commands.
- [ ] Build and test; inspect browser screenshots and videos, fix observed defects.
- [ ] Fresh review of source and failure modes; fix material findings with reproducing tests.
- [ ] Commit through GitHub, inspect test/deployment jobs and verify the live Pages URL.
- [ ] Update the Drive project record with completed work, recording links and limitations.

# Text-only Portfolio Implementation Plan

**Goal:** Deliver a working reusable text theme and Rama's completed first sample.
**Architecture:** One shared HTML/CSS template, bounded pixel-to-character conversion, and a small editor integration. Generate the standalone sample from the same template during the build.
**Tech Stack:** Existing Vite, vanilla JavaScript, GrapesJS, Node tests and Playwright.
**Spec:** `docs/superpowers/specs/2026-11-06-text-portfolio.md`

## Global constraints
- Real character artwork; no raster substitute, arbitrary scripts, new runtime dependency or remote font.
- Preserve existing starters and explicit save behavior.
- Generic templates do not attribute Rama's projects or portrait to other people.

## Review focus
- Long names and safe escaping.
- Whitespace and artwork identity through save/restore/export.
- Brand changes and a 320-pixel viewport.
- Invalid photo and page switch during conversion.
- Existing saved project when opening the example.

## Tasks
1. [ ] Add failing tests for pixel conversion, text-theme normalization, template escaping and generic/sample content. Implement shared portrait and portfolio modules; run the tests.
2. [ ] Integrate theme selection, completed starter, portrait upload and example query. Add browser tests for saved-project protection, portrait replacement, backup/export round trips and offline responsive rendering. Run tests.
3. [ ] Generate the standalone sample from the template during build. Verify full Node/Python suites, browser tests and production build; inspect desktop/mobile screenshots. Commit and push the feature branch, open a reviewable PR, and provide the sample.

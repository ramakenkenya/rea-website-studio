# Static Shop Implementation Plan

> **For agentic workers:** Use executing-plans inline, then requesting-code-review. Steps use checkbox syntax.

**Goal:** Build and deploy the Mitumba-inspired shopping-list flow in REA Studio and its ZIP exports.
**Architecture:** Validated optional shop metadata, authored catalog markup, shared pure order engine and trusted DOM runtime. Shop pane edits metadata and regenerates marked sections. Opaque preview embeds the same runtime.
**Tech Stack:** Existing JavaScript, GrapesJS, Vite, JSZip, Node tests and Playwright.
**Spec:** docs/superpowers/specs/2026-10-18-static-shop.md

## Global Constraints
No new dependencies; MIT authored code. No copied photos. No automatic message sending. Blank default recipient. Keep arbitrary script imports rejected. Preserve unrelated project/page content.

## Review Focus
- Currency decimals/rounding, variants and duplicate merging must produce exact totals.
- Missing or malformed recipient must never open another business's chat.
- Product names, URLs and customer text must never execute HTML or JavaScript.
- Save/reload and ZIP export must preserve shop configuration across pages.
- Mobile shoppers must reach quantities, review and WhatsApp without horizontal overflow.

### Task 1: Validated shop and order engine
Files: src/shop-model.js, src/shop-engine.js, src/site-model.js, app-tests/shop.test.js.
Interfaces: normalizeShop(input) -> Shop; shopEngine() -> {phone,money,add,summary,order}; shopSection(shop) -> safe HTML.
- [ ] Write assertions for empty legacy state, unique products, decimal totals, merge/limits, exact WhatsApp recipient/message, unsafe URLs.
- [ ] Run node --test app-tests/shop.test.js; observe failures for absent behavior.
- [ ] Implement normalization and pure engine; run full npm test.

### Task 2: Shop editing and portable runtime
Files: src/shop-pane.js, src/shop-runtime.js, src/shop-style.js, src/studio-v2.js, src/export.js, app-tests/shop.spec.js, app-tests/multipage-export.test.js.
Interfaces: mountShopPane({pane,editor,getState,saveShop,changed,reveal,toast}); shopRuntimeSource() -> trusted classic JS; shopCss -> CSS.
- [ ] Write browser journeys for creation/editing/save/reload/preview/cart/message and standalone ZIP with phone layout; extend export tests before implementation.
- [ ] Implement labeled drawer forms, generated sections, runtime and isolated preview bridge.
- [ ] Run full unit/build checks locally and browser suite on a test branch; capture videos.

### Task 3: Review and release
Files: README.md, version root metadata, REA Drive log and evidence.
- [ ] Request a fresh scoped code review and fix substantive findings with regression tests.
- [ ] Verify branch CI, publish main, verify deployment/assets/live app.
- [ ] Preserve shop demonstration recording and update existing REA document without changing user tabs.

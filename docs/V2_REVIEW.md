# Studio v2 integration review

Review date: 2026-10-18. Baseline: `origin/main` at `169a6eb8c76f62688d958201fad895516728ee81`.

Reviewed the v2 specification, core and block implementation reports, `main.js`, `studio-v2.js`, `site-model.js`, `project.js`, `export.js`, `quality.js`, templates, blocks, and browser/unit test assertions. Findings below describe the initial implementation reviewed, before integration corrections. The integration owner accepted these findings and is implementing fixes; this document does not certify those subsequent changes.

No production files were changed by this review. Installed GrapesJS 0.23.8 was exercised directly in headless Node for the duplication diagnosis. No browser was available locally, so browser-only claims remain subject to recorded CI verification.

## Important findings

### P1 — Duplicate page and selected element lose nested content and custom styles

Initial `studio-v2.js` passes `wrapper.toJSON()` to `Pages.add` and `c.toJSON()` to `parent.append`. GrapesJS component `toJSON()` retains nested model/collection objects until the JSON serialization boundary; it is not a detached clone. Passing that object directly back into component creation creates incorrect descendants. Component-specific CSS rules also remain associated with the original IDs.

Reproduced with the installed engine, without DOM parsing:

```js
import grapesjs from 'grapesjs';
const editor = grapesjs.init({
  headless: true,
  storageManager: false,
  selectorManager: { componentFirst: true },
});
const original = editor.addComponents({
  tagName: 'section',
  components: [{ tagName: 'h1', content: 'Hello' }],
})[0];
original.addStyle({ color: 'red' });
const duplicate = original.parent().append(original.toJSON())[0];
console.log(original.toHTML(), duplicate.toHTML());
console.log(original.getStyle(), duplicate.getStyle());
const wrapper = editor.getWrapper();
const page = editor.Pages.add({
  id: 'about', component: wrapper.toJSON(),
  styles: editor.getCss({ component: wrapper }),
});
console.log(page.getMainComponent().toHTML());
```

Observed: original section contains `<h1>Hello</h1>`; duplicate contains `<div></div>`; original style is `{ color: 'red' }`, duplicate style is `{}`; duplicate page contains `<body><div></div></body>`. A separate `original.clone()` followed by append preserves the H1 and clones the ID CSS rule. Use the engine clone API or a fully detached and correctly remapped representation. Existing browser test only counted the third page and immediately deleted it, so it did not establish feature 3's content preservation.

Affected acceptance features: **3, 35**.

### P1 — Failed validation can leave live metadata unusable

The Site settings handler assigns `state.site` before calling `createStudio`. Input `https://` in Social sharing image URL passes the preliminary protocol regex, then fails `image()` URL validation after the live state has already changed. Subsequent `open()` calls invoke `sync()` before rendering the correction form; snapshot capture, backup, export and preview also validate the poisoned state. A rejected field can therefore prevent the user from reopening settings or saving unrelated edits.

Checkpoint insertion has the same transactional issue. It validates the previous state through `capture()`, then pushes the new checkpoint without validating the proposed aggregate state. A valid project containing 1,100 paragraph components can create four points; the fifth exceeds the metadata traversal budget. Subsequent `createStudio` calls throw `Unsupported project complexity.` while the UI has already announced successful creation. Twenty pages averaging 55 paragraph-like components can reach this order of size.

The checkpoint case was reproduced by creating a project with 1,100 objects shaped `{tagName:'p',content:'Paragraph '+i,attributes:{id:'p'+i}}`, then repeating the interface's snapshot / nested-history removal / unshift / five-entry cap sequence. Points 1–4 validated; point 5 caused the next `createStudio` to throw.

Validate a complete proposed metadata object before committing it. Apply this to checkpoints and uploads as well as forms, and keep the old state usable after rejection. History budgets should account for the full retained history, with an actionable error while the History pane remains reachable.

Affected acceptance features: **38, 39, 42**, with collateral impact on save, backup, export and tools.

### P2 — Reusable sections lose custom styling and can capture an entire page

The initial library stores only `c.toHTML()` and reinserts it without its CSS or `cloneRules`. GrapesJS keeps inspector changes in CSS rules keyed to component IDs. Its `Components.parseString` calls `Component.checkId`, which renames conflicting IDs; those rules are not cloned unless requested. Saving then inserting a styled section therefore loses custom styles even while the original exists, and a reusable entry has no independent CSS snapshot if the source is removed or later restyled.

Separately, the save handler climbs until the selected component's parent is the wrapper. Presets and starter packs wrap sections in `<main>`, so selecting one of those sections captures the entire `<main>` and all its sibling sections. The existing test only proves that a saved-entry button appears; it never reinserts the section or compares its contents and styling.

Capture the nearest intended section, retain a detached style snapshot, and insert with ID/CSS remapping. Verify both same-page and cross-page reuse after changing or deleting the source.

Affected acceptance feature: **34**.

### P2 — 404 home link and styles break for nested missing URLs

The exported error document initially links `index.html`, `styles.css` and `studio.css` relatively. When a static host serves that document at `/site/missing/deep`, the return link resolves to `/site/missing/index.html`, and styles resolve under `/site/missing/`. A direct visit to `/site/404.html` does not reveal the problem.

When public site URL is known, use its deployment base path for the home and stylesheet targets. Test the exported document served as a fallback at a nested missing URL, not only as a named file. When no public base is supplied, document the limitation rather than asserting reliable arbitrary-depth routing.

Affected acceptance feature: **47**.

### P2 — Save shortcut is registered only outside the canvas iframe

The initial keyboard handler is attached to the parent document. Keyboard events generated while the canvas has focus do not bubble across an iframe boundary. GrapesJS's own undo bindings do not connect Ctrl/Cmd+S to the application's Save button. Bind the app shortcut to the canvas document on frame load as well, preserving typing-field exclusions and avoiding duplicate listeners after page changes.

Affected acceptance feature: **40**. This is a source-level finding; local browser validation was unavailable.

### P2 — Removing an uploaded asset leaves its library payload in project storage

Upload adds each image to both `state.assets` and `editor.AssetManager`. Remove initially filters only `state.assets`, so the same unused image remains in `project.assets` and future backups. Removing images to recover storage cannot remove that copy. Remove the corresponding AssetManager record while preserving any existing canvas image references. This is not an additional promised feature, but it affects the reliability of the quota-recovery advice.

## Fifty-feature coverage assessment

“Present” below means a substantive implementation path was found, not that every interaction has been browser-verified. Claims of fifty working additions should wait for corrections and appropriate integration checks.

| Features | Implementation assessment |
| --- | --- |
| 1 blank pages; 2 presets | Present in Pages form and original About / Products / Contact builders. |
| 3 duplicate page | Initial implementation fails nested-content/style preservation; P1 above. |
| 4 rename; 5 unique slugs; 6 home; 7 protected delete; 8 reorder; 9 navigation visibility; 10 refresh navigation | Present, with explicit metadata and Pages API operations. Navigation scanner preservation has dedicated pure tests; engine-level replacement remains a browser concern. |
| 11 page search metadata; 12 linked preview | Present. Preview keeps exported files in memory and uses iframe srcdoc and internal-link interception. No object-URL accumulation was found in this path. |
| 13 coffee; 14 furniture; 15 portfolio starters | Distinct original layouts and copy present, with replacement confirmation. |
| 16 product grid; 17 gallery; 18 native FAQ; 19 sample testimonials; 20 team; 21 sample pricing; 22 sample statistics; 23 CTA; 24 hours; 25 social links | All ten builders present with shared portable CSS. FAQ uses details/summary. Sample claims and editable public social links are labeled. |
| 26 palette; 27 system fonts; 28 width; 29 radius; 30 logo; 31 favicon | Present. Shared CSS and navigation/export metadata provide the relevant paths. No remote font dependency was found. |
| 32 image library; 33 asset search | Present; asset removal leaves an extra stored copy initially. |
| 34 reusable sections | Initial implementation fails styled reuse and selects the wrong boundary in nested layouts; P2 above. |
| 35 duplicate selected | Initial implementation loses descendants and ID CSS; P1 above. |
| 36 device visibility; 37 link URL/new-tab | Present, including matching exported CSS and noopener/noreferrer. |
| 38 opt-in autosave | Debounced storage write and visible error messages present. Transactional validation and aggregate-history failures must be fixed so failed saves leave editable state. |
| 39 named restore points | Capture, five-entry cap, nested-history removal, confirmed restore present. Aggregate insertion can invalidate state; P1 above. |
| 40 save/undo/redo shortcuts | Parent-document handling present; canvas save shortcut requires correction. |
| 41 text search | Search and selection path present. |
| 42 social metadata | Export fields present; malformed social image URL currently poisons state. |
| 43 language/direction; 44 public URL; 45 sitemap; 46 robots/noindex | Present with validation and export generation. Sitemap deliberately omits noindex pages; report this accurately rather than claiming it lists every exported page. |
| 47 404 with home route | Error document present; nested-host fallback routing needs correction. |
| 48 accessibility basics; 49 internal-link/fragment audit | Site-wide implementation present. These remain explicitly basic checks, not comprehensive audits. |
| 50 publishing guide/checklist | Generated README lists each exported page and CSS file, hosting steps and content/accessibility/licensing review. |

## Evidence limits and release gates

Core/export tests use controlled editor doubles and establish pure generation behavior; they do not establish GrapesJS cloning or visual fidelity. The initial browser suite's duplicate-page assertion counted pages, the library assertion checked a button, and the asset assertion checked a thumbnail action. Expand those to check preserved nested content and custom styles, cross-page reuse, actual asset insertion, malformed-setting recovery, and history-budget rejection without state loss.

Snapshot capture uses `getProjectData()`, whose installed implementation performs a JSON serialization round trip; no live-editor reference retention was found in that path. Nested checkpoints are removed before validation/restoration, and recursive structure limits exist. Preview has no scripts or form-submission sandbox permission. Existing generated-navigation tests cover preserved component IDs, quoting, nested marked nav, raw text and unrelated navigation. No additional confirmed executable-content bypass was found during this review.

Recorded CI, deployment startup and live asset verification are owned by the integration task. They must be reported as actual successful runs, with any failing or unrun checks stated explicitly.

## Scoped re-review disposition

The integration corrections were inspected on 2026-10-18. The reviewer reran `node --test app-tests/editor-actions.test.js app-tests/site-model.test.js app-tests/multipage-export.test.js`: **28 tests passed, zero failed**. This is a scoped unit/headless result; recorded browser CI remains a separate release gate.

| Initial finding | Disposition after first correction pass |
| --- | --- |
| Page/element shallow duplication | Closed for the reproduced failure. Both use GrapesJS `clone()`; direct installed-engine tests preserve nested content and independent ID styles. |
| Site form poisons live metadata | Closed for the malformed social-image case. Site, Brand, uploads, saved sections and checkpoint creation now validate a candidate before assigning state. See remaining generated-page path below. |
| Fifth checkpoint exceeds aggregate budget | Closed for the reproduced substantial-project case. Budget is now 250,000 values, tests retain five substantial snapshots, and rejected candidate history is not assigned to live state. |
| Reusable section boundary and missing CSS | Nearest-section selection and detached HTML/CSS capture are corrected; CSS survives schema validation; insertion requests CSS-rule cloning. See remaining shared-brand interaction below. |
| Nested 404 routing | Closed when public deployment URL is supplied. Export uses that base for home/navigation/styles and has a regression test. Without a public URL, relative behavior remains a documented limitation of this review. |
| Removed assets remain in AssetManager | Closed in source: remove also deletes the AssetManager entry when no other library asset shares its source. Existing canvas references remain intact. |
| Missing canvas shortcut propagation | **Original diagnosis withdrawn and corrected.** GrapesJS explicitly forwards iframe keyboard events to its parent. The new iframe listener introduces duplicate handling; see below. |

Three remaining cases were sent to the integration owner:

1. **Generated page metadata still bypasses candidate validation.** Add page assigns `name + ' · ' + brief.name` as a title after `sync()`. A valid 180-character page name creates a title longer than the metadata limit and makes the next sync/save/open fail. Duplicate page appends ` copy` before adding, so a valid name near the length limit creates an invalid actual page before the subsequent sync rejects it. Validate and bound generated fields before adding a page, and avoid unvalidated post-sync assignments.
2. **Inserting a saved section can reset shared brand CSS.** A direct headless probe showed `getCss({component: detachedClone})` includes global `body`, `:root`, heading and class rules. Inserting a section captured under brand A after switching to brand B adds A's saved rules back to the editor, although metadata still specifies B. Reapply current shared brand rules after insertion or omit them from the captured section styles. Shared branding itself is intentional; restoring an old global value is the failure.
3. **Keyboard ownership needs deduplication, and the earlier report was incorrect about forwarding.** In installed GrapesJS, `FrameView._onRootMount` forwards keydown/keyup/keypress by dispatching a synthetic event at the iframe element. `createCustomEvent` retains the original event as `_parentEvent`. Both the parent and new frame listeners therefore see one canvas keystroke; built-in `core:undo`/`core:redo` additionally handle the same shortcuts. Use one owner, honor the original event target for typing exclusions, and prevent the original browser event as needed. The parent-event forwarding discovery corrects the initial source-level finding rather than claiming an unperformed browser test.

### Final scoped correction review

The final local corrections associated by the integration owner with published feature commit `198241641ee7f040a46356bbc870e6db77bad76e` were inspected. All three remaining cases above are closed in the reviewed implementation:

- Add page constructs a validated candidate before `Pages.add` and bounds its generated title to 180 characters. Duplicate page bounds the generated name and validates the complete candidate before cloning/adding. Both assign that validated state without the previous unchecked metadata mutation.
- Saved-section insertion now reapplies the current shared brand immediately after importing the captured section CSS, preserving current brand settings rather than reinstating the captured palette and typography.
- Shortcut handling has one parent-document listener. It resolves the original canvas event target, prevents both forwarded and original browser events, and removes GrapesJS's overlapping undo/redo mappings both immediately and on load. The extra iframe listener was removed.

The integration owner also identified duplicate navigation headers on pages whose canvas had not yet rendered. The correction replaces DOM-dependent `Component.find` with model traversal through `findType`; the headless regression checks navigation discovery on an unseen page. This addresses the reported rendering-dependent lookup failure without selecting pages during export or navigation refresh.

Reviewer validation: `node --test app-tests/editor-actions.test.js` passed **5/5 tests**, including nested-content/style duplication, nearest-section capture, unseen-page navigation discovery, and forwarded shortcut behavior. No unresolved blocker was found within this final scoped review. Actual browser event dispatch, repeated cross-page refresh, styled library insertion and release deployment remain subject to the running strengthened browser CI; this disposition does not claim those runs have passed.

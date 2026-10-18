# Studio v0.2 blocks and starter packs

Implemented Task 2 in `src/blocks.js` with the requested exports and no runtime dependency:

- Ten insertable blocks: product grid, image gallery, native FAQ, sample testimonials, team, sample pricing, sample statistics, call to action, opening hours and editable social links.
- About, Products and Contact page presets. Each page has one H1, a contact section, and valid local fragment targets.
- Coffee shop, furniture showroom and personal portfolio starter packs. Each pack supplies a normalized editable brief, original contextual copy, navigation and embedded SVG artwork.
- Exported `EXTRA_CSS` makes individual blocks usable without a starter stylesheet. All complete pages reuse `createStarter` base CSS and include these block styles.
- User-provided text is escaped, email inputs are normalized/validated, and all generated outputs pass the snapshot safety validator. Sample testimonials, offers, figures, opening hours and concept projects are identified as examples requiring editing.

All illustration shapes and template copy were authored for this repository. The images are encoded SVG data URLs, so they require no external image service, credentials, fonts, attribution or additional license. The repository MIT license applies to these additions.

## Verification

Tests were added before the module. The initial targeted run failed because the module did not yet exist. After implementation, `node --test app-tests/blocks.test.js` passed all five tests. These cover all ten block outputs, escaping, snapshot safety, FAQ semantics, explicit sample labels, preset content, local fragment targets, one H1 per page, distinct embedded pack illustrations and unknown layout rejection.

`npm run build` passed. Vite reported its existing large editor chunk warning; npm reported the environment's unknown `http-proxy` configuration warning.

The first full `npm test` run passed 34 of 39 tests. The five failures were outside the owned files, in ongoing navigation work:

- `exported generated navigation retains component IDs referenced by page CSS`
- `nested generated nav refreshes inside a custom header without nesting another header`
- `navigation scanning honors quoted angle brackets and preserves styled generated header attributes`
- `navigation scanner ignores marker text inside unrelated attributes and raw text`
- `navigation refresh keeps CSS component IDs and visual attributes while updating links and labels`

Local Playwright rendering could not run because its Chromium executable is not installed. Browser workflow and visual verification remain with the integration owner.

The base template's optional `scroll-behavior` declarations are omitted from new complete pages because the existing safety validator rejects the `behavior:` substring. This keeps these starter pages compatible with that validator without changing shared validation code.

# Multipage and assets investigation — 18 October 2026

REA 6.7.0 cloud run [39131482263](https://github.com/ramakenkenya/rea-website-studio/actions/runs/39131482263) returned success for four selected GrapesJS source files at commit `3b2c671c0ab50f052a219b987dea8738ea75886e`. Raw output SHA-256 and all selected-file hashes were independently verified against the pinned source.

- Evidence ID: `ev_3ab39a413ca7bd0776c363ea1581e1fb50fe04c4242bc524618b11bee25ed5df`.
- Artifact SHA-256: `2092a228cd22333a1492ed6a50fb4de78bb9852064deaf3b336d9a87d4dd4b57`.
- Raw output SHA-256: `95ce66f877a329e431894f1fc79e6d9dd2654b032346d74791ef8f8e8b2b0ac3`.
- Retained archive: https://drive.google.com/file/d/1Aj99xhQwhCKXuye9E6l5oAnIQX3Mcxgb/view

## Confirmed source locations

| Module | Method recovered in semantic graph | Lines |
|---|---|---|
| `src/asset_manager/index.ts` | `add` | 153–160 |
| `src/editor/index.ts` | `getCss` | 268–270 |
| `src/editor/index.ts` | `getHtml` | 252–254 |
| `src/editor/index.ts` | `getProjectData` | 554–556 |
| `src/editor/index.ts` | `loadProjectData` | 565–567 |
| `src/pages/index.ts` | `add` | 137–147 |
| `src/pages/index.ts` | `add` | 140–144 |
| `src/pages/index.ts` | `getAll` | 56–59 |
| `src/pages/index.ts` | `move` | 187–203 |
| `src/pages/index.ts` | `remove` | 159–168 |
| `src/pages/index.ts` | `select` | 250–258 |
| `src/pages/model/Page.ts` | `getMainComponent` | 144–147 |

## What this informed

Page storage, selection and per-page main components guided the page manager and schema migration. The separate getHtml/getCss interfaces allow export of every page without switching the selected canvas. Asset add informed a reusable embedded image library. These are implementation choices confirmed with runtime tests separately; static analysis does not prove those user flows.

## Limits

REA parsed selected source as inert text. 498 inventoried files were outside the chosen analysis scope, and relationships through them are unknown. The graph is incomplete and its node/edge counts do not measure product quality or browser coverage. Raw evidence is retained alongside source hashes; successful browser tests and recordings are separate evidence.

## License research

- GrapesJS core: BSD-3-Clause, retained in public/licenses/GrapesJS.txt. https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/LICENSE
- JSZip: MIT option selected from its dual license; existing full notices retained. https://github.com/Stuk/jszip/blob/main/LICENSE.markdown
- REA-authored tool code: MIT; external tools retain their own terms. This investigation uses the JavaScript static-analysis lane and no commercial disassembler. https://github.com/morluto/rea/blob/main/LICENSE
- New studio application code, copy and SVG artwork: original, MIT. See root LICENSE.
- No new runtime package, commercial SDK, API key, remote font service or proprietary template was added. Export font presets use browser/system font stacks.

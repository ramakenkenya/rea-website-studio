# First source-verified REA findings

Date: 18 October 2026. Scope: selected-file static analysis, not a browser test.

## Provenance

- [Successful GitHub Actions run](https://github.com/ramakenkenya/rea-website-studio/actions/runs/39119285001), job `117651377221`.
- Investigation commit: `8a05b640e3ae73527e85ea5789ad685fa69bc2f5`.
- REA `6.7.0`; Node `v24.21.0`; reference GrapesJS commit `3b2c671c0ab50f052a219b987dea8738ea75886e`.
- Canonical evidence ID: `ev_bd11482af4c06cee1adc776bed64fb755dd5c0b61b4d20933221ce1991ad02d2`.
- Raw analysis SHA256: `71b742d03ff44b186dc7944579d516817b9f4fc94daf37aeee20f5aa8bb1f427`.
- Downloaded artifact ZIP SHA256 checked against GitHub: `f0764c3ea3e733f2f79493ff840928c3c3e0b49ea949d6267657e054666be208`.
- [Full evidence archive retained with the project](https://drive.google.com/file/d/1ILDHMGJu15xryLjw9-hpg35BPNWjYtyo/view). The original GitHub artifact has a 14-day retention period.
- Compact extracted nodes/relations, manifest, summary and progress log: `evidence/cloud-run-39119285001/`. The selected-function extract was derived after download; it is not an additional REA run.

REA parsed two selected files, visited 3,012 AST nodes, reported 129 findings and no parse failures. The application graph contains 1,105 nodes and 1,122 edges; the separate semantic graph contains 2,053 nodes and 957 relations. These different graph counts describe different structures, not a count of verified product features.

## Finding 1: editable project data has its own interface

REA recovered the `getProjectData` function at `src/editor/index.ts:554–556` and `loadProjectData` at `565–567`, with call and return sites at 555 and 566. The function node IDs are preserved in the extracted evidence.

Manual verification of the exact source bytes (SHA256 `0110bec7161c4b52771a72af1cc54be36c71142e8d5c5679f746afe6cd52b5c3`) confirmed that these wrappers delegate to `this.em.storeData()` and `this.em.loadData(data, options)`. The source comments describe JSON project data intended to be loaded back. This interpretation combines the REA-recovered locations with independent source inspection; REA did not execute the methods.

[Source for project-data methods](https://github.com/GrapesJS/grapesjs/blob/3b2c671c0ab50f052a219b987dea8738ea75886e/packages/core/src/editor/index.ts#L548-L567).

## Finding 2: HTML/CSS export uses different interface methods

REA separately recovered `getHtml` at `252–254` and `getCss` at `268–270`. Their call and return sites were retained. Manual source inspection confirmed delegation to `this.em.getHtml(opts)` and `this.em.getCss(opts)`.

[Source for export methods](https://github.com/GrapesJS/grapesjs/blob/3b2c671c0ab50f052a219b987dea8738ea75886e/packages/core/src/editor/index.ts#L245-L270).

Design inference: provide distinct actions for saving an editable project and exporting a published site. Preserve project JSON for editing; construct the deployable site from generated HTML/CSS plus required assets. This is an architecture decision informed by the recovered interfaces, not a verified runtime round-trip.

## Limitations that matter

- Only `src/editor/index.ts` and `src/storage_manager/index.ts` were parsed; 500 inventoried files were outside selection.
- REA retained unresolved TypeScript imports, including `./model/LocalStorage` and `./model/RemoteStorage`, although their `.ts` files are present in the inventory. A `not-found` relationship is a resolver limitation here, not proof that the source file is missing. Do not claim a complete dependency map.
- Static graph relations and wrapper source do not prove correct browser execution, provider behavior, persistence, or export fidelity.
- No builder UI, browser recording or deployment has been produced yet.

## Next questions

Investigate the storage providers and editor model implementation; exercise project save/reopen and independent HTML/CSS output in a browser; then turn verified behavior into the PRD and implementation acceptance checks.

# REA Studio first release

## Intent and authorization
Rama wants a useful, publicly accessible static website builder developed in the cloud, with REA investigation central to the showcase. His instruction to build and deploy to the Pages site continues the agreed end-to-end workflow and minimal-involvement preference. Routine design and implementation choices are made here without another approval round.

## First complete journey
Open a clearly labeled example; create a project from a business brief; choose one of three visual directions; edit text, styling and images; drag or insert reusable sections; reorder sections with accessible buttons; undo/redo; save/reopen in the browser; download/restore a project backup; run a limited preflight; export a ZIP with index.html and styles.css that opens independently. The builder itself is deployed to GitHub Pages. Customer-site publishing is a guided export handoff, not a fake automated deployment.

## Architecture and evidence
Vanilla JavaScript modules, Vite, pinned GrapesJS 0.23.8 and JSZip. Local browser storage plus project JSON backup, with clear save status and errors. No secret keys or backend are required. Brief-to-layout generation is deterministic and labeled as a starter, not AI. REA does not run in visitors' browsers. Its recovered getProjectData/loadProjectData and getHtml/getCss interfaces inform separate save and export flows. The evidence panel links actual successful runs and verified findings. Stock GrapesJS provides the editor; REA's actual investigation is credited separately.

## Visual and interaction design
Light creative studio: ink navigation, warm white canvas, teal selection, orange primary action; clear workflow navigation and a prominent live website canvas. Responsive workspace with tabbed panels on narrow screens. Native controls, visible labels/focus, accessible insertion/reordering alternatives to dragging, reduced motion, and 44px touch controls. Three directions: warm editorial, coastal teal and dark minimal. Original architectural SVG sample artwork, embedded locally for portable exports; no external image dependency.

## Boundaries and error handling
Device-local storage is explicitly labeled; saving failure never reports success. JSON imports are size-limited, schema-checked, and reject executable content, event attributes, unsafe URLs, embedded frames and unexpected component scripts. Image uploads accept PNG/JPEG/WebP up to 2MB and embed data for export. User text is escaped. Starter contact action uses supplied valid email or a contact anchor; it must not invent business claims. SEO preflight checks are a checklist, not certification or a ranking promise.

## Acceptance
Unit tests cover escaped brief content, validation, snapshot restore/corruption/storage failure and export metadata. Browser tests cover real editor edits, adding/reordering, save/reload, project backup/restore, ZIP output reopened as an independent page, preflight, and mobile overflow. Playwright records videos. Deployment workflow runs tests/build, preserves test artifacts, and uses GitHub Pages permissions only in the deployment job. Live deployment is checked after Actions succeeds.

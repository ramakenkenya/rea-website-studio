# First release execution ledger

Plan: docs/superpowers/plans/2026-10-18-static-studio.md

- Dedicated linked worktree: feature/static-studio from origin/main 67e3999.
- User authorized building and Pages deployment; no additional design approval requested.
- Pre-flight: project JSON save/restore is distinct from generated HTML/CSS; controller consumes the same brief schema as templates/export. No shared interface mismatch found.
- Ruling: first release is browser-local, with downloadable project backups and portable site ZIP. Cloud account storage, AI inference and customer repository publishing require later backend integration and are explicitly outside this first release.

- First CI browser run caught a restore lifecycle failure: layer refresh ran while GrapesJS had no wrapper. The wrapper guard, import-state finally block and prevalidation now protect restore; recorded desktop and mobile roundtrip tests passed on the next run.
- Fresh review found unsafe URL normalization, malformed-page mutation, inconsistent backup size and hidden mobile backup. Reproducing unit cases failed before repairs. Nine unit tests now pass; browser mobile backup and malformed restore cases passed.
- Native HTML5 block dragging did not insert through the editor iframe in the recorded test. Switched to GrapesJS's supported pointer sorter (nativeDnD:false); the same drag acceptance test must pass before deployment.

## Verification record

- Node unit tests: 9 passed after the review fixes (including 7 MB backup roundtrip and malformed/unsafe import rejection).
- Existing REA evidence-classification tests: 7 passed.
- Production build passed with the editor in its own bundle. GrapesJS contributes a relatively large initial editor download (~291 KB gzipped), retained for the full editor capability.
- First recorded CI run 39120936422 failed on restore lifecycle; fixed.
- Second run 39121169276 passed the complete brief/edit/save/reload/restore/independent ZIP-export journey and mobile layout/restore checks. Its drag test exposed native cross-frame insertion failure; follow-up uses the supported pointer sorter.
- Full browser recordings and screenshots are retained as GitHub Actions artifacts, including failures. No uninterrupted coding-session recording is claimed.

- Final feature-branch run 39121299809 passed all 3 recorded browser scenarios, 9 app unit tests and 7 REA classifier tests. The pointer-sorter change passed the original drag test, followed by image replacement. All Important review findings have reproducing regression coverage or browser acceptance coverage.
- User-authorized integration to main and Pages deployment follows the green feature-branch run. Physical phone testing and full standards audits are not claimed.

## Deployment complete — 18 October 2026

Merged PR #1 at 4ed14bea6c6e8f2f3150759271e19c29f92bc02e. Production workflow [39121436193](https://github.com/ramakenkenya/rea-website-studio/actions/runs/39121436193) passed test-build and deploy, including 9 app unit tests, 7 REA evidence tests and 3 recorded browser scenarios.

Live URL: https://ramakenkenya.github.io/rea-website-studio/ . Cloud-browser verification observed the editor, example website and enabled Save project control. The browser-test evidence ZIP and an MP4 walkthrough are preserved in the REA project folder; the MP4 is slowed to half speed for readability.

[Passing browser recordings](https://drive.google.com/file/d/1j0NDJADosg4mE-Oj8KMEIzBCEQOstTGz/view) · [Automated walkthrough MP4](https://drive.google.com/file/d/10doU_1nWsVUW3ANiG_16KS7tfS4Up7zn/view)

No account storage, AI service or automated customer-site publishing is implied. Physical Android touch testing and comprehensive standards audits remain follow-up checks.

## Outage repair and sample rename — 18 October 2026

- Confirmed that the live HTML referenced `/src/main.js` rather than a compiled Vite asset. The legacy branch Pages publisher had overwritten the tested app after a documentation commit.
- Removed the application workflow's path filter, so documentation pushes also receive a tested build. Added a completion trigger for the legacy Pages workflow so the compiled app is republished after that publisher finishes.
- The preferred final repository setting is Settings → Pages → Build and deployment → Source → GitHub Actions. The connector cannot change this setting and the cloud browser is signed out; the compatibility trigger supports the current branch-publishing setting.
- Changed the bundled example to Rama Studio across the interface, documentation and test fixtures. Old saved examples and restored backups receive the new sample name while keeping canvas edits; unrelated project names are preserved.
- Browser acceptance tests now use the production build at `/rea-website-studio/` rather than the development server. Added an explicit startup and sample-name check, plus a post-deployment HTTP check of the published HTML and bundled assets.

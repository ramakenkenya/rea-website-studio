# First release execution ledger

Plan: docs/superpowers/plans/2026-10-18-static-studio.md

- Dedicated linked worktree: feature/static-studio from origin/main 67e3999.
- User authorized building and Pages deployment; no additional design approval requested.
- Pre-flight: project JSON save/restore is distinct from generated HTML/CSS; controller consumes the same brief schema as templates/export. No shared interface mismatch found.
- Ruling: first release is browser-local, with downloadable project backups and portable site ZIP. Cloud account storage, AI inference and customer repository publishing require later backend integration and are explicitly outside this first release.

- First CI browser run caught a restore lifecycle failure: layer refresh ran while GrapesJS had no wrapper. The wrapper guard, import-state finally block and prevalidation now protect restore; recorded desktop and mobile roundtrip tests passed on the next run.
- Fresh review found unsafe URL normalization, malformed-page mutation, inconsistent backup size and hidden mobile backup. Reproducing unit cases failed before repairs. Nine unit tests now pass; browser mobile backup and malformed restore cases passed.
- Native HTML5 block dragging did not insert through the editor iframe in the recorded test. Switched to GrapesJS's supported pointer sorter (nativeDnD:false); the same drag acceptance test must pass before deployment.

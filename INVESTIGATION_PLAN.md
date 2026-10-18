# REA research and cloud handoff

## Completed checks

- [x] Identify the authenticated GitHub account and inspect accessible repository permissions.
- [x] Verify Node/npm and reachability of npm and public GitHub source.
- [x] Install REA 6.7.0 and record the installed version.
- [x] Fetch GrapesJS at the recorded commit and identify the core package licence/version.
- [x] Invoke real REA selected-source analysis and retain raw output and its failure.
- [x] Reproduce the affected process-inspection boundary independently.
- [x] Prepare a pinned GitHub Actions investigation with raw evidence upload.
- [x] Test that blocked or incomplete results cannot be classified as successful analysis.

## Immediate dependencies

- [x] Dedicated repository exists and is accessible to the connected GitHub app (18 October 2026).
- [ ] Commit this prepared project and let the configured workflow run.
- [ ] Inspect the actual workflow result and retained artifact; repair ordinary runner/configuration errors if observed.
- [ ] Obtain and verify the first completed REA selected-source finding.

## Feature investigations

1. Project state and storage: public editor methods, storage providers, failure handling and round-trip data.
2. Export: the difference between editable project data and generated HTML/CSS/assets.
3. Interaction: drag/drop, undo and text changes, traced from REA findings and verified in a browser.
4. Responsive behaviour and assets: source representation, viewport-specific changes and portable file paths.

## Specification and build handoff

Create the PRD, technical requirements, app flow, data schema, design brief, implementation plan and QA plan from verified findings. Surface the consolidated direction for review. Keep implementation, browser demonstrations and deployment tracked as separate future milestones until they have real evidence.

## Verification already performed on this handoff

Five evidence-classification tests pass. The Python scripts compile. The workflow YAML parses with its expected triggers, read-only repository permission and seven steps. The dependency lockfile is accepted by `npm ci --dry-run`. These checks do not validate execution on GitHub's runner.

# REA Website Studio - investigation checkpoint

The purpose is to demonstrate REA's capabilities through an evidence-based investigation of a website builder, then use the findings to build a guided static-website studio.

## Latest milestone — cloud REA analysis passed

[GitHub Actions run 39119285001](https://github.com/ramakenkenya/rea-website-studio/actions/runs/39119285001) successfully ran REA on two selected GrapesJS files. The raw artifact and source hashes were verified. [First findings](docs/FIRST_FINDINGS.md) connect recovered project-data and HTML/CSS methods to exact source locations, with limitations retained.

This is selected-source static analysis. The website-builder app, browser recordings and deployment are still pending.

## Initial workspace attempt

- The cloud workspace runs Node 24.19.0 and npm 11.9.0.
- REA 6.7.0 was installed in a dedicated directory, with lifecycle scripts and optional packages disabled.
- GrapesJS was fetched at commit `3b2c671c0ab50f052a219b987dea8738ea75886e` (core package version 0.23.8, BSD-3-Clause).
- A real REA command inventoried the application, then failed before selected-source parsing completed.
- The failure is `capability_unavailable`: procps `ps`, when launched from Node in this environment, reports `fatal library error, lookup self`.
- The same process-inspection command succeeds when launched from Python. Direct Node `spawnSync` and `execFile` reproductions fail. This identifies the affected launch boundary; it does not prove the underlying host defect.
- No process-ownership checks were patched or replaced.
- This is NOT a completed semantic analysis, working builder, recorded browser demonstration or deployment.

## Next cloud run

The included GitHub Actions workflow uses a standard Ubuntu runner, locked REA dependencies and an exact reference commit. It uploads raw output, progress logs, a manifest and a status summary, including failure evidence.

The repository is now available at https://github.com/ramakenkenya/rea-website-studio. It was created public by the owner. This checkpoint initializes it with the investigation package; the first GitHub Actions run has completed successfully and its evidence has been inspected. No unrelated repository is changed.

See [the cloud execution log](docs/CLOUD_LOG.md) for dated progress and recorded decisions.

## Reproduce on a compatible Linux host

```sh
npm ci --prefix toolchain --ignore-scripts --omit=optional --no-audit --no-fund
python3 -m unittest discover -s tests -v
git clone https://github.com/GrapesJS/grapesjs.git /path/to/grapesjs
git -C /path/to/grapesjs checkout 3b2c671c0ab50f052a219b987dea8738ea75886e
python3 scripts/run_investigation.py --reference /path/to/grapesjs --rea "$PWD/toolchain/node_modules/.bin/rea" --output "$PWD/output"
```

The source-analysis probe does not need a Codex/Claude installation, AI API key or a native decompiler. It uses the actual REA CLI. Runtime/browser investigations are a separate later checkpoint.

## Next acceptance criteria

1. Standard-runner REA analysis returns explicit success and a canonical analysis record.
2. Findings are inspected and tied to exact reference-source locations.
3. Observed, inferred and unverified claims remain distinct.
4. Save/reopen and static-export behaviour are exercised in a supported browser.
5. The evidence informs the specification before the application is implemented.

The full product remains: discovery -> content/assets -> design references -> mock-ups -> editable website -> checks -> static export and publishing. REA investigation and evidence are the central demonstration.

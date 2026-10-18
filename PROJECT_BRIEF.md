# REA Website Studio - project brief

## Primary purpose

Demonstrate REA's power through a traceable investigation of a licensed open-source website builder, followed by a working web application whose key decisions can be traced back to evidence.

## Product journey

Business discovery -> sitemap and content -> assets and design references -> mock-ups -> visual editing -> quality checks -> portable static export -> publishing and later updates.

The client is a responsive web app. Android packaging is outside the current scope. Development and heavy processing should run in the cloud so Rama's involvement stays focused on meaningful decisions and unavoidable account setup.

## First research milestone

Run REA on the pinned GrapesJS reference, inspect selected-source analysis results, and independently verify a finding. A source inventory alone does not meet this criterion. Neither does manually reading a source file and describing the result as a REA finding.

## First application milestone, after investigation and specification

Create a business page, edit text and layout, replace an image, undo a change, save/reopen the project and independently open its static export. AI integration and connected publishing must use real services and report configuration failures truthfully.

## Evidence required

- Exact source and tool versions, licences and commands.
- Raw REA output, progress logs, hashes and retained limitations.
- Separate labels for REA findings, manual source observations and runtime/browser verification.
- Mapping from selected features to implementation decisions and acceptance checks.
- Browser recordings and test reports when the capture infrastructure is available.
- Explicit statement of any recording gaps; no claim of continuous recording without actual capture.

## Repository and deployment

Use the dedicated repository `ramakenkenya/rea-website-studio`, created public by its owner on 18 October 2026. GrapesJS is the investigation target and proposed editor dependency. Existing unrelated applications are not changed by this checkpoint.

Source can live on GitHub. A complete AI-enabled service needs suitable backend hosting; GitHub Pages is assessed for eligible static project demonstrations, not assumed to host the full commercial service.

## Current status

The first workspace attempt was blocked at its Node-to-ps boundary. The subsequent GitHub Actions probe succeeded (run 39119285001). Raw output hashes and selected editor function locations were verified; see docs/FIRST_FINDINGS.md. Further feature investigation, browser verification and specification come next. No builder, recorded UI test or deployment is claimed.

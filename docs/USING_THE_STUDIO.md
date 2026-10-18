# Using REA Studio

## Make a website

1. Open the studio. The initial Malaba Studio page is an example.
2. Choose **New website** and enter your business name, description, services and contact email. Choose a visual direction. This creates a starter from your brief; it is not AI-written content.
3. Click an element in the canvas. Use **Selected text → Apply text**, color and size controls, or double-click text to edit it directly.
4. Drag reusable sections into the canvas or use **Quick add**. Open **Layers** to select and move sections with the arrows. Undo/redo are above the canvas.
5. Select an image and use **Replace image**. PNG, JPG and WebP up to 2 MB are embedded for portability. Add a useful image description.
6. **Save project** keeps it on this device and browser. **Project backup** downloads editable JSON; **Restore project** opens that file on another device. Backups have a consistent 32 MB limit. Local browser storage has a smaller device-dependent quota; save failure is reported rather than hidden.
7. Run **Checks**. Review titles, descriptions, headings, image descriptions, links and contact information. These are basic checks, not full SEO or accessibility certification.
8. **Export site → Download website ZIP** gives you index.html, styles.css and README.txt. Unzip and open index.html independently. Upload those files to a static host when ready.

## On a phone

Use Canvas, Sections and Edit above the editor to open the relevant panel. Quick-add and layer arrows provide an alternative to dragging. Project backup and restore remain available. This release uses a desktop Chromium test runner with a phone-sized viewport; physical Android touch-device testing is still a follow-up check.

## What REA contributed

The project/save and export architecture follows source-verified REA findings from two real cloud runs. Read `docs/FIRST_FINDINGS.md`, or open **The REA story** in the app. GrapesJS supplies the visual editor; REA is the investigation tool and is not running client-side.

## Current boundaries

- Browser-local project storage; no account or cloud synchronization.
- Deterministic brief-to-layout starter; no paid AI integration or API keys.
- Manual handoff of exported customer sites; this app does not push to visitors' repositories.
- Static websites; no contact form backend, analytics or ecommerce checkout.
- Review all generated copy, images, links and rights before publishing.

# Using REA Studio

**New in v0.2.2:** Studio tools slides beside your live canvas on desktop and becomes a bottom sheet on phones. Add sections or galleries and see them immediately. Escape or the close button restores the normal workspace. See [drawer controls and keyboard help](DRAWER_WORKFLOW.md).

**New in v0.2:** use the page bar and **Studio tools** for linked pages, three business starters, shared brand, assets, reusable sections, restore points and site settings. See [the complete 50-feature guide](V2_FEATURES.md).

## Make a website

1. Open the studio. The initial Rama Studio page is an example.
2. Choose **New website** and enter your business name, description, services and contact email. Choose a visual direction. This creates a starter from your brief; it is not AI-written content.
   To use details already entered through **Brief**, reopen **Brief → Build page from brief** and confirm. This replaces the selected page with a starter using those details. **Save details only** updates the project name and export metadata while preserving your current page, including its colors. Download a project backup before rebuilding a design you want to keep.
3. Click an element in the canvas. Use **Selected text → Apply text**, color and size controls, or double-click text to edit it directly.
4. Drag reusable sections into the canvas or use **Quick add**. Open **Layers** to select and move sections with the arrows. Undo/redo are above the canvas.
5. Select an image and use **Choose online image**, or open **Studio tools → Assets**. Find CC0 photos, save them, then open **Saved pictures → Insert / replace**. **Add image URL** accepts a direct HTTPS link you own or can reuse. Tick saved pictures and choose **Create photo gallery**. Use Brand and Site for logo/favicon URLs. No image upload controls remain.
6. **Save project** keeps it on this device and browser. **Project backup** downloads editable JSON; **Restore project** opens that file on another device. Backups have a consistent 32 MB limit. Local browser storage has a smaller device-dependent quota; save failure is reported rather than hidden.
7. Run **Checks**. Review titles, descriptions, headings, image descriptions, links and contact information. These are basic checks, not full SEO or accessibility certification.
8. **Export site → Download website ZIP** gives you an HTML/CSS file for every page, shared studio.css, robots.txt, 404.html and README.txt. Set your final public URL under Studio tools → Site to include sitemap.xml and canonical links. Unzip and open index.html independently. Upload those files to a static host when ready.

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

### Publishing this studio

For a single publishing path, set the repository's **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. The `Studio - test, record and deploy` workflow tests and publishes the compiled `dist` folder. The deployment waits for any active legacy branch publisher to finish before publishing the compiled app while that older setting remains enabled.

Run `npm run build` before `npm run test:e2e`; browser tests exercise the built app at the repository URL path. Every deployment also checks that the live page references bundled assets rather than source JavaScript.

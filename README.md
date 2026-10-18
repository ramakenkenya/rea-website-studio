# REA Studio v0.2.1 — one idea, a whole website

[Open the studio](https://ramakenkenya.github.io/rea-website-studio/) · [User guide](docs/USING_THE_STUDIO.md) · [50 additions](docs/V2_FEATURES.md) · [REA evidence](docs/V2_REA_FINDINGS.md)

A free visual workspace for creating portable static websites. Turn a business brief into an editable starting page, add linked pages, shape your brand, reuse images and sections, check the whole website, then download independent HTML/CSS files in one ZIP.

The v0.2 workspace adds a page bar and **Studio tools → Pages, Brand, Assets, Shop, Library, History and Site**. It includes coffee shop, furniture showroom and personal portfolio starters, ten new section types, shared branding, restore points, opt-in autosave, multipage preview and SEO/handoff files. Existing one-page project backups remain readable.

## Live editing drawer

Studio tools opens beside the editable website on desktop and as a bottom sheet on phones. The canvas remains interactive; added sections and pictures are brought into view. Keyboard navigation, Escape, return focus and reduced motion are supported. See [the drawer workflow](docs/DRAWER_WORKFLOW.md).

## Image workflow

Image uploads have been replaced by HTTPS image URLs. Studio tools → Assets searches Wikimedia Commons for CC0 raster images without API credentials, includes a small verified CC0 collection, and saves pictures for reuse. Choose saved pictures to build a responsive gallery. Logos and favicons use image URLs too. Source/creator/license records are retained and exported in IMAGE-CREDITS.txt. Older embedded images remain compatible.

Photo search depends on Wikimedia availability and fair-use limits. External images need internet access and can change or disappear. Commons allows direct embedding but recommends hosting copies for reliability; this static URL workflow does not promise permanent hosting. Only CC0 results are offered; source status and other rights should be checked before publication. See [image research and workflow](docs/IMAGE_WORKFLOW.md).

## How REA contributed

[Cloud run 39131482263](https://github.com/ramakenkenya/rea-website-studio/actions/runs/39131482263) investigated four selected GrapesJS files at a pinned commit. The verified source locations informed page management, page-component export, asset handling and project persistence. [The findings](docs/V2_REA_FINDINGS.md) retain raw-evidence hashes and analysis limits. Runtime behavior is checked separately with the installed editor and recorded browser journeys.

GrapesJS supplies visual editing. REA supplied selected-source static analysis; it does not run in the browser. Brief and starter generation use authored templates. There is no paid AI endpoint or simulated cloud deployment inside the application.

## Build and verify

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
python3 -m unittest discover -s tests -v
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

[The deployment workflow](.github/workflows/studio-pages.yml) runs unit, REA evidence and production-browser checks, retaining real videos and screenshots. Main also records a deliberate release walkthrough. Deployment follows passing checks and waits for the legacy Pages publisher before publishing the compiled app.

## Ownership, licenses and limits

Original studio code, copy and SVG artwork are [MIT licensed](LICENSE). GrapesJS is BSD-3-Clause; JSZip uses its MIT option; REA-authored tool code is MIT. Full third-party notices remain in `public/licenses/`. No new runtime package, commercial SDK, remote font service or licensed stock template was added.

Projects and uploaded images are stored on the current device. Use project JSON backups to move between devices or recover from browser-storage deletion. Autosave is optional, storage quotas can apply, and five restore points share that storage. The UI supports up to 20 pages, 30 library images and 20 saved sections; new images are external HTTPS URLs; legacy embedded-image backups remain readable.

Generated websites are static files ready for manual publishing. They contain no form backend, checkout, account system or automatic hosting integration. External image URLs still depend on their original host. Supply the final public URL before export for canonical links, sitemap and reliable nested 404 navigation. Noindex pages are excluded from the sitemap. Quality checks are basic hints; review content, contrast, accessibility and real devices before publishing.

Historical investigation attempts and the initial release are preserved in [the cloud log](docs/CLOUD_LOG.md) and [first findings](docs/FIRST_FINDINGS.md).

## v0.3 — WhatsApp shop

Studio tools → Shop manages up to 40 products with hosted images, options, availability and prices. Set the business WhatsApp number with country code, save products and insert a shop on a page. Full preview and ZIP exports support search, category filters, a shopping list, editable quantities, estimated subtotal, delivery details and a reviewed WhatsApp draft. The customer taps Send in WhatsApp. A copyable message is available as a fallback.

The exported shop needs no server or paid form service. Shopping lists and customer details stay in page memory and reset on navigation/reload. There is no payment processing, stock reservation or automatic order confirmation. See [shop guide](docs/SHOP_WORKFLOW.md).

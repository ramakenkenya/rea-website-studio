# REA Studio v0.2 — 50 additions

Open **Studio tools** beside the page bar. Everything below operates on real project data and is included in project backups where relevant. Exported websites remain ordinary static HTML/CSS.

| # | Addition | Where to use it |
|---|---|---|
| 1 | Blank pages | Pages → Add page |
| 2 | About, Products and Contact presets | Pages → Page layout |
| 3 | Duplicate complete pages and their styles | Pages → Duplicate page |
| 4 | Page names | Pages → Page name |
| 5 | Unique, validated URL slugs | Pages → Page URL slug |
| 6 | Choose the home page | Pages → Make home page |
| 7 | Confirmed deletion and last-page protection | Pages → Delete page |
| 8 | Reorder pages | Pages → Move earlier/later |
| 9 | Hide a page from navigation | Pages → Show in site navigation |
| 10 | Shared navigation across pages | Pages → Refresh site navigation |
| 11 | Per-page search title and description | Pages → Search fields |
| 12 | Linked multipage preview | Preview website |
| 13 | Coffee shop starter | Library → Coffee shop |
| 14 | Furniture showroom starter | Library → Furniture showroom |
| 15 | Personal portfolio starter | Library → Personal portfolio |
| 16 | Product grid | Library → Product grid |
| 17 | Image gallery | Library → Image gallery |
| 18 | Native FAQ accordions | Library → FAQ |
| 19 | Editable sample testimonials | Library → Testimonials |
| 20 | Team section | Library → Team |
| 21 | Editable sample pricing | Library → Pricing |
| 22 | Editable sample statistics | Library → Statistics |
| 23 | Call to action | Library → Call to action |
| 24 | Opening hours | Library → Opening hours |
| 25 | Social links | Library → Social links |
| 26 | Shared paper, text and accent colors | Brand → Palette fields |
| 27 | System font pairings | Brand → Font pairing |
| 28 | Content width | Brand → Content width |
| 29 | Corner radius | Brand → Corner radius |
| 30 | Embedded business logo | Brand → Upload business logo |
| 31 | Embedded favicon | Site → Upload favicon |
| 32 | Reusable image library | Assets → Upload / Insert |
| 33 | Image search | Assets → Search assets |
| 34 | Save and reuse styled sections | Library → Save selected section |
| 35 | Duplicate selected elements | Selection inspector |
| 36 | Per-device element visibility | Selection → Element visibility |
| 37 | Link destination and new-tab control | Selection → Link destination |
| 38 | Optional debounced autosave | History → Autosave |
| 39 | Five named restore points | History → Create / Restore |
| 40 | Save, undo and redo shortcuts | Ctrl/Cmd+S, Z, Shift+Z; Ctrl+Y |
| 41 | Find and select page text | Library → Find page text |
| 42 | Social image and sharing metadata | Site → Social sharing image URL |
| 43 | Language and text direction | Site → Language / Direction |
| 44 | Public URL and canonical links | Site → Public site URL |
| 45 | Sitemap for indexable pages | ZIP → sitemap.xml, after public URL is set |
| 46 | Robots guidance and page noindex | ZIP → robots.txt; Pages → Search visibility |
| 47 | Branded missing-page document | ZIP → 404.html |
| 48 | Basic site-wide accessibility checks | Checks → Headings, alt, link labels |
| 49 | Internal-page and fragment audit | Checks → Internal link destinations |
| 50 | Multipage publishing guide and checklist | ZIP → README.txt |

## A first project

1. Download a project backup of work you want to keep.
2. Start from your brief, or choose a starter under Library. A starter replaces only the selected page after confirmation.
3. Add pages, adjust names and slugs, then choose the home page. Navigation updates throughout the site.
4. Use Brand for shared colors, fonts and spacing. Upload original images in Assets.
5. Select canvas elements to change text, styles, links or device visibility. Save a useful section in Library.
6. Name a restore point before a large experiment. Save the project or enable autosave.
7. Add the final public URL and page metadata. Use Checks and Preview website.
8. Download the website ZIP and follow its README. Keep the project JSON separately for future editing.

## Verification scope

Pure tests check migration, constrained metadata, exported documents, link generation, safe imports, original blocks and templates. Installed-engine headless tests check deep cloning, independent CSS identities and unrendered page discovery. Recorded production-browser scenarios check save/reload/restore, drag and drop, phone controls, brief rebuilds, multipage ZIP navigation, brand/assets/history, invalid-setting recovery, long page names, navigation/home/order/visibility, styled section reuse, logos/favicon/metadata and the three starter packs.

These checks do not establish comprehensive accessibility conformance, search ranking, every browser/device combination or continuous recording of the coding session. The release walkthrough and test videos show real application actions; REA raw logs and source hashes provide separate investigation evidence.

Search visibility follows [Google's noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing): exported noindex pages retain the meta tag, stay crawlable and are omitted from sitemap.xml. Deploy robots.txt at the domain root; project-folder hosting cannot override a site's root robots.txt.

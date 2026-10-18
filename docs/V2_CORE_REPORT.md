# Studio v2 core implementation

Implemented `createStudio`, `pageFile`, `validateSlug`, `validateSiteUrl`, `brandCss`, `navigationHtml`, and `rewriteNavigation` in `src/site-model.js`. Studio metadata is reconciled against actual editor page IDs, preserves metadata page ordering, includes `site.name`, and uses validated defaults. Named checkpoints retain the first five supplied entries (the interface prepends newest) and remove nested checkpoint lists. Original encoded inline SVG and raster data images remain supported. Executable URLs, tags, attributes, components, encoded SVG payloads, unsafe metadata and malformed history entries are rejected. Limits cover pages, assets, saved sections, IDs, text, image size, traversal depth and object count.

`snapshot(brief, project)` remains schema 1. Passing studio metadata as a third argument creates schema 2; both schemas restore through `validateSnapshot`. Existing local storage key and backup size contract remain unchanged. GrapesJS `type: link` components remain valid.

`buildDocument`, `exportFiles`, and `siteZip` retain the old one-page APIs. Supplying studio metadata exports all Pages through `getMainComponent` and per-component HTML/CSS calls without changing editor selection. Outputs include page-specific HTML/CSS, shared studio.css, relative generated navigation, page metadata, favicon/social image/canonical metadata, robots.txt, a noindex 404 page, publishing guide and checklist, and sitemap.xml when a public URL exists. Navigation rewriting targets marked generated navigation and the exact legacy header.site-nav class; unrelated navigation and comments remain intact. A missing generated header is inserted for multipage projects. Palette rules use important where page CSS would otherwise override global controls; responsive hidden classes match the interface.

## Validation

- New tests were run failing before implementation; targeted security and compatibility regressions were likewise reproduced before fixes.
- `npm test`: 29 tests passed, including all 14 legacy tests and 15 new state/export tests.
- `npm run build`: passed. Existing Vite large GrapesJS chunk advisory and environment http-proxy warning remain informational.
- ZIP tests reopen the actual generated ZIP and verify all independently linked files and per-page styles.

## Limits

No DOM dependency is required by pure unit tests. Navigation replacement intentionally recognizes only generated/legacy Studio headers and marked navigation, rather than rewriting arbitrary custom links. Social images and uploaded assets may remain embedded data URLs; externally hosted image URLs still require that host. Sitemap omits noindex pages. Public site URL validation conservatively rejects local/private IPv4 addresses and IPv6 URLs. The static host must configure 404.html behavior. Browser-level integration and release are handled by the parent task.

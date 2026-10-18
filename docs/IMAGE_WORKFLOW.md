# Online pictures and galleries — v0.2.1

Rama requested removal of all image uploads in favor of free hosted pictures and image URLs. The existing app could embed small local images without a server, but those enlarged browser storage and project backups. This change follows the requested URL workflow while preserving old embedded-image projects.

## Use the studio

1. Open Studio tools → Assets → Find photos. Search a topic or use the seven ready-to-use CC0 pictures.
2. Save useful pictures, then open Saved pictures. Insert a picture, or replace the currently selected canvas image.
3. Alternatively, Add image URL accepts a direct public HTTPS image URL and description. The app checks that the picture loads before changing project data. User-supplied URLs have unverified rights; use your own or permitted images.
4. Tick between one and twelve saved pictures, name the gallery, and choose Create photo gallery. The responsive layout uses three, two or one columns depending on the screen width.
5. Brand → Business logo URL and Site → Favicon URL replace their upload controls. Image double-click and Choose online image lead to the same photo browser.
6. Save/reopen or back up the project. Photo URLs and source/creator/license records survive. Export includes the gallery HTML/CSS and IMAGE-CREDITS.txt when saved pictures exist. Gallery source captions are visible.

## Research and selection

| Provider | Findings | Decision |
|---|---|---|
| Wikimedia Commons | Public CORS API; file-specific license metadata; direct image URLs. Individual licenses vary. | Use the public API and restrict results to raster CC0 images with AttributionRequired=false and no listed restrictions. |
| Unsplash | Free image license, but API integration requires credentials, attribution and download-event handling. | No API integration in this static release. |
| Pexels | API key and request limits; API attribution rules. | No API integration in this static release. |
| Openverse | Anonymous browser API and license filters exist; the research environment returned HTTP403. | Not selected for this release. |

Sources checked 18 October 2026:
- https://www.mediawiki.org/wiki/API:Cross-site_requests
- https://www.mediawiki.org/wiki/API:Imageinfo
- https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia/technical
- https://creativecommons.org/publicdomain/zero/1.0/
- https://unsplash.com/api-terms
- https://www.pexels.com/api/documentation/
- https://api.openverse.org/v1/

The ready-photo records were obtained from the actual Commons imageinfo API, not invented image URLs. Each retains its file description page. The studio keeps its MIT license; photographs retain their own CC0 status. CC0 permits commercial reuse under copyright, while likeness, privacy and trademark rights can still apply. Source metadata is not a warranty of rights.

## Reliability and boundaries

One search runs at a time per browser pane, with a 15-second timeout and a small in-memory cache. Provider errors are shown, and ready photos plus manual image URLs remain available. Image loading has a 12-second timeout; failed URLs leave the project unchanged. The app uses no image API secret, proxy, paid SDK, image-upload server or new runtime package.

Pictures remain on their source hosts. They require internet access, may disappear and are not guaranteed permanent. Commons permits direct URL embedding but does not recommend depending on it for reliable hosting; production users can put permitted copies on their own static host and paste those URLs. No content is downloaded into the website ZIP by the new workflow. Older embedded images still export as before.

Verification covers URL constraints, CC0 filtering, curated records, source metadata, gallery markup, save/reopen, preview, ZIP output, error recovery, upload-input removal and a separate live provider search. Controlled browser scenarios use labeled image/API fixtures; the live scenario makes actual Wikimedia requests. Successful run links are recorded in the release PR and REA project log.

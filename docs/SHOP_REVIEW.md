# Shop implementation review — 2026-10-18

Scope: original static product catalog and shopping-list/WhatsApp request in REA Studio v0.3.0. Baseline main f2ab4617bdfde6e6c576f97693950eb288e5844d; scoped independent read-only review.

Review fixes:
- Trusted preview runtime now mounts after catalog HTML, inside an opaque sandbox. A unit regression failed before the change and passes afterward. Browser title assertions use the frame's document rather than parent same-origin access.
- Product image verification rebases its operation onto the latest shop state. New settings and deletions are retained; changed/canceled edits invalidate the pending request. Delayed-image browser regression covers phone/currency preservation.
- Shop section discovery traverses GrapesJS models on unrendered pages and ignores nested markers. Actual headless GrapesJS regressions observed 0 vs 1 and 2 vs 1 before fixes, and pass afterward.

64 Node tests and 7 Python tests pass locally; production Vite build passes. Full cloud browser suite is a separate release gate, including portable file:// export, phone layout and safe preview.

Deferred minor: Product pictures chosen from Assets retain their source credits while that saved asset remains in the project. Removing that asset can remove its credit record even though the product still references the photo. Keep source pictures in Assets to retain the ZIP's image-credit record. Current free-photo picker uses CC0, which does not require attribution; source records still aid provenance. No copied Mitumba code/photos or new dependency.

Testing never sends a real WhatsApp message or claims delivery. WhatsApp client availability and third-party image rights remain external; the reviewed draft and copy fallback are provided for customer action.

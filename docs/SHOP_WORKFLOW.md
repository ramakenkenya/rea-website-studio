# REA WhatsApp shop — v0.3

## Build a shop
1. Open Studio tools → Shop. Enter your business WhatsApp number with country code (for example +254712345678), choose the currency and save shop settings. Use your actual business number, not the example.
2. Add products: unique code, name, price, description, category and optional hosted HTTPS photo. Use a saved picture from Assets or paste a direct URL you have permission to reuse. Add comma-separated sizes/colours if needed.
3. Save each product. Edit or delete from the list. An unavailable product remains visible but cannot be requested. Prices use up to two decimal places.
4. Select the page and click Insert shop on this page. Only one shop is inserted on a page; clicking again refreshes it. Products/settings are shared across shop sections on all pages.
5. Use Full preview to test a shopping list, then Save project and export the website ZIP. Keep rea-shop.js and rea-shop.css beside all HTML files. Upload the complete ZIP contents to GitHub Pages or another static host.

Edit product content using Shop tools. Generated shop content is refreshed from the saved catalog when exported, so direct canvas edits to product cards are replaced. Re-export and republish after product or price changes.

## Customer journey
Search/filter → select size/colour and quantity → Add to shopping list → change quantity/remove products → enter name, contact, pickup/delivery and notes → Review shopping request → Open WhatsApp draft → tap Send in WhatsApp.

The list supports 12 distinct product-option combinations, with 1–99 of each. Identical options merge. The subtotal is an estimate excluding delivery. The business confirms availability and final pricing. No payment is collected and no stock is reserved.

Customer details/list stay in memory on that page; they reset on reload or navigating to another page. Nothing is stored or sent automatically. Opening WhatsApp shares the reviewed text through a wa.me URL. Customers can copy the message if WhatsApp is unavailable, the link is too long or the browser blocks opening another app. In preview/local files, clipboard permission may be unavailable: select the provided message and copy manually.

No WhatsApp number is supplied by default. If it is missing, the list can still be reviewed/copied, but there is no WhatsApp ordering link.

## Implementation and licensing
Original implementation under this repo's MIT license; no new dependency, API key, paid service or copied Mitumba photos/code. The owner's Mitumba repository supplied the reference journey, not a third-party component.

Official click-to-chat documentation: https://faq.whatsapp.com/5913398998672934 — full international phone number and URL-encoded pre-filled message. WhatsApp account/app or WhatsApp Web remains the customer's choice.

The full-site preview runs trusted code inside an opaque sandbox. Navigation messages are restricted to the actual preview frame and exported page names. Arbitrary executable project imports remain rejected.

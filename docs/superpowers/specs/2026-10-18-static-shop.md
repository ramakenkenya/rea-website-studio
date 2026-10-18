# REA static shop
Add an original MIT-licensed mini storefront inspired by the owner's Mitumba journey. No dependencies or copied third-party photos. Keep existing pages, hosted pictures, safe project imports and drawer UX.

Shop tools manage business WhatsApp (blank initially), currency KES/USD/EUR/GBP/UGX/TZS, delivery guidance and up to 40 products. Products have stable ID, unique code, name, decimal price, description, category, hosted HTTPS photo, comma-separated sizes/colours and availability. Save shop updates marked shop sections across pages; insert adds to current page. Existing projects default to an empty shop.

Visitor journey: search/filter products, select variants/quantity, add to a shopping list, change quantities/remove, see estimated subtotal, enter name/phone/pickup or delivery/location/notes, review a prepared order, open WhatsApp draft or copy the text. Max 12 distinct variants and 99 of each, merge identical variants. Customer details stay in memory and clear on reload. No payment, inventory reservation or sent confirmation. Business confirms price/availability/delivery.

Exports include trusted classic JS/CSS only when a shop exists. Local file and GitHub Pages paths work. Preview scripts run in an opaque sandbox without same-origin privileges; navigation uses source-checked messages. Imported scripts remain prohibited. Missing recipient blocks WhatsApp and explains setup; copy fallback stays available.

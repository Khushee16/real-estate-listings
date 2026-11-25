# Haven Homes — fictional property search site

A self-directed portfolio piece by Khushi Khatri. **Haven Homes is an invented agency — not a real client, not a real brokerage.** All listings, prices, agents and addresses are fictional demo content.

## What it is
A polished, responsive multi-page property search site:
- `index.html` — home / hero / featured listings (first 3) / how it works
- `listings.html` — search by keyword, filter by type / max price / min bedrooms, sort by price, bedrooms or size
- `property.html?id=…` — detail page driven by the `id` query param: photo gallery with clickable thumbnails, features, agent card and a contact-agent form

## Stack
- HTML5, CSS3, vanilla JavaScript
- Bootstrap 5 (CDN)
- Google Fonts: Fraunces + Inter
- Images: `picsum.photos` seeded placeholder URLs
- Backend: plain dependency-free PHP (`listings.php`, `contact.php`) — no frameworks, no database, no Composer

## Backend
- `listings.php` serves `data/listings.json` as JSON, with optional `type`, `min_price`, `max_price` and `min_beds` query filters. The frontend tries this endpoint first.
- `contact.php` accepts a JSON POST from the agent contact form, validates property / name / email / phone / message, and appends the enquiry to `data/enquiries.json`, returning a JSON confirmation with a reference number (e.g. `HQ-7B2E91`).

**The PHP runs on a PHP host, not on GitHub Pages.** GitHub Pages is static-only and cannot execute PHP. To use the live backend, upload this folder to any cheap shared PHP host (or run `php -S localhost:8000` locally).

## Demo mode (static hosting)
- Listings: when `listings.php` is unavailable, the frontend falls back to the embedded copy in `assets/js/data.js` (generated from the same `data/listings.json`) and shows a clearly-labelled **"Demo mode — no backend connected"** note. Search, filters and sorting all still work.
- Contact form: when `contact.php` is unavailable, submitting shows a clearly-labelled **"Demo mode — no backend connected"** message. Nothing is faked: no message is sent and no confirmation is pretended.

## How to run locally
Static demo (fallback data + demo contact state):
```bash
cd real-estate-listings
python3 -m http.server 8000
# open http://localhost:8000/
```

With the real PHP backend:
```bash
php -S localhost:8000
# open http://localhost:8000/ — listings come from listings.php, contact form posts to contact.php
```

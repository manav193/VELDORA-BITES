# VELDORA BITES

A responsive luxury restaurant portfolio project translated from the Velora Bites design concept. The experience combines editorial typography, a warm dark palette, a full photographic menu, persistent cart state, offers, and a simulated ordering flow.

![Velora Bites desktop experience](https://raw.githubusercontent.com/manav193/MY-PORTFOLIO/main/frontend/images/velora_desktop.png)

[View the full hospitality case study](https://my-portfolio-mu-jade-52.vercel.app/project-velora-bites.html)

## Product direction

VELDORA BITES treats restaurant ordering as a premium hospitality experience rather than a generic delivery interface. Food photography carries the visual hierarchy while restrained typography, spacing, and warm accent colors maintain the luxury tone.

## Highlights

- Responsive desktop, tablet, and mobile layouts
- Homepage with brand introduction and five daily specials
- Dedicated menu and orders pages
- Persistent bottom cart bar on browsing pages
- INR pricing across the menu
- Filterable 40-item menu covering Italian, Indian and chaat, desserts, and drinks
- Quantity controls, remove and clear actions
- Live subtotal, delivery, service-fee, discount, and free-delivery calculations
- Coupon engine with minimum-order rules
- Simulated UPI and card offers
- Delivery-detail validation and order confirmation
- Local recent-order history
- PWA metadata and offline app-shell caching
- Accessible navigation, focus states, and reduced-motion handling

## Responsive experience

![Velora Bites mobile experience](https://raw.githubusercontent.com/manav193/MY-PORTFOLIO/main/frontend/images/velora_mobile.png)

Desktop layouts use expansive imagery and editorial spacing, while the mobile interface increases touch-target size and converts the experience into a vertically paced concierge-style flow.

## Technology

- Semantic HTML5
- CSS Grid and Flexbox
- CSS design tokens and hardware-accelerated transitions
- Vanilla JavaScript
- Service Worker
- Web App Manifest
- Local browser storage

## Run locally

```bash
git clone https://github.com/manav193/VELDORA-BITES.git
cd VELDORA-BITES
python -m http.server 8000
```

Open `http://localhost:8000`.

## Project structure

```text
.
├── assets/
├── index.html
├── menu.html
├── orders.html
├── menu-data.js
├── manifest.webmanifest
├── sw.js
├── styles.css
├── script.js
├── orders.js
└── README.md
```

## Important demo notice

Ordering, coupons, UPI validation, card selection, receipts, and payment-related interactions are simulations only. The project does not process real payments or submit real restaurant orders.

## Media attribution

Food photography is sourced from royalty-friendly stock libraries such as Unsplash, Pexels, and Pixabay. Review source files and image URLs before redistribution or commercial deployment.

## Author

Designed and developed by [Manav Agarwal](https://github.com/manav193).

## License

All rights reserved unless the repository license states otherwise.

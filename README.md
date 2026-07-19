# Velora Bites

A responsive luxury restaurant landing page translated from the Velora Bites Figma concept. The site pairs editorial typography with a dark, warm palette and interactive ordering details.

## Highlights

- Responsive desktop, tablet, and mobile layouts
- Focused homepage with brand intro and five rotating-style Daily Specials
- Dedicated full Menu page linked from both the navbar and homepage call-to-action
- Persistent bottom cart bar on every page with live item count, rupee subtotal, and order shortcut
- Affordable INR pricing across the complete menu
- Filterable 40-item photographic menu with 10 Italian, Indian & chaat, dessert, and drinks choices
- Dedicated premium Orders page linked directly from the main navigation
- Custom transparent Velora Bites monogram logo generated for the brand
- Persistent order cart with quantity controls and remove/clear actions
- Live subtotal, delivery, service-fee, and free-delivery calculations
- Validated delivery details and order-confirmation flow
- Mobile navigation with accessible state handling
- Scroll-reveal motion with reduced-motion support
- Weekend offer, service benefits, reviews, and newsletter sections
- Semantic HTML and keyboard-friendly controls

## Run locally

No build step or dependency install is required.

```bash
python -m http.server 8000
```

Open `http://localhost:8000` in a browser.

## Structure

```text
.
├── assets/
│   └── velora-logo.png
├── index.html
├── menu.html
├── orders.html
├── menu-data.js
├── styles.css
├── script.js
├── orders.js
└── README.md
```

## Design direction

The implementation follows the supplied Figma export: near-black surfaces, cream serif headlines, amber calls to action, warm plated-dish artwork, compact luxury cards, and a mobile-first stacked composition.

## Photography

Food photography is sourced from royalty-friendly stock libraries including Unsplash, Pexels, and Pixabay, and displayed with custom warm color grading. Key sources include:

- Fine dining hero: [liuyun wu on Unsplash](https://unsplash.com/photos/a-plate-of-food-on-a-table-with-a-glass-of-wine-9osoakefXmQ)
- Truffle risotto: [Luca Luperto on Pexels](https://www.pexels.com/photo/risotto-on-a-white-plate-17237178/)
- Biryani: [shouravsheikh on Pixabay](https://pixabay.com/photos/biryani-rice-food-chicken-beef-7009119/)
- Tiramisu: [Valeria Boltneva on Pexels](https://www.pexels.com/photo/close-up-of-delicious-tiramisu-dessert-in-glass-34759483/)
- Citrus drink: [Anilsharma26 on Pixabay](https://pixabay.com/photos/orange-drink-cocktail-mocktail-7235139/)
- Spaghetti: [Divily on Pixabay](https://pixabay.com/photos/spaghetti-pasta-food-2931846/)
- Italian pizza: [u_1bwwkhd429 on Pixabay](https://pixabay.com/photos/pizza-italian-food-italian-cuisine-7530132/)
- Butter chicken and naan: [blandinejoannic on Pixabay](https://pixabay.com/photos/naan-butter-chicken-indian-food-5154130/)
- Tandoori chicken: [ArtificialOG on Pixabay](https://pixabay.com/photos/tandoori-chicken-tikka-indian-food-3856045/)
- Lava cake: [AnghelMihaela on Pixabay](https://pixabay.com/photos/lava-cake-chocolate-molten-chocolate-9427576/)
- Chocolate cake: [RitaE on Pixabay](https://pixabay.com/photos/cakes-chocolate-cake-chocolate-4502270/)
- Berry spritz: [RitaE on Pixabay](https://pixabay.com/photos/cocktail-prosecco-berry-drink-3516654/)
- Blueberry cooler: [dennisyang988 on Pixabay](https://pixabay.com/photos/blueberry-beverage-juice-2350367/)

## License

This project is intended for the Velora Bites brand concept. All rights reserved.

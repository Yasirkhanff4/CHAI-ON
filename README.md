# CHAI ON

**Your Office. Your Chai.**

A professional tea ordering and management system for CHAI ON — 3rd Floor, Al Ghaffar Mall, G-11 Markaz, Islamabad.

The product has exactly two panels: a **customer website** and a **secure admin panel**. Delivery management lives inside the admin panel; there is no third application.

---

## Current status

**Phase 2 — complete.** Menu, tea customization and the cart are live.

Live now:

- Responsive brand shell (header, announcement bar, mobile drawer, footer)
- Homepage: hero, trust strip, featured teas, office-delivery explainer, tea customization panel, contact cards, closing CTA
- Menu page: Doodh Patti and Karak Chai with per-cup sugar (no/less/normal/extra) and strength (light/normal/strong) selection
- Cart: quantity controls, line customization details, line prices, subtotal, delivery charge and total, remove/clear, cart badge in the header
- Cart persists in `localStorage` (`chai-on:cart:v1`), is re-priced from the catalog on load, and silently drops unknown or unavailable products
- Contact page with real address, hours, directions link and phone link
- Checkout, confirmation, account, tracking and admin routes reserved with honest "coming soon" screens
- 404 page, skip-to-content link, reduced-motion support, page titles
- Production build, type-check and lint all passing; Lighthouse 100 accessibility / 100 best practices / 100 SEO on menu and cart

Deliberately not built yet (later phases): checkout, Firebase, admin panel, tracking. Cart prices are display values refreshed from the local catalog; they are not trusted for order creation — totals will be recalculated server-side in Phase 4. All prices and product copy are launch defaults that will become admin-managed Firestore data.

---

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (design tokens in `src/index.css`)
- React Router
- Lucide React icons
- Firebase Auth / Firestore / Cloud Functions (Phase 4+)
- Vercel (frontend), Git + GitHub

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run lint       # oxlint
npm run preview    # preview the production build
```

Node 20.19+ is required (Vite 8).

---

## Project structure

```
public/
  images/                 Optimised tea photography (local, no hotlinks)
  favicon.svg
src/
  components/
    brand/Logo.tsx
    cart/                  Cart line items, summary, toast
    contact/ContactCards.tsx
    home/                  Homepage sections (Hero, TrustStrip, ...)
    layout/                Header, Footer, SiteLayout, ScrollToTop
    menu/                  Menu product card with sugar/strength controls
    ui/                    Button, Container, SectionHeading, PageIntro, QuantityStepper
  context/                 CartProvider + useCart
  data/
    menu.ts                Products + sugar/strength options and labels
    site.ts                Business details, navigation, order settings
  lib/
    buttonStyles.ts        Shared button styling for links and buttons
    cart.ts                Cart line ids, totals, localStorage read/write
    format.ts              PKR formatter
    useDocumentTitle.ts
  pages/                   Home, Menu, Cart, Contact, ComingSoon, NotFound
  types/index.ts           Product, cart, order status and customization types
  App.tsx                  Routes
  index.css                Tailwind theme and global styles
```

---

## Business configuration

All customer-facing business details live in **`src/data/site.ts`**:

- Phone number — currently a **placeholder** (`+92 300 000 0000`). Replace `phoneDisplay` and `phoneHref` before launch.
- Address, opening hours, Google Maps link.

Product names, descriptions and prices live in **`src/data/menu.ts`**. The launch defaults are:

| Product | Price |
| --- | --- |
| Doodh Patti | Rs 150 |
| Karak Chai | Rs 180 |

Adjust these values once the owner confirms the real prices. Both files will be superseded by Firestore `settings` / `products` in Phase 4–5.

Cart pricing rules live in `orderSettings` in `src/data/site.ts`: flat delivery charge (currently free), optional minimum order, and the maximum cups per product/customization line. These move to the admin-managed Firestore `settings` document in a later phase.

---

## Photography

Photos are stored locally under `public/images/` so the site has no runtime dependency on external image hosts. Source: [Pexels](https://www.pexels.com/license/) (free to use, no attribution required — credited in the footer as a courtesy).

| File | Pexels photo |
| --- | --- |
| `hero-chai.jpg` | [11833310](https://www.pexels.com/photo/11833310/) |
| `doodh-patti.jpg` | [17473023](https://www.pexels.com/photo/17473023/) |
| `karak-chai.jpg` | [20270270](https://www.pexels.com/photo/20270270/) |
| `office-delivery.jpg` | [34324342](https://www.pexels.com/photo/34324342/) |

---

## Roadmap

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Setup, branding, navigation, responsive homepage | Done |
| 2 | Menu, product cards, customization, cart | Done |
| 3 | Checkout, guest ordering, confirmation | Next |
| 4 | Firebase setup, customer auth, secure order storage | Pending |
| 5 | Admin login, dashboard, order management | Pending |
| 6 | Order tracking, delivery management in admin | Pending |
| 7 | Testing, security rules, bug fixing, deployment | Pending |

Security intent for later phases: guest checkout stays available, admin registration is never public, order totals are recalculated server-side, guest tracking requires order number + matching phone, and Firestore rules deny by default.

---

## Deployment

`vercel.json` includes an SPA rewrite so deep links such as `/contact` work on Vercel. Build command `npm run build`, output directory `dist`.

Firebase environment variables are not required until Phase 4. No secrets belong in the frontend.

---

## Version control

Git is initialised locally. To publish:

```bash
git remote add origin https://github.com/<your-account>/chai-on.git
git push -u origin main
```

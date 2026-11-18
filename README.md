# CHAI ON

**Your Office. Your Chai.**

Tea ordering and management for CHAI ON — 3rd Floor, Al Ghaffar Mall, G-11 Markaz, Islamabad.

The product has exactly **two panels**: the customer website and a **secure admin panel**. Delivery management lives inside the admin panel; there is no third application.

---

## Status

**Phases 1–7 implemented.** Storefront, cart, guest and registered checkout, Firebase
accounts, trusted order creation, admin panel, delivery management, guest tracking,
security rules and deployment documentation are all in the repository and verified by
the checks listed below.

Two things have **not** been done, because they need your accounts:

1. **No Firebase project is bound yet.** Without `VITE_FIREBASE_*` values the app runs
   in **local mode**: the storefront, cart and checkout work against a local adapter,
   while accounts, admin and tracking show a clear "not configured" notice. Order
   storage in local mode is not production storage — see
   [Where orders live without Firebase](#where-orders-live-without-firebase).
2. **Nothing is deployed.** Functions, security rules, indexes and the Vercel site must
   be deployed by you. Follow [DEPLOYMENT.md](DEPLOYMENT.md).

---

## What was built

### Customer website

- Responsive brand shell, homepage, menu, contact page
- Doodh Patti and Karak Chai with per-cup sugar (no/less/normal/extra) and strength
  (light/normal/strong)
- Cart with quantity controls, line customization, live prices, delivery charge, badge
  and `localStorage` persistence, re-priced from the live catalog
- **Guest checkout** — no account, ever required
- Checkout with full name, Pakistani mobile validation, building, floor, office/shop and
  optional delivery instructions; loading, error, offline and paused-ordering states
- Trusted totals: prices, availability, delivery charge, minimum order and opening hours
  are re-checked server-side by the `createOrder` Cloud Function
- Duplicate-submission protection: the button locks while submitting and a per-attempt
  request key makes retries idempotent
- Order confirmation with human-readable order number (`CO-YYMMDD-XXXX`), full summary,
  delivery details, COD and a Track Order button; the cart clears only after success
- Customer accounts: register, login, logout, forgot/reset password, persistent session,
  editable name and phone, order history and order detail pages
- Guest order tracking by order number + phone, with a real timeline and rate limiting

### Admin panel (`/admin`)

- Separate login; **no public admin registration**; roles come from Firebase custom
  claims, verified by rules and the UI
- Dashboard: today's orders, pending, completed today, today's sales — real Firestore
  data only, with loading/error/empty states
- Orders: search by number/name/phone/building, status filter, full details, and every
  status transition guarded by an allowed-moves map (accept, reject, preparing, ready,
  out for delivery, delivered, cancel, delivery failed)
- Manual COD confirmation (`Confirm cash received` → `PAID`)
- Products: add, edit price/description/badge/order, availability, public visibility and
  photo upload to Firebase Storage
- Settings: business name, contact phone, delivery charge, minimum order, opening and
  closing time, and an online-ordering pause switch — reflected on the site immediately
- Delivery: ready orders, assign/reassign delivery staff, monitor progress
- **Delivery staff** sign into the same panel with restricted access: only their assigned
  orders, only delivery statuses, no products/settings/sales

---

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (design tokens in `src/index.css`)
- React Router 7, Lucide icons
- Firebase Auth, Firestore, Storage, Cloud Functions (Node 20, `asia-south1`)
- Vercel (frontend)

---

## Getting started (no Firebase needed)

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run lint       # oxlint
npm run preview    # preview the production build
```

Node 20.19+ is required (Vite 8).

Add a `.env` (see `.env.example`) to enable Firebase. `DEPLOYMENT.md` walks through the
whole setup: project, Auth, Firestore, Storage, functions, rules, admin provisioning and
Vercel.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Web API key (public) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Project id |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender id |
| `VITE_FIREBASE_APP_ID` | Web app id |
| `VITE_FIREBASE_USE_EMULATORS` | `true` to use the local emulator suite |

All `VITE_*` variables are public. Service-account credentials live in
`GOOGLE_APPLICATION_CREDENTIALS` for the provisioning script only, never in the frontend.

---

## Data model

```
users/{uid}       uid, name, email, phone, role, createdAt, updatedAt
products/{id}     name, description, imageUrl, imagePosition, badge, price,
                  isAvailable, isActive, sortOrder, createdAt, updatedAt
orders/{orderNumber}
                  orderId, orderNumber, customerId|null, customerName, phone,
                  building, floor, officeOrShop, deliveryInstructions, items[],
                  itemCount, subtotal, deliveryCharge, total, paymentMethod,
                  paymentStatus, orderStatus, assignedTo, assignedToName,
                  deliveryNotes, statusHistory[], createdAt, updatedAt
settings/store    businessName, contactPhone, deliveryCharge, minimumOrder,
                  openingTime, closingTime, isOrderingOpen, updatedAt
orderRequests/*   idempotency keys (Admin SDK only)
rateLimits/*      tracking/order attempt windows (Admin SDK only)
```

Order document ids are the order number, so a lookup never needs a query.

---

## Cloud Functions

| Function | Purpose |
| --- | --- |
| `createOrder` | Validates details, products, availability, quantity, customization and settings; recomputes all totals; generates the order number; writes the order idempotently. Guest or signed-in. |
| `trackOrder` | Order number + phone lookup with rate limiting; returns only tracking-safe fields. |
| `setUserRole` | Super-admin-only role provisioning (custom claims + `users/{uid}`). |

Region: `asia-south1`. Change `REGION` in `functions/src/index.ts` and
`FUNCTIONS_REGION` in `src/lib/firebase/config.ts` together if you deploy elsewhere.

---

## Tests and checks

```bash
npm run build            # tsc -b + vite build
npm run lint             # oxlint (0 errors; 4 advisory set-state-in-effect warnings)
npm run functions:build  # Cloud Functions TypeScript
npm run test:rules       # 37 Firestore security-rule assertions (emulator)
npm run test:orders      # 20 trusted order-function assertions (emulator)
```

`test:rules` and `test:orders` start the Firebase Emulator Suite with
`--project demo-chaion` and never touch production. Java 21 is installed locally and was
used for these runs.

What the order tests prove: prices come from Firestore (a tampered `unitPrice` is
ignored), unavailable/unknown products are refused, zero and >20 quantities are refused,
invalid phones and customizations are refused, retries return the same order and create
nothing new, the configured delivery charge and minimum order apply, paused ordering is
refused, and failed attempts leave no order behind.

What the rules tests prove: guests cannot read or list orders; customers read only their
own order and profile; nobody can create or delete an order client-side; customers cannot
alter totals, payment status, order status, prices or their own role; admins can manage
orders/products/settings; delivery staff see only assigned orders and only set delivery
statuses; `orderRequests` and `rateLimits` are client-invisible.

---

## What still needs you

- **Firebase binding** and deploying rules/indexes/functions (`DEPLOYMENT.md` §2–4)
- **First super admin** via `functions/scripts/provision-admin.mjs` (§5)
- **Vercel deployment** and adding the domain to Firebase Auth's authorized domains (§6)
- **Real business data**: the phone number is still the placeholder
  `+92 300 000 0000` in `src/data/site.ts`; prices, delivery charge, minimum order and
  hours are launch defaults until changed in the admin panel
- A pass through the launch checklist on the live domain

---

## Where orders live without Firebase

`src/services/orders.ts` is the only entry point the UI uses. With Firebase configured it
calls the `createOrder` / `trackOrder` functions. Without it, it falls back to
`src/lib/orders/localOrderStore.ts` (this browser's `localStorage`), which exists so the
storefront and checkout stay testable. That fallback is **not** secure order storage and
must not be treated as production. Prices are always recalculated from the catalog, never
taken from the browser payload, in both modes.

---

## Project structure

```
functions/
  src/index.ts             createOrder, trackOrder, setUserRole
  src/order.ts             shared trusted pricing, validation, hours, rate keys
  scripts/provision-admin.mjs
src/
  components/
    admin/                 Admin shell, route guards
    auth/                  Auth shell, RequireAuth
    cart/ checkout/ contact/ home/ layout/ menu/ orders/ ui/
  context/                 Auth, Catalog, Settings, Cart providers
  data/                    menu.ts (launch catalog), site.ts, settings.ts (defaults)
  lib/
    firebase/              config + error translation
    orders/                pricing, mapping, order number, idempotency, local adapter
    cart.ts checkoutValidation.ts openingHours.ts orderFlow.ts orderStatus.ts
    phone.ts format.ts buttonStyles.ts useDocumentTitle.ts
  pages/                   Customer pages
  pages/admin/             Dashboard, orders, order detail, delivery, products, settings, login
  services/                catalog.ts settings.ts orders.ts admin.ts
  types/                   Product/cart/order types
tests/
  firestore.rules.test.mjs
  order.functions.test.mjs
firestore.rules  storage.rules  firestore.indexes.json  firebase.json
DEPLOYMENT.md
```

---

## Business configuration

- Business details, navigation and cart limits: `src/data/site.ts`
- Launch product catalog (a fallback only — Firestore products take over): `src/data/menu.ts`
- Store settings defaults: `src/data/settings.ts`; live values come from `settings/store`
- Product photography lives in `public/images/` (Pexels, credited in the footer)

---

## Photography

Photos are stored locally under `public/images/` so the site has no runtime dependency on
external image hosts. Source: [Pexels](https://www.pexels.com/license/) — free to use, no
attribution required (credited in the footer as a courtesy).

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
| 3 | Checkout, guest ordering, confirmation | Done |
| 4 | Firebase, customer auth, secure order storage | Done (code + emulator tests) |
| 5 | Admin login, dashboard, order and product management | Done |
| 6 | Order tracking, delivery management in admin | Done |
| 7 | Testing, security rules, bug fixing, deployment preparation | Done (deploy is yours) |

---

## Version control

```bash
git add .
git commit -m "Phases 4–7: Firebase auth, trusted orders, admin, tracking, security rules"
```

# CHAI ON

**Your Office. Your Chai.**

Tea ordering and management for CHAI ON, 3rd Floor, Al Ghaffar Mall, G-11 Markaz, Islamabad.

The product has exactly **two panels**: the customer website and a **secure admin panel**. Delivery management lives inside the admin panel; there is no third application.

---

## Status

**Phases 1–7 implemented.** Storefront, cart, guest checkout, admin panel, delivery
management, guest tracking, security rules and deployment documentation are all in the
repository and verified by the checks listed below.

There are **no customer accounts**: checkout is guest-only and the only email/password
sign-in is the staff panel. The app is built for the **free Firebase Spark plan**:
anonymous guest sessions, orders, guest tracking and the admin panel use Firebase Auth
and Firestore directly. **No Cloud Function, Blaze upgrade, paid service or external backend is
required.** Prices are calculated from the live Firestore catalog in the browser and
pinned by security rules (see [Security model](#security-model)).

The updated `firestore.rules` still has to be deployed by you, and the Vercel site is
not published. Follow [DEPLOYMENT.md](DEPLOYMENT.md). Without `VITE_FIREBASE_*`
values the app runs in **local mode** for design work only. See
[Where orders live without Firebase](#where-orders-live-without-firebase).

---

## What was built

### Customer website

- Responsive brand shell, homepage, menu, contact page
- Doodh Patti and Karak Chai with per-cup sugar (no/less/normal/extra) and strength
  (light/normal/strong)
- Cart with quantity controls, line customization, live prices, delivery charge, badge
  and `localStorage` persistence, re-priced from the live catalog
- **Guest checkout**, no account ever required
- Checkout with full name, Pakistani mobile validation, building, floor, office/shop and
  optional delivery instructions; loading, error, offline and paused-ordering states
- Totals rebuilt from the live Firestore catalog before checkout; rules pin the
  owner, statuses, payment method and money on the order document
- Guest checkout backed by a short-lived anonymous Firebase session, so the order has
  an owner and stays trackable on the device that placed it
- Duplicate-submission protection: the button locks while submitting and a per-attempt
  request key makes retries idempotent
- Order confirmation with human-readable order number (`CO-YYMMDD-XXXX`), full summary,
  delivery details, COD and a Track Order button; the cart clears only after success
- **Order on WhatsApp** button (header, mobile menu and cart) pre-filled with the cart
  items, customizations and total, opening `wa.me/923291018591`
- Order tracking by order number on the device/browser that placed the order, with a
  real timeline and a WhatsApp fallback for other devices

### Admin panel (`/admin`)

- Separate login; **no public admin registration**; roles come from Firebase custom
  claims, verified by rules and the UI
- Dashboard: today's orders, pending, completed today, today's sales, real Firestore
  data only, with loading/error/empty states
- Orders: search by number/name/phone/building, status filter, full details, and every
  status transition guarded by an allowed-moves map (accept, reject, preparing, ready,
  out for delivery, delivered, cancel, delivery failed)
- Manual COD confirmation (`Confirm cash received` → `PAID`)
- Products: add, edit price/description/badge/order, availability, public visibility and
  a photo path or URL (e.g. `/images/doodh-patti.jpg`), no Firebase Storage needed
- Settings: business name, contact phone, delivery charge, minimum order, opening and
  closing time, and an online-ordering pause switch, reflected on the site immediately
- Delivery: ready orders, assign/reassign delivery staff, monitor progress
- **Delivery staff** sign into the same panel with restricted access: only their assigned
  orders, only delivery statuses, no products/settings/sales

---

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (design tokens in `src/index.css`)
- React Router 7, Lucide icons
- Firebase Auth (Anonymous for guest checkout, Email/Password for staff) and
  Firestore (Spark plan, no Storage, no Cloud Functions)
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
whole setup: project, Auth, Firestore, rules, admin provisioning and Vercel.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Web API key (public) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Project id |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender id |
| `VITE_FIREBASE_APP_ID` | Web app id |
| `VITE_FIREBASE_USE_EMULATORS` | `true` to use the local emulator suite |

All `VITE_*` variables are public. Service-account credentials live in
`GOOGLE_APPLICATION_CREDENTIALS` for the provisioning script only, never in the frontend.

---

## Data model

```
users/{uid}       uid, name, email, phone, role, createdAt, updatedAt (staff only)
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
```

Order document ids are the order number, so a lookup never needs a query.

---

## Guest checkout and tracking

1. Checkout is guest-only. There is no customer registration, login or account page
   anywhere on the site. At checkout the app creates a Firebase **anonymous** session
   and writes the order with `customerId` = that uid.
2. The anonymous session is invisible to the customer: nothing has to be created,
   verified or remembered, and no personal details are stored in the browser.
3. A guest follows an order with its order number **on the same
   device/browser/session** (the anonymous session owns the order). From another
   device the order cannot be read; WhatsApp is the fallback.

Tracking is deliberately owner-only, so the rules never expose an order by number
alone. The confirmation page always shows the order number and a Track button.

Enable **Anonymous** (guest checkout) and **Email/Password** (staff sign-in) providers
in Firebase Authentication. Anonymous sign-in is required: without it checkout cannot
write an order. No admin can ever be created from the customer site; roles come from
custom claims set by the provisioning script. See
[Admin setup](#admin-setup-spark-plan).

---

## WhatsApp ordering

`src/data/site.ts` holds the number and base link:

```ts
whatsappNumber: '923291018591'
whatsappUrl: 'https://wa.me/923291018591'
```

`buildWhatsAppOrderUrl` (`src/lib/whatsapp.ts`) turns the current cart into a message
such as:

```
Assalam-o-Alaikum CHAI ON!
Mujhe ye order karna hai:

• 2 x Doodh Patti
  Sugar: Less Sugar | Strength: Strong | Rs 300
• 1 x Karak Chai
  Sugar: Normal Sugar | Strength: Normal | Rs 180

Subtotal: Rs 480
Delivery: Free
Total: Rs 480

Naam: Ahmed Raza
Building / Plaza: Al Ghaffar Mall
Floor: 3rd Floor
Office / Shop: Office 302
```

Nothing is sent until the customer presses send inside WhatsApp. The button appears in
the desktop header (wide screens), the mobile menu and the cart summary.

---

## Admin setup (Spark plan)

There is no public admin registration. The first account is provisioned with the
Firebase Admin SDK from your own computer (no Cloud Functions, no Blaze):

```bash
# 1. Firebase Console → Project settings → Service accounts → Generate new private key
# 2. Save the JSON outside this repository, then from the project root:
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
  node functions/scripts/provision-admin.mjs --email you@example.com --role SUPER_ADMIN --name "Owner"
```

The script creates the account without a password, sets the `SUPER_ADMIN` **custom
claim** and mirrors the role in `users/{uid}`. Open `/admin/login`, use **Forgot
password?**, set a password, then sign in. `--email` accepts any real account email; nothing is
hardcoded. Delete the service-account JSON afterwards.

Roles: `SUPER_ADMIN`, `ADMIN`, `DELIVERY_STAFF`, `CUSTOMER`. A customer can never
assign themselves a role: the `users` rule allows only `name`, `phone` and `updatedAt`
updates, and every admin route reads the claim from the ID token.

---

## Security model

Firestore rules enforce ownership and document shape:

- an order must be created by the signed-in uid it belongs to, as `NEW`, `UNPAID`,
  `COD`, with `total == subtotal + deliveryCharge` and a single `NEW` history entry;
- customers can read only their own orders (and a missing order number reads as null,
  which lets checkout pick an unused number);
- a profile document can only be read or written by its own owner with a real
  (non-anonymous) email token. Only staff accounts exist, and the role can never be
  changed from the browser;
- admins may change status/payment/assignment; delivery staff only their assigned
  orders and only delivery statuses;
- products are public only when active; settings are public read, admin write.

Because Spark has no server code, the browser builds the cart totals from Firestore
products rather than from the cart payload. A determined visitor could still hand-craft
an order document with a lower unit price; staff see every total before accepting and
the shop only loses tea, never money. If you later move to Blaze, the `functions/`
`createOrder` function re-prices everything server-side and is kept for that path.

---

## Tests and checks

```bash
npm run build            # tsc -b + vite build
npm run lint             # oxlint (0 errors; 4 advisory set-state-in-effect warnings)
npm run test:rules       # 62 Firestore security-rule assertions (emulator)
npm run functions:build  # optional legacy Cloud Functions build (not used on Spark)
```

`test:rules` starts the Firebase Emulator Suite with `--project demo-chaion` and never
touches production. Java 21 is installed locally and was used for these runs. The old
`test:orders` npm script was removed with the Functions path; `tests/order.functions.test.mjs`
is kept for reference only.

What the rules tests prove: customers can create only their own order, only as a new,
unpaid COD order with a consistent total; anonymous guests can own an order but cannot
create a profile; customers read only their own order and profile; nobody can delete an
order or alter totals, payment status, order status, prices or their own role; a missing
order number reads as null; admins manage orders/products/settings; delivery staff see
only assigned orders and only set delivery statuses.

---

## What still needs you

- **Firebase binding** and deploying rules/indexes only (`DEPLOYMENT.md` §2–4)
- **First super admin** via `functions/scripts/provision-admin.mjs` (§5)
- **Vercel deployment** and adding the domain to Firebase Auth's authorized domains (§6)
- **Real business data**: the phone number in `src/data/site.ts` is now
  `+92 329 1018591`. Make sure Settings → contact phone matches it. Prices, delivery
  charge, minimum order and hours are launch defaults until changed in the admin panel
- A pass through the launch checklist on the live domain

---

## Where orders live without Firebase

`src/services/orders.ts` is the only entry point the UI uses. With Firebase configured it
writes the order to Firestore under the signed-in (or anonymous) session. Without it, it falls back to `src/lib/orders/localOrderStore.ts` (this browser's
`localStorage`), which exists so the storefront and checkout stay testable. That fallback
is **not** secure order storage and must not be treated as production. Prices are always
recalculated from the catalog, never taken from the cart payload, in both modes.

---

## Project structure

```
functions/
  src/index.ts             legacy createOrder, trackOrder, setUserRole (not used on Spark)
  src/order.ts             legacy shared trusted pricing, validation, hours
  scripts/provision-admin.mjs
src/
  components/
    admin/                 Admin shell, route guards, live new-order alerts
    auth/                  Password-reset shell
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
  order.functions.test.mjs   (legacy, not in npm scripts)
firestore.rules  firestore.indexes.json  firebase.json
DEPLOYMENT.md
```

---

## Business configuration

- Business details, navigation and cart limits: `src/data/site.ts`
- Launch product catalog (a fallback only, Firestore products take over): `src/data/menu.ts`
- Store settings defaults: `src/data/settings.ts`; live values come from `settings/store`
- Product photography lives in `public/images/` (Pexels, credited in the footer)

---

## Photography

Photos are stored locally under `public/images/` so the site has no runtime dependency on
external image hosts. Source: [Pexels](https://www.pexels.com/license/), free to use, no
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
| 4 | Firebase, guest sessions, secure order storage | Done (code + emulator tests) |
| 5 | Admin login, dashboard, order and product management | Done |
| 6 | Order tracking, delivery management in admin | Done |
| 7 | Testing, security rules, bug fixing, deployment preparation | Done (deploy is yours) |

---

## Version control

```bash
git add .
git commit -m "Phases 4–7: Firebase auth, trusted orders, admin, tracking, security rules"
```

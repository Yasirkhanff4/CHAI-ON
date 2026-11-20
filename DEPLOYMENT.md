# CHAI ON deployment guide

Everything needed to take the app from this repository to a live site, in order.

**Nothing in this file has been executed on your behalf.** The updated security
rules and the Vercel site still have to be deployed from your accounts. The app
runs on the free **Spark** plan and needs no Cloud Functions.

---

## 1. What you need

| Thing | Why |
| --- | --- |
| Firebase project on the **Spark (free)** plan | Auth, Firestore |
| Vercel account | Hosts the React frontend |
| Node 20+ locally | Build, deploy and provisioning scripts |

### Firebase plan and cost

- **Spark is enough.** Orders and guest tracking are written to Firestore by the
  signed-in (or anonymous) customer; security rules pin ownership, statuses and
  money. Nothing calls a Cloud Function.
- Free limits at this scale: Firestore 50,000 reads / 20,000 writes / 20,000
  deletes per day, 1 GiB storage; Auth email/password and anonymous sign-in are
  free.
- **Firebase Storage is not used.** Product photos are a path in `public/images/`
  or any public image URL, entered in the admin product editor.
- Do **not** upgrade to Blaze for this app. If you later want server-side price
  verification, `functions/` already contains `createOrder` / `trackOrder`, but
  those are optional and were not deployed for the Spark build.
- Set a **budget alert** in Google Cloud → Billing even on Spark.

---

## 2. Create the Firebase project

1. <https://console.firebase.google.com> → **Add project** (e.g. `chai-on`).
   Stay on **Spark** (free).
2. **Build → Authentication → Get started → Email/Password → Enable.**
3. Still in Authentication → **Sign-in method → Anonymous → Enable.** Guest
   checkout uses a short-lived anonymous session; without it, checkout cannot
   write an order.
4. **Build → Firestore Database → Create database → Production mode →**
   choose the region closest to Islamabad (e.g. `asia-south1`).
5. **Project settings → Your apps → Web (`</>`)** → register the app →
   copy the `firebaseConfig` values.

You do **not** need to enable Storage or upgrade to Blaze.

---

## 3. Point the repo at the project

```bash
npm install
npx firebase login
npx firebase use --add        # choose your project, alias: default
```

`firebase use --add` writes `.firebaserc`. It is safe to commit (it contains only
the project id).

Create `.env` in the project root (never commit it, it is gitignored):

```ini
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=chai-on.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=chai-on
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_USE_EMULATORS=false
```

All `VITE_*` values are **public identifiers**, visible in the browser bundle.
Never put a service-account key, Admin SDK credential or private API key in a
`VITE_*` variable. Anything with that prefix ends up in the shipped JavaScript.

`VITE_FIREBASE_USE_EMULATORS=true` makes the app talk to local emulators
instead of production (development only).

---

## 4. Deploy the security rules

```bash
npx firebase deploy --only firestore:rules,firestore:indexes
```

That is the whole backend. **Do not deploy functions or Storage.** The Spark
build never calls them, and deploying functions requires Blaze.

The rules are what make customer orders safe: they check that an order belongs
to the signed-in uid, starts as `NEW`/`UNPAID`/`COD`, and that
`total == subtotal + deliveryCharge`. Deploy them **before** testing checkout,
otherwise every order write is denied.

### First data

1. Open **Firestore → settings → store** and create the document with:

```json
{
  "businessName": "CHAI ON",
  "contactPhone": "+92 3XX XXXXXXX",
  "deliveryCharge": 0,
  "minimumOrder": 0,
  "openingTime": "09:00",
  "closingTime": "23:00",
  "isOrderingOpen": true
}
```

   The customer site falls back to sensible defaults until this exists.

2. Create the two teas: sign in to the admin panel after step 5, open
   **Products**, and press **Add launch teas** (or add them by hand). Until
   Firestore has products, the storefront shows the built-in launch menu.

---

## 5. Create the first admin (no public signup)

```bash
# Firebase Console → Project settings → Service accounts → Generate new private key
# Save the JSON outside this repository.
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
  node functions/scripts/provision-admin.mjs --email you@example.com --role SUPER_ADMIN --name "Owner"
```

- `--email` accepts any real account email (nothing is hardcoded); use the owner's.
- The script creates the account **without a password** and writes the role as a
  Firebase **custom claim** plus the `users/{uid}` document.
- Tell the owner to open `/admin/login`, choose **Forgot password?** (or
  `/forgot-password`), set a password, then sign in at `/admin/login`.
  Password reset is the only self-service auth screen; there are no customer
  accounts.
- Roles: `SUPER_ADMIN`, `ADMIN`, `DELIVERY_STAFF`, `CUSTOMER`.
- Only this script (Admin SDK, run locally) can change a role. Nothing in the
  browser can grant admin access; there is no public admin signup.
- After a role change the user must sign in again to receive the new claim.
- `functions/package.json` provides `firebase-admin` for the script; it does not
  mean any Cloud Function has to be deployed.

Delete the service-account JSON when you are done.

---

## 6. Deploy the frontend to Vercel

1. Push the repository to GitHub.
2. Vercel → **Add New → Project** → import the repo.
3. Framework preset **Vite**; build command `npm run build`; output `dist`.
   (`vercel.json` already rewrites all paths to `index.html` for deep links.)
4. **Environment Variables:** add every `VITE_FIREBASE_*` value from step 3 to
   Production (and Preview if you want previews to work).
5. Deploy.
6. **Authentication → Settings → Authorized domains:** add your Vercel domain
   (e.g. `chai-on.vercel.app` and any custom domain). Password reset links and
   sign-in fail on unlisted domains.

---

## 7. Verify after deploying

Customer side:

- [ ] Menu shows live Firestore products and prices.
- [ ] Add to cart, change quantity, change sugar/strength.
- [ ] Guest checkout succeeds with no account; order number appears.
- [ ] "Order on WhatsApp" opens `wa.me/923291018591` with the cart items and
      total pre-filled.
- [ ] Confirmation page shows items, address, COD and Track order.
- [ ] Cart is empty afterwards.
- [ ] Disconnect the network mid-checkout → clear error, cart preserved; retry
      creates only one order.
- [ ] Track order with the order number works in the same browser/session; from
      another browser it shows "Order not found on this device. Contact us on
      WhatsApp." and the WhatsApp button opens the chat.
- [ ] Confirmation page shows the order number and the Track button.
- [ ] /login, /register and /account show the 404 page (customer accounts were
      removed; checkout is guest-only).
- [ ] The header, mobile menu and footer have no account/login links.
- [ ] Settings change (e.g. delivery charge) appears on the site after refresh.
- [ ] Ordering paused → checkout explains and the button is disabled.

Admin side:

- [ ] /admin redirects to /admin/login when signed out.
- [ ] A non-staff account is refused admin access.
- [ ] Dashboard shows real counts and today's sales.
- [ ] Status flow: accept → preparing → ready → out for delivery → delivered.
- [ ] Invalid transitions are not offered.
- [ ] Reject/cancel works; COD "Confirm cash received" sets PAID.
- [ ] Products: add, edit price, set an image path/URL, hide product, mark
      unavailable.
- [ ] New order arrives while the admin tab is open: count badge appears, the
      "Enable sound" button turns on the beep, and the tab title shows
      "(n) New Orders".
- [ ] Settings: save and see the change on the customer site.
- [ ] Delivery: assign a staff member, staff sees only their assigned orders,
      staff cannot open products/settings.
- [ ] `firestore.rules` denies a signed-out request for `/orders` (test with the
      emulator suite, or by watching the browser console).

---

## 8. Local emulator workflow

```bash
npx firebase emulators:start --project demo-chaion   # firestore, auth, UI
VITE_FIREBASE_USE_EMULATORS=true npm run dev
```

Automated checks:

```bash
npm run test:rules     # 62 Firestore security-rule assertions
```

It runs entirely on the emulator (Java required) and does not touch production.
`npm run test:orders` was removed with the Functions path; the legacy
`tests/order.functions.test.mjs` file is kept for reference only.

> The emulator suite uses `--project demo-chaion`, and every emulator port is
> configured in `firebase.json`.

---

## 9. Security summary

- Orders are written by the signed-in customer (guests use an anonymous session),
  never by an unauthenticated visitor, and never for another uid. The rules also
  require `NEW`/`UNPAID`/`COD`, one `NEW` history entry, and
  `total == subtotal + deliveryCharge`.
- Nothing can be deleted from the client; totals, payment status and order status
  cannot be changed by customers.
- Cart totals are rebuilt from Firestore products in the browser. Spark has no
  server code, so this is the one thing rules cannot prove per line. Staff review
  every order before accepting it.
- Idempotency is handled per checkout attempt in `sessionStorage`; the order number
  also acts as the document id, so retries reuse the same order.
- Tracking is owner-only: the order is read directly and must have
  `customerId == uid`, so it works on the same device/session that placed it.
  From another device the app says "Order not found on this device" and offers
  WhatsApp. There is no phone-number lookup and no public order-by-number read.
- Customers can read only their own orders (`customerId == uid`), and a missing
  order number reads as null so checkout can pick an unused number.
- Profile documents (`users/{uid}`) are owner-only and need a **real
  (non-anonymous) email token**. Customer accounts were removed, so the only
  profiles are the staff accounts created by the provisioning script; anonymous
  guest sessions can own orders but not profiles.
- Admin and delivery roles live in Firebase custom claims, enforced by Firestore
  rules, not by the UI.
- Delivery staff see only orders where `assignedTo == uid`, and can only set
  `OUT_FOR_DELIVERY`, `DELIVERED` or `DELIVERY_FAILED`.
- Products and settings are public read, admin write. There is no Storage bucket
  and no Storage rule to deploy.
- The admin panel reads at most 50 orders per feed and watches up to 20 NEW orders
  for the live badge/beep, keeping reads inside the Spark quota.

---

## 10. Launch checklist

- [x] Real phone number set in `src/data/site.ts` (`+92 329 1018591`). Confirm
      Settings → contact phone matches it.
- [ ] Real prices confirmed with the owner and set in Products.
- [ ] Delivery charge and minimum order configured in Settings.
- [ ] Opening/closing times match the shop.
- [ ] Firebase Auth authorized domains include the production domain.
- [ ] Rules and indexes deployed from this repository (no functions).
- [ ] Email/Password **and** Anonymous providers enabled.
- [ ] Super admin provisioned; service-account key deleted.
- [ ] Budget alert configured in Google Cloud.
- [ ] `npm run build`, `npm run lint`, `npm run test:rules` all pass.
- [ ] The section 7 checklist completed on the live domain.

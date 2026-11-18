# CHAI ON — deployment guide

Everything needed to take the app from this repository to a live site, in order.

**Nothing in this file has been executed on your behalf.** No Firebase project,
Cloud Function, security rule or Vercel deployment has been created or
published — that requires your accounts.

---

## 1. What you need

| Thing | Why |
| --- | --- |
| Firebase project | Auth, Firestore, Storage |
| **Blaze (pay-as-you-go)** plan on that project | Cloud Functions (required for trusted order creation and guest tracking) |
| Vercel account | Hosts the React frontend |
| Node 20+ locally | Build, deploy and provisioning scripts |

### Firebase plan and cost

- **Blaze is required.** Cloud Functions cannot be deployed on the free Spark
  plan, and guest order tracking/creation must run server-side.
- Realistic cost for a small tea shop is **close to zero**: Cloud Functions has
  a free monthly allowance of 2 million invocations and 400,000 GB-seconds;
  Firestore gives 50,000 reads / 20,000 writes per day free; Auth email sign-in
  is free.
- On Blaze you pay for usage beyond those limits plus small Cloud Build/Artifact
  Registry charges for deploying functions (typically a few cents per deploy).
- Set a **budget alert** in Google Cloud → Billing before launch.
- The admin panel, dashboard and product management use Firestore directly and
  cost nothing extra at this scale.

---

## 2. Create the Firebase project

1. <https://console.firebase.google.com> → **Add project** (e.g. `chai-on`).
2. Upgrade the project to **Blaze** (bottom-left plan card).
3. **Build → Authentication → Get started → Email/Password → Enable.**
   Leave every other provider off.
4. **Build → Firestore Database → Create database → Production mode →**
   choose the region closest to Islamabad (e.g. `asia-south1`).
5. **Build → Storage → Get started** (same region), for product photos.
6. **Project settings → Your apps → Web (`</>`)** → register the app →
   copy the `firebaseConfig` values.

---

## 3. Point the repo at the project

```bash
npm install
npx firebase login
npx firebase use --add        # choose your project, alias: default
```

`firebase use --add` writes `.firebaserc`. It is safe to commit (it contains only
the project id).

Create `.env` in the project root (never commit it — it is gitignored):

```ini
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=chai-on.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=chai-on
VITE_FIREBASE_STORAGE_BUCKET=chai-on.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_USE_EMULATORS=false
```

All `VITE_*` values are **public identifiers**, visible in the browser bundle.
Never put a service-account key, Admin SDK credential or private API key in a
`VITE_*` variable — anything with that prefix ends up in the shipped JavaScript.

`VITE_FIREBASE_USE_EMULATORS=true` makes the app talk to local emulators
instead of production (development only).

---

## 4. Deploy the backend

```bash
npm --prefix functions install        # Cloud Functions dependencies
npm --prefix functions run build      # compile TypeScript to functions/lib

npx firebase deploy --only firestore:rules,firestore:indexes,storage
npx firebase deploy --only functions
```

The functions deploy to region **asia-south1** (`createOrder`, `trackOrder`,
`setUserRole`). If you prefer another region, change `REGION` in
`functions/src/index.ts` **and** `FUNCTIONS_REGION` in
`src/lib/firebase/config.ts`, then redeploy.

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

   The customer site falls back to sensible defaults until this exists, and the
   order function uses the same defaults if the document is missing.

2. Create the two teas: sign in to the admin panel after step 5, open
   **Products**, and press **Add launch teas** (or add them by hand). Until
   Firestore has products, the storefront shows the built-in launch menu.

---

## 5. Create the first admin (no public signup)

```bash
# Firebase Console → Project settings → Service accounts → Generate new private key
# Save the JSON outside this repository.
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
  node functions/scripts/provision-admin.mjs --email owner@chaion.pk --role SUPER_ADMIN --name "Owner"
```

- The script creates the account **without a password** and writes the role as a
  Firebase **custom claim** plus the `users/{uid}` document.
- Tell the owner to open `/admin/login`, pick **Customer login → Forgot
  password** (or `/forgot-password`), set a password, then sign in at
  `/admin/login`.
- Roles: `SUPER_ADMIN`, `ADMIN`, `DELIVERY_STAFF`, `CUSTOMER`.
- Only `setUserRole` (called by a super admin) or this script can change a role.
  Nothing in the browser can grant admin access.
- After a role change the user must sign in again to receive the new claim.

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
- [ ] Confirmation page shows items, address, COD and Track order.
- [ ] Cart is empty afterwards.
- [ ] Disconnect the network mid-checkout → clear error, cart preserved; retry
      creates only one order.
- [ ] Registered customer: sign up, sign out, sign in, forgot password.
- [ ] Account page lists the customer's own orders; profile edits save.
- [ ] Track order with order number + phone works; wrong phone shows
      "No order matches…".
- [ ] /account while signed out redirects to /login.
- [ ] Settings change (e.g. delivery charge) appears on the site after refresh.
- [ ] Ordering paused → checkout explains and the button is disabled.

Admin side:

- [ ] /admin redirects to /admin/login when signed out.
- [ ] A customer account is refused admin access.
- [ ] Dashboard shows real counts and today's sales.
- [ ] Status flow: accept → preparing → ready → out for delivery → delivered.
- [ ] Invalid transitions are not offered.
- [ ] Reject/cancel works; COD "Confirm cash received" sets PAID.
- [ ] Products: add, edit price, upload photo, hide product, mark unavailable.
- [ ] Settings: save and see the change on the customer site.
- [ ] Delivery: assign a staff member, staff sees only their assigned orders,
      staff cannot open products/settings.
- [ ] `firestore.rules` denies a signed-out request for `/orders` (test with the
      emulator suite, or by watching the browser console).

---

## 8. Local emulator workflow

```bash
npm run functions:build
npx firebase emulators:start --project demo-chaion   # firestore, auth, functions, storage, UI
VITE_FIREBASE_USE_EMULATORS=true npm run dev
```

Automated checks:

```bash
npm run test:rules     # 37 Firestore security-rule assertions
npm run test:orders    # 20 trusted order-function assertions
```

Both run entirely on the emulator (Java required) and do not touch production.

> The emulator suite uses `--project demo-chaion`, and every emulator port is
> configured in `firebase.json`.

---

## 9. Security summary

- Orders are written **only** by the `createOrder` Cloud Function (Admin SDK).
  Firestore rules deny all client order creation and deletion.
- Prices, availability, delivery charge, minimum order and opening hours are
  read from Firestore inside that function. The browser never sends a price.
- Retries reuse a request key (`orderRequests/{uid|guest}_{key}`) so a network
  failure cannot duplicate an order.
- Guest tracking is a callable function that checks order number **and** phone,
  rate-limits by IP and phone, and returns only tracking fields.
- Customers can read only their own orders (`customerId == uid`) and edit only
  their `name`, `phone` and `updatedAt`.
- Admin and delivery roles live in Firebase custom claims, enforced by Firestore
  and Storage rules, not by the UI.
- Delivery staff see only orders where `assignedTo == uid`, and can only set
  `OUT_FOR_DELIVERY`, `DELIVERED` or `DELIVERY_FAILED`.
- `orderRequests` and `rateLimits` are invisible to every client.
- Storage: public read of product photos, staff-only writes, images under 5 MB.
- Order tracking never exposes other customers' data; guest lookup returns status,
  items and totals only.

---

## 10. Launch checklist

- [ ] Real phone number in `src/data/site.ts` and in Firestore settings
      (the placeholder `+92 300 000 0000` is not a real number).
- [ ] Real prices confirmed with the owner and set in Products.
- [ ] Delivery charge and minimum order configured in Settings.
- [ ] Opening/closing times match the shop.
- [ ] Firebase Auth authorized domains include the production domain.
- [ ] Rules, indexes and functions deployed from this repository.
- [ ] Super admin provisioned; service-account key deleted.
- [ ] Budget alert configured in Google Cloud.
- [ ] `npm run build`, `npm run lint`, `npm run test:rules`,
      `npm run test:orders` all pass.
- [ ] The section 7 checklist completed on the live domain.

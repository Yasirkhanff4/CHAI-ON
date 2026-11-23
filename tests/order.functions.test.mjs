/**
 * End-to-end test of the trusted createOrder Cloud Function against the
 * Firestore + Functions emulators. Guest checkout needs no auth token, so the
 * callable is exercised exactly as the website calls it.
 *
 * Run:
 *   npm run functions:build && npm run test:orders
 */
process.env.GCLOUD_PROJECT ??= 'demo-chaion'
process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= '127.0.0.1:9099'

const { initializeApp } = await import('firebase-admin/app')
const { getFirestore } = await import('firebase-admin/firestore')

const app = initializeApp({ projectId: 'demo-chaion' })
const db = getFirestore(app)

const ENDPOINT = 'http://127.0.0.1:5001/demo-chaion/asia-south1/createOrder'

const details = {
  fullName: 'Ayesha Khan',
  phone: '0300 1112223',
  building: 'Al Ghaffar Mall',
  floor: '3rd Floor',
  officeOrShop: 'Office 302',
  deliveryInstructions: 'Ask for reception',
}

let passed = 0
let failed = 0

function record(name, ok, detail = '') {
  if (ok) {
    passed += 1
    console.log(`  PASS  ${name}`)
  } else {
    failed += 1
    console.error(`  FAIL  ${name}${detail ? `\n        ${detail}` : ''}`)
  }
}

async function call(payload) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: payload }),
  })
  return { status: response.status, body: await response.json() }
}

async function orderCount() {
  const snapshot = await db.collection('orders').get()
  return snapshot.size
}

// Clean slate and seed trusted data.
const existingOrders = await db.collection('orders').get()
await Promise.all(existingOrders.docs.map((entry) => entry.ref.delete()))

await db.doc('settings/store').set({
  businessName: 'CHAYON',
  contactPhone: '0309-1104343',
  deliveryCharge: 0,
  minimumOrder: 0,
  openingTime: '00:00',
  closingTime: '00:00',
  isOrderingOpen: true,
})

await db.doc('products/doodh-patti').set({
  name: 'Doodh Patti',
  price: 150,
  isAvailable: true,
  isActive: true,
})
await db.doc('products/karak-chai').set({
  name: 'Karak Chai',
  price: 180,
  isAvailable: true,
  isActive: true,
})
await db.doc('products/sold-out').set({
  name: 'Sold Out Tea',
  price: 220,
  isAvailable: false,
  isActive: true,
})

console.log('\nTrusted order creation')

const first = await call({
  details,
  items: [
    { productId: 'doodh-patti', quantity: 2, sugar: 'less', strength: 'strong' },
    // A tampered field the server must ignore:
    { productId: 'karak-chai', quantity: 1, sugar: 'normal', strength: 'normal', unitPrice: 1 },
  ],
  requestKey: 'test-request-0001',
})

const firstOrder = first.body.result
record('creates an order for a guest', first.status === 200 && Boolean(firstOrder?.orderNumber))
record(
  'order number is human readable',
  /^CO-\d{6}-[A-Z0-9]{4}$/.test(firstOrder?.orderNumber ?? ''),
  firstOrder?.orderNumber,
)
record(
  'prices come from Firestore, not the client',
  firstOrder?.subtotal === 150 * 2 + 180 && firstOrder?.total === 480,
  `subtotal=${firstOrder?.subtotal} total=${firstOrder?.total}`,
)
record('starts unpaid on cash on delivery', firstOrder?.paymentStatus === 'UNPAID')
record('starts as NEW', firstOrder?.orderStatus === 'NEW')
record('guest order has no customer id', firstOrder?.customerId === null)
record('phone stored in E.164', firstOrder?.phone === '+923001112223', firstOrder?.phone)
record('customer id is null in Firestore', (await db.doc(`orders/${firstOrder?.orderNumber}`).get()).get('customerId') === null)

const retry = await call({
  details,
  items: [{ productId: 'doodh-patti', quantity: 2, sugar: 'less', strength: 'strong' }],
  requestKey: 'test-request-0001',
})
record(
  'retrying the same request key returns the same order',
  retry.body.result?.orderNumber === firstOrder?.orderNumber,
)
record('retry did not create a second order', (await orderCount()) === 1)

console.log('\nValidation and failure handling')

const before = await orderCount()

const unavailable = await call({
  details: { ...details, phone: '0300 1112224' },
  items: [{ productId: 'sold-out', quantity: 1, sugar: 'normal', strength: 'normal' }],
  requestKey: 'test-request-0002',
})
record(
  'rejects an unavailable product',
  unavailable.body.error?.status === 'FAILED_PRECONDITION',
  JSON.stringify(unavailable.body).slice(0, 160),
)

const unknownProduct = await call({
  details: { ...details, phone: '0300 1112225' },
  items: [{ productId: 'no-such-tea', quantity: 1, sugar: 'normal', strength: 'normal' }],
  requestKey: 'test-request-0003',
})
record('rejects an unknown product id', unknownProduct.body.error !== undefined)

const badQuantity = await call({
  details: { ...details, phone: '0300 1112226' },
  items: [{ productId: 'doodh-patti', quantity: 0, sugar: 'normal', strength: 'normal' }],
  requestKey: 'test-request-0004',
})
record('rejects a zero quantity', badQuantity.body.error !== undefined)

const tooMany = await call({
  details: { ...details, phone: '0300 1112227' },
  items: [{ productId: 'doodh-patti', quantity: 21, sugar: 'normal', strength: 'normal' }],
  requestKey: 'test-request-0005',
})
record('rejects more than 20 cups per line', tooMany.body.error !== undefined)

const badPhone = await call({
  details: { ...details, phone: '12345' },
  items: [{ productId: 'doodh-patti', quantity: 1, sugar: 'normal', strength: 'normal' }],
  requestKey: 'test-request-0006',
})
record(
  'rejects an invalid phone with field errors',
  badPhone.body.error?.status === 'INVALID_ARGUMENT' &&
    Boolean(badPhone.body.error?.details?.fieldErrors?.phone),
  JSON.stringify(badPhone.body).slice(0, 160),
)

const badSugar = await call({
  details: { ...details, phone: '0300 1112228' },
  items: [{ productId: 'doodh-patti', quantity: 1, sugar: 'caramel', strength: 'normal' }],
  requestKey: 'test-request-0007',
})
record('rejects an invalid customization', badSugar.body.error !== undefined)

record('failed attempts created no orders', (await orderCount()) === before)

console.log('\nDelivery charge and store settings')

await db.doc('settings/store').update({ deliveryCharge: 50, minimumOrder: 300 })
const charged = await call({
  details: { ...details, phone: '0300 1112229' },
  items: [{ productId: 'karak-chai', quantity: 2, sugar: 'normal', strength: 'normal' }],
  requestKey: 'test-request-0008',
})
record(
  'applies the configured delivery charge',
  charged.body.result?.deliveryCharge === 50 && charged.body.result?.total === 410,
  JSON.stringify(charged.body).slice(0, 160),
)

const belowMinimum = await call({
  details: { ...details, phone: '0300 1112230' },
  items: [{ productId: 'doodh-patti', quantity: 1, sugar: 'normal', strength: 'normal' }],
  requestKey: 'test-request-0009',
})
record('enforces the minimum order', belowMinimum.body.error?.status === 'FAILED_PRECONDITION')

await db.doc('settings/store').update({ minimumOrder: 0, isOrderingOpen: false })
const closed = await call({
  details: { ...details, phone: '0300 1112231' },
  items: [{ productId: 'doodh-patti', quantity: 2, sugar: 'normal', strength: 'normal' }],
  requestKey: 'test-request-0010',
})
record('refuses orders when ordering is paused', closed.body.error?.status === 'FAILED_PRECONDITION')

await db.doc('settings/store').update({ isOrderingOpen: true, deliveryCharge: 0 })

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)

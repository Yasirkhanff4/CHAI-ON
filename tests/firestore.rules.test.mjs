/**
 * Firestore security-rule tests for CHAI ON.
 *
 * Run with the emulator:
 *   npm run test:rules
 *
 * Covers the launch security requirements: customers can only touch their own
 * profile and orders, guests can never read orders, nobody can rewrite totals,
 * payments or statuses from the client, and only staff manage products.
 */
import { readFileSync } from 'node:fs'
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'

const PROJECT_ID = 'demo-chaion'
const CUSTOMER_A = 'customer-a'
const CUSTOMER_B = 'customer-b'
const ADMIN = 'admin-uid'
const DELIVERY = 'delivery-uid'

const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8')

const testEnv = await initializeTestEnvironment({
  projectId: PROJECT_ID,
  firestore: { rules, host: '127.0.0.1', port: 8080 },
})

let passed = 0
let failed = 0

async function check(name, assertion) {
  try {
    await assertion()
    passed += 1
    console.log(`  PASS  ${name}`)
  } catch (error) {
    failed += 1
    console.error(`  FAIL  ${name}\n        ${error.message}`)
  }
}

await testEnv.clearFirestore()

// Seed data with rules disabled, exactly as the trusted back office would.
await testEnv.withSecurityRulesDisabled(async (context) => {
  const db = context.firestore()

  await setDoc(doc(db, 'products', 'doodh-patti'), {
    name: 'Doodh Patti',
    price: 150,
    isAvailable: true,
    isActive: true,
  })
  await setDoc(doc(db, 'products', 'karak-chai'), {
    name: 'Karak Chai',
    price: 180,
    isAvailable: true,
    isActive: true,
  })
  await setDoc(doc(db, 'products', 'hidden-tea'), {
    name: 'Hidden Tea',
    price: 200,
    isAvailable: true,
    isActive: false,
  })
  await setDoc(doc(db, 'settings', 'store'), {
    businessName: 'CHAI ON',
    deliveryCharge: 0,
    minimumOrder: 0,
    openingTime: '09:00',
    closingTime: '23:00',
    isOrderingOpen: true,
  })
  await setDoc(doc(db, 'users', CUSTOMER_A), {
    uid: CUSTOMER_A,
    name: 'Ayesha Khan',
    email: 'ayesha@example.com',
    phone: '03001234567',
    role: 'CUSTOMER',
  })
  await setDoc(doc(db, 'users', CUSTOMER_B), {
    uid: CUSTOMER_B,
    name: 'Bilal Ahmed',
    email: 'bilal@example.com',
    phone: '03007654321',
    role: 'CUSTOMER',
  })
  await setDoc(doc(db, 'orders', 'CO-260101-AAAA'), {
    orderId: 'CO-260101-AAAA',
    orderNumber: 'CO-260101-AAAA',
    customerId: CUSTOMER_A,
    customerName: 'Ayesha Khan',
    phone: '+923001234567',
    orderStatus: 'NEW',
    paymentStatus: 'UNPAID',
    subtotal: 300,
    deliveryCharge: 0,
    total: 300,
    assignedTo: null,
    items: [],
  })
  await setDoc(doc(db, 'orders', 'CO-260101-BBBB'), {
    orderId: 'CO-260101-BBBB',
    orderNumber: 'CO-260101-BBBB',
    customerId: CUSTOMER_B,
    customerName: 'Bilal Ahmed',
    phone: '+923007654321',
    orderStatus: 'READY',
    paymentStatus: 'UNPAID',
    subtotal: 180,
    deliveryCharge: 0,
    total: 180,
    assignedTo: DELIVERY,
    items: [],
  })
  await setDoc(doc(db, 'orders', 'CO-260101-GGGG'), {
    orderId: 'CO-260101-GGGG',
    orderNumber: 'CO-260101-GGGG',
    customerId: null,
    customerName: 'Guest Customer',
    phone: '+923009999999',
    orderStatus: 'NEW',
    paymentStatus: 'UNPAID',
    subtotal: 150,
    deliveryCharge: 0,
    total: 150,
    assignedTo: null,
    items: [],
  })
  await setDoc(doc(db, 'orders', 'CO-260101-CCCC'), {
    orderId: 'CO-260101-CCCC',
    orderNumber: 'CO-260101-CCCC',
    customerId: CUSTOMER_B,
    customerName: 'Bilal Ahmed',
    phone: '+923007654321',
    orderStatus: 'READY',
    paymentStatus: 'UNPAID',
    subtotal: 360,
    deliveryCharge: 0,
    total: 360,
    assignedTo: 'another-delivery-uid',
    items: [],
  })
})

const guest = testEnv.unauthenticatedContext().firestore()
const customerA = testEnv.authenticatedContext(CUSTOMER_A, { role: 'CUSTOMER' }).firestore()
const customerB = testEnv.authenticatedContext(CUSTOMER_B, { role: 'CUSTOMER' }).firestore()
const admin = testEnv.authenticatedContext(ADMIN, { role: 'ADMIN' }).firestore()
const delivery = testEnv.authenticatedContext(DELIVERY, { role: 'DELIVERY_STAFF' }).firestore()

console.log('\nPublic catalog')
await check('guest can read an active product', () =>
  assertSucceeds(getDoc(doc(guest, 'products', 'doodh-patti'))),
)
await check('guest can list active products only', () =>
  assertSucceeds(
    getDocs(query(collection(guest, 'products'), where('isActive', '==', true))),
  ),
)
await check('guest cannot read a hidden product', () =>
  assertFails(getDoc(doc(guest, 'products', 'hidden-tea'))),
)
await check('guest cannot list hidden products', () =>
  assertFails(getDocs(query(collection(guest, 'products'), where('isActive', '==', false)))),
)
await check('guest cannot create a product', () =>
  assertFails(
    setDoc(doc(guest, 'products', 'free-tea'), {
      name: 'Free Tea',
      price: 0,
      isAvailable: true,
      isActive: true,
    }),
  ),
)
await check('customer cannot change a price', () =>
  assertFails(updateDoc(doc(customerA, 'products', 'doodh-patti'), { price: 1 })),
)
await check('admin can update a product', () =>
  assertSucceeds(updateDoc(doc(admin, 'products', 'karak-chai'), { price: 190 })),
)
await check('admin can read a hidden product', () =>
  assertSucceeds(getDoc(doc(admin, 'products', 'hidden-tea'))),
)

console.log('\nSettings')
await check('guest can read store settings', () =>
  assertSucceeds(getDoc(doc(guest, 'settings', 'store'))),
)
await check('customer cannot change settings', () =>
  assertFails(updateDoc(doc(customerA, 'settings', 'store'), { deliveryCharge: 0 })),
)
await check('admin can change settings', () =>
  assertSucceeds(
    updateDoc(doc(admin, 'settings', 'store'), { businessName: 'CHAI ON', deliveryCharge: 50, minimumOrder: 0 }),
  ),
)

console.log('\nProfiles')
await check('customer can read their own profile', () =>
  assertSucceeds(getDoc(doc(customerA, 'users', CUSTOMER_A))),
)
await check("customer cannot read another customer's profile", () =>
  assertFails(getDoc(doc(customerA, 'users', CUSTOMER_B))),
)
await check('customer can update their own name and phone', () =>
  assertSucceeds(
    updateDoc(doc(customerA, 'users', CUSTOMER_A), { name: 'Ayesha K.', phone: '03001112222' }),
  ),
)
await check('customer cannot change their own role', () =>
  assertFails(updateDoc(doc(customerA, 'users', CUSTOMER_A), { role: 'ADMIN' })),
)
await check('new signup cannot self-assign ADMIN', () =>
  assertFails(
    setDoc(doc(testEnv.authenticatedContext('new-user', {}).firestore(), 'users', 'new-user'), {
      uid: 'new-user',
      name: 'New User',
      email: 'new@example.com',
      phone: '',
      role: 'ADMIN',
    }),
  ),
)
await check('admin can read any profile', () =>
  assertSucceeds(getDoc(doc(admin, 'users', CUSTOMER_B))),
)

console.log('\nOrders')
await check('guest cannot list all orders', () =>
  assertFails(getDocs(collection(guest, 'orders'))),
)
await check('guest cannot read a single order', () =>
  assertFails(getDoc(doc(guest, 'orders', 'CO-260101-AAAA'))),
)
await check('customer can read their own order', () =>
  assertSucceeds(getDoc(doc(customerA, 'orders', 'CO-260101-AAAA'))),
)
await check("customer cannot read another customer's order", () =>
  assertFails(getDoc(doc(customerA, 'orders', 'CO-260101-BBBB'))),
)
await check('customer cannot create an order directly', () =>
  assertFails(
    addDoc(collection(customerA, 'orders'), {
      customerId: CUSTOMER_A,
      total: 1,
      orderStatus: 'DELIVERED',
    }),
  ),
)
await check('customer cannot change an order total', () =>
  assertFails(updateDoc(doc(customerA, 'orders', 'CO-260101-AAAA'), { total: 1 })),
)
await check('customer cannot change payment status', () =>
  assertFails(updateDoc(doc(customerA, 'orders', 'CO-260101-AAAA'), { paymentStatus: 'PAID' })),
)
await check('customer cannot change order status', () =>
  assertFails(updateDoc(doc(customerA, 'orders', 'CO-260101-AAAA'), { orderStatus: 'DELIVERED' })),
)
await check('admin can accept an order', () =>
  assertSucceeds(
    updateDoc(doc(admin, 'orders', 'CO-260101-AAAA'), {
      orderStatus: 'ACCEPTED',
      statusHistory: [],
      updatedAt: new Date(),
    }),
  ),
)
await check('admin can assign delivery', () =>
  assertSucceeds(
    updateDoc(doc(admin, 'orders', 'CO-260101-AAAA'), {
      assignedTo: DELIVERY,
      assignedToName: 'Delivery',
    }),
  ),
)
await check('customer cannot assign themselves as delivery staff', () =>
  assertFails(
    updateDoc(doc(customerA, 'orders', 'CO-260101-AAAA'), {
      assignedTo: CUSTOMER_A,
    }),
  ),
)

console.log('\nDelivery staff')
await check('delivery staff can read an order assigned to them', () =>
  assertSucceeds(getDoc(doc(delivery, 'orders', 'CO-260101-BBBB'))),
)
await check("delivery staff cannot read another staff member's order", () =>
  assertFails(getDoc(doc(delivery, 'orders', 'CO-260101-CCCC'))),
)
await check('delivery staff cannot read an unassigned guest order', () =>
  assertFails(getDoc(doc(delivery, 'orders', 'CO-260101-GGGG'))),
)
await check('delivery staff cannot accept orders (admin-only transition)', () =>
  assertFails(
    updateDoc(doc(delivery, 'orders', 'CO-260101-BBBB'), {
      orderStatus: 'ACCEPTED',
      statusHistory: [],
      updatedAt: new Date(),
    }),
  ),
)
await check('delivery staff can mark their order out for delivery', () =>
  assertSucceeds(
    updateDoc(doc(delivery, 'orders', 'CO-260101-BBBB'), {
      orderStatus: 'OUT_FOR_DELIVERY',
      statusHistory: [],
      updatedAt: new Date(),
    }),
  ),
)
await check('delivery staff cannot change the total', () =>
  assertFails(updateDoc(doc(delivery, 'orders', 'CO-260101-BBBB'), { total: 1 })),
)
await check('delivery staff cannot mark payment as paid', () =>
  assertFails(updateDoc(doc(delivery, 'orders', 'CO-260101-BBBB'), { paymentStatus: 'PAID' })),
)

console.log('\nInternal collections')
await check('no client can read order requests', () =>
  assertFails(getDoc(doc(admin, 'orderRequests', 'guest_abc'))),
)
await check('no client can write rate limits', () =>
  assertFails(setDoc(doc(guest, 'rateLimits', 'track_ip_x'), { attempts: [] })),
)

await testEnv.cleanup()

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)

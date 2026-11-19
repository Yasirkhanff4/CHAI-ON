import { signInAnonymously } from 'firebase/auth'
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore'
import {
  hasErrors,
  normalizeCustomerDetails,
  validateCustomerDetails,
  validateSubmissionItems,
} from '@/lib/checkoutValidation'
import { getDb, getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase/config'
import { toOrderError } from '@/lib/firebase/errors'
import { OrderError } from '@/lib/orders/errors'
import {
  findOrderByNumber,
  findOrderByRequestKey,
  saveOrder,
} from '@/lib/orders/localOrderStore'
import { mapOrder } from '@/lib/orders/mapOrder'
import { generateOrderNumber } from '@/lib/orders/orderNumber'
import { isOrderingOpen } from '@/lib/openingHours'
import { priceOrder } from '@/lib/orders/pricing'
import { toE164 } from '@/lib/phone'
import type { StoreSettings } from '@/data/settings'
import type { Product, SugarLevel, TeaStrength } from '@/types'
import type { CustomerDetails, Order, OrderSubmissionItem } from '@/types/order'

const LAST_ORDER_KEY = 'chai-on:last-order:v1'
const REQUESTS_KEY = 'chai-on:firestore-requests:v1'
const NOT_ON_THIS_DEVICE =
  'Order not found on this device. Contact us on WhatsApp.'

function timestampToIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'seconds' in value) {
    const seconds = Number((value as { seconds?: unknown }).seconds)
    if (Number.isFinite(seconds)) return new Date(seconds * 1000).toISOString()
  }
  return new Date().toISOString()
}

export type PlaceOrderInput = {
  details: CustomerDetails
  items: OrderSubmissionItem[]
  requestKey: string
  customerId?: string | null
}

export type PlaceOrderCatalog = {
  products: Product[]
  settings: StoreSettings
}

/**
 * Places an order.
 *
 * With Firebase configured, the signed-in customer (or a short-lived anonymous
 * session created for a guest) writes the order document directly. The
 * Firestore rules pin the owner, statuses, payment method and money; order
 * creation needs no Cloud Functions, so the project stays on the free Spark
 * plan. Without Firebase the app falls back to the local adapter.
 */
export async function placeOrder(
  input: PlaceOrderInput,
  catalog: PlaceOrderCatalog,
): Promise<Order> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new OrderError(
      'NETWORK',
      'You appear to be offline. Reconnect and try again — your cart is safe.',
    )
  }

  const requestKey = input.requestKey.trim()
  if (!requestKey) {
    throw new OrderError('VALIDATION', 'Something went wrong starting the order. Reload and try again.')
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new OrderError('VALIDATION', 'Your cart is empty. Add a tea before checking out.')
  }

  if (isFirebaseConfigured) {
    return placeOrderInFirestore(input, catalog)
  }

  const order = placeOrderLocally(input, catalog)
  rememberLastOrder(order)
  return order
}

/** Local development path — mirrors the checkout checks without Firebase. */
function placeOrderLocally(input: PlaceOrderInput, catalog: PlaceOrderCatalog): Order {
  const itemError = validateSubmissionItems(input.items)
  if (itemError) throw new OrderError('VALIDATION', itemError)

  const details = normalizeCustomerDetails(input.details)
  const fieldErrors = validateCustomerDetails(details)
  if (hasErrors(fieldErrors)) {
    throw new OrderError('VALIDATION', 'Check the highlighted delivery details.', { fieldErrors })
  }

  const existing = findOrderByRequestKey(input.requestKey)
  if (existing) return existing

  const pricing = priceOrder(input.items, catalog.products, catalog.settings)
  const now = new Date().toISOString()

  let orderNumber = generateOrderNumber()
  for (let attempt = 0; attempt < 5 && findOrderByNumber(orderNumber); attempt += 1) {
    orderNumber = generateOrderNumber()
  }

  const order: Order = {
    orderId: `local_${input.requestKey}`,
    orderNumber,
    customerId: input.customerId ?? null,
    customerName: details.fullName,
    phone: toE164(details.phone),
    building: details.building,
    floor: details.floor,
    officeOrShop: details.officeOrShop,
    deliveryInstructions: details.deliveryInstructions || null,
    items: pricing.items,
    itemCount: pricing.itemCount,
    subtotal: pricing.subtotal,
    deliveryCharge: pricing.deliveryCharge,
    total: pricing.total,
    paymentMethod: 'COD',
    paymentStatus: 'UNPAID',
    orderStatus: 'NEW',
    assignedTo: null,
    assignedToName: null,
    statusHistory: [{ status: 'NEW', at: now, by: input.customerId ? 'customer' : 'guest' }],
    createdAt: now,
    updatedAt: now,
  }

  saveOrder(order, input.requestKey)
  return order
}

/**
 * Guests get a real (anonymous) Firebase account so their orders have an
 * owner. That is what lets the same device track the order later; WhatsApp is
 * the fallback everywhere else.
 */
async function startGuestSession() {
  const auth = getFirebaseAuth()
  if (auth.currentUser) return auth.currentUser

  try {
    const credentials = await signInAnonymously(auth)
    return credentials.user
  } catch (error) {
    throw new OrderError(
      'UNKNOWN',
      'We could not start your order session. Refresh the page and try again, or order on WhatsApp.',
      { cause: error },
    )
  }
}

async function placeOrderInFirestore(
  input: PlaceOrderInput,
  catalog: PlaceOrderCatalog,
): Promise<Order> {
  const details = normalizeCustomerDetails(input.details)
  const fieldErrors = validateCustomerDetails(details)
  if (hasErrors(fieldErrors)) {
    throw new OrderError('VALIDATION', 'Check the highlighted delivery details.', { fieldErrors })
  }

  const itemError = validateSubmissionItems(input.items)
  if (itemError) throw new OrderError('VALIDATION', itemError)

  if (!isOrderingOpen(catalog.settings)) {
    throw new OrderError(
      'UNKNOWN',
      'CHAI ON is not taking online orders right now. Please call us or message us on WhatsApp.',
    )
  }

  const pricing = priceOrder(input.items, catalog.products, catalog.settings)

  const previousNumber = readStoredRequest(input.requestKey)
  if (previousNumber) {
    const previous = await fetchOrderByNumber(previousNumber).catch(() => null)
    if (previous) {
      rememberLastOrder(previous)
      return previous
    }
  }

  const user = await startGuestSession()
  const db = getDb()
  const createdAt = new Date()
  const createdAtIso = createdAt.toISOString()
  const initialHistory = [{ status: 'NEW' as const, at: Timestamp.fromDate(createdAt), by: 'customer' }]

  let orderNumber = generateOrderNumber(createdAt)
  let lastError: unknown = null

  // The document id is the customer-facing order number. If someone already
  // owns that id, the create is rejected; pick a new suffix and try again.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const existing = await getDoc(doc(db, 'orders', orderNumber)).catch(() => null)
    if (existing?.exists()) {
      orderNumber = generateOrderNumber(createdAt)
      continue
    }

    const order: Order = {
      orderId: orderNumber,
      orderNumber,
      customerId: user.uid,
      customerName: details.fullName,
      phone: toE164(details.phone),
      building: details.building,
      floor: details.floor,
      officeOrShop: details.officeOrShop,
      deliveryInstructions: details.deliveryInstructions || null,
      items: pricing.items,
      itemCount: pricing.itemCount,
      subtotal: pricing.subtotal,
      deliveryCharge: pricing.deliveryCharge,
      total: pricing.total,
      paymentMethod: 'COD',
      paymentStatus: 'UNPAID',
      orderStatus: 'NEW',
      assignedTo: null,
      assignedToName: null,
      statusHistory: [{ status: 'NEW', at: createdAtIso, by: 'customer' }],
      createdAt: createdAtIso,
      updatedAt: createdAtIso,
    }

    try {
      await setDoc(doc(db, 'orders', orderNumber), {
        orderId: order.orderId,
        orderNumber,
        customerId: order.customerId,
        customerName: order.customerName,
        phone: order.phone,
        building: order.building,
        floor: order.floor,
        officeOrShop: order.officeOrShop,
        deliveryInstructions: order.deliveryInstructions,
        items: order.items,
        itemCount: order.itemCount,
        subtotal: order.subtotal,
        deliveryCharge: order.deliveryCharge,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        assignedTo: null,
        assignedToName: null,
        statusHistory: initialHistory,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      lastError = error
      // A racing checkout may have written this number first; retry. Any other
      // rejection (validation, session) is final.
      if (isPermissionDenied(error)) {
        orderNumber = generateOrderNumber(createdAt)
        continue
      }
      throw toOrderError(error)
    }

    rememberRequest(input.requestKey, orderNumber)
    rememberLastOrder(order)
    return order
  }

  throw lastError
    ? toOrderError(lastError)
    : new OrderError('UNKNOWN', 'Could not reserve an order number. Please try again.')
}

function isPermissionDenied(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'permission-denied'
  )
}

function readStoredRequests(): Record<string, string> {
  try {
    const raw = window.sessionStorage.getItem(REQUESTS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {}
  } catch {
    return {}
  }
}

function readStoredRequest(requestKey: string): string | null {
  return readStoredRequests()[requestKey] ?? null
}

function rememberRequest(requestKey: string, orderNumber: string): void {
  try {
    window.sessionStorage.setItem(
      REQUESTS_KEY,
      JSON.stringify({ ...readStoredRequests(), [requestKey]: orderNumber }),
    )
  } catch {
    // Session storage may be unavailable; a retry then creates a new order.
  }
}

function rememberLastOrder(order: Order): void {
  try {
    window.sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order))
  } catch {
    // Session storage may be unavailable; confirmation then re-reads Firestore.
  }
}

function readLastOrder(orderNumber: string): Order | null {
  try {
    const raw = window.sessionStorage.getItem(LAST_ORDER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (String(parsed.orderNumber ?? '') !== orderNumber) return null
    return mapOrder(orderNumber, parsed)
  } catch {
    return null
  }
}

/**
 * Order lookup for the confirmation screen. The order just placed is kept in
 * session; the anonymous guest session can also re-read the order it owns,
 * which Firestore rules restrict to that account.
 */
export async function getOrderForConfirmation(
  orderNumber: string,
  _customerId: string | null,
): Promise<Order | null> {
  const normalized = orderNumber.trim().toUpperCase()
  if (!normalized) return null

  const cached = readLastOrder(normalized)
  if (cached) return cached

  if (!isFirebaseConfigured) {
    return findOrderByNumber(normalized)
  }

  if (!getFirebaseAuth().currentUser) return null

  try {
    const snapshot = await getDoc(doc(getDb(), 'orders', normalized))
    if (!snapshot.exists()) return null
    return mapOrder(snapshot.id, snapshot.data() as Record<string, unknown>)
  } catch {
    return null
  }
}

/** One order, for customer/admin/staff detail screens (rules decide access). */
export async function fetchOrderByNumber(orderNumber: string): Promise<Order | null> {
  const normalized = orderNumber.trim().toUpperCase()
  if (!normalized) return null

  if (!isFirebaseConfigured) return findOrderByNumber(normalized)

  const snapshot = await getDoc(doc(getDb(), 'orders', normalized))
  if (!snapshot.exists()) return null
  return mapOrder(snapshot.id, snapshot.data() as Record<string, unknown>)
}

export type TrackedItem = {
  name: string
  quantity: number
  sugar: SugarLevel
  strength: TeaStrength
  lineTotal: number
}

export type TrackedOrder = {
  orderNumber: string
  customerName: string
  orderStatus: Order['orderStatus']
  paymentMethod: 'COD'
  paymentStatus: Order['paymentStatus']
  itemCount: number
  total: number
  deliveryCharge: number
  items: TrackedItem[]
  statusHistory: NonNullable<Order['statusHistory']>
  createdAt: string
  updatedAt: string
}

/**
 * Tracking without Cloud Functions: the order document itself is the source of
 * truth. Only the account that placed the order can read it, so tracking works
 * on the same device/session — WhatsApp is the fallback when the order belongs
 * to another device or browser profile.
 */
export async function trackOrderRequest(orderNumber: string): Promise<TrackedOrder> {
  const normalized = orderNumber.trim().toUpperCase()

  if (!normalized) {
    throw new OrderError('VALIDATION', 'Enter your order number.')
  }

  if (!isFirebaseConfigured) {
    const order = findOrderByNumber(normalized)
    if (!order) throw new OrderError('VALIDATION', NOT_ON_THIS_DEVICE)
    return toTrackedOrder(order)
  }

  const auth = getFirebaseAuth()
  // The session Firebase restores from persistence arrives asynchronously; read
  // it only once the restore has settled, otherwise a guest's own order looks
  // like it belongs to another device.
  await auth.authStateReady()

  if (!auth.currentUser) {
    throw new OrderError('VALIDATION', NOT_ON_THIS_DEVICE)
  }

  try {
    const snapshot = await getDoc(doc(getDb(), 'orders', normalized))
    if (!snapshot.exists()) {
      throw new OrderError('VALIDATION', NOT_ON_THIS_DEVICE)
    }

    const data = snapshot.data() as Record<string, unknown>
    if (String(data.customerId ?? '') !== auth.currentUser.uid) {
      throw new OrderError('VALIDATION', NOT_ON_THIS_DEVICE)
    }

    return {
      orderNumber: String(data.orderNumber ?? normalized),
      customerName: String(data.customerName ?? '').split(' ')[0] ?? '',
      orderStatus: String(data.orderStatus ?? 'NEW') as Order['orderStatus'],
      paymentMethod: 'COD',
      paymentStatus: data.paymentStatus === 'PAID' ? 'PAID' : 'UNPAID',
      itemCount: Number(data.itemCount ?? 0),
      total: Number(data.total ?? 0),
      deliveryCharge: Number(data.deliveryCharge ?? 0),
      items: Array.isArray(data.items)
        ? (data.items as Record<string, unknown>[]).map((item) => ({
            name: String(item.name ?? 'Tea'),
            quantity: Number(item.quantity ?? 1),
            sugar: String(item.sugar ?? 'normal') as SugarLevel,
            strength: String(item.strength ?? 'normal') as TeaStrength,
            lineTotal: Number(item.lineTotal ?? 0),
          }))
        : [],
      statusHistory: Array.isArray(data.statusHistory)
        ? (data.statusHistory as Record<string, unknown>[]).map((event) => ({
            status: String(event.status ?? 'NEW') as Order['orderStatus'],
            at: timestampToIso(event.at),
          }))
        : [],
      createdAt: timestampToIso(data.createdAt),
      updatedAt: timestampToIso(data.updatedAt ?? data.createdAt),
    }
  } catch (error) {
    if (error instanceof OrderError) throw error
    throw new OrderError('VALIDATION', NOT_ON_THIS_DEVICE)
  }
}

function toTrackedOrder(order: Order): TrackedOrder {
  return {
    orderNumber: order.orderNumber,
    customerName: order.customerName.split(' ')[0] ?? '',
    orderStatus: order.orderStatus,
    paymentMethod: 'COD',
    paymentStatus: order.paymentStatus,
    itemCount: order.itemCount,
    total: order.total,
    deliveryCharge: order.deliveryCharge,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      sugar: item.sugar,
      strength: item.strength,
      lineTotal: item.lineTotal,
    })),
    statusHistory: order.statusHistory ?? [
      { status: order.orderStatus, at: order.createdAt, by: 'guest' },
    ],
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }
}

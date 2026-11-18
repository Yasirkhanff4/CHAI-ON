import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import {
  hasErrors,
  normalizeCustomerDetails,
  validateCustomerDetails,
  validateSubmissionItems,
} from '@/lib/checkoutValidation'
import { BackendUnavailableError, getDb, getFirebaseFunctions, isFirebaseConfigured } from '@/lib/firebase/config'
import { describeFirebaseError, toOrderError } from '@/lib/firebase/errors'
import { OrderError } from '@/lib/orders/errors'
import {
  findOrderByNumber,
  findOrderByRequestKey,
  readOrders,
  saveOrder,
} from '@/lib/orders/localOrderStore'
import { mapOrder } from '@/lib/orders/mapOrder'
import { generateOrderNumber } from '@/lib/orders/orderNumber'
import { priceOrder } from '@/lib/orders/pricing'
import { normalizePakistaniPhone, toE164 } from '@/lib/phone'
import type { StoreSettings } from '@/data/settings'
import type { Product, SugarLevel, TeaStrength } from '@/types'
import type { CustomerDetails, Order, OrderSubmissionItem } from '@/types/order'

const LAST_ORDER_KEY = 'chai-on:last-order:v1'

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
 * With Firebase configured, the trusted Cloud Function validates the products,
 * prices, settings and totals, and returns the created order. Without Firebase
 * the app falls back to the local adapter so development and the initial
 * preview still work — that path is not production order storage.
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
    const callable = httpsCallable<Record<string, unknown>, Record<string, unknown>>(
      getFirebaseFunctions(),
      'createOrder',
    )

    try {
      const response = await callable({
        details: input.details,
        items: input.items,
        requestKey,
      })
      const data = response.data
      const order = mapOrder(String(data.orderNumber ?? ''), data)
      rememberLastOrder(order)
      return order
    } catch (error) {
      throw toOrderError(error)
    }
  }

  const order = placeOrderLocally(input, catalog)
  rememberLastOrder(order)
  return order
}

/** Local development path — mirrors the trusted function's checks. */
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
 * Order lookup for the confirmation screen. Guests see the order they just
 * placed (kept in session); signed-in customers read their own order from
 * Firestore, which Firestore rules restrict to that customer.
 */
export async function getOrderForConfirmation(
  orderNumber: string,
  customerId: string | null,
): Promise<Order | null> {
  const normalized = orderNumber.trim().toUpperCase()
  if (!normalized) return null

  const cached = readLastOrder(normalized)
  if (cached) return cached

  if (!isFirebaseConfigured) {
    return findOrderByNumber(normalized)
  }

  if (!customerId) return null

  try {
    const snapshot = await getDoc(doc(getDb(), 'orders', normalized))
    if (!snapshot.exists()) return null
    return mapOrder(snapshot.id, snapshot.data() as Record<string, unknown>)
  } catch {
    return null
  }
}

/** A customer's own order history. */
export async function fetchMyOrders(customerId: string): Promise<Order[]> {
  if (!isFirebaseConfigured) {
    return readOrders().filter((order) => order.customerId === customerId)
  }

  const ordersQuery = query(
    collection(getDb(), 'orders'),
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc'),
    limit(50),
  )

  const snapshot = await getDocs(ordersQuery)
  return snapshot.docs.map((entry) => mapOrder(entry.id, entry.data() as Record<string, unknown>))
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
 * Guest tracking: order number + matching phone.
 *
 * With Firebase this runs in the trusted trackOrder function, which rate
 * limits attempts and returns only tracking-safe fields. The local fallback
 * only searches orders placed in this browser.
 */
export async function trackOrderRequest(
  orderNumber: string,
  phone: string,
): Promise<TrackedOrder> {
  const normalized = orderNumber.trim().toUpperCase()
  const localPhone = normalizePakistaniPhone(phone)

  if (!normalized || !localPhone) {
    throw new OrderError('VALIDATION', 'Enter your order number and the phone number you ordered with.')
  }

  if (isFirebaseConfigured) {
    const callable = httpsCallable<Record<string, unknown>, Record<string, unknown>>(
      getFirebaseFunctions(),
      'trackOrder',
    )

    try {
      const response = await callable({ orderNumber: normalized, phone: localPhone })
      const data = response.data
      return {
        orderNumber: String(data.orderNumber ?? normalized),
        customerName: String(data.customerName ?? ''),
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
              at: String(event.at ?? ''),
            }))
          : [],
        createdAt: String(data.createdAt ?? ''),
        updatedAt: String(data.updatedAt ?? ''),
      }
    } catch (error) {
      throw new OrderError(
        'VALIDATION',
        error instanceof BackendUnavailableError
          ? error.message
          : describeFirebaseError(
              error,
              'No order matches that order number and phone number.',
            ),
        { cause: error },
      )
    }
  }

  const order = findOrderByNumber(normalized)
  if (!order || normalizePakistaniPhone(order.phone) !== localPhone) {
    throw new OrderError('VALIDATION', 'No order matches that order number and phone number.')
  }

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

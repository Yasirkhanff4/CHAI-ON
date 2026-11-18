import { initializeApp } from 'firebase-admin/app'
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import {
  DEFAULT_SETTINGS,
  MAX_LINES,
  generateOrderNumber,
  isOrderingOpen,
  normalizeDetails,
  normalizeOrderNumber,
  normalizePhone,
  normalizeSubmittedItems,
  priceItems,
  rateLimitKey,
  timestampToIso,
  toE164,
  validateDetails,
} from './order'
import type { CustomerDetails, PricedItem, ProductRecord, StoreSettings } from './order'

initializeApp()

const db = getFirestore()
const auth = getAuth()

/** Closest region to Islamabad. Change if you deploy elsewhere. */
const REGION = 'asia-south1'
const CALL_OPTIONS = { region: REGION, maxInstances: 10 }

const ROLES = ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN', 'DELIVERY_STAFF'] as const
type Role = (typeof ROLES)[number]

type OrderDoc = {
  orderId: string
  orderNumber: string
  customerId: string | null
  customerName: string
  phone: string
  building: string
  floor: string
  officeOrShop: string
  deliveryInstructions: string | null
  items: PricedItem[]
  itemCount: number
  subtotal: number
  deliveryCharge: number
  total: number
  paymentMethod: 'COD'
  paymentStatus: 'UNPAID'
  orderStatus: 'NEW'
  assignedTo: string | null
  assignedToName: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
  statusHistory: { status: string; at: Timestamp; by: string }[]
}

/**
 * Sliding-window limiter stored in Firestore. Used for guest tracking lookups
 * and order attempts so the callable cannot be used to enumerate orders.
 */
async function enforceRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<void> {
  const ref = db.doc(`rateLimits/${key}`)
  const now = Date.now()

  const allowed = await db.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref)
    const raw = snapshot.exists ? snapshot.get('attempts') : []
    const attempts: number[] = Array.isArray(raw)
      ? raw.filter((value: unknown): value is number => typeof value === 'number')
      : []
    const recent = attempts.filter((value) => value > now - windowMs)

    if (recent.length >= limit) {
      tx.set(ref, { attempts: recent, updatedAt: Timestamp.fromMillis(now) })
      return false
    }

    tx.set(ref, {
      attempts: [...recent, now],
      updatedAt: Timestamp.fromMillis(now),
    })
    return true
  })

  if (!allowed) {
    throw new HttpsError(
      'resource-exhausted',
      'Too many attempts. Please wait a little and try again, or call us.',
    )
  }
}

function clientLog(error: unknown): Record<string, string> {
  return {
    code: error instanceof HttpsError ? error.code : 'unknown',
    summary: error instanceof Error ? error.message.slice(0, 200) : 'unknown error',
  }
}

/**
 * Trusted client IP, taken from the runtime socket rather than the
 * caller-controlled X-Forwarded-For header. Returns null when the runtime
 * cannot supply one, so callers can skip the IP limit instead of lumping
 * every customer into one shared bucket.
 */
function trustedClientIp(request: { rawRequest?: { ip?: string } }): string | null {
  const ip = request.rawRequest?.ip?.trim()
  return ip ? ip : null
}

/**
 * Trusted order creation (guest or signed-in).
 * Prices, availability, delivery charge and totals all come from Firestore.
 */
export const createOrder = onCall(CALL_OPTIONS, async (request) => {
  const payload = (request.data ?? {}) as Record<string, unknown>
  const details: CustomerDetails = normalizeDetails(payload.details)
  const fieldErrors = validateDetails(details)

  if (Object.keys(fieldErrors).length > 0) {
    throw new HttpsError('invalid-argument', 'Check the highlighted delivery details.', {
      fieldErrors,
    })
  }

  const requestKey = String(payload.requestKey ?? '').trim()
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(requestKey)) {
    throw new HttpsError('invalid-argument', 'This checkout attempt is invalid. Reload and retry.')
  }

  const items = normalizeSubmittedItems(payload.items)
  if (items.length === 0) {
    throw new HttpsError('invalid-argument', 'Your cart is empty.')
  }
  if (Array.isArray(payload.items) && payload.items.length > MAX_LINES) {
    throw new HttpsError('invalid-argument', 'Too many different items for one order.')
  }

  const uid = request.auth?.uid ?? null
  const localPhone = normalizePhone(details.phone)
  const requestDocId = `${uid ?? 'guest'}_${requestKey}`
  const ip = trustedClientIp(request)

  try {
    await enforceRateLimit(rateLimitKey('order', uid ?? localPhone), 12, 60 * 60 * 1000)
    // Shared office connections can submit several legitimate orders, so this
    // per-IP ceiling is looser than the per-phone one and only applies when a
    // real IP is available.
    if (ip) {
      await enforceRateLimit(rateLimitKey('order_ip', ip), 60, 60 * 60 * 1000)
    }

    const result = await db.runTransaction(async (tx) => {
      const requestRef = db.doc(`orderRequests/${requestDocId}`)
      const existingRequest = await tx.get(requestRef)

      if (existingRequest.exists) {
        const existingOrder = await tx.get(
          db.doc(`orders/${String(existingRequest.get('orderNumber'))}`),
        )
        if (existingOrder.exists) {
          return { order: serializeOrder(existingOrder.data() as OrderDoc) }
        }
      }

      const settingsSnapshot = await tx.get(db.doc('settings/store'))
      const settings: StoreSettings = settingsSnapshot.exists
        ? ({
            ...DEFAULT_SETTINGS,
            ...(settingsSnapshot.data() as Partial<StoreSettings>),
          } as StoreSettings)
        : DEFAULT_SETTINGS

      if (!isOrderingOpen(settings)) {
        throw new HttpsError(
          'failed-precondition',
          'CHAI ON is not taking online orders right now. Please call us to order.',
        )
      }

      const uniqueIds = Array.from(new Set(items.map((item) => item.productId)))
      const productSnaps = await Promise.all(
        uniqueIds.map((id) => tx.get(db.doc(`products/${id}`))),
      )
      const products = new Map<string, ProductRecord>()
      productSnaps.forEach((snapshot, index) => {
        if (snapshot.exists) products.set(uniqueIds[index], snapshot.data() as ProductRecord)
      })

      const priced = priceItems(items, products)

      if (priced.unavailable.length > 0) {
        throw new HttpsError(
          'failed-precondition',
          `${priced.unavailable.join(' and ')} ${
            priced.unavailable.length === 1 ? 'is' : 'are'
          } no longer available. Remove it from your cart to continue.`,
          { unavailableProducts: priced.unavailable },
        )
      }

      if (priced.lines.length === 0) {
        throw new HttpsError('invalid-argument', 'Your cart is empty.')
      }

      if (priced.subtotal < settings.minimumOrder) {
        throw new HttpsError(
          'failed-precondition',
          `The minimum order is Rs ${settings.minimumOrder}. Add a little more tea to continue.`,
        )
      }

      const deliveryCharge = Math.max(0, Math.trunc(Number(settings.deliveryCharge) || 0))
      const total = priced.subtotal + deliveryCharge
      const now = Timestamp.now()

      let orderNumber = generateOrderNumber()
      let orderRef = db.doc(`orders/${orderNumber}`)
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const clash = await tx.get(orderRef)
        if (!clash.exists) break
        orderNumber = generateOrderNumber()
        orderRef = db.doc(`orders/${orderNumber}`)
      }

      const order: OrderDoc = {
        orderId: orderNumber,
        orderNumber,
        customerId: uid,
        customerName: details.fullName,
        phone: toE164(localPhone),
        building: details.building,
        floor: details.floor,
        officeOrShop: details.officeOrShop,
        deliveryInstructions: details.deliveryInstructions || null,
        items: priced.lines,
        itemCount: priced.itemCount,
        subtotal: priced.subtotal,
        deliveryCharge,
        total,
        paymentMethod: 'COD',
        paymentStatus: 'UNPAID',
        orderStatus: 'NEW',
        assignedTo: null,
        assignedToName: null,
        createdAt: now,
        updatedAt: now,
        statusHistory: [{ status: 'NEW', at: now, by: uid ? 'customer' : 'guest' }],
      }

      tx.set(orderRef, order)
      tx.set(requestRef, {
        orderNumber,
        customerId: uid,
        createdAt: now,
      })

      return { order: serializeOrder(order) }
    })

    return result.order
  } catch (error) {
    if (error instanceof HttpsError) throw error
    console.error('createOrder failed', clientLog(error))
    throw new HttpsError(
      'internal',
      'We could not place your order just now. Please try again — you have not been charged.',
    )
  }
})

function serializeOrder(order: OrderDoc) {
  return {
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    customerId: order.customerId ?? null,
    customerName: order.customerName,
    phone: order.phone,
    building: order.building,
    floor: order.floor,
    officeOrShop: order.officeOrShop,
    deliveryInstructions: order.deliveryInstructions ?? null,
    items: order.items,
    itemCount: order.itemCount,
    subtotal: order.subtotal,
    deliveryCharge: order.deliveryCharge,
    total: order.total,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    assignedTo: order.assignedTo ?? null,
    assignedToName: order.assignedToName ?? null,
    statusHistory: (order.statusHistory ?? []).map((event) => ({
      status: event.status,
      at: timestampToIso(event.at),
      by: event.by ?? null,
    })),
    createdAt: timestampToIso(order.createdAt),
    updatedAt: timestampToIso(order.updatedAt),
  }
}

/**
 * Guest order tracking: order number + the phone used at checkout.
 * Returns only what the customer needs to follow the order.
 * Never returns the full customer record and never lists other orders.
 */
export const trackOrder = onCall(CALL_OPTIONS, async (request) => {
  const payload = (request.data ?? {}) as Record<string, unknown>
  const orderNumber = normalizeOrderNumber(payload.orderNumber)
  const phone = normalizePhone(payload.phone)

  if (!orderNumber || !phone) {
    throw new HttpsError('invalid-argument', 'Enter your order number and phone number.')
  }

  const ip = trustedClientIp(request)

  try {
    if (ip) {
      await enforceRateLimit(rateLimitKey('track_ip', ip), 30, 60 * 60 * 1000)
    }
    await enforceRateLimit(rateLimitKey('track_phone', phone), 40, 60 * 60 * 1000)

    const snapshot = await db.doc(`orders/${orderNumber}`).get()
    if (!snapshot.exists) {
      throw new HttpsError('not-found', 'No order matches that order number and phone number.')
    }

    const data = snapshot.data() as OrderDoc
    if (normalizePhone(data.phone) !== phone) {
      throw new HttpsError('not-found', 'No order matches that order number and phone number.')
    }

    return {
      orderNumber: data.orderNumber,
      customerName: String(data.customerName ?? '').split(' ')[0],
      orderStatus: data.orderStatus,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
      itemCount: data.itemCount,
      total: data.total,
      deliveryCharge: data.deliveryCharge,
      items: (data.items ?? []).map((item) => ({
        name: item.name,
        quantity: item.quantity,
        sugar: item.sugar,
        strength: item.strength,
        lineTotal: item.lineTotal,
      })),
      statusHistory: (data.statusHistory ?? []).map((event) => ({
        status: event.status,
        at: timestampToIso(event.at),
      })),
      createdAt: timestampToIso(data.createdAt),
      updatedAt: timestampToIso(data.updatedAt),
    }
  } catch (error) {
    if (error instanceof HttpsError) throw error
    console.error('trackOrder failed', clientLog(error))
    throw new HttpsError('internal', 'We could not look up that order just now. Please try again.')
  }
})

/**
 * Role provisioning. Only a SUPER_ADMIN may call this; roles are never chosen
 * by the account holder and never live only in the frontend.
 */
export const setUserRole = onCall(CALL_OPTIONS, async (request) => {
  if (request.auth?.token?.role !== 'SUPER_ADMIN') {
    throw new HttpsError('permission-denied', 'Only a super admin can change roles.')
  }

  const payload = (request.data ?? {}) as Record<string, unknown>
  const uid = String(payload.uid ?? '').trim()
  const email = String(payload.email ?? '').trim().toLowerCase()
  const role = String(payload.role ?? '').trim() as Role

  if (!(ROLES as readonly string[]).includes(role)) {
    throw new HttpsError('invalid-argument', 'Unknown role.')
  }

  let targetUid = uid
  if (!targetUid) {
    if (!email) throw new HttpsError('invalid-argument', 'Provide a uid or an email address.')
    try {
      targetUid = (await auth.getUserByEmail(email)).uid
    } catch {
      throw new HttpsError('not-found', 'No account uses that email address.')
    }
  }

  try {
    await auth.getUser(targetUid)
  } catch {
    throw new HttpsError('not-found', 'That account does not exist.')
  }

  await auth.setCustomUserClaims(targetUid, { role })
  await db.doc(`users/${targetUid}`).set(
    { role, updatedAt: FieldValue.serverTimestamp() },
    { merge: true },
  )

  return { uid: targetUid, role }
})

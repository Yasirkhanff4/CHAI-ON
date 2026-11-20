import { OrderError } from '@/lib/orders/errors'
import type { Order } from '@/types/order'

/**
 * INTERIM ORDER STORAGE. REPLACED IN PHASE 4.
 *
 * Phase 3 has no backend yet (Firebase is Phase 4), so placed orders are kept
 * in this browser to make checkout, confirmation and retry behaviour real and
 * testable end to end. This store is NOT the production home for orders:
 * Phase 4 moves order creation into the trusted Firebase Cloud Function and
 * reads go through Firestore security rules.
 *
 * Only the order service may import this module. Swapping the implementation
 * (or replacing it with an HTTP call) does not change any UI code.
 */
const ORDERS_KEY = 'chai-on:orders:v1'
const REQUESTS_KEY = 'chai-on:order-requests:v1'

type IdempotencyMap = Record<string, string>

function getStorage(): Storage {
  if (typeof window === 'undefined') {
    throw new OrderError('STORAGE', 'Order storage is unavailable in this browser.')
  }

  try {
    return window.localStorage
  } catch (error) {
    throw new OrderError('STORAGE', 'Order storage is unavailable in this browser.', {
      cause: error,
    })
  }
}

function readJson<T>(key: string, fallback: T): T {
  const storage = getStorage()
  const raw = storage.getItem(key)
  if (!raw) return fallback

  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown): void {
  const storage = getStorage()

  try {
    storage.setItem(key, JSON.stringify(value))
  } catch (error) {
    throw new OrderError(
      'STORAGE',
      'Your browser could not save the order. Free up some space or try another browser.',
      { cause: error },
    )
  }
}

export function readOrders(): Order[] {
  const orders = readJson<unknown>(ORDERS_KEY, [])
  if (!Array.isArray(orders)) return []

  return orders.filter(
    (order): order is Order =>
      Boolean(order) &&
      typeof order === 'object' &&
      typeof (order as Order).orderNumber === 'string' &&
      typeof (order as Order).orderId === 'string',
  )
}

export function findOrderByNumber(orderNumber: string): Order | null {
  return readOrders().find((order) => order.orderNumber === orderNumber) ?? null
}

export function findOrderByRequestKey(requestKey: string): Order | null {
  const requests = readJson<IdempotencyMap>(REQUESTS_KEY, {})
  const orderId = requests[requestKey]
  if (!orderId) return null

  return readOrders().find((order) => order.orderId === orderId) ?? null
}

export function saveOrder(order: Order, requestKey: string): void {
  const orders = readOrders()

  if (orders.some((existing) => existing.orderNumber === order.orderNumber)) {
    throw new OrderError('UNKNOWN', 'That order number is already in use. Please try again.')
  }

  writeJson(ORDERS_KEY, [order, ...orders].slice(0, 50))

  const requests = readJson<IdempotencyMap>(REQUESTS_KEY, {})
  writeJson(REQUESTS_KEY, { ...requests, [requestKey]: order.orderId })
}

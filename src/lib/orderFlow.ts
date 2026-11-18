import type { OrderStatus } from '@/types'

/** The only allowed status moves. Anything else is rejected by the UI. */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'DELIVERY_FAILED'],
  DELIVERY_FAILED: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  DELIVERED: [],
  REJECTED: [],
  CANCELLED: [],
}

export const TERMINAL_STATUSES: OrderStatus[] = ['DELIVERED', 'REJECTED', 'CANCELLED']

export function nextStatuses(current: OrderStatus): OrderStatus[] {
  return ORDER_TRANSITIONS[current] ?? []
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return nextStatuses(from).includes(to)
}

/** Statuses delivery staff may set on their own assigned orders. */
export const DELIVERY_STAFF_STATUSES: OrderStatus[] = [
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'DELIVERY_FAILED',
]

/** The happy path used by the customer timeline. */
export const TRACKING_STEPS: OrderStatus[] = [
  'NEW',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
]

export const CANCELLED_STATUSES: OrderStatus[] = ['REJECTED', 'CANCELLED', 'DELIVERY_FAILED']

export const ACTIVE_STATUSES: OrderStatus[] = [
  'NEW',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
]

import { Timestamp } from 'firebase/firestore'
import type { OrderStatus, SugarLevel, TeaStrength } from '@/types'
import type { Order, OrderEvent, OrderLine } from '@/types/order'
import { STRENGTH_LEVELS, SUGAR_LEVELS } from '@/types'

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'seconds' in value) {
    const seconds = Number((value as { seconds?: unknown }).seconds)
    if (Number.isFinite(seconds)) return new Date(seconds * 1000).toISOString()
  }
  return new Date().toISOString()
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

function mapLines(value: unknown): OrderLine[] {
  if (!Array.isArray(value)) return []

  return value.map((entry) => {
    const raw = (entry ?? {}) as Record<string, unknown>
    const sugar = String(raw.sugar ?? 'normal')
    const strength = String(raw.strength ?? 'normal')
    const quantity = Math.max(1, toNumber(raw.quantity, 1))
    const unitPrice = Math.max(0, toNumber(raw.unitPrice, 0))

    return {
      productId: String(raw.productId ?? ''),
      name: String(raw.name ?? 'Tea'),
      quantity,
      sugar: (SUGAR_LEVELS as readonly string[]).includes(sugar)
        ? (sugar as SugarLevel)
        : 'normal',
      strength: (STRENGTH_LEVELS as readonly string[]).includes(strength)
        ? (strength as TeaStrength)
        : 'normal',
      unitPrice,
      lineTotal: Math.max(0, toNumber(raw.lineTotal, unitPrice * quantity)),
    }
  })
}

function mapHistory(value: unknown): OrderEvent[] {
  if (!Array.isArray(value)) return []

  return value.map((entry) => {
    const raw = (entry ?? {}) as Record<string, unknown>
    return {
      status: String(raw.status ?? 'NEW') as OrderStatus,
      at: toIso(raw.at),
      by: toStringOrNull(raw.by),
    }
  })
}

/** Firestore order document (or callable response) -> app Order. */
export function mapOrder(id: string, data: Record<string, unknown>): Order {
  const items = mapLines(data.items)

  return {
    orderId: String(data.orderId ?? id),
    orderNumber: String(data.orderNumber ?? id),
    customerId: toStringOrNull(data.customerId),
    customerName: String(data.customerName ?? ''),
    phone: String(data.phone ?? ''),
    building: String(data.building ?? ''),
    floor: String(data.floor ?? ''),
    officeOrShop: String(data.officeOrShop ?? ''),
    deliveryInstructions: toStringOrNull(data.deliveryInstructions),
    items,
    itemCount: Math.max(0, toNumber(data.itemCount, items.reduce((sum, i) => sum + i.quantity, 0))),
    subtotal: Math.max(
      0,
      toNumber(data.subtotal, items.reduce((sum, line) => sum + line.lineTotal, 0)),
    ),
    deliveryCharge: Math.max(0, toNumber(data.deliveryCharge, 0)),
    total: Math.max(0, toNumber(data.total, 0)),
    paymentMethod: 'COD',
    paymentStatus: data.paymentStatus === 'PAID' ? 'PAID' : 'UNPAID',
    orderStatus: String(data.orderStatus ?? 'NEW') as OrderStatus,
    assignedTo: toStringOrNull(data.assignedTo),
    assignedToName: toStringOrNull(data.assignedToName),
    deliveryNotes: toStringOrNull(data.deliveryNotes),
    statusHistory: mapHistory(data.statusHistory),
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt ?? data.createdAt),
  }
}

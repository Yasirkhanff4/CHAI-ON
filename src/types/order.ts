import type { OrderStatus, SugarLevel, TeaStrength } from '@/types'

/** Only cash on delivery is supported until a payment gateway is added. */
export const PAYMENT_METHODS = ['COD'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_STATUSES = ['UNPAID', 'PAID'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

/** The delivery details a customer enters at checkout. */
export interface CustomerDetails {
  fullName: string
  /** Normalised local Pakistani mobile number, e.g. 03001234567 */
  phone: string
  building: string
  floor: string
  officeOrShop: string
  /** Empty string when the customer did not add instructions. */
  deliveryInstructions: string
}

export type CustomerDetailsField = keyof CustomerDetails

export type CustomerDetailsErrors = Partial<Record<CustomerDetailsField, string>>

/**
 * The minimum a client may send when asking for an order to be priced.
 * Prices are never accepted from the client.
 */
export interface OrderSubmissionItem {
  productId: string
  quantity: number
  sugar: SugarLevel
  strength: TeaStrength
}

/** A priced line, built only from trusted product data. */
export interface OrderLine {
  productId: string
  name: string
  quantity: number
  sugar: SugarLevel
  strength: TeaStrength
  /** Verified unit price in PKR, read from the product catalog. */
  unitPrice: number
  lineTotal: number
}

/** One recorded status change. */
export interface OrderEvent {
  status: OrderStatus
  /** ISO timestamp */
  at: string
  /** uid, "guest" or the staff member who made the change. */
  by?: string | null
}

/**
 * A placed order.
 *
 * `createdAt` / `updatedAt` are ISO strings in Phase 3. They become Firestore
 * server timestamps when order storage moves to the backend in Phase 4.
 */
export interface Order {
  orderId: string
  orderNumber: string
  /** Authenticated customer uid, or null for guest checkout. */
  customerId: string | null
  customerName: string
  phone: string
  building: string
  floor: string
  officeOrShop: string
  deliveryInstructions: string | null
  items: OrderLine[]
  itemCount: number
  subtotal: number
  deliveryCharge: number
  total: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  /** Delivery staff uid, when a delivery has been assigned. */
  assignedTo?: string | null
  assignedToName?: string | null
  deliveryNotes?: string | null
  statusHistory?: OrderEvent[]
  createdAt: string
  updatedAt: string
}

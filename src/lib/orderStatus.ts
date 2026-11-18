import type { OrderStatus } from '@/types'

/** Customer-facing wording for every order status. */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: 'Order received',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY: 'Ready',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  DELIVERY_FAILED: 'Delivery failed',
}

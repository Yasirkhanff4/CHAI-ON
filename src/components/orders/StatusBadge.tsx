import { ORDER_STATUS_LABELS } from '@/lib/orderStatus'
import type { OrderStatus } from '@/types'

const TONES: Record<OrderStatus, string> = {
  NEW: 'bg-cream text-brand-maroon border-soft-pink/60',
  ACCEPTED: 'bg-cream text-brand-maroon border-soft-pink',
  PREPARING: 'bg-cream text-brand-brown border-soft-pink',
  READY: 'bg-cream text-brand-red border-soft-pink',
  OUT_FOR_DELIVERY: 'bg-cream text-brand-red border-soft-pink',
  DELIVERED: 'bg-brand-red text-off-white border-brand-red',
  REJECTED: 'bg-soft-pink text-brand-red border-red-200',
  CANCELLED: 'bg-soft-pink text-brand-brown/70 border-soft-pink',
  DELIVERY_FAILED: 'bg-soft-pink text-brand-red border-red-200',
}

type StatusBadgeProps = {
  status: OrderStatus
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[12.5px] font-medium ${TONES[status]} ${className}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  )
}

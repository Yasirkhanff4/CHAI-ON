import { ORDER_STATUS_LABELS } from '@/lib/orderStatus'
import type { OrderStatus } from '@/types'

const TONES: Record<OrderStatus, string> = {
  NEW: 'bg-gold-100 text-gold-700 border-gold-300/60',
  ACCEPTED: 'bg-forest-50 text-forest-700 border-forest-200',
  PREPARING: 'bg-tea-100 text-tea-700 border-tea-200',
  READY: 'bg-forest-100 text-forest-800 border-forest-200',
  OUT_FOR_DELIVERY: 'bg-forest-100 text-forest-800 border-forest-300',
  DELIVERED: 'bg-forest-800 text-cream-50 border-forest-800',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  CANCELLED: 'bg-cream-200 text-forest-900/70 border-cream-300',
  DELIVERY_FAILED: 'bg-red-50 text-red-700 border-red-200',
}

type StatusBadgeProps = {
  status: OrderStatus
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] ${TONES[status]} ${className}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  )
}

import { AlertTriangle, Check, Circle } from 'lucide-react'
import { CANCELLED_STATUSES, TRACKING_STEPS } from '@/lib/orderFlow'
import { ORDER_STATUS_LABELS } from '@/lib/orderStatus'
import { formatDateTime } from '@/lib/format'
import type { OrderEvent } from '@/types/order'
import type { OrderStatus } from '@/types'

type OrderTimelineProps = {
  status: OrderStatus
  history?: OrderEvent[]
  createdAt: string
}

/**
 * Customer-facing progress. Uses the recorded status history when available so
 * timestamps are real, and falls back to the current status otherwise.
 */
export function OrderTimeline({ status, history = [], createdAt }: OrderTimelineProps) {
  const isCancelled = CANCELLED_STATUSES.includes(status)
  const currentIndex = TRACKING_STEPS.indexOf(status)

  const eventFor = (step: OrderStatus): OrderEvent | undefined =>
    history.find((event) => event.status === step)

  return (
    <div>
      {isCancelled && (
        <div className="mb-5 flex items-start gap-2.5 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
          <p className="text-[13px] leading-relaxed text-red-800">
            This order is {ORDER_STATUS_LABELS[status].toLowerCase()}. Call us if you would like
            to order again.
          </p>
        </div>
      )}

      <ol className="relative space-y-0">
        {TRACKING_STEPS.map((step, index) => {
          const event = eventFor(step)
          const completed = Boolean(event) || (!isCancelled && currentIndex >= index && currentIndex >= 0)
          const isCurrent = !isCancelled && currentIndex === index
          const at =
            event?.at ??
            (step === 'NEW' ? createdAt : undefined)

          return (
            <li key={step} className="relative flex gap-3.5 pb-5 last:pb-0">
              {index < TRACKING_STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[11px] top-6 h-[calc(100%-12px)] w-0.5 ${
                    completed ? 'bg-forest-400' : 'bg-cream-300'
                  }`}
                />
              )}
              <span
                className={`relative z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border ${
                  completed
                    ? 'border-forest-700 bg-forest-800 text-cream-50'
                    : 'border-cream-300 bg-cream-100 text-forest-900/30'
                }`}
              >
                {completed ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Circle className="h-2.5 w-2.5" aria-hidden="true" />
                )}
              </span>
              <div className="min-w-0">
                <p
                  className={`text-[13.5px] ${
                    isCurrent ? 'font-semibold text-forest-900' : 'font-medium text-forest-900/80'
                  }`}
                >
                  {ORDER_STATUS_LABELS[step]}
                  {isCurrent && (
                    <span className="ml-2 rounded-full bg-gold-100 px-2 py-0.5 text-[12.5px] font-medium text-gold-700">
                      Now
                    </span>
                  )}
                </p>
                {at && (
                  <p className="mt-0.5 text-[11.5px] text-forest-900/55">{formatDateTime(at)}</p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

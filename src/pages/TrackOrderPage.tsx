import { useState } from 'react'
import type { FormEvent } from 'react'
import { AlertCircle, Search } from 'lucide-react'
import { OrderTimeline } from '@/components/orders/OrderTimeline'
import { StatusBadge } from '@/components/orders/StatusBadge'
import { Container } from '@/components/ui/Container'
import { FormField } from '@/components/ui/FormField'
import { PageIntro } from '@/components/ui/PageIntro'
import { strengthLabel, sugarLabel } from '@/data/menu'
import { business } from '@/data/site'
import { buttonClasses } from '@/lib/buttonStyles'
import { formatDateTime, formatPKR } from '@/lib/format'
import { normalizeOrderNumber } from '@/lib/orders/orderNumber'
import { trackOrderRequest } from '@/services/orders'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import type { TrackedOrder } from '@/services/orders'

export function TrackOrderPage() {
  useDocumentTitle('Track your order | CHAI ON')

  const [orderNumber, setOrderNumber] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TrackedOrder | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const errors: Record<string, string> = {}
    if (!normalizeOrderNumber(orderNumber)) {
      errors.orderNumber = 'Enter your order number, for example CO-261118-7K4Q.'
    }

    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    setError(null)
    setResult(null)

    try {
      const tracked = await trackOrderRequest(orderNumber)
      setResult(tracked)
    } catch (trackError) {
      setError(
        trackError instanceof Error
          ? trackError.message
          : 'Order not found on this device. Contact us on WhatsApp.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageIntro
        eyebrow="Track order"
        title="Where is your chai?"
        description="Enter your order number. Tracking works on the device you ordered from. If you ordered elsewhere, message us on WhatsApp."
      />

      <section className="py-8 sm:py-10">
        <Container>
          <div className="mx-auto max-w-xl">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-xl border border-cream-300 bg-cream-50 p-4 sm:p-5"
            >
              {error && (
                <div
                  role="alert"
                  className="mb-4 rounded-[10px] border border-red-500/30 bg-red-50 px-3.5 py-3"
                >
                  <p className="flex items-start gap-2 text-[13px] leading-relaxed text-red-800">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {error}
                  </p>
                </div>
              )}

              <FormField
                id="orderNumber"
                label="Order number"
                value={orderNumber}
                onChange={setOrderNumber}
                error={fieldErrors.orderNumber}
                required
                placeholder="CO-261118-7K4Q"
                autoComplete="off"
                maxLength={20}
                disabled={submitting}
              />

              <button
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
                className={buttonClasses('primary', 'lg', 'mt-4 w-full')}
              >
                {submitting ? 'Looking up…' : 'Track order'}
                {!submitting && <Search className="h-4 w-4" aria-hidden="true" />}
              </button>

              <p className="mt-3 text-center text-[12px] leading-relaxed text-forest-900/60">
                Ordered on another device?{' '}
                <a
                  href={business.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-forest-800 hover:text-forest-600"
                >
                  WhatsApp us
                </a>{' '}
                your order number.
              </p>
            </form>

            {result && (
              <div className="mt-5 rounded-xl border border-cream-300 bg-cream-50 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-300 pb-3">
                  <div>
                    <p className="text-[12.5px] text-forest-900/60">Order</p>
                    <p className="text-[19px] font-semibold leading-tight text-forest-900">
                      {result.orderNumber}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-forest-900/60">
                      Placed {formatDateTime(result.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={result.orderStatus} />
                </div>

                <div className="mt-4">
                  <OrderTimeline
                    status={result.orderStatus}
                    history={result.statusHistory}
                    createdAt={result.createdAt}
                  />
                </div>

                <div className="mt-4 border-t border-cream-300 pt-3">
                  <ul className="space-y-2">
                    {result.items.map((item) => (
                      <li
                        key={`${item.name}-${item.sugar}-${item.strength}`}
                        className="flex items-start justify-between gap-3 text-[13px]"
                      >
                        <span className="text-forest-900/80">
                          {item.name} × {item.quantity}
                          <span className="block text-[11.5px] text-forest-900/55">
                            {sugarLabel(item.sugar)} · {strengthLabel(item.strength)}
                          </span>
                        </span>
                        <span className="font-semibold tabular-nums text-forest-900">
                          {formatPKR(item.lineTotal)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 flex items-baseline justify-between border-t border-cream-300 pt-3">
                    <span className="text-[13px] font-semibold text-forest-900">
                      {result.paymentStatus === 'PAID' ? 'Paid' : 'Cash on delivery'}
                    </span>
                    <span className="text-[19px] font-bold leading-none tabular-nums text-forest-900">
                      {formatPKR(result.total)}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  )
}

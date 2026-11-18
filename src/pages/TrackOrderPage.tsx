import { useState } from 'react'
import type { FormEvent } from 'react'
import { AlertCircle, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { OrderTimeline } from '@/components/orders/OrderTimeline'
import { StatusBadge } from '@/components/orders/StatusBadge'
import { Container } from '@/components/ui/Container'
import { FormField } from '@/components/ui/FormField'
import { PageIntro } from '@/components/ui/PageIntro'
import { strengthLabel, sugarLabel } from '@/data/menu'
import { buttonClasses } from '@/lib/buttonStyles'
import { formatDateTime, formatPKR } from '@/lib/format'
import { normalizeOrderNumber } from '@/lib/orders/orderNumber'
import { trackOrderRequest } from '@/services/orders'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import type { TrackedOrder } from '@/services/orders'

export function TrackOrderPage() {
  useDocumentTitle('Track your order — CHAI ON')

  const [orderNumber, setOrderNumber] = useState('')
  const [phone, setPhone] = useState('')
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
    if (!phone.trim()) errors.phone = 'Enter the phone number you ordered with.'

    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    setError(null)
    setResult(null)

    try {
      const tracked = await trackOrderRequest(orderNumber, phone)
      setResult(tracked)
    } catch (trackError) {
      setError(
        trackError instanceof Error
          ? trackError.message
          : 'No order matches that order number and phone number.',
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
        description="Enter your order number and the mobile number you ordered with. We only show the status of that one order."
      />

      <section className="py-10 sm:py-14">
        <Container>
          <div className="mx-auto max-w-xl">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-[28px] border border-cream-300/80 bg-cream-50 p-5 shadow-card sm:p-7"
            >
              {error && (
                <div
                  role="alert"
                  className="mb-5 rounded-2xl border border-red-500/30 bg-red-50 px-4 py-3"
                >
                  <p className="flex items-start gap-2 text-[13px] font-medium leading-relaxed text-red-800">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {error}
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
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
                <FormField
                  id="trackPhone"
                  label="Mobile number"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={setPhone}
                  error={fieldErrors.phone}
                  required
                  placeholder="0300 1234567"
                  autoComplete="tel"
                  maxLength={20}
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
                className={buttonClasses('primary', 'lg', 'mt-5 w-full')}
              >
                {submitting ? 'Looking up…' : 'Track order'}
                {!submitting && <Search className="h-4 w-4" aria-hidden="true" />}
              </button>

              <p className="mt-4 text-center text-[11.5px] leading-relaxed text-forest-900/60">
                Signed in?{' '}
                <Link to="/account" className="font-semibold text-forest-800 hover:text-forest-600">
                  Your account
                </Link>{' '}
                lists every order automatically.
              </p>
            </form>

            {result && (
              <div className="mt-6 rounded-[28px] border border-cream-300/80 bg-cream-50 p-5 shadow-card sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-300/70 pb-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-tea-500">
                      Order
                    </p>
                    <p className="font-display text-[24px] leading-tight text-forest-900">
                      {result.orderNumber}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-forest-900/60">
                      Placed {formatDateTime(result.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={result.orderStatus} />
                </div>

                <div className="mt-5">
                  <OrderTimeline
                    status={result.orderStatus}
                    history={result.statusHistory}
                    createdAt={result.createdAt}
                  />
                </div>

                <div className="mt-5 border-t border-cream-300/70 pt-4">
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
                  <p className="mt-3 flex items-baseline justify-between border-t border-cream-300/70 pt-3">
                    <span className="text-[13px] font-semibold text-forest-900">
                      {result.paymentStatus === 'PAID' ? 'Paid' : 'Cash on delivery'}
                    </span>
                    <span className="font-display text-[22px] leading-none text-forest-900">
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

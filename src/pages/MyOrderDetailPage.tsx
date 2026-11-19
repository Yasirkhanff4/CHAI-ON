import { useEffect, useState } from 'react'
import { ArrowLeft, Banknote, MapPin, Phone } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { OrderTimeline } from '@/components/orders/OrderTimeline'
import { StatusBadge } from '@/components/orders/StatusBadge'
import { Container } from '@/components/ui/Container'
import { PageIntro } from '@/components/ui/PageIntro'
import { buttonClasses } from '@/lib/buttonStyles'
import { strengthLabel, sugarLabel } from '@/data/menu'
import { formatDateTime, formatPKR } from '@/lib/format'
import { fetchOrderByNumber } from '@/services/orders'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import type { Order } from '@/types/order'

type LoadState = 'loading' | 'ready' | 'missing' | 'error'

export function MyOrderDetailPage() {
  const { orderNumber = '' } = useParams<{ orderNumber: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [state, setState] = useState<LoadState>('loading')
  const [message, setMessage] = useState<string | null>(null)

  useDocumentTitle(order ? `Order ${order.orderNumber} — CHAI ON` : 'Order — CHAI ON')

  useEffect(() => {
    let cancelled = false

    fetchOrderByNumber(orderNumber)
      .then((found) => {
        if (cancelled) return
        setOrder(found)
        setState(found ? 'ready' : 'missing')
      })
      .catch(() => {
        if (cancelled) {
          setState('error')
          setMessage('We could not load this order. Please try again.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [orderNumber])

  if (state === 'loading') {
    return (
      <section className="py-20">
        <Container>
          <div className="mx-auto max-w-lg rounded-xl border border-cream-300/80 bg-cream-50 px-6 py-12 text-center">
            <span
              aria-hidden="true"
              className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-forest-900/15 border-t-forest-800"
            />
            <p className="mt-3 text-[13px] text-forest-900/60">Loading order…</p>
          </div>
        </Container>
      </section>
    )
  }

  if (state !== 'ready' || !order) {
    return (
      <>
        <PageIntro
          eyebrow="Order"
          title={state === 'error' ? 'We could not load this order.' : 'Order not found.'}
          description={message ?? 'This order does not exist, or it belongs to another account.'}
        />
        <section className="py-10">
          <Container>
            <div className="flex flex-wrap gap-3">
              <Link to="/account" className={buttonClasses('primary', 'md')}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to your account
              </Link>
              <Link to="/contact" className={buttonClasses('secondary', 'md')}>
                Contact us
              </Link>
            </div>
          </Container>
        </section>
      </>
    )
  }

  return (
    <>
      <PageIntro
        eyebrow="Your order"
        title={order.orderNumber}
        description={`Placed ${formatDateTime(order.createdAt)}`}
      >
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <StatusBadge status={order.orderStatus} />
          <span className="text-[12.5px] font-medium text-forest-900/70">
            {order.paymentStatus === 'PAID' ? 'Paid' : 'Cash on delivery · unpaid'}
          </span>
        </div>
      </PageIntro>

      <section className="py-10 sm:py-14">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-10">
            <div className="rounded-xl border border-cream-300/80 bg-cream-50 p-5 sm:p-7">
              <h2 className="font-bold text-[24px] leading-tight text-forest-900">
                Order progress
              </h2>
              <div className="mt-5">
                <OrderTimeline
                  status={order.orderStatus}
                  history={order.statusHistory}
                  createdAt={order.createdAt}
                />
              </div>

              <div className="mt-6 border-t border-cream-300/80 pt-5">
                <h3 className="text-[12.5px] font-medium text-tea-500">
                  Items
                </h3>
                <ul className="mt-3 divide-y divide-cream-300/60">
                  {order.items.map((item) => (
                    <li
                      key={`${item.productId}-${item.sugar}-${item.strength}`}
                      className="flex items-start justify-between gap-3 py-3"
                    >
                      <div>
                        <p className="text-[13.5px] font-medium text-forest-900">
                          {item.name}{' '}
                          <span className="font-normal text-forest-900/60">× {item.quantity}</span>
                        </p>
                        <p className="mt-0.5 text-[11.5px] text-forest-900/60">
                          {sugarLabel(item.sugar)} · {strengthLabel(item.strength)}
                        </p>
                      </div>
                      <p className="text-[13px] font-semibold tabular-nums text-forest-900">
                        {formatPKR(item.lineTotal)}
                      </p>
                    </li>
                  ))}
                </ul>
                <dl className="mt-2 space-y-2 border-t border-cream-300/70 pt-3 text-[13px]">
                  <div className="flex justify-between">
                    <dt className="text-forest-900/70">Subtotal</dt>
                    <dd className="tabular-nums text-forest-900">{formatPKR(order.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-forest-900/70">Delivery</dt>
                    <dd className="tabular-nums text-forest-900">
                      {order.deliveryCharge === 0 ? 'Free' : formatPKR(order.deliveryCharge)}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-cream-300/70 pt-2">
                    <dt className="font-semibold text-forest-900">Total</dt>
                    <dd className="font-bold text-[22px] leading-none text-forest-900">
                      {formatPKR(order.total)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-xl border border-cream-300/80 bg-cream-50 p-5">
                <p className="flex items-center gap-2 text-[12.5px] font-medium text-tea-500">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  Delivery details
                </p>
                <p className="mt-2 text-[14px] font-semibold text-forest-900">
                  {order.customerName}
                </p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-forest-900/75">
                  {order.officeOrShop}, {order.floor}
                  <br />
                  {order.building}
                </p>
                <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-forest-900/75">
                  <Phone className="h-3.5 w-3.5 text-tea-500" aria-hidden="true" />
                  {order.phone}
                </p>
                {order.deliveryInstructions && (
                  <p className="mt-2 rounded-xl bg-cream-100 px-3 py-2 text-[12.5px] leading-relaxed text-forest-900/70">
                    {order.deliveryInstructions}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-cream-300/80 bg-cream-50 p-5">
                <p className="flex items-center gap-2 text-[12.5px] font-medium text-tea-500">
                  <Banknote className="h-3.5 w-3.5" aria-hidden="true" />
                  Payment
                </p>
                <p className="mt-2 text-[14px] font-semibold text-forest-900">
                  Cash on delivery
                </p>
                <p className="mt-0.5 text-[12.5px] text-forest-900/65">
                  {order.paymentStatus === 'PAID'
                    ? 'Payment confirmed by CHAI ON.'
                    : `${formatPKR(order.total)} to pay when your chai arrives.`}
                </p>
              </div>

              <Link to="/account" className={buttonClasses('secondary', 'md', 'w-full')}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                All your orders
              </Link>
            </aside>
          </div>
        </Container>
      </section>
    </>
  )
}

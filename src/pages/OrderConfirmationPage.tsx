import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Search,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { buttonClasses } from '@/lib/buttonStyles'
import { categoryForProduct, strengthLabel, sugarLabel, supportsTeaOptions } from '@/data/menu'
import { business } from '@/data/site'
import { formatDateTime, formatPKR } from '@/lib/format'
import { useAuth } from '@/context/authContext'
import { getOrderForConfirmation } from '@/services/orders'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { ORDER_STATUS_LABELS } from '@/lib/orderStatus'
import type { Order } from '@/types/order'

type LoadState = 'loading' | 'ready' | 'missing' | 'error'

type LookupResult = {
  orderNumber: string
  order: Order | null
}

export function OrderConfirmationPage() {
  const { orderNumber = '' } = useParams<{ orderNumber: string }>()
  const { profile } = useAuth()
  const [result, setResult] = useState<LookupResult | null>(null)
  const [failedNumber, setFailedNumber] = useState<string | null>(null)

  // State is derived from the lookup so a route change shows the loading state
  // without a synchronous setState inside the effect.
  const state: LoadState =
    failedNumber === orderNumber
      ? 'error'
      : result?.orderNumber === orderNumber
        ? result.order
          ? 'ready'
          : 'missing'
        : 'loading'
  const order = state === 'ready' ? result?.order ?? null : null

  useDocumentTitle(order ? `Order ${order.orderNumber} | CHAYON` : 'Order confirmation | CHAYON')

  useEffect(() => {
    let cancelled = false

    getOrderForConfirmation(orderNumber, profile?.uid ?? null)
      .then((found) => {
        if (!cancelled) setResult({ orderNumber, order: found })
      })
      .catch(() => {
        if (!cancelled) setFailedNumber(orderNumber)
      })

    return () => {
      cancelled = true
    }
  }, [orderNumber, profile?.uid])

  if (state === 'loading') {
    return (
      <section className="py-20">
        <Container>
          <div className="mx-auto max-w-lg rounded-xl border border-soft-pink/80 bg-off-white px-6 py-14 text-center">
            <span
              aria-hidden="true"
              className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-brown/15 border-t-brand-red"
            />
            <p className="mt-5 text-[13.5px] text-brand-brown/70">Finding your order…</p>
            <p aria-live="polite" className="sr-only">
              Loading your order
            </p>
          </div>
        </Container>
      </section>
    )
  }

  if (state !== 'ready' || !order) {
    return (
      <section className="py-16 sm:py-24">
        <Container>
          <div className="mx-auto max-w-lg rounded-xl border border-soft-pink/80 bg-off-white px-6 py-12 text-center sm:px-10">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-soft-pink text-brand-red">
              <AlertCircle className="h-6 w-6" aria-hidden="true" />
            </span>
            <h1 className="mt-5 font-bold text-[30px] leading-tight text-brand-brown">
              {state === 'error' ? 'We could not load this order.' : 'Order not found here.'}
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed text-brand-brown/70">
              {state === 'error'
                ? 'Please refresh the page. If it keeps failing, call us and we will confirm your order.'
                : 'This device has no record of that order number. If you placed it here, check the number or call us. We have your order on our side.'}
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/track" className={buttonClasses('primary', 'md')}>
                <Search className="h-4 w-4" aria-hidden="true" />
                Track an order
              </Link>
              <Link to="/menu" className={buttonClasses('secondary', 'md')}>
                Back to menu
              </Link>
            </div>
            <p className="mt-6 border-t border-soft-pink/70 pt-5 text-[12px] text-brand-brown/70">
              Need help now? Call{' '}
              <a href={business.phoneHref} className="font-semibold text-brand-red">
                {business.phoneDisplay}
              </a>
            </p>
          </div>
        </Container>
      </section>
    )
  }

  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-soft-pink/80 bg-off-white px-5 py-8 sm:px-9 sm:py-10">
            <div className="text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-brown text-off-white">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="mt-5 text-[12.5px] font-medium text-brand-brown">
                Order received
              </p>
              <h1 className="mt-2 font-bold text-[34px] leading-[1.05] tracking-[-0.015em] text-brand-brown sm:text-[42px]">
                Thank you, {order.customerName.split(' ')[0]}.
              </h1>
              <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-brand-brown/70">
                We have your order. We brew it fresh and bring it up to your desk. If we cannot
                find the office, we will call the number you gave us.
              </p>

              <div className="mx-auto mt-6 inline-flex flex-col items-center rounded-xl border border-soft-pink bg-cream/70 px-6 py-4">
                <span className="text-[12.5px] font-medium text-brand-brown/55">
                  Order number
                </span>
                <span className="mt-1 font-bold text-[26px] tracking-[0.04em] text-brand-brown">
                  {order.orderNumber}
                </span>
              </div>
              <p className="mt-2 text-[11.5px] text-brand-brown/55">
                Keep this number to track your order.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-soft-pink/80 px-4 py-4">
                <p className="flex items-center gap-2 text-[12.5px] font-medium text-brand-brown">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  Status
                </p>
                <p className="mt-2 text-[14px] font-semibold text-brand-brown">
                  {ORDER_STATUS_LABELS[order.orderStatus]}
                </p>
                <p className="mt-1 text-[12px] text-brand-brown/60">
                  Placed {formatDateTime(order.createdAt)}
                </p>
              </div>

              <div className="rounded-xl border border-soft-pink/80 px-4 py-4">
                <p className="flex items-center gap-2 text-[12.5px] font-medium text-brand-brown">
                  <Banknote className="h-3.5 w-3.5" aria-hidden="true" />
                  Payment
                </p>
                <p className="mt-2 text-[14px] font-semibold text-brand-brown">Cash on delivery</p>
                <p className="mt-1 text-[12px] text-brand-brown/60">
                  {formatPKR(order.total)} due on delivery ·{' '}
                  {order.paymentStatus === 'PAID' ? 'Paid' : 'Unpaid'}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-soft-pink/80 px-4 py-4 sm:px-5">
              <p className="flex items-center gap-2 text-[12.5px] font-medium text-brand-brown">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                Delivering to
              </p>
              <p className="mt-2 text-[14px] font-semibold text-brand-brown">{order.customerName}</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-brand-brown/75">
                {order.officeOrShop}, {order.floor}
                <br />
                {order.building}
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-brand-brown/75">
                <Phone className="h-3.5 w-3.5 text-brand-brown" aria-hidden="true" />
                {order.phone}
              </p>
              {order.deliveryInstructions && (
                <p className="mt-2 rounded-xl bg-cream px-3 py-2 text-[12.5px] leading-relaxed text-brand-brown/70">
                  {order.deliveryInstructions}
                </p>
              )}
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-soft-pink/80">
              <table className="w-full text-left">
                <caption className="sr-only">Order items</caption>
                <thead className="bg-cream/70 text-[12px] font-medium text-brand-brown/55">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-semibold">
                      Item
                    </th>
                    <th scope="col" className="px-4 py-2.5 text-center font-semibold">
                      Qty
                    </th>
                    <th scope="col" className="px-4 py-2.5 text-right font-semibold">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soft-pink/70">
                  {order.items.map((item) => {
                    const showOptions = supportsTeaOptions(
                      categoryForProduct({ name: item.name }),
                    )
                    return (
                      <tr key={`${item.productId}-${item.sugar}-${item.strength}`}>
                        <td className="px-4 py-3">
                          <p className="text-[13.5px] font-medium text-brand-brown">{item.name}</p>
                          <p className="mt-0.5 text-[11.5px] text-brand-brown/60">
                            {showOptions &&
                              `${sugarLabel(item.sugar)} · ${strengthLabel(item.strength)} · `}
                            {formatPKR(item.unitPrice)} each
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center text-[13px] tabular-nums text-brand-brown/75">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-[13px] font-semibold tabular-nums text-brand-brown">
                          {formatPKR(item.lineTotal)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              <dl className="space-y-2 border-t border-soft-pink/80 px-4 py-4 text-[13px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-brand-brown/70">Subtotal</dt>
                  <dd className="tabular-nums text-brand-brown">{formatPKR(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-brand-brown/70">Delivery</dt>
                  <dd className="tabular-nums text-brand-brown">
                    {order.deliveryCharge === 0 ? 'Free' : formatPKR(order.deliveryCharge)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-t border-soft-pink/80 pt-2.5">
                  <dt className="font-semibold text-brand-brown">Total</dt>
                  <dd className="font-bold text-[24px] leading-none text-brand-brown">
                    {formatPKR(order.total)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/track" className={buttonClasses('primary', 'lg', 'flex-1')}>
                Track order
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/menu" className={buttonClasses('secondary', 'lg', 'flex-1')}>
                Order again
              </Link>
            </div>

            <p className="mt-5 text-center text-[11.5px] leading-relaxed text-brand-brown/55">
              Something wrong with this order? Call{' '}
              <a href={business.phoneHref} className="font-semibold text-brand-red">
                {business.phoneDisplay}
              </a>{' '}
              and quote {order.orderNumber}.
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}

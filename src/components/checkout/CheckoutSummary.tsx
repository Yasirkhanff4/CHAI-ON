import { Banknote, CheckCircle2, Clock, ShoppingBag, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '@/context/cartContext'
import { strengthLabel, sugarLabel } from '@/data/menu'
import { business } from '@/data/site'
import { formatPKR } from '@/lib/format'
import { buttonClasses } from '@/lib/buttonStyles'

type CheckoutSummaryProps = {
  /** Renders a submit button that posts the checkout form with this id. */
  formId: string
  submitting: boolean
  disabled?: boolean
}

export function CheckoutSummary({ formId, submitting, disabled = false }: CheckoutSummaryProps) {
  const { items, totals } = useCart()

  return (
    <div className="rounded-[28px] border border-cream-300/80 bg-cream-50 shadow-card">
      <div className="border-b border-cream-300/80 px-5 py-5 sm:px-6">
        <h2 className="font-display text-[24px] leading-tight tracking-[-0.01em] text-forest-900">
          Order summary
        </h2>
        <p className="mt-1 text-[12px] text-forest-900/60">
          {totals.itemCount} {totals.itemCount === 1 ? 'cup' : 'cups'} ·{' '}
          {items.length} {items.length === 1 ? 'line' : 'lines'}
        </p>
      </div>

      <ul className="divide-y divide-cream-300/70 px-5 sm:px-6">
        {items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-3 py-4">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-forest-900">
                {item.name}
                <span className="ml-1.5 font-normal text-forest-900/60">× {item.quantity}</span>
              </p>
              <p className="mt-0.5 text-[12px] text-forest-900/65">
                {sugarLabel(item.sugar)} · {strengthLabel(item.strength)}
              </p>
              <p className="mt-0.5 text-[11.5px] text-forest-900/55">
                {formatPKR(item.unitPrice)} each
              </p>
            </div>
            <p className="shrink-0 text-[14px] font-semibold tabular-nums text-forest-900">
              {formatPKR(item.unitPrice * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="px-5 pt-4 sm:px-6">
        <dl className="space-y-2.5 text-[13.5px]">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-forest-900/70">Subtotal</dt>
            <dd className="font-medium tabular-nums text-forest-900">{formatPKR(totals.subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-forest-900/70">Delivery</dt>
            <dd className="font-medium tabular-nums text-forest-900">
              {totals.deliveryCharge === 0 ? 'Free' : formatPKR(totals.deliveryCharge)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-forest-900/70">Payment method</dt>
            <dd className="flex items-center gap-1.5 font-medium text-forest-900">
              <Banknote className="h-3.5 w-3.5 text-tea-500" aria-hidden="true" />
              Cash on delivery
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-cream-300/80 pt-4">
          <p className="text-sm font-semibold text-forest-900">Payable on delivery</p>
          <p className="font-display text-[30px] leading-none tracking-[-0.01em] text-forest-900">
            {formatPKR(totals.total)}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 pt-5 sm:px-6">
        <button
          type="submit"
          form={formId}
          disabled={submitting || disabled}
          aria-busy={submitting}
          className={buttonClasses('primary', 'lg', 'w-full')}
        >
          {submitting ? (
            <>
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-cream-50/40 border-t-cream-50"
              />
              Placing your order…
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              Place order · {formatPKR(totals.total)}
            </>
          )}
        </button>

        <p className="mt-3 text-center text-[11.5px] leading-relaxed text-forest-900/60">
          You will be asked to pay {formatPKR(totals.total)} in cash when your chai arrives.
        </p>

        <div className="mt-4 space-y-2 border-t border-cream-300/80 pt-4 text-[11.5px] leading-relaxed text-forest-900/65">
          <p className="flex items-start gap-2">
            <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-tea-500" aria-hidden="true" />
            Delivered across {business.deliveryArea}.
          </p>
          <p className="flex items-start gap-2">
            <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-tea-500" aria-hidden="true" />
            Freshly brewed after you order. Typical delivery is 15–25 minutes.
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-tea-500" aria-hidden="true" />
            No account needed. Prices are confirmed by CHAI ON when the order is placed.
          </p>
        </div>

        <Link
          to="/cart"
          className="mt-4 inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-[12.5px] font-medium text-forest-900/65 transition hover:bg-cream-200/60 hover:text-forest-900"
        >
          Back to cart
        </Link>
      </div>
    </div>
  )
}

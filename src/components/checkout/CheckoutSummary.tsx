import { Banknote, CheckCircle2, Clock, ShoppingBag, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '@/context/cartContext'
import {
  categoryForProduct,
  strengthLabel,
  sugarLabel,
  supportsTeaOptions,
} from '@/data/menu'
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
    <div className="overflow-hidden rounded-card bg-off-white shadow-card">
      <div className="border-b border-brand-brown/10 px-5 py-4">
        <h2 className="text-[20px] font-semibold leading-tight text-brand-brown">Order summary</h2>
        <p className="mt-0.5 text-[12px] text-brand-brown/45">
          {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'} · {items.length}{' '}
          {items.length === 1 ? 'line' : 'lines'}
        </p>
      </div>

      <ul className="divide-y divide-brand-brown/10 px-5">
        {items.map((item) => {
          const customizable = supportsTeaOptions(categoryForProduct({ name: item.name }))
          return (
            <li key={item.id} className="flex items-start justify-between gap-3 py-3.5">
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-brand-brown">
                  {item.name}
                  <span className="ml-1.5 font-normal text-brand-brown/45">× {item.quantity}</span>
                </p>
                {customizable && (
                  <p className="mt-0.5 text-[12px] text-brand-brown/55">
                    {sugarLabel(item.sugar)} · {strengthLabel(item.strength)}
                  </p>
                )}
                <p className="mt-0.5 text-[11.5px] text-brand-brown/40">
                  {formatPKR(item.unitPrice)} each
                </p>
              </div>
              <p className="shrink-0 text-[14px] font-semibold tabular-nums text-brand-brown">
                {formatPKR(item.unitPrice * item.quantity)}
              </p>
            </li>
          )
        })}
      </ul>

      <div className="px-5 pt-3">
        <dl className="space-y-2.5 text-[13.5px]">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-brand-brown/60">Subtotal</dt>
            <dd className="font-semibold tabular-nums text-brand-brown">
              {formatPKR(totals.subtotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-brand-brown/60">Delivery</dt>
            <dd className="font-semibold tabular-nums text-brand-brown">
              {totals.deliveryCharge === 0 ? 'Free' : formatPKR(totals.deliveryCharge)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-brand-brown/60">Payment</dt>
            <dd className="flex items-center gap-1.5 font-medium text-brand-brown">
              <Banknote className="h-3.5 w-3.5 text-brand-red/80" aria-hidden="true" />
              Cash on delivery
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-brand-brown/10 pt-4">
          <p className="text-sm font-semibold text-brand-brown">Pay on delivery</p>
          <p className="text-[24px] font-bold leading-none tabular-nums text-brand-brown">
            {formatPKR(totals.total)}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 pt-4">
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
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
              Placing your order...
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              Place order · {formatPKR(totals.total)}
            </>
          )}
        </button>

        <p className="mt-2.5 text-center text-[11.5px] leading-relaxed text-brand-brown/45">
          Pay {formatPKR(totals.total)} in cash when your order arrives.
        </p>

        <div className="mt-4 space-y-2 border-t border-brand-brown/10 pt-4 text-[11.5px] leading-relaxed text-brand-brown/55">
          <p className="flex items-start gap-2">
            <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-red/80" aria-hidden="true" />
            Delivered across {business.deliveryArea}.
          </p>
          <p className="flex items-start gap-2">
            <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-red/80" aria-hidden="true" />
            Brewed after you order. Usually 15 to 25 minutes.
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-red/80" aria-hidden="true" />
            No account needed.
          </p>
        </div>

        <Link
          to="/cart"
          className="mt-2 inline-flex min-h-10 w-full items-center justify-center rounded-xl px-3 text-[12.5px] font-medium text-brand-brown/50 transition-colors hover:bg-cream hover:text-brand-brown"
        >
          Back to cart
        </Link>
      </div>
    </div>
  )
}

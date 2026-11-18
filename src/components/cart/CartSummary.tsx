import { ArrowRight, ShieldCheck, ShoppingBag, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '@/context/cartContext'
import { business, orderSettings } from '@/data/site'
import { formatPKR } from '@/lib/format'
import { buttonClasses } from '@/lib/buttonStyles'

export function CartSummary() {
  const { totals } = useCart()
  const belowMinimum = totals.subtotal < orderSettings.minimumOrder
  const shortfall = orderSettings.minimumOrder - totals.subtotal

  return (
    <aside
      aria-labelledby="cart-summary-heading"
      className="lg:sticky lg:top-28 lg:self-start"
    >
      <div className="rounded-[28px] border border-cream-300/80 bg-cream-50 p-6 shadow-card sm:p-7">
        <h2
          id="cart-summary-heading"
          className="font-display text-[26px] leading-tight tracking-[-0.01em] text-forest-900"
        >
          Order summary
        </h2>

        <dl className="mt-5 space-y-3 text-[13.5px]">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-forest-900/70">
              Subtotal
              <span className="ml-1.5 text-forest-900/60">({totals.itemCount} cups)</span>
            </dt>
            <dd className="font-medium tabular-nums text-forest-900">
              {formatPKR(totals.subtotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-forest-900/70">Delivery</dt>
            <dd className="font-medium tabular-nums text-forest-900">
              {totals.deliveryCharge === 0 ? 'Free' : formatPKR(totals.deliveryCharge)}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-cream-300/80 pt-4">
          <p className="text-sm font-semibold text-forest-900">Total</p>
          <p className="font-display text-[30px] leading-none tracking-[-0.01em] text-forest-900">
            {formatPKR(totals.total)}
          </p>
        </div>

        {belowMinimum && (
          <p className="mt-4 rounded-xl bg-gold-100 px-3.5 py-3 text-[12.5px] leading-relaxed text-forest-900/80">
            Add {formatPKR(shortfall)} more to reach the minimum order of{' '}
            {formatPKR(orderSettings.minimumOrder)}.
          </p>
        )}

        {belowMinimum ? (
          <span
            aria-disabled="true"
            className={buttonClasses('primary', 'lg', 'mt-5 w-full cursor-not-allowed opacity-50')}
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            Proceed to checkout
          </span>
        ) : (
          <Link to="/checkout" className={buttonClasses('primary', 'lg', 'mt-5 w-full')}>
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            Proceed to checkout
          </Link>
        )}

        <Link
          to="/menu"
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium text-forest-900/70 transition hover:bg-cream-200/60 hover:text-forest-900"
        >
          Add more tea
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>

        <div className="mt-5 space-y-2.5 border-t border-cream-300/80 pt-5 text-[12px] leading-relaxed text-forest-900/70">
          <p className="flex items-start gap-2">
            <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-tea-500" aria-hidden="true" />
            {totals.deliveryCharge === 0
              ? `Free delivery to ${business.deliveryArea}.`
              : `Delivery to ${business.deliveryArea}.`}
          </p>
          <p className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-tea-500" aria-hidden="true" />
            Cash on delivery. No account needed — pay when your chai arrives.
          </p>
        </div>
      </div>
    </aside>
  )
}

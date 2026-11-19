import { ArrowRight, ShieldCheck, ShoppingBag, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { WhatsAppOrderButton } from '@/components/whatsapp/WhatsAppOrderButton'
import { useCart } from '@/context/cartContext'
import { useStoreSettings } from '@/context/settingsContext'
import { business } from '@/data/site'
import { formatPKR } from '@/lib/format'
import { buttonClasses } from '@/lib/buttonStyles'

export function CartSummary() {
  const { totals } = useCart()
  const { settings } = useStoreSettings()
  const belowMinimum = totals.subtotal < settings.minimumOrder
  const shortfall = settings.minimumOrder - totals.subtotal

  return (
    <aside aria-labelledby="cart-summary-heading" className="lg:sticky lg:top-28 lg:self-start">
      <div className="rounded-xl border border-cream-300 bg-cream-50 p-5">
        <h2 id="cart-summary-heading" className="text-[20px] leading-tight text-forest-900">
          Order summary
        </h2>

        <dl className="mt-4 space-y-2.5 text-[13.5px]">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-forest-900/70">
              Subtotal
              <span className="ml-1.5 text-forest-900/60">({totals.itemCount} cups)</span>
            </dt>
            <dd className="font-semibold tabular-nums text-forest-900">
              {formatPKR(totals.subtotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-forest-900/70">Delivery</dt>
            <dd className="font-semibold tabular-nums text-forest-900">
              {totals.deliveryCharge === 0 ? 'Free' : formatPKR(totals.deliveryCharge)}
            </dd>
          </div>
        </dl>

        <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-cream-300 pt-3">
          <p className="text-sm font-semibold text-forest-900">Total</p>
          <p className="text-[24px] font-bold leading-none tabular-nums text-forest-900">
            {formatPKR(totals.total)}
          </p>
        </div>

        {belowMinimum && (
          <p className="mt-4 rounded-[10px] bg-gold-100 px-3 py-2.5 text-[12.5px] leading-relaxed text-forest-900/80">
            Add {formatPKR(shortfall)} more to reach the minimum order of{' '}
            {formatPKR(settings.minimumOrder)}.
          </p>
        )}

        {belowMinimum ? (
          <span
            aria-disabled="true"
            className={buttonClasses('primary', 'lg', 'mt-4 w-full cursor-not-allowed opacity-50')}
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            Proceed to checkout
          </span>
        ) : (
          <Link to="/checkout" className={buttonClasses('primary', 'lg', 'mt-4 w-full')}>
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            Proceed to checkout
          </Link>
        )}

        <Link
          to="/menu"
          className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[10px] px-3 text-[13px] font-medium text-forest-900/70 transition hover:bg-cream-200/60 hover:text-forest-900"
        >
          Add more tea
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>

        <div className="mt-3 border-t border-cream-300 pt-3">
          <WhatsAppOrderButton
            variant="ghost"
            size="md"
            className="w-full justify-start px-0 text-[13px] text-forest-800"
            iconClassName="h-5 w-5 shrink-0"
          />
          <p className="mt-1 text-center text-[11.5px] leading-relaxed text-forest-900/60">
            Or send this cart to us on WhatsApp.
          </p>
        </div>

        <div className="mt-4 space-y-2 border-t border-cream-300 pt-4 text-[12px] leading-relaxed text-forest-900/70">
          <p className="flex items-start gap-2">
            <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-tea-500" aria-hidden="true" />
            {totals.deliveryCharge === 0
              ? `Free delivery to ${business.deliveryArea}.`
              : `Delivery to ${business.deliveryArea}.`}
          </p>
          <p className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-tea-500" aria-hidden="true" />
            Cash on delivery. No account needed.
          </p>
        </div>
      </div>
    </aside>
  )
}

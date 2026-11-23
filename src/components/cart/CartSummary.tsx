import { ArrowRight, ShieldCheck, ShoppingBag, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { WhatsAppActionBar } from '@/components/whatsapp/WhatsAppActionBar'
import { useCart } from '@/context/cartContext'
import { useStoreSettings } from '@/context/settingsContext'
import { business } from '@/data/site'
import { formatPKR } from '@/lib/format'
import { buttonClasses } from '@/lib/buttonStyles'
import { buildWhatsAppOrderUrl } from '@/lib/whatsapp'

export function CartSummary() {
  const { items, totals } = useCart()
  const { settings } = useStoreSettings()
  const belowMinimum = totals.subtotal < settings.minimumOrder
  const shortfall = settings.minimumOrder - totals.subtotal

  return (
    <aside aria-labelledby="cart-summary-heading" className="lg:sticky lg:top-28 lg:self-start">
      <div className="rounded-xl border border-soft-pink bg-off-white p-5 shadow-card">
        <h2 id="cart-summary-heading" className="text-[20px] font-semibold leading-tight text-brand-brown">
          Order summary
        </h2>

        <dl className="mt-4 space-y-2.5 text-[13.5px]">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-brand-brown/70">
              Subtotal
              <span className="ml-1.5 text-brand-brown/60">
                ({totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'})
              </span>
            </dt>
            <dd className="font-semibold tabular-nums text-brand-brown">
              {formatPKR(totals.subtotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-brand-brown/70">Delivery</dt>
            <dd className="font-semibold tabular-nums text-brand-brown">
              {totals.deliveryCharge === 0 ? 'Free' : formatPKR(totals.deliveryCharge)}
            </dd>
          </div>
        </dl>

        <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-soft-pink pt-3">
          <p className="text-sm font-semibold text-brand-brown">Total</p>
          <p className="text-[24px] font-bold leading-none tabular-nums text-brand-brown">
            {formatPKR(totals.total)}
          </p>
        </div>

        {belowMinimum && (
          <p className="mt-4 rounded-xl bg-cream px-3 py-2.5 text-[12.5px] leading-relaxed text-brand-brown/80">
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
          className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl px-3 text-[13px] font-medium text-brand-brown/70 transition hover:bg-soft-pink/40 hover:text-brand-brown"
        >
          Add more items
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>

        <div className="mt-3 border-t border-soft-pink pt-3">
          <WhatsAppActionBar href={buildWhatsAppOrderUrl(items, totals)} />
          <p className="mt-1 text-center text-[11.5px] leading-relaxed text-brand-brown/60">
            Or send this cart to us on WhatsApp.
          </p>
        </div>

        <div className="mt-4 space-y-2 border-t border-soft-pink pt-4 text-[12px] leading-relaxed text-brand-brown/70">
          <p className="flex items-start gap-2">
            <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-red" aria-hidden="true" />
            {totals.deliveryCharge === 0
              ? `Free delivery to ${business.deliveryArea}.`
              : `Delivery to ${business.deliveryArea}.`}
          </p>
          <p className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-red" aria-hidden="true" />
            Cash on delivery. No account needed.
          </p>
        </div>
      </div>
    </aside>
  )
}

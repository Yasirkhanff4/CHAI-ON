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
      <div className="rounded-card bg-off-white p-5 shadow-card sm:p-6">
        <h2 id="cart-summary-heading" className="text-[20px] font-semibold leading-tight text-brand-brown">
          Order summary
        </h2>

        <dl className="mt-5 space-y-3 text-[13.5px]">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-brand-brown/60">
              Subtotal
              <span className="ml-1.5 text-brand-brown/45">
                ({totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'})
              </span>
            </dt>
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
        </dl>

        <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-brand-brown/10 pt-4">
          <p className="text-sm font-semibold text-brand-brown">Total</p>
          <p className="text-[24px] font-bold leading-none tabular-nums text-brand-brown">
            {formatPKR(totals.total)}
          </p>
        </div>

        {belowMinimum && (
          <p className="mt-4 rounded-xl bg-cream px-3.5 py-3 text-[12.5px] leading-relaxed text-brand-brown/70">
            Add {formatPKR(shortfall)} more to reach the minimum order of{' '}
            {formatPKR(settings.minimumOrder)}.
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
          className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl px-3 text-[13px] font-medium text-brand-brown/55 transition-colors hover:bg-cream hover:text-brand-brown"
        >
          Add more items
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>

        <div className="mt-4 border-t border-brand-brown/10 pt-4">
          <WhatsAppActionBar
            href={buildWhatsAppOrderUrl(items, totals)}
            label="Order on WhatsApp"
          />
          <p className="mt-2 text-center text-[11.5px] leading-relaxed text-brand-brown/45">
            Send this cart to us on WhatsApp · {business.whatsappDisplay}
          </p>
        </div>

        <div className="mt-5 space-y-2.5 border-t border-brand-brown/10 pt-4 text-[12px] leading-relaxed text-brand-brown/55">
          <p className="flex items-start gap-2">
            <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-red/80" aria-hidden="true" />
            {totals.deliveryCharge === 0
              ? `Free delivery to ${business.deliveryArea}.`
              : `Delivery to ${business.deliveryArea}.`}
          </p>
          <p className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-red/80" aria-hidden="true" />
            Cash on delivery. No account needed.
          </p>
        </div>
      </div>
    </aside>
  )
}

import { ArrowRight, Coffee, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CartLineItem } from '@/components/cart/CartLineItem'
import { CartSummary } from '@/components/cart/CartSummary'
import { Container } from '@/components/ui/Container'
import { PageIntro } from '@/components/ui/PageIntro'
import { useCart } from '@/context/cartContext'
import { business } from '@/data/site'
import { buttonClasses } from '@/lib/buttonStyles'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export function CartPage() {
  useDocumentTitle('Your cart — CHAI ON')
  const { items, clearCart } = useCart()

  return (
    <>
      <PageIntro
        eyebrow="Your order"
        title="Your cart"
        description={
          items.length > 0
            ? 'Check your teas and customization before heading to checkout. Your cart is saved on this device.'
            : 'Add a cup of Doodh Patti or Karak Chai to get started.'
        }
      />

      <section aria-label="Cart contents" className="py-10 sm:py-14">
        <Container>
          {items.length === 0 ? (
            <div className="mx-auto max-w-lg rounded-[32px] border border-cream-300/80 bg-cream-50 px-6 py-12 text-center shadow-card sm:px-10">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-cream-200 text-tea-600">
                <Coffee className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="mt-5 font-display text-[30px] leading-tight tracking-[-0.01em] text-forest-900">
                Your cart is empty
              </h2>
              <p className="mx-auto mt-3 max-w-xs text-[14px] leading-relaxed text-forest-900/70">
                Pick your tea, sugar and strength — we will brew it fresh and deliver it to your
                office.
              </p>
              <Link to="/menu" className={buttonClasses('primary', 'lg', 'mt-7 w-full sm:w-auto')}>
                Browse the menu
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <p className="mt-6 border-t border-cream-300/70 pt-5 text-[12px] leading-relaxed text-forest-900/70">
                Prefer to order by phone? Call{' '}
                <a
                  href={business.phoneHref}
                  className="inline-flex items-center gap-1 font-semibold text-forest-800 hover:text-forest-600"
                >
                  <Phone className="h-3 w-3" aria-hidden="true" />
                  {business.phoneDisplay}
                </a>
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-10">
              <div className="rounded-[28px] border border-cream-300/80 bg-cream-50 px-5 shadow-card sm:px-7">
                <div className="flex items-center justify-between gap-4 border-b border-cream-300/80 py-4">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-tea-500">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </h2>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="rounded-full px-2.5 py-1.5 text-[12px] font-medium text-forest-900/70 transition hover:bg-cream-200/70 hover:text-forest-900"
                  >
                    Clear cart
                  </button>
                </div>
                <ul className="divide-y divide-cream-300/70">
                  {items.map((item) => (
                    <CartLineItem key={item.id} item={item} />
                  ))}
                </ul>
              </div>

              <CartSummary />
            </div>
          )}
        </Container>
      </section>
    </>
  )
}

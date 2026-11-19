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
            ? 'Check your teas before you check out. Your cart is saved on this device.'
            : 'Add a cup of Doodh Patti or Karak Chai to get started.'
        }
      />

      <section aria-label="Cart contents" className="py-8 sm:py-10">
        <Container>
          {items.length === 0 ? (
            <div className="mx-auto max-w-lg rounded-xl border border-cream-300 bg-cream-50 px-5 py-8 text-center sm:px-8">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-cream-200 text-tea-600">
                <Coffee className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-[24px] leading-tight text-forest-900">Your cart is empty</h2>
              <p className="mx-auto mt-2 max-w-xs text-[14px] leading-relaxed text-forest-900/70">
                Pick your tea, sugar and strength — we will brew it fresh and bring it to your
                office.
              </p>
              <Link to="/menu" className={buttonClasses('primary', 'lg', 'mt-5 w-full sm:w-auto')}>
                Browse the menu
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <p className="mt-5 border-t border-cream-300 pt-4 text-[12.5px] leading-relaxed text-forest-900/70">
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
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-6">
              <div className="rounded-xl border border-cream-300 bg-cream-50 px-4 sm:px-5">
                <div className="flex items-center justify-between gap-4 border-b border-cream-300 py-3">
                  <h2 className="text-[13px] font-semibold text-forest-900/70">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => clearCart()}
                    className="min-h-9 px-2 text-[12.5px] font-medium text-forest-900/70 transition hover:text-forest-900"
                  >
                    Clear cart
                  </button>
                </div>
                <ul className="divide-y divide-cream-300/80">
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

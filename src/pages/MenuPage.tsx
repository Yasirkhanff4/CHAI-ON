import { AlertCircle, Banknote, Clock, Truck } from 'lucide-react'
import { MenuProductCard } from '@/components/menu/MenuProductCard'
import { Container } from '@/components/ui/Container'
import { PageIntro } from '@/components/ui/PageIntro'
import { useCatalog } from '@/context/catalogContext'
import { useStoreSettings } from '@/context/settingsContext'
import { business } from '@/data/site'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

const perks = [
  {
    icon: Clock,
    title: 'Brewed to order',
    description: 'Cups are made after you order, never held under a warmer.',
  },
  {
    icon: Truck,
    title: 'Office delivery',
    description: `Delivered across ${business.deliveryArea}.`,
  },
  {
    icon: Banknote,
    title: 'Cash on delivery',
    description: 'Pay when the chai reaches you. No account needed.',
  },
]

export function MenuPage() {
  useDocumentTitle('Menu — CHAI ON')
  const { products, loading, error } = useCatalog()
  const { settings } = useStoreSettings()

  return (
    <>
      <PageIntro
        eyebrow="The menu"
        title="Two teas. Made exactly your way."
        description="Choose your sugar and strength for every cup. Add as many as your team needs and we will brew them fresh for delivery."
      />

      <section aria-label="Tea menu" className="py-12 sm:py-16">
        <Container>
          {error && (
            <p
              role="status"
              className="mb-5 flex items-start gap-2 rounded-2xl border border-gold-400/50 bg-gold-100 px-4 py-3 text-[12.5px] leading-relaxed text-forest-900/80"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" aria-hidden="true" />
              We could not refresh the live menu, so you are seeing our standard teas. Call us if a
              price looks wrong.
            </p>
          )}

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:gap-8" aria-hidden="true">
              {[0, 1].map((key) => (
                <div
                  key={key}
                  className="h-96 animate-pulse rounded-[28px] border border-cream-300/60 bg-cream-200/50"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
              {products.map((product) => (
                <MenuProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <ul className="mt-10 grid gap-3 sm:grid-cols-3">
            {perks.map((perk) => (
              <li
                key={perk.title}
                className="flex items-start gap-3 rounded-2xl border border-cream-300/70 bg-cream-50/70 px-4 py-4"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest-900 text-cream-50">
                  <perk.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-forest-900">{perk.title}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-forest-900/70">
                    {perk.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-center text-[12px] leading-relaxed text-forest-900/70">
            Prices are in Pakistani Rupees.
            {settings.deliveryCharge === 0
              ? ' Delivery is free within the delivery area.'
              : ` Delivery is Rs ${settings.deliveryCharge}.`}{' '}
            Call{' '}
            <a
              href={business.phoneHref}
              className="font-semibold text-forest-800 hover:text-forest-600"
            >
              {business.phoneDisplay}
            </a>{' '}
            for bulk office orders.
          </p>
        </Container>
      </section>
    </>
  )
}

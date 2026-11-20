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
    description: 'Made after you order, never kept under a warmer.',
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
  useDocumentTitle('Menu | CHAI ON')
  const { products, loading, error } = useCatalog()
  const { settings } = useStoreSettings()

  return (
    <>
      <PageIntro
        eyebrow="Menu"
        title="Doodh patti and karak chai."
        description="Pick your sugar and strength for every cup. Add as many as you need and we will brew them fresh."
      />

      <section aria-label="Tea menu" className="py-8 sm:py-10">
        <Container>
          {error && (
            <p
              role="status"
              className="mb-5 flex items-start gap-2 rounded-[10px] border border-gold-400/50 bg-gold-100 px-3.5 py-3 text-[12.5px] leading-relaxed text-forest-900/80"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" aria-hidden="true" />
              We could not load the live menu, so you are seeing our standard teas. Call us if a
              price looks wrong.
            </p>
          )}

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:gap-5" aria-hidden="true">
              {[0, 1].map((key) => (
                <div
                  key={key}
                  className="h-80 animate-pulse rounded-xl border border-cream-300 bg-cream-200/50"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:gap-5">
              {products.map((product) => (
                <MenuProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <ul className="mt-6 grid gap-3 border-t border-cream-300/80 pt-6 sm:grid-cols-3">
            {perks.map((perk) => (
              <li key={perk.title} className="flex items-start gap-2.5">
                <perk.icon className="mt-0.5 h-4 w-4 shrink-0 text-tea-500" aria-hidden="true" />
                <div>
                  <p className="text-[13px] font-semibold text-forest-900">{perk.title}</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-forest-900/70">
                    {perk.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-[12.5px] leading-relaxed text-forest-900/70">
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

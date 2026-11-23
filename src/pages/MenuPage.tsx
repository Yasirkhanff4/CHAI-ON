import { useState } from 'react'
import { AlertCircle, Banknote, Clock, Truck } from 'lucide-react'
import { MenuProductCard } from '@/components/menu/MenuProductCard'
import { Container } from '@/components/ui/Container'
import { PageIntro } from '@/components/ui/PageIntro'
import { useCatalog } from '@/context/catalogContext'
import { useStoreSettings } from '@/context/settingsContext'
import { categoryForProduct, MENU_CATEGORIES } from '@/data/menu'
import type { MenuCategory } from '@/data/menu'
import { business } from '@/data/site'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

const perks = [
  {
    icon: Clock,
    title: 'Brewed to order',
    description: 'Made after you order.',
  },
  {
    icon: Truck,
    title: 'Office delivery',
    description: `Delivered across ${business.deliveryArea}.`,
  },
  {
    icon: Banknote,
    title: 'Cash on delivery',
    description: 'Pay when the chai reaches you.',
  },
]

export function MenuPage() {
  useDocumentTitle('Menu | CHAYON')
  const { products, loading, error } = useCatalog()
  const { settings } = useStoreSettings()
  const [category, setCategory] = useState<MenuCategory>('Chai')

  const grouped = products.reduce<Record<MenuCategory, typeof products>>(
    (groups, product) => {
      groups[categoryForProduct(product)].push(product)
      return groups
    },
    { Chai: [], Coffee: [], Bites: [], Combos: [] },
  )
  const visible = grouped[category]

  return (
    <>
      <PageIntro
        eyebrow="Menu"
        title="Chai, coffee, nuggets and cake rusk."
        description="Pick a category, choose your item and add it to your cart."
      />

      <section aria-label="Menu" className="py-6 sm:py-10">
        <Container>
          {error && (
            <p
              role="status"
              className="mb-5 flex items-start gap-2 rounded-xl border border-brand-red/30 bg-cream px-3.5 py-3 text-[12.5px] leading-relaxed text-brand-brown/85"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" aria-hidden="true" />
              We could not load the live menu, so you are seeing our standard menu. Call us if a
              price looks wrong.
            </p>
          )}

          <div
            role="tablist"
            aria-label="Menu categories"
            className="sticky top-[100px] z-20 -mx-5 mb-5 flex gap-2 overflow-x-auto border-y border-soft-pink bg-cream/95 px-5 py-2 backdrop-blur sm:-mx-8 sm:px-8 lg:static lg:mx-0 lg:mb-6 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none"
          >
            {MENU_CATEGORIES.map((name) => {
              const active = category === name
              return (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(name)}
                  className={[
                    'inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-[14px] font-semibold transition sm:px-4',
                    active
                      ? 'border-brand-red bg-brand-red text-white'
                      : 'border-soft-pink bg-off-white text-brand-brown hover:border-brand-red/40 hover:bg-cream',
                  ].join(' ')}
                >
                  {name}
                  <span className={active ? 'hidden text-white/70 sm:inline' : 'hidden text-brand-brown/50 sm:inline'}>
                    {grouped[name].length}
                  </span>
                </button>
              )
            })}
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:gap-5" aria-hidden="true">
              {[0, 1, 2, 3].map((key) => (
                <div
                  key={key}
                  className="h-80 animate-pulse rounded-xl border border-soft-pink bg-soft-pink/25"
                />
              ))}
            </div>
          ) : visible.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:gap-5">
              {visible.map((product) => (
                <MenuProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-soft-pink bg-off-white px-5 py-10 text-center text-[14px] text-brand-brown/70">
              Nothing in {category} right now. Check another category.
            </p>
          )}

          <ul className="mt-6 grid gap-3 border-t border-soft-pink pt-6 sm:grid-cols-3">
            {perks.map((perk) => (
              <li key={perk.title} className="flex items-start gap-2.5">
                <perk.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" aria-hidden="true" />
                <div>
                  <p className="text-[13px] font-semibold text-brand-brown">{perk.title}</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-brand-brown/70">
                    {perk.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-[12.5px] leading-relaxed text-brand-brown/70">
            Prices are in Pakistani Rupees.
            {settings.deliveryCharge === 0
              ? ' Delivery is free within the delivery area.'
              : ` Delivery is Rs ${settings.deliveryCharge}.`}{' '}
            Call{' '}
            <a
              href={business.phoneHref}
              className="font-semibold text-brand-red hover:text-brand-maroon"
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

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

      <section aria-label="Menu" className="py-8 sm:py-12">
        <Container>
          {error && (
            <p
              role="status"
              className="mb-6 flex items-start gap-2.5 rounded-card bg-brand-red/[0.05] px-4 py-3.5 text-[12.5px] leading-relaxed text-brand-brown/85"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" aria-hidden="true" />
              We could not load the live menu, so you are seeing our standard menu. Call us if a
              price looks wrong.
            </p>
          )}

          <div
            role="tablist"
            aria-label="Menu categories"
            className="no-scrollbar sticky top-[104px] z-20 -mx-5 mb-6 flex overflow-x-auto border-b border-brand-brown/10 bg-cream/95 px-5 py-2.5 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:static lg:mx-0 lg:mb-8 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none"
          >
            <div className="inline-flex items-center gap-1 rounded-full bg-brand-brown/[0.05] p-1">
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
                      'inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13.5px] transition duration-200 ease-smooth sm:px-4',
                      active
                        ? 'bg-off-white font-semibold text-brand-red shadow-card'
                        : 'font-medium text-brand-brown/55 hover:text-brand-brown',
                    ].join(' ')}
                  >
                    {name}
                    <span
                      className={
                        active
                          ? 'text-[11px] tabular-nums text-brand-red/50'
                          : 'text-[11px] tabular-nums text-brand-brown/35'
                      }
                    >
                      {grouped[name].length}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:gap-6" aria-hidden="true">
              {[0, 1, 2, 3].map((key) => (
                <div
                  key={key}
                  className="h-80 animate-pulse rounded-card bg-soft-pink/20"
                />
              ))}
            </div>
          ) : visible.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
              {visible.map((product) => (
                <MenuProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="rounded-card bg-off-white px-5 py-12 text-center text-[14px] text-brand-brown/60 shadow-card">
              Nothing in {category} right now. Check another category.
            </p>
          )}

          <ul className="mt-10 grid gap-5 border-t border-brand-brown/10 pt-8 sm:grid-cols-3">
            {perks.map((perk) => (
              <li key={perk.title} className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-red/[0.06] text-brand-red">
                  <perk.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-brand-brown">{perk.title}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-brand-brown/55">
                    {perk.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-[12.5px] leading-relaxed text-brand-brown/55">
            Prices are in Pakistani Rupees.
            {settings.deliveryCharge === 0
              ? ' Delivery is free within the delivery area.'
              : ` Delivery is Rs ${settings.deliveryCharge}.`}{' '}
            Call{' '}
            <a
              href={business.phoneHref}
              className="font-semibold text-brand-red transition-colors hover:text-brand-maroon"
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

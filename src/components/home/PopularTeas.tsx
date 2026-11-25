import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TeaCard } from '@/components/home/TeaCard'
import { buttonClasses } from '@/lib/buttonStyles'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useCatalog } from '@/context/catalogContext'

/**
 * When the live catalog has fewer than four items, the leftover grid space
 * becomes a menu link instead of an empty gap.
 */
const promoSpan: Record<number, string> = {
  1: 'sm:col-span-1 lg:col-span-1',
  2: 'sm:col-span-2 lg:col-span-2',
  3: 'sm:col-span-2 lg:col-span-3',
  4: 'sm:col-span-2 lg:col-span-4',
}

export function PopularTeas() {
  const { products } = useCatalog()
  const featured = products.slice(0, 4)
  const remaining = 4 - featured.length

  return (
    <section id="menu-preview" className="py-16 sm:py-24">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <SectionHeading
            eyebrow="From the menu"
            title="Something for every break."
            description="Chai, coffee, nuggets and cake rusk. Pick what your desk needs."
          />
          <Link
            to="/menu"
            className={buttonClasses('secondary', 'md', 'hidden sm:inline-flex')}
          >
            Full menu
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {featured.map((product) => (
            <TeaCard key={product.id} product={product} />
          ))}

          {remaining > 0 && (
            <Link
              to="/menu"
              className={[
                'group relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-card bg-off-white p-6 shadow-card transition duration-300 ease-smooth hover:-translate-y-1 hover:shadow-lift',
                promoSpan[remaining] ?? '',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <span className="eyebrow text-brand-red">The full menu</span>
                  <p className="poster-title mt-3 text-[32px] leading-[0.92] text-brand-brown">
                    Everything
                    <br />
                    we brew.
                  </p>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-red text-white transition duration-300 ease-smooth group-hover:bg-brand-maroon">
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>

              <div>
                <p className="max-w-[30ch] text-[13px] leading-relaxed text-brand-brown/60">
                  Chai, coffee, nuggets and cake rusk — all on one menu.
                </p>
                <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brand-brown/35">
                  <span>Chai</span>
                  <span aria-hidden="true" className="h-1 w-1 rounded-full bg-brand-red/40" />
                  <span>Coffee</span>
                  <span aria-hidden="true" className="h-1 w-1 rounded-full bg-brand-red/40" />
                  <span>Bites</span>
                  <span aria-hidden="true" className="h-1 w-1 rounded-full bg-brand-red/40" />
                  <span>Combos</span>
                </p>
              </div>
            </Link>
          )}
        </div>

        {remaining === 0 && (
          <Link
            to="/menu"
            className={buttonClasses('secondary', 'md', 'mt-5 w-full sm:hidden')}
          >
            Full menu
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </Container>
    </section>
  )
}

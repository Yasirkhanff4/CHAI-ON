import { ArrowRight, Check, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonClasses } from '@/lib/buttonStyles'
import { Container } from '@/components/ui/Container'
import { useCatalog } from '@/context/catalogContext'
import { formatPKR } from '@/lib/format'

export function Hero() {
  const { products } = useCatalog()
  const houseFavourite = products.find((product) => product.id === 'karak-chai') ?? products[0]

  return (
    <section className="border-b border-cream-300/70">
      <Container className="grid items-center gap-8 py-8 sm:py-12 lg:grid-cols-12 lg:gap-12 lg:py-14">
        <div className="lg:col-span-6">
          <p className="inline-flex items-center gap-1.5 text-[13px] font-medium text-forest-900/70">
            <MapPin className="h-4 w-4 text-tea-500" aria-hidden="true" />
            G-11 Markaz, Islamabad
          </p>

          <h1 className="animate-rise mt-3 text-[34px] leading-[1.08] text-forest-900 sm:text-[44px] lg:text-[50px]">
            Your office. Your chai.
          </h1>

          <p className="animate-rise mt-3 max-w-md text-[15px] leading-relaxed text-forest-900/70 sm:text-base">
            Doodh patti and karak chai, brewed when you order and delivered to your desk.
          </p>

          <div className="animate-rise mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <Link to="/menu" className={buttonClasses('primary', 'lg', 'w-full sm:w-auto')}>
              Order now
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/menu" className={buttonClasses('secondary', 'lg', 'w-full sm:w-auto')}>
              See the menu
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-forest-900/70">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-forest-600" aria-hidden="true" />
              Cash on delivery
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-forest-600" aria-hidden="true" />
              Freshly brewed
            </span>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="relative overflow-hidden rounded-xl border border-cream-300 bg-cream-200">
            <img
              src="/images/hero-chai.jpg"
              alt="A freshly brewed cup of CHAI ON chai on a ceramic saucer"
              className="h-[280px] w-full object-cover object-center sm:h-[360px] lg:h-[420px]"
              width={1200}
              height={1500}
              fetchPriority="high"
            />
            {houseFavourite && (
              <p className="absolute bottom-3 left-3 rounded-lg bg-cream-50/95 px-3 py-1.5 text-[13px] font-semibold text-forest-900">
                {houseFavourite.name} · {formatPKR(houseFavourite.price)}
              </p>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}

import { ArrowRight, Check, Coffee, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonClasses } from '@/lib/buttonStyles'
import { Container } from '@/components/ui/Container'
import { useCatalog } from '@/context/catalogContext'
import { formatPKR } from '@/lib/format'

export function Hero() {
  const { products } = useCatalog()
  const houseFavourite = products.find((product) => product.id === 'karak-chai') ?? products[0]

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 -top-40 h-[560px] w-[560px] rounded-full bg-gold-200/35 blur-3xl" />
        <div className="absolute -bottom-48 -left-32 h-[480px] w-[480px] rounded-full bg-forest-100/70 blur-3xl" />
      </div>

      <Container className="relative grid items-center gap-14 py-12 sm:py-16 lg:grid-cols-12 lg:gap-10 lg:py-24">
        <div className="lg:col-span-6">
          <p className="inline-flex animate-rise items-center gap-2 rounded-full border border-forest-900/10 bg-cream-50/70 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-900/70 sm:text-[11px]">
            <MapPin className="h-3.5 w-3.5 text-tea-500" aria-hidden="true" />
            G-11 Markaz · Islamabad
          </p>

          <h1
            className="animate-rise mt-6 font-display text-[50px] leading-[0.98] tracking-[-0.025em] text-forest-900 sm:text-6xl lg:text-[66px] xl:text-[74px]"
            style={{ animationDelay: '80ms' }}
          >
            Your Office.
            <span className="mt-1 block italic text-forest-700">Your Chai.</span>
          </h1>

          <p
            className="animate-rise mt-6 max-w-lg text-[15px] leading-relaxed text-forest-900/70 sm:text-lg"
            style={{ animationDelay: '160ms' }}
          >
            Fresh doodh patti and karak chai, brewed to your taste and delivered hot
            to your desk — from the 3rd floor of Al Ghaffar Mall.
          </p>

          <div
            className="animate-rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: '240ms' }}
          >
            <Link to="/menu" className={buttonClasses('primary', 'lg', 'w-full sm:w-auto')}>
              Order now
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/menu"
              className={buttonClasses('secondary', 'lg', 'w-full sm:w-auto')}
            >
              Explore the menu
            </Link>
          </div>

          <div
            className="animate-rise mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] font-medium text-forest-900/70"
            style={{ animationDelay: '320ms' }}
          >
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-forest-600" aria-hidden="true" />
              Cash on delivery
            </span>
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-forest-600" aria-hidden="true" />
              Brewed after you order
            </span>
          </div>
        </div>

        <div className="animate-rise lg:col-span-6" style={{ animationDelay: '180ms' }}>
          <div className="relative mx-auto w-full max-w-[430px]">
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-t-[190px] rounded-b-[36px] border border-gold-400/45"
            />
            <div className="relative overflow-hidden rounded-t-[176px] rounded-b-[30px] bg-cream-200 shadow-lift">
              <img
                src="/images/hero-chai.jpg"
                alt="A freshly brewed cup of CHAI ON chai with cinnamon on a ceramic saucer"
                className="h-[430px] w-full object-cover object-center sm:h-[500px] lg:h-[550px]"
                width={1200}
                height={1500}
                fetchPriority="high"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-forest-950/20 via-transparent to-transparent"
              />
            </div>

            <div className="absolute -bottom-5 left-3 right-3 flex items-center gap-3.5 rounded-2xl border border-cream-300/80 bg-cream-50/95 p-4 shadow-card backdrop-blur sm:-left-7 sm:right-auto sm:w-[262px]">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-forest-800 text-cream-50">
                <Coffee className="h-7 w-7" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-tea-500">
                  House favourite
                </p>
                <p className="mt-0.5 truncate font-display text-[17px] leading-tight text-forest-900">
                  {houseFavourite?.name} · {houseFavourite ? formatPKR(houseFavourite.price) : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

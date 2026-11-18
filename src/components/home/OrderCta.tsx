import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonClasses } from '@/lib/buttonStyles'
import { Container } from '@/components/ui/Container'

export function OrderCta() {
  return (
    <section className="pb-20 sm:pb-24">
      <Container>
        <div className="relative overflow-hidden rounded-[32px] bg-forest-900 px-6 py-14 text-cream-50 sm:px-12 sm:py-16 lg:px-16">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -right-16 -top-24 h-80 w-80 rounded-full border border-cream-50/10" />
            <div className="absolute -right-2 top-10 h-44 w-44 rounded-full border border-gold-400/25" />
            <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-gold-400/10 blur-3xl" />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-center">
            <div>
              <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-300">
                <span className="h-px w-6 bg-current opacity-60" aria-hidden="true" />
                Cash on delivery
              </p>
              <h2 className="mt-4 max-w-xl font-display text-[34px] leading-[1.05] tracking-[-0.015em] sm:text-[44px]">
                Your next chai is one order away.
              </h2>
              <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-cream-100/65">
                Brewed fresh, delivered to your floor, and paid for when it reaches you.
                No account needed.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link to="/menu" className={buttonClasses('gold', 'lg', 'w-full sm:w-auto')}>
                Order now
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/track"
                className={buttonClasses('inverse', 'lg', 'w-full sm:w-auto')}
              >
                Track order
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

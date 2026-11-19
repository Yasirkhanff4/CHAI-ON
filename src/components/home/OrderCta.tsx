import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonClasses } from '@/lib/buttonStyles'
import { Container } from '@/components/ui/Container'

export function OrderCta() {
  return (
    <section className="pb-12 sm:pb-16">
      <Container>
        <div className="rounded-xl bg-forest-900 px-5 py-8 text-cream-50 sm:px-8 sm:py-10">
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-center">
            <div>
              <h2 className="max-w-lg text-[24px] leading-tight sm:text-[30px]">
                Ready for a cup?
              </h2>
              <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-cream-100/70">
                Order online, pay cash when it reaches you. No account needed.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row lg:justify-end">
              <Link to="/menu" className={buttonClasses('gold', 'lg', 'w-full sm:w-auto')}>
                Order now
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/track" className={buttonClasses('inverse', 'lg', 'w-full sm:w-auto')}>
                Track order
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

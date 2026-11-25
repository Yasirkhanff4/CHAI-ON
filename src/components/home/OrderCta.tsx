import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonClasses } from '@/lib/buttonStyles'
import { Container } from '@/components/ui/Container'

export function OrderCta() {
  return (
    <section className="pb-16 sm:pb-24">
      <Container>
        <div className="relative overflow-hidden rounded-panel bg-brand-brown px-6 py-10 text-off-white shadow-panel sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(42rem_18rem_at_100%_0%,rgb(176_0_0_/_0.22),transparent_65%)]"
          />
          <div className="relative max-w-lg">
            <p className="eyebrow text-soft-pink">Ready when you are</p>
            <h2 className="poster-title mt-3 text-[30px] text-off-white sm:text-[38px]">
              Ready for a break?
            </h2>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-cream/70">
              Order online, pay cash when it reaches you. No account needed.
            </p>
          </div>

          <div className="relative mt-7 flex flex-col gap-2.5 sm:flex-row lg:mt-0 lg:shrink-0">
            <Link to="/menu" className={buttonClasses('light', 'lg', 'w-full sm:w-auto')}>
              Order now
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/track" className={buttonClasses('inverse', 'lg', 'w-full sm:w-auto')}>
              Track order
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}

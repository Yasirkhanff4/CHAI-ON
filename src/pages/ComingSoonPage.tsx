import type { ComponentType } from 'react'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonClasses } from '@/lib/buttonStyles'
import { Container } from '@/components/ui/Container'
import { business } from '@/data/site'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

type IconComponent = ComponentType<{ className?: string }>

type ComingSoonPageProps = {
  title: string
  description: string
  phase: string
  icon?: IconComponent
  documentTitle: string
}

/**
 * Honest placeholder for screens that are built in later phases.
 * It never pretends a feature works. It points people back to the live site
 * or to the phone number.
 */
export function ComingSoonPage({
  title,
  description,
  phase,
  icon: Icon = Sparkles,
  documentTitle,
}: ComingSoonPageProps) {
  useDocumentTitle(documentTitle)

  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-soft-pink/25"
      />
      <Container className="relative">
        <div className="mx-auto max-w-xl rounded-xl border border-soft-pink/80 bg-off-white px-6 py-12 text-center sm:px-10 sm:py-14">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-brown text-off-white">
            <Icon className="h-6 w-6" />
          </span>
          <p className="mt-6 text-[12.5px] font-medium text-brand-brown">
            Coming soon
          </p>
          <h1 className="mt-3 font-bold text-[34px] leading-[1.08] tracking-[-0.015em] text-brand-brown sm:text-[40px]">
            {title}
          </h1>
          <p className="mt-4 text-[14.5px] leading-relaxed text-brand-brown/70">{description}</p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/" className={buttonClasses('primary', 'md')}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to home
            </Link>
            <Link to="/contact" className={buttonClasses('secondary', 'md')}>
              Contact us
            </Link>
          </div>

          <p className="mt-8 border-t border-soft-pink/70 pt-5 text-xs leading-relaxed text-brand-brown/55">
            In the meantime, call{' '}
            <a href={business.phoneHref} className="font-semibold text-brand-red hover:text-brand-maroon">
              {business.phoneDisplay}
            </a>{' '}
            to place an order.
            <br />
            This screen is scheduled for {phase} of the build.
          </p>
        </div>
      </Container>
    </section>
  )
}

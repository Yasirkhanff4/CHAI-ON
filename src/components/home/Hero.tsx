import { ArrowRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Container } from '@/components/ui/Container'
import { WhatsAppActionBar } from '@/components/whatsapp/WhatsAppActionBar'
import { useCart } from '@/context/cartContext'
import { business } from '@/data/site'
import { buttonClasses } from '@/lib/buttonStyles'
import { buildWhatsAppOrderUrl } from '@/lib/whatsapp'

export function Hero() {
  const { items, totals } = useCart()

  return (
    <section className="border-b border-soft-pink bg-cream">
      <Container className="pt-6 sm:pt-8">
        <div className="mx-auto max-w-2xl rounded-b-[36px] border border-soft-pink bg-off-white px-5 pb-6 pt-4 shadow-card sm:rounded-b-[48px] sm:px-8 sm:pb-7">
          <div className="flex flex-col items-center gap-3 text-center">
            <Logo />
            <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-brand-red">
              Chai, coffee, nuggets, cake rusk
            </p>
            <p className="text-[13px] text-brand-brown/70">{business.tagline}</p>
          </div>
        </div>
      </Container>

      <div className="relative mt-5 sm:mt-6">
        <img
          src="/brand/hero-banner.webp"
          alt="A cup of chai and cake rusk on a desk next to a laptop"
          width={1277}
          height={473}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-center sm:[mask-image:linear-gradient(to_right,#000_0%,#000_64%,transparent_70%,#000_84%,#000_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(244,242,239,0.98)_0%,rgba(244,242,239,0.95)_52%,rgba(244,242,239,0.35)_74%,rgba(244,242,239,0)_100%)]"
        />

        <Container className="relative flex min-h-[520px] items-center py-10 sm:min-h-[470px] lg:min-h-[500px]">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-brown/75">
              <MapPin className="h-4 w-4 text-brand-red" aria-hidden="true" />
              G-11 Markaz, Islamabad
            </p>

            <h1 className="poster-title animate-rise mt-3 text-[40px] text-brand-brown sm:text-[54px] lg:text-[64px]">
              Your chai break just got better
            </h1>

            <p className="animate-rise mt-4 max-w-md text-[15px] leading-relaxed text-brand-brown/80 sm:text-base">
              Chai, coffee, nuggets and cake rusk. Fresh to your office desk.
            </p>

            <div className="animate-rise mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Link to="/menu" className={buttonClasses('primary', 'lg', 'w-full sm:w-auto')}>
                View menu
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href={buildWhatsAppOrderUrl(items, totals)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses('secondary', 'lg', 'w-full sm:w-auto')}
              >
                Order on WhatsApp
              </a>
            </div>

            <WhatsAppActionBar
              href={buildWhatsAppOrderUrl(items, totals)}
              className="mt-3 max-w-md"
            />
          </div>
        </Container>
      </div>
    </section>
  )
}

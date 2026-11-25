import { ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import WhatsAppIcon from '@/components/whatsapp/WhatsAppIcon'
import { SHOW_FIRST_CUP_OFFER } from '@/data/site'
import { buttonClasses } from '@/lib/buttonStyles'
import { buildFirstCupOfferUrl } from '@/lib/whatsapp'

/** The only place the first cup offer is shown. */
export function OfferBanner() {
  if (!SHOW_FIRST_CUP_OFFER) return null

  return (
    <section className="py-14 sm:py-20">
      <Container>
        <div className="overflow-hidden rounded-panel bg-brand-maroon text-off-white shadow-panel sm:grid sm:grid-cols-[1.05fr_0.95fr]">
          <div className="relative z-10 flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12 lg:px-12">
            <p className="eyebrow text-soft-pink">First cup offer</p>
            <h2 className="poster-title mt-3 max-w-md text-[34px] text-off-white sm:text-[44px]">
              First cup free. Claim on WhatsApp.
            </h2>
            <p className="mt-4 max-w-sm text-[14.5px] leading-relaxed text-off-white/70">
              New around here? Send us a message and your first cup is on the house.
            </p>
            <a
              href={buildFirstCupOfferUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses('light', 'lg', 'mt-6 w-full sm:w-auto')}
            >
              <WhatsAppIcon className="h-[18px] w-[18px] text-[#1DA851]" />
              Claim on WhatsApp
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="relative m-2 min-h-[240px] overflow-hidden rounded-[1.35rem] bg-brand-brown/20 sm:m-3 sm:min-h-[320px]">
            <img
              src="/brand/now-serving.webp"
              alt="Chai, chicken nuggets and cake rusk on a serving tray"
              width={840}
              height={840}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-brand-maroon/45 via-transparent to-transparent"
            />
          </div>
        </div>
      </Container>
    </section>
  )
}

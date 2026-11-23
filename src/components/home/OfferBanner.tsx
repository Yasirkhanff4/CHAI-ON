import { Container } from '@/components/ui/Container'
import { WhatsAppActionBar } from '@/components/whatsapp/WhatsAppActionBar'
import { SHOW_FIRST_CUP_OFFER } from '@/data/site'
import { buildFirstCupOfferUrl } from '@/lib/whatsapp'

/** The only place the first cup offer is shown. */
export function OfferBanner() {
  if (!SHOW_FIRST_CUP_OFFER) return null

  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div className="overflow-hidden rounded-xl border border-brand-red/25 bg-off-white shadow-card sm:grid sm:grid-cols-2">
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-brand-red">
              First cup offer
            </p>
            <h2 className="poster-title mt-2 text-[32px] text-brand-brown sm:text-[40px]">
              First cup free. Claim on WhatsApp.
            </h2>
            <WhatsAppActionBar href={buildFirstCupOfferUrl()} className="mt-5 max-w-sm" />
          </div>

          <img
            src="/brand/now-serving.webp"
            alt="Chai, chicken nuggets and cake rusk on a serving tray"
            width={840}
            height={840}
            loading="lazy"
            className="h-56 w-full object-cover object-center sm:h-full sm:min-h-[280px]"
          />
        </div>
      </Container>
    </section>
  )
}

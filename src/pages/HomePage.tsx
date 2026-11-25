import { CustomizeTea } from '@/components/home/CustomizeTea'
import { Hero } from '@/components/home/Hero'
import { OfferBanner } from '@/components/home/OfferBanner'
import { OfficeDelivery } from '@/components/home/OfficeDelivery'
import { OrderCta } from '@/components/home/OrderCta'
import { PopularTeas } from '@/components/home/PopularTeas'
import { TrustStrip } from '@/components/home/TrustStrip'
import { VisitUs } from '@/components/home/VisitUs'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export function HomePage() {
  useDocumentTitle('CHAYON | Fresh to your office desk.')

  return (
    <>
      <Hero />
      <TrustStrip />
      <OfferBanner />
      <PopularTeas />
      <OfficeDelivery />
      <CustomizeTea />
      <VisitUs />
      <OrderCta />
    </>
  )
}

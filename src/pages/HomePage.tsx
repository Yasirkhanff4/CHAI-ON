import { CustomizeTea } from '@/components/home/CustomizeTea'
import { Hero } from '@/components/home/Hero'
import { OfficeDelivery } from '@/components/home/OfficeDelivery'
import { OrderCta } from '@/components/home/OrderCta'
import { PopularTeas } from '@/components/home/PopularTeas'
import { TrustStrip } from '@/components/home/TrustStrip'
import { VisitUs } from '@/components/home/VisitUs'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export function HomePage() {
  useDocumentTitle('CHAI ON — Your Office. Your Chai.')

  return (
    <>
      <Hero />
      <TrustStrip />
      <PopularTeas />
      <OfficeDelivery />
      <CustomizeTea />
      <VisitUs />
      <OrderCta />
    </>
  )
}

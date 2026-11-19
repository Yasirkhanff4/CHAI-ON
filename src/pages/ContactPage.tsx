import { ArrowRight, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ContactCards } from '@/components/contact/ContactCards'
import WhatsAppIcon from '@/components/whatsapp/WhatsAppIcon'
import { buttonClasses } from '@/lib/buttonStyles'
import { Container } from '@/components/ui/Container'
import { PageIntro } from '@/components/ui/PageIntro'
import { business } from '@/data/site'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

const teamPoints = [
  'Add as many cups as you need in one order.',
  'One delivery, one address, one cash payment.',
  'Tell us the floor and office number — we bring it up.',
]

export function ContactPage() {
  useDocumentTitle('Contact — CHAI ON')

  return (
    <>
      <PageIntro
        eyebrow="Contact"
        title="We are one floor away."
        description="Questions about an order, a delivery, or a tray for the whole office? Give us a call."
      />

      <section className="py-8 sm:py-10">
        <Container>
          <ContactCards />
        </Container>
      </section>

      <section className="border-t border-cream-300/70 bg-cream-50 py-10 sm:py-14">
        <Container className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <p className="text-[13px] font-medium text-tea-600">Ordering for a team</p>
            <h2 className="mt-2 text-[24px] leading-tight text-forest-900 sm:text-[30px]">
              One order, everyone&apos;s chai.
            </h2>
            <ul className="mt-4 space-y-2.5">
              {teamPoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-[14.5px] text-forest-900/75">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <a href={business.phoneHref} className={buttonClasses('primary', 'md')}>
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call {business.phoneDisplay}
              </a>
              <Link to="/menu" className={buttonClasses('secondary', 'md')}>
                See the menu
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <a
              href={business.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-11 items-center gap-2 text-[13px] font-semibold text-forest-800 underline-offset-4 hover:text-forest-600 hover:underline"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Or message us on WhatsApp · {business.whatsappDisplay}
            </a>
          </div>

          <div className="rounded-xl border border-cream-300 bg-cream-100 p-5 sm:p-6">
            <h3 className="text-[13px] font-semibold text-forest-900/60">Delivery area</h3>
            <p className="mt-2 text-[17px] leading-snug text-forest-900">
              {business.deliveryArea}.
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-forest-900/70">
              We are inside Al Ghaffar Mall, so orders reach nearby offices and shops quickly and
              still hot.
            </p>
            <div className="mt-4 space-y-2 border-t border-cream-300 pt-4 text-[13.5px] text-forest-900/70">
              <p>
                <span className="font-semibold text-forest-900">Address: </span>
                {business.addressLine1}, {business.addressLine2}
              </p>
              <p>
                <span className="font-semibold text-forest-900">Hours: </span>
                {business.hours}, open daily
              </p>
              <p>
                <span className="font-semibold text-forest-900">Payment: </span>
                Cash on delivery
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

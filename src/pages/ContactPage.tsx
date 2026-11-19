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
  'Add as many cups as you need in a single order.',
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
        description="Questions about an order, a delivery, or a tray for the whole office? Call us — someone is always near the kettle."
      />

      <section className="py-14 sm:py-16">
        <Container>
          <ContactCards />
        </Container>
      </section>

      <section className="border-t border-cream-300/60 bg-cream-50 py-16 sm:py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-tea-500">
              <span className="h-px w-6 bg-current opacity-60" aria-hidden="true" />
              Ordering for a team
            </p>
            <h2 className="mt-4 font-display text-[32px] leading-[1.08] tracking-[-0.015em] text-forest-900 sm:text-[40px]">
              One order. Everyone&apos;s chai.
            </h2>
            <ul className="mt-6 space-y-3">
              {teamPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-[14.5px] text-forest-900/75">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={business.phoneHref} className={buttonClasses('primary', 'md')}>
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call {business.phoneDisplay}
              </a>
              <Link to="/menu" className={buttonClasses('secondary', 'md')}>
                Browse the menu
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <a
              href={business.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-10 items-center gap-2 py-2 text-[13px] font-semibold text-forest-800 underline-offset-4 hover:text-forest-600 hover:underline"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Or message us on WhatsApp · {business.whatsappDisplay}
            </a>
          </div>

          <div className="rounded-[28px] border border-cream-300/80 bg-cream-100 p-7 sm:p-9">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-tea-500">
              Delivery area
            </h3>
            <p className="mt-3 font-display text-2xl leading-snug text-forest-900">
              {business.deliveryArea}.
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-forest-900/70">
              We are based inside Al Ghaffar Mall, so orders reach nearby offices and
              shops quickly and still hot.
            </p>
            <div className="mt-6 space-y-3 border-t border-cream-300 pt-6 text-[13.5px] text-forest-900/70">
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

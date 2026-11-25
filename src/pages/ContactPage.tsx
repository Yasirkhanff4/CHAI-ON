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
  'Add everything you need in one order.',
  'One delivery, one address, one cash payment.',
  'Tell us the floor and office number. We bring it up.',
]

export function ContactPage() {
  useDocumentTitle('Contact | CHAYON')

  return (
    <>
      <PageIntro
        eyebrow="Contact"
        title="We are one floor away."
        description="Questions about an order or a tray for the whole office? Give us a call."
      />

      <section className="py-8 sm:py-10">
        <Container>
          <ContactCards />
        </Container>
      </section>

      <section className="border-t border-brand-brown/10 bg-off-white/55 py-14 sm:py-20">
        <Container className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow text-brand-red">Ordering for a team</p>
            <h2 className="poster-title mt-3 text-[28px] text-brand-brown sm:text-[34px]">
              One order, everyone&apos;s chai.
            </h2>
            <ul className="mt-5 space-y-3">
              {teamPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-[14px] leading-relaxed text-brand-brown/65">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
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
              className="mt-4 inline-flex min-h-11 items-center gap-2 text-[13px] font-semibold text-brand-red underline-offset-4 transition-colors hover:text-brand-maroon hover:underline"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Or message us on WhatsApp · {business.whatsappDisplay}
            </a>
          </div>

          <div className="rounded-card bg-cream/70 p-6 sm:p-8">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-brown/45">
              Delivery area
            </h3>
            <p className="mt-3 text-[18px] leading-snug text-brand-brown">
              {business.deliveryArea}.
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-brand-brown/60">
              We are inside Al Ghaffar Mall, so orders reach nearby offices and shops quickly and
              still hot.
            </p>
            <div className="mt-5 space-y-2.5 border-t border-brand-brown/10 pt-5 text-[13px] leading-relaxed text-brand-brown/60">
              <p>
                <span className="font-semibold text-brand-brown">Address: </span>
                {business.addressLine1}, {business.addressLine2}
              </p>
              <p>
                <span className="font-semibold text-brand-brown">Hours: </span>
                {business.hours}, open daily
              </p>
              <p>
                <span className="font-semibold text-brand-brown">Payment: </span>
                Cash on delivery
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

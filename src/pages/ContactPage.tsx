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
        title="Call the counter."
        description="Order updates, a tray for the team, or directions to the shop. Call or message us."
      />

      <section className="py-8 sm:py-10">
        <Container>
          <ContactCards />
        </Container>
      </section>

      <section className="border-t border-soft-pink/70 bg-off-white py-10 sm:py-14">
        <Container className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <p className="text-[13px] font-medium text-brand-red">Ordering for a team</p>
            <h2 className="mt-2 text-[24px] leading-tight text-brand-brown sm:text-[30px]">
              One order, everyone&apos;s chai.
            </h2>
            <ul className="mt-4 space-y-2.5">
              {teamPoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-[14.5px] text-brand-brown/75">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" aria-hidden="true" />
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
              className="mt-3 inline-flex min-h-11 items-center gap-2 text-[13px] font-semibold text-brand-red underline-offset-4 hover:text-brand-maroon hover:underline"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Or message us on WhatsApp · {business.whatsappDisplay}
            </a>
          </div>

          <div className="rounded-xl border border-soft-pink bg-cream p-5 sm:p-6">
            <h3 className="text-[13px] font-semibold text-brand-brown/60">Delivery area</h3>
            <p className="mt-2 text-[17px] leading-snug text-brand-brown">
              {business.deliveryArea}.
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-brand-brown/70">
              We are inside Al Ghaffar Mall, so the chai is still hot when it reaches you.
            </p>
            <div className="mt-4 space-y-2 border-t border-soft-pink pt-4 text-[13.5px] text-brand-brown/70">
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

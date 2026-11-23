import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonClasses } from '@/lib/buttonStyles'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'

const steps = [
  {
    number: '1',
    title: 'Pick your chai',
    text: 'Choose from the menu, then set sugar and strength on chai or coffee.',
  },
  {
    number: '2',
    title: 'We brew it fresh',
    text: 'Your order goes to the kettle only after it is confirmed.',
  },
  {
    number: '3',
    title: 'We bring it up',
    text: 'Tell us the plaza, floor and office number. We hand it over at your desk.',
  },
]

export function OfficeDelivery() {
  return (
    <section className="border-y border-soft-pink/70 bg-off-white py-12 sm:py-16">
      <Container className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <SectionHeading
            eyebrow="Delivery"
            title="From our kettle to your floor."
            description="We are on the 3rd floor of Al Ghaffar Mall, so your chai does not sit in traffic."
          />

          <ol className="mt-6 space-y-4">
            {steps.map((step) => (
              <li key={step.number} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-soft-pink text-[12px] font-semibold text-brand-brown">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold text-brand-brown">{step.title}</h3>
                  <p className="mt-0.5 max-w-md text-[13.5px] leading-relaxed text-brand-brown/70">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-5 text-[13px] text-brand-brown/65">
            G-11 Markaz · Al Ghaffar Mall · nearby offices and shops
          </p>

          <Link to="/menu" className={buttonClasses('primary', 'md', 'mt-5')}>
            Start an order
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <img
          src="/images/office-delivery.jpg"
          alt="Fresh glasses of chai being poured on a tray for an office order"
          loading="lazy"
          width={1200}
          height={1600}
          className="aspect-[4/3] w-full rounded-xl border border-soft-pink object-cover object-center lg:aspect-[5/4]"
        />
      </Container>
    </section>
  )
}

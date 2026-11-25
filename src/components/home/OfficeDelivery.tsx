import { ArrowRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonClasses } from '@/lib/buttonStyles'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'

const steps = [
  {
    number: '1',
    title: 'Pick your chai',
    text: 'Choose Doodh Patti or Karak Chai, then set your sugar and strength.',
  },
  {
    number: '2',
    title: 'We brew it fresh',
    text: 'Your order goes to the kettle only after it is confirmed.',
  },
  {
    number: '3',
    title: 'We bring it up',
    text: 'Tell us the plaza, floor and office number. We deliver to the door.',
  },
]

export function OfficeDelivery() {
  return (
    <section className="py-16 sm:py-24">
      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Delivery"
            title="From our kettle to your floor."
            description="We are on the 3rd floor of Al Ghaffar Mall, so your chai does not sit in traffic."
          />

          <ol className="mt-8 space-y-6">
            {steps.map((step) => (
              <li key={step.number} className="flex gap-4">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-brand-brown/10 bg-off-white text-[11.5px] font-semibold text-brand-red shadow-card">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold text-brand-brown">{step.title}</h3>
                  <p className="mt-1 max-w-md text-[13.5px] leading-relaxed text-brand-brown/60">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <Link to="/menu" className={buttonClasses('primary', 'md', 'mt-8')}>
            Start an order
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-panel shadow-card">
          <img
            src="/images/office-delivery.jpg"
            alt="Fresh glasses of chai being poured on a tray for an office order"
            loading="lazy"
            width={1200}
            height={1600}
            className="aspect-[4/3] w-full object-cover object-center sm:aspect-[4/5]"
          />
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-off-white/90 px-3.5 py-2 text-[11.5px] font-medium text-brand-brown backdrop-blur-sm">
            <MapPin className="h-3.5 w-3.5 text-brand-red" aria-hidden="true" />
            Al Ghaffar Mall · 3rd floor
          </span>
        </div>
      </Container>
    </section>
  )
}

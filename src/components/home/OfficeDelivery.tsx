import { ArrowRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonClasses } from '@/lib/buttonStyles'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'

const steps = [
  {
    number: '01',
    title: 'Pick your chai',
    text: 'Choose Doodh Patti or Karak Chai, then set your sugar and strength.',
  },
  {
    number: '02',
    title: 'We brew it fresh',
    text: 'Your order goes to the kettle only after it is confirmed.',
  },
  {
    number: '03',
    title: 'Delivered to your door',
    text: 'Tell us the plaza, floor and office number. We will bring it up.',
  },
]

export function OfficeDelivery() {
  return (
    <section className="border-y border-cream-300/60 bg-cream-50 py-20 sm:py-24 lg:py-28">
      <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Office delivery"
            title="Brewed downstairs. Delivered upstairs."
            description="We are on the 3rd floor of Al Ghaffar Mall, so your chai does not sit in traffic. It goes from our kettle to your floor while it is still hot."
          />

          <ol className="mt-9 space-y-6">
            {steps.map((step) => (
              <li key={step.number} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold-400/60 bg-gold-100/60 font-display text-[13px] font-semibold text-tea-700">
                  {step.number}
                </span>
                <div className="pt-1">
                  <h3 className="text-[15px] font-semibold text-forest-900">{step.title}</h3>
                  <p className="mt-1 max-w-md text-[13.5px] leading-relaxed text-forest-900/70">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-forest-900/10 bg-cream-100 px-3.5 py-1.5 text-[11px] font-medium text-forest-900/70">
              <MapPin className="h-3.5 w-3.5 text-tea-500" aria-hidden="true" />
              G-11 Markaz
            </span>
            <span className="rounded-full border border-forest-900/10 bg-cream-100 px-3.5 py-1.5 text-[11px] font-medium text-forest-900/70">
              Al Ghaffar Mall
            </span>
            <span className="rounded-full border border-forest-900/10 bg-cream-100 px-3.5 py-1.5 text-[11px] font-medium text-forest-900/70">
              Nearby offices &amp; shops
            </span>
          </div>

          <Link to="/menu" className={buttonClasses('primary', 'md', 'mt-8')}>
            Start an order
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -inset-2 rounded-[34px] border border-gold-400/30"
          />
          <div className="relative overflow-hidden rounded-[28px] shadow-lift">
            <img
              src="/images/office-delivery.jpg"
              alt="Fresh glasses of chai being poured on a tray for an office order"
              loading="lazy"
              width={1200}
              height={1600}
              className="aspect-[4/3] w-full object-cover object-center lg:aspect-[5/4]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-forest-950/45 via-forest-950/5 to-transparent"
            />
            <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-2xl border border-cream-50/20 bg-forest-950/45 px-4 py-3 text-cream-50 backdrop-blur-md sm:inset-x-5 sm:bottom-5">
              <MapPin className="h-5 w-5 shrink-0 text-gold-300" aria-hidden="true" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-cream-100/60">
                  Our kitchen
                </p>
                <p className="text-[13px] font-semibold">3rd Floor, Al Ghaffar Mall</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

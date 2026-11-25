import { Building2, Clock, Coffee } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { business } from '@/data/site'

const items = [
  {
    icon: Coffee,
    title: 'Brewed after you order',
    text: 'Chai and coffee, made fresh to order.',
  },
  {
    icon: Building2,
    title: 'Delivered to your desk',
    text: 'Across G-11 Markaz and nearby offices.',
  },
  {
    icon: Clock,
    title: 'Open every day',
    text: business.hours,
  },
]

export function TrustStrip() {
  return (
    <section className="border-y border-brand-brown/10 bg-off-white/55">
      <Container>
        <ul className="grid divide-y divide-brand-brown/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {items.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="flex items-center gap-3 py-4 sm:justify-center sm:px-6 sm:py-5"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-red/[0.06] text-brand-red">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[13px] font-semibold leading-tight text-brand-brown">{title}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-brand-brown/55">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

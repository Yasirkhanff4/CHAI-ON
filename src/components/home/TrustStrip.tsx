import { Building2, Clock, Coffee } from 'lucide-react'
import { business } from '@/data/site'

const items = [
  {
    icon: Coffee,
    text: 'Chai, coffee, nuggets, cake rusk',
  },
  {
    icon: Building2,
    text: 'Delivered to your office desk',
  },
  {
    icon: Clock,
    text: `Open ${business.hours}`,
  },
]

export function TrustStrip() {
  return (
    <section className="border-b border-soft-pink bg-off-white">
      <div className="mx-auto grid w-full max-w-7xl gap-3 px-5 py-5 sm:grid-cols-3 sm:gap-4 sm:px-8 lg:px-10">
        {items.map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="flex items-center gap-2.5 rounded-xl border border-soft-pink/70 bg-cream px-4 py-3"
          >
            <Icon className="h-4 w-4 shrink-0 text-brand-red" aria-hidden="true" />
            <p className="text-[13px] font-medium text-brand-brown">{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

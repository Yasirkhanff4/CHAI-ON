import { Banknote, Building2, Flame, MapPin } from 'lucide-react'

const items = [
  {
    icon: Flame,
    title: 'Brewed to order',
    text: 'No pre-made batches',
  },
  {
    icon: Building2,
    title: 'Office delivery',
    text: 'To your floor and desk',
  },
  {
    icon: Banknote,
    title: 'Cash on delivery',
    text: 'Pay when it arrives',
  },
  {
    icon: MapPin,
    title: 'Local, always',
    text: 'G-11 Markaz, Islamabad',
  },
]

export function TrustStrip() {
  return (
    <section className="bg-forest-900 text-cream-100">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-4 gap-y-5 px-5 py-6 sm:px-8 lg:grid-cols-4 lg:px-10">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-2.5">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden="true" />
            <div>
              <p className="text-[13px] font-semibold text-cream-50">{title}</p>
              <p className="mt-0.5 text-[12px] text-cream-100/65">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

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
    text: 'To your floor & desk',
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
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-5 gap-y-7 px-5 py-9 sm:gap-8 sm:px-8 lg:grid-cols-4 lg:px-10">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-cream-50/15 bg-cream-50/5 text-gold-300">
              <Icon className="h-7 w-7" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-cream-50 sm:text-[15px]">{title}</p>
              <p className="mt-0.5 text-[11px] text-cream-100/65 sm:text-xs">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

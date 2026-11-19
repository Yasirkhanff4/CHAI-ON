import { ArrowUpRight, Clock, MapPin, Phone } from 'lucide-react'
import { business } from '@/data/site'

const cardClass = 'flex h-full flex-col rounded-xl border border-cream-300 bg-cream-50 p-5'

export function ContactCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
      <div className={cardClass}>
        <MapPin className="h-5 w-5 text-tea-500" aria-hidden="true" />
        <h3 className="mt-3 text-[13px] font-semibold text-forest-900/60">Visit the shop</h3>
        <p className="mt-1 text-[15px] font-medium leading-relaxed text-forest-900">
          {business.addressLine1}
          <br />
          {business.addressLine2}
        </p>
        <a
          href={business.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-3 text-[13px] font-semibold text-forest-800 transition hover:text-forest-600"
        >
          Get directions
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      <div className={cardClass}>
        <Phone className="h-5 w-5 text-tea-500" aria-hidden="true" />
        <h3 className="mt-3 text-[13px] font-semibold text-forest-900/60">Call us</h3>
        <a
          href={business.phoneHref}
          className="mt-1 inline-flex min-h-11 items-center text-[15px] font-medium text-forest-900 transition hover:text-forest-700"
        >
          {business.phoneDisplay}
        </a>
        <p className="mt-auto pt-2 text-[13px] leading-relaxed text-forest-900/70">
          For order updates, delivery questions, or a tray for the whole team.
        </p>
      </div>

      <div className={cardClass}>
        <Clock className="h-5 w-5 text-tea-500" aria-hidden="true" />
        <h3 className="mt-3 text-[13px] font-semibold text-forest-900/60">Opening hours</h3>
        <p className="mt-1 text-[15px] font-medium text-forest-900">{business.hours}</p>
        <p className="mt-auto pt-2 text-[13px] leading-relaxed text-forest-900/70">
          Open every day. Hours can change on public holidays.
        </p>
      </div>
    </div>
  )
}

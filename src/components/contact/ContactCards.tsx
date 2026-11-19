import { ArrowUpRight, Clock, MapPin, Phone } from 'lucide-react'
import { business } from '@/data/site'

const cardClass =
  'group relative flex h-full flex-col rounded-2xl border border-cream-300/70 bg-cream-50 p-6 shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-lift'

const iconClass =
  'grid h-11 w-11 place-items-center rounded-full bg-forest-900 text-cream-50'

export function ContactCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
      <div className={cardClass}>
        <span className={iconClass}>
          <MapPin className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-tea-500">
          Visit the kitchen
        </h3>
        <p className="mt-2 text-[15px] font-medium leading-relaxed text-forest-900">
          {business.addressLine1}
          <br />
          {business.addressLine2}
        </p>
        <a
          href={business.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[13px] font-semibold text-forest-800 transition hover:text-forest-600"
        >
          Get directions
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      <div className={cardClass}>
        <span className={iconClass}>
          <Phone className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-tea-500">
          Call us
        </h3>
        <a
          href={business.phoneHref}
          className="mt-2 text-[15px] font-medium text-forest-900 transition hover:text-forest-700"
        >
          {business.phoneDisplay}
        </a>
        <p className="mt-auto pt-2 text-[13px] leading-relaxed text-forest-900/70">
          For order updates, delivery questions, or a tray for the whole team.
        </p>
      </div>

      <div className={cardClass}>
        <span className={iconClass}>
          <Clock className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-tea-500">
          Opening hours
        </h3>
        <p className="mt-2 text-[15px] font-medium text-forest-900">{business.hours}</p>
        <p className="mt-auto pt-2 text-[13px] leading-relaxed text-forest-900/70">
          Open every day. Order availability may change on public holidays.
        </p>
      </div>
    </div>
  )
}

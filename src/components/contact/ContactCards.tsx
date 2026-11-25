import { ArrowUpRight, Clock, MapPin, Phone } from 'lucide-react'
import { business } from '@/data/site'

const cellClass = 'flex h-full flex-col p-5 sm:p-6'

export function ContactCards() {
  return (
    <div className="overflow-hidden rounded-card bg-off-white shadow-card">
      <div className="grid divide-y divide-brand-brown/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className={cellClass}>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-red/[0.06] text-brand-red">
            <MapPin className="h-4 w-4" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-brown/45">
            Visit the shop
          </h3>
          <p className="mt-2 text-[14.5px] font-medium leading-relaxed text-brand-brown">
            {business.addressLine1}
            <br />
            {business.addressLine2}
          </p>
          <a
            href={business.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="group mt-auto inline-flex min-h-11 items-center gap-1.5 pt-3 text-[13px] font-semibold text-brand-red transition-colors hover:text-brand-maroon"
          >
            Get directions
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-200 ease-smooth group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        </div>

        <div className={cellClass}>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-red/[0.06] text-brand-red">
            <Phone className="h-4 w-4" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-brown/45">
            Call us
          </h3>
          <a
            href={business.phoneHref}
            className="mt-2 inline-flex min-h-11 items-center text-[14.5px] font-medium text-brand-brown transition-colors hover:text-brand-maroon"
          >
            {business.phoneDisplay}
          </a>
          <p className="mt-auto pt-2 text-[12.5px] leading-relaxed text-brand-brown/55">
            For order updates, delivery questions, or a tray for the whole team.
          </p>
        </div>

        <div className={cellClass}>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-red/[0.06] text-brand-red">
            <Clock className="h-4 w-4" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-brown/45">
            Opening hours
          </h3>
          <p className="mt-2 text-[14.5px] font-medium text-brand-brown">{business.hours}</p>
          <p className="mt-auto pt-2 text-[12.5px] leading-relaxed text-brand-brown/55">
            Open every day. Hours can change on public holidays.
          </p>
        </div>
      </div>
    </div>
  )
}

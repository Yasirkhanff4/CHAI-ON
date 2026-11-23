import { Clock, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Container } from '@/components/ui/Container'
import { SectionDivider } from '@/components/ui/SectionDivider'
import { WhatsAppActionBar } from '@/components/whatsapp/WhatsAppActionBar'
import { useCart } from '@/context/cartContext'
import { business, navLinks } from '@/data/site'
import { buildWhatsAppOrderUrl } from '@/lib/whatsapp'

const currentYear = new Date().getFullYear()

export function Footer() {
  const { items, totals } = useCart()

  return (
    <footer className="bg-brand-maroon text-off-white">
      <Container className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr] lg:gap-10 lg:py-12">
        <div>
          <Logo onDark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-off-white/75">
            Chai, coffee, nuggets and cake rusk. Fresh to your office desk.
          </p>
          <WhatsAppActionBar
            href={buildWhatsAppOrderUrl(items, totals)}
            className="mt-5 max-w-sm"
          />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-off-white">Explore</h2>
          <ul className="mt-3 space-y-2.5 text-sm">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-off-white/75 transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-off-white">Visit and call</h2>
          <ul className="mt-3 space-y-3 text-sm text-off-white/75">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-soft-pink" aria-hidden="true" />
              <span>
                {business.addressLine1}
                <br />
                {business.addressLine2}
              </span>
            </li>
            <li>
              <a
                href={business.phoneHref}
                className="flex items-center gap-2.5 transition hover:text-white"
              >
                <Phone className="h-4 w-4 shrink-0 text-soft-pink" aria-hidden="true" />
                {business.phoneDisplay}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-soft-pink" aria-hidden="true" />
              <span>{business.hours}, open daily</span>
            </li>
          </ul>
        </div>
      </Container>

      <Container>
        <SectionDivider className="opacity-40" />
      </Container>

      <div className="border-t border-off-white/15">
        <Container className="flex flex-col gap-2 py-5 text-xs text-off-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-off-white">
            Chai · Coffee · Nuggets · Cake Rusk
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href={business.phoneHref} className="transition hover:text-white">
              {business.phoneDisplay}
            </a>
            <span>
              © {currentYear} {business.name}. All rights reserved.
            </span>
            <Link to="/admin/login" className="transition hover:text-soft-pink">
              Admin login
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  )
}

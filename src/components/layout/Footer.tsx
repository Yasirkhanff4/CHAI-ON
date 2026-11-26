import { Clock, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Container } from '@/components/ui/Container'
import { WhatsAppActionBar } from '@/components/whatsapp/WhatsAppActionBar'
import { business, navLinks } from '@/data/site'
import { buildWhatsAppGreetingUrl } from '@/lib/whatsapp'

const currentYear = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="bg-brand-maroon text-off-white">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_1.2fr] lg:gap-12 lg:py-16">
        <div>
          <Logo onDark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-off-white/65">
            Chai, coffee, nuggets and cake rusk. Fresh to your office desk.
          </p>
          <WhatsAppActionBar
            href={buildWhatsAppGreetingUrl()}
            tone="dark"
            className="mt-6 max-w-sm"
          />
        </div>

        <nav aria-label="Footer">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-soft-pink/80">
            Explore
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-off-white/65 transition-colors duration-200 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-soft-pink/80">
            Visit and call
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-off-white/65">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-soft-pink/80" aria-hidden="true" />
              <span>
                {business.addressLine1}
                <br />
                {business.addressLine2}
              </span>
            </li>
            <li>
              <a
                href={business.phoneHref}
                className="flex items-center gap-2.5 transition-colors duration-200 hover:text-white"
              >
                <Phone className="h-4 w-4 shrink-0 text-soft-pink/80" aria-hidden="true" />
                {business.phoneDisplay}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-soft-pink/80" aria-hidden="true" />
              <span>{business.hours}, open daily</span>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-off-white/10">
        <Container className="flex flex-col gap-2 py-5 text-[11.5px] text-off-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {currentYear} {business.name}. Fresh to your office desk.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>Chai · Coffee · Nuggets · Cake Rusk</span>
            <Link to="/admin/login" className="transition-colors hover:text-soft-pink">
              Admin login
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  )
}

import { Clock, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Container } from '@/components/ui/Container'
import WhatsAppIcon from '@/components/whatsapp/WhatsAppIcon'
import { useCart } from '@/context/cartContext'
import { business, navLinks } from '@/data/site'
import { buildWhatsAppOrderUrl } from '@/lib/whatsapp'

const accountLinks = [
  { label: 'Log in', to: '/login' },
  { label: 'Create an account', to: '/register' },
  { label: 'My orders', to: '/my-orders' },
]

const currentYear = new Date().getFullYear()

export function Footer() {
  const { items, totals } = useCart()

  return (
    <footer className="bg-forest-950 text-cream-200">
      <Container className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-10 lg:py-12">
        <div>
          <Logo onDark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream-200/70">
            Doodh patti and karak chai, brewed when you order and delivered around G-11
            Markaz.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-cream-50">Explore</h2>
          <ul className="mt-3 space-y-2.5 text-sm">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-cream-200/75 transition hover:text-cream-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-cream-50">Your account</h2>
          <ul className="mt-3 space-y-2.5 text-sm">
            {accountLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-cream-200/75 transition hover:text-cream-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-cream-50">Visit and call</h2>
          <ul className="mt-3 space-y-3 text-sm text-cream-200/70">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
              <span>
                {business.addressLine1}
                <br />
                {business.addressLine2}
              </span>
            </li>
            <li>
              <a
                href={business.phoneHref}
                className="flex items-center gap-2.5 transition hover:text-cream-50"
              >
                <Phone className="h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                {business.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={buildWhatsAppOrderUrl(items, totals)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 transition hover:text-cream-50"
              >
                <WhatsAppIcon className="h-4 w-4 shrink-0 text-gold-400" />
                Order on WhatsApp
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
              <span>{business.hours}, open daily</span>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-cream-50/10">
        <Container className="flex flex-col gap-2 py-5 text-xs text-cream-200/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} CHAI ON. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>Photography via Pexels</span>
            <Link to="/admin/login" className="transition hover:text-gold-300">
              Admin login
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  )
}
